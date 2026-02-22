"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HighlightCard } from "@/components/HighlightCard";
import { BookFilter } from "@/components/BookFilter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Highlight {
  id: number;
  text: string;
  book: { id: number; title: string; author: string };
  location: string | null;
}

interface Book {
  id: number;
  title: string;
  author: string;
}

const PAGE_SIZE = 20;

export default function HighlightsPage() {
  const [bookId, setBookId] = useState("all");
  const [page, setPage] = useState(1);

  const booksQuery = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });

  const highlightsQuery = useQuery<{
    highlights: Highlight[];
    total: number;
  }>({
    queryKey: ["highlights", bookId, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (bookId !== "all") params.set("bookId", bookId);
      const res = await fetch(`/api/highlights?${params}`);
      if (!res.ok) throw new Error("Failed to fetch highlights");
      return res.json();
    },
  });

  const totalPages = highlightsQuery.data
    ? Math.ceil(highlightsQuery.data.total / PAGE_SIZE)
    : 0;

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Browse Highlights</h1>
        <BookFilter
          books={booksQuery.data ?? []}
          value={bookId}
          onChange={(v) => {
            setBookId(v);
            setPage(1);
          }}
        />
      </div>

      {highlightsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      {highlightsQuery.isError && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load highlights.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => highlightsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {highlightsQuery.data && highlightsQuery.data.highlights.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">No highlights yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Import your Kindle highlights to get started.
          </p>
        </div>
      )}

      {highlightsQuery.data && highlightsQuery.data.highlights.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {highlightsQuery.data.highlights.map((h) => (
              <HighlightCard
                key={h.id}
                id={h.id}
                text={h.text}
                bookTitle={h.book.title}
                author={h.book.author}
                location={h.location}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
