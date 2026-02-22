"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useReviewCards } from "@/hooks/useReviewCards";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

const grades = [
  { label: "Again", value: 1, key: "1", className: "bg-red-500 hover:bg-red-600 text-white" },
  { label: "Hard", value: 3, key: "2", className: "bg-orange-500 hover:bg-orange-600 text-white" },
  { label: "Good", value: 4, key: "3", className: "bg-blue-500 hover:bg-blue-600 text-white" },
  { label: "Easy", value: 5, key: "4", className: "bg-green-500 hover:bg-green-600 text-white" },
] as const;

export function ReviewDeck() {
  const { data: cards, isLoading, isError, refetch } = useReviewCards();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grading, setGrading] = useState(false);

  const currentCard = cards?.[currentIndex];
  const total = cards?.length ?? 0;

  const handleGrade = useCallback(
    async (grade: number) => {
      if (!currentCard || grading) return;
      setGrading(true);
      try {
        await fetch(`/api/highlights/${currentCard.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade }),
        });
        setCurrentIndex((i) => i + 1);
      } finally {
        setGrading(false);
      }
    },
    [currentCard, grading]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const grade = grades.find((g) => g.key === e.key);
      if (grade) handleGrade(grade.value);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleGrade]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-64 w-full max-w-lg rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load review cards.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!cards || cards.length === 0 || currentIndex >= total || !currentCard) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <CheckCircle className="size-12 text-green-500" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm text-muted-foreground">No reviews due today.</p>
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentIndex(0);
              queryClient.invalidateQueries({ queryKey: ["review"] });
            }}
          >
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground">
        Card {currentIndex + 1} of {total}
      </p>

      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row flex-wrap items-center gap-2">
          <Badge variant="secondary">{currentCard.bookTitle}</Badge>
          <span className="text-sm text-muted-foreground">
            {currentCard.author}
          </span>
        </CardHeader>
        <CardContent>
          <blockquote className="border-l-4 border-primary/30 pl-4 text-lg leading-relaxed">
            {currentCard.text}
          </blockquote>
          {currentCard.location && (
            <p className="mt-3 text-xs text-muted-foreground">
              Location: {currentCard.location}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-2">
          {grades.map((g) => (
            <Button
              key={g.value}
              className={g.className}
              disabled={grading}
              onClick={() => handleGrade(g.value)}
            >
              {g.label} ({g.key})
            </Button>
          ))}
        </CardFooter>
      </Card>

      <p className="text-xs text-muted-foreground">
        Keyboard: 1=Again, 2=Hard, 3=Good, 4=Easy
      </p>
    </div>
  );
}
