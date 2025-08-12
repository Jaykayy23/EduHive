'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, AlertCircle, Clock, Trash2, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Linkify from '@/components/Linkify';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
};

const generateId = () => crypto.randomUUID();

const TypingIndicator = () => (
  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg max-w-[200px] animate-fadeIn">
    <Avatar className="w-8 h-8 bg-blue-500">
      <AvatarFallback><Bot className="w-4 h-4 text-white" /></AvatarFallback>
    </Avatar>
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
             style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
    <span className="text-sm text-gray-600">Academic AI is thinking...</span>
  </div>
);

const MessageBubble = ({ message }: { message: Message }) => (
  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
    <div className={`px-4 py-3 rounded-lg shadow-sm ${
      message.isUser 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none' 
        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
    }`}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap"><Linkify>{message.content}</Linkify></p>
      <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);

export default function AcademicChatBot() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('academic-chat-conversations');
      return saved ? JSON.parse(saved).map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })) : [];
    }
    return [];
  });
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('academic-chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (conversations.length === 0 && !currentConversation) {
      startNewConversation();
    }
  }, []);

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messages: []
    };
    setCurrentConversation(newConversation);
    setMessages([]);
    setConversations(prev => [newConversation, ...prev]);
    setIsHistoryOpen(false);
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
      setIsHistoryOpen(false);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      startNewConversation();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: generateId(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const botReply = await handleUserInput(input);
      
      const botMessage: Message = {
        id: generateId(),
        content: botReply || "I didn't understand that",
        isUser: false,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      const conversationTitle = input.length > 30 ? `${input.substring(0, 30)}...` : input;
      const updatedConversation = {
        id: currentConversation?.id || generateId(),
        title: conversationTitle,
        lastMessage: botMessage.content,
        timestamp: new Date(),
        messages: finalMessages
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev => [
        updatedConversation,
        ...prev.filter(c => c.id !== updatedConversation.id)
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("⚠️ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = async (inputText: string) => {
    const lower = inputText.toLowerCase();
    const isQuiz = lower.includes("question") || lower.includes("quiz");

    if (isQuiz) {
      const topicMatch = lower.match(/\b(biology|physics|chemistry|math|english)\b/);
      const difficultyMatch = lower.match(/\b(easy|medium|hard)\b/);
      const numberMatch = lower.match(/\d+/);

      const topic = topicMatch ? topicMatch[0] : "General";
      const difficulty = difficultyMatch ? difficultyMatch[0] : "medium";
      const numQuestions = numberMatch ? parseInt(numberMatch[0]) : 3;

      const res = await fetch("https://academic-chat-bot-app.onrender.com/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "student_user",
          topic,
          difficulty,
          num_questions: numQuestions,
          question_type: "multiple_choice"
        })
      });

      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid questions format");
      }

      return data.questions
        .map((q: any, i: number) => {
          if (!q || typeof q !== "object" || !q.question) return `${i + 1}. (Invalid question format)`;
          return q.type === "multiple_choice"
            ? `${i + 1}. ${q.question}\nChoices: ${(q.choices || []).join(", ")}`
            : `${i + 1}. ${q.question} (Open-ended)`;
        })
        .join("\n\n");
    } else {
      const res = await fetch("https://academic-chat-bot-app.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "student_user", question: inputText.slice(0, 500) })
      });

      if (!res.ok) throw new Error("Failed to fetch chatbot response");
      const data = await res.json();
      return data.message || "(No response received)";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 w-[4000px] rounded-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">EduHive AI</h1>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>
        
        <Button onClick={() => setIsHistoryOpen(true)} className="flex items-center space-x-2 ml-20">
          <BookOpen className="w-4 h-4 text-black-700" />
          <span className='text-black-700'>History</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bot size={48} className="mb-4 text-blue-400" />
              <h2 className="text-xl font-semibold">How can I help you today?</h2>
              <p className="text-center max-w-md mt-2">
                Ask academic questions or try: 
                <br />
                <span className="text-blue-600">&quot;Give me 5 biology questions&quot;</span>
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSend}
                  className="ml-2 h-6 text-xs text-red-600 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask a question or request quiz..."
              className="flex-1 bg-gray-50"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Press Enter to send • Shift + Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Bot className="w-3 h-3" />
              <span>Powered by EduHive AI</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation History</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <Button size="sm" onClick={startNewConversation} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <span className="text-sm text-gray-500">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Separator />
          <ScrollArea className="flex-1 py-2">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      currentConversation?.id === conversation.id ? 'bg-blue-50 border border-blue-200' : 'bg-white'
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conversation.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {conversation.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
