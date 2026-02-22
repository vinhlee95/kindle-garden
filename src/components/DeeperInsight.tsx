"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";
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
          <p className="text-sm leading-relaxed">{insight}</p>
        ) : mutation.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
