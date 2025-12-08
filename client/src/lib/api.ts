export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResponse {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string | null;
  channel: string | null;
  transcript: TranscriptSegment[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function transcribeVideo(url: string): Promise<TranscriptResponse> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to transcribe' }));
    throw new Error(error.error || 'Failed to transcribe video');
  }

  return response.json();
}

export async function sendChatMessage(
  messages: ChatMessage[],
  transcriptContext: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, transcriptContext }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get response' }));
    throw new Error(error.error || 'Failed to get chat response');
  }

  const data = await response.json();
  return data.content;
}

export async function generateContent(
  type: 'blog' | 'social' | 'action-items' | 'quiz' | 'flashcards',
  transcriptContext: string
): Promise<string> {
  const response = await fetch('/api/tools/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, transcriptContext }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate' }));
    throw new Error(error.error || 'Failed to generate content');
  }

  const data = await response.json();
  return data.content;
}
