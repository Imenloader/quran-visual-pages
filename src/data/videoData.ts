export interface VideoCategory {
  id: string;
  name: string;
  description: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  categoryId: string;
  channelTitle: string;
}

export const FITNESS_CATEGORIES: VideoCategory[] = [
  { id: 'home', name: 'تمارين منزلية', description: 'تمارين يمكن القيام بها في المنزل بدون معدات' },

  { id: 'nutrition', name: 'تغذية وصحة', description: 'نصائح غذائية لبناء جسم قوي' },
];

export const KNOWLEDGE_CATEGORIES: VideoCategory[] = [
  { id: 'scholars', name: 'دروس المشايخ', description: 'سلاسل ودروس من كبار الدعاة' },
  { id: 'academy', name: 'أكاديمية زاد', description: 'المنهج التعليمي الشرعي' },
  { id: 'short', name: 'مقاطع قصيرة', description: 'مواعظ وفوائد سريعة' },
];

export const FITNESS_PLAYLISTS: YouTubePlaylist[] = [
  {
    id: 'PL9_vW7t_m_N1N7E6X_z7T5xX_z7T5xX_z', // Placeholder
    title: 'تحدي ٣٠ يوم في المنزل',
    description: 'تمارين يومية لشد الجسم في البيت',
    categoryId: 'home',
    channelTitle: 'Captain Anis',
  },

];

export const EXERCISES = [
  // Upper Body
  { id: 'pushups', name: 'تمرين الضغط (Pushups)', target: 'الصدر والترايسيبس', videoId: 'YRhFSWz_J3I', difficulty: 'متوسط', description: 'تمرين أساسي لتقوية الجزء العلوي من الجسم.' },
  { id: 'pullups', name: 'تمرين العقلة (Pull-ups)', target: 'الظهر والبيسيبس', videoId: 'eGo4IYlbE5g', difficulty: 'صعب', description: 'أقوى تمرين لبناء عضلات الظهر.' },
  { id: 'dips', name: 'تمرين المتوازي (Dips)', target: 'الترايسيبس والصدر السفلي', videoId: '6kALZikcCdM', difficulty: 'متوسط', description: 'لتقوية الذراعين ومنطقة الصدر.' },
  
  // Lower Body
  { id: 'squats', name: 'تمرين القرفصاء (Squats)', target: 'الأرجل والأرداف', videoId: '0kP0rP0r57s', difficulty: 'سهل', description: 'تمرين ممتاز لتقوية عضلات الأرجل وبناء القوة.' },
  { id: 'lunges', name: 'تمرين الطعن (Lunges)', target: 'الأرجل والتوازن', videoId: 'QOVaHwm-Q6U', difficulty: 'متوسط', description: 'لتحسين التوازن وقوة الأرجل المنفردة.' },
  
  // Core & Cardio
  { id: 'plank', name: 'تمرين البلانك (Plank)', target: 'عضلات البطن والمركز', videoId: 'pYcpY20QaE8', difficulty: 'متوسط', description: 'تمرين الثبات لتقوية عضلات البطن والظهر.' },
  { id: 'burpees', name: 'تمرين البيربي (Burpees)', target: 'كامل الجسم - كارديو', videoId: 'fB8vL0-Yq_U', difficulty: 'صعب', description: 'تمرين عالي الشدة لحرق الدهون ورفع اللياقة.' },
  { id: 'mountain-climbers', name: 'متسلق الجبال', target: 'البطن والكارديو', videoId: 'nmwgirg-V60', difficulty: 'متوسط', description: 'لرفع معدل ضربات القلب وتقوية البطن.' }
];

export const SET_DHIKR = [
  { text: 'سبحان الله وبحمده', count: 33, benefit: 'غرس نخلة في الجنة' },
  { text: 'أستغفر الله وأتوب إليه', count: 10, benefit: 'راحة للقلب وسعة في الرزق' },
  { text: 'لا حول ولا قوة إلا بالله', count: 10, benefit: 'كنز من كنوز الجنة' },
  { text: 'اللهم صل وسلم على نبينا محمد', count: 10, benefit: 'قضاء الحوائج وكفاية الهم' }
];

