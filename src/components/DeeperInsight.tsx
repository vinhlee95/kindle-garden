"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useDeeperInsight } from "@/hooks/useDeeperInsight";

interface DeeperInsightProps {
  highlightId: number;
  existingInsight: string | null;
}

export function DeeperInsight({ highlightId, existingInsight }: DeeperInsightProps) {
  const [insight, setInsight] = useState(existingInsight);
  const mutation = useDeeperInsight(highlightId);

  async function handleGenerate() {
    const result = await mutation.mutateAsync();
    setInsight(result.insight);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4" />
          Deeper Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insight ? (
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-muted-foreground/30 pl-2 italic text-muted-foreground my-1">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {insight}
            </ReactMarkdown>
          </div>
        ) : mutation.isPending ? (
          <div className="flex justify-start">
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 flex gap-1 items-center">
              <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
              <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
              <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Get an AI-generated insight about this highlight.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={mutation.isPending}
            >
              <Lightbulb className="size-4" />
              Dig Deeper
            </Button>
            {mutation.isError && (
              <p className="text-xs text-destructive">
                {mutation.error.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
