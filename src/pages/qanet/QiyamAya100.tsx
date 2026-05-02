import React, { useState } from 'react';
import { ChevronRight, Share2, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQanet } from './QanetContext';
import { toHijri } from './hijriUtils';
import { toast } from 'sonner';

const AYA_SECTIONS = [
  {
    id: 'fatiha',
    title: 'سورة الفاتحة',
    ayahs: 7,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937ea71de61b_1000464685.png',
  },
  {
    id: 'kursi',
    title: 'آية الكرسي',
    ayahs: 1,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eaf07516c_1000464691.png',
  },
  {
    id: 'baqarah_last',
    title: 'أخر آيتين من سورة البقرة',
    ayahs: 2,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eae42cde7_1000464690.png',
  },
  {
    id: 'sajdah',
    title: 'سورة السجدة',
    ayahs: 30,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eac62c66a_1000464687.png',
  },
  {
    id: 'hashr_last',
    title: 'أواخر سورة الحشر (٣ مرات)',
    ayahs: 9, // 3 * 3
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eadbe1de8_1000464689.png',
  },
  {
    id: 'mulk',
    title: 'سورة الملك',
    ayahs: 30,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937ea8715237_1000464686.png',
  },
  {
    id: 'kafirun',
    title: 'سورة الكافرون',
    ayahs: 6,
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eafc20436_1000464692.png',
  },
  {
    id: 'ikhlas_maowidhat',
    title: 'المعوذات (٣ مرات)',
    ayahs: 15, // (4+5+6) * 1 approx
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eacfbb5c3_1000464688.png',
  },
];

const VIRTUES = [
  { text: 'قال رسول الله صلى الله عليه وسلم : ( ما أنزلت في التوراة، ولا في الإنجيل، ولا في الزبور، ولا في الفرقان مثلها. وإنها سبع من المثاني، والقرآن العظيم الذي أعطيته ) [ متفق عليه - الفاتحة ]' },
  { text: 'عن ابن عباس رضي الله عنهما قال : ( بينما جبريل قاعد عند النبي صلى الله عليه وسلم سمع نقيضا من فوقه فرفع رأسه فقال : هذا باب من السماء فتح اليوم ، لم يفتح قط إلا اليوم ، فنزل منه ملك فقال : هذا ملك نزل إلى الأرض ، لم ينزل قط إلا اليوم ، فسلم وقال : أبشر بنورين أوتيتهما ، لم يؤتهما نبي قبلك ؛ فاتحة الكتاب ، وخواتيم سورة {البقرة} ، لن تقرأ بحرف منهما إلا أعطيته ) [ رواه مسلم وصححه الألباني ]' },
  { text: 'عن أبي مسعود رضي الله عنه قال : قال النبي صلى الله عليه وسلم : ( من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه ) [ رواه البخاري ]' },
  { text: 'عن النعمان بن بشير عن النبي صلى الله عليه وسلم قال : ( إن الله كتب كتاباً قبل أن يخلق السماوات والأرض بألفي عام أنزل منه آيتين ختم بهما سورة البقرة، ولا يقرآن في دار ثلاث ليال فيقربها شيطان ) [ رواه الترمذي وصححه الألباني ]' },
  { text: 'عن أبي هريرة عن النبي صلى الله عليه وسلم قال : ( إن سورة من القرآن ثلاثون آية شفعت لرجل حتى غفر له وهي سورة تبارك الذي بيده الملك ) [ رواه الترمذي وصححه الألباني ]' },
  { text: 'عن جابر قال : ( كان رسول الله صلى الله عليه وسلم لا ينام حتى يقرأ " آلم " تنزيل السجدة ، و " تبارك الذي بيده الملك " ) [ رواه الترمذي وصححه الألباني ]' },
  { text: 'عن فروة بن نوفل رضي الله عنه أنه أتى النبي صلى الله عليه وسلم فقال : يا رسول الله علمني شيئا أقوله إذا أويت إلى فراشي فقال : ( اقرأ قل يا أيها الكافرون فإنها براءة من الشرك ) [ رواه الترمذي وصححه الألباني ]' },
  { text: 'عن أبي هريرة في حديث الشيطان وآية الكرسي: (...إذا أويت إلى فراشك فاقرأ هذه الآية : { الله لا إله إلا هو الحي القيوم } . . . حتى ختم الآية فإنه لن يزال عليك حافظ من الله تعالى ولا يقربك شيطان حتى تصبح...) [ رواه البخاري ]' },
  { text: 'قال رسول الله صلى الله عليه وسلم : ( قل يا أيها الكافرون تعدل ربع القرآن ) [ حسنه الألباني ]' },
  { text: 'عن عائشة: أن النبي صلى الله عليه وسلم كان إذا آوى إلى فراشه كل ليلة جمع كفيه ثم نفث فيهما فقرأ فيهما: قل هو الله أحد، وقل أعوذ برب الفلق، وقل أعوذ برب الناس، ثم يمسح بهما ما استطاع من جسده... يفعل ذلك ثلاث مرات. [ متفق عليه ]' },
];

