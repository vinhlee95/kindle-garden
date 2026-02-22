"use client";

import { useQuery } from "@tanstack/react-query";

export interface ReviewCard {
  id: number;
  text: string;
  bookTitle: string;
  author: string;
  location: string | null;
}

export function useReviewCards() {
  return useQuery<ReviewCard[]>({
    queryKey: ["review"],
    queryFn: async () => {
      const res = await fetch("/api/review");
      if (!res.ok) throw new Error("Failed to fetch review cards");
      return res.json();
    },
  });
}
