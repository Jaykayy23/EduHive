'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, AlertCircle, Clock, Trash2, BookOpen, Plus, Sparkles } from 'lucide-react';
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
  <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-card/50 backdrop-blur-sm rounded-modern-lg max-w-[180px] sm:max-w-[200px] animate-fadeIn border border-border/50">
    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 bg-primary">
      <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" /></AvatarFallback>
    </Avatar>
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" 
             style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
    <span className="text-xs sm:text-sm text-muted-foreground">EduHive is thinking...</span>
  </div>
);

const MessageBubble = ({ message }: { message: Message }) => (
  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 animate-fadeIn`}>
    <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-modern-lg shadow-soft max-w-[85%] sm:max-w-[80%] ${
      message.isUser 
        ? 'bg-primary text-primary-foreground rounded-br-sm' 
        : 'bg-card text-card-foreground rounded-bl-sm border border-border/50'
    }`}>
      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap"><Linkify>{message.content}</Linkify></p>
      <p className={`text-xs mt-1 sm:mt-2 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] bg-background rounded-modern-lg shadow-medium border border-border/50 animate-fadeIn">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 rounded-t-modern-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-modern">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">EduHive Chatbot</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-success">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">Online</span>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsHistoryOpen(true)} 
          variant="outline"
          className="flex items-center space-x-2 hover:bg-accent/50 text-sm sm:text-base"
        >
          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>History</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
              <div className="p-3 sm:p-4 bg-primary/10 rounded-modern-lg mb-4 sm:mb-6">
                <Bot size={32} className="text-primary sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-lg sm:text-2xl font-semibold text-foreground mb-2 text-center">How can I help you today?</h2>
              <p className="text-center max-w-md text-muted-foreground text-sm sm:text-base">
                Ask me anything about academics, or explore educational topics.
                <br />
                <span className="text-primary font-medium">I'm here to support your learning journey!</span>
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {error && (
            <Alert className="mb-4 border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSend}
                  className="ml-2 h-6 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
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


      <div className="bg-card/80 backdrop-blur-sm border-t border-border/50 sticky bottom-0 z-10 rounded-b-modern-lg">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          <div className="flex space-x-2 sm:space-x-3 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 h-9 sm:h-11 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              variant="default"
              size="default"
              className="min-w-[36px] sm:min-w-[44px] h-9 sm:h-11 px-3 sm:px-4 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: '1px solid #2563eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }
              }}
              aria-label={isLoading ? "Sending message..." : "Send message"}
              title={!input.trim() ? "Enter a message to send" : "Send message"}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Press Enter to send • Shift + Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Bot className="w-3 h-3" />
              <span>Powered by EduHive </span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground">Conversation History</DialogTitle>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <Button 
              size="sm" 
              onClick={startNewConversation} 
              variant="gradient"
              className="hover:shadow-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <span className="text-sm text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Separator className="bg-border/50" />

          <ScrollArea className="flex-1 py-2">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id} 
                    className={`flex items-center justify-between p-3 rounded-modern cursor-pointer hover:bg-accent/50 transition-colors duration-200 ${
                      currentConversation?.id === conversation.id ? 'bg-primary/10 border border-primary/20' : 'bg-card/50 border border-border/30'
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{conversation.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {conversation.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

