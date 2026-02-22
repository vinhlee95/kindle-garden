"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeeperInsight(highlightId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/deeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlightId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate insight");
      }
      return res.json() as Promise<{ insight: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["highlight", String(highlightId)] });
    },
  });
}
