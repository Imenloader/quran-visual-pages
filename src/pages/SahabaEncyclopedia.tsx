import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  User, 
  Award, 
  MapPin, 
  ChevronRight,
  BookOpen,
  ArrowLeft,
  X,
  History,
  Info
} from 'lucide-react';
import { sahabaData, SahabaCompanion, sahabaStats } from '@/data/sahabaData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import QuranHeader from '@/components/QuranHeader';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const SahabaEncyclopedia: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSahabi, setSelectedSahabi] = useState<SahabaCompanion | null>(null);
  const [showStats, setShowStats] = useState(false);

  const isAr = i18n.language === 'ar';

  const categories = [
    { id: 'all', name: isAr ? 'الكل' : 'All' },
    { id: 'khulafa', name: isAr ? 'الخلفاء الراشدون' : 'Rightly Guided Caliphs' },
    { id: 'promised', name: isAr ? 'المبشرون بالجنة' : 'Promised Paradise' },
    { id: 'mothers', name: isAr ? 'أمهات المؤمنين' : 'Mothers of Believers' },
    { id: 'muhajirun', name: isAr ? 'المهاجرون' : 'Muhajirun' },
    { id: 'ansar', name: isAr ? 'الأنصار' : 'Ansar' },
  ];

  const filteredSahaba = useMemo(() => {
    return sahabaData.filter(s => {
      const nameMatch = isAr 
        ? s.nameAr.includes(searchQuery) || s.titleAr.includes(searchQuery)
        : s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = activeCategory === 'all' || s.category === activeCategory;
      
      return nameMatch && categoryMatch;
    });
  }, [searchQuery, activeCategory, isAr]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed top-0 left-0 right-0 z-50">
        <QuranHeader 
          title={isAr ? 'موسوعة الصحابة' : 'Sahaba Encyclopedia'} 
          variant="compact"
          showBack
        />
      </div>

      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Search and Stats Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4`} />
            <Input 
              placeholder={isAr ? 'بحث عن صحابي...' : 'Search for a companion...'}
              className={`${isAr ? 'pr-10' : 'pl-10'} rounded-2xl bg-card border-border/40 focus:ring-primary/20 h-12`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="rounded-2xl h-12 gap-2 border-border/40 bg-card hover:bg-primary/5"
            onClick={() => setShowStats(!showStats)}
          >
            <History className="w-4 h-4 text-primary" />
            {isAr ? 'حقائق تاريخية' : 'Historical Facts'}
          </Button>
        </div>

        {/* Stats Section */}
        <AnimatePresence>
          {showStats && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Info className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-4 ${isAr ? 'font-naskh' : ''}`}>
                      {isAr ? 'حول عدد الصحابة الكرام' : 'About the Number of Companions'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{isAr ? 'إجمالي التقديرات (حجة الوداع):' : 'Total Estimates (Farewell Pilgrimage):'}</p>
                        <p className="text-2xl font-bold text-primary">{sahabaStats.totalEstimated}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{isAr ? 'الصحابة الموثقون في الكتب:' : 'Documented Companions in Books:'}</p>
                        <p className="text-2xl font-bold text-primary">{sahabaStats.documentedCount}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-primary/10">
                      <p className="text-sm leading-relaxed opacity-80">
                        {isAr ? sahabaStats.historicalContextAr : sahabaStats.historicalContext}
                      </p>
                      <p className="mt-2 text-xs font-medium text-primary">
                        {isAr ? `المصدر: ${sahabaStats.primarySourceAr}` : `Source: ${sahabaStats.primarySource}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap px-6 ${activeCategory === cat.id ? 'shadow-lg shadow-primary/20' : 'border-border/40 bg-card'}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Sahaba Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSahaba.map((sahabi, idx) => (
              <motion.div
                layout
                key={sahabi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-card hover:bg-accent/50 border border-border/40 rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
                onClick={() => setSelectedSahabi(sahabi)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                    <img src={sahabi.imageUrl} alt={sahabi.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-2 bg-primary/5 text-primary border-none text-[10px] uppercase tracking-wider">
                      {isAr ? categories.find(c => c.id === sahabi.category)?.name : sahabi.category}
                    </Badge>
                    <h3 className={`text-lg font-bold truncate ${isAr ? 'font-naskh text-xl' : ''}`}>
                      {isAr ? sahabi.nameAr : sahabi.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium text-primary/80">
                      {isAr ? sahabi.titleAr : sahabi.title}
                    </p>
                  </div>
                </div>
                
                <p className={`mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed ${isAr ? 'text-right' : ''}`}>
                  {isAr ? sahabi.shortBioAr : sahabi.shortBio}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary">
                    {isAr ? 'عرض التفاصيل' : 'View Details'}
                    <ChevronRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSahaba.length === 0 && (
          <div className="text-center py-24 bg-card rounded-[3rem] border border-dashed border-border/60">
            <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{isAr ? 'لم يتم العثور على نتائج' : 'No companions found'}</h3>
            <p className="text-muted-foreground">{isAr ? 'جرب البحث بكلمة أخرى أو تغيير الفئة' : 'Try searching for something else or change the category'}</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSahabi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setSelectedSahabi(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-3xl max-h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl border border-border/40 relative"
              onClick={e => e.stopPropagation()}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-6 z-10 bg-background/50 backdrop-blur-md rounded-full"
                onClick={() => setSelectedSahabi(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="h-full overflow-y-auto custom-scrollbar">
                {/* Header Image */}
                <div className="relative h-64 md:h-80">
                  <img src={selectedSahabi.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <div className={`absolute bottom-8 left-8 right-8 ${isAr ? 'text-right' : 'text-left'}`}>
                    <Badge className="mb-3 bg-primary text-white border-none px-4 py-1">
                      {isAr ? categories.find(c => c.id === selectedSahabi.category)?.name : selectedSahabi.category}
                    </Badge>
                    <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isAr ? 'font-naskh' : ''}`}>
                      {isAr ? selectedSahabi.nameAr : selectedSahabi.name}
                    </h2>
                    <p className="text-primary font-bold text-lg md:text-xl">
                      {isAr ? selectedSahabi.titleAr : selectedSahabi.title}
                    </p>
                  </div>
                </div>

                <div className={`p-8 md:p-12 ${isAr ? 'text-right rtl' : 'text-left'}`}>
                  {/* Achievements */}
                  <div className="mb-12">
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <Award className="w-6 h-6 text-primary" />
                      {isAr ? 'أبرز الإنجازات والمواقف' : 'Key Achievements & Standpoints'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(isAr ? selectedSahabi.achievementsAr : selectedSahabi.achievements).map((ach, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-accent/30 border border-border/40 text-sm font-medium leading-relaxed">
                          {ach}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Story */}
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    <div className={`whitespace-pre-wrap leading-loose ${isAr ? 'font-naskh text-lg opacity-90' : 'opacity-80 font-serif italic'}`}>
                      {isAr ? selectedSahabi.fullStoryAr : selectedSahabi.fullStory}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SahabaEncyclopedia;
