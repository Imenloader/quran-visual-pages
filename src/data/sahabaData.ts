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

// Ultra-Stable & High-Availability Unsplash IDs
const IMG_CALIPH_1 = "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=600&auto=format&fit=crop"; // Abu Bakr
const IMG_CALIPH_2 = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop"; // Umar
const IMG_CALIPH_3 = "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=600&auto=format&fit=crop"; // Uthman
const IMG_CALIPH_4 = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop"; // Ali (Reliable Nature)
const IMG_PROMISED = "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=600&auto=format&fit=crop";
const IMG_MOTHER_1 = "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=600&auto=format&fit=crop";
const IMG_MOTHER_2 = "https://images.unsplash.com/photo-1440635593441-698379c66914?q=80&w=600&auto=format&fit=crop";
const IMG_SPIRITUAL = "https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=600&auto=format&fit=crop";
const IMG_GOLD = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop";
const IMG_WHITE = IMG_CALIPH_3;
const IMG_BLUE = IMG_CALIPH_2;
const IMG_PRAYER = IMG_CALIPH_4;
const IMG_NATURE = IMG_MOTHER_1;
const IMG_NIGHT = IMG_MOTHER_1;
const IMG_SAND = IMG_PROMISED;
const IMG_OASIS = IMG_MOTHER_2;

