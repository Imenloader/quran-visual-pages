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
    stepName: 'Intention (Niyyah)',
    stepNameAr: 'النية',
    description: 'Formulate the intention in your heart to pray and face the Qiblah.',
    descriptionAr: 'استحضار النية في القلب للصلاة والتوجه نحو القبلة.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 2,
    stepName: 'Takbiratul Ihram',
    stepNameAr: 'تكبيرة الإحرام',
    description: 'Raise your hands to your ears and say Takbir to enter the state of prayer.',
    descriptionAr: 'رفع اليدين بمحاذاة الأذنين وقول "الله أكبر" للدخول في الصلاة.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    translationAr: 'الله أكبر'
  },
  {
    id: 3,
    stepName: 'Opening Supplication',
    stepNameAr: 'دعاء الاستفتاح',
    description: 'Recite the opening supplication (Sunnah) silently.',
    descriptionAr: 'قراءة دعاء الاستفتاح سراً بعد تكبيرة الإحرام.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration: 'Subhanaka Allahumma wa bihamdika...',
    translation: 'Glory be to You, O Allah, and all praise is due to You...',
    translationAr: 'سبحانك اللهم وبحمدك وتبارك اسمك...'
  },
  {
    id: 4,
    stepName: 'Qiyam & Recitation',
    stepNameAr: 'القيام والقراءة',
    description: 'Recite Surah Al-Fatiha and another short Surah.',
    descriptionAr: 'قراءة سورة الفاتحة وما تيسر من القرآن الكريم بخشوع.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...',
    transliteration: 'Bismillahir Rahmanir Rahim...',
    translation: 'In the name of Allah, the Entirely Merciful...',
    translationAr: 'الحمد لله رب العالمين...'
  },
  {
    id: 5,
    stepName: 'Ruku (Bowing)',
    stepNameAr: 'الركوع',
    description: 'Bow down and say Tasbih three times.',
    descriptionAr: 'الانحناء وقول "سبحان ربي العظيم" ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: 'Subhana Rabbiyal Azeem',
    translation: 'Glory be to my Lord, the Almighty',
    translationAr: 'سبحان ربي العظيم'
  },
  {
    id: 6,
    stepName: 'I\'tidal (Standing Up)',
    stepNameAr: 'الاعتدال',
    description: 'Rise from Ruku and stand straight.',
    descriptionAr: 'الرفع من الركوع والاعتدال قائماً مع حمد الله.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سَمِعَ اللهُ لِمَنْ حَمِدَه. رَبَّنَا وَلَكَ الْحَمْدُ',
    transliteration: 'Sami\' Allahu liman hamidah...',
    translation: 'Allah hears those who praise Him...',
    translationAr: 'سمع الله لمن حمده، ربنا ولك الحمد'
  },
  {
    id: 7,
    stepName: 'First Sujud',
    stepNameAr: 'السجود الأول',
    description: 'Prostrate on the floor and say Tasbih three times.',
    descriptionAr: 'السجود وقول "سبحان ربي الأعلى" ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High',
    translationAr: 'سبحان ربي الأعلى'
  },
  {
    id: 8,
    stepName: 'Jalsah (Sitting)',
    stepNameAr: 'الجلسة بين السجدتين',
    description: 'Sit upright between the two prostrations.',
    descriptionAr: 'الجلوس بين السجدتين والدعاء بالمغفرة.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbigh-fir li',
    translation: 'My Lord, forgive me',
    translationAr: 'رب اغفر لي'
  },
  {
    id: 9,
    stepName: 'Second Sujud',
    stepNameAr: 'السجود الثاني',
    description: 'Perform the second prostration like the first.',
    descriptionAr: 'السجود الثاني وقول "سبحان ربي الأعلى" ثلاث مرات.',
    postureImageUrl: 'https://images.unsplash.com/photo-1594474139413-5473722956f6?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High',
    translationAr: 'سبحان ربي الأعلى'
  },
  {
    id: 10,
    stepName: 'Second Rakah',
    stepNameAr: 'الركعة الثانية',
    description: 'Stand up and repeat the steps for the second Rakah.',
    descriptionAr: 'القيام للإتيان بالركعة الثانية بنفس خطوات الأولى.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 11,
    stepName: 'Tashahhud (Sitting)',
    stepNameAr: 'التشهد',
    description: 'Sit for the final Tashahhud after the second Rakah.',
    descriptionAr: 'الجلوس للتشهد الأخير والتحيات لله تعالى.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...',
    transliteration: 'At-tahiyyatu lillahi was-salawatu...',
    translation: 'All compliments, prayers and pure works are due to Allah...',
    translationAr: 'التحيات لله والصلوات والطيبات...'
  },
  {
    id: 12,
    stepName: 'Ibrahimic Prayer',
    stepNameAr: 'الصلاة الإبراهيمية',
    description: 'Recite the Ibrahimic prayer in the final sitting.',
    descriptionAr: 'الصلاة على النبي ﷺ وعلى آل إبراهيم.',
    postureImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ...',
    transliteration: 'Allahumma salli \'ala Muhammad...',
    translation: 'O Allah, send prayers upon Muhammad...',
    translationAr: 'اللهم صل على محمد وعلى آل محمد...'
  },
  {
    id: 13,
    stepName: 'Taslim (Ending)',
    stepNameAr: 'التسليم',
    description: 'Turn your head right then left saying Salaam.',
    descriptionAr: 'الالتفات يميناً ثم يساراً مع قول "السلام عليكم ورحمة الله".',
    postureImageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=500&auto=format&fit=crop',
    arabicRecitation: 'السَّلامُ عَلَيْكُمْ وَرَحْمَةُ الله',
    transliteration: 'Assalamu alaikum wa rahmatullah',
    translation: 'Peace and mercy of Allah be upon you',
    translationAr: 'السلام عليكم ورحمة الله'
  }
];
