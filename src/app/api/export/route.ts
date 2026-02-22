import { NextRequest } from "next/server";
import { getHighlightsForExport } from "@/lib/db/queries";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookId = searchParams.get("bookId");

  const highlights = await getHighlightsForExport(
    bookId ? parseInt(bookId, 10) : undefined
  );

  const lines = highlights.map((h) => {
    const front = h.text.replace(/\t/g, " ").replace(/\n/g, " ");
    const back = `${h.book.title} — ${h.book.author}`;
    const tag = slugify(h.book.title);
    return `${front}\t${back}\t${tag}`;
  });

  const tsv = lines.join("\n");

  return new Response(tsv, {
    headers: {
      "Content-Type": "text/tab-separated-values",
      "Content-Disposition": 'attachment; filename="highlights-anki.tsv"',
    },
  });
}
