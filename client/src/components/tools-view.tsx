import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Languages, Share2, ListChecks, PenTool, Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateContent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ToolsViewProps {
  transcriptText: string;
}

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function ToolCard({ icon, title, description, badge, onClick, isLoading }: ToolCardProps) {
  return (
    <Card 
      className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer relative" 
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            {icon}
          </div>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-sm text-slate-500 leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function ToolsView({ transcriptText }: ToolsViewProps) {
  const [generatedContent, setGeneratedContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (type: 'blog' | 'social' | 'action-items' | 'quiz' | 'flashcards', title: string) => {
    setLoadingTool(type);
    try {
      const content = await generateContent(type, transcriptText);
      setGeneratedContent(content);
      setDialogTitle(title);
      setDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setLoadingTool(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <>
      <ScrollArea className="h-full custom-scrollbar">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Content Generation</h3>
            <p className="text-sm text-slate-500 mb-4">Use AI to repurpose this video into other formats.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToolCard 
                icon={<FileText className="w-5 h-5" />}
                title="Blog Post"
                description="Convert the transcript into a structured, SEO-friendly blog post."
                badge="Groq"
                onClick={() => handleGenerate('blog', 'Generated Blog Post')}
                isLoading={loadingTool === 'blog'}
              />
              <ToolCard 
                icon={<Share2 className="w-5 h-5" />}
                title="Social Media Thread"
                description="Generate a viral Twitter/X thread or LinkedIn post from the key points."
                onClick={() => handleGenerate('social', 'Social Media Thread')}
                isLoading={loadingTool === 'social'}
              />
              <ToolCard 
                icon={<ListChecks className="w-5 h-5" />}
                title="Action Items"
                description="Extract a checklist of tasks and action items mentioned in the video."
                onClick={() => handleGenerate('action-items', 'Action Items Checklist')}
                isLoading={loadingTool === 'action-items'}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Study Aids</h3>
            <p className="text-sm text-slate-500 mb-4">Tools to help you learn and retain information.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToolCard 
                icon={<PenTool className="w-5 h-5" />}
                title="Generate Quiz"
                description="Create a multiple-choice quiz to test your knowledge of the content."
                onClick={() => handleGenerate('quiz', 'Knowledge Quiz')}
                isLoading={loadingTool === 'quiz'}
              />
              <ToolCard 
                icon={<Wand2 className="w-5 h-5" />}
                title="Flashcards"
                description="Generate Anki-style flashcards for key concepts."
                badge="Beta"
                onClick={() => handleGenerate('flashcards', 'Study Flashcards')}
                isLoading={loadingTool === 'flashcards'}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>Generated using AI from the video transcript</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
              {generatedContent}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={copyToClipboard} data-testid="button-copy-generated">
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
