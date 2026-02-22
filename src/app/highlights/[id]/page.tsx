"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeeperInsight } from "@/components/DeeperInsight";
import { ChatPanel } from "@/components/ChatPanel";

interface HighlightDetail {
  id: number;
  text: string;
  book: { title: string; author: string };
  location: string | null;
  clippedAt: string | null;
  createdAt: string;
  deeperInsight: string | null;
  chatMessages: { id: number; role: string; content: string; createdAt: string }[];
}

export default function HighlightDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery<HighlightDetail>({
    queryKey: ["highlight", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/highlights/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch highlight");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load highlight.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    // On desktop: fixed-height grid so the right sidebar fills exactly the available space.
    // h-[calc(100vh-5rem)] = viewport minus navbar (h-14=3.5rem) + main padding-top (py-6=1.5rem).
    <div className="flex flex-col gap-6 py-4 lg:grid lg:grid-cols-[1fr_420px] lg:gap-6 lg:py-0 lg:h-[calc(100vh-5rem)]">

      {/* Left column — scrollable on desktop */}
      <div className="flex flex-col gap-6 lg:overflow-y-auto lg:py-4">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/highlights">
              <ArrowLeft className="size-4" />
              Back to highlights
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{data.book.title}</Badge>
              <span className="text-sm text-muted-foreground">{data.book.author}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <blockquote className="border-l-4 border-primary/30 pl-4 text-lg leading-relaxed">
              {data.text}
            </blockquote>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {data.location && <span>Location: {data.location}</span>}
              {data.clippedAt && (
                <span>Clipped: {new Date(data.clippedAt).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <DeeperInsight
          highlightId={data.id}
          existingInsight={data.deeperInsight}
        />

        {/* Chat shown inline on mobile only */}
        <div className="lg:hidden">
          <ChatPanel
            highlightId={data.id}
            initialMessages={data.chatMessages ?? []}
          />
        </div>
      </div>

      {/* Right column — chat sidebar, visible on desktop only */}
      <div className="hidden lg:flex lg:flex-col lg:py-4 lg:overflow-hidden">
        <ChatPanel
          highlightId={data.id}
          initialMessages={data.chatMessages ?? []}
          sidebar
        />
      </div>
    </div>
  );
}
