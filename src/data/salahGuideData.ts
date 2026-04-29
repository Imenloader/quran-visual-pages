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

export const wuduSteps: GuideStep[] = [
  {
    id: 'w1',
    stepName: 'Niyyah (Intention)',
    stepNameAr: 'النية',
    description: 'Make the intention in your heart to perform Wudu for the sake of Allah.',
    descriptionAr: 'عزم القلب على فعل الوضوء طاعة لله تعالى.',
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png'
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
    postureImageUrl: '/assets/guides/child_wudu_face_1777486284568.png'
  },
  {
    id: 'w4',
    stepName: 'Inhaling Water',
    stepNameAr: 'الاستنشاق',
    description: 'Sniff water into your nose and blow it out three times.',
    descriptionAr: 'جذب الماء بالأنف ثم إخراجه ثلاث مرات.',
    postureImageUrl: '/assets/guides/child_wudu_face_1777486284568.png'
  },
  {
    id: 'w5',
    stepName: 'Washing Face',
    stepNameAr: 'غسل الوجه',
    description: 'Wash your entire face three times, from hair-line to chin and ear to ear.',
    descriptionAr: 'غسل الوجه كاملاً ثلاث مرات من منابت الشعر إلى أسفل الذقن ومن الأذن إلى الأذن.',
    postureImageUrl: '/assets/guides/child_wudu_face_1777486284568.png'
  },
  {
    id: 'w6',
    stepName: 'Washing Arms',
    stepNameAr: 'غسل اليدين للمرفقين',
    description: 'Wash your right arm up to and including the elbow three times, then the left arm.',
    descriptionAr: 'غسل اليد اليمنى من أطراف الأصابع إلى المرفق ثلاث مرات، ثم اليسرى مثلها.',
    postureImageUrl: '/assets/guides/child_wudu_hands_1777486227949.png'
  },
  {
    id: 'w7',
    stepName: 'Wiping Head',
    stepNameAr: 'مسح الرأس والأذنين',
    description: 'Wipe your head with wet hands once, then wipe the inside and outside of your ears.',
    descriptionAr: 'مسح الرأس مرة واحدة من الأمام إلى الخلف ثم مسح الأذنين من الداخل والخارج.',
    postureImageUrl: '/assets/guides/child_wudu_face_1777486284568.png'
  },
  {
    id: 'w8',
    stepName: 'Washing Feet',
    stepNameAr: 'غسل الرجلين',
    description: 'Wash your right foot up to and including the ankles three times, then the left foot.',
    descriptionAr: 'غسل الرجل اليمنى إلى الكعبين ثلاث مرات مع تخليل الأصابع، ثم اليسرى مثلها.',
    postureImageUrl: '/assets/guides/child_wudu_feet_1777486318686.png'
  }
];

export const allSalahSteps: Record<string, GuideStep> = {
  niyyah: {
    id: 's1',
    stepName: 'Intention (Niyyah)',
    stepNameAr: 'النية',
    description: 'Formulate the intention in your heart to pray and face the Qiblah.',
    descriptionAr: 'استحضار النية في القلب للصلاة والتوجه نحو القبلة.',
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png'
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
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png',
    arabicRecitation: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration: 'Subhanaka Allahumma...',
    translation: 'Glory be to You, O Allah...',
    translationAr: 'سبحانك اللهم وبحمدك...'
  },
  fatiha: {
    id: 's4',
    stepName: 'Qiyam & Recitation',
    stepNameAr: 'القيام والقراءة',
    description: 'Recite Surah Al-Fatiha and another Surah.',
    descriptionAr: 'قراءة سورة الفاتحة وما تيسر من القرآن الكريم.',
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png',
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...',
    transliteration: 'Bismillahir Rahmanir Rahim...',
    translation: 'In the name of Allah...',
    translationAr: 'الحمد لله رب العالمين...'
  },
  ruku: {
    id: 's5',
    stepName: 'Ruku (Bowing)',
    stepNameAr: 'الركوع',
    description: 'Bow down with hands on knees and back straight.',
    descriptionAr: 'الانحناء مع وضع اليدين على الركبتين وقول "سبحان ربي العظيم" ثلاث مرات.',
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
    postureImageUrl: '/assets/guides/child_praying_takbir_1777486213577.png',
    arabicRecitation: 'سَمِعَ اللهُ لِمَنْ حَمِدَه. رَبَّنَا وَلَكَ الْحَمْدُ',
    transliteration: 'Sami\' Allahu liman hamidah...',
    translation: 'Allah hears those who praise Him...',
    translationAr: 'سمع الله لمن حمده، ربنا ولك الحمد'
  },
  sujud: {
    id: 's7',
    stepName: 'Sujud (Prostration)',
    stepNameAr: 'السجود',
    description: 'Prostrate on the floor and say Tasbih three times.',
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
    description: 'Sit upright between the two prostrations with hands on knees.',
    descriptionAr: 'الجلوس بين السجدتين مع وضع اليدين على الفخذين والدعاء بالمغفرة.',
    postureImageUrl: '/assets/guides/child_jalsa_correct_1777486543212.png',
    arabicRecitation: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbigh-fir li',
    translation: 'My Lord, forgive me',
    translationAr: 'رب اغفر لي'
  },
  tashahhud_first: {
    id: 's11',
    stepName: 'First Tashahhud',
    stepNameAr: 'التشهد الأول',
    description: 'Sit and recite the first part of Tashahhud with index finger pointing.',
    descriptionAr: 'الجلوس للتشهد الأول مع الإشارة بالسبابة.',
    postureImageUrl: '/assets/guides/child_tashahhud_pointing_correct_1777486554757.png',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.',
    transliteration: 'At-tahiyyatu lillahi...',
    translation: 'All compliments are for Allah...',
    translationAr: 'التحيات لله والصلوات والطيبات...'
  },
  tashahhud_final: {
    id: 's12',
    stepName: 'Final Tashahhud & Ibrahimic Prayer',
    stepNameAr: 'التشهد الأخير والصلاة الإبراهيمية',
    description: 'Recite full Tashahhud and the Ibrahimic Prayer.',
    descriptionAr: 'قراءة التشهد كاملاً ثم الصلاة الإبراهيمية قبل التسليم.',
    postureImageUrl: '/assets/guides/child_tashahhud_pointing_correct_1777486554757.png',
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ... اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ...',
    transliteration: 'At-tahiyyatu lillahi... Allahumma salli \'ala Muhammad...',
    translation: 'All compliments... O Allah, send prayers upon Muhammad...',
    translationAr: 'التحيات لله... اللهم صل على محمد وعلى آل محمد...'
  },
  taslim: {
    id: 's13',
    stepName: 'Taslim (Ending)',
    stepNameAr: 'التسليم',
    description: 'Turn your head right then left saying Salaam.',
    descriptionAr: 'الالتفات يميناً ثم يساراً مع قول "السلام عليكم ورحمة الله".',
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

// For backward compatibility or simpler views
export const salahSteps: GuideStep[] = Object.values(allSalahSteps);
