const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateCompletion(
  messages: { role: string; content: string }[],
  options?: { stream?: boolean }
) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
      messages,
      stream: options?.stream ?? false,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);

  if (options?.stream) return res;

  const data = await res.json();
  return data.choices[0].message.content;
}
