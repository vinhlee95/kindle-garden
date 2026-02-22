import { NextResponse } from "next/server";
import { getAllBooks } from "@/lib/db/queries";

export async function GET() {
  const books = await getAllBooks();
  return NextResponse.json(books);
}
