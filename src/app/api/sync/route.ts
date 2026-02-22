import { NextResponse } from "next/server";
import { fetchKindleHighlights } from "@/lib/kindle";
import { upsertBook, upsertHighlight } from "@/lib/db/queries";

export async function POST() {
  try {
    const data = await fetchKindleHighlights();

    let booksCount = 0;
    let highlightsCount = 0;

    for (const kindleBook of data.books) {
      const book = await upsertBook(kindleBook.title, kindleBook.author);
      booksCount++;

      for (const h of kindleBook.highlights) {
        await upsertHighlight(book.id, h.text, h.location, h.date);
        highlightsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      books: booksCount,
      highlights: highlightsCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
