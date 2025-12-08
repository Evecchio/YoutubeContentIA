import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  className?: string;
  transcriptText: string;
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface({ className, transcriptText }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I've analyzed the video. You can ask me anything about the content, like 'What are the main takeaways?' or 'Summarize the key points'.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Convert to API format
      const apiMessages: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      apiMessages.push({ role: 'user', content: userMsg.content });

      const responseContent = await sendChatMessage(apiMessages, transcriptText);

      const aiMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">AI Assistant</h3>
          <p className="text-xs text-slate-500">Powered by Groq LLM</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 custom-scrollbar p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === 'assistant' 
                  ? "bg-primary/5 border-primary/10 text-primary" 
                  : "bg-slate-100 border-slate-200 text-slate-600"
              )}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'assistant' 
                  ? "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none" 
                  : "bg-primary text-white shadow-md shadow-primary/20 rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                 <Bot className="w-4 h-4 text-primary" />
               </div>
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
               </div>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..." 
            className="pr-12 h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20" 
            data-testid="input-chat"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1 h-9 w-9 bg-primary hover:bg-primary/90 transition-colors"
            disabled={!input.trim() || isTyping}
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
