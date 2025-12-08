import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Languages, Share2, ListChecks, PenTool, Wand2 } from "lucide-react";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}

function ToolCard({ icon, title, description, badge, onClick }: ToolCardProps) {
  return (
    <Card className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
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

export function ToolsView() {
  return (
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
              badge="GPT-4"
            />
            <ToolCard 
              icon={<Share2 className="w-5 h-5" />}
              title="Social Media Thread"
              description="Generate a viral Twitter/X thread or LinkedIn post from the key points."
            />
            <ToolCard 
              icon={<ListChecks className="w-5 h-5" />}
              title="Action Items"
              description="Extract a checklist of tasks and action items mentioned in the video."
            />
            <ToolCard 
              icon={<Languages className="w-5 h-5" />}
              title="Translate"
              description="Translate the transcript into 30+ languages instantly."
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
            />
            <ToolCard 
              icon={<Wand2 className="w-5 h-5" />}
              title="Flashcards"
              description="Generate Anki-style flashcards for key concepts."
              badge="Beta"
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
