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

    const highlight = await getHighlightById(highlightId);
    if (!highlight) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Return cached insight if available
    if (highlight.deeperInsight) {
      return NextResponse.json({ insight: highlight.deeperInsight });
    }

    const prompt = `You are a thought-provoking literary analyst who writes in a gen-z style — playful, relatable, and never boring. Use words like "lowkey", "no cap", "fr", "hits different", etc. naturally where they fit, but don't force them.

Given the following highlight from "${highlight.book.title}" by ${highlight.book.author}, dig into the "why" behind it. Output valid Markdown in this structure:

1. **First paragraph**: A bold summary that captures the core insight in a punchy way.
2. **Up to 3 additional paragraphs**: Each digs deeper into the significance, context, or broader themes. Keep each paragraph short and concise — no more than 5 sentences.

Focus on making the reader think, not just understand. Be concise — 1 summary paragraph + max 3 additional paragraphs total.

Highlight: "${highlight.text}"`;

    const insight = await generateCompletion([
      { role: "user", content: prompt },
    ]);

    await saveDeeperInsight(highlightId, insight as string);

    return NextResponse.json({ insight });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate insight";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
