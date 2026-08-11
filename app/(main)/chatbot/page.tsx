"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUp,
  BookOpen,
  BookOpenCheck,
  Bot,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Message as ChatMessage,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Linkify from "@/components/Linkify";
import { tutorModes, type TutorMode } from "@/lib/tutor-modes";
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

const starterPrompts = [
  {
    label: "Explain it",
    prompt: "Explain a difficult concept in simple language with one example.",
  },
  {
    label: "Quiz me",
    prompt: "Quiz me on a topic I am studying and adapt to my answers.",
  },
  {
    label: "Study plan",
    prompt: "Build a focused study plan for my next learning goal.",
  },
  {
    label: "Compare ideas",
    prompt: "Help me compare two related ideas and remember the difference.",
  },
] as const;

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
  <ChatMessage
    align={message.isUser ? "end" : "start"}
    className="animate-fadeIn"
  >
    <MessageContent className="max-w-2xl">
      <MessageHeader>
        <span>{message.isUser ? "You" : "EduHive tutor"}</span>
        {message.isUser && message.mode && message.mode !== "explain" && (
          <span className="text-muted-foreground ml-2">
            {getModeLabel(message.mode)}
          </span>
        )}
      </MessageHeader>
      <Bubble
        align={message.isUser ? "end" : "start"}
        variant={message.isUser ? "default" : "ghost"}
      >
        <BubbleContent>
          <p className="whitespace-pre-wrap">
            {message.kind === "study-launch" ? (
              `Study this post in ${getModeLabel(message.mode ?? "explain")} mode.`
            ) : (
              <Linkify>{message.content}</Linkify>
            )}
          </p>
        </BubbleContent>
      </Bubble>
      <MessageFooter>
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </MessageFooter>
    </MessageContent>
  </ChatMessage>
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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
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
    <div className="animate-fadeIn rounded-modern-lg border-border/60 bg-card shadow-medium grid h-[calc(100dvh-12rem)] min-h-96 grid-cols-1 overflow-hidden border sm:h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-8rem)] xl:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-border/60 bg-muted/20 hidden min-h-0 flex-col border-r xl:flex">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-modern bg-primary text-primary-foreground flex size-9 items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">EduHive tutor</p>
              <p className="text-muted-foreground text-xs">Your study space</p>
            </div>
          </div>
          <Button onClick={startNewConversation} disabled={isBusy}>
            <Plus data-icon="inline-start" />
            New chat
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-muted-foreground text-xs font-medium">
            Conversations
          </p>
          <span className="text-muted-foreground text-xs tabular-nums">
            {conversations.length}
          </span>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav
            aria-label="Conversation history"
            className="flex flex-col gap-1 px-2 pb-4"
          >
            {isHistoryLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-2 py-4 text-sm">
                <Spinner />
                Loading history
              </div>
            ) : (
              conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center gap-1">
                  <Button
                    variant={
                      currentConversation?.id === conversation.id
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => loadConversation(conversation.id)}
                    className="min-w-0 flex-1 justify-start"
                  >
                    <MessageCircle data-icon="inline-start" />
                    <span className="truncate">{conversation.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void deleteConversation(conversation)}
                    aria-label={`Delete ${conversation.title}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))
            )}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="text-muted-foreground p-4 text-xs leading-relaxed">
          Choose a response mode before sending to change how the tutor helps.
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col">
        <header className="border-border/60 flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium">
              AI tutor
            </p>
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {currentConversation?.title ?? "New conversation"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground hidden items-center gap-2 text-xs sm:flex">
              <Sparkles className="text-primary size-4" />
              Ready for a question
            </div>
            <Button
              onClick={() => setIsHistoryOpen(true)}
              variant="outline"
              size="sm"
              disabled={isBusy}
              className="xl:hidden"
            >
              <BookOpen data-icon="inline-start" />
              History
            </Button>
          </div>
        </header>

        <div className="bg-muted/10 relative min-h-0 flex-1 overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px] opacity-30"
          />
          <div className="relative mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-8">
            {studySource && (
              <Alert className="mb-6">
                <BookOpenCheck />
                <AlertTitle>
                  Studying a post by {studySource.author.displayName}
                </AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p className="line-clamp-2">{studySource.content}</p>
                  <Button asChild variant="link" size="sm">
                    <Link href={`/posts/${studySource.id}`}>
                      Open source post
                      <ExternalLink data-icon="inline-end" />
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isHistoryLoading ? (
              <Empty className="gap-4 p-4 md:p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Opening your study space</EmptyTitle>
                  <EmptyDescription>
                    Loading saved conversations and your latest tutor session.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : messages.length === 0 ? (
              <Empty className="gap-4 p-4 md:p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bot />
                  </EmptyMedia>
                  <EmptyTitle>What are you learning today?</EmptyTitle>
                  <EmptyDescription>
                    Ask a question, test your recall, or turn a difficult topic
                    into a focused study plan.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="max-w-xl">
                  <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                    {starterPrompts.map((starter) => (
                      <Button
                        key={starter.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(starter.prompt)}
                      >
                        {starter.label}
                      </Button>
                    ))}
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="flex flex-col gap-7">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle />
                <AlertTitle>The tutor hit a snag</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div
                className="text-muted-foreground mt-6 flex items-center gap-3 text-sm"
                aria-live="polite"
              >
                <Spinner />
                <div>
                  <p className="text-foreground font-medium">Thinking</p>
                  <p>Building a clear response from your study context.</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          className="border-border/60 bg-card shrink-0 border-t p-3 sm:p-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <div className="mx-auto max-w-3xl">
            <label htmlFor="tutor-prompt" className="sr-only">
              Ask the EduHive tutor
            </label>
            <InputGroup data-disabled={isBusy}>
              <InputGroupTextarea
                id="tutor-prompt"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about anything you are learning..."
                maxLength={4000}
                rows={2}
                disabled={isBusy}
              />
              <InputGroupAddon align="block-end" className="justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      aria-label="Choose learning mode"
                      disabled={isBusy}
                      type="button"
                      variant="ghost"
                      size="sm"
                    >
                      <Sparkles data-icon="inline-start" />
                      {getModeLabel(mode)}
                      <ChevronDown data-icon="inline-end" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-w-80">
                    <DropdownMenuLabel>Choose response mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {learningModes.map((learningMode) => (
                        <DropdownMenuItem
                          key={learningMode.value}
                          onSelect={() => setMode(learningMode.value)}
                          className="min-h-14 items-start gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{learningMode.label}</p>
                            <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                              {learningMode.description}
                            </p>
                          </div>
                          {mode === learningMode.value && <Check />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2">
                  <InputGroupText className="hidden sm:flex">
                    Enter to send
                  </InputGroupText>
                  <InputGroupButton
                    type="submit"
                    size="icon-sm"
                    variant="default"
                    disabled={!input.trim() || isBusy}
                    aria-label={isLoading ? "Sending message" : "Send message"}
                  >
                    {isLoading ? <Spinner /> : <ArrowUp />}
                  </InputGroupButton>
                </div>
              </InputGroupAddon>
            </InputGroup>
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Shift + Enter adds a new line. Check important answers against
              your course materials.
            </p>
          </div>
        </form>
      </section>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conversation history</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <Button size="sm" onClick={startNewConversation}>
              <Plus data-icon="inline-start" />
              New chat
            </Button>
            <span className="text-muted-foreground text-sm">
              {conversations.length} conversation
              {conversations.length === 1 ? "" : "s"}
            </span>
          </div>
          <Separator />
          <ScrollArea className="flex-1 py-2">
            <div className="flex flex-col gap-1 pr-3">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center gap-1">
                  <Button
                    variant={
                      currentConversation?.id === conversation.id
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => loadConversation(conversation.id)}
                    className="min-w-0 flex-1 justify-start"
                  >
                    <Clock data-icon="inline-start" />
                    <span className="truncate">{conversation.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void deleteConversation(conversation)}
                    aria-label={`Delete ${conversation.title}`}
                  >
                    <Trash2 />
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
