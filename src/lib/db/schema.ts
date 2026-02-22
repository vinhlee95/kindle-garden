import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const books = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("books_title_author_idx").on(table.title, table.author)]
);

export const highlights = sqliteTable(
  "highlights",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id),
    text: text("text").notNull(),
    location: text("location"),
    clippedAt: text("clipped_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    easeFactor: real("ease_factor").notNull().default(2.5),
    interval: integer("interval").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    nextReview: text("next_review"),
    deeperInsight: text("deeper_insight"),
  },
  (table) => [uniqueIndex("highlights_book_text_idx").on(table.bookId, table.text)]
);

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  highlightId: integer("highlight_id")
    .notNull()
    .references(() => highlights.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
