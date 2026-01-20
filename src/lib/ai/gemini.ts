import { GoogleGenAI } from "@google/genai";

// Using 'gemini-1.5-pro' as the current production standard.
// Change to 'gemini-3-pro' when available/applicable.
const GEMINI_MODEL_ID = "gemini-1.5-pro";

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

  const prompt = `Summarize the following task in 2-3 concise, professional sentences. Do not use bullet points.\n\n${taskContent}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // The @google/genai SDK provides the text directly on the response object
    const summary = response.text?.trim();

    if (!summary) {
      throw new Error("Gemini returned empty summary");
    }

    return summary;
  } catch (error) {
    // Rethrow with a clean message for the UI/Service layer
    console.error("Gemini summarization failed:", error);
    throw new Error("Failed to generate task summary");
  }
}
