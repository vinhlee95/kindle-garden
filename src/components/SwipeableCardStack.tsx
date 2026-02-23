"use client";

import { type ReactNode, type RefObject, useState, useCallback } from "react";
import {
  SwipeableCard,
  type SwipeableCardHandle,
} from "@/components/SwipeableCard";
import { Card } from "@/components/ui/card";

interface SwipeableCardStackProps {
  /** Total number of items (including sentinel) */
  count: number;
  /** Index of the top card */
  currentIndex: number;
  /** Render function for each card */
  renderCard: (index: number) => ReactNode;
  /** Called when top card is swiped */
  onSwipe: (direction: "left" | "right") => void;
  /** Called when top card is tapped */
  onTap?: () => void;
  /** Whether interaction is disabled */
  disabled?: boolean;
  /** Ref to the SwipeableCard handle for programmatic swipes */
  swipeRef: RefObject<SwipeableCardHandle | null>;
}

const MAX_VISIBLE = 3;

export function SwipeableCardStack({
  count,
  currentIndex,
  renderCard,
  onSwipe,
  onTap,
  disabled,
  swipeRef,
}: SwipeableCardStackProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  // Calculate visible card indices (current + up to 2 behind)
  const visibleIndices: number[] = [];
  for (let i = 0; i < MAX_VISIBLE && currentIndex + i < count; i++) {
    visibleIndices.push(currentIndex + i);
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* Render in reverse order so first card has highest z-index */}
      {[...visibleIndices].reverse().map((cardIndex) => {
        const stackPosition = cardIndex - currentIndex; // 0 = top, 1 = behind, 2 = furthest
        const isTop = stackPosition === 0;

        if (isTop) {
          return (
            <div key={cardIndex} className="relative" style={{ zIndex: MAX_VISIBLE }}>
              <SwipeableCard
                ref={swipeRef}
                onSwipe={onSwipe}
                onTap={onTap}
                disabled={disabled}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {renderCard(cardIndex)}
              </SwipeableCard>
            </div>
          );
        }

        const scale = 1 - stackPosition * 0.04;
        const translateY = stackPosition * 8;
        const opacity = stackPosition >= 2 ? 0.6 : 0.8;

        // First card behind (stackPosition 1): render real content only while
        // the top card is being dragged (so it peeks through during a swipe).
        // Further cards (stackPosition 2+): always render empty shells.
        const showContent = stackPosition === 1 && isDragging;

        return (
          <div
            key={cardIndex}
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{
              zIndex: MAX_VISIBLE - stackPosition,
              height: "100%",
              transform: `scale(${scale}) translateY(${translateY}px)`,
              opacity,
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transformOrigin: "top center",
              pointerEvents: "none",
            }}
          >
            {showContent ? renderCard(cardIndex) : <Card className="h-full w-full" />}
          </div>
        );
      })}
    </div>
  );
}
