import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { stories, Story } from '@/data/storiesData';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Baby, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import QuranHeader from '@/components/QuranHeader';

const StoriesLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState<'all' | 'child' | 'adult'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(stories.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          story.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAudience = filterAudience === 'all' || story.targetAudience === filterAudience;
      const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
      return matchesSearch && matchesAudience && matchesCategory;
    });
  }, [searchQuery, filterAudience, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <QuranHeader 
        title="Islamic Stories Hub" 
        subtitle="Spiritual journeys for all ages"
        variant="compact"
        showBack
      />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters Section */}
        <section className="mb-10 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <Input 
              placeholder="Search stories by title or category..." 
              className="pl-12 h-14 rounded-2xl bg-card border-border/40 shadow-sm focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterAudience === 'all' ? 'default' : 'outline'}
                className="rounded-full px-6"
                onClick={() => setFilterAudience('all')}
              >
                All Ages
              </Button>
              <Button 
                variant={filterAudience === 'child' ? 'default' : 'outline'}
                className="rounded-full px-6 flex gap-2"
                onClick={() => setFilterAudience('child')}
              >
                <Baby size={16} /> Children
              </Button>
              <Button 
                variant={filterAudience === 'adult' ? 'default' : 'outline'}
                className="rounded-full px-6 flex gap-2"
                onClick={() => setFilterAudience('adult')}
              >
                <User size={16} /> Adults
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'secondary'}
                  className={`cursor-pointer px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'scale-105' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <div 
                key={story.id}
                onClick={() => navigate(`/stories/${story.id}`)}
                className="group relative bg-card border border-border/40 rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-islamic transition-all duration-500 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={story.coverImage} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge className={story.isReal ? "bg-emerald-500/90 text-white" : "bg-purple-500/90 text-white"}>
                      {story.isReal ? "حقيقي" : "مُنشأ"}
                    </Badge>
                  </div>

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-black border-none hover:bg-white shadow-lg backdrop-blur-sm">
                      {story.category}
                    </Badge>
                  </div>

                  {story.targetAudience === 'child' && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-yellow-400/90 text-black px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                      <Sparkles size={12} />
                      KIDS PICK
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                      <Clock size={14} />
                      {story.estimatedReadTime}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      story.language === 'ar' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}>
                      {story.language.toUpperCase()}
                    </div>
                  </div>

                  <h3 className={`text-xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight ${
                    story.language === 'ar' ? 'font-naskh text-2xl text-right' : 'font-serif'
                  }`}>
                    {story.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Read Story</span>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 rounded-[3rem] border border-dashed border-border/60">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground">No stories found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            <Button 
              variant="link" 
              className="mt-2 text-primary"
              onClick={() => {
                setSearchQuery('');
                setFilterAudience('all');
                setSelectedCategory('All');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoriesLibrary;
