import type { TranscriptResponse } from "./api";

export const DEMO_TRANSCRIPT: TranscriptResponse = {
  id: "demo-123",
  youtubeUrl: "https://youtube.com/watch?v=demo",
  videoId: "dQw4w9WgXcQ",
  title: "The Future of AI: How to Prepare Your Workflow",
  channel: "Tech Insights",
  transcript: [
    { text: "Welcome back to the channel.", start: 0, duration: 3 },
    { text: "Today we're going to talk about the future of artificial intelligence and how it's reshaping our daily workflows.", start: 3, duration: 8 },
    { text: "Many people worry that AI is going to replace jobs, but I think the more interesting perspective is how it will augment human creativity.", start: 11, duration: 10 },
    { text: "Let's look at a few examples.", start: 21, duration: 3 },
    { text: "First, coding. Copilots aren't writing the whole app for you, but they are removing the tedious boilerplate.", start: 24, duration: 8 },
    { text: "Second, design. Tools like Midjourney allow us to iterate on concepts in seconds rather than hours.", start: 32, duration: 8 },
    { text: "But the real unlock comes when you combine these tools.", start: 40, duration: 5 },
    { text: "Imagine a workflow where you sketch an idea, AI generates the assets, and another AI writes the glue code.", start: 45, duration: 10 },
    { text: "We are moving from a world of 'creation' to a world of 'curation'. The skill of the future is taste.", start: 55, duration: 10 },
    { text: "So, how do you prepare for this? Start by learning the limitations of these models.", start: 65, duration: 8 },
    { text: "They hallucinate. They struggle with context.", start: 73, duration: 5 },
    { text: "In this video, I'll show you my personal stack for AI-assisted productivity.", start: 78, duration: 8 },
  ],
  createdAt: new Date().toISOString(),
};
