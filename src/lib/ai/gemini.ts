import { GoogleGenAI } from "@google/genai";

// Using 'gemini-1.5-pro' as the current production standard.
const GEMINI_MODEL_ID = "gemini-1.5-pro";

// Helper to get client (assumes validation happened previously or handles error)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export async function summarizeTaskText(input: {
  title: string;
  description?: string | null;
}): Promise<string> {
  const ai = getAiClient();

  const taskContent = input.description?.trim()
    ? `Title: ${input.title}\nDescription: ${input.description}`
    : `Title: ${input.title}`;

  const prompt = `Summarize the following task in 2-3 concise, professional sentences. Do not use bullet points.\n\n${taskContent}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini summarization failed:", error);
    throw new Error("Failed to generate task summary");
  }
}

// New helper for RAG
export async function answerFromNotes(
  question: string,
  notes: {
    id: string;
    content: string;
    is_technical: boolean;
    created_at: string;
  }[],
): Promise<string> {
  const ai = getAiClient();

  if (notes.length === 0) {
    return "I couldn't find any relevant notes to answer your question.";
  }

  // Build Context
  const notesContext = notes
    .map(
      (n, i) =>
        `Note ${i + 1} [${n.is_technical ? "Technical" : "General"} - ${n.created_at.split("T")[0]}]:\n${n.content}`,
    )
    .join("\n\n");

  const prompt = `
You are a helpful assistant for an internal dashboard.
Answer the user's question based ONLY on the provided notes below.
If the notes do not contain enough information to answer the question, state that clearly.
Do not make up information.

User Question: "${question}"

---
Available Notes:
${notesContext}
---
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "No answer generated.";
  } catch (error) {
    console.error("Gemini Q&A failed:", error);
    throw new Error("Failed to generate answer from AI");
  }
}
