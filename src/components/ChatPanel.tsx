"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  highlightId: number;
  initialMessages: { id: number; role: string; content: string; createdAt: string }[];
  sidebar?: boolean;
}

export function ChatPanel({ highlightId, initialMessages, sidebar }: ChatPanelProps) {
  const { messages, streaming, thinking, sendMessage } = useChat(highlightId, initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setInput("");
    sendMessage(trimmed);
  }

  return (
    <Card className={cn(sidebar && "h-full flex flex-col")}>
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" />
          Chat about this highlight
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-3", sidebar && "flex-1 min-h-0")}>
        <div
          ref={scrollRef}
          className={cn(
            "flex flex-col gap-2 overflow-y-auto",
            sidebar ? "flex-1 min-h-0 -mx-6 px-6" : "max-h-80"
          )}
        >
          {messages.length === 0 && !thinking && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ask a question about this highlight to start a conversation.
            </p>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-emerald-50 px-3 py-2.5 flex gap-1 items-center">
                <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
                <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this highlight..."
            disabled={streaming}
          />
          <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
