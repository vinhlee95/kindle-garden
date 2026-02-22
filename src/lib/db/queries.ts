import { db } from "./index";
import { books, highlights, chatMessages } from "./schema";
import { eq, and, lte, count } from "drizzle-orm";
import type { SM2State } from "@/lib/sm2";

export async function upsertBook(title: string, author: string) {
  const existing = await db
    .select()
    .from(books)
    .where(and(eq(books.title, title), eq(books.author, author)))
    .get();

  if (existing) return existing;

  return (await db.insert(books).values({ title, author }).returning().get())!;
}

export async function upsertHighlight(
  bookId: number,
  text: string,
  location: string | null,
  clippedAt: string | null
) {
  const existing = await db
    .select()
    .from(highlights)
    .where(and(eq(highlights.bookId, bookId), eq(highlights.text, text)))
    .get();

  if (existing) return existing;

  const today = new Date().toISOString().split("T")[0];
  return (await db
    .insert(highlights)
    .values({ bookId, text, location, clippedAt, nextReview: today })
    .returning()
    .get())!;
}

export async function getHighlights(bookId?: number, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const conditions = bookId ? eq(highlights.bookId, bookId) : undefined;

  const rows = await db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(conditions)
    .limit(limit)
    .offset(offset)
    .all();

  const totalResult = await db
    .select({ count: count() })
    .from(highlights)
    .where(conditions)
    .get();

  const total = totalResult?.count ?? 0;

  return {
    highlights: rows.map((r) => ({ ...r.highlight, book: r.book })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getHighlightById(id: number) {
  const row = await db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(eq(highlights.id, id))
    .get();

  if (!row) return null;

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.highlightId, id))
    .all();

  return { ...row.highlight, book: row.book, chatMessages: messages };
}

export async function updateHighlightReview(id: number, state: SM2State) {
  await db.update(highlights)
    .set({
      easeFactor: state.easeFactor,
      interval: state.interval,
      repetitions: state.repetitions,
      nextReview: state.nextReview,
    })
    .where(eq(highlights.id, id))
    .run();
}

export async function getReviewCards(limit = 3) {
  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(lte(highlights.nextReview, today))
    .limit(limit)
    .all();

  return rows.map((r) => ({ ...r.highlight, book: r.book }));
}

export async function saveDeeperInsight(highlightId: number, insight: string) {
  await db.update(highlights)
    .set({ deeperInsight: insight })
    .where(eq(highlights.id, highlightId))
    .run();
}

export async function saveChatMessage(
  highlightId: number,
  role: string,
  content: string
) {
  return (await db
    .insert(chatMessages)
    .values({ highlightId, role, content })
    .returning()
    .get())!;
}

export async function getChatMessages(highlightId: number) {
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.highlightId, highlightId))
    .all();
}

export async function getAllBooks() {
  return await db.select().from(books).all();
}

export async function getHighlightsForExport(bookId?: number) {
  const conditions = bookId ? eq(highlights.bookId, bookId) : undefined;

  const rows = await db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(conditions)
    .all();

  return rows.map((r) => ({ ...r.highlight, book: r.book }));
}