export const NUTRITION_TIPS = [
  {
    id: 'protein',
    title: 'أهمية البروتين لبناء العضلات',
    content: 'يعد البروتين حجر الأساس لبناء الأنسجة العضلية وترميمها بعد التمرين.',
    videoId: '2pZ8D1_6Q6Y'
  },
  {
    id: 'sunnah-foods',
    title: 'أغذية من السنة النبوية',
    content: 'التمر، العسل، زيت الزيتون، واللبن.. كنوز غذائية وصحية أوصى بها النبي صلى الله عليه وسلم.',
    videoId: 'rB9U6n6vE5M'
  },
  {
    id: 'recipe-1',
    title: 'وجبة فطور صحية وعالية البروتين',
    content: 'طريقة تحضير فطور متكامل يمدك بالطاقة طوال اليوم.',
    videoId: 'rB9U6n6vE5M'
  },
  {
    id: 'water',
    title: 'شرب الماء والأداء الرياضي',
    content: 'الجفاف يؤدي لتراجع الأداء بنسبة تصل لـ ٢٠٪، احرص على شرب الماء بانتظام.',
    videoId: 'E_m1S06vE5M' 
  }
];

export const SCHOLARS_DATA = [
  {
    id: 'ghaleez',
    name: 'محمد الغليظ',
    channelUrl: 'https://www.youtube.com/@mohelghaleez',
    description: 'دروس تربوية ومواعظ إيمانية تلامس قلوب الشباب.'
  },
  {
    id: 'alaahamed',
    name: 'علاء حامد',
    channelUrl: 'https://www.youtube.com/@AlaaHamed',
    description: 'سلسلة إني أخاف الله ودروس في تزكية النفس وإصلاح القلوب.'
  },
  {
    id: 'shoman',
    name: 'حازم شومان',
    channelUrl: 'https://www.youtube.com/@DrHazemShoman',
    description: 'دروس قوية في التوبة والعودة إلى الله والهمة في العبادة.'
  },
  {
    id: 'aymanswayd',
    name: 'أيمن سويد',
    channelUrl: 'https://www.youtube.com/@DrAymanSwayd',
    description: 'مرجع التجويد والقراءات، دروس مفصلة في قواعد التلاوة.'
  },
  {
    id: 'alkhamis',
    name: 'عثمان الخميس',
    channelUrl: 'https://www.youtube.com/@othmanalkamees',
    description: 'دروس العقيدة والفقه والرد على الشبهات بأسلوب علمي رصين.'
  },
  {
    id: 'alkamali',
    name: 'سعيد الكملي',
    channelUrl: 'https://www.youtube.com/@SaidiKamali',
    description: 'شروحات الموطأ والأدب العربي والفقيه المالكي المتميز.'
  },
  {
    id: 'mustafa_hosny',
    name: 'مصطفى حسني',
    channelUrl: 'https://www.youtube.com/@MustafaHosny',
    description: 'برامج تربوية معاصرة تركز على الأخلاق والتعاملات الإنسانية.'
  },
  {
    id: 'zakir_naik',
    name: 'ذاكر نايك',
    channelUrl: 'https://www.youtube.com/@DrZakirNaik',
    description: 'مقارنة الأديان والدعوة إلى الله بأسلوب منطقي وعلمي.'
  }
];

export const ZAD_ACADEMY_LEVELS = [
  { id: 'academy', title: 'قناة أكاديمية زاد', playlistId: 'PL2-FkZlEhqXREiSg-uB7W99J78J3m9Z9z', url: 'https://www.youtube.com/@AcademyZAD', description: 'المنهج التعليمي الشرعي المتكامل لطلب العلم.' }
];
