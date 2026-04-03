export interface HajjStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  dua: string;
  duaEn: string;
  type: "hajj" | "umrah" | "both";
  order: number;
}

export const hajjSteps: HajjStep[] = [
  {
    id: "ihram",
    title: "الإحرام",
    titleEn: "Ihram",
    description: "نية الدخول في النسك والاغتسال ولبس ملابس الإحرام.",
    descriptionEn: "The intention to enter the state of pilgrimage, bathing, and wearing Ihram clothing.",
    dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",
    duaEn: "Labbayk Allahumma Labbayk, Labbayka la sharika laka Labbayk, Innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    type: "both",
    order: 1
  },
  {
    id: "tawaf",
    title: "الطواف",
    titleEn: "Tawaf",
    description: "الطواف حول الكعبة المشرفة سبعة أشواط.",
    descriptionEn: "Circumambulating the Holy Kaaba seven times.",
    dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    duaEn: "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and save us from the punishment of the Fire",
    type: "both",
    order: 2
  },
  {
    id: "sai",
    title: "السعي",
    titleEn: "Sa'i",
    description: "السعي بين الصفا والمروة سبعة أشواط.",
    descriptionEn: "Walking between Safa and Marwa seven times.",
    dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ",
    duaEn: "Indeed, Safa and Marwa are among the symbols of Allah. So whoever makes Hajj to the House or performs Umrah - there is no blame upon him for walking between them. And whoever volunteers good - then indeed, Allah is appreciative and Knowing.",
    type: "both",
    order: 3
  },
  {
    id: "mina",
    title: "المبيت بمنى",
    titleEn: "Staying in Mina",
    description: "التوجه إلى منى في يوم التروية (8 ذو الحجة).",
    descriptionEn: "Heading to Mina on the Day of Tarwiyah (8th Dhul-Hijjah).",
    dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",
    duaEn: "Labbayk Allahumma Labbayk, Labbayka la sharika laka Labbayk, Innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    type: "hajj",
    order: 4
  },
  {
    id: "arafat",
    title: "الوقوف بعرفة",
    titleEn: "Standing at Arafat",
    description: "الركن الأعظم للحج، الوقوف بعرفة من الزوال حتى الغروب (9 ذو الحجة).",
    descriptionEn: "The greatest pillar of Hajj, standing at Arafat from noon until sunset (9th Dhul-Hijjah).",
    dua: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    duaEn: "There is none worthy of worship but Allah alone, He has no partner, His is the dominion and His is the praise, and He is Able to do all things",
    type: "hajj",
    order: 5
  }
];

export const packingChecklist = [
  { item: "ملابس الإحرام", itemEn: "Ihram Clothing", category: "essentials" },
  { item: "جواز السفر والأوراق", itemEn: "Passport & Documents", category: "essentials" },
  { item: "سجادة صلاة خفيفة", itemEn: "Light Prayer Mat", category: "essentials" },
  { item: "مصحف جيب", itemEn: "Pocket Quran", category: "spiritual" },
  { item: "شاحن متنقل", itemEn: "Power Bank", category: "electronics" },
  { item: "أدوية أساسية", itemEn: "Basic Medications", category: "health" },
  { item: "مظلة شمسية", itemEn: "Sun Umbrella", category: "essentials" }
];
