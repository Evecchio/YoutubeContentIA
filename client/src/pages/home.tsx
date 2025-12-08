import { Video, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState("");
  const [_, setLocation] = useLocation();

  const handleTranscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // In a real app we'd validate the ID
      setLocation("/watch/demo");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full z-10 space-y-12 text-center"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Video Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Turn Video into <br/>
            <span className="text-primary">Actionable Knowledge</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get instant transcripts, summaries, and chat with any YouTube video. 
            Perfect for students, researchers, and content creators.
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-indigo-500/10 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-2 md:p-3">
            <form onSubmit={handleTranscribe} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Video className="w-5 h-5" />
                </div>
                <Input 
                  placeholder="Paste YouTube URL here..." 
                  className="pl-10 h-12 md:h-14 text-base border-transparent bg-transparent shadow-none focus-visible:ring-0"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  data-testid="input-url"
                />
              </div>
              <Button size="lg" className="h-12 md:h-14 px-8 text-base font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" data-testid="button-transcribe">
                Transcribe Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Video className="w-6 h-6 text-primary" />}
            title="Instant Transcription"
            description="Get accurate text from any video in seconds using Whisper AI technology."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-6 h-6 text-primary" />}
            title="Chat with Video"
            description="Ask questions and get answers based on the video's specific content."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-primary" />}
            title="Smart Summaries"
            description="Generate concise summaries and key takeaways automatically."
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
