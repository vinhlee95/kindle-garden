"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";

interface ChatPanelProps {
  highlightId: number;
  initialMessages: { id: number; role: string; content: string; createdAt: string }[];
}

export function ChatPanel({ highlightId, initialMessages }: ChatPanelProps) {
  const { messages, streaming, sendMessage } = useChat(highlightId, initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setInput("");
    sendMessage(trimmed);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" />
          Chat about this highlight
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          ref={scrollRef}
          className="flex max-h-80 flex-col gap-2 overflow-y-auto"
        >
          {messages.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ask a question about this highlight to start a conversation.
            </p>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
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
