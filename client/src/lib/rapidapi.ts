export interface TranscriptionResponse {
  transcript: Array<{
    text: string;
    start: number;
    duration: number;
  }>;
  metadata?: {
    title: string;
    channel: string;
  };
}

const RAPID_API_KEY = "e7af164b48msh84a8a9c76445098p151240jsn9e20d177c9ea";
const RAPID_API_HOST = "youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com";

export async function transcribeUrl(url: string): Promise<TranscriptionResponse> {
  const response = await fetch(`https://${RAPID_API_HOST}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': RAPID_API_HOST,
      'x-rapidapi-key': RAPID_API_KEY
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
