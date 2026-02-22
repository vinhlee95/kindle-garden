import { NextResponse } from "next/server";
import { getReviewCards } from "@/lib/db/queries";

export async function GET() {
  const cards = await getReviewCards(3);
  return NextResponse.json(cards);
}
