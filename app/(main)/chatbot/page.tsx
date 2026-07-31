'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, BookOpen, Bot, Clock, Plus, RefreshCw, Send, Sparkles, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Linkify from '@/components/Linkify'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { tutorModes, type TutorMode } from '@/lib/tutor-modes'

type Message = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  mode?: TutorMode
}

type Conversation = {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
}

const generateId = () => crypto.randomUUID()

const learningModes: Array<{ value: TutorMode; label: string }> = [
  { value: 'explain', label: 'Explain' },
  { value: 'quiz', label: 'Quiz Me' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'practice-exam', label: 'Practice Exam' },
  { value: 'summarize', label: 'Summarize' },
  { value: 'simplify', label: 'Simplify' },
  { value: 'compare', label: 'Compare' },
  { value: 'step-by-step', label: 'Step-by-Step' },
]

const isTutorMode = (value: unknown): value is TutorMode =>
  typeof value === 'string' && tutorModes.includes(value as TutorMode)

const getModeLabel = (mode: TutorMode) => learningModes.find(({ value }) => value === mode)?.label ?? 'Explain'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const createConversation = (): Conversation => ({
  id: generateId(),
  title: 'New Conversation',
  lastMessage: '',
  timestamp: new Date(),
  messages: [],
})

const getConversationMode = (conversation: Conversation): TutorMode =>
  [...conversation.messages].reverse().find(({ isUser }) => isUser)?.mode ?? 'explain'

const restoreConversation = (value: unknown): Conversation | null => {
  if (!isRecord(value) || !Array.isArray(value.messages)) return null

  const timestamp = parseDate(value.updatedAt)
  if (!timestamp || typeof value.id !== 'string' || typeof value.title !== 'string') return null

  const messages = value.messages.flatMap((message): Message[] => {
    if (!isRecord(message)) return []
    const messageTimestamp = parseDate(message.timestamp)
    if (
      !messageTimestamp ||
      typeof message.id !== 'string' ||
      typeof message.content !== 'string' ||
      typeof message.isUser !== 'boolean'
    ) {
      return []
    }

    if (message.mode !== undefined && !isTutorMode(message.mode)) return []

    return [{ id: message.id, content: message.content, isUser: message.isUser, timestamp: messageTimestamp, mode: message.mode }]
  })

  if (messages.length !== value.messages.length) return null

  return {
    id: value.id,
    title: value.title,
    lastMessage: messages.at(-1)?.content ?? '',
    timestamp,
    messages,
  }
}

const TypingIndicator = () => (
  <div className="flex max-w-[200px] items-center space-x-2 rounded-modern-lg border border-border/50 bg-card/50 p-3 backdrop-blur-sm animate-fadeIn sm:p-4">
    <Avatar className="h-6 w-6 bg-primary sm:h-8 sm:w-8">
      <AvatarFallback>
        <Bot className="h-3 w-3 text-primary-foreground sm:h-4 sm:w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="flex space-x-1">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary sm:h-2 sm:w-2" style={{ animationDelay: `${index * 0.1}s` }} />
      ))}
    </div>
    <span className="text-xs text-muted-foreground sm:text-sm">EduHive is thinking...</span>
  </div>
)

