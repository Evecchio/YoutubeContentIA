export interface TranscriptSegment {
  id: number;
  time: string;
  seconds: number;
  text: string;
}

export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 1, time: "0:00", seconds: 0, text: "Welcome back to the channel. Today we're going to talk about the future of artificial intelligence and how it's reshaping our daily workflows." },
  { id: 2, time: "0:08", seconds: 8, text: "Many people worry that AI is going to replace jobs, but I think the more interesting perspective is how it will augment human creativity." },
  { id: 3, time: "0:15", seconds: 15, text: "Let's look at a few examples. First, coding. Copilots aren't writing the whole app for you, but they are removing the tedious boilerplate." },
  { id: 4, time: "0:24", seconds: 24, text: "Second, design. Tools like Midjourney allow us to iterate on concepts in seconds rather than hours." },
  { id: 5, time: "0:32", seconds: 32, text: "But the real unlock comes when you combine these tools. Imagine a workflow where you sketch an idea, AI generates the assets, and another AI writes the glue code." },
  { id: 6, time: "0:45", seconds: 45, text: "We are moving from a world of 'creation' to a world of 'curation'. The skill of the future is taste." },
  { id: 7, time: "0:55", seconds: 55, text: "So, how do you prepare for this? Start by learning the limitations of these models. They hallucinate. They struggle with context." },
  { id: 8, time: "1:05", seconds: 65, text: "In this video, I'll show you my personal stack for AI-assisted productivity." },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi! I've analyzed the video. You can ask me anything about the content, like 'What are the main takeaways?' or 'Summarize the section on coding'.",
    timestamp: new Date()
  }
];
