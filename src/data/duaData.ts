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
  Wind,
  Star
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
  { id: "comprehensive", en: "Comprehensive", ar: "أدعية جامعة", icon: "Star" },
  { id: "forgiveness", en: "Forgiveness", ar: "الاستغفار", icon: "Sparkles" },
  { id: "hardship", en: "Hardship & Worry", ar: "الهم والحزن", icon: "CloudRain" },
  { id: "knowledge", en: "Knowledge", ar: "العلم والتعلم", icon: "GraduationCap" },
  { id: "health", en: "Health & Healing", ar: "الشفاء", icon: "Stethoscope" },
  { id: "protection", en: "Protection", ar: "التحصين", icon: "Shield" },
  { id: "family", en: "Family", ar: "الأهل والذرية", icon: "Heart" },
  { id: "marriage", en: "Marriage", ar: "الزواج والخطوبة", icon: "Heart" },
  { id: "work", en: "Work & Success", ar: "العمل والنجاح", icon: "GraduationCap" },
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
  {
    id: 29,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua of Adam & Hawa",
    titleAr: "دعاء آدم وحواء عليهما السلام",
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbanā zalamnā anfusanā wa-in lam taghfir lanā wa-tarḥamnā lanakūnanna minal-khāsirīn",
    translationEn: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    translationAr: "ربنا ظلمنا أنفسنا وإن لم تغفر لنا وترحمنا لنكونن من الخاسرين.",
    reference: "Quran 7:23"
  },
  {
    id: 30,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Believers' Mercy",
    titleAr: "دعاء طلب الرحمة للمؤمنين",
    arabic: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    transliteration: "Rabbanā āmannā faghfir lanā warḥamnā wa-anta khayrur-rāḥimīn",
    translationEn: "Our Lord, we have believed, so forgive us and have mercy upon us, and You are the best of the merciful.",
    translationAr: "ربنا آمنا فاغفر لنا وارحمنا وأنت خير الراحمين.",
    reference: "Quran 23:109"
  },
  {
    id: 31,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Guidance and Success",
    titleAr: "دعاء طلب الرشد والرحمة",
    arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    transliteration: "Rabbanā ātinā min ladunka raḥmatan wa-hayyi' lanā min amrinā rashadā",
    translationEn: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    translationAr: "ربنا آتنا من لدنك رحمة وهيئ لنا من أمرنا رشدا.",
    reference: "Quran 18:10"
  },
  {
    id: 32,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Protection from Hell",
    titleAr: "دعاء الوقاية من عذاب جهنم",
    arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا",
    transliteration: "Rabbanāṣ-rif ʿannā ʿadhāba jahannama inna ʿadhābahā kāna gharāmā",
    translationEn: "Our Lord, avert from us the punishment of Hell. Indeed, its punishment is ever adhering.",
    translationAr: "ربنا اصرف عنا عذاب جهنم إن عذابها كان غراماً.",
    reference: "Quran 25:65"
  },
  {
    id: 38,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Creation & Fire",
    titleAr: "دعاء التفكر والوقاية",
    arabic: "رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbanā mā khalaqta hādhā bāṭilan subḥānaka faqinnā ʿadhāban-nār",
    translationEn: "Our Lord, You did not create this aimlessly; exalted are You [above such a thing]; then protect us from the punishment of the Fire.",
    translationAr: "ربنا ما خلقت هذا باطلاً سبحانك فقنا عذاب النار.",
    reference: "Quran 3:191"
  },
  {
    id: 39,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Forgiveness & The Righteous",
    titleAr: "دعاء المغفرة مع الأبرار",
    arabic: "رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ",
    transliteration: "Rabbanā faghfir lanā dhunūbanā wa-kaffir ʿannā sayyi'ātinā wa-tawaffanā maʿal-abrār",
    translationEn: "Our Lord, so forgive us our sins and remove from us our misdeeds and cause us to die with the righteous.",
    translationAr: "ربنا فاغفر لنا ذنوبنا وكفر عنا سيئاتنا وتوفنا مع الأبرار.",
    reference: "Quran 3:193"
  },
  {
    id: 40,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Establishing Prayer",
    titleAr: "دعاء إقامة الصلاة",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbij-ʿalnī muqīmaṣ-ṣalāti wa-min dhurriyyatī Rabbanā wa-taqabbal duʿā'",
    translationEn: "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.",
    translationAr: "رب اجعلني مقيم الصلاة ومن ذريتي ربنا وتقبل دعاء.",
    reference: "Quran 14:40"
  },
  {
    id: 41,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Parents & Believers",
    titleAr: "دعاء للوالدين والمؤمنين",
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbanāgh-fir lī wa-liwālidayya wa-lil-mu'minīna yawma yaqūmul-ḥisāb",
    translationEn: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    translationAr: "ربنا اغفر لي ولوالدي وللمؤمنين يوم يقوم الحساب.",
    reference: "Quran 14:41"
  },
  {
    id: 42,
    category: "quranic",
    categoryAr: "أدعية قرآنية",
    titleEn: "Dua for Gratitude & Righteous Deeds",
    titleAr: "دعاء الشكر والعمل الصالح",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ",
    transliteration: "Rabbi awziʿnī an ashkura niʿmatakal-latī anʿamta ʿalayya wa-ʿalā wālidayya wa-an aʿmala ṣāliḥan tarḍāhu wa-adkhilnī bi-raḥmatika fī ʿibādikaṣ-ṣāliḥīn",
    translationEn: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to do righteousness of which You approve. And admit me by Your mercy into [the ranks of] Your righteous servants.",
    translationAr: "رب أوزعني أن أشكر نعمتك التي أنعمت علي وعلى والدي وأن أعمل صالحاً ترضاه وأدخلني برحمتك في عبادك الصالحين.",
    reference: "Quran 27:19"
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
  {
    id: 33,
    category: "forgiveness",
    categoryAr: "الاستغفار",
    titleEn: "Comprehensive Forgiveness",
    titleAr: "دعاء المغفرة الشامل",
    arabic: "اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي",
    transliteration: "Allāhummagh-fir lī khaṭī'atī wa-jahlī, wa-isrāfī fī amrī, wa-mā anta aʿlamu bihī minnī",
    translationEn: "O Allah, forgive me my sins, my ignorance, my excesses in my affairs and that which You know better than I do.",
    translationAr: "اللهم اغفر لي خطيئتي وجهلي وإسرافي في أمري وما أنت أعلم به مني.",
    reference: "Sahih al-Bukhari & Muslim"
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
  },
  
  // --- Comprehensive (Dua Shamil) ---
  {
    id: 34,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Comprehensive Good",
    titleAr: "دعاء جامع للخير",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ",
    transliteration: "Allāhumma innī as'aluka minal-khayri kullihī, ʿājilihī wa-ājilihī, mā ʿalimtu minhu wa-mā lam aʿlam, wa-aʿūdhu bika minash-sharri kullihī, ʿājilihī wa-ājilihī, mā ʿalimtu minhu wa-mā lam aʿlam",
    translationEn: "O Allah, I ask You for all that is good, in this world and in the Hereafter, what I know and what I do not know. And I seek refuge with You from all evil, in this world and in the Hereafter, what I know and what I do not know.",
    translationAr: "اللهم إني أسألك من الخير كله عاجله وآجله، ما علمت منه وما لم أعلم، وأعوذ بك من الشر كله عاجله وآجله، ما علمت منه وما لم أعلم.",
    reference: "Ibn Majah & Ahmad"
  },
  {
    id: 35,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Rectifying All Affairs",
    titleAr: "دعاء صلاح الشأن",
    arabic: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي",
    transliteration: "Allāhumma aṣliḥ lī dīnī alladhī huwa ʿiṣmatu amrī, wa-aṣliḥ lī dunyāya allatī fīhā maʿāshī, wa-aṣliḥ lī ākhiratī allatī fīhā maʿādī",
    translationEn: "O Allah, set right for me my religion which is the safeguard of my affairs, and set right for me the affairs of my world wherein is my living, and set right for me my Hereafter to which is my return.",
    translationAr: "اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح لي دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي.",
    reference: "Sahih Muslim"
  },
  {
    id: 36,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Seeking Guidance and Piety",
    titleAr: "دعاء الهدى والتقى",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    transliteration: "Allāhumma innī as'alukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā",
    translationEn: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.",
    translationAr: "اللهم إني أسألك الهدى والتقى والعفاف والغنى.",
    reference: "Sahih Muslim"
  },
  {
    id: 37,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Steadfastness of Heart",
    titleAr: "دعاء الثبات",
    arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    transliteration: "Yā muqallibal-qulūbi thabbit qalbī ʿalā dīnik",
    translationEn: "O Turner of the hearts, make my heart steadfast upon Your religion.",
    translationAr: "يا مقلب القلوب ثبت قلبي على دينك.",
    reference: "Jami` at-Tirmidhi"
  },
  {
    id: 43,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Dua for Travel",
    titleAr: "دعاء السفر",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subḥānalladhī sakh-khara lanā hādhā wa-mā kunnā lahū muqrinīn. Wa-innā ilā Rabbinā lamunqalibūn.",
    translationEn: "Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning.",
    translationAr: "سبحان الذي سخر لنا هذا وما كنا له مقرنين، وإنا إلى ربنا لمنقلبون.",
    reference: "Sahih Muslim"
  },
  {
    id: 44,
    category: "hardship",
    categoryAr: "الهم والحزن",
    titleEn: "Dua for Worry & Debt",
    titleAr: "دعاء الهم والدين",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa-ḍalaʿid-dayni wa-ghalabatir-rijāl",
    translationEn: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
    translationAr: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 45,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Dua for Protection from Trials",
    titleAr: "دعاء الاستعاذة من الفتن",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ النَّارِ وَعَذَابِ النَّارِ، وَفِتْنَةِ الْقَبْرِ، وَعَذَابِ الْقَبْرِ، وَشَرِّ فِتْنَةِ الْغِنَى، وَشَرِّ فِتْنَةِ الْفَقْرِ",
    transliteration: "Allāhumma innī aʿūdhu bika min fitnatin-nāri wa-ʿadhābin-nār, wa-fitnatil-qabri wa-ʿadhābil-qabri, wa-sharri fitnatil-ghinā, wa-sharri fitnatil-faqr",
    translationEn: "O Allah, I seek refuge in You from the trial of the Fire and the punishment of the Fire, and from the trial of the grave and the punishment of the grave, and from the evil of the trial of wealth and the evil of the trial of poverty.",
    translationAr: "اللهم إني أعوذ بك من فتنة النار وعذاب النار، وفتنة القبر وعذاب القبر، وشر فتنة الغنى وشر فتنة الفقر.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: 46,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Dua for Wellness",
    titleAr: "دعاء العافية",
    arabic: "اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ",
    transliteration: "Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī, lā ilāha illā Anta",
    translationEn: "O Allah, grant me health in my body, O Allah, grant me health in my hearing, O Allah, grant me health in my sight. There is no god but You.",
    translationAr: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت.",
    reference: "Abu Dawud & Ahmad"
  },
  {
    id: 47,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Dua for Relying on Allah",
    titleAr: "يا حي يا قيوم",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Yā Ḥayyu yā Qayyūmu bi-raḥmatika astaghīth, aṣliḥ lī sha'nī kullahū wa-lā takilnī ilā nafsī ṭarfata ʿayn",
    translationEn: "O Ever-Living One, O Eternal One, by Your mercy I call on You to set right all my affairs. Do not leave me to myself even for the blinking of an eye.",
    translationAr: "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.",
    reference: "Al-Hakim"
  },
  
  // --- Marriage & Engagement ---
  {
    id: 48,
    category: "marriage",
    categoryAr: "الزواج والخطوبة",
    titleEn: "Dua of Musa for Good",
    titleAr: "دعاء موسى عليه السلام",
    arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    transliteration: "Rabbi innī limā anzalta ilayya min khayrin faqīr",
    translationEn: "My Lord, I am in absolute need of the good You send down to me.",
    translationAr: "رب إني لما أنزلت إلي من خير فقير.",
    reference: "Quran 28:24"
  },
  {
    id: 49,
    category: "marriage",
    categoryAr: "الزواج والخطوبة",
    titleEn: "Congratulating for Marriage",
    titleAr: "دعاء التهنئة بالزواج",
    arabic: "بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    transliteration: "Bārakallāhu laka, wa-bāraka ʿalayka, wa-jamaʿa baynakumā fī khayr",
    translationEn: "May Allah bless you, shower His blessings upon you, and join you together in goodness.",
    translationAr: "بارك الله لك، وبارك عليك، وجمع بينكما في خير.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: 50,
    category: "marriage",
    categoryAr: "الزواج والخطوبة",
    titleEn: "Seeking a Righteous Spouse",
    titleAr: "طلب الزوج الصالح",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ زَوْجًا صَالِحًا تَقَرُّ بِهِ عَيْنِي",
    transliteration: "Allāhumma innī as'aluka zawjan ṣāliḥan tuqarru bihī ʿaynī",
    translationEn: "O Allah, I ask You for a righteous spouse, through whom my eyes find comfort.",
    translationAr: "اللهم إني أسألك زوجاً صالحاً تقر به عيني.",
    reference: "Common Dua"
  },

  // --- Work & Success ---
  {
    id: 51,
    category: "work",
    categoryAr: "العمل والنجاح",
    titleEn: "Dua for Knowledge, Provision & Deeds",
    titleAr: "دعاء العلم والرزق والعمل",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً",
    transliteration: "Allāhumma innī as'aluka ʿilman nāfiʿan, wa-rizqan ṭayyiban, wa-ʿamalan mutaqabbalan",
    translationEn: "O Allah, I ask You for beneficial knowledge, good (halal) provision, and accepted deeds.",
    translationAr: "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً.",
    reference: "Ibn Majah"
  },
  {
    id: 52,
    category: "work",
    categoryAr: "العمل والنجاح",
    titleEn: "Sufficiency with Halal",
    titleAr: "دعاء كفاية الحلال",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allāhumma ikfinī bi-ḥalālika ʿan ḥarāmika, wa-aghninī bi-faḍlika ʿamman siwāk",
    translationEn: "O Allah, suffice me with what You have made lawful instead of what You have forbidden, and enrich me by Your bounty so that I need none besides You.",
    translationAr: "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك.",
    reference: "Tirmidhi"
  },
  {
    id: 53,
    category: "work",
    categoryAr: "العمل والنجاح",
    titleEn: "Success in All Matters",
    titleAr: "دعاء النجاح العام",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ النَّجَاحَ فِي جَمِيعِ الْأُمُورِ، وَأَعُوذُ بِكَ مِنَ الْخِذْلَانِ",
    transliteration: "Allāhumma innī as'aluka an-najāḥa fī jamīʿi al-umūr, wa-aʿūdhu bika min al-khidhlān",
    translationEn: "O Allah, I ask You for success in all matters, and I seek refuge in You from failure.",
    translationAr: "اللهم إني أسألك النجاح في جميع الأمور، وأعوذ بك من الخذلان.",
    reference: "Common Dua"
  },

  // --- Protection from Magic & Evil Eye ---
  {
    id: 54,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Protection from Shaitan & Evil Eye",
    titleAr: "التحصين من الشيطان والعين",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَّامَّةٍ",
    transliteration: "Aʿūdhu bi-kalimātillāhi t-tāmmati min kulli shayṭānin wa-hāmmah, wa-min kulli ʿaynin lāmma",
    translationEn: "I seek refuge in the perfect words of Allah from every devil and every poisonous pest, and from every harmful eye.",
    translationAr: "أعوذ بكلمات الله التامة من كل شيطان وهامة، ومن كل عين لامة.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 55,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Surah Al-Falaq",
    titleAr: "سورة الفلق",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (1) مِن شَرِّ مَا خَلَقَ (2) وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ (3) وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (4) وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ (5)",
    transliteration: "Qul aʿūdhu bi-rabbi l-falaq. Min sharri mā khalaq. Wa-min sharri ghāsiqin idhā waqab. Wa-min sharri n-naffāthāti fī l-ʿuqad. Wa-min sharri ḥāsidin idhā ḥasad.",
    translationEn: "Say, 'I seek refuge in the Lord of daybreak, From the evil of that which He created, And from the evil of darkness when it settles, And from the evil of the blowers in knots, And from the evil of an envier when he envies.'",
    translationAr: "قل أعوذ برب الفلق، من شر ما خلق، ومن شر غاسق إذا وقب، ومن شر النفاثات في العقد، ومن شر حاسد إذا حسد.",
    reference: "Quran 113"
  },
  {
    id: 56,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Surah Al-Nas",
    titleAr: "سورة الناس",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ (1) مَلِكِ النَّاسِ (2) إِلَهِ النَّاسِ (3) مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (4) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (5) مِنَ الْجِنَّةِ وَالنَّاسِ (6)",
    transliteration: "Qul aʿūdhu bi-rabbi n-nās. Maliki n-nās. Ilāhi n-nās. Min sharri l-waswāsi l-khannās. Alladhī yuwaswisu fī ṣudūri n-nās. Mina l-jinnati wa-n-nās.",
    translationEn: "Say, 'I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind.'",
    translationAr: "قل أعوذ برب الناس، ملك الناس، إله الناس، من شر الوسواس الخناس، الذي يوسوس في صدور الناس، من الجنة والناس.",
    reference: "Quran 114"
  },
  {
    id: 57,
    category: "protection",
    categoryAr: "التحصين",
    titleEn: "Ayat al-Kursi",
    titleAr: "آية الكرسي",
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allāhu lā ilāha illā Huwa al-Ḥayyu al-Qayyūmu lā ta'khudhuhu sinatun wa-lā nawm luhu mā fī s-samāwāti wa-mā fī l-arḍ man dhā alladhī yashfaʿu ʿindahu illā bi-idhnihi yaʿlamu mā bayna aydīhim wa-mā khalfahum wa-lā yuḥīṭūna bi-shay'in min ʿilmihi illā bi-mā shā'a wasiʿa kursiyyuhu s-samāwāti wal-arḍ wa-lā ya'ūduhu ḥifẓuhumā wa-Huwa al-ʿAliyyu al-ʿAẓīm",
    translationEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    translationAr: "الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم له ما في السماوات وما في الأرض من ذا الذي يشفع عنده إلا بإذنه يعلم ما بين أيديهم وما خلفهم ولا يحيطون بشيء من علمه إلا بما شاء وسع كرسيه السماوات والأرض ولا يئوده حفظهما وهو العلي العظيم.",
    reference: "Quran 2:255"
  },
  {
    id: 58,
    category: "morning-evening",
    categoryAr: "أذكار الصباح والمساء",
    titleEn: "Goodness of the Day",
    titleAr: "دعاء خير اليوم",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ",
    transliteration: "Aṣbaḥnā wa-aṣbaḥal-mulku lillāhi Rabbi l-ʿālamīn, Allāhumma innī as'aluka khayra hādhal-yawm: fatḥahu wa-naṣrahu wa-nūrahu wa-barakatahu wa-hudāhu",
    translationEn: "We have entered a new day and with it all the dominion which belongs to Allah, Lord of all that exists. O Allah, I ask You for the goodness of this day, its victory, its help, its light, its blessings, and its guidance.",
    translationAr: "أصبحنا وأصبح الملك لله رب العالمين، اللهم إني أسألك خير هذا اليوم: فتحه، ونصره، ونوره، وبركته، وهداه.",
    reference: "Abu Dawud"
  },
  {
    id: 59,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Before Sleeping (Submission)",
    titleAr: "دعاء قبل النوم",
    arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ",
    transliteration: "Allāhumma aslamtu nafsī ilayk, wa-fawwaḍtu amrī ilayk, wa-wajjahtu wajhī ilayk, wa-alja'tu ẓahrī ilayk, raghbatan wa-rahbatan ilayk",
    translationEn: "O Allah, I submit my soul to You, and I entrust my affair to You, and I turn my face to You, and I rely on You, out of desire for You and fear of You.",
    translationAr: "اللهم أسلمت نفسي إليك، وفوضت أمري إليك، ووجهت وجهي إليك، وألجأت ظهري إليك، رغبة ورهبة إليك.",
    reference: "Sahih al-Bukhari & Muslim"
  },
  {
    id: 60,
    category: "hardship",
    categoryAr: "الهم والحزن",
    titleEn: "Seeking Relief",
    titleAr: "دعاء الفرج",
    arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration: "Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata ʿayn, wa-aṣliḥ lī sha'nī kullahū lā ilāha illā Anta",
    translationEn: "O Allah, it is Your mercy that I hope for, so do not leave me to myself even for the blinking of an eye, and rectify all my affairs. There is no god but You.",
    translationAr: "اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله لا إله إلا أنت.",
    reference: "Abu Dawud"
  },
  {
    id: 61,
    category: "forgiveness",
    categoryAr: "الاستغفار",
    titleEn: "Detailed Forgiveness",
    titleAr: "دعاء المغفرة التفصيلي",
    arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ وَعَلَانِيَتَهُ وَسِرَّهُ",
    transliteration: "Allāhummagh-fir lī dhanbī kullahū, diqqahu wa-jillahu, wa-awwalahu wa-ākhirahu wa-ʿalāniyatahu wa-sirrahu",
    translationEn: "O Allah, forgive me all my sins, the small and the great, the first and the last, the open and the secret.",
    translationAr: "اللهم اغفر لي ذنبي كله، دقه وجله، وأوله وآخره وعلانيته وسره.",
    reference: "Sahih Muslim"
  },
  {
    id: 62,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Entering the Market",
    titleAr: "دعاء دخول السوق",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahu l-mulku wa-lahu l-ḥamdu yuḥyī wa-yumītu wa-huwa ḥayyun lā yamūtu biyadihi l-khayru wa-huwa ʿalā kulli shay'in qadīr",
    translationEn: "There is no god but Allah alone, Who has no partner, His is the dominion and His is the praise, He gives life and He gives death, and He is Living and does not die, in His Hand is all good, and He is Able to do all things.",
    translationAr: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد يحيي ويميت وهو حي لا يموت بيده الخير وهو على كل شيء قدير.",
    reference: "Tirmidhi & Ibn Majah"
  },
  {
    id: 63,
    category: "daily",
    categoryAr: "الحياة اليومية",
    titleEn: "Entering the Home (Protection)",
    titleAr: "دعاء دخول المنزل",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Allāhumma innī as'aluka khayra l-mawlaji wa-khayra l-makhraji, bismillāhi walajnā, wa-bismillāhi kharajnā, wa-ʿalā Allāhi Rabbinā tawakkalnā",
    translationEn: "O Allah, I ask You for the best entering and the best exiting. In the name of Allah we enter, and in the name of Allah we go out, and upon Allah our Lord we rely.",
    translationAr: "اللهم إني أسألك خير المولج وخير المخرج، باسم الله ولجنا، وباسم الله خرجنا، وعلى الله ربنا توكلنا.",
    reference: "Abu Dawud"
  },
  {
    id: 64,
    category: "comprehensive",
    categoryAr: "أدعية جامعة",
    titleEn: "Seeking Guidance",
    titleAr: "دعاء الهداية",
    arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    transliteration: "Allāhumma-hdinī wa-saddidnī",
    translationEn: "O Allah, guide me and keep me on the right path.",
    translationAr: "اللهم اهدني وسددني.",
    reference: "Sahih Muslim"
  },
  {
    id: 65,
    category: "health",
    categoryAr: "الشفاء",
    titleEn: "Visiting the Sick",
    titleAr: "دعاء زيارة المريض",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    transliteration: "Lā ba'sa ṭahūrun in shā' Allāh",
    translationEn: "No harm, it will be a purification [from sins], if Allah wills.",
    translationAr: "لا بأس طهور إن شاء الله.",
    reference: "Sahih al-Bukhari"
  },
  {
    id: 66,
    category: "family",
    categoryAr: "الأهل والذرية",
    titleEn: "Blessing for Newborn",
    titleAr: "دعاء للمولود",
    arabic: "بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ",
    transliteration: "Bārakallāhu laka fī l-mawhūbi laka, wa-shakarta l-wāhiba, wa-balagha ashuddahu, wa-ruziqta birrahu",
    translationEn: "May Allah bless you in what He has given you, and may you be grateful to the Giver, and may he (the child) reach the age of strength, and may you be granted his righteousness.",
    translationAr: "بارك الله لك في الموهوب لك، وشكرت الواهب، وبلغ أشده، ورزقت بره.",
    reference: "Common Blessing"
  }
];




