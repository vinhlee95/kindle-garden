"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HighlightCardProps {
  id: number;
  text: string;
  bookTitle: string;
  author: string;
  location?: string | null;
}

export function HighlightCard({
  id,
  text,
  bookTitle,
  author,
  location,
}: HighlightCardProps) {
  const truncated = text.length > 200 ? text.slice(0, 200) + "..." : text;

  return (
    <Link href={`/highlights/${id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed">{truncated}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {bookTitle}
          </Badge>
          <span>{author}</span>
          {location && <span>Loc. {location}</span>}
        </CardFooter>
      </Card>
    </Link>
  );
}
