import { GoogleGenAI } from "@google/genai";

// Using 'gemini-1.5-pro' as the current production standard.
// Change to 'gemini-3-pro' when available/applicable.
const GEMINI_MODEL_ID = "gemini-2.0-flash";

export async function summarizeTaskText(input: {
  title: string;
  description?: string | null;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });

  const taskContent = input.description?.trim()
    ? `Title: ${input.title}\nDescription: ${input.description}`
    : `Title: ${input.title}`;

  const prompt = `
You are helping inside an internal task manager.
Write a concise summary in 2 sentences max.
No bullet points. No extra advice. No titles.
Focus only on what the task is and what "done" means.

Task:
${taskContent}
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // The @google/genai SDK provides the text directly on the response object
    const summary = (response.text ?? "").trim();

    if (!summary) {
      throw new Error("EMPTY_GEMINI_RESPONSE");
    }

    return summary;
  } catch (error) {
    // Rethrow with a clean message for the UI/Service layer
    console.error("Gemini summarization failed", {
      error,
      model: GEMINI_MODEL_ID,
      promptPreview: prompt.slice(0, 120),
    });

    throw new Error("AI processing failed");
  }
}
