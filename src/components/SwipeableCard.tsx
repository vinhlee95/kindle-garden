"use client";

import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface SwipeableCardHandle {
  triggerSwipe: (direction: "left" | "right") => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  onSwipe: (direction: "left" | "right") => void;
  onTap?: () => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 0.4; // 40% of card width
const FLY_OFF_DURATION = 400; // ms
const SNAP_BACK_DURATION = 300; // ms
const TAP_MOVEMENT_LIMIT = 8; // px — movement below this counts as a tap
const MIN_DRAG_DURATION = 80; // ms — reject very fast flicks

export const SwipeableCard = forwardRef<SwipeableCardHandle, SwipeableCardProps>(
  function SwipeableCard({ children, onSwipe, onTap, disabled }, ref) {
    const cardRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentDeltaX: 0,
      startTime: 0,
      directionLocked: false as false | "horizontal" | "vertical",
    });
    const wasDragging = useRef(false);
    const isAnimatingRef = useRef(false);

    const flyOff = useCallback(
      (direction: "left" | "right") => {
        const card = cardRef.current;
        if (!card || isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        const targetX = direction === "left" ? -120 : 120;
        const targetRotation = direction === "left" ? -15 : 15;

        card.style.transition = `transform ${FLY_OFF_DURATION}ms cubic-bezier(0.32, 0, 0.67, 0)`;
        card.style.transform = `translateX(${targetX}vw) rotate(${targetRotation}deg)`;

        const cleanup = () => {
          isAnimatingRef.current = false;
          onSwipe(direction);
        };

        const fallbackTimeout = setTimeout(cleanup, FLY_OFF_DURATION + 100);

        card.addEventListener(
          "transitionend",
          () => {
            clearTimeout(fallbackTimeout);
            cleanup();
          },
          { once: true }
        );
      },
      [onSwipe]
    );

    const snapBack = useCallback(() => {
      const card = cardRef.current;
      if (!card) return;

      card.style.transition = `transform ${SNAP_BACK_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
      card.style.transform = "translateX(0) rotate(0deg)";

      const cleanup = () => {
        if (card) {
          card.style.transition = "";
        }
      };

      const fallbackTimeout = setTimeout(cleanup, SNAP_BACK_DURATION + 50);
      card.addEventListener(
        "transitionend",
        () => {
          clearTimeout(fallbackTimeout);
          cleanup();
        },
        { once: true }
      );
    }, []);

    useImperativeHandle(ref, () => ({
      triggerSwipe: (direction: "left" | "right") => {
        if (!disabled) flyOff(direction);
      },
    }));

    const handlePointerDown = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        if (disabled || isAnimatingRef.current) return;
        // Only handle primary pointer (left mouse / single touch)
        if (e.button !== 0) return;

        const card = cardRef.current;
        if (!card) return;

        card.setPointerCapture(e.pointerId);
        card.style.transition = "";
        card.style.transform = "translateX(0) rotate(0deg)";

        dragState.current = {
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          currentDeltaX: 0,
          startTime: Date.now(),
          directionLocked: false,
        };
      },
      [disabled]
    );

    const handlePointerMove = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        const state = dragState.current;
        if (!state.isDragging || isAnimatingRef.current) return;

        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;

        // Direction lock: determine if this is a horizontal or vertical gesture
        if (!state.directionLocked) {
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);

          // Need at least 10px of movement to determine direction
          if (absDeltaX < 10 && absDeltaY < 10) return;

          if (absDeltaX > absDeltaY * 1.2) {
            state.directionLocked = "horizontal";
          } else {
            state.directionLocked = "vertical";
            // Abort drag — let browser handle vertical scroll
            state.isDragging = false;
            return;
          }
        }

        if (state.directionLocked !== "horizontal") return;

        // Prevent scrolling during horizontal drag
        e.preventDefault();

        state.currentDeltaX = deltaX;
        const rotation = deltaX * 0.05;

        const card = cardRef.current;
        if (card) {
          card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        }
      },
      []
    );

    const handlePointerUp = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        const state = dragState.current;
        if (!state.isDragging) return;
        state.isDragging = false;

        const card = cardRef.current;
        if (!card) return;

        try {
          card.releasePointerCapture(e.pointerId);
        } catch {
          // Pointer capture may already be released
        }

        const deltaX = state.currentDeltaX;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(e.clientY - state.startY);
        const duration = Date.now() - state.startTime;

        // Tap detection: minimal movement
        if (absDeltaX < TAP_MOVEMENT_LIMIT && absDeltaY < TAP_MOVEMENT_LIMIT) {
          card.style.transform = "translateX(0) rotate(0deg)";
          wasDragging.current = false;
          onTap?.();
          return;
        }

        wasDragging.current = true;

        const cardWidth = card.offsetWidth;
        const thresholdMet = absDeltaX > cardWidth * SWIPE_THRESHOLD;
        const durationMet = duration >= MIN_DRAG_DURATION;

        if (thresholdMet && durationMet) {
          const direction = deltaX < 0 ? "left" : "right";
          flyOff(direction);
        } else {
          snapBack();
        }
      },
      [flyOff, snapBack, onTap]
    );

    const handlePointerCancel = useCallback(() => {
      dragState.current.isDragging = false;
      snapBack();
    }, [snapBack]);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        // Prevent click from firing after a drag
        if (wasDragging.current) {
          e.preventDefault();
          e.stopPropagation();
          wasDragging.current = false;
        }
      },
      []
    );

    return (
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
        style={{
          touchAction: "pan-y",
          userSelect: "none",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    );
  }
);
