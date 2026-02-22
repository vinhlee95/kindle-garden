"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookFilter } from "@/components/BookFilter";
import { ExportPreview } from "@/components/ExportPreview";
import { Download } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
}

export default function ExportPage() {
  const [bookId, setBookId] = useState("all");

  const booksQuery = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });

  function handleDownload() {
    const params = new URLSearchParams();
    if (bookId !== "all") params.set("bookId", bookId);
    const url = `/api/export${params.toString() ? "?" + params.toString() : ""}`;
    window.location.href = url;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Export Highlights</h1>
        <p className="mt-2 text-muted-foreground">
          Download your highlights as an Anki-compatible file.
        </p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Anki Export</CardTitle>
          <CardDescription>
            Export highlights as a tab-separated file for importing into Anki.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BookFilter
            books={booksQuery.data ?? []}
            value={bookId}
            onChange={setBookId}
          />

          <ExportPreview bookId={bookId} />

          <Button className="gap-2" onClick={handleDownload}>
            <Download className="size-4" />
            Download Anki File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
