import React from 'react';
import { ChevronRight, Share2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AYA_SECTIONS = [
  {
    title: 'سورة الفاتحة',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937ea71de61b_1000464685.png',
  },
  {
    title: 'آية الكرسي',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eaf07516c_1000464691.png',
  },
  {
    title: 'أخر آيتين من سورة البقرة',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eae42cde7_1000464690.png',
  },
  {
    title: 'سورة السجدة',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eac62c66a_1000464687.png',
  },
  {
    title: 'أواخر سورة الحشر ثلاثا',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eadbe1de8_1000464689.png',
  },
  {
    title: 'سورة الملك',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937ea8715237_1000464686.png',
  },
  {
    title: 'سورة الكافرون',
    image: 'https://d1yei2z3i6k35z.cloudfront.net/14770342/6937eafc20436_1000464692.png',
  },
  {
    title: 'المعوذات ثلاثا',
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-naskh" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary">مئة آية</h1>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Quote Box */}
        <div className="bg-primary/5 border-r-4 border-primary p-6 rounded-l-2xl shadow-sm">
          <p className="text-primary font-bold mb-2">قَالَ رَسُولُ اللَّهِ ﷺ :</p>
          <p className="text-lg leading-relaxed text-foreground/90 font-serif italic">
            ( مَنْ قَامَ بِعَشْرِ آيَاتٍ لَمْ يُكْتَبْ مِنْ الْغَافِلِينَ ، وَمَنْ قَامَ بِمِائَةِ آيَةٍ كُتِبَ مِنْ الْقَانِتِينَ ، وَمَنْ قَامَ بِأَلْفِ آيَةٍ كُتِبَ مِنْ الْمُقَنْطِرِينَ )
          </p>
          <p className="text-sm text-muted-foreground mt-4 text-left">صححه الألباني في صحيح أبي داود (1264)</p>
        </div>

        {/* Sections */}
        {AYA_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {idx + 1}
              </div>
              <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/20 pb-1">
                {section.title}
              </h2>
            </div>
            <div className="bg-card rounded-3xl p-2 border border-border shadow-soft overflow-hidden">
              <img 
                src={section.image} 
                alt={section.title}
                className="w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        ))}

        {/* Virtues Section */}
        <div className="mt-12 space-y-6 pt-12 border-t border-border">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-primary">فضائل هذه الآيات</h3>
          </div>
          
          <div className="space-y-4">
            {VIRTUES.map((virtue, idx) => (
              <div 
                key={idx} 
                className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-foreground/80 leading-relaxed text-lg"
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
