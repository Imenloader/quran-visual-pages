export interface GuideStep {
  id: string;
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

// Reliable Unsplash IDs for specific postures
const IMG_NIYYAH = "https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=800&auto=format&fit=crop"; // Standing/Intention
const IMG_TAKBIER = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop"; // Mosque/Sacred
const IMG_QIYAM = "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=800&auto=format&fit=crop"; // Manuscript/Content
const IMG_ISTIFTAH = "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop"; // Supplication
const IMG_ITIDAL = "https://images.unsplash.com/photo-1524333800407-b98a39a63a55?q=80&w=800&auto=format&fit=crop"; // Standing up

export const wuduSteps: GuideStep[] = [
  {
    id: 'w1',
    stepName: 'Niyyah (Intention)',
    stepNameAr: 'النية',
    description: 'Make the intention in your heart to perform Wudu for the sake of Allah.',
    descriptionAr: 'عزم القلب على فعل الوضوء طاعة لله تعالى.',
    postureImageUrl: '/assets/guides/child_wudu_niyyah_correct_1777487190054.png',
    arabicRecitation: 'بِسْمِ اللَّه',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    translationAr: 'بسم الله'
  },
  {
    id: 'w2',
    stepName: 'Washing Hands',
    stepNameAr: 'غسل الكفين',
    description: 'Wash both hands up to the wrists three times.',
    descriptionAr: 'غسل الكفين ثلاث مرات مع تخليل الأصابع.',
    postureImageUrl: '/assets/guides/child_wudu_hands_1777486227949.png'
  },
  {
    id: 'w3',
    stepName: 'Rinsing Mouth',
    stepNameAr: 'المضمضة',
    description: 'Rinse your mouth three times.',
    descriptionAr: 'إدخال الماء في الفم وتحريكه ثم إخراجه ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_mouth_correct_1777487203629.png'
  },
  {
    id: 'w4',
    stepName: 'Inhaling Water',
    stepNameAr: 'الاستنشاق',
    description: 'Sniff water into your nose and blow it out three times.',
    descriptionAr: 'جذب الماء بالأنف ثم إخراجه ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_nose_correct_1777487219843.png'
  },
  {
    id: 'w5',
    stepName: 'Washing Face',
    stepNameAr: 'غسل الوجه',
    description: 'Wash your entire face three times.',
    descriptionAr: 'غسل الوجه كاملاً ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_face_new_correct_1777487238576.png'
  },
  {
    id: 'w6',
    stepName: 'Washing Arms',
    stepNameAr: 'غسل اليدين للمرفقين',
    description: 'Wash both arms up to the elbow three times.',
    descriptionAr: 'غسل اليدين إلى المرفق ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_hands_1777486227949.png'
  },
  {
    id: 'w7',
    stepName: 'Wiping Head',
    stepNameAr: 'مسح الرأس والأذنين',
    description: 'Wipe your head once and clean your ears.',
    descriptionAr: 'مسح الرأس مرة واحدة ثم مسح الأذنين.',
    postureImageUrl: '/assets/guides/child_wudu_head_correct_1777487251649.png'
  },
  {
    id: 'w8',
    stepName: 'Washing Feet',
    stepNameAr: 'غسل الرجلين',
    description: 'Wash both feet up to the ankles three times.',
    descriptionAr: 'غسل الرجلين إلى الكعبين ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_feet_1777486318686.png',
    arabicRecitation: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ.',
    transliteration: 'Ash-hadu an la ilaha illallahu wahdahu la sharika lahu, wa ash-hadu anna Muhammadan \'abduhu wa rasuluh. Allahummaj-\'alni minat-tawwabina waj-\'alni minal-mutatahhirin.',
    translation: 'I bear witness that there is no deity worthy of worship except Allah alone, and I ask Allah to make me of those who repent.',
    translationAr: 'الشهادة ودعاء ما بعد الوضوء'
  }
];

export const allSalahSteps: Record<string, GuideStep> = {
  niyyah: {
    id: 's1',
    stepName: 'Intention (Niyyah)',
    stepNameAr: 'النية',
    description: 'Formulate the intention in your heart to pray.',
    descriptionAr: 'استحضار النية في القلب للصلاة والتوجه نحو القبلة.',
    postureImageUrl: '/assets/guides/child_wudu_niyyah_correct_1777487190054.png'
  },
  takbir: {
    id: 's2',
    stepName: 'Takbiratul Ihram',
    stepNameAr: 'تكبيرة الإحرام',
    description: 'Raise your hands to your ears and say Takbir.',
    descriptionAr: 'رفع اليدين بمحاذاة الأذنين وقول "الله أكبر".',
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png',
    arabicRecitation: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    translationAr: 'الله أكبر'
  },
  istiftah: {
    id: 's3',
    stepName: 'Opening Supplication',
    stepNameAr: 'دعاء الاستفتاح',
    description: 'Recite the opening supplication silently.',
    descriptionAr: 'قراءة دعاء الاستفتاح سراً بعد تكبيرة الإحرام.',
    postureImageUrl: IMG_ISTIFTAH,
    arabicRecitation: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration: 'Subhanaka Allahumma wa bihamdika...',
    translation: 'Glory be to You, O Allah, and all praise is due to You.',
    translationAr: 'سبحانك اللهم وبحمدك وتبارك اسمك وتعالى جدك ولا إله غيرك'
  },
  fatiha: {
    id: 's4',
    stepName: 'Qiyam & Recitation',
    stepNameAr: 'القيام والقراءة',
    description: 'Recite Surah Al-Fatiha fully.',
    descriptionAr: 'قراءة سورة الفاتحة كاملة بخشوع.',
    postureImageUrl: IMG_QIYAM,
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...',
    transliteration: 'Bismillahir Rahmanir Rahim. Alhamdu lillahi rabbil \'alamin...',
    translation: 'In the name of Allah, the Entirely Merciful...',
    translationAr: 'سورة الفاتحة كاملة'
  },
  ruku: {
    id: 's5',
    stepName: 'Ruku (Bowing)',
    stepNameAr: 'الركوع',
    description: 'Bow down with hands on knees.',
    descriptionAr: 'الانحناء مع وضع اليدين على الركبتين.',
    postureImageUrl: '/assets/guides/child_praying_ruku_1777486270893.png',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: 'Subhana Rabbiyal Azeem',
    translation: 'Glory be to my Lord, the Almighty',
    translationAr: 'سبحان ربي العظيم'
  },
  itidal: {
    id: 's6',
    stepName: 'I\'tidal (Standing Up)',
    stepNameAr: 'الاعتدال',
    description: 'Rise from Ruku and stand straight.',
    descriptionAr: 'الرفع من الركوع والاعتدال قائماً مع حمد الله.',
    postureImageUrl: IMG_ITIDAL,
    arabicRecitation: 'سَمِعَ اللهُ لِمَنْ حَمِدَه. رَبَّنَا وَلَكَ الْحَمْدُ',
    transliteration: 'Sami\' Allahu liman hamidah. Rabbana walakal hamd',
    translation: 'Allah hears those who praise Him.',
    translationAr: 'سمع الله لمن حمده، ربنا ولك الحمد'
  },
  sujud: {
    id: 's7',
    stepName: 'Sujud (Prostration)',
    stepNameAr: 'السجود',
    description: 'Prostrate on the floor.',
    descriptionAr: 'السجود وقول "سبحان ربي الأعلى" ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_praying_sujud_1777486239724.png',
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
    transliteration: 'Subhana Rabbiyal A\'la',
    translation: 'Glory be to my Lord, the Most High',
    translationAr: 'سبحان ربي الأعلى'
  },
  jalsa: {
    id: 's8',
    stepName: 'Jalsah (Sitting)',
    stepNameAr: 'الجلسة بين السجدتين',
    description: 'Sit upright between the two prostrations.',
    descriptionAr: 'الجلوس بين السجدتين مع وضع اليدين على الفخذين.',
    postureImageUrl: '/assets/guides/child_jalsa_correct_1777486543212.png',
    arabicRecitation: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbigh-fir li',
    translation: 'My Lord, forgive me',
    translationAr: 'رب اغفر لي'
  },
  tashahhud_first: {
    id: 's11',
    stepName: 'Half Tashahhud',
    stepNameAr: 'التشهد الأوسط',
    description: 'Sit upright and recite Attahiyyat.',
    descriptionAr: 'الجلوس للتشهد الأول وقراءة التحيات.',
    postureImageUrl: '/assets/guides/child_tashahhud_pointing_correct_1777486554757.png',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ، وَالصَّلَواتُ وَالطَّيِّباتُ...',
    transliteration: 'At-tahiyyatu lillahi...',
    translation: 'All compliments, prayers and pure works are due to Allah.',
    translationAr: 'التشهد الأوسط كاملاً'
  },
  tashahhud_final: {
    id: 's12',
    stepName: 'Final Tashahhud',
    stepNameAr: 'التشهد الأخير كاملاً',
    description: 'Recite full Tashahhud and the Ibrahimic Prayer.',
    descriptionAr: 'قراءة التشهد كاملاً ثم الصلاة الإبراهيمية.',
    postureImageUrl: '/assets/guides/child_tashahhud_perfect.png',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ... اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ...',
    transliteration: 'At-tahiyyatu lillahi... Allahumma salli \'ala Muhammadin...',
    translation: 'All compliments... O Allah, send prayers upon Muhammad...',
    translationAr: 'التشهد الأخير مع الصلاة الإبراهيمية'
  },
  taslim: {
    id: 's13',
    stepName: 'Taslim (Ending)',
    stepNameAr: 'التسليم',
    description: 'Turn your head right then left.',
    descriptionAr: 'الالتفات يميناً ثم يساراً مع قول السلام.',
    postureImageUrl: '/assets/guides/child_praying_taslim_right_1777486566576.png',
    arabicRecitation: 'السَّلامُ عَلَيْكُمْ وَرَحْمَةُ الله',
    transliteration: 'Assalamu alaikum wa rahmatullah',
    translation: 'Peace and mercy of Allah be upon you',
    translationAr: 'السلام عليكم ورحمة الله'
  }
};

export const prayerDefinitions = {
  fajr: { name: 'Fajr', nameAr: 'الفجر', rakahs: 2, sequence: ['niyyah', 'takbir', 'istiftah', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_final', 'taslim'] },
  dhuhr: { name: 'Dhuhr', nameAr: 'الظهر', rakahs: 4, sequence: ['niyyah', 'takbir', 'istiftah', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_first', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_final', 'taslim'] },
  asr: { name: 'Asr', nameAr: 'العصر', rakahs: 4, sequence: ['niyyah', 'takbir', 'istiftah', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_first', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_final', 'taslim'] },
  maghrib: { name: 'Maghrib', nameAr: 'المغرب', rakahs: 3, sequence: ['niyyah', 'takbir', 'istiftah', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_first', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_final', 'taslim'] },
  isha: { name: 'Isha', nameAr: 'العشاء', rakahs: 4, sequence: ['niyyah', 'takbir', 'istiftah', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_first', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'fatiha', 'ruku', 'itidal', 'sujud', 'jalsa', 'sujud', 'tashahhud_final', 'taslim'] }
};

export const salahSteps: GuideStep[] = Object.values(allSalahSteps);
