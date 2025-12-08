import { Play, Pause, Volume2, Maximize } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoId?: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group shadow-2xl">
      {/* YouTube Embed */}
      {videoId ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {/* Mock Video Content (Image Overlay) */}
          <img 
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600" 
            alt="Video Thumbnail" 
            className="w-full h-full object-cover opacity-80"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-80"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              )}
            </button>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="mb-2">
               <Slider defaultValue={[33]} max={100} step={1} className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)}>
                   {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="flex items-center gap-2 group/vol">
                  <Volume2 className="w-5 h-5" />
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                     <Slider defaultValue={[80]} max={100} step={1} />
                  </div>
                </div>
                <span className="text-xs font-medium font-mono">04:20 / 12:45</span>
              </div>
              <div>
                <Maximize className="w-5 h-5" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
