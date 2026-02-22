export interface Book {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

export interface Highlight {
  id: number;
  bookId: number;
  text: string;
  location: string | null;
  clippedAt: string | null;
  createdAt: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string | null;
  deeperInsight: string | null;
}

export interface HighlightWithBook extends Highlight {
  book: Book;
}

export interface ChatMessage {
  id: number;
  highlightId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface ReviewCard extends HighlightWithBook {
  chatMessages?: ChatMessage[];
}

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

export type Grade = 1 | 2 | 3 | 4 | 5;
