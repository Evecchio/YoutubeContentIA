import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { INITIAL_CHAT_MESSAGES, ChatMessage, MOCK_TRANSCRIPT } from "@/lib/mockData";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGroqChatResponse, ChatMessage as GroqMessage } from "@/lib/groq";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Prepare context from transcript
      const transcriptText = MOCK_TRANSCRIPT.map(s => s.text).join(" ");
      const systemPrompt: GroqMessage = {
        role: 'system',
        content: `You are a helpful AI assistant analyzing a video transcript. 
        Here is the transcript of the video:
        "${transcriptText}"
        
        Answer the user's questions based primarily on this transcript. If the answer is not in the transcript, say so.`
      };

      // Convert chat history to Groq format
      const history: GroqMessage[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Add current message
      const currentMsg: GroqMessage = {
        role: 'user',
        content: userMsg.content
      };

      const responseContent = await getGroqChatResponse([systemPrompt, ...history, currentMsg]);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      // Remove the user message if it failed? Or just leave it?
      // Leaving it is fine, user can retry.
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
          <h3 className="text-sm font-semibold text-slate-900">AI Assistant (Powered by Groq)</h3>
          <p className="text-xs text-slate-500">Ask anything about the video</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 custom-scrollbar p-4">
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
                "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed",
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
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
