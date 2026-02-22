import { NextRequest, NextResponse } from "next/server";
import { getHighlightById, updateHighlightReview } from "@/lib/db/queries";
import { sm2 } from "@/lib/sm2";
import type { Grade } from "@/lib/sm2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const highlight = await getHighlightById(parseInt(id, 10));

  if (!highlight) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(highlight);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const highlightId = parseInt(id, 10);
    const body = await request.json();
    const grade = body.grade as Grade;

    if (!grade || grade < 1 || grade > 5) {
      return NextResponse.json(
        { error: "Grade must be between 1 and 5" },
        { status: 400 }
      );
    }

    const highlight = await getHighlightById(highlightId);
    if (!highlight) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newState = sm2(
      {
        easeFactor: highlight.easeFactor,
        interval: highlight.interval,
        repetitions: highlight.repetitions,
        nextReview: highlight.nextReview || new Date().toISOString().split("T")[0],
      },
      grade
    );

    await updateHighlightReview(highlightId, newState);

    return NextResponse.json({ success: true, ...newState });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
