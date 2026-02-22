"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Highlight {
  id: number;
  text: string;
  bookTitle: string;
  author: string;
}

interface ExportPreviewProps {
  bookId: string;
}

export function ExportPreview({ bookId }: ExportPreviewProps) {
  const { data, isLoading, isError, refetch } = useQuery<{
    highlights: Highlight[];
    total: number;
  }>({
    queryKey: ["export-preview", bookId],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (bookId !== "all") params.set("bookId", bookId);
      const res = await fetch(`/api/highlights?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load preview.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.highlights.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No highlights to export.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {data.total} highlight{data.total !== 1 ? "s" : ""} will be exported.
      </p>
      <div className="max-h-64 overflow-y-auto rounded-md border">
        {data.highlights.map((h) => (
          <div key={h.id} className="flex items-start gap-2 border-b px-3 py-2 last:border-b-0">
            <p className="flex-1 text-sm">
              {h.text.length > 120 ? h.text.slice(0, 120) + "..." : h.text}
            </p>
            <Badge variant="secondary" className="shrink-0 text-xs font-normal">
              {h.bookTitle}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
