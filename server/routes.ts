import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { AssemblyAI } from "assemblyai";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || "";

async function transcribeWithAssemblyAI(videoId: string): Promise<string> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("Se requiere una API key de AssemblyAI para transcribir videos sin subtítulos. Regístrate gratis en assemblyai.com para obtener $50 en créditos.");
  }
  
  const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const transcript = await client.transcripts.transcribe({
    audio_url: youtubeUrl,
    speech_model: "nano" as any
  });
  
  if (transcript.status === "error") {
    throw new Error(transcript.error || "Error en la transcripción con AssemblyAI");
  }
  
  return transcript.text || "";
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
      
      // If no subtitles, use AssemblyAI to transcribe
      if (segments.length === 0) {
        console.log("Using AssemblyAI for transcription...");
        try {
          const transcriptText = await transcribeWithAssemblyAI(videoId);
          console.log("AI transcription complete");
          
          if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error("No se pudo transcribir el audio del video.");
          }
          
          segments = parseTranscriptToSegments(transcriptText);
          usedAI = true;
        } catch (aiError: any) {
          console.error("AI transcription error:", aiError);
          throw new Error(aiError.message || "No se pudo transcribir el video.");
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
