import { db } from "./db";
import { transcripts, type InsertTranscript, type Transcript } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTranscriptByUrl(url: string): Promise<Transcript | undefined>;
  getTranscriptByVideoId(videoId: string): Promise<Transcript | undefined>;
  insertTranscript(transcript: InsertTranscript): Promise<Transcript>;
}

class Storage implements IStorage {
  async getTranscriptByUrl(url: string): Promise<Transcript | undefined> {
    const result = await db.select().from(transcripts).where(eq(transcripts.youtubeUrl, url));
    return result[0];
  }

  async getTranscriptByVideoId(videoId: string): Promise<Transcript | undefined> {
    const result = await db.select().from(transcripts).where(eq(transcripts.videoId, videoId));
    return result[0];
  }

  async insertTranscript(transcript: InsertTranscript): Promise<Transcript> {
    const result = await db.insert(transcripts).values(transcript).returning();
    return result[0];
  }
}

export const storage = new Storage();
