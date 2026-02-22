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
  const [thinking, setThinking] = useState(false);

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
      setThinking(true);

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
          setThinking(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: data.content } : m
            )
          );
          return;
        }

        const decoder = new TextDecoder();
        let rawBuffer = "";
        let extractedContent = "";
        let firstToken = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawBuffer += decoder.decode(value, { stream: true });

          const lines = rawBuffer.split("\n");
          rawBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                if (firstToken) {
                  setThinking(false);
                  firstToken = false;
                }
                extractedContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: extractedContent }
                      : m
                  )
                );
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
      } catch (err) {
        setThinking(false);
        const errorMsg: ChatMsg = {
          id: Date.now() + 2,
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setThinking(false);
        setStreaming(false);
      }
    },
    [highlightId]
  );

  return { messages, streaming, thinking, sendMessage };
}
