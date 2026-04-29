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

const UNIFIED_THUMBNAIL = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop";

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
    imageUrl: UNIFIED_THUMBNAIL
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
    imageUrl: UNIFIED_THUMBNAIL
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
    imageUrl: UNIFIED_THUMBNAIL
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
    imageUrl: UNIFIED_THUMBNAIL
  },

  // --- Al-Muhajirun (Prominent Figures) ---
  {
    id: 'bilal-ibn-rabah',
    name: 'Bilal ibn Rabah',
    nameAr: 'بلال بن رباح',
    title: 'Muezzin of the Prophet',
    titleAr: 'مؤذن الرسول',
    category: 'muhajirun',
    shortBio: 'The first person to call the Adhan and a symbol of faith and endurance.',
    shortBioAr: 'أول من أذن في الإسلام، ورمز الصبر والثبات على العقيدة.',
    achievements: ['First Muezzin of Islam', 'Endured severe torture for his faith', 'Participated in all major battles', 'Liberated from slavery by Abu Bakr'],
    achievementsAr: ['أول مؤذن في الإسلام', 'الصبر على تعذيب قريش', 'شهد جميع المشاهد مع النبي', 'أعتقه أبو بكر الصديق'],
    fullStory: `# Bilal ibn Rabah\n\nBilal was an Abyssinian slave who embraced Islam early. He was brutally tortured by his master but remained firm, famously repeating "Ahad! Ahad!" (One! One!). After being freed, he became the Prophet's chosen caller to prayer.`,
    fullStoryAr: `# بلال بن رباح\n\nكان عبداً مملوكاً في مكة، وعندما أسلم عذبه سيده أمية بن خلف، فكان يقول "أحد أحد". اشتراه أبو بكر وأعتقه. اختاره النبي ليكون أول مؤذن في الإسلام، وكان صوته يملأ سماء المدينة بالتوحيد.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'musab-ibn-umayr',
    name: 'Mus\'ab ibn Umayr',
    nameAr: 'مصعب بن عمير',
    title: 'The First Ambassador',
    titleAr: 'سفير الإسلام الأول',
    category: 'muhajirun',
    shortBio: 'The first missionary of Islam who prepared Madinah for the Prophet.',
    shortBioAr: 'أول سفير في الإسلام، مهد الطريق للهجرة بنشر الدعوة في المدينة.',
    achievements: ['First envoy to Madinah', 'Converted many leaders of Ansar', 'Heroic martyrdom at Uhud', 'Sacrificed luxury for faith'],
    achievementsAr: ['أول مبعوث للنبي إلى المدينة', 'إسلام كبار الأنصار على يديه', 'استشهد في غزوة أحد', 'ترك حياة الترف في مكة من أجل الإسلام'],
    fullStory: `# Mus'ab ibn Umayr\n\nMus'ab was the most handsome and wealthy youth in Mecca. After embracing Islam, he left everything behind. The Prophet sent him to Madinah as a teacher, and through his wisdom, almost every household in Madinah embraced Islam.`,
    fullStoryAr: `# مصعب بن عمير\n\nكان أنعم شباب مكة عيشاً، فلما أسلم ترك كل شيء. اختاره النبي ليكون أول سفير للإسلام في المدينة، فنجح بحكمته ولينه في إقناع كبار الأوس والخزرج بالإسلام. استشهد في أحد وهو يحمل لواء المسلمين.`,
    imageUrl: UNIFIED_THUMBNAIL
  },

  // --- Al-Ansar (The Supporters) ---
  {
    id: 'sad-ibn-muadh',
    name: 'Sa\'d ibn Mu\'adh',
    nameAr: 'سعد بن معاذ',
    title: 'Leader of Al-Aws',
    titleAr: 'سيد الأوس',
    category: 'ansar',
    shortBio: 'A powerful leader whose death caused the Throne of Allah to shake.',
    shortBioAr: 'سيد الأوس، اهتز لوفاته عرش الرحمن كرامة له.',
    achievements: ['Led the conversion of Al-Aws', 'Hero of the Battle of the Trench', 'Judged Banu Qurayza with justice', 'Martyred for the faith'],
    achievementsAr: ['إسلام قبيلة الأوس بسببه', 'أحد أبطال غزوة الخندق', 'حكم في بني قريظة بحكم الله', 'نال الشهادة بعد الخندق'],
    fullStory: `# Sa'd ibn Mu'adh\n\nSa'd was the chief of the Aws tribe. When he embraced Islam, his entire tribe followed him. He was a pillar of strength for the Prophet in Madinah. When he died from his wounds after the Battle of the Trench, the Prophet said the Throne of the Merciful shook for him.`,
    fullStoryAr: `# سعد بن معاذ\n\nسيد قبيلة الأوس، أسلم على يد مصعب بن عمير فأسلمت قبيلته كلها. كان من أعظم أنصار النبي، وأصيب في الخندق بسهم فدعا الله أن يقر عينه في بني قريظة فاستجاب الله له. توفي شهيداً واهتز لوفاته عرش الرحمن.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'muadh-ibn-jabal',
    name: 'Mu\'adh ibn Jabal',
    nameAr: 'معاذ بن جبل',
    title: 'Master of Halal and Haram',
    titleAr: 'أعلم الناس بالحلال والحرام',
    category: 'ansar',
    shortBio: 'The most knowledgeable companion in matters of Islamic law.',
    shortBioAr: 'إمام العلماء، وأعلم الأمة بالحلال والحرام.',
    achievements: ['Leading scholar of Fiqh', 'Envoy to Yemen as a judge', 'Known for his immense wisdom', 'One of the collectors of Quran'],
    achievementsAr: ['فقيه الأمة الأول', 'أرسله النبي قاضياً ومعلماً لليمن', 'كان يُشبّه بالنبي إبراهيم في سمته', 'من جامعي القرآن في عهد النبي'],
    fullStory: `# Mu'adh ibn Jabal\n\nMu'adh was a brilliant young man from the Ansar. The Prophet said: "The most knowledgeable of my Ummah regarding Halal and Haram is Mu'adh ibn Jabal." He was sent to Yemen to teach and judge, showcasing the depth of his understanding.`,
    fullStoryAr: `# معاذ بن جبل\n\nشاب أنصاري جمع العلم والجمال والخلق. قال عنه النبي: "أعلم أمتي بالحلال والحرام معاذ بن جبل". كان إماماً للعلماء، بعثه النبي إلى اليمن ليعلم الناس دينهم ويقضي بينهم، وكان يوصيه بالرفق والتبشير.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'abu-ayyub-al-ansari',
    name: 'Abu Ayyub al-Ansari',
    nameAr: 'أبو أيوب الأنصاري',
    title: 'Host of the Prophet',
    titleAr: 'مضيف الرسول',
    category: 'ansar',
    shortBio: 'The companion who had the honor of hosting the Prophet in Madinah.',
    shortBioAr: 'الصحابي الجليل الذي نزل النبي في بيته عند وصوله للمدينة.',
    achievements: ['Hosted the Prophet for months', 'Participated in all major battles', 'Died while besieging Constantinople', 'Narrator of many Hadiths'],
    achievementsAr: ['استضافة النبي في بيته', 'شهد بدراً وأحداً وكل المشاهد', 'استشهد تحت أسوار القسطنطينية', 'رواية أحاديث هامة'],
    fullStory: `# Abu Ayyub al-Ansari\n\nWhen the Prophet arrived in Madinah, every person wanted to host him. The Prophet's camel stopped at Abu Ayyub's house. He hosted the Prophet with immense love. He lived a long life dedicated to Jihad and was buried at the walls of Constantinople.`,
    fullStoryAr: `# أبو أيوب الأنصاري\n\nخالد بن زيد، اختار الله بيته ليكون منزلاً للنبي صلى الله عليه وسلم عند الهجرة. ظل يجاهد في سبيل الله حتى في سن متأخرة، وخرج في جيش لفتح القسطنطينية، ودفن هناك عند أسوار المدينة تنفيذاً لوصيته.`,
    imageUrl: UNIFIED_THUMBNAIL
  },

  // --- The Mothers of the Believers (Included from previous lists) ---
  {
    id: 'khadijah-bint-khuwaylid',
    name: 'Khadijah bint Khuwaylid',
    nameAr: 'خديجة بنت خويلد',
    title: 'The Mother of Believers',
    titleAr: 'أم المؤمنين',
    category: 'mothers',
    shortBio: 'The first wife of the Prophet (PBUH) and the first person to believe in him.',
    shortBioAr: 'أول من آمن بالله ورسوله من البشر، وأحب زوجات النبي إليه.',
    achievements: ['Comforted the Prophet at the start', 'Supported Islam with her wealth', 'First to accept Islam', 'One of the four greatest women'],
    achievementsAr: ['تثبيت النبي عند نزول الوحي', 'نصرة الإسلام بمالها وجاهها', 'أول من آمن بالإسلام مطلقاً', 'سيدة نساء العالمين'],
    fullStory: `# Khadijah bint Khuwaylid\n\nKhadijah was the Prophet's greatest supporter. She stood by him for 25 years. The Prophet never forgot her, saying: "She believed in me when people rejected me."`,
    fullStoryAr: `# خديجة بنت خويلد\n\nهي أول من آمن بالله ورسوله. أنفقت مالها كله في سبيل الله، وكانت أحسن مستشار للنبي. بشرها الله ببيت في الجنة من قصب لا صخب فيه ولا نصب.`,
    imageUrl: UNIFIED_THUMBNAIL
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
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'hafsa-bint-umar',
    name: 'Hafsa bint Umar',
    nameAr: 'حفصة بنت عمر',
    title: 'Guardian of the Quran',
    titleAr: 'حارسة القرآن',
    category: 'mothers',
    shortBio: 'The daughter of Umar ibn Al-Khattab and the guardian of the original Quran manuscript.',
    shortBioAr: 'أم المؤمنين، بنت الفاروق، وحارسة المصحف الأول.',
    achievements: ['Guardian of the first compiled Quran', 'One of the few literate women of her time', 'Narrated many Hadiths from the Prophet', 'Known for her piety and fasting'],
    achievementsAr: ['حفظ نسخة المصحف الأصلية', 'من قلة النساء اللاتي تعلمن الكتابة', 'رويت أحاديث هامة عن النبي', 'اشتهرت بكثرة الصيام والقيام'],
    fullStory: `# Hafsa bint Umar\n\nHafsa was the daughter of the second Caliph, Umar. She was a woman of great knowledge and piety. After the death of her father, the first compiled manuscript of the Quran was kept in her safe custody until Uthman ibn Affan standardized the text.`,
    fullStoryAr: `# حفصة بنت عمر\n\nهي بنت الفاروق عمر، وزوجة النبي صلى الله عليه وسلم. كانت عابدة زاهدة، وقد تشرفت بحفظ النسخة الأصلية من القرآن الكريم (المصحف الجامع) في بيتها، وهي النسخة التي اعتمد عليها عثمان بن عفان في توحيد المصاحف.`,
    imageUrl: UNIFIED_THUMBNAIL
  },

  // --- Remaining Promised Paradise (Al-Mubashirun) ---
  {
    id: 'talha-ibn-ubaydillah',
    name: 'Talha ibn Ubaydillah',
    nameAr: 'طلحة بن عبيد الله',
    title: 'Talha the Generous',
    titleAr: 'طلحة الخير',
    category: 'promised',
    shortBio: 'A brave companion who protected the Prophet at Uhud.',
    shortBioAr: 'أحد العشرة المبشرين بالجنة، وبطل غزوة أحد الذي فدى النبي بنفسه.',
    achievements: ['Protector of the Prophet at Uhud', 'Known for immense generosity', 'One of the early converts', 'Wealthy merchant who gave all for Islam'],
    achievementsAr: ['فداء النبي في أحد حتى شلت يده', 'اشتهر بالجود والكرم العظيم', 'من السابقين الأولين للإسلام', 'أحد الستة أصحاب الشورى'],
    fullStory: `# Talha ibn Ubaydillah\n\nTalha was one of the earliest converts to Islam. At the Battle of Uhud, he stood as a shield for the Prophet, receiving over 70 wounds and losing the use of his hand to protect him. The Prophet called him "Talha the Generous" and "Talha the Good".`,
    fullStoryAr: `# طلحة بن عبيد الله\n\nصحابي جليل من السابقين الأولين. في غزوة أحد، جعل نفسه ترساً للنبي صلى الله عليه وسلم يتلقى السهام عنه حتى شلت يده، وحمله على ظهره حتى صعد الصخرة. قال عنه النبي: "من أراد أن ينظر إلى شهيد يمشي على وجه الأرض فلينظر إلى طلحة بن عبيد الله".`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'zubayr-ibn-al-awwam',
    name: 'Zubayr ibn Al-Awwam',
    nameAr: 'الزبير بن العوام',
    title: 'Disciple of the Prophet',
    titleAr: 'حواري رسول الله',
    category: 'promised',
    shortBio: 'The first to draw a sword for the sake of Allah.',
    shortBioAr: 'حواري النبي، وأول من سل سيفاً في سبيل الله.',
    achievements: ['Disciple of the Prophet', 'First to draw sword for Islam', 'Hero of many conquests', 'One of the six council members'],
    achievementsAr: ['حواري النبي صلى الله عليه وسلم', 'أول من سل سيفاً في الإسلام', 'بطل الفتوحات الإسلامية', 'أحد الستة أصحاب الشورى'],
    fullStory: `# Zubayr ibn Al-Awwam\n\nZubayr was the Prophet's cousin and a legendary warrior. The Prophet said: "Every Prophet has a disciple (Hawari), and my disciple is Zubayr." He was known for his extreme bravery and was never absent from any battle.`,
    fullStoryAr: `# الزبير بن العوام\n\nابن عمة النبي صلى الله عليه وسلم، وأحد العشرة المبشرين بالجنة. كان فارساً مقداماً، وهو أول من سل سيفه في مكة دفاعاً عن الإسلام. قال عنه النبي: "إن لكل نبي حوارياً، وحواريّ الزبير بن العوام".`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'abdur-rahman-ibn-awf',
    name: 'Abdur Rahman ibn Awf',
    nameAr: 'عبد الرحمن بن عوف',
    title: 'The Successful Merchant',
    titleAr: 'التاجر الصدوق',
    category: 'promised',
    shortBio: 'A wealthy companion who funded many Islamic expeditions.',
    shortBioAr: 'أحد العشرة المبشرين، والمنفق العظيم الذي بارك الله في تجارته.',
    achievements: ['Financed the Tabuk expedition', 'Known for honest business', 'Migrated to Abyssinia and Madinah', 'Council member for the next Caliph'],
    achievementsAr: ['تجهيز جيوش المسلمين بماله', 'البركة العظيمة في تجارته وصدقه', 'هاجر الهجرتين', 'أحد الستة أصحاب الشورى'],
    fullStory: `# Abdur Rahman ibn Awf\n\nAbdur Rahman was one of the most successful businessmen among the Sahaba. He famously said when he arrived in Madinah with nothing: "Show me the way to the market." Within a short time, he became wealthy again and used his wealth to support the Ummah.`,
    fullStoryAr: `# عبد الرحمن بن عوف\n\nأحد الثمانية الذين سبقوا إلى الإسلام. اشتهر بالبركة في تجارته، وكان يقول: "لقد رأيتني لو رفعت حجراً لرجوت أن أصيب تحته ذهباً أو فضة". تصدق بقوافل كاملة للفقراء، وكان من أعظم ممولي غزوات الرسول.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'sad-ibn-abi-waqqas',
    name: 'Sa\'d ibn Abi Waqqas',
    nameAr: 'سعد بن أبي وقاص',
    title: 'The Knight of Islam',
    titleAr: 'خال الرسول وفارس الإسلام',
    category: 'promised',
    shortBio: 'The first to shoot an arrow in the way of Allah.',
    shortBioAr: 'بطل القادسية، وأول من رمى بسهم في سبيل الله.',
    achievements: ['Conqueror of Persia', 'First to shoot arrow for Islam', 'Leader at the Battle of Qadisiyyah', 'One of the six council members'],
    achievementsAr: ['فاتح بلاد فارس', 'أول من رمى بسهم في الإسلام', 'قائد معركة القادسية الخالدة', 'أحد الستة أصحاب الشورى'],
    fullStory: `# Sa'd ibn Abi Waqqas\n\nSa'd was the maternal uncle of the Prophet. He was a master archer and a brilliant military commander. His greatest achievement was leading the Muslim army to a decisive victory at the Battle of Qadisiyyah against the Sassanid Empire.`,
    fullStoryAr: `# سعد بن أبي وقاص\n\nخال النبي صلى الله عليه وسلم، وأحد العشرة المبشرين بالجنة. كان مستجاب الدعوة، وبطلاً من أبطال الإسلام الكبار. هو الذي قاد جيوش المسلمين في معركة القادسية التي فتحت بلاد الفرس، وكان أول من رمى سهماً دفاعاً عن الدين.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'said-ibn-zayd',
    name: 'Said ibn Zayd',
    nameAr: 'سعيد بن زيد',
    title: 'The Devout',
    titleAr: 'الصحابي المستجاب الدعوة',
    category: 'promised',
    shortBio: 'An early convert who was famous for his answered prayers.',
    shortBioAr: 'أحد العشرة المبشرين، ومن السابقين الذين أسلموا قبل دخول دار الأرقم.',
    achievements: ['Early convert to Islam', 'Participated in all battles except Badr', 'Known for his extreme piety', 'Answered prayers (Mustajab al-Da\'wah)'],
    achievementsAr: ['من السابقين الأولين للإسلام', 'شهد المشاهد كلها مع النبي', 'الزهد والورع والبعد عن الفتن', 'كان مجاب الدعوة'],
    fullStory: `# Said ibn Zayd\n\nSaid was the son of Zayd ibn Amr, who practiced monotheism even before Islam. Said was among the very first to embrace Islam. He lived a life of devotion and stayed away from political turmoil, focusing on worship and Jihad.`,
    fullStoryAr: `# سعيد بن زيد\n\nابن زيد بن عمرو بن نفيل الذي مات على التوحيد قبل البعثة. أسلم سعيد وزوجته فاطمة بنت الخطاب (أخت عمر) وكان إسلامهما سبباً في إسلام عمر. كان زاهداً في الدنيا، بطلاً في القتال، ومستجاب الدعوة.`,
    imageUrl: UNIFIED_THUMBNAIL
  },
  {
    id: 'abu-ubaydah-ibn-al-jarrah',
    name: 'Abu Ubaydah ibn al-Jarrah',
    nameAr: 'أبو عبيدة بن الجراح',
    title: 'Trustworthy of the Ummah',
    titleAr: 'أمين الأمة',
    category: 'promised',
    shortBio: 'The commander who conquered much of the Levant.',
    shortBioAr: 'أحد العشرة المبشرين، وقائد الفتوحات في بلاد الشام.',
    achievements: ['Trustworthy of the Ummah', 'Conquered Damascus and Jerusalem', 'Hero of Yarmouk', 'Stayed with his plague-stricken army'],
    achievementsAr: ['لقب بأمين الأمة', 'فاتح دمشق والقدس', 'من أبطال معركة اليرموك', 'ضرب مثلاً في الوفاء لجنوده في طاعون عمواس'],
    fullStory: `# Abu Ubaydah ibn al-Jarrah\n\nAbu Ubaydah was known for his extreme integrity. The Prophet said: "Every nation has a trustworthy one, and the trustworthy one of this Ummah is Abu Ubaydah ibn al-Jarrah." He led the Islamic armies to victory across Syria and Palestine.`,
    fullStoryAr: `# أبو عبيدة بن الجراح\n\nعامر بن عبد الله الجراح، وصفه النبي بأنه "أمين هذه الأمة". كان من أزهد الصحابة وأكثرهم تواضعاً رغم قيادته للجيوش العظيمة. فتح بلاد الشام، واستشهد في طاعون عمواس بعد أن رفض ترك جنوده والنجاة بنفسه.`,
    imageUrl: UNIFIED_THUMBNAIL
  }
];