export const sahabaData: SahabaCompanion[] = [
  // --- The Four Rightly Guided Caliphs ---
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
    fullStory: `# Abu Bakr Al-Siddiq\n\nAbu Bakr was the Prophet's best friend and the first Caliph of Islam. He was known for his gentle nature but iron resolve. He spent his entire wealth for the sake of Allah and was the one who accompanied the Prophet in the Cave of Thawr during the Hijrah.`,
    fullStoryAr: `# أبو بكر الصديق\n\nكان رفيق النبي صلى الله عليه وسلم في الغار، وأول من آمن من الرجال. تولى الخلافة في مرحلة حرجة جداً، ونجح في تثبيت دعائم الدولة الإسلامية ومحاربة المرتدين. لقب بالصديق لسرعة تصديقه للنبي في حادثة الإسراء والمعراج.`,
    imageUrl: IMG_CALIPH_1
  },
  {
    id: 'umar-ibn-al-khattab',
    name: 'Umar ibn Al-Khattab',
    nameAr: 'عمر بن الخطاب',
    title: 'Al-Farooq',
    titleAr: 'الفاروق',
    category: 'khulafa',
    shortBio: 'The second Caliph, known for his justice and strength.',
    shortBioAr: 'ثاني الخلفاء الراشدين، لقب بالفاروق لعدله وقوته في الحق.',
    achievements: ['Expansion of the Islamic Empire', 'Established the Hijri calendar', 'Implemented the first welfare system', 'Captured Jerusalem peacefully'],
    achievementsAr: ['توسيع الدولة الإسلامية', 'وضع التاريخ الهجري', 'تأسيس الدواوين ونظام الحسبة', 'فتح القدس'],
    fullStory: `# Umar ibn Al-Khattab\n\nUmar was a man of immense strength and wisdom. Under his leadership, the Islamic empire expanded to unprecedented heights. He was famous for his justice, earning him the title "Al-Farooq" (The one who distinguishes between truth and falsehood).`,
    fullStoryAr: `# عمر بن الخطاب\n\nكانت خلافته فتحاً للإسلام، وفي عهده ساد العدل المطلق. هو من وضع التاريخ الهجري، وأسس الدواوين، وفتح القدس وأعطى أهلها "العهدة العمرية". كان يتفقد رعيته في الليل ليطمئن على أحوالهم.`,
    imageUrl: IMG_CALIPH_2
  },
  {
    id: 'uthman-ibn-affan',
    name: 'Uthman ibn Affan',
    nameAr: 'عثمان بن عفان',
    title: 'Dhu al-Nurayn',
    titleAr: 'ذو النورين',
    category: 'khulafa',
    shortBio: 'The third Caliph, known for his modesty and compilation of the Quran.',
    shortBioAr: 'ثاني الخلفاء الراشدين، صاحب الهجرتين، والمنفق العظيم في سبيل الله.',
    achievements: ['Standardized the Quran', 'Established the first Islamic navy', 'Purchased the Well of Rumah', 'Financed the Tabuk expedition'],
    achievementsAr: ['جمع القرآن الكريم في مصحف واحد', 'تأسيس أول أسطول بحري إسلامي', 'شراء بئر رومة للمسلمين', 'تجهيز جيش العسرة'],
    fullStory: `# Uthman ibn Affan\n\nUthman was known for his extreme modesty and generosity. He married two of the Prophet's daughters, earning the title "Dhu al-Nurayn" (The Possessor of Two Lights). His greatest legacy is the standardization of the Quranic text.`,
    fullStoryAr: `# عثمان بن عفان\n\nاشتهر بالحياء الشديد والكرم الذي لا حدود له. هو من جهز جيش العسرة، وهو من اشترى بئر رومة ليشرب منه المسلمون مجاناً. في عهده جُمع القرآن الكريم في مصحف واحد لتوحيد قراءة الأمة.`,
    imageUrl: IMG_CALIPH_3
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
    achievementsAr: ['أول من أسلم من الصبيان', 'بطل غزوة خيبر', 'أعلم الصحابة بالقضاء والفقه', 'الفصاحة والبلاغة والحكمة'],
    fullStory: `# Ali ibn Abi Talib\n\nAli was raised in the Prophet's house and was the first child to embrace Islam. He was famous for his immense bravery in battle and his profound wisdom. The Prophet said of him: "I am the city of knowledge and Ali is its gate."`,
    fullStoryAr: `# علي بن أبي طالب\n\nبات في فراش النبي ليلة الهجرة ليفديه بنفسه. كان فارساً لا يُشق له غبار، وبليغاً أفحم العلماء بحكمته. تزوج سيدة نساء العالمين فاطمة الزهراء، وكان مرجع الصحابة في القضايا المعقدة.`,
    imageUrl: IMG_CALIPH_4 // Ali now has the most reliable ID
  },

  // --- Ten Promised Paradise ---
  {
    id: 'talhah-ibn-ubaydullah',
    name: 'Talhah ibn Ubaydullah',
    nameAr: 'طلحة بن عبيد الله',
    title: 'Talhah al-Khayr',
    titleAr: 'طلحة الخير',
    category: 'promised',
    shortBio: 'One of the ten promised paradise, known for his bravery at Uhud.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، لقب بطلحة الخير والجود لشجاعته وكرمه.',
    achievements: ['Protected the Prophet at Uhud', 'Extremely wealthy and charitable', 'Early convert to Islam', 'Sufferer for the faith'],
    achievementsAr: ['حماية النبي في غزوة أحد', 'الجود والكرم الواسع', 'من السابقين الأولين للإسلام', 'صاحب تضحيات عظيمة'],
    fullStory: `# Talhah ibn Ubaydullah\n\nTalhah was one of the earliest converts. During the Battle of Uhud, he used his own body as a shield to protect the Prophet, sustaining over 70 wounds. He was famous for his immense generosity, often giving away thousands of dinars in a single sitting.`,
    fullStoryAr: `# طلحة بن عبيد الله\n\nأحد الثمانية الذين سبقوا إلى الإسلام. في غزوة أحد، جعل نفسه ترساً دون رسول الله وتلقى عنه السهام بيده حتى شُلّت. قال عنه النبي: "من أراد أن ينظر إلى شهيد يمشي على وجه الأرض فلينظر إلى طلحة بن عبيد الله".`,
    imageUrl: IMG_PROMISED
  },
  {
    id: 'zubayr-ibn-al-awwam',
    name: 'Az-Zubayr ibn al-Awwam',
    nameAr: 'الزبير بن العوام',
    title: 'Disciple of the Prophet',
    titleAr: 'حواري رسول الله',
    category: 'promised',
    shortBio: 'The Prophet\'s disciple and one of the ten promised paradise.',
    shortBioAr: 'حواري رسول الله صلى الله عليه وسلم وأحد العشرة المبشرين بالجنة.',
    achievements: ['First to draw a sword for Islam', 'Hero of many battles', 'Wealthy but humble merchant', 'Migrated twice for Islam'],
    achievementsAr: ['أول من سل سيفاً في سبيل الله', 'فارس شجاع في كل الغزوات', 'تاجر صدوق ومنفق كبير', 'صاحب الهجرتين'],
    fullStory: `# Az-Zubayr ibn al-Awwam\n\nAz-Zubayr was the Prophet's cousin and a legendary warrior. He was the first person to draw a sword in the name of Islam. The Prophet said: "Every Prophet has a disciple (Hawari), and my disciple is Az-Zubayr."`,
    fullStoryAr: `# الزبير بن العوام\n\nابن عمة النبي صلى الله عليه وسلم وصفية بنت عبد المطلب. كان فارساً مغواراً يشهد له الجميع بالشجاعة. هو أول من سل سيفه دفاعاً عن النبي في مكة عندما سمع شائعة عن قتله. لقب بحواري رسول الله لشدة إخلاصه ونصرته.`,
    imageUrl: IMG_SPIRITUAL
  },
  {
    id: 'abdur-rahman-ibn-awf',
    name: 'Abdur-Rahman ibn Awf',
    nameAr: 'عبد الرحمن بن عوف',
    title: 'The Successful Merchant',
    titleAr: 'التاجر الأمين',
    category: 'promised',
    shortBio: 'A wealthy companion who spent all his earnings for Islam.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، وأحد الستة أصحاب الشورى، اشتهر ببركة ماله وجوده.',
    achievements: ['Master of business and ethics', 'Donated 40,000 dinars at once', 'Migrated to Madinah with nothing', 'Supported the Mothers of Believers'],
    achievementsAr: ['البركة في التجارة والصدق', 'الإنفاق الهائل في سبيل الله', 'العصامية والبدء من الصفر', 'كفالة أمهات المؤمنين'],
    fullStory: `# Abdur-Rahman ibn Awf\n\nAbdur-Rahman was a master of business who prioritized faith over wealth. When he migrated to Madinah, he started with nothing but soon became one of the wealthiest men. He famously donated huge caravans of 700 camels loaded with goods to the people of Madinah.`,
    fullStoryAr: `# عبد الرحمن بن عوف\n\nكان من أغنى الصحابة وأكثرهم إنفاقاً. هاجر للمدينة فقيراً فباركه الله في تجارته حتى قال: "لو رفعت حجراً لظننت أني سأجد تحته ذهباً". كان من أهل الشورى الذين اختارهم عمر بن الخطاب، وتنازل عن حقه في الخلافة ليوحد كلمة المسلمين.`,
    imageUrl: IMG_GOLD
  },
  {
    id: 'sad-ibn-abi-waqqas',
    name: 'Sa\'d ibn Abi Waqqas',
    nameAr: 'سعد بن أبي وقاص',
    title: 'Knight of Islam',
    titleAr: 'فارس الإسلام',
    category: 'promised',
    shortBio: 'One of the earliest converts and hero of the Battle of Qadisiyyah.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، وبطل معركة القادسية، وأول من رمى بسهم في سبيل الله.',
    achievements: ['First to shoot an arrow for Islam', 'Conqueror of Iraq and Persia', 'Governor of Kufa', 'Accepted supplications (Mustajab al-Da\'wah)'],
    achievementsAr: ['أول من رمى بسهم في الإسلام', 'فاتح بلاد فارس وقائد القادسية', 'مؤسس مدينة الكوفة', 'مستجاب الدعوة'],
    fullStory: `# Sa'd ibn Abi Waqqas\n\nSa'd was the maternal uncle of the Prophet. He was a legendary archer and general. His leadership at the Battle of Qadisiyyah was instrumental in the spread of Islam in Persia. He was known as "The one whose prayers are always answered."`,
    fullStoryAr: `# سعد بن أبي وقاص\n\nخال النبي صلى الله عليه وسلم، وأحد الستة أصحاب الشورى. كان رامي الإسلام الأول، ودعا له النبي فقال: "اللهم سدد رميته وأجب دعوته". قاد جيوش المسلمين في القادسية لينهي نفوذ الإمبراطورية الساسانية في العراق.`,
    imageUrl: IMG_PROMISED
  },
  {
    id: 'said-ibn-zayd',
    name: 'Sa\'id ibn Zayd',
    nameAr: 'سعيد بن زيد',
    title: 'The Silent Devotee',
    titleAr: 'المجاهد الزاهد',
    category: 'promised',
    shortBio: 'An early convert who witnessed almost all Islamic battles.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، ومن السابقين للإسلام، وزوج أخت عمر بن الخطاب.',
    achievements: ['Early convert through his father', 'Witnessed all major battles except Badr', 'Avoided political fame', 'Hero of the Battle of Yarmouk'],
    achievementsAr: ['من أوائل من أسلموا', 'شهد جميع المشاهد إلا بدراً', 'الزهد في المناصب السياسية', 'بطل من أبطال اليرموك'],
    fullStory: `# Sa'id ibn Zayd\n\nSa'id was the son of Zayd ibn Amr, who followed the religion of Ibrahim before Islam. Sa'id and his wife Fatimah (Umar's sister) were responsible for Umar's conversion. He was a humble warrior who preferred the afterlife over worldly power.`,
    fullStoryAr: `# سعيد بن زيد\n\nنشأ في بيت يبحث عن التوحيد قبل بعثة النبي. كان هو وزوجته فاطمة بنت الخطاب سبباً في إسلام عمر. كان مستجاب الدعوة، واشتهر بالزهد والورع، وشارك في فتوحات الشام ببطولة منقطعة النظير.`,
    imageUrl: IMG_SPIRITUAL
  },
  {
    id: 'abu-ubaydah-ibn-al-jarrah',
    name: 'Abu Ubaydah ibn al-Jarrah',
    nameAr: 'أبو عبيدة بن الجراح',
    title: 'Trustee of the Ummah',
    titleAr: 'أمين الأمة',
    category: 'promised',
    shortBio: 'One of the ten promised paradise and a supreme military leader.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، والقائد العام لجيوش الفتح في الشام، ولقب بأمين الأمة.',
    achievements: ['The Trustee of the Ummah', 'Conquered Syria and Jordan', 'Hero of the Battle of Yarmouk', 'Extreme modesty and asceticism'],
    achievementsAr: ['لقب بأمين الأمة', 'فاتح بلاد الشام والأردن', 'أحد أبطال اليرموك', 'الزهد الشديد والتواضع'],
    fullStory: `# Abu Ubaydah ibn al-Jarrah\n\nAbu Ubaydah was known for his absolute integrity and skill. The Prophet said: "Every nation has a trustworthy person, and the trustworthy person of this Ummah is Abu Ubaydah." He led the Islamic armies to victory in Syria while remaining a simple, humble man.`,
    fullStoryAr: `# أبو عبيدة بن الجراح\n\nعامر بن عبد الله بن الجراح، الرجل الذي قال عنه النبي: "إن لكل أمة أميناً، وأمين هذه الأمة أبو عبيدة". كان قائداً عسكرياً فذاً وزاهداً كبيراً، توفي في طاعون عمواس وهو في قمة مجده العسكري.`,
    imageUrl: IMG_WHITE
  },

  // --- The Mothers of the Believers ---
  {
    id: 'khadijah-bint-khuwaylid',
    name: 'Khadijah bint Khuwaylid',
    nameAr: 'خديجة بنت خويلد',
    title: 'Mother of Believers',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The first wife of the Prophet (PBUH) and the first person to believe in him.',
    shortBioAr: 'أول من آمن بالله ورسوله من البشر، وأحب زوجات النبي إليه.',
    achievements: ['Comforted the Prophet at the start', 'Supported Islam with her wealth', 'First to accept Islam', 'One of the four greatest women'],
    achievementsAr: ['تثبيت النبي عند نزول الوحي', 'نصرة الإسلام بمالها وجاهها', 'أول من آمن بالإسلام مطلقاً', 'سيدة نساء العالمين'],
    fullStory: `# Khadijah bint Khuwaylid\n\nKhadijah was the Prophet's greatest supporter. She was a successful businesswoman who spent everything for Islam. The Prophet said: "She believed in me when others rejected me, and she supported me with her wealth when others deprived me."`,
    fullStoryAr: `# خديجة بنت خويلد\n\nكانت نعم الزوجة ونعم السند، نصرت النبي بمالها وعقلها وجاهها. بشرها جبريل عليه السلام ببيت في الجنة من قصب لا صخب فيه ولا نصب. لم يتزوج النبي عليها حتى ماتت حباً ووفاءً لها.`,
    imageUrl: IMG_MOTHER_1
  },
  {
    id: 'sawda-bint-zama',
    name: 'Sawda bint Zam\'a',
    nameAr: 'سودة بنت زمعة',
    title: 'The Kind Heart',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The first woman the Prophet married after Khadijah\'s death.',
    shortBioAr: 'أول زوجة تزوجها النبي بعد وفاة خديجة، امتازت بالكرم وإيثار عائشة.',
    achievements: ['Cared for the Prophet\'s household', 'Known for her generosity', 'Gave up her day for Aisha', 'Early emigrant to Abyssinia'],
    achievementsAr: ['رعاية بيت النبي وبناته', 'الجود والكرم الشديد', 'إيثار عائشة بيومها', 'من المهاجرات الأوائل'],
    fullStory: `# Sawda bint Zam'a\n\nSawda was a noble woman who migrated to Abyssinia for her faith. After Khadijah's death, she took care of the Prophet's children and household. She was famous for her kindness and for giving up her turn for Aisha to please the Prophet.`,
    fullStoryAr: `# سودة بنت زمعة\n\nتزوجها النبي في مكة بعد وفاة السيدة خديجة، فكانت الأم الحنون لبناته. كانت تمتاز بطول القامة والجود، وهبت نوبتها لعائشة رغبة في بقاء مودة النبي صلى الله عليه وسلم.`,
    imageUrl: IMG_MOTHER_2
  },
  {
    id: 'aisha-bint-abu-bakr',
    name: 'Aisha bint Abu Bakr',
    nameAr: 'عائشة بنت أبي بكر',
    title: 'The Scholar',
    titleAr: 'أم المؤمنين الفقيهة',
    category: 'mothers',
    shortBio: 'Daughter of Abu Bakr and a primary authority on Islamic knowledge.',
    shortBioAr: 'أم المؤمنين، الفقيهة العالمة، وأحب الناس إلى قلب رسول الله.',
    achievements: ['Narrated 2,210 Hadiths', 'Expert in law, medicine, and poetry', 'Taught many senior companions', 'Defended by Allah in the Quran'],
    achievementsAr: ['رواية آلاف الأحاديث', 'المرجع الأول في الفقه والطب واللغة', 'مُعلمة الصحابة والتابعين', 'نزول براءتها من فوق سبع سماوات'],
    fullStory: `# Aisha bint Abu Bakr\n\nAisha was one of the greatest scholars of Islam. Her intelligence and memory allowed her to preserve thousands of the Prophet's teachings. She was a leading authority on law and medicine and taught hundreds of students in Madinah.`,
    fullStoryAr: `# عائشة بنت أبي بكر\n\nكانت عائشة مدرسة علمية متنقلة، قال عنها الزهري: "لو جُمع علم عائشة إلى علم جميع النساء لكان علم عائشة أفضل". روت عن النبي ما لم يروه غيرها، وظل الصحابة يسألونها في معضلات الأمور طوال حياتها.`,
    imageUrl: IMG_MOTHER_1
  },
  {
    id: 'hafsa-bint-umar',
    name: 'Hafsa bint Umar',
    nameAr: 'حفصة بنت عمر',
    title: 'The Devout Guardian',
    titleAr: 'أم المؤمنين حارسة القرآن',
    category: 'mothers',
    shortBio: 'Daughter of Umar and guardian of the first Quran manuscript.',
    shortBioAr: 'ابنة الفاروق عمر، الصوامة القوامة، والزوجة التي اؤتمنت على المصحف الأول.',
    achievements: ['Guardian of the first Quran manuscript', 'Known for constant fasting and prayer', 'Early emigrant to Madinah', 'Wise advisor'],
    achievementsAr: ['حفظ النسخة الأصلية من القرآن', 'كثرة الصيام والقيام', 'من المهاجرات الصابرات', 'رجاحة العقل والحكمة'],
    fullStory: `# Hafsa bint Umar\n\nHafsa was a woman of strong character and deep devotion. She was entrusted with the first complete manuscript of the Quran compiled during Abu Bakr's time. She spent her life in worship and teaching others the words of Allah.`,
    fullStoryAr: `# حفصة بنت عمر\n\nسماها جبريل "الصوامة القوامة". اؤتمنها الصحابة على المصحف المجموع في عهد أبي بكر نظراً لثقتهم الكبيرة في أمانتها ودينها. كانت من أعلم النساء بالكتابة والقراءة في ذلك الزمان.`,
    imageUrl: IMG_MOTHER_2
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
    achievements: ['Title earned before Islam', 'Extreme generosity', 'Short but impactful marriage', 'Empathy for the weak'],
    achievementsAr: ['لقبت بأم المساكين في الجاهلية والإسلام', 'الجود والصدقة المستمرة', 'الإيثار والرحمة بالضعفاء', 'الوفاء بعهد الله'],
    fullStory: `# Zaynab bint Khuzaymah\n\nZaynab was known as "Umm al-Masakin" (Mother of the Poor) even before the Prophet married her. Her life was a testament to selfless charity. Though she died shortly after her marriage to the Prophet, her legacy of kindness remained.`,
    fullStoryAr: `# زينب بنت خزيمة\n\nلم تكن تُرى إلا وهي تطعم مسكيناً أو تكسو يتيماً، فسميت "أم المساكين". هي الزوجة الوحيدة التي توفيت في حياة النبي صلى الله عليه وسلم بالمدينة، وصلى عليها ودفنها في البقيع.`,
    imageUrl: IMG_MOTHER_1
  },
  {
    id: 'umm-salamah',
    name: 'Umm Salamah',
    nameAr: 'أم سلمة',
    title: 'The Wise Mother',
    titleAr: 'أم المؤمنين الحكيمة',
    category: 'mothers',
    shortBio: 'Hind bint Abi Umayyah, known for her sharp intellect and wisdom.',
    shortBioAr: 'هند بنت أبي أمية، صاحبة الرأي السديد والذكاء الراجح.',
    achievements: ['Advised the Prophet at Hudaybiyyah', 'Last of the Mothers to pass away', 'Early emigrant to Abyssinia and Madinah', 'Knowledgeable narrator'],
    achievementsAr: ['صاحبة الرأي في صلح الحديبية', 'آخر من توفي من أمهات المؤمنين', 'هاجرت للحبشة والمدينة', 'رواية أحاديث هامة'],
    fullStory: `# Umm Salamah\n\nUmm Salamah was a noble woman from a powerful family who left everything for Islam. Her advice to the Prophet during the Treaty of Hudaybiyyah saved the Ummah from a great crisis. She was one of the last Mothers of the Believers to pass away, leaving behind a wealth of knowledge.`,
    fullStoryAr: `# أم سلمة\n\nكانت تمتاز بالجمال والعقل الراجح. في صلح الحديبية، أشارت على النبي صلى الله عليه وسلم برأي أنقذ الموقف، ففعل المسلمون كما فعل النبي. كانت من المهاجرات الأوليات وعانت الكثير في سبيل دينها.`,
    imageUrl: IMG_MOTHER_2
  },
  {
    id: 'zaynab-bint-jahsh',
    name: 'Zaynab bint Jahsh',
    nameAr: 'زينب بنت جحش',
    title: 'The Charitable Artisan',
    titleAr: 'أم المؤمنين صانعة المعروف',
    category: 'mothers',
    shortBio: 'Famous for using her own work to support the poor.',
    shortBioAr: 'كانت تعمل بيديها وتتصدق بكل ما تملك، وأول من لحق بالنبي من أزواجه.',
    achievements: ['Marriage mentioned in the Quran', 'Extreme piety and fasting', 'Handicraft worker for charity', 'First to die after the Prophet'],
    achievementsAr: ['توجها النبي بأمر من الله في القرآن', 'كثرة العبادة والصيام', 'العمل والصدقة من كسب اليد', 'أول من لحق بالنبي بعد وفاته'],
    fullStory: `# Zaynab bint Jahsh\n\nZaynab was the Prophet's cousin. She was a skilled artisan who would tan leather and perform handicrafts, only to spend every penny on the poor. The Prophet said: "The one with the longest reach among you will be the first to join me," referring to her great charity.`,
    fullStoryAr: `# زينب بنت جحش\n\nكانت امرأة صالحة عابدة صوامة. اشتهرت بالعمل بيدها لتنفق على المساكين. هي التي نزل فيها قوله تعالى: {فَلَمَّا قَضَى زَيْدٌ مِّنْهَا وَطَرًا زَوَّجْنَاكَهَا}. كانت تفخر بأن الله هو الذي زوجها لنبيه.`,
    imageUrl: IMG_MOTHER_1
  },
  {
    id: 'juwayriyah-bint-alharith',
    name: 'Juwayriyah bint al-Harith',
    nameAr: 'جويرية بنت الحارث',
    title: 'The Blessed One',
    titleAr: 'أم المؤمنين بركة قومها',
    category: 'mothers',
    shortBio: 'Her marriage led to the liberation of her entire tribe.',
    shortBioAr: 'كانت بركة على قومها، فبسبب زواجها أعتق الصحابة مائة أهل بيت من قومها.',
    achievements: ['Liberated 100 families of Banu Mustaliq', 'Devoted worshipper (Dhikr)', 'Expert in prophetic supplications', 'Pious and humble'],
    achievementsAr: ['إعتاق مائة أهل بيت من قومها', 'الاجتهاد في الذكر والتسبيح', 'روي عنها أحاديث في الأذكار', 'التقوى والزهد'],
    fullStory: `# Juwayriyah bint al-Harith\n\nJuwayriyah was the daughter of a tribal chief. After being captured, the Prophet married her. Upon hearing this, the companions freed all captives from her tribe, saying: "They are now the Prophet's relatives." Aisha said: "I never saw a woman who was a greater blessing to her people than her."`,
    fullStoryAr: `# جويرية بنت الحارث\n\nقالت عنها عائشة: "ما رأيت امرأة كانت أعظم بركة على قومها منها". بفضل زواجها من النبي، أعتق المسلمون كل سبايا بني المصطلق إكراماً لها. كانت تُرى دائماً في مصلاها تسبح الله وتذكره.`,
    imageUrl: IMG_MOTHER_2
  },
  {
    id: 'umm-habiba',
    name: 'Umm Habibah',
    nameAr: 'أم حبيبة',
    title: 'The Patient Emigrant',
    titleAr: 'أم المؤمنين الصابرة',
    category: 'mothers',
    shortBio: 'Ramlah bint Abi Sufyan, who chose her faith over her family status.',
    shortBioAr: 'رملة بنت أبي سفيان، صبرت على الغربة والابتلاء متمسكة بدينها.',
    achievements: ['Steadfast in Abyssinia despite trial', 'Marriage arranged by Negus', 'Firm defender of the Prophet\'s honor', 'Deep knowledge of Hadith'],
    achievementsAr: ['الثبات على الدين في بلاد الغربة', 'زوجها الله لنبيه وأصدقها النجاشي', 'تعظيم مقام النبي صلى الله عليه وسلم', 'رواية أحاديث هامة'],
    fullStory: `# Umm Habibah\n\nUmm Habibah migrated to Abyssinia with her husband, who later left Islam. Despite being alone in a foreign land, she remained firm in her faith. The Prophet married her as an honor for her steadfastness, and the King of Abyssinia himself performed the ceremony on the Prophet's behalf.`,
    fullStoryAr: `# أم حبيبة\n\nكانت ابنة سيد قريش أبي سفيان، لكنها اختارت الإسلام وهاجرت للحبشة. بقيت صابرة متمسكة بدينها رغم كل الظروف، فكافأها الله بأن أصبحت أماً للمؤمنين. كانت تعظم النبي صلى الله عليه وسلم لدرجة أنها لم ترضَ لأبيها الجلوس على فراش النبي قبل إسلامه.`,
    imageUrl: IMG_MOTHER_1
  },
  {
    id: 'safiyyah-bint-huyayy',
    name: 'Safiyyah bint Huyayy',
    nameAr: 'صفية بنت حيي',
    title: 'The Noble Descendant',
    titleAr: 'أم المؤمنين سليلة الأنبياء',
    category: 'mothers',
    shortBio: 'A descendant of Prophet Harun (AS), known for her loyalty and intellect.',
    shortBioAr: 'من نسل نبي الله هارون، كانت تمتاز بالحلم والعقل والوفاء للنبي.',
    achievements: ['Prophetic lineage from Harun (AS)', 'Absolute loyalty to the Prophet', 'Known for her intelligence and patience', 'Kind and generous to others'],
    achievementsAr: ['النسب الشريف من آل هارون', 'الوفاء المطلق لرسول الله', 'الحلم والحكمة في التعامل', 'الجود والكرم'],
    fullStory: `# Safiyyah bint Huyayy\n\nSafiyyah was a noble woman who saw the truth of Islam and embraced it. She was famous for her loyalty. When some criticized her background, the Prophet comforted her, saying: "Your father is Harun, your uncle is Musa, and your husband is Muhammad." She remained a devoted Mother of the Believers until her death.`,
    fullStoryAr: `# صفية بنت حيي\n\nكانت امرأة عاقلة حليمة. دافع عنها النبي صلى الله عليه وسلم أمام الجميع، وكان يكرمها ويحترم نسبها الشريف. روت عن النبي أحاديث تدل على عمق فهمها للدين، وكانت تُكثر من الصدقة والبر.`,
    imageUrl: IMG_MOTHER_2
  },
  {
    id: 'maymunah-bint-alharith',
    name: 'Maymunah bint al-Harith',
    nameAr: 'ميمونة بنت الحارث',
    title: 'The Pious Mother',
    titleAr: 'أم المؤمنين التقية',
    category: 'mothers',
    shortBio: 'The last woman the Prophet married, known for her extreme piety.',
    shortBioAr: 'آخر امرأة تزوجها النبي صلى الله عليه وسلم، وكانت من أشد النساء تقوى وصلة للرحم.',
    achievements: ['The last of the Prophet\'s wives', 'Extremely God-fearing (Aisha\'s testimony)', 'Maintained strong family ties', 'Pious teacher of the Ummah'],
    achievementsAr: ['آخر أمهات المؤمنين زواجاً', 'التقوى والورع الشديد', 'صلة الرحم والبر بالأهل', 'تعليم أمور الدين'],
    fullStory: `# Maymunah bint al-Harith\n\nMaymunah married the Prophet during the Umrah of Fulfillment. Aisha said of her: "She was the most God-fearing among us and the most careful in maintaining family ties." She was a devout worshipper and a source of guidance for the companions.`,
    fullStoryAr: `# ميمونة بنت الحارث\n\nتزوجها النبي صلى الله عليه وسلم في عمرة القضاء بمكة. شهدت لها عائشة بالتقوى قائلة: "أما إنها كانت من أتقانا لله وأوصلنا للرحم". توفيت في نفس المكان الذي تزوجها فيه النبي (سَرِف)، وبقيت سيرتها عطرة بالعبادة والفضل.`,
    imageUrl: IMG_MOTHER_1
  }
];
