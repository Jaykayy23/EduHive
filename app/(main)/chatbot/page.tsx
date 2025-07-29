"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  History,
  Trash2,
  MessageSquare,
  BookOpen,
  Calculator,
  Atom,
  Code,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  FileText,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  type ChatMessage,
  type ChatSession,
  type Reference,
  saveChatSession,
  getChatSessions,
  deleteChatSession,
  generateSessionTitle,
  detectSubject,
  extractReferences,
} from "@/lib/chatbot-utils"
import { getRandomTip } from "@/lib/educational-dataset"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/app/(main)/SessionProvider"
import { toast } from "sonner"

const TypingIndicator = () => (
  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl max-w-[280px] animate-fadeIn border border-blue-100">
    <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600">
      <AvatarFallback>
        <Bot className="w-4 h-4 text-white" />
      </AvatarFallback>
    </Avatar>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    </div>
    <span className="text-sm text-blue-700 font-medium">EduHive AI is thinking...</span>
  </div>
)

const ReferenceCard = ({ reference }: { reference: Reference }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-2">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        {reference.type === "video" ? (
          <Play className="w-4 h-4 text-red-600" />
        ) : (
          <FileText className="w-4 h-4 text-blue-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{reference.title}</h4>
        <p className="text-xs text-gray-600 mb-2">{reference.description}</p>
        <a
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View Resource
        </a>
      </div>
    </div>
  </div>
)

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const references = message.references || extractReferences(message.content)
  const cleanContent = message.content
    .replace(/📚[\s\S]*$/, "")
    .replace(/🎥.*$/gm, "")
    .replace(/📄.*$/gm, "")
    .replace(/🔗.*$/gm, "")
    .trim()

  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-6 animate-fadeIn`}>
      <div
        className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? "flex-row-reverse space-x-reverse" : ""}`}
      >
        <Avatar
          className={`w-10 h-10 ${
            message.isUser
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          } shadow-lg`}
        >
          <AvatarFallback>
            {message.isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
          </AvatarFallback>
        </Avatar>
        <div
          className={`px-5 py-4 rounded-2xl shadow-sm ${
            message.isUser
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md"
              : "bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{cleanContent}</p>

          {/* References section */}
          {references.length > 0 && !message.isUser && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                Helpful Resources
              </h4>
              {references.map((ref, index) => (
                <ReferenceCard key={index} reference={ref} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className={`text-xs ${message.isUser ? "text-emerald-100" : "text-gray-500"}`}>
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            {message.subject && (
              <Badge variant="secondary" className="text-xs ml-2">
                {message.subject}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const SuggestedQuestions = ({
  onQuestionClick,
  isLoading,
}: { onQuestionClick: (question: string) => void; isLoading: boolean }) => {
  const suggestions = [
    { question: "Explain quantum mechanics fundamentals", icon: Atom, category: "Physics" },
    { question: "Help me understand machine learning algorithms", icon: Code, category: "Computer Science" },
    { question: "What are effective university study techniques?", icon: BookOpen, category: "Study Tips" },
    { question: "How do I prepare for calculus exams?", icon: Calculator, category: "Mathematics" },
    { question: "Explain organic chemistry reactions", icon: Globe, category: "Chemistry" },
    { question: "What is molecular biology research about?", icon: GraduationCap, category: "Biology" },
  ]

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
        University Study Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(item.question)}
            disabled={isLoading}
            className="group p-4 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 border border-blue-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1"
          >
            <div className="flex items-start space-x-3">
              <item.icon className="w-5 h-5 text-blue-600 mt-0.5 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{item.question}</p>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Alert className="mb-4 border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">
      {message}
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="ml-2 h-6 text-xs text-red-600 border-red-300 hover:bg-red-100 bg-transparent"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    </AlertDescription>
  </Alert>
)

const ChatHistory = ({
  sessions,
  onSessionSelect,
  onSessionDelete,
  currentSessionId,
  isOpen,
  onToggle,
  isLoadingSessions,
}: {
  sessions: ChatSession[]
  onSessionSelect: (session: ChatSession) => void
  onSessionDelete: (sessionId: string) => void
  currentSessionId?: string
  isOpen: boolean
  onToggle: () => void
  isLoadingSessions: boolean
}) => (
  <Card className={`transition-all duration-300 ${isOpen ? "w-80" : "w-12"} h-full border-r`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        {isOpen && (
          <CardTitle className="text-lg flex items-center">
            <History className="w-5 h-5 mr-2" />
            Chat History
          </CardTitle>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="p-2">
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </CardHeader>
    {isOpen && (
      <CardContent className="pt-0">
        <ScrollArea className="h-[500px]">
          {isLoadingSessions ? (
            <div className="flex justify-center items-center h-full py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No chat history yet</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? "bg-blue-100 border-blue-200 border"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{session.messages.length} messages</p>
                      <p className="text-xs text-gray-400">{new Date(session.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSessionDelete(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    )}
  </Card>
)

const StudyTipCard = () => {
  const [tip, setTip] = useState(getRandomTip())

  return (
    <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">💡 University Study Tip</h4>
            <p className="text-sm text-amber-700">{tip}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTip(getRandomTip())}
              className="mt-2 text-amber-600 hover:text-amber-700 p-0 h-auto"
            >
              Get another tip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ChatbotPage() {
  const { user, isLoading: isSessionLoading } = useSession()
  const queryClient = useQueryClient()

  const initialBotMessage: ChatMessage = {
    id: "initial-bot-message",
    content:
      "Hello! I'm EduHive AI, your university study companion. I specialize in helping students with advanced topics across multiple disciplines including Mathematics, Computer Science, Physics, Chemistry, Biology, and Engineering. I can provide detailed explanations, study strategies, and relevant academic resources. What would you like to explore today?",
    isUser: false,
    timestamp: new Date(),
  }

  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null) // Initialize as null
  const [inputMessage, setInputMessage] = useState("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string>("")
  const [historyOpen, setHistoryOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    data: chatSessions,
    isLoading: isLoadingSessions,
    refetch: refetchChatSessions,
  } = useQuery<ChatSession[]>({
    queryKey: ["chatSessions", user?.id], // Depend on user.id
    queryFn: () => getChatSessions(),
    enabled: !!user, // Only fetch if user is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const saveSessionMutation = useMutation({
    mutationFn: saveChatSession,
    onSuccess: () => {
      refetchChatSessions()
    },
    onError: (err) => {
      console.error("Error saving session:", err)
      toast.error("Failed to save chat session.")
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: () => {
      refetchChatSessions()
    },
    onError: (err) => {
      console.error("Error deleting session:", err)
      toast.error("Failed to delete chat session.")
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, isLoadingAI]) // Use optional chaining for currentSession

  useEffect(() => {
    if (!isSessionLoading && user && !currentSession) {
      // Initialize currentSession only once user is loaded and it's not already set
      setCurrentSession({
        id: "new-chat", // Temporary ID for new unsaved chat
        userId: user.id,
        title: "New Chat",
        messages: [initialBotMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }, [isSessionLoading, user, currentSession]) // Removed initialBotMessage from dependencies

  useEffect(() => {
    // If a session is selected from history, update currentSession
    if (chatSessions && currentSession?.id === "new-chat" && chatSessions.length > 0) {
      // Optionally load the most recent session if no specific one is selected
      // setCurrentSession(chatSessions[0]);
    }
  }, [chatSessions, currentSession?.id]) // Use optional chaining

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessageToAPI = async (message: string): Promise<{ response: string; subject?: string }> => {
    try {
      const conversationHistory = [
        ...(currentSession?.messages || []).map((msg) => ({
          // Use optional chaining and default empty array
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: message },
      ]

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        response: data.response || "I apologize, but I received an unexpected response format. Please try again.",
        subject: data.subject,
      }
    } catch (error) {
      console.error("API Error:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  const handleSendMessage = async (messageToSend?: string) => {
    if (!user || !currentSession) {
      toast.error("Please log in to use the chatbot.")
      return // Prevent sending if user or session is not ready
    }

    const messageText = messageToSend || inputMessage
    if (!messageText.trim()) return

    setError(null)
    setRetryMessage("")

    const subject = detectSubject(messageText)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
      subject,
    }

    let updatedSession: ChatSession

    if (currentSession.id === "new-chat") {
      // Create a new session if it's a new chat
      updatedSession = {
        id: crypto.randomUUID(), // Generate a real ID for the new session
        userId: user.id,
        title: generateSessionTitle(messageText),
        messages: [initialBotMessage, userMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else {
      // Update existing session
      updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
        updatedAt: new Date(),
      }
    }

    setCurrentSession(updatedSession)
    setInputMessage("")
    setIsLoadingAI(true)

    try {
      const { response: aiResponseContent, subject: aiSubject } = await sendMessageToAPI(messageText)
      const references = extractReferences(aiResponseContent)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        isUser: false,
        timestamp: new Date(),
        subject: aiSubject,
        references,
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        updatedAt: new Date(),
      }

      setCurrentSession(finalSession)
      saveSessionMutation.mutate(finalSession) // Save to server
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      setRetryMessage(messageText)
      toast.error(errorMessage) // Display error toast
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleRetry = () => {
    if (retryMessage) {
      handleSendMessage(retryMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  const handleNewChat = () => {
    if (!user) {
      toast.error("Please log in to start a new chat.")
      return
    }
    const newSession: ChatSession = {
      id: "new-chat",
      userId: user.id,
      title: "New Chat",
      messages: [initialBotMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCurrentSession(newSession)
    setError(null) // Clear any previous errors
    setRetryMessage("")
  }

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session)
    setError(null) // Clear any previous errors
    setRetryMessage("")
  }

  const handleSessionDelete = async (sessionId: string) => {
    await deleteSessionMutation.mutateAsync(sessionId)
    if (currentSession?.id === sessionId) {
      // Use optional chaining
      handleNewChat()
    }
  }

  // Render loading state for session
  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-600">Loading session...</p>
      </div>
    )
  }

  // Render access denied if user is not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please log in to use the EduHive AI chatbot and access your chat history.</p>
        <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
      </div>
    )
  }

  // Render initializing chat if currentSession is still null after user is loaded
  if (!currentSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-600">Initializing chat...</p>
      </div>
    )
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <ChatHistory
        sessions={chatSessions || []}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={handleSessionDelete}
        currentSessionId={currentSession.id}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
        isLoadingSessions={isLoadingSessions || deleteSessionMutation.isPending}
      />

      <div className="flex-1 space-y-5">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">🎓 EduHive AI</h1>
                <p className="text-blue-100">Your university study companion with academic resources</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Online</span>
                </div>
                <Button
                  onClick={handleNewChat}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Tip */}
        <StudyTipCard />

        {/* Chat Container */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            {/* Chat Messages */}
            <ScrollArea className="h-[600px] p-6 bg-gradient-to-b from-gray-50/50 to-white">
              {currentSession.messages.length === 1 && (
                <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} isLoading={isLoadingAI} />
              )}

              {currentSession.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {error && <ErrorMessage message={error} onRetry={handleRetry} />}

              {isLoadingAI && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <div className="p-6 bg-white">
              <div className="flex space-x-4">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about university topics: calculus, algorithms, quantum physics, organic chemistry..."
                  className="flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 text-base"
                  disabled={isLoadingAI}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoadingAI}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 h-12"
                >
                  {isLoadingAI ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Press Enter to send • Shift + Enter for new line</span>
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>University-focused AI with academic resources</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
