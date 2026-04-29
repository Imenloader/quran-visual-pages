export interface PrayerStep {
  id: number;
  stepName: string;
  description: string;
  postureImageUrl: string;
  arabicRecitation: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
}

export const salahSteps: PrayerStep[] = [
  {
    id: 1,
    stepName: 'Takbiratul Ihram',
    description: 'Raising hands to ear level and saying Takbir to start the prayer.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest'
  },
  {
    id: 2,
    stepName: 'Qiyam',
    description: 'Standing straight with hands folded over the chest, reciting Al-Fatiha.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...',
    transliteration: 'Bismillahir Rahmanir Rahim...',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful...'
  },
  {
    id: 3,
    stepName: 'Ruku',
    description: 'Bowing down with hands on knees and back straight.',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: 'Subhana Rabbiyal Azeem',
    translation: 'Glory be to my Lord, the Almighty'
  },
  {
    id: 4,
    stepName: 'Sujud',
    description: 'Prostrating on the floor with forehead, nose, palms, knees, and toes touching the ground.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High'
  },
  {
    id: 5,
    stepName: 'Tashahhud',
    description: 'Sitting and reciting the testimony of faith.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَات...',
    transliteration: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat...',
    translation: 'All compliments, prayers and pure works are due to Allah...'
  }
];
