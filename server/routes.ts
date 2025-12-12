import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  vertexai: false,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  }
});

async function downloadAudioFromYouTube(videoId: string): Promise<Buffer> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const tempDir = os.tmpdir();
  const outputPath = path.join(tempDir, `${videoId}.mp3`);
  
  try {
    // Use yt-dlp to download audio
    await execAsync(`yt-dlp -x --audio-format mp3 --audio-quality 9 -o "${outputPath}" "${url}"`, {
      timeout: 120000 // 2 minute timeout
    });
    
    const audioBuffer = await fs.promises.readFile(outputPath);
    
    // Clean up temp file
    await fs.promises.unlink(outputPath).catch(() => {});
    
    return audioBuffer;
  } catch (error: any) {
    // Clean up on error
    await fs.promises.unlink(outputPath).catch(() => {});
    throw new Error(`Error descargando audio: ${error.message}`);
  }
}

async function transcribeWithGemini(audioBuffer: Buffer): Promise<string> {
  const base64Audio = audioBuffer.toString('base64');
  
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "audio/mpeg",
              data: base64Audio
            }
          },
          {
            text: "Please transcribe this audio completely. Return only the transcription text, nothing else."
          }
        ]
      }
    ]
  });
  
  const text = result.response?.text?.() || result.text || "";
  return text;
}

function parseTranscriptToSegments(text: string): Array<{ text: string; start: number; duration: number }> {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map((sentence, index) => ({
    text: sentence.trim(),
    start: index * 5,
    duration: 5
  }));
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // POST /api/transcribe - Get YouTube transcript
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const videoId = extractVideoId(url);
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      // Check if we already have this transcript cached
      const cached = await storage.getTranscriptByVideoId(videoId);
      if (cached) {
        return res.json(cached);
      }

      // Try to get subtitles first (free and fast)
      let segments: Array<{ text: string; start: number; duration: number }> = [];
      let usedAI = false;
      
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptData && transcriptData.length > 0) {
          segments = transcriptData.map((item: any) => ({
            text: item.text,
            start: item.offset / 1000,
            duration: item.duration / 1000
          }));
          console.log("Got transcript from YouTube subtitles");
        }
      } catch (fetchError: any) {
        console.log("No subtitles available, will use AI transcription:", fetchError.message);
      }
      
      // If no subtitles, use Gemini AI to transcribe
      if (segments.length === 0) {
        console.log("Downloading audio for AI transcription...");
        try {
          const audioBuffer = await downloadAudioFromYouTube(videoId);
          console.log(`Downloaded audio: ${audioBuffer.length} bytes`);
          
          const transcriptText = await transcribeWithGemini(audioBuffer);
          console.log("AI transcription complete");
          
          if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error("No se pudo transcribir el audio del video.");
          }
          
          segments = parseTranscriptToSegments(transcriptText);
          usedAI = true;
        } catch (aiError: any) {
          console.error("AI transcription error:", aiError);
          throw new Error("No se pudo transcribir el video. " + (aiError.message || ""));
        }
      }

      // Store in database
      const transcript = await storage.insertTranscript({
        youtubeUrl: url,
        videoId,
        title: null,
        channel: null,
        transcript: segments,
      });

      res.json(transcript);
    } catch (error: any) {
      console.error("Transcribe error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe video" });
    }
  });

  // POST /api/chat - Chat with AI about transcript
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, transcriptContext } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Prepare system prompt with transcript context
      const systemMessage = {
        role: 'system',
        content: `You are a helpful AI assistant analyzing a video transcript. 
        Here is the transcript of the video:
        "${transcriptContext || ''}"
        
        Answer the user's questions based primarily on this transcript. If the answer is not in the transcript, say so.`
      };

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

      res.json({ content });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to get chat response" });
    }
  });

  // POST /api/tools/generate - Generate content using AI
  app.post("/api/tools/generate", async (req, res) => {
    try {
      const { type, transcriptContext } = req.body;

      if (!type || !transcriptContext) {
        return res.status(400).json({ error: "Type and transcript context are required" });
      }

      let systemPrompt = "";
      switch (type) {
        case "blog":
          systemPrompt = "Convert the following video transcript into a well-structured, SEO-friendly blog post with headings, paragraphs, and a conclusion:";
          break;
        case "social":
          systemPrompt = "Create an engaging Twitter/X thread (10-15 tweets) from this video transcript. Make it viral-worthy with hooks and key insights:";
          break;
        case "action-items":
          systemPrompt = "Extract all actionable items, tasks, and recommendations from this video transcript as a numbered checklist:";
          break;
        case "quiz":
          systemPrompt = "Create a 10-question multiple-choice quiz based on this video transcript. Include 4 options per question and mark the correct answer:";
          break;
        case "flashcards":
          systemPrompt = "Generate 15 Anki-style flashcards from this video transcript. Format as 'Q: [question] | A: [answer]':";
          break;
        default:
          return res.status(400).json({ error: "Invalid type" });
      }

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: transcriptContext
            }
          ],
          temperature: 0.8,
          max_tokens: 2048,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "Sorry, I couldn't generate content.";

      res.json({ content });
    } catch (error: any) {
      console.error("Tool generate error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  return httpServer;
}
