export interface TranscriptionResponse {
  text: string;
  language: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

const RAPID_API_KEY = "e7af164b48msh84a8a9c76445098p151240jsn9e20d177c9ea";
const RAPID_API_HOST = "speech-to-text-ai.p.rapidapi.com";

export async function transcribeUrl(url: string): Promise<TranscriptionResponse> {
  const encodedUrl = encodeURIComponent(url);
  const response = await fetch(`https://${RAPID_API_HOST}/transcribe?url=${encodedUrl}&lang=en&task=transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': RAPID_API_HOST,
      'x-rapidapi-key': RAPID_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
