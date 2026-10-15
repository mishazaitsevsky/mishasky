import Anthropic from "@anthropic-ai/sdk";
import { MISHA_SYSTEM_PROMPT } from "@/lib/mishaContext";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: MISHA_SYSTEM_PROMPT,
      messages: [{ role: "user", content: question.trim() }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return Response.json({ response: text });
  } catch (err) {
    console.error("/api/chat error:", err);
    return Response.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
