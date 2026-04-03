export interface AdhkarItem {
  id: string;
  text: string;
  translation: string;
  count: number;
  benefit: string;
  benefitEn: string;
}

export const morningAdhkar: AdhkarItem[] = [
  {
    id: "m1",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty...",
    count: 1,
    benefit: "من قالها حين يصبح أجير من الجن حتى يمسي",
    benefitEn: "Whoever says it in the morning will be protected from Jinn until evening"
  },
  {
    id: "m2",
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    translation: "O Allah, by Your grace we have reached the morning and by Your grace we have reached the evening...",
    count: 1,
    benefit: "سنة نبوية",
    benefitEn: "Prophetic Sunnah"
  },
  {
    id: "m3",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إلاَّ أَنْتَ",
    translation: "O Allah, You are my Lord, there is none worthy of worship but You. You created me and I am your slave...",
    count: 1,
    benefit: "سيد الاستغفار، من قالها موقناً بها فمات من يومه دخل الجنة",
    benefitEn: "The Master of Forgiveness, whoever says it with conviction and dies that day enters Paradise"
  },
  {
    id: "m4",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    translation: "Glory be to Allah and praise is to Him, as much as the number of His creation...",
    count: 3,
    benefit: "تعدل أضعافاً مضاعفة من الذكر",
    benefitEn: "Equivalent to many times of regular Dhikr"
  }
];

export const eveningAdhkar: AdhkarItem[] = [
  {
    id: "e1",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty...",
    count: 1,
    benefit: "حفظ من الجن",
    benefitEn: "Protection from Jinn"
  },
  {
    id: "e2",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    translation: "O Allah, by Your grace we have reached the evening and by Your grace we have reached the morning...",
    count: 1,
    benefit: "سنة نبوية",
    benefitEn: "Prophetic Sunnah"
  },
  {
    id: "e3",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
    count: 3,
    benefit: "لم تضره حمة (لدغة) تلك الليلة",
    benefitEn: "No sting or bite will harm him that night"
  }
];

export const dailySunnan = [
  { title: "السواك", titleEn: "Siwak", description: "استخدام السواك عند الوضوء والصلاة", descriptionEn: "Using Siwak during Wudu and Prayer" },
  { title: "صلاة الضحى", titleEn: "Duha Prayer", description: "صلاة ركعتين أو أكثر بعد شروق الشمس", descriptionEn: "Praying two or more units after sunrise" },
  { title: "قراءة سورة الملك", titleEn: "Surah Al-Mulk", description: "قراءتها قبل النوم للمنجية من عذاب القبر", descriptionEn: "Reading it before sleep as protection from the grave" },
  { title: "الوضوء قبل النوم", titleEn: "Wudu before sleep", description: "النوم على طهارة", descriptionEn: "Sleeping in a state of purity" }
];
