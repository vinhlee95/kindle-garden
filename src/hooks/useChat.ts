"use client";

import { useState, useCallback } from "react";

interface ChatMsg {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export function useChat(highlightId: number, initialMessages: ChatMsg[]) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(
    async (message: string) => {
      const userMsg: ChatMsg = {
        id: Date.now(),
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ highlightId, message }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to send message");
        }

        const assistantMsg: ChatMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const reader = res.body?.getReader();
        if (!reader) {
          const data = await res.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: data.content } : m
            )
          );
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const current = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: current } : m
            )
          );
        }
      } catch (err) {
        const errorMsg: ChatMsg = {
          id: Date.now() + 2,
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setStreaming(false);
      }
    },
    [highlightId]
  );

  return { messages, streaming, sendMessage };
}
