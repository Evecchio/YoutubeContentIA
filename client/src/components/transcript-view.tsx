import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MOCK_TRANSCRIPT, TranscriptSegment } from "@/lib/mockData";
import { Search, Download, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TranscriptViewProps {
  className?: string;
}

export function TranscriptView({ className }: TranscriptViewProps) {
  const activeSegmentId = 3; // Mock active state

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search transcript..." 
            className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-primary/20" 
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-1">
          {MOCK_TRANSCRIPT.map((segment) => (
            <div 
              key={segment.id}
              className={cn(
                "group flex gap-4 p-3 rounded-lg transition-colors duration-200 cursor-pointer",
                segment.id === activeSegmentId 
                  ? "bg-primary/5 ring-1 ring-primary/20" 
                  : "hover:bg-slate-50"
              )}
            >
              <span className={cn(
                "text-xs font-mono font-medium pt-1 min-w-[40px]",
                segment.id === activeSegmentId ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {segment.time}
              </span>
              <p className={cn(
                "text-sm leading-relaxed",
                segment.id === activeSegmentId ? "text-slate-900 font-medium" : "text-slate-600"
              )}>
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
