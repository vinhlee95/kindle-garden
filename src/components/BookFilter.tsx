"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Book {
  id: number;
  title: string;
  author: string;
}

interface BookFilterProps {
  books: Book[];
  value: string;
  onChange: (value: string) => void;
}

export function BookFilter({ books, value, onChange }: BookFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="All books" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All books</SelectItem>
        {books.map((book) => (
          <SelectItem key={book.id} value={String(book.id)}>
            {book.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
