"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useReviewCards, type ReviewCard } from "@/hooks/useReviewCards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { SwipeableCardStack } from "@/components/SwipeableCardStack";
import { CardDots } from "@/components/CardDots";
import type { SwipeableCardHandle } from "@/components/SwipeableCard";

type CardItem =
  | { type: "review"; card: ReviewCard }
  | { type: "caught_up" };

export function ReviewDeck() {
  const { data: cards, isLoading, isError, refetch } = useReviewCards();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const swipeRef = useRef<SwipeableCardHandle | null>(null);

  // Build the virtual card list: review cards + caught-up sentinel
  const allCards = useMemo<CardItem[]>(
    () =>
      cards
        ? [...cards.map((c) => ({ type: "review" as const, card: c })), { type: "caught_up" as const }]
        : [],
    [cards]
  );

  const total = allCards.length;

  // Auto-grade a card as "Good" (grade 4) — fire-and-forget
  const autoGrade = useCallback((highlightId: number) => {
    fetch(`/api/highlights/${highlightId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: 4 }),
    }).catch(() => {
      // Silently fail — grading is best-effort
    });
  }, []);

  const goForward = useCallback(() => {
    if (isAnimating || !allCards.length) return;

    const item = allCards[currentIndex];
    if (!item) return;

    if (item.type === "caught_up") {
      // Swiping past caught-up card: refresh and restart
      setIsAnimating(true);
      queryClient.invalidateQueries({ queryKey: ["review"] });
      // Wait briefly for refetch, then reset
      setTimeout(() => {
        setCurrentIndex(0);
        setIsAnimating(false);
      }, 300);
      return;
    }

    // Auto-grade this card as "Good"
    autoGrade(item.card.id);
    setCurrentIndex((i) => i + 1);
  }, [isAnimating, allCards, currentIndex, autoGrade, queryClient]);

  const goBack = useCallback(() => {
    if (isAnimating || currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  }, [isAnimating, currentIndex]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (direction === "left") {
        goForward();
      } else {
        goBack();
      }
    },
    [goForward, goBack]
  );

  const handleTap = useCallback(() => {
    const item = allCards[currentIndex];
    if (item?.type === "review") {
      router.push(`/highlights/${item.card.id}?from=review`);
    }
  }, [allCards, currentIndex, router]);

  // Desktop keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        swipeRef.current?.triggerSwipe("left");
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swipeRef.current?.triggerSwipe("right");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const renderCard = useCallback(
    (index: number) => {
      const item = allCards[index];
      if (!item) return null;

      // Fixed height keeps the stack uniform — no height jumps during swipes.
      // On mobile (sm-) use a shorter height; on desktop use taller.
      const cardHeight = "h-[280px] sm:h-[260px]";

      if (item.type === "caught_up") {
        return (
          <Card className={`w-full ${cardHeight} flex flex-col justify-center`}>
            <CardContent className="flex flex-col items-center gap-4">
              <CheckCircle className="size-12 text-green-500" />
              <p className="text-lg font-medium">You are all caught up!</p>
              <p className="text-center text-sm text-muted-foreground">
                Continue swiping to refresh the cards.
              </p>
            </CardContent>
          </Card>
        );
      }

      const { card } = item;
      return (
        <Card className={`w-full ${cardHeight} flex cursor-pointer flex-col overflow-hidden transition-colors hover:bg-muted/50`}>
          <CardHeader className="flex shrink-0 flex-row flex-wrap items-center gap-2 overflow-hidden">
            <Badge variant="secondary" className="min-w-0 shrink overflow-hidden">
              <span className="truncate">{card.book.title}</span>
            </Badge>
            <span className="shrink-0 text-sm text-muted-foreground">
              {card.book.author}
            </span>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <blockquote className="border-l-4 border-primary/30 pl-4 text-lg leading-relaxed">
              {card.text}
            </blockquote>
          </CardContent>
        </Card>
      );
    },
    [allCards]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-64 w-full max-w-lg rounded-lg" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load review cards.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // No cards at all
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <CheckCircle className="size-12 text-green-500" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm text-muted-foreground">No reviews due today.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card counter */}
      <p className="text-sm text-muted-foreground">
        {currentIndex < cards.length
          ? `Card ${currentIndex + 1} of ${cards.length}`
          : "All reviewed!"}
      </p>

      {/* Main layout: arrows + card stack */}
      <div className="flex w-full items-center justify-center gap-3">
        {/* Left arrow (desktop only) — go back */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => swipeRef.current?.triggerSwipe("right")}
          disabled={currentIndex === 0 || isAnimating}
          className="hidden shrink-0 sm:flex"
          aria-label="Previous card"
        >
          <ChevronLeft className="size-6" />
        </Button>

        {/* Card stack */}
        <SwipeableCardStack
          count={total}
          currentIndex={currentIndex}
          renderCard={renderCard}
          onSwipe={handleSwipe}
          onTap={handleTap}
          disabled={isAnimating}
          swipeRef={swipeRef}
        />

        {/* Right arrow (desktop only) — go forward */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => swipeRef.current?.triggerSwipe("left")}
          disabled={isAnimating}
          className="hidden shrink-0 sm:flex"
          aria-label="Next card"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>

      {/* Dot indicators */}
      <CardDots total={total} current={currentIndex} />

      {/* Desktop hint */}
      <p className="hidden text-xs text-muted-foreground sm:block">
        Use arrow keys or click to navigate. Tap a card to view details.
      </p>

      {/* Mobile hint */}
      <p className="text-xs text-muted-foreground sm:hidden">
        Swipe to navigate. Tap a card to view details.
      </p>
    </div>
  );
}
