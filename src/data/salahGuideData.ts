export interface PrayerStep {
  id: number;
  stepName: string;
  stepNameAr: string;
  description: string;
  descriptionAr: string;
  postureImageUrl: string;
  arabicRecitation: string;
  transliteration: string;
  translation: string;
  translationAr: string;
  audioUrl?: string;
}

export const salahSteps: PrayerStep[] = [
  {
    id: 1,
    stepName: 'Takbiratul Ihram',
    stepNameAr: 'تكبيرة الإحرام',
    description: 'Raising hands to ear level and saying Takbir to start the prayer.',
    descriptionAr: 'رفع اليدين بمحاذاة الأذنين وقول "الله أكبر" لبدء الصلاة.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    translationAr: 'الله أكبر'
  },
  {
    id: 2,
    stepName: 'Qiyam',
    stepNameAr: 'القيام',
    description: 'Standing straight with hands folded over the chest, reciting Al-Fatiha.',
    descriptionAr: 'الوقوف باعتدال مع وضع اليد اليمنى على اليسرى فوق الصدر وقراءة الفاتحة.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...',
    transliteration: 'Bismillahir Rahmanir Rahim...',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful...',
    translationAr: 'بسم الله الرحمن الرحيم...'
  },
  {
    id: 3,
    stepName: 'Ruku',
    stepNameAr: 'الركوع',
    description: 'Bowing down with hands on knees and back straight.',
    descriptionAr: 'الانحناء مع وضع اليدين على الركبتين وجعل الظهر مستوياً.',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: 'Subhana Rabbiyal Azeem',
    translation: 'Glory be to my Lord, the Almighty',
    translationAr: 'سبحان ربي العظيم'
  },
  {
    id: 4,
    stepName: 'Sujud',
    stepNameAr: 'السجود',
    description: 'Prostrating on the floor with forehead, nose, palms, knees, and toes touching the ground.',
    descriptionAr: 'وضع الجبهة والأنف والكفين والركبتين وأطراف القدمين على الأرض.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High',
    translationAr: 'سبحان ربي الأعلى'
  },
  {
    id: 5,
    stepName: 'Tashahhud',
    stepNameAr: 'التشهد',
    description: 'Sitting and reciting the testimony of faith.',
    descriptionAr: 'الجلوس بعد السجدة الثانية لقراءة التحيات والتشهد.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَواتُ وَالطَّيِّبات...',
    transliteration: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat...',
    translation: 'All compliments, prayers and pure works are due to Allah...',
    translationAr: 'التحيات لله والصلوات والطيبات...'
  }
];
