import { juzData } from "@/data/quranData";
import JuzCard from "@/components/JuzCard";
import QuranHeader from "@/components/QuranHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <QuranHeader />
      
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {juzData.map((juz, index) => (
            <JuzCard key={juz.number} juz={juz} index={index} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-muted-foreground text-sm font-naskh border-t border-border">
        القرآن الكريم - مصحف المدينة المنورة
      </footer>
    </div>
  );
};

export default Index;
