import { NextRequest, NextResponse } from "next/server";
import { getHighlightById, saveDeeperInsight } from "@/lib/db/queries";
import { generateCompletion } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { highlightId } = await request.json();

    if (!highlightId) {
      return NextResponse.json(
        { error: "highlightId is required" },
        { status: 400 }
      );
    }

    const highlight = getHighlightById(highlightId);
    if (!highlight) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Return cached insight if available
    if (highlight.deeperInsight) {
      return NextResponse.json({ insight: highlight.deeperInsight });
    }

    const prompt = `You are a thoughtful literary analyst. Given the following highlight from "${highlight.book.title}" by ${highlight.book.author}, provide a deeper insight that helps the reader understand its significance, context, and how it connects to broader themes. Be concise but insightful (2-3 paragraphs).

Highlight: "${highlight.text}"`;

    const insight = await generateCompletion([
      { role: "user", content: prompt },
    ]);

    saveDeeperInsight(highlightId, insight as string);

    return NextResponse.json({ insight });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate insight";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
