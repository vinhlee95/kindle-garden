import { NextRequest } from "next/server";
import {
  getHighlightById,
  getChatMessages,
  saveChatMessage,
} from "@/lib/db/queries";
import { generateCompletion } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { highlightId, message } = await request.json();

    if (!highlightId || !message) {
      return new Response(
        JSON.stringify({ error: "highlightId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const highlight = getHighlightById(highlightId);
    if (!highlight) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message
    saveChatMessage(highlightId, "user", message);

    // Build conversation history
    const history = getChatMessages(highlightId);
    const systemPrompt = `You are a knowledgeable reading companion. The user is discussing a highlight from "${highlight.book.title}" by ${highlight.book.author}. The highlight is: "${highlight.text}". Help the user explore and understand this passage more deeply. Be conversational, insightful, and concise.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Stream the response
    const streamRes = await generateCompletion(messages, { stream: true });

    if (!(streamRes instanceof Response)) {
      throw new Error("Expected streaming response");
    }

    const reader = streamRes.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    let fullContent = "";
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let rawBuffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            rawBuffer += decoder.decode(value, { stream: true });
            const lines = rawBuffer.split("\n");
            rawBuffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // skip unparseable chunks
              }
            }
          }

          // Save assistant message after streaming completes
          if (fullContent) {
            saveChatMessage(highlightId, "assistant", fullContent);
          }

          controller.enqueue(
            new TextEncoder().encode("data: [DONE]\n\n")
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to chat";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
