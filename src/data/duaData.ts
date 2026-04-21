import { 
  Heart, 
  Shield, 
  Sparkles, 
  Sun,
  Moon,
  CloudRain,
  GraduationCap,
  Stethoscope,
  Brain,
  LayoutGrid,
  BookOpen,
  Home,
  Utensils,
  Moon as MoonIcon,
  Wind
} from "lucide-react";

export interface Dua {
  id: number;
  category: string;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationAr: string;
  reference: string;
}

export const duaCategories = [
  { id: "all", en: "All", ar: "الكل", icon: "LayoutGrid" },
  { id: "quranic", en: "Quranic", ar: "أدعية قرآنية", icon: "BookOpen" },
  { id: "morning-evening", en: "Morning & Evening", ar: "أذكار الصباح والمساء", icon: "Sun" },
  { id: "forgiveness", en: "Forgiveness", ar: "الاستغفار", icon: "Sparkles" },
  { id: "hardship", en: "Hardship & Worry", ar: "الهم والحزن", icon: "CloudRain" },
  { id: "knowledge", en: "Knowledge", ar: "العلم والتعلم", icon: "GraduationCap" },
  { id: "health", en: "Health & Healing", ar: "الشفاء", icon: "Stethoscope" },
  { id: "protection", en: "Protection", ar: "التحصين", icon: "Shield" },
  { id: "family", en: "Family", ar: "الأهل والذرية", icon: "Heart" },
  { id: "daily", en: "Daily Life", ar: "الحياة اليومية", icon: "Home" },
];