export default function QiyamAya100() {
  const navigate = useNavigate();
  const { addLog, settings } = useQanet();
  const [completed, setCompleted] = useState<string[]>([]);

  const toggleComplete = (id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalAyahs = AYA_SECTIONS
    .filter(s => completed.includes(s.id))
    .reduce((sum, s) => sum + s.ayahs, 0);

  const handleFinish = () => {
    if (totalAyahs === 0) {
      toast.error('يرجى تحديد الآيات التي قرأتها أولاً');
      return;
    }

    const hijriDateStr = formatHijriDate(new Date(), settings.hijriOffset);
    addLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hijriDate: hijriDateStr,
      totalAyahs,
      shafaWitr: false,
      ranges: [{
        startSurah: 1,
        startAyah: 1,
        endSurah: 114,
        endAyah: 6
      }],
      startSurah: 1,
      startAyah: 1,
      endSurah: 114,
      endAyah: 6,
    });

    toast.success(`تم تسجيل ${totalAyahs} آية في سجلك!`);
    navigate('/qanet');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-naskh" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary">ورد مئة آية</h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Prophetic Night Word</p>
        </div>
        <button className="p-2.5 bg-muted/50 rounded-xl">
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Progress Tracker */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft sticky top-20 z-40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">التقدم الحالي</p>
              <h2 className="text-3xl font-black text-foreground tabular-nums">
                {totalAyahs} <span className="text-sm font-bold text-muted-foreground">/ ١٠٠ آية</span>
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={32} />
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-6 shadow-inner">
            <div 
              className="h-full bg-primary transition-all duration-700 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
              style={{ width: `${Math.min(100, (totalAyahs / 100) * 100)}%` }}
            />
          </div>
          <button
            onClick={handleFinish}
            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 shadow-islamic active:scale-95 transition-all"
          >
            <CheckCircle2 size={20} />
            حفظ وإضافة للسجل
          </button>
        </div>

        {/* Hadith Quote */}
        <div className="bg-primary/5 border-r-4 border-primary p-8 rounded-l-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-5">
            <BookOpen size={100} />
          </div>
          <p className="text-primary font-bold mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            قَالَ رَسُولُ اللَّهِ ﷺ :
          </p>
          <p className="text-xl leading-relaxed text-foreground/90 font-serif italic text-justify">
            ( مَنْ قَامَ بِعَشْرِ آيَاتٍ لَمْ يُكْتَبْ مِنْ الْغَافِلِينَ ، وَمَنْ قَامَ بِمِائَةِ آيَةٍ كُتِبَ مِنْ الْقَانِتِينَ ، وَمَنْ قَامَ بِأَلْفِ آيَةٍ كُتِبَ مِنْ الْمُقَنْطِرِينَ )
          </p>
          <p className="text-[10px] text-muted-foreground mt-4 text-left font-bold italic tracking-wide">صححه الألباني في صحيح أبي داود (1264)</p>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {AYA_SECTIONS.map((section, idx) => {
            const isDone = completed.includes(section.id);
            return (
              <div key={section.id} className="space-y-4">
                <div 
                  onClick={() => toggleComplete(section.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700' 
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isDone ? 'bg-emerald-500 text-white shadow-islamic' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-naskh">{section.title}</h3>
                      <p className="text-[10px] font-bold opacity-60 uppercase">{section.ayahs} آيات</p>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-card rounded-3xl p-3 border border-border shadow-islamic overflow-hidden transition-all duration-500 ${
                  isDone ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'
                }`}>
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="w-full h-auto rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Virtues Section */}
        <div className="mt-20 space-y-8 pt-20 border-t border-border">
          <div className="text-center space-y-2">
            <div className="w-16 h-1 bg-primary/20 mx-auto rounded-full" />
            <h3 className="text-3xl font-black text-primary font-naskh">فضائل هذه الآيات</h3>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Divine Virtues</p>
          </div>
          
          <div className="space-y-4">
            {VIRTUES.map((virtue, idx) => (
              <div 
                key={idx} 
                className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 text-foreground/80 leading-relaxed text-lg text-justify hover:bg-muted/50 transition-colors"
              >
                {virtue.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
