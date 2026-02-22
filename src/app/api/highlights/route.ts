import { NextRequest, NextResponse } from "next/server";
import { getHighlights, upsertBook, upsertHighlight } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const bookId = searchParams.get("bookId");

  const result = getHighlights(
    bookId ? parseInt(bookId, 10) : undefined,
    page,
    limit
  );

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body must be an array of highlights" },
        { status: 400 }
      );
    }

    let imported = 0;

    for (const item of body) {
      const { title, author, text, location, clippedAt } = item;
      if (!title || !author || !text) continue;

      const book = upsertBook(title, author);
      upsertHighlight(book.id, text, location || null, clippedAt || null);
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