export const allDuas: Dua[] = [
  // --- Quranic (Rabbana) ---
  {
    id: 1,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Acceptance",
    titleAr: "دعاء القبول",
    arabic: "رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Rabbana taqabbal minna innaka antas Samee'ul Aleem",
    translationEn: "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.",
    translationAr: "ربنا تقبل منا إنك أنت السميع العليم.",
    reference: "Quran 2:127"
  },
  {
    id: 2,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Success in Both Worlds",
    titleAr: "دعاء خيري الدنيا والآخرة",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid dunya hasanatan wa fil akhirati hasanatan wa qina 'adhaban nar",
    translationEn: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
    translationAr: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.",
    reference: "Quran 2:201"
  },
  {
    id: 3,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Patience & Victory",
    titleAr: "دعاء الصبر والنصر",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    transliteration: "Rabbana afrigh 'alaina sabran wa thabbit aqdamana wansurna 'alal qawmil kafireen",
    translationEn: "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.",
    translationAr: "ربنا أفرغ علينا صبراً وثبت أقدامنا وانصرنا على القوم الكافرين.",
    reference: "Quran 2:250"
  },
  {
    id: 4,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Forgiveness (Final verses of Baqarah)",
    titleAr: "دعاء الاستغفار",
    arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    transliteration: "Rabbana la tu'akhidhna in naseena aw akhta'na. Rabbana wala tahmil 'alaina isran kama hamaltahu 'alal-ladheena min qablina. Rabbana wala tuhammilna ma la taqata lana bihi. Wa'fu 'anna waghfir lana warhamna. Anta mawlana fansurna 'alal qawmil kafireen.",
    translationEn: "Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.",
    translationAr: "ربنا لا تؤاخذنا إن نسينا أو أخطأنا، ربنا ولا تحمل علينا إصراً كما حملته على الذين من قبلنا، ربنا ولا تحملنا ما لا طاقة لنا به، واعف عنا واغفر لنا وارحمنا، أنت مولانا فانصرنا على القوم الكافرين.",
    reference: "Quran 2:286"
  },
  {
    id: 5,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Steadfastness",
    titleAr: "دعاء الثبات على الحق",
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaitana wa hab lana mil ladunka rahmah innaka antal Wahhab",
    translationEn: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.",
    translationAr: "ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة إنك أنت الوهاب.",
    reference: "Quran 3:8"
  },
  {
    id: 6,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua of Yunus (The Belly of the Whale)",
    titleAr: "دعاء ذي النون (يونس عليه السلام)",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minath thalimeen",
    translationEn: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    translationAr: "لا إله إلا أنت سبحانك إني كنت من الظالمين.",
    reference: "Quran 21:87"
  },
  {
    id: 7,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Offspring and Spouse",
    titleAr: "دعاء للزوجة والذرية",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyatina qurrata a'yunin waj'alna lil muttaqeena imama",
    translationEn: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
    translationAr: "ربنا هب لنا من أزواجنا وذرياتنا قرة أعين واجعلنا للمتقين إماماً.",
    reference: "Quran 25:74"
  },
  {
    id: 8,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Parents",
    titleAr: "دعاء للوالدين",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbi-rhamhuma kama rabbayani sagheera",
    translationEn: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    translationAr: "رب ارحمهما كما ربياني صغيراً.",
    reference: "Quran 17:24"
  },

  // --- Forgiveness & Repentance ---
  {
    id: 9,
    category: "forgiveness",
    categoryAr: "الاستغفار",
    titleEn: "Sayyidul Istighfar (Master of Forgiveness)",
    titleAr: "سيد الاستغفار",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidhanbi faghfir li, fa-innahu la yaghfirudh-dhunuba illa anta",
    translationEn: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil which I have committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for none can forgive sins except You.",
    translationAr: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء لك بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 10,
    category: "forgiveness",
    categoryAr: "الاستغفار",
    titleEn: "Short Istighfar",
    titleAr: "استغفار قصير",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha wa atubu ilayh",
    translationEn: "I seek Allah's forgiveness and turn to Him in repentance.",
    translationAr: "أستغفر الله وأتوب إليه.",
    reference: "Bukhari & Muslim"
  },

  // --- Morning & Evening (Azkar) ---
  {
    id: 11,
    category: "morning-evening",
    categoryAr: "أذكار الصباح والمساء",
    titleEn: "Protection from All Harm",
    titleAr: "الحماية من كل ضرر",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim",
    translationEn: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    translationAr: "باسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    reference: "Abu Dawud & Tirmidhi (3 times)"
  },
  {
    id: 12,
    category: "morning-evening",
    categoryAr: "أذكار الصباح والمساء",
    titleEn: "Seeking Wellness",
    titleAr: "دعاء العافية",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah",
    translationEn: "O Allah, I ask You for pardon and wellness in this world and the hereafter.",
    translationAr: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
    reference: "Abu Dawud & Ibn Majah"
  },

  // --- Hardship, Worry & Anxiety ---
  {
    id: 13,
    category: "hardship",
    categoryAr: "الهم والحزن",
    titleEn: "Dua for Anxiety and Sorrow",
    titleAr: "دعاء الهم والحزن",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni, wa ghalabatir-rijal",
    translationEn: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
    translationAr: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 14,
    category: "hardship",
    categoryAr: "الهم والحزن",
    titleEn: "Allah is Sufficient for me",
    titleAr: "حسبي الله",
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azheem",
    translationEn: "Allah is sufficient for me. There is no deity except Him. In Him I have put my trust and He is the Lord of the Great Throne.",
    translationAr: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
    reference: "Abu Dawud (7 times)"
  },

  // --- Knowledge & Learning ---
  {
    id: 15,
    category: "knowledge",
    categoryAr: "العلم والتعلم",
    titleEn: "Seeking Increase in Knowledge",
    titleAr: "طلب زيادة العلم",
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translationEn: "My Lord, increase me in knowledge.",
    translationAr: "ربِ زدني علماً.",
    reference: "Quran 20:114"
  },
  {
    id: 16,
    category: "knowledge",
    categoryAr: "العلم والتعلم",
    titleEn: "Opening the Heart for Understanding",
    titleAr: "دعاء شرح الصدر",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbi-shrah li sadri, wa yassir li amri, wahlul 'uqdatan min lisani yafqahu qawli",
    translationEn: "My Lord, expand for me my breast [with assurance] and ease for me my task and untie the knot from my tongue that they may understand my speech.",
    translationAr: "ربِ اشرح لي صدري ويسر لي أمري واحلل عقدة من لساني يفقهوا قولي.",
    reference: "Quran 20:25-28"
  },

  // --- Health & Healing ---
  {
    id: 17,
    category: "health",
    categoryAr: "الشفاء",
    titleEn: "Dua for the Sick",
    titleAr: "دعاء للمريض",
    arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا",
    transliteration: "Adhibil-ba'sa Rabba-nnas, ishfi wa Antash-Shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
    translationEn: "Remove the hardship, O Lord of mankind, grant cure for You are the Healer. There is no cure but from You, a cure which leaves no illness behind.",
    translationAr: "أذهب البأس رب الناس، اشف وأنت الشافي، لا شفاء إلا شفاؤك، شفاءً لا يغادر سقماً.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 18,
    category: "health",
    categoryAr: "الشفاء",
    titleEn: "Dua of Ayyub (Patience in Illness)",
    titleAr: "دعاء أيوب عليه السلام",
    arabic: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    transliteration: "Anni massaniyad-durru wa anta arhamur-rahimeen",
    translationEn: "Indeed, adversity has touched me, and you are the most merciful of the merciful.",
    translationAr: "أني مسني الضر وأنت أرحم الراحمين.",
    reference: "Quran 21:83"
  },

  // --- Protection ---
  {
    id: 19,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Protection with Allah's Words",
    titleAr: "الاستعاذة بكلمات الله",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translationEn: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    translationAr: "أعوذ بكلمات الله التامات من شر ما خلق.",
    reference: "Sahih Muslim"
  },
  {
    id: 20,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Seeking Refuge from Shaitan",
    titleAr: "الاستعاذة من الشيطان",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajeem",
    translationEn: "I seek refuge in Allah from the accursed Shaitan.",
    translationAr: "أعوذ بالله من الشيطان الرجيم.",
    reference: "Common"
  },

  // --- Daily Life ---
  {
    id: 21,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Before Eating",
    titleAr: "قبل الأكل",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translationEn: "In the name of Allah.",
    translationAr: "بسم الله.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: 22,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "After Eating",
    titleAr: "بعد الأكل",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha, wa razaqanihi min ghayri hawlin minni wa la quwwatin",
    translationEn: "Praise is to Allah who has fed me this and provided it for me without any might or power from myself.",
    translationAr: "الحمد لله الذي أطعمني هذا، ورزقنيه من غير حول مني ولا قوة.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: 23,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Before Sleeping",
    titleAr: "قبل النوم",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translationEn: "In Your Name, O Allah, I die and I live.",
    translationAr: "باسمك اللهم أموت وأحيا.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 24,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Upon Waking Up",
    titleAr: "عند الاستيقاظ",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translationEn: "Praise is to Allah Who gives us life after He has caused us to die and to Him is the return.",
    translationAr: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 25,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Entering the Home",
    titleAr: "دخول المنزل",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    translationEn: "In the name of Allah we enter, and in the name of Allah we go out, and upon our Lord we rely.",
    translationAr: "بسم الله ولجنا، وبسم الله خرجنا، وعلى ربنا توكلنا.",
    reference: "Abu Dawud"
  },
  {
    id: 26,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Leaving the Home",
    titleAr: "الخروج من المنزل",
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    translationEn: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
    translationAr: "بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: 27,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Entering the Mosque",
    titleAr: "دخول المسجد",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma-ftah li abwaba rahmatik",
    translationEn: "O Allah, open for me the gates of Your mercy.",
    translationAr: "اللهم افتح لي أبواب رحمتك.",
    reference: "Sahih Muslim"
  },
  {
    id: 28,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Leaving the Mosque",
    titleAr: "الخروج من المسجد",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    translationEn: "O Allah, I ask You from Your favor.",
    translationAr: "اللهم إني أسألك من فضلك.",
    reference: "Sahih Muslim"
  }
];
