import React from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InternalVideoPlayerProps {
  videoId: string;
  onClose: () => void;
  onEnd?: () => void;
  title?: string;
}

const InternalVideoPlayer: React.FC<InternalVideoPlayerProps> = ({ videoId, onClose, onEnd, title }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-card rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-card border-b border-border/40">
          <h3 className="text-foreground font-bold font-naskh truncate pr-8 text-sm sm:text-base">
            {title || 'جاري التشغيل...'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:bg-accent/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Video Area */}
        <div className="relative w-full aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4 z-20">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-white/60 text-xs font-naskh">تحميل الفيديو من يوتيوب...</p>
            </div>
          )}
          
          <iframe
            src={videoId.startsWith('PL') || videoId.startsWith('UU')
              ? `https://www.youtube.com/embed/videoseries?list=${videoId}&autoplay=1`
              : `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`
            }
            title={title}
            className="w-full h-full relative z-10"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-muted/30 flex justify-center">
          <Button 
            onClick={() => {
              if (onEnd) onEnd();
              onClose();
            }}
            className="rounded-2xl gap-2 font-naskh bg-primary text-white hover:bg-primary/90"
          >
            <CheckCircle2 className="w-5 h-5" />
            أتممت المشاهدة / التدريب
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InternalVideoPlayer;