const MessageBubble = ({ message }: { message: Message }) => (
  <div className={`mb-3 flex animate-fadeIn sm:mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] rounded-modern-lg px-3 py-2 shadow-soft sm:max-w-[80%] sm:px-4 sm:py-3 ${message.isUser ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border border-border/50 bg-card text-card-foreground'}`}>
      {message.isUser && message.mode && message.mode !== 'explain' && <p className="mb-1 text-xs font-medium text-primary-foreground/70">{getModeLabel(message.mode)}</p>}
      <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm"><Linkify>{message.content}</Linkify></p>
      <p className={`mt-1 text-xs sm:mt-2 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
)

export default function AcademicChatBot() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<TutorMode>('explain')
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      try {
        const response = await fetch('/api/chat-sessions', { cache: 'no-store' })
        const payload: unknown = await response.json()
        if (!response.ok || !Array.isArray(payload)) {
          throw new Error('Unable to load saved conversations.')
        }

        const restored = payload.flatMap((session): Conversation[] => {
          const conversation = restoreConversation(session)
          return conversation ? [conversation] : []
        })

        if (cancelled) return

        if (restored.length > 0) {
          setConversations(restored)
          setCurrentConversation(restored[0])
          setMessages(restored[0].messages)
          setMode(getConversationMode(restored[0]))
        } else {
          const conversation = createConversation()
          setConversations([conversation])
          setCurrentConversation(conversation)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Chat history error:', loadError)
          const conversation = createConversation()
          setConversations([conversation])
          setCurrentConversation(conversation)
          setError('Your saved history could not be loaded. You can still start a new conversation.')
        }
      } finally {
        if (!cancelled) setIsHistoryLoading(false)
      }
    }

    void loadHistory()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const saveConversation = async (conversation: Conversation) => {
    const response = await fetch('/api/chat-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || 'Unable to save chat history.')
    }
  }

  const startNewConversation = () => {
    const conversation = createConversation()
    setCurrentConversation(conversation)
    setMessages([])
    setMode('explain')
    setConversations((current) => [conversation, ...current.filter(({ id }) => id !== conversation.id)])
    setError(null)
    setIsHistoryOpen(false)
  }

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(({ id }) => id === conversationId)
    if (!conversation) return

    setCurrentConversation(conversation)
    setMessages(conversation.messages)
    setMode(getConversationMode(conversation))
    setError(null)
    setIsHistoryOpen(false)
  }

  const deleteConversation = async (conversation: Conversation) => {
    const isCurrentConversation = currentConversation?.id === conversation.id
    setConversations((current) => current.filter(({ id }) => id !== conversation.id))

    if (isCurrentConversation) {
      const replacement = createConversation()
      setCurrentConversation(replacement)
      setMessages([])
      setConversations((current) => [replacement, ...current])
    }

    if (conversation.messages.length === 0) return

    try {
      const response = await fetch(`/api/chat-sessions/${conversation.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to delete chat history.')
    } catch (deleteError) {
      console.error('Chat deletion error:', deleteError)
      setError('The conversation was removed from this view but could not be deleted from saved history.')
    }
  }

  const handleUserInput = async (conversationMessages: Message[], selectedMode: TutorMode) => {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: selectedMode,
        messages: conversationMessages.slice(-11).map((message) => ({
          role: message.isUser ? 'user' : 'assistant',
          content: message.content,
        })),
      }),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || 'Unable to get a tutor response.')
    if (!data?.response || typeof data.response !== 'string') throw new Error('The tutor returned an invalid response.')

    return data.response
  }

  const handleSend = async () => {
    const question = input.trim()
    const originalConversation = currentConversation
    const selectedMode = mode
    if (!question || isLoading || !originalConversation) return

    const userMessage: Message = { id: generateId(), content: question, isUser: true, timestamp: new Date(), mode: selectedMode }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const reply = await handleUserInput(updatedMessages, selectedMode)
      const botMessage: Message = { id: generateId(), content: reply, isUser: false, timestamp: new Date() }
      const finalMessages = [...updatedMessages, botMessage].slice(-100)
      const conversation: Conversation = {
        id: originalConversation.id,
        title: originalConversation.messages.length === 0 ? question.slice(0, 120) : originalConversation.title,
        lastMessage: botMessage.content,
        timestamp: new Date(),
        messages: finalMessages,
      }

      setMessages(finalMessages)
      setCurrentConversation(conversation)
      setConversations((current) => [conversation, ...current.filter(({ id }) => id !== conversation.id)])

      try {
        await saveConversation(conversation)
      } catch (saveError) {
        console.error('Chat save error:', saveError)
        setError('The response is shown, but it could not be saved to your history.')
      }
    } catch (chatError) {
      console.error('Tutor error:', chatError)
      setMessages(originalConversation.messages)
      setInput(question)
      setError(chatError instanceof Error ? chatError.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isBusy = isLoading || isHistoryLoading

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-modern-lg border border-border/50 bg-background shadow-medium animate-fadeIn sm:h-[calc(100vh-8rem)]">
      <div className="sticky top-0 z-10 flex flex-col gap-3 rounded-t-modern-lg border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="rounded-modern bg-primary/10 p-1.5 sm:p-2"><Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" /></div>
            <h1 className="text-lg font-bold text-foreground sm:text-2xl">EduHive AI Tutor</h1>
          </div>
          <div className="flex items-center space-x-1 text-success sm:space-x-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success sm:h-2 sm:w-2" />
            <span className="text-xs font-medium sm:text-sm">Online</span>
          </div>
        </div>
        <Button onClick={() => setIsHistoryOpen(true)} variant="outline" disabled={isBusy} className="flex items-center space-x-2 text-sm hover:bg-accent/50 sm:text-base">
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>History</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background p-3 sm:p-6">
        <div className="mx-auto max-w-4xl">
          {isHistoryLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading your saved conversations...</div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-muted-foreground">
              <div className="mb-4 rounded-modern-lg bg-primary/10 p-3 sm:mb-6 sm:p-4"><Bot size={32} className="text-primary sm:h-12 sm:w-12" /></div>
              <h2 className="mb-2 text-center text-lg font-semibold text-foreground sm:text-2xl">What would you like to learn?</h2>
              <p className="max-w-md text-center text-sm text-muted-foreground sm:text-base">Ask a question and EduHive will explain it step by step, with examples and a short knowledge check.</p>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}

          {error && (
            <Alert className="mb-4 border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 rounded-b-modern-lg border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl p-3 sm:p-4">
          <div className="mb-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Learning mode</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {learningModes.map((learningMode) => (
                <Button
                  key={learningMode.value}
                  type="button"
                  variant={mode === learningMode.value ? 'default' : 'outline'}
                  size="sm"
                  disabled={isBusy}
                  onClick={() => setMode(learningMode.value)}
                  className="h-8 justify-center text-xs"
                >
                  {learningMode.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-end space-x-2 sm:space-x-3">
            <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && !event.shiftKey && handleSend()} placeholder="Ask a question..." maxLength={4000} className="h-9 flex-1 border-border/50 bg-background/50 text-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20 sm:h-11 sm:text-base" disabled={isBusy} />
            <Button onClick={handleSend} disabled={!input.trim() || isBusy} className="h-9 min-w-[36px] flex-shrink-0 px-3 sm:h-11 sm:min-w-[44px] sm:px-4" aria-label={isLoading ? 'Sending message...' : 'Send message'}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send</span>
            <div className="flex items-center space-x-1"><Bot className="h-3 w-3" /><span>Powered by EduHive AI</span></div>
          </div>
        </div>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col border-border/50 bg-card/95 backdrop-blur-sm sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Conversation History</DialogTitle></DialogHeader>
          <div className="mb-4 flex items-center justify-between">
            <Button size="sm" onClick={startNewConversation} variant="gradient"><Plus className="mr-2 h-4 w-4" />New Chat</Button>
            <span className="text-sm text-muted-foreground">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</span>
          </div>
          <Separator className="bg-border/50" />
          <ScrollArea className="flex-1 py-2">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} className={`flex cursor-pointer items-center justify-between rounded-modern border p-3 transition-colors duration-200 hover:bg-accent/50 ${currentConversation?.id === conversation.id ? 'border-primary/20 bg-primary/10' : 'border-border/30 bg-card/50'}`} onClick={() => loadConversation(conversation.id)}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{conversation.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage || 'No messages yet'}</p>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground"><Clock className="mr-1 h-3 w-3" />{conversation.timestamp.toLocaleString()}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={(event) => { event.stopPropagation(); void deleteConversation(conversation) }} aria-label={`Delete ${conversation.title}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
