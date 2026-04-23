export interface Question {
  id: number;
  category: "quran" | "fiqh" | "sahaba";
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    category: "quran",
    questionEn: "Which Surah is known as the 'Heart of the Quran'?",
    questionAr: "أي سورة تُعرف بـ 'قلب القرآن'؟",
    optionsEn: ["Surah Al-Baqarah", "Surah Yaseen", "Surah Al-Mulk", "Surah Al-Ikhlas"],
    optionsAr: ["سورة البقرة", "سورة يس", "سورة الملك", "سورة الإخلاص"],
    correctIndex: 1,
    explanationEn: "Surah Yaseen is often referred to as the heart of the Quran in various traditions.",
    explanationAr: "سورة يس غالباً ما يُشار إليها بقلب القرآن في العديد من الأحاديث والآثار."
  },
  {
    id: 2,
    category: "sahaba",
    questionEn: "Who was the first person to embrace Islam among women?",
    questionAr: "من هي أول من أسلم من النساء؟",
    optionsEn: ["Aisha (RA)", "Fatima (RA)", "Khadijah (RA)", "Sumayyah (RA)"],
    optionsAr: ["عائشة رضي الله عنها", "فاطمة رضي الله عنها", "خديجة رضي الله عنها", "سمية رضي الله عنها"],
    correctIndex: 2,
    explanationEn: "Khadijah bint Khuwaylid (RA), the Prophet's first wife, was the first person to believe in his message.",
    explanationAr: "خديجة بنت خويلد رضي الله عنها، زوجة النبي الأولى، كانت أول من آمن برسالته."
  },
  {
    id: 3,
    category: "fiqh",
    questionEn: "How many pillars of Islam are there?",
    questionAr: "كم عدد أركان الإسلام؟",
    optionsEn: ["3", "4", "5", "6"],
    optionsAr: ["٣", "٤", "٥", "٦"],
    correctIndex: 2,
    explanationEn: "The five pillars are Shahada, Salah, Zakat, Sawm, and Hajj.",
    explanationAr: "أركان الإسلام الخمسة هي: الشهادة، الصلاة، الزكاة، الصوم، والحج."
  },
  {
    id: 4,
    category: "quran",
    questionEn: "What is the longest Surah in the Holy Quran?",
    questionAr: "ما هي أطول سورة في القرآن الكريم؟",
    optionsEn: ["Surah Al-Imran", "Surah Al-Nisa", "Surah Al-Baqarah", "Surah Al-Ma'idah"],
    optionsAr: ["سورة آل عمران", "سورة النساء", "سورة البقرة", "سورة المائدة"],
    correctIndex: 2,
    explanationEn: "Surah Al-Baqarah is the longest Surah with 286 verses.",
    explanationAr: "سورة البقرة هي أطول سورة في القرآن الكريم وتتكون من ٢٨٦ آية."
  },
  {
    id: 5,
    category: "sahaba",
    questionEn: "Who was known as 'As-Siddiq' (The Truthful)?",
    questionAr: "من الذي لُقب بـ 'الصديق'؟",
    optionsEn: ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan", "Ali ibn Abi Talib"],
    optionsAr: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"],
    correctIndex: 1,
    explanationEn: "Abu Bakr (RA) was given this title by the Prophet (PBUH) for his immediate belief in the Isra and Mi'raj.",
    explanationAr: "لُقب أبو بكر رضي الله عنه بهذا اللقب من قبل النبي صلى الله عليه وسلم لتصديقه الفوري لرحلة الإسراء والمعراج."
  },
  {
    id: 6,
    category: "quran",
    questionEn: "How many Surahs are there in the Holy Quran?",
    questionAr: "كم عدد سور القرآن الكريم؟",
    optionsEn: ["110", "114", "120", "124"],
    optionsAr: ["١١٠", "١١٤", "١٢٠", "١٢٤"],
    correctIndex: 1,
    explanationEn: "The Holy Quran consists of 114 Surahs.",
    explanationAr: "يتكون القرآن الكريم من ١١٤ سورة."
  },
  {
    id: 7,
    category: "sahaba",
    questionEn: "Who was the first Muadhin (caller to prayer) in Islam?",
    questionAr: "من هو أول مؤذن في الإسلام؟",
    optionsEn: ["Abu Bakr (RA)", "Umar (RA)", "Bilal ibn Rabah (RA)", "Ali (RA)"],
    optionsAr: ["أبو بكر رضي الله عنه", "عمر رضي الله عنه", "بلال بن رباح رضي الله عنه", "علي رضي الله عنه"],
    correctIndex: 2,
    explanationEn: "Bilal ibn Rabah (RA) was chosen by the Prophet (PBUH) to be the first Muadhin.",
    explanationAr: "اختار النبي صلى الله عليه وسلم بلال بن رباح رضي الله عنه ليكون أول مؤذن في الإسلام."
  },
  {
    id: 8,
    category: "fiqh",
    questionEn: "What is the first month of the Islamic (Hijri) calendar?",
    questionAr: "ما هو الشهر الأول في التقويم الهجري؟",
    optionsEn: ["Ramadan", "Muharram", "Shawwal", "Dhul-Hijjah"],
    optionsAr: ["رمضان", "محرم", "شوال", "ذو الحجة"],
    correctIndex: 1,
    explanationEn: "Muharram is the first month of the Islamic lunar calendar.",
    explanationAr: "شهر محرم هو أول شهر في السنة الهجرية."
  },
  {
    id: 9,
    category: "quran",
    questionEn: "Which Surah does not start with Bismillah?",
    questionAr: "ما هي السورة التي لا تبدأ بالبسملة؟",
    optionsEn: ["Surah Al-Fatihah", "Surah Al-Ikhlas", "Surah At-Tawbah", "Surah An-Nas"],
    optionsAr: ["سورة الفاتحة", "سورة الإخلاص", "سورة التوبة", "سورة الناس"],
    correctIndex: 2,
    explanationEn: "Surah At-Tawbah is the only Surah in the Quran that does not begin with Bismillah.",
    explanationAr: "سورة التوبة هي السورة الوحيدة في القرآن التي لا تبدأ بالبسملة."
  },
  {
    id: 10,
    category: "sahaba",
    questionEn: "Who was known as 'The Sword of Allah'?",
    questionAr: "من هو الصحابي الملقب بـ 'سيف الله المسلول'؟",
    optionsEn: ["Khalid ibn al-Walid", "Hamza ibn Abdul-Muttalib", "Sa'd ibn Abi Waqqas", "Ja'far ibn Abi Talib"],
    optionsAr: ["خالد بن الوليد", "حمزة بن عبد المطلب", "سعد بن أبي وقاص", "جعفر بن أبي طالب"],
    correctIndex: 0,
    explanationEn: "The Prophet (PBUH) gave Khalid ibn al-Walid (RA) the title 'Saifullah' (The Sword of Allah).",
    explanationAr: "لقب النبي صلى الله عليه وسلم خالد بن الوليد رضي الله عنه بـ 'سيف الله المسلول'."
  },
  {
    id: 11,
    category: "fiqh",
    questionEn: "How many times is Salah (prayer) obligatory per day?",
    questionAr: "كم عدد الصلوات المفروضة في اليوم؟",
    optionsEn: ["3", "4", "5", "6"],
    optionsAr: ["٣", "٤", "٥", "٦"],
    correctIndex: 2,
    explanationEn: "Muslims are required to perform five daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha.",
    explanationAr: "يجب على المسلم أداء خمس صلوات في اليوم: الفجر، الظهر، العصر، المغرب، والعشاء."
  },
  {
    id: 12,
    category: "quran",
    questionEn: "In which month was the Holy Quran first revealed?",
    questionAr: "في أي شهر نزل القرآن الكريم لأول مرة؟",
    optionsEn: ["Muharram", "Rajab", "Ramadan", "Dhul-Hijjah"],
    optionsAr: ["محرم", "رجب", "رمضان", "ذو الحجة"],
    correctIndex: 2,
    explanationEn: "The Quran was first revealed to the Prophet (PBUH) during the month of Ramadan, specifically on Laylat al-Qadr.",
    explanationAr: "نزل القرآن الكريم لأول مرة على النبي صلى الله عليه وسلم في شهر رمضان، وتحديداً في ليلة القدر."
  },
  {
    id: 13,
    category: "sahaba",
    questionEn: "Who was the youngest Sahabi to lead an army?",
    questionAr: "من هو أصغر صحابي قاد جيشاً؟",
    optionsEn: ["Ali ibn Abi Talib", "Usama ibn Zayd", "Zayd ibn Harithah", "Mus'ab ibn Umayr"],
    optionsAr: ["علي بن أبي طالب", "أسامة بن زيد", "زيد بن حارثة", "مصعب بن عمير"],
    correctIndex: 1,
    explanationEn: "Usama ibn Zayd (RA) was appointed by the Prophet (PBUH) to lead an army at the age of 18.",
    explanationAr: "عين النبي صلى الله عليه وسلم أسامة بن زيد رضي الله عنه قائداً للجيش وهو في سن الثامنة عشرة."
  },
  {
    id: 14,
    category: "fiqh",
    questionEn: "What is the direction of prayer (Qibla) for Muslims?",
    questionAr: "ما هي القبلة التي يتجه إليها المسلمون في صلاتهم؟",
    optionsEn: ["Al-Aqsa Mosque", "The Kaaba in Makkah", "The Prophet's Mosque", "Mount Sinai"],
    optionsAr: ["المسجد الأقصى", "الكعبة المشرفة في مكة", "المسجد النبوي", "جبل سيناء"],
    correctIndex: 1,
    explanationEn: "The Kaaba in Makkah is the Qibla for all Muslims around the world.",
    explanationAr: "الكعبة المشرفة في مكة المكرمة هي قبلة المسلمين في جميع أنحاء العالم."
  },
  {
    id: 15,
    category: "quran",
    questionEn: "Which Prophet is mentioned most by name in the Quran?",
    questionAr: "من هو النبي الذي ذكر اسمه أكثر في القرآن الكريم؟",
    optionsEn: ["Prophet Muhammad (PBUH)", "Prophet Ibrahim (AS)", "Prophet Musa (AS)", "Prophet Isa (AS)"],
    optionsAr: ["النبي محمد صلى الله عليه وسلم", "النبي إبراهيم عليه السلام", "النبي موسى عليه السلام", "النبي عيسى عليه السلام"],
    correctIndex: 2,
    explanationEn: "Prophet Musa (AS) is mentioned 136 times in the Holy Quran.",
    explanationAr: "ذكر اسم النبي موسى عليه السلام ١٣٦ مرة في القرآن الكريم."
  },
  {
    id: 16,
    category: "fiqh",
    questionEn: "What is the term for the dry ablution performed when water is unavailable?",
    questionAr: "ما هو المصطلح الذي يطلق على الوضوء الجاف عند عدم توفر الماء؟",
    optionsEn: ["Ghusl", "Wudu", "Tayammum", "Istinja"],
    optionsAr: ["الغسل", "الوضوء", "التيمم", "الاستنجاء"],
    correctIndex: 2,
    explanationEn: "Tayammum is the Islamic act of dry ritual purification using clean earth or dust.",
    explanationAr: "التيمم هو طهارة ترابية شرعية تقوم مقام الوضوء أو الغسل عند فقده."
  },
  {
    id: 17,
    category: "quran",
    questionEn: "Which Surah is mandatory to recite in every Rakah of Salah?",
    questionAr: "أي سورة يجب قراءتها في كل ركعة من ركعات الصلاة؟",
    optionsEn: ["Surah Al-Ikhlas", "Surah Al-Fatihah", "Surah Al-Asr", "Surah Al-Kafirun"],
    optionsAr: ["سورة الإخلاص", "سورة الفاتحة", "سورة العصر", "سورة الكافرون"],
    correctIndex: 1,
    explanationEn: "Surah Al-Fatihah is known as 'The Opening' and its recitation is an essential pillar of Salah.",
    explanationAr: "سورة الفاتحة هي ركن من أركان الصلاة ولا تصح الصلاة بدونها."
  },
  {
    id: 18,
    category: "sahaba",
    questionEn: "Who was the 'Zun-Nurayn' (Possessor of Two Lights)?",
    questionAr: "من هو الصحابي الملقب بـ 'ذي النورين'؟",
    optionsEn: ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan", "Ali ibn Abi Talib"],
    optionsAr: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"],
    correctIndex: 2,
    explanationEn: "Uthman (RA) was given this title because he married two of the Prophet's (PBUH) daughters: Ruqayyah and Umm Kulthum.",
    explanationAr: "لُقب عثمان رضي الله عنه بهذا اللقب لأنه تزوج من ابنتي النبي صلى الله عليه وسلم: رقية وأم كلثوم."
  },
  {
    id: 19,
    category: "fiqh",
    questionEn: "How many times did the Prophet (PBUH) perform Hajj?",
    questionAr: "كم مرة حج النبي صلى الله عليه وسلم؟",
    optionsEn: ["Once", "Twice", "Three times", "Four times"],
    optionsAr: ["مرة واحدة", "مرتين", "ثلاث مرات", "أربع مرات"],
    correctIndex: 0,
    explanationEn: "The Prophet (PBUH) performed Hajj once, known as 'Hajjat al-Wada' (The Farewell Pilgrimage).",
    explanationAr: "حج النبي صلى الله عليه وسلم مرة واحدة في عمره وتسمى حجة الوداع."
  },
  {
    id: 20,
    category: "quran",
    questionEn: "Which Surah is named after a type of metal?",
    questionAr: "أي سورة سميت باسم نوع من المعادن؟",
    optionsEn: ["Surah Al-Dhahab", "Surah Al-Hadid", "Surah Al-Fidda", "Surah Al-Nuhas"],
    optionsAr: ["سورة الذهب", "سورة الحديد", "سورة الفضة", "سورة النحاس"],
    correctIndex: 1,
    explanationEn: "Surah Al-Hadid means 'The Iron'.",
    explanationAr: "سورة الحديد هي السورة التي سميت باسم معدن الحديد."
  },
  {
    id: 21,
    category: "sahaba",
    questionEn: "Who was the 'Lion of Allah' and the Prophet's uncle?",
    questionAr: "من هو الصحابي الملقب بـ 'أسد الله' وهو عم النبي؟",
    optionsEn: ["Abu Talib", "Al-Abbas", "Hamza ibn Abdul-Muttalib", "Ja'far ibn Abi Talib"],
    optionsAr: ["أبو طالب", "العباس", "حمزة بن عبد المطلب", "جعفر بن أبي طالب"],
    correctIndex: 2,
    explanationEn: "Hamza (RA) was known for his immense bravery and was called the Lion of Allah.",
    explanationAr: "حمزة بن عبد المطلب رضي الله عنه لُقب بأسد الله وأسد رسوله لشجاعته الفائقة."
  },
  {
    id: 22,
    category: "fiqh",
    questionEn: "What is the Islamic greeting?",
    questionAr: "ما هي تحية الإسلام؟",
    optionsEn: ["Marhaba", "Assalamu Alaikum", "Sabah al-Khair", "Ahlan wa Sahlan"],
    optionsAr: ["مرحباً", "السلام عليكم", "صباح الخير", "أهلاً وسهلاً"],
    correctIndex: 1,
    explanationEn: "Assalamu Alaikum means 'Peace be upon you'.",
    explanationAr: "السلام عليكم هي تحية الإسلام وتعني الأمان والسلام عليكم."
  },
  {
    id: 23,
    category: "quran",
    questionEn: "How many Juz (parts) are there in the Quran?",
    questionAr: "كم عدد أجزاء القرآن الكريم؟",
    optionsEn: ["20", "25", "30", "40"],
    optionsAr: ["٢٠", "٢٥", "٣٠", "٤٠"],
    correctIndex: 2,
    explanationEn: "The Holy Quran is divided into 30 equal parts called Juz.",
    explanationAr: "ينقسم القرآن الكريم إلى ٣٠ جزءاً متساوياً."
  },
  {
    id: 24,
    category: "sahaba",
    questionEn: "Who was the 'Translator of the Quran' among the Sahaba?",
    questionAr: "من هو الصحابي الذي لُقب بـ 'ترجمان القرآن'؟",
    optionsEn: ["Abdullah ibn Masud", "Abdullah ibn Abbas", "Abdullah ibn Umar", "Zayd ibn Thabit"],
    optionsAr: ["عبد الله بن مسعود", "عبد الله بن عباس", "عبد الله بن عمر", "زيد بن ثابت"],
    correctIndex: 1,
    explanationEn: "Abdullah ibn Abbas (RA) was known for his profound knowledge and interpretation of the Quran.",
    explanationAr: "عبد الله بن عباس رضي الله عنه لُقب بترجمان القرآن لسعة علمه بتفسير آيات الله."
  },
  {
    id: 25,
    category: "fiqh",
    questionEn: "What is the charity given at the end of Ramadan called?",
    questionAr: "ماذا تسمى الصدقة التي تخرج في نهاية شهر رمضان؟",
    optionsEn: ["Zakat al-Mal", "Sadaqah Jariyah", "Zakat al-Fitr", "Kaffarah"],
    optionsAr: ["زكاة المال", "صدقة جارية", "زكاة الفطر", "كفارة"],
    correctIndex: 2,
    explanationEn: "Zakat al-Fitr is mandatory for every Muslim who can afford it before the Eid prayer.",
    explanationAr: "زكاة الفطر هي زكاة مفروضة على كل مسلم قبل صلاة عيد الفطر."
  }
];
