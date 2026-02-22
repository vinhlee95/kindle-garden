import { db } from "./index";
import { books, highlights, chatMessages } from "./schema";
import { eq, and, lte, sql, count } from "drizzle-orm";
import type { SM2State } from "@/lib/sm2";

export function upsertBook(title: string, author: string) {
  const existing = db
    .select()
    .from(books)
    .where(and(eq(books.title, title), eq(books.author, author)))
    .get();

  if (existing) return existing;

  return db.insert(books).values({ title, author }).returning().get();
}

export function upsertHighlight(
  bookId: number,
  text: string,
  location: string | null,
  clippedAt: string | null
) {
  const existing = db
    .select()
    .from(highlights)
    .where(and(eq(highlights.bookId, bookId), eq(highlights.text, text)))
    .get();

  if (existing) return existing;

  const today = new Date().toISOString().split("T")[0];
  return db
    .insert(highlights)
    .values({ bookId, text, location, clippedAt, nextReview: today })
    .returning()
    .get();
}

export function getHighlights(bookId?: number, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const conditions = bookId ? eq(highlights.bookId, bookId) : undefined;

  const rows = db
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

  const totalResult = db
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

export function getHighlightById(id: number) {
  const row = db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(eq(highlights.id, id))
    .get();

  if (!row) return null;

  const messages = db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.highlightId, id))
    .all();

  return { ...row.highlight, book: row.book, chatMessages: messages };
}

export function updateHighlightReview(id: number, state: SM2State) {
  db.update(highlights)
    .set({
      easeFactor: state.easeFactor,
      interval: state.interval,
      repetitions: state.repetitions,
      nextReview: state.nextReview,
    })
    .where(eq(highlights.id, id))
    .run();
}

export function getReviewCards(limit = 3) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(lte(highlights.nextReview, today))
    .limit(limit)
    .all()
    .map((r) => ({ ...r.highlight, book: r.book }));
}

export function saveDeeperInsight(highlightId: number, insight: string) {
  db.update(highlights)
    .set({ deeperInsight: insight })
    .where(eq(highlights.id, highlightId))
    .run();
}

export function saveChatMessage(
  highlightId: number,
  role: string,
  content: string
) {
  return db
    .insert(chatMessages)
    .values({ highlightId, role, content })
    .returning()
    .get();
}

export function getChatMessages(highlightId: number) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.highlightId, highlightId))
    .all();
}

export function getAllBooks() {
  return db.select().from(books).all();
}

export function getHighlightsForExport(bookId?: number) {
  const conditions = bookId ? eq(highlights.bookId, bookId) : undefined;

  return db
    .select({
      highlight: highlights,
      book: books,
    })
    .from(highlights)
    .innerJoin(books, eq(highlights.bookId, books.id))
    .where(conditions)
    .all()
    .map((r) => ({ ...r.highlight, book: r.book }));
}
