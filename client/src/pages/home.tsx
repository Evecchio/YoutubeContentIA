import { Video, Sparkles, MessageSquare, ArrowRight, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { transcribeVideo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DEMO_TRANSCRIPT } from "@/lib/demoData";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const data = await transcribeVideo(url);
      sessionStorage.setItem('currentTranscript', JSON.stringify(data));
      setLocation(`/watch/${data.videoId}`);
    } catch (error: any) {
      toast({
        title: "API Limit Reached",
        description: "Try the demo instead to explore all features!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryDemo = () => {
    sessionStorage.setItem('currentTranscript', JSON.stringify(DEMO_TRANSCRIPT));
    setLocation(`/watch/demo`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
                  disabled={isLoading}
                />
              </div>
              <Button 
                size="lg" 
                className="h-12 md:h-14 px-8 text-base font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all min-w-[160px]" 
                data-testid="button-transcribe"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    Transcribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-3 flex justify-center">
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={handleTryDemo}
                className="text-slate-500 hover:text-primary"
                data-testid="button-try-demo"
              >
                <Play className="w-4 h-4 mr-2" />
                Try Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            icon={<Video className="w-6 h-6 text-primary" />}
            title="Instant Transcription"
            description="Get accurate text from any video in seconds using AI technology."
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
