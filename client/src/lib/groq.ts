const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getGroqChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}
