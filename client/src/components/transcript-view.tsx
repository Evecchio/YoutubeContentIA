import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Download, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TranscriptSegment } from "@/lib/api";

interface TranscriptViewProps {
  className?: string;
  segments: TranscriptSegment[];
}

export function TranscriptView({ className, segments }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const activeSegmentId = 0; // Could track current playing segment

  const filteredSegments = segments.filter(seg => 
    searchQuery ? seg.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleCopy = () => {
    const fullText = segments.map(s => s.text).join(' ');
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Copied!",
      description: "Transcript copied to clipboard",
    });
  };

  const handleDownload = () => {
    const fullText = segments.map(s => s.text).join('\n\n');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Transcript saved as transcript.txt",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search transcript..." 
            className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-transcript"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={handleCopy} data-testid="button-copy-transcript">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={handleDownload} data-testid="button-download-transcript">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-1">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No matches found
            </div>
          ) : (
            filteredSegments.map((segment, index) => (
              <div 
                key={index}
                className={cn(
                  "group flex gap-4 p-3 rounded-lg transition-colors duration-200 cursor-pointer",
                  index === activeSegmentId 
                    ? "bg-primary/5 ring-1 ring-primary/20" 
                    : "hover:bg-slate-50"
                )}
                data-testid={`transcript-segment-${index}`}
              >
                <span className={cn(
                  "text-xs font-mono font-medium pt-1 min-w-[40px]",
                  index === activeSegmentId ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {formatTime(segment.start)}
                </span>
                <p className={cn(
                  "text-sm leading-relaxed",
                  index === activeSegmentId ? "text-slate-900 font-medium" : "text-slate-600"
                )}>
                  {segment.text}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
