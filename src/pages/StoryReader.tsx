import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stories, Story } from '@/data/storiesData';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Share2, 
  Bookmark,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuranHeader from '@/components/QuranHeader';
import { toast } from 'sonner';

const StoryReader: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const foundStory = stories.find(s => s.id === storyId);
    if (foundStory) {
      setStory(foundStory);
    } else {
      navigate('/stories');
    }
  }, [storyId, navigate]);

  const handleToggleTTS = () => {
    if (!story) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown for better speech
    const cleanContent = story.markdownContent
      .replace(/#+\s/g, '') // Remove headers
      .replace(/\*\*+/g, '') // Remove bold
      .replace(/\*+/g, '');  // Remove italics

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.lang = story.language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Speech synthesis failed');
    };

    window.speechSynthesis.speak(utterance);
    setSpeech(utterance);
    setIsSpeaking(true);
    toast.success(story.language === 'ar' ? 'جاري القراءة بصوت عالٍ...' : 'Started reading aloud...');
  };

  if (!story) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <QuranHeader 
          title={story.category} 
          variant="compact"
          showBack
        />
      </div>

      <main className="pt-20 pb-32 px-4 md:px-0">
        <article className="max-w-4xl mx-auto">
          {/* Cover Image Header - Reduced size and improved contrast */}
          <div className="relative h-48 md:h-72 rounded-[2rem] overflow-hidden mb-6 shadow-xl border border-border/20">
            <img 
              src={story.coverImage} 
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className={`absolute bottom-6 left-6 right-6 ${story.language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 mb-2 ${story.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-0.5 text-[10px]">
                  {story.category}
                </Badge>
                <div className="flex items-center gap-1 text-white/80 text-[10px]">
                  <Clock size={12} />
                  {story.estimatedReadTime}
                </div>
              </div>
              <h1 className={`text-2xl md:text-4xl font-bold text-white leading-tight ${
                story.language === 'ar' ? 'font-naskh' : 'font-serif'
              }`}>
                {story.title}
              </h1>
            </div>
          </div>

          {/* Reading Controls - More compact and sticky */}
          <div className="sticky top-20 z-40 flex items-center justify-between p-3 mb-6 bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-lg">
            <div className={`flex gap-2 ${story.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Button 
                onClick={handleToggleTTS}
                variant={isSpeaking ? "default" : "outline"}
                className="rounded-xl gap-2 h-10 px-4 text-xs"
              >
                {isSpeaking ? <Pause size={14} /> : <Play size={14} />}
                {isSpeaking ? (story.language === 'ar' ? 'إيقاف' : 'Stop') : (story.language === 'ar' ? 'استماع' : 'Listen')}
              </Button>
            </div>

            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                <Bookmark size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                <Share2 size={16} />
              </Button>
            </div>
          </div>

          {/* Story Content - Better spacing and RTL support */}
          <div 
            dir={story.language === 'ar' ? 'rtl' : 'ltr'}
            className={`prose prose-sm md:prose-base dark:prose-invert max-w-none px-6 py-10 bg-card/40 rounded-[2.5rem] border border-border/10 shadow-soft mb-12 ${
            story.language === 'ar' ? 'text-right font-naskh leading-[2] text-lg' : 'font-serif leading-relaxed'
          }`}>
            {/* Improved basic markdown to JSX conversion */}
            {story.markdownContent.split('\n').map((line, idx) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('# ')) {
                return <h1 key={idx} className="text-3xl md:text-4xl mb-6 text-primary">{trimmedLine.replace('# ', '')}</h1>;
              }
              if (trimmedLine.startsWith('## ')) {
                return <h2 key={idx} className="text-2xl md:text-3xl mt-8 mb-4 border-b border-border/40 pb-2">{trimmedLine.replace('## ', '')}</h2>;
              }
              if (trimmedLine.startsWith('### ')) {
                return <h3 key={idx} className="text-xl md:text-2xl mt-6 mb-3 text-accent">{trimmedLine.replace('### ', '')}</h3>;
              }
              if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                return <div key={idx} className="my-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl italic text-lg font-medium">{trimmedLine.replace(/\*\*/g, '')}</div>;
              }
              if (trimmedLine.trim() === '') return null;
              
              return <p key={idx} className="mb-4">{trimmedLine}</p>;
            })}
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 mb-20 flex justify-center">
            <Button 
              variant="outline" 
              className="rounded-full px-8 h-12 gap-2"
              onClick={() => navigate('/stories')}
            >
              <ChevronLeft size={18} />
              Back to Library
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default StoryReader;
