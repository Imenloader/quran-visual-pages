import React from "react";
import { useTranslation } from "react-i18next";
import { HandHeart, Moon, Sun, Star } from "lucide-react";
import RamadanSectionLayout from "@/components/ramadan/RamadanSectionLayout";
import ScrollReveal from "@/components/ScrollReveal";

const Duas = () => {
  const { t, i18n } = useTranslation();

  const duas = [
    {
      title: "دعاء رؤية الهلال",
      text: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ، هِلَالُ رُشْدٍ وَخَيْرٍ.",
      translation: "O Allah, let this moon appear on us with security and faith, safety and Islam. My Lord and your Lord is Allah. May it be a moon of guidance and good.",
      icon: <Moon className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "دعاء الإفطار",
      text: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ.",
      translation: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
      icon: <Sun className="w-6 h-6 text-amber-500" />
    },
    {
      title: "دعاء الإفطار عند قوم",
      text: "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ.",
      translation: "May the fasting people break their fast with you, may the pious eat your food, and may the angels pray for you.",
      icon: <HandHeart className="w-6 h-6 text-rose-500" />
    },
    {
      title: "دعاء ليلة القدر",
      text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.",
      translation: "O Allah, You are Forgiving and love forgiveness, so forgive me.",
      icon: <Star className="w-6 h-6 text-gold" />
    },
    {
      title: "دعاء العشر الأواخر",
      text: "اللَّهُمَّ اجْعَلْنِي فِيهِ مِنَ الْمُسْتَغْفِرِينَ، وَاجْعَلْنِي فِيهِ مِنْ عِبَادِكَ الصَّالِحِينَ الْقَانِتِينَ، وَاجْعَلْنِي فِيهِ مِنْ أَوْلِيَائِكَ الْمُقَرَّبِينَ، بِرَأْفَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.",
      translation: "O Allah, place me in it among those who seek forgiveness, and place me in it among Your righteous and obedient servants, and place me in it among Your close friends, by Your kindness, O Most Merciful of the merciful.",
      icon: <Sparkles className="w-6 h-6 text-purple-500" />
    },
    {
      title: "دعاء صلاة التراويح",
      text: "اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ، وَعَافِنَا فِيمَنْ عَافَيْتَ، وَتَوَلَّنَا فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لَنَا فِيمَا أَعْطَيْتَ، وَقِنَا شَرَّ مَا قَضَيْتَ.",
      translation: "O Allah, guide us among those You have guided, grant us health among those You have granted health, take us into Your care among those You have taken into Your care, bless us in what You have given, and protect us from the evil of what You have decreed.",
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "دعاء ختم القرآن",
      text: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ.",
      translation: "O Allah, have mercy on me through the Quran and make it for me a leader, a light, a guidance, and a mercy. O Allah, remind me of what I have forgotten of it and teach me what I am ignorant of.",
      icon: <HandHeart className="w-6 h-6 text-blue-500" />
    }
  ];

  return (
    <RamadanSectionLayout 
      title={t("ramadan.duas")} 
      subtitle={t("ramadan.duasDesc")}
      icon={<HandHeart className="w-10 h-10 text-white" />}
      color="bg-emerald-600"
    >
      <div className="grid grid-cols-1 gap-6">
        {duas.map((dua, idx) => (
          <ScrollReveal key={idx} delay={0.2 + idx * 0.1}>
            <div className="bento-card !p-8 flex flex-col md:flex-row items-center gap-8 border border-border/40 hover:shadow-lg transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                {dua.icon}
              </div>
              <div className="space-y-4 text-center md:text-right w-full">
                <h3 className="text-xl font-bold font-serif text-primary">{dua.title}</h3>
                <p className="text-2xl md:text-3xl font-serif leading-relaxed text-foreground/90 dir-rtl">
                  {dua.text}
                </p>
                {i18n.language === 'en' && (
                  <p className="text-sm text-muted-foreground italic mt-2">
                    {dua.translation}
                  </p>
                )}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </RamadanSectionLayout>
  );
};

export default Duas;
