"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  BookOpenCheck,
  Bot,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Component as AiLoader } from "@/components/ui/ai-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Linkify from "@/components/Linkify";
import { tutorModes, type TutorMode } from "@/lib/tutor-modes";
import { BookLoader } from "@/components/ui/book-loader";
import {
  buildPostStudyPrompt,
  getStudySessionTitle,
  keepStudyLaunchMessage,
  type StudyPostContext,
} from "@/lib/study";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  mode?: TutorMode;
  kind?: "study-launch";
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  studySource?: StudyPostContext;
  studyMode?: TutorMode;
};

const generateId = () => crypto.randomUUID();

const learningModes: Array<{
  value: TutorMode;
  label: string;
  description: string;
}> = [
  {
    value: "explain",
    label: "Explain",
    description: "Clear concepts, examples, and a quick knowledge check.",
  },
  {
    value: "quiz",
    label: "Quiz Me",
    description: "Ten questions to test recall, application, and reasoning.",
  },
  {
    value: "flashcards",
    label: "Flashcards",
    description: "Ten concise prompt-and-answer cards for revision.",
  },
  {
    value: "practice-exam",
    label: "Practice Exam",
    description: "A 50-mark exam-style paper without solutions.",
  },
  {
    value: "summarize",
    label: "Summarize",
    description: "A concise, exam-focused overview of the essentials.",
  },
  {
    value: "simplify",
    label: "Simplify",
    description: "Plain language and analogies for difficult topics.",
  },
  {
    value: "compare",
    label: "Compare",
    description: "A direct comparison table with practical distinctions.",
  },
  {
    value: "step-by-step",
    label: "Step-by-Step",
    description: "A worked process with assumptions and decision points.",
  },
];

const isTutorMode = (value: unknown): value is TutorMode =>
  typeof value === "string" && tutorModes.includes(value as TutorMode);

const getModeLabel = (mode: TutorMode) =>
  learningModes.find(({ value }) => value === mode)?.label ?? "Explain";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getStreamDelta = (value: unknown): string => {
  if (!isRecord(value) || !Array.isArray(value.choices)) return "";

  const choice = value.choices[0];
  if (!isRecord(choice) || !isRecord(choice.delta)) return "";

  return typeof choice.delta.content === "string" ? choice.delta.content : "";
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseStudyPostContext = (value: unknown): StudyPostContext | null => {
  if (!isRecord(value)) return null;
  const author = isRecord(value.author)
    ? value.author
    : isRecord(value.user)
      ? value.user
      : null;
  if (!author) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.content !== "string" ||
    typeof author.username !== "string" ||
    typeof author.displayName !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    content: value.content,
    author: {
      username: author.username,
      displayName: author.displayName,
    },
  };
};

const createConversation = (
  studySource?: StudyPostContext,
  studyMode?: TutorMode,
): Conversation => ({
  id: generateId(),
  title:
    studySource && studyMode
      ? getStudySessionTitle(studySource, studyMode)
      : "New Conversation",
  lastMessage: "",
  timestamp: new Date(),
  messages: [],
  studySource,
  studyMode,
});

const getConversationMode = (conversation: Conversation): TutorMode =>
  [...conversation.messages].reverse().find(({ isUser }) => isUser)?.mode ??
  conversation.studyMode ??
  "explain";

const restoreConversation = (value: unknown): Conversation | null => {
  if (!isRecord(value) || !Array.isArray(value.messages)) return null;

  const timestamp = parseDate(value.updatedAt);
  if (
    !timestamp ||
    typeof value.id !== "string" ||
    typeof value.title !== "string"
  )
    return null;

  let studyMode: TutorMode | undefined;
  if (value.studyMode !== null && value.studyMode !== undefined) {
    if (!isTutorMode(value.studyMode)) return null;
    studyMode = value.studyMode;
  }

  let studySource: StudyPostContext | undefined;
  if (value.sourcePost !== null && value.sourcePost !== undefined) {
    const parsedSource = parseStudyPostContext(value.sourcePost);
    if (!parsedSource) return null;
    studySource = parsedSource;
  }

  const messages = value.messages.flatMap((message): Message[] => {
    if (!isRecord(message)) return [];
    const messageTimestamp = parseDate(message.timestamp);
    if (
      !messageTimestamp ||
      typeof message.id !== "string" ||
      typeof message.content !== "string" ||
      typeof message.isUser !== "boolean"
    ) {
      return [];
    }

    if (message.mode !== undefined && !isTutorMode(message.mode)) return [];
    if (message.kind !== undefined && message.kind !== "study-launch")
      return [];

    return [
      {
        id: message.id,
        content: message.content,
        isUser: message.isUser,
        timestamp: messageTimestamp,
        mode: message.mode,
        kind: message.kind,
      },
    ];
  });

  if (messages.length !== value.messages.length) return null;

  return {
    id: value.id,
    title: value.title,
    lastMessage: messages.at(-1)?.content ?? "",
    timestamp,
    messages,
    studySource,
    studyMode,
  };
};

