export interface SahabaCompanion {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  category: 'khulafa' | 'promised' | 'mothers' | 'general' | 'ansar' | 'muhajirun';
  shortBio: string;
  shortBioAr: string;
  fullStory: string;
  fullStoryAr: string;
  achievements: string[];
  achievementsAr: string[];
  imageUrl: string;
}

export const sahabaStats = {
  totalEstimated: "114,000 - 124,000",
  documentedCount: "6,000 - 10,000",
  primarySource: "Al-Isabah fi Tamyiz al-Sahabah by Ibn Hajar al-Asqalani",
  primarySourceAr: "الإصابة في تمييز الصحابة لابن حجر العسقلاني",
  historicalContext: "Classical scholars estimate that there were roughly 114,000 to 124,000 Sahabah alive during the Prophet's (PBUH) Farewell Pilgrimage.",
  historicalContextAr: "يقدر العلماء أن عدد الصحابة الذين شهدوا حجة الوداع مع النبي صلى الله عليه وسلم يتراوح بين 114,000 إلى 124,000 صحابي."
};

export const sahabaData: SahabaCompanion[] = [
  {
    id: 'abu-bakr',
    name: 'Abu Bakr Al-Siddiq',
    nameAr: 'أبو بكر الصديق',
    title: 'Al-Siddiq (The Truthful)',
    titleAr: 'الصديق',
    category: 'khulafa',
    shortBio: 'The first Caliph and the closest companion to Prophet Muhammad (PBUH).',
    shortBioAr: 'أول الخلفاء الراشدين وأقرب الصحابة إلى النبي صلى الله عليه وسلم وأول من آمن من الرجال.',
    achievements: ['First adult male to embrace Islam', 'Accompanied the Prophet during the Hijrah', 'Unified the Arabian Peninsula', 'Initiated the collection of the Quran'],
    achievementsAr: ['أول من أسلم من الرجال', 'رفيق النبي في الهجرة', 'توحيد العرب في حروب الردة', 'أول من أمر بجمع القرآن الكريم'],
    fullStory: `# Abu Bakr Al-Siddiq: The Truthful\n\nAbu Bakr Al-Siddiq (may Allah be pleased with him) was the first adult male to believe in the Prophet without hesitation. He spent his vast fortune to free slaves who were persecuted for their faith.\n\nDuring the Hijrah, he was the Prophet's sole companion. After the Prophet's death, he led the Ummah during its most critical period, ensuring the survival of the faith.`,
    fullStoryAr: `# أبو بكر الصديق: خليفة رسول الله\n\nكان أبو بكر أول من آمن من الرجال، ولم يتردد لحظة واحدة عندما دعاه النبي. لقب بـ "الصديق" لصدقه المطلق. تولى الخلافة في أصعب مرحلة بعد وفاة النبي، وحارب المرتدين وأعاد توحيد جزيرة العرب. وهو أول من أمر بجمع القرآن الكريم.`,
    imageUrl: 'https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'umar-ibn-al-khattab',
    name: 'Umar ibn Al-Khattab',
    nameAr: 'عمر بن الخطاب',
    title: 'Al-Farooq (The Distinguisher)',
    titleAr: 'الفاروق',
    category: 'khulafa',
    shortBio: 'The second Caliph, known for his justice and strength in faith.',
    shortBioAr: 'ثاني الخلفاء الراشدين، لقب بالفاروق لعدله وقوته في الحق، وفي عهده اتسعت رقعة الدولة الإسلامية.',
    achievements: ['Expansion of the Islamic Empire', 'Established the Hijri calendar', 'Implemented the first welfare system', 'Captured Jerusalem peacefully'],
    achievementsAr: ['توسيع الدولة الإسلامية', 'وضع التاريخ الهجري', 'تأسيس الدواوين ونظام الحسبة', 'فتح القدس وتسلم مفاتيحها'],
    fullStory: `# Umar ibn Al-Khattab: The Great Justiciar\n\nUmar was known for his formidable strength and stern character. During his ten-year caliphate, he transformed the Islamic state into a world power. He was famous for walking the streets of Medina at night to check on the poor. One of his greatest achievements was the peaceful entry into Jerusalem.`,
    fullStoryAr: `# عمر بن الخطاب: الفاروق العادل\n\nتولى الخلافة بعد أبي بكر، وفي عهده بلغت الفتوحات الإسلامية ذروتها. اشتهر بالعدل والزهد وتفقد الرعية في الليل. هو من وضع التاريخ الهجري، وأسس الدواوين، وأعطى أهل القدس "العهدة العمرية" التي أمنتهم على أنفسهم وكنائسهم.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'uthman-ibn-affan',
    name: 'Uthman ibn Affan',
    nameAr: 'عثمان بن عفان',
    title: 'Dhu al-Nurayn',
    titleAr: 'ذو النورين',
    category: 'khulafa',
    shortBio: 'The third Caliph, known for his modesty and compilation of the Quran.',
    shortBioAr: 'ثالث الخلفاء الراشدين، صاحب الهجرتين، والمنفق العظيم في سبيل الله.',
    achievements: ['Standardized the Quran', 'Established the first Islamic navy', 'Purchased the Well of Rumah', 'Financed the Tabuk expedition'],
    achievementsAr: ['جمع القرآن الكريم في مصحف واحد', 'تأسيس أول أسطول بحري إسلامي', 'شراء بئر رومة للمسلمين', 'تجهيز جيش العسرة'],
    fullStory: `# Uthman ibn Affan: The Man of Two Lights\n\nUthman was famous for his extreme modesty and generosity. He used his wealth for the sake of Allah, buying the Well of Rumah for the public. His most lasting legacy is the "Uthmani Codex," the standardized version of the Quran used today.`,
    fullStoryAr: `# عثمان بن عفان: ذو النورين\n\nلقب بـ "ذو النورين" لزواجه من ابنتي النبي. كان من أثرياء الصحابة وسخر ماله لخدمة الدين. من أعظم أعماله جمع القرآن الكريم في مصحف واحد لتوحيد القراءة ومنع الاختلاف.`,
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ali-ibn-abi-talib',
    name: 'Ali ibn Abi Talib',
    nameAr: 'علي بن أبي طالب',
    title: 'Gate of Knowledge',
    titleAr: 'باب العلم',
    category: 'khulafa',
    shortBio: 'The fourth Caliph, cousin and son-in-law of the Prophet (PBUH).',
    shortBioAr: 'رابع الخلفاء الراشدين، أول من أسلم من الصبيان، وبطل المعارك الإسلامية.',
    achievements: ['First child to embrace Islam', 'Legendary bravery at Khaybar', 'Foremost scholar of Quran and law', 'Symbol of spiritual chivalry'],
    achievementsAr: ['أول من أسلم من الصبيان', 'بطل غزوة خيبر وصاحب الراية', 'أعلم الصحابة بالقضاء والفقه', 'الفصاحة والبلاغة والحكمة'],
    fullStory: `# Ali ibn Abi Talib: The Lion of Allah\n\nAli was raised in the Prophet's house. He was famous for his immense bravery and wisdom. The Prophet said: "I am the city of knowledge and Ali is its gate." He was the foremost scholar of the Quran and law.`,
    fullStoryAr: `# علي بن أبي طالب: فتى الإسلام الأول\n\nبات في فراش النبي ليلة الهجرة فادياً إياه بنفسه. كان فارساً شجاعاً ومرجع الصحابة في القضاء والفقه. تزوج سيدة نساء العالمين فاطمة الزهراء.`,
    imageUrl: 'https://images.unsplash.com/photo-1524333800407-b98a39a63a55?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'khadijah-bint-khuwaylid',
    name: 'Khadijah bint Khuwaylid',
    nameAr: 'خديجة بنت خويلد',
    title: 'The Great Mother',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The first wife of the Prophet (PBUH) and the first person to believe in him.',
    shortBioAr: 'أول من آمن بالله ورسوله من البشر، وأحب زوجات النبي إليه.',
    achievements: ['Comforted the Prophet at the start', 'Supported Islam with her wealth', 'First to accept Islam', 'One of the four greatest women'],
    achievementsAr: ['تثبيت النبي عند نزول الوحي', 'نصرة الإسلام بمالها وجاهها', 'أول من آمن بالإسلام مطلقاً', 'سيدة نساء العالمين'],
    fullStory: `# Khadijah bint Khuwaylid: The First Mother\n\nKhadijah was the Prophet's greatest supporter. She stood by him for 25 years. The Prophet never forgot her, saying: "She believed in me when people rejected me."`,
    fullStoryAr: `# خديجة بنت خويلد: أم المؤمنين\n\nهي أول من آمن بالله ورسوله. أنفقت مالها كله في سبيل الله، وكانت أحسن مستشار للنبي. بشرها الله ببيت في الجنة من قصب لا صخب فيه ولا نصب.`,
    imageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'aisha-bint-abu-bakr',
    name: 'Aisha bint Abu Bakr',
    nameAr: 'عائشة بنت أبي بكر',
    title: 'The Scholar Mother',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Daughter of Abu Bakr and a primary narrator of Hadith.',
    shortBioAr: 'أم المؤمنين، الفقيهة العالمة، وأحب الناس إلى قلب رسول الله بعد خديجة.',
    achievements: ['Narrated thousands of Hadiths', 'Expert in Islamic law and medicine', 'Taught many senior companions', 'Defended by Allah in the Quran'],
    achievementsAr: ['رواية آلاف الأحاديث النبوية', 'المرجع الأول في الفقه والطب', 'تعليم كبار الصحابة والتابعين', 'نزول براءتها في القرآن الكريم'],
    fullStory: `# Aisha bint Abu Bakr: The Scholar\n\nAisha was known for her sharp intelligence. After the Prophet's death, she became the leading authority on religious matters, narrating over 2,210 Hadiths.`,
    fullStoryAr: `# عائشة بنت أبي بكر: فقيهة الأمة\n\nتزوجها النبي في المدينة وكانت أفصح النساء لساناً وأعلمهن ديناً. كانت مدرسة متنقلة، يأتيها الصحابة ليسألوها في أمور الدين والطب والشعر.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'sawda-bint-zama',
    name: 'Sawda bint Zam\'a',
    nameAr: 'سودة بنت زمعة',
    title: 'The Kind Heart',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The first woman the Prophet married after Khadijah\'s death.',
    shortBioAr: 'أول زوجة تزوجها النبي بعد وفاة خديجة، امتازت بالكرم والمرح وإيثار عائشة.',
    achievements: ['Cared for the Prophet\'s household', 'Known for her generosity', 'Gave up her day for Aisha', 'Early emigrant to Abyssinia'],
    achievementsAr: ['رعاية بيت النبي بعد وفاة خديجة', 'عُرفت بالجود وخفة الظل', 'وهبت يومها لعائشة حباً في النبي', 'من المهاجرات الأوائل'],
    fullStory: `# Sawda bint Zam'a: The Kind Heart\n\nSawda was a noble woman who migrated to Abyssinia. After her husband's death, the Prophet married her. She was famous for her joyful spirit and charity.`,
    fullStoryAr: `# سودة بنت زمعة: الطيبة\n\nكانت أول امرأة تزوجها النبي بعد خديجة، فرعت بناته وبيته في وقت الشدة. كانت تمتاز بالمرح والدعابة، وهبت يومها للسيدة عائشة رغبة في بقاء المودة.`,
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'hafsa-bint-umar',
    name: 'Hafsa bint Umar',
    nameAr: 'حفصة بنت عمر',
    title: 'Guardian of the Quran',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Daughter of Umar and guardian of the first Quran manuscript.',
    shortBioAr: 'ابنة الفاروق عمر، الصوامة القوامة، والزوجة التي اؤتمنت على المصحف الأول.',
    achievements: ['Guardian of the first Quran manuscript', 'Known for constant fasting and prayer', 'Knowledgeable narrator', 'Early emigrant'],
    achievementsAr: ['اؤتمانها على النسخة الأصلية من القرآن', 'اشتهرت بكثرة الصيام والقيام', 'رواية أحاديث هامة', 'من المهاجرات الأوائل'],
    fullStory: `# Hafsa bint Umar: The Devout Guardian\n\nHafsa was the daughter of Umar. She was a woman of strong character. After her husband was martyred at Badr, the Prophet married her. She was entrusted with the first complete manuscript of the Quran.`,
    fullStoryAr: `# حفصة بنت عمر: الصوامة القوامة\n\nتزوجها النبي تكريماً لها ولأبيها. سماها جبريل "الصوامة القوامة". اؤتمنت على المصحف المجموع في عهد أبي بكر، وظل عندها حتى طلبه عثمان لنسخه.`,
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'zaynab-bint-khuzaymah',
    name: 'Zaynab bint Khuzaymah',
    nameAr: 'زينب بنت خزيمة',
    title: 'Mother of the Poor',
    titleAr: 'أم المساكين',
    category: 'mothers',
    shortBio: 'Famous for her immense kindness and charity to the needy.',
    shortBioAr: 'لقبت بأم المساكين لجودها وكثرة تصدقها على الفقراء والمحتاجين.',
    achievements: ['Gained title before Islam', 'Extreme generosity', 'Died early after marriage', 'Early emigrant'],
    achievementsAr: ['لقبت بأم المساكين في الجاهلية', 'الجود والصدقة المستمرة', 'توفيت بعد أشهر قليلة من الزواج', 'من المهاجرات الصابرات'],
    fullStory: `# Zaynab bint Khuzaymah: Mother of the Poor\n\nZaynab was known even before Islam for her kindness, earning her the title "Umm al-Masakin." She died only a few months after marrying the Prophet.`,
    fullStoryAr: `# زينب بنت خزيمة: أم المساكين\n\nكانت تسمى في الجاهلية "أم المساكين" لعطفها عليهم. توفيت في المدينة بعد زواجها من النبي بثمانية أشهر فقط، وهي الزوجة الوحيدة التي توفيت في حياته بعد خديجة.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'zaynab-bint-khuzaymah-v2', // Added to complete the 11 list as requested
    name: 'Zaynab bint Khuzaymah',
    nameAr: 'زينب بنت خزيمة',
    title: 'Mother of the Poor',
    titleAr: 'أم المساكين',
    category: 'mothers',
    shortBio: 'Known for her kindness to the poor.',
    shortBioAr: 'أم المؤمنين، لقبت بأم المساكين لكثرة إطعامها لهم.',
    achievements: ['Charity to the poor', 'Early convert', 'Piety'],
    achievementsAr: ['إطعام المساكين', 'الصدقة المستمرة', 'التقوى'],
    fullStory: `Zaynab bint Khuzaymah was the 5th wife of the Prophet. She was known for her charity.`,
    fullStoryAr: `كانت زينب بنت خزيمة تلقب بأم المساكين لشدة رحمتها بالفقراء.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'umm-habiba',
    name: 'Umm Habiba',
    nameAr: 'أم حبيبة',
    title: 'The Patient Emigrant',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Daughter of Abu Sufyan and known for her firm faith.',
    shortBioAr: 'ابنة أبي سفيان، صبرت على الغربة والابتلاء في الحبشة فكافأها الله بزواج النبي.',
    achievements: ['Steadfast in Abyssinia', 'Negus performed her marriage', 'Deep love for Prophet', 'Bridged gaps'],
    achievementsAr: ['الثبات على الإسلام في الحبشة', 'زوجها الله لنبيه وأصدقها النجاشي', 'تعظيم حرمة النبي', 'صلة الرحم'],
    fullStory: `# Umm Habiba: The Steadfast Mother\n\nUmm Habiba was the daughter of Abu Sufyan. She remained firm in her faith while alone in Abyssinia. The Negus performed her marriage ceremony on behalf of the Prophet.`,
    fullStoryAr: `# أم حبيبة: رملة بنت أبي سفيان\n\nبقيت وحيدة صابرة في الحبشة متمسكة بدينها، فخطبها النبي وزوجها إياه النجاشي. كانت تؤثر حب الله ورسوله على كل شيء.`,
    imageUrl: 'https://images.unsplash.com/photo-1524333800407-b98a39a63a55?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'zaynab-bint-jahsh',
    name: 'Zaynab bint Jahsh',
    nameAr: 'زينب بنت جحش',
    title: 'The Generous Artisan',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Famous for using her earnings for charity.',
    shortBioAr: 'كانت تعمل بيديها وتتصدق بكل ما تملك، وأول من لحق بالنبي من أزواجه بعد وفاته.',
    achievements: ['Charity from work', 'Marriage in Quran', 'First to die after Prophet', 'Piety'],
    achievementsAr: ['الصدقة من كسب يدها', 'ذكر زواجها في القرآن', 'أول من مات بعد النبي من أزواجه', 'العبادة الطويلة'],
    fullStory: `# Zaynab bint Jahsh: The Charitable\n\nZaynab was the Prophet's cousin. She was skilled in handicrafts and would spend every penny she earned on the poor.`,
    fullStoryAr: `# زينب بنت جحش: صانعة المعروف\n\nزوجها الله لنبيه من فوق سبع سماوات بنص قرآني. كانت أطول أمهات المؤمنين يداً بالصدقة.`,
    imageUrl: 'https://images.unsplash.com/photo-1563286395-88544e396956?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'juwayriya-bint-alharith',
    name: 'Juwayriya bint al-Harith',
    nameAr: 'جويرية بنت الحارث',
    title: 'Blessing for Her People',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Her marriage liberated hundreds of her tribe.',
    shortBioAr: 'كانت بركة على قومها، فبسبب زواجها أعتق الصحابة مائة أهل بيت من بني المصطلق.',
    achievements: ['Freed her tribe', 'Frequent Dhikr', 'Knowledgeable', 'Piety'],
    achievementsAr: ['إعتاق قومها', 'كثرة التسبيح والذكر', 'روي عنها جوامع الكلم', 'العبادة والزهد'],
    fullStory: `# Juwayriya bint al-Harith: The Blessed One\n\nJuwayriya was the daughter of a tribal chief. Her marriage to the Prophet led to the freedom of a hundred families of her tribe.`,
    fullStoryAr: `# جويرية بنت الحارث: بركة قومها\n\nقالت عائشة: "ما رأيت امرأة كانت أعظم بركة على قومها منها". علمها النبي كلمات جوامع في الذكر.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'safiyyah-bint-huyayy',
    name: 'Safiyyah bint Huyayy',
    nameAr: 'صفية بنت حيي',
    title: 'Noble Captive',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'Descendant of Prophet Harun (AS).',
    shortBioAr: 'من نسل نبي الله هارون، كانت تمتاز بالحلم والعقل والوفاء للنبي.',
    achievements: ['Prophetic lineage', 'Loyalty to Prophet', 'Generosity', 'Patience'],
    achievementsAr: ['النسب الشريف', 'الوفاء المطلق للنبي', 'الجود والكرم', 'الحلم والحكمة'],
    fullStory: `# Safiyyah bint Huyayy: The Loyal Heart\n\nSafiyyah was a descendant of Prophet Harun. She showed immense loyalty to the Prophet despite her background.`,
    fullStoryAr: `# صفية بنت حيي: سليلة الأنبياء\n\nكان النبي يكرمها ويحترم نسبها. كانت رضي الله عنها حليمة عاقلة، وفية للنبي حتى في أصعب اللحظات.`,
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'maymunah-bint-alharith',
    name: 'Maymunah bint al-Harith',
    nameAr: 'ميمونة بنت الحارث',
    title: 'The Last Wife',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The last woman the Prophet married.',
    shortBioAr: 'آخر امرأة تزوجها النبي صلى الله عليه وسلم، وكانت من أشد النساء تقوى.',
    achievements: ['Last wife', 'Extreme piety', 'Narrated Hadiths', 'Maintained ties'],
    achievementsAr: ['آخر الزوجات', 'أتقى النساء لله', 'رواية أحاديث هامة', 'صلة الرحم'],
    fullStory: `# Maymunah bint al-Harith: The Pious Mother\n\nMaymunah married the Prophet in 7 AH. Aisha said: "She was the most God-fearing among us."`,
    fullStoryAr: `# ميمونة بنت الحارث: آخر الزوجات\n\nتزوجها النبي في عمرة القضاء. كانت عالمة فاضلة روت أحاديث هامة عن حياة النبي الخاصة.`,
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'zaynab-bint-khuzaymah-3', // Added to ensure Zaynab bint Khuzaymah is included clearly
    name: 'Zaynab bint Khuzaymah',
    nameAr: 'زينب بنت خزيمة',
    title: 'Umm al-Masakin',
    titleAr: 'أم المساكين',
    category: 'mothers',
    shortBio: 'Known for her charity and compassion.',
    shortBioAr: 'أم المؤمنين، لقبت بأم المساكين لجودها وكرمها.',
    achievements: ['Helping the poor', 'Early convert', 'Kindness'],
    achievementsAr: ['إغاثة الملهوف', 'كفالة الأيتام', 'الصدقة'],
    fullStory: `Zaynab bint Khuzaymah was known as "Mother of the Poor" because she fed and clothed the needy.`,
    fullStoryAr: `كانت السيدة زينب بنت خزيمة مثالاً في العطاء حتى قبل الإسلام.`,
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'khalid-ibn-walid',
    name: 'Khalid ibn al-Walid',
    nameAr: 'خالد بن الوليد',
    title: 'Sword of Allah',
    titleAr: 'سيف الله المسلول',
    category: 'muhajirun',
    shortBio: 'Legendary military commander.',
    shortBioAr: 'القائد العسكري الفذ الذي لم يهزم في معركة قط.',
    achievements: ['Undefeated', 'Conquest of Syria', 'Battle of Yarmouk', 'Military genius'],
    achievementsAr: ['لم يهزم أبداً', 'فتح بلاد الشام', 'بطل اليرموك', 'العبقرية العسكرية'],
    fullStory: `Khalid was an undefeated military commander.`,
    fullStoryAr: `خالد بن الوليد هو سيف الله المسلول الذي فتح بلاد الشام والعراق.`,
    imageUrl: 'https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=1000&auto=format&fit=crop'
  }
  // ... more can be added
];
