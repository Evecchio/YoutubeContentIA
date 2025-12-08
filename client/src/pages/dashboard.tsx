import { Link, useRoute } from "wouter";
import { ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";
import { TranscriptView } from "@/components/transcript-view";
import { ChatInterface } from "@/components/chat-interface";
import { ToolsView } from "@/components/tools-view";
import { useState, useEffect } from "react";
import type { TranscriptResponse } from "@/lib/api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("transcript");
  const [match, params] = useRoute("/watch/:id");
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);

  useEffect(() => {
    // Load transcript from sessionStorage
    const stored = sessionStorage.getItem('currentTranscript');
    if (stored) {
      try {
        setTranscriptData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse transcript data');
      }
    }
  }, []);

  if (!transcriptData) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Loading transcript...</p>
          <Link href="/">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const transcriptText = transcriptData.transcript.map(s => s.text).join(' ');

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Nav */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md hidden sm:block">
            {transcriptData.title || 'YouTube Video'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Video */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full">
            <VideoPlayer videoId={transcriptData.videoId} />
          </div>
          <div className="space-y-2 px-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{transcriptData.title || 'YouTube Video'}</h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              {transcriptData.channel ? `By ${transcriptData.channel}` : 'Transcript available below'}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400 pt-2">
              <span>{transcriptData.transcript.length} segments</span>
            </div>
          </div>
        </div>

        {/* Right Col: Tabs (Transcript/Chat/Tools) */}
        <div className="lg:col-span-5 h-[600px] lg:h-[calc(100vh-140px)] min-h-[500px]">
          <Tabs defaultValue="transcript" className="h-full flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger 
                value="transcript"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                data-testid="tab-transcript"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                data-testid="tab-chat"
              >
                AI Chat
              </TabsTrigger>
              <TabsTrigger 
                value="tools"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                data-testid="tab-tools"
              >
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="flex-1 mt-0 h-full min-h-0">
              <TranscriptView className="h-full" segments={transcriptData.transcript} />
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 mt-0 h-full min-h-0">
              <ChatInterface className="h-full" transcriptText={transcriptText} />
            </TabsContent>

            <TabsContent value="tools" className="flex-1 mt-0 h-full min-h-0">
              <ToolsView transcriptText={transcriptText} />
            </TabsContent>
          </Tabs>
        </div>

      </main>
    </div>
  );
}
