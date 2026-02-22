import { NextResponse } from "next/server";
import { getReviewCards } from "@/lib/db/queries";

export async function GET() {
  const cards = getReviewCards(3);
  return NextResponse.json(cards);
}