async function saveConversation(conversation: Conversation) {
  const response = await fetch("/api/chat-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages,
      sourcePostId: conversation.studySource?.id,
      studyMode: conversation.studyMode,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Unable to save chat history.");
  }
}

async function streamTutorResponse(
  conversationMessages: Message[],
  selectedMode: TutorMode,
  onResponseChunk: (content: string) => void,
) {
  const tutorContext = keepStudyLaunchMessage(conversationMessages, 11);
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: selectedMode,
      messages: tutorContext.map((message) => ({
        role: message.isUser ? "user" : "assistant",
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Unable to get a tutor response.");
  }

  if (!response.body) throw new Error("The tutor returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let responseText = "";
  let buffer = "";

  const processEvent = (event: string) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");

    if (!data || data === "[DONE]") return;

    try {
      const delta = getStreamDelta(JSON.parse(data));
      if (!delta) return;

      responseText += delta;
      onResponseChunk(responseText);
    } catch {
      // Ignore malformed provider events and continue consuming the stream.
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";
    events.forEach(processEvent);
  }

  buffer += decoder.decode();
  if (buffer) processEvent(buffer);

  if (!responseText.trim())
    throw new Error("The tutor returned an empty response.");
  return responseText;
}

const MessageBubble = ({ message }: { message: Message }) => (
  <div
    className={`animate-fadeIn mb-3 flex sm:mb-4 ${message.isUser ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`rounded-modern-lg shadow-soft max-w-[85%] px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3 ${message.isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "border-border/50 bg-card text-card-foreground rounded-bl-sm border"}`}
    >
      {message.isUser && message.mode && message.mode !== "explain" && (
        <p className="text-primary-foreground/70 mb-1 text-xs font-medium">
          {getModeLabel(message.mode)}
        </p>
      )}
      <p className="text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
        {message.kind === "study-launch" ? (
          `Study this post in ${getModeLabel(message.mode ?? "explain")} mode.`
        ) : (
          <Linkify>{message.content}</Linkify>
        )}
      </p>
      <p
        className={`mt-1 text-xs sm:mt-2 ${message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

export default function AcademicChatBot() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TutorMode>("explain");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [studySource, setStudySource] = useState<StudyPostContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didProcessStudyLaunch = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetch("/api/chat-sessions", {
          cache: "no-store",
        });
        const payload: unknown = await response.json();
        if (!response.ok || !Array.isArray(payload)) {
          throw new Error("Unable to load saved conversations.");
        }

        const restored = payload.flatMap((session): Conversation[] => {
          const conversation = restoreConversation(session);
          return conversation ? [conversation] : [];
        });

        if (cancelled) return;

        if (restored.length > 0) {
          setConversations(restored);
          setCurrentConversation(restored[0]);
          setMessages(restored[0].messages);
          setMode(getConversationMode(restored[0]));
          setStudySource(restored[0].studySource ?? null);
        } else {
          const conversation = createConversation();
          setConversations([conversation]);
          setCurrentConversation(conversation);
          setStudySource(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error("Chat history error:", loadError);
          const conversation = createConversation();
          setConversations([conversation]);
          setCurrentConversation(conversation);
          setStudySource(null);
          setError(
            "Your saved history could not be loaded. You can still start a new conversation.",
          );
        }
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewConversation = () => {
    const conversation = createConversation();
    setCurrentConversation(conversation);
    setMessages([]);
    setMode("explain");
    setStudySource(null);
    setConversations((current) => [
      conversation,
      ...current.filter(({ id }) => id !== conversation.id),
    ]);
    setError(null);
    setIsHistoryOpen(false);
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(({ id }) => id === conversationId);
    if (!conversation) return;

    setCurrentConversation(conversation);
    setMessages(conversation.messages);
    setMode(getConversationMode(conversation));
    setStudySource(conversation.studySource ?? null);
    setError(null);
    setIsHistoryOpen(false);
  };

  const deleteConversation = async (conversation: Conversation) => {
    const isCurrentConversation = currentConversation?.id === conversation.id;
    setConversations((current) =>
      current.filter(({ id }) => id !== conversation.id),
    );

    if (isCurrentConversation) {
      const replacement = createConversation();
      setCurrentConversation(replacement);
      setMessages([]);
      setStudySource(null);
      setConversations((current) => [replacement, ...current]);
    }

    if (conversation.messages.length === 0) return;

    try {
      const response = await fetch(`/api/chat-sessions/${conversation.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to delete chat history.");
    } catch (deleteError) {
      console.error("Chat deletion error:", deleteError);
      setError(
        "The conversation was removed from this view but could not be deleted from saved history.",
      );
    }
  };

  const sendQuestion = useCallback(
    async ({
      question,
      originalConversation,
      previousMessages,
      selectedMode,
      kind,
    }: {
      question: string;
      originalConversation: Conversation;
      previousMessages: Message[];
      selectedMode: TutorMode;
      kind?: Message["kind"];
    }) => {
      const userMessage: Message = {
        id: generateId(),
        content: question,
        isUser: true,
        timestamp: new Date(),
        mode: selectedMode,
        kind,
      };
      const updatedMessages = [...previousMessages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const botMessageId = generateId();
        const botTimestamp = new Date();
        const reply = await streamTutorResponse(
          updatedMessages,
          selectedMode,
          (partialResponse) => {
            setMessages([
              ...updatedMessages,
              {
                id: botMessageId,
                content: partialResponse,
                isUser: false,
                timestamp: botTimestamp,
              },
            ]);
          },
        );
        const botMessage: Message = {
          id: botMessageId,
          content: reply,
          isUser: false,
          timestamp: botTimestamp,
        };
        const finalMessages = keepStudyLaunchMessage(
          [...updatedMessages, botMessage],
          100,
        );
        const conversation: Conversation = {
          id: originalConversation.id,
          title:
            originalConversation.messages.length === 0 &&
            originalConversation.title === "New Conversation"
              ? question.slice(0, 120)
              : originalConversation.title,
          lastMessage: botMessage.content,
          timestamp: new Date(),
          messages: finalMessages,
          studySource: originalConversation.studySource,
          studyMode: originalConversation.studySource
            ? (originalConversation.studyMode ?? selectedMode)
            : undefined,
        };

        setMessages(finalMessages);
        setCurrentConversation(conversation);
        setStudySource(conversation.studySource ?? null);
        setConversations((current) => [
          conversation,
          ...current.filter(({ id }) => id !== conversation.id),
        ]);

        try {
          await saveConversation(conversation);
        } catch (saveError) {
          console.error("Chat save error:", saveError);
          setError(
            "The response is shown, but it could not be saved to your history.",
          );
        }
      } catch (chatError) {
        console.error("Tutor error:", chatError);
        setMessages(previousMessages);
        setInput(kind === "study-launch" ? "" : question);
        setError(
          chatError instanceof Error
            ? chatError.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isHistoryLoading || didProcessStudyLaunch.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get("study");
    if (!postId) return;

    didProcessStudyLaunch.current = true;
    const requestedMode = searchParams.get("mode");
    const launchMode = isTutorMode(requestedMode) ? requestedMode : "summarize";

    const launchStudySession = async () => {
      try {
        const response = await fetch(
          `/api/posts/${encodeURIComponent(postId)}/study-context`,
          { cache: "no-store" },
        );
        const payload: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            isRecord(payload) && typeof payload.error === "string"
              ? payload.error
              : "Unable to load the source post.",
          );
        }

        const source = parseStudyPostContext(payload);
        if (!source) throw new Error("The source post could not be read.");

        const conversation = createConversation(source, launchMode);
        const question = buildPostStudyPrompt(source, launchMode);
        setCurrentConversation(conversation);
        setMessages([]);
        setMode(launchMode);
        setStudySource(source);
        setConversations((current) => [
          conversation,
          ...current.filter(({ id }) => id !== conversation.id),
        ]);
        window.history.replaceState(null, "", "/chatbot");

        await sendQuestion({
          question,
          originalConversation: conversation,
          previousMessages: [],
          selectedMode: launchMode,
          kind: "study-launch",
        });
      } catch (launchError) {
        console.error("Study launch error:", launchError);
        setError(
          launchError instanceof Error
            ? launchError.message
            : "Unable to start this study session.",
        );
      }
    };

    void launchStudySession();
  }, [isHistoryLoading, sendQuestion]);

  const handleSend = () => {
    const question = input.trim();
    if (!question || isLoading || !currentConversation) return;

    void sendQuestion({
      question,
      originalConversation: currentConversation,
      previousMessages: messages,
      selectedMode: mode,
    });
  };

  const isBusy = isLoading || isHistoryLoading;

  return (
    <div className="rounded-modern-lg border-border/50 bg-background shadow-medium animate-fadeIn flex h-[calc(100svh-12rem)] min-h-96 flex-col border sm:h-[calc(100svh-10rem)] lg:h-[calc(100svh-8rem)]">
      <div className="rounded-t-modern-lg border-border/50 bg-card/80 sticky top-0 z-10 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="rounded-modern bg-primary/10 p-1.5 sm:p-2">
              <Sparkles className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-foreground text-lg font-bold sm:text-2xl">
              EduHive AI Tutor
            </h1>
          </div>
          <div className="text-success flex items-center space-x-1 sm:space-x-2">
            <div className="bg-success h-1.5 w-1.5 animate-pulse rounded-full sm:h-2 sm:w-2" />
            <span className="text-xs font-medium sm:text-sm">Online</span>
          </div>
        </div>
        <Button
          onClick={() => setIsHistoryOpen(true)}
          variant="outline"
          disabled={isBusy}
          className="hover:bg-accent/50 flex items-center space-x-2 text-sm sm:text-base"
        >
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>History</span>
        </Button>
      </div>

      <div className="bg-background flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="mx-auto max-w-4xl">
          {studySource && (
            <Alert className="border-primary/20 bg-primary/5 mb-4">
              <BookOpenCheck className="text-primary" />
              <AlertTitle>
                Studying a post by {studySource.author.displayName}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="line-clamp-2">{studySource.content}</p>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={`/posts/${studySource.id}`}>
                    Open source post
                    <ExternalLink data-icon="inline-end" />
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isHistoryLoading ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Loading your saved conversations...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center px-4">
              <div className="rounded-modern-lg bg-primary/10 mb-4 p-3 sm:mb-6 sm:p-4">
                <Bot size={32} className="text-primary sm:h-12 sm:w-12" />
              </div>
              <h2 className="text-foreground mb-2 text-center text-lg font-semibold sm:text-2xl">
                What would you like to learn?
              </h2>
              <p className="text-muted-foreground max-w-md text-center text-sm sm:text-base">
                Ask a question and EduHive will explain it step by step, with
                examples and a short knowledge check.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {error && (
            <Alert className="border-destructive/20 bg-destructive/10 mb-4">
              <AlertCircle className="text-destructive h-4 w-4" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && <AiLoader className="mb-4 max-w-fit" />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="rounded-b-modern-lg border-border/50 bg-card/80 sticky bottom-0 z-10 border-t backdrop-blur-sm">
        <div className="mx-auto max-w-4xl p-3 sm:p-4">
          <div className="flex items-end space-x-2 sm:space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Choose learning mode"
                  disabled={isBusy}
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0 gap-1.5 px-2.5 text-xs sm:h-11 sm:px-3 sm:text-sm"
                >
                  <Sparkles className="text-primary size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">{getModeLabel(mode)}</span>
                  <span className="sm:hidden">Mode</span>
                  <ChevronDown className="text-muted-foreground size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[calc(100vw-1.5rem)] max-w-80 p-1.5"
              >
                <DropdownMenuLabel>Choose response mode</DropdownMenuLabel>
                <p className="text-muted-foreground px-2 pb-2 text-xs">
                  The selected mode controls the next tutor response.
                </p>
                <DropdownMenuSeparator />
                {learningModes.map((learningMode) => (
                  <DropdownMenuItem
                    key={learningMode.value}
                    onSelect={() => setMode(learningMode.value)}
                    className="min-h-14 items-start gap-3 px-2 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{learningMode.label}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                        {learningMode.description}
                      </p>
                    </div>
                    {mode === learningMode.value && (
                      <Check className="text-primary mt-0.5 size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" && !event.shiftKey && handleSend()
              }
              placeholder="Ask a question..."
              maxLength={4000}
              className="border-border/50 bg-background/50 focus:border-primary/50 focus:bg-background focus:ring-primary/20 h-9 flex-1 text-sm transition-all duration-200 focus:ring-2 sm:h-11 sm:text-base"
              disabled={isBusy}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isBusy}
              className="h-9 min-w-[36px] flex-shrink-0 px-3 sm:h-11 sm:min-w-[44px] sm:px-4"
              aria-label={isLoading ? "Sending message..." : "Send message"}
            >
              {isLoading ? (
                <BookLoader size="1rem" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>Press Enter to send</span>
            <div className="flex items-center space-x-1">
              <Bot className="h-3 w-3" />
              <span>Powered by EduHive AI</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="border-border/50 bg-card/95 flex max-h-[80vh] flex-col backdrop-blur-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Conversation History
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4 flex items-center justify-between">
            <Button size="sm" onClick={startNewConversation} variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <span className="text-muted-foreground text-sm">
              {conversations.length} conversation
              {conversations.length === 1 ? "" : "s"}
            </span>
          </div>
          <Separator className="bg-border/50" />
          <ScrollArea className="flex-1 py-2">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`rounded-modern hover:bg-accent/50 flex cursor-pointer items-center justify-between border p-3 transition-colors duration-200 ${currentConversation?.id === conversation.id ? "border-primary/20 bg-primary/10" : "border-border/30 bg-card/50"}`}
                  onClick={() => loadConversation(conversation.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate font-medium">
                      {conversation.title}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                    <div className="text-muted-foreground mt-1 flex items-center text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {conversation.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 w-6"
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteConversation(conversation);
                    }}
                    aria-label={`Delete ${conversation.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
