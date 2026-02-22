import { NextResponse } from "next/server";
import { getAllBooks } from "@/lib/db/queries";

export async function GET() {
  const books = getAllBooks();
  return NextResponse.json(books);
}
