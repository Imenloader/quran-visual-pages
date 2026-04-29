export interface GuideStep {
  id: number;
  stepName: string;
  stepNameAr: string;
  description: string;
  descriptionAr: string;
  postureImageUrl: string;
  arabicRecitation?: string;
  transliteration?: string;
  translation?: string;
  translationAr?: string;
}

export const wuduSteps: GuideStep[] = [
  {
    id: 1,
    stepName: 'Niyyah (Intention)',
    stepNameAr: 'النية',
    description: 'Make the intention in your heart to perform Wudu for the sake of Allah.',
    descriptionAr: 'عزم القلب على فعل الوضوء طاعة لله تعالى.',
    postureImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 2,
    stepName: 'Washing Hands',
    stepNameAr: 'غسل الكفين',
    description: 'Wash both hands up to the wrists three times.',
    descriptionAr: 'غسل الكفين ثلاث مرات مع تخليل الأصابع.',
    postureImageUrl: 'https://images.unsplash.com/photo-1584622781564-1d9876a1df8e?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 3,
    stepName: 'Rinsing Mouth',
    stepNameAr: 'المضمضة',
    description: 'Rinse your mouth three times.',
    descriptionAr: 'إدخال الماء في الفم وتحريكه ثم إخراجه ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 4,
    stepName: 'Inhaling Water',
    stepNameAr: 'الاستنشاق',
    description: 'Sniff water into your nose and blow it out three times.',
    descriptionAr: 'جذب الماء بالأنف ثم إخراجه ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 5,
    stepName: 'Washing Face',
    stepNameAr: 'غسل الوجه',
    description: 'Wash your entire face three times, from hair-line to chin and ear to ear.',
    descriptionAr: 'غسل الوجه كاملاً ثلاث مرات من منابت الشعر إلى أسفل الذقن ومن الأذن إلى الأذن.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 6,
    stepName: 'Washing Arms',
    stepNameAr: 'غسل اليدين للمرفقين',
    description: 'Wash your right arm up to and including the elbow three times, then the left arm.',
    descriptionAr: 'غسل اليد اليمنى من أطراف الأصابع إلى المرفق ثلاث مرات، ثم اليسرى مثلها.',
    postureImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 7,
    stepName: 'Wiping Head',
    stepNameAr: 'مسح الرأس والأذنين',
    description: 'Wipe your head with wet hands once, then wipe the inside and outside of your ears.',
    descriptionAr: 'مسح الرأس مرة واحدة من الأمام إلى الخلف ثم مسح الأذنين من الداخل والخارج.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 8,
    stepName: 'Washing Feet',
    stepNameAr: 'غسل الرجلين',
    description: 'Wash your right foot up to and including the ankles three times, then the left foot.',
    descriptionAr: 'غسل الرجل اليمنى إلى الكعبين ثلاث مرات مع تخليل الأصابع، ثم اليسرى مثلها.',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop'
  }
];

export const salahSteps: GuideStep[] = [
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
    stepName: 'Qiyam (Recitation)',
    stepNameAr: 'القيام والقراءة',
    description: 'Standing straight with hands folded over the chest, reciting Al-Fatiha and a short Surah.',
    descriptionAr: 'الوقوف باعتدال وقراءة سورة الفاتحة وما تيسر من القرآن الكريم.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...',
    transliteration: 'Bismillahir Rahmanir Rahim...',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful...',
    translationAr: 'بسم الله الرحمن الرحيم...'
  },
  {
    id: 3,
    stepName: 'Ruku (Bowing)',
    stepNameAr: 'الركوع',
    description: 'Bowing down with hands on knees and back straight, saying Tasbih three times.',
    descriptionAr: 'الانحناء مع وضع اليدين على الركبتين وقول "سبحان ربي العظيم" ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: 'Subhana Rabbiyal Azeem',
    translation: 'Glory be to my Lord, the Almighty',
    translationAr: 'سبحان ربي العظيم'
  },
  {
    id: 4,
    stepName: 'I\'tidal (Standing Up)',
    stepNameAr: 'الاعتدال من الركوع',
    description: 'Standing up straight from bowing and praising Allah.',
    descriptionAr: 'الوقوف باعتدال بعد الركوع وقول "سمع الله لمن حمده، ربنا ولك الحمد".',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سَمِعَ اللهُ لِمَنْ حَمِدَه',
    transliteration: 'Sami\' Allahu liman hamidah',
    translation: 'Allah hears those who praise Him',
    translationAr: 'سمع الله لمن حمده'
  },
  {
    id: 5,
    stepName: 'Sujud (Prostration)',
    stepNameAr: 'السجود',
    description: 'Prostrating on the floor and saying Tasbih three times.',
    descriptionAr: 'السجود على سبعة أعضاء وقول "سبحان ربي الأعلى" ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High',
    translationAr: 'سبحان ربي الأعلى'
  },
  {
    id: 6,
    stepName: 'Tashahhud',
    stepNameAr: 'التشهد والأذان',
    description: 'Sitting and reciting the testimony of faith at the end of the prayer.',
    descriptionAr: 'الجلوس للتشهد والصلاة الإبراهيمية قبل التسليم.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ...',
    transliteration: 'At-tahiyyatu lillahi...',
    translation: 'All compliments are for Allah...',
    translationAr: 'التحيات لله والصلوات والطيبات...'
  },
  {
    id: 7,
    stepName: 'Taslim',
    stepNameAr: 'التسليم',
    description: 'Turning the head to the right and left and saying Salaam.',
    descriptionAr: 'الالتفات لليمين ثم اليسار وقول "السلام عليكم ورحمة الله".',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'السَّلامُ عَلَيْكُمْ وَرَحْمَةُ الله',
    transliteration: 'Assalamu alaikum wa rahmatullah',
    translation: 'Peace and mercy of Allah be upon you',
    translationAr: 'السلام عليكم ورحمة الله'
  }
];
