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

      <main className="pt-24 pb-20 px-4 md:px-0">
        <article className="max-w-3xl mx-auto">
          {/* Cover Image Header */}
          <div className="relative h-64 md:h-96 rounded-[3rem] overflow-hidden mb-8 shadow-2xl">
            <img 
              src={story.coverImage} 
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1">
                  {story.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <Clock size={16} />
                  {story.estimatedReadTime}
                </div>
              </div>
              <h1 className={`text-4xl md:text-6xl font-bold text-white drop-shadow-lg ${
                story.language === 'ar' ? 'font-naskh text-right' : 'font-serif'
              }`}>
                {story.title}
              </h1>
            </div>
          </div>

          {/* Reading Controls */}
          <div className="sticky top-24 z-40 flex items-center justify-between p-4 mb-8 bg-card/80 backdrop-blur-xl border border-border/40 rounded-3xl shadow-soft">
            <div className="flex gap-2">
              <Button 
                onClick={handleToggleTTS}
                variant={isSpeaking ? "default" : "outline"}
                className="rounded-2xl gap-2 h-12 px-6"
              >
                {isSpeaking ? <Pause size={18} /> : <Play size={18} />}
                {isSpeaking ? (story.language === 'ar' ? 'إيقاف' : 'Stop') : (story.language === 'ar' ? 'استماع' : 'Listen')}
              </Button>
              {isSpeaking && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-2xl h-12 w-12"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    handleToggleTTS();
                  }}
                >
                  <RotateCcw size={18} />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12">
                <Bookmark size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12">
                <Share2 size={18} />
              </Button>
            </div>
          </div>

          {/* Story Content */}
          <div className={`prose prose-lg dark:prose-invert max-w-none px-4 md:px-8 bg-card/30 rounded-[3rem] p-8 md:p-12 border border-border/20 shadow-soft ${
            story.language === 'ar' ? 'text-right font-naskh leading-relaxed' : 'font-serif'
          }`}>
            {/* Very basic markdown to JSX conversion for the mock data */}
            {story.markdownContent.split('\n').map((line, idx) => {
              if (line.startsWith('# ')) {
                return <h1 key={idx} className="mt-0">{line.replace('# ', '')}</h1>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={idx}>{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={idx} className="font-bold text-primary">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={idx} className="italic text-muted-foreground">{line.replace(/\*/g, '')}</p>;
              }
              if (line.trim() === '') return <br key={idx} />;
              return <p key={idx}>{line}</p>;
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
