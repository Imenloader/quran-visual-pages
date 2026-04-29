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
  { id: 'gym', name: 'تمارين الجيم', description: 'تمارين كمال الأجسام واللياقة في الصالة الرياضية' },
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
  {
    id: 'PLyXf8H_z7T5xX_z7T5xX_z7T5xX_z7T5',
    title: 'تضخيم العضلات للمبتدئين',
    description: 'دليل شامل للتمارين في الجيم',
    categoryId: 'gym',
    channelTitle: 'Ahmed Fitness',
  }
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
    channelId: '@mohelghaleez',
    playlists: [
      { id: 'UU_a8j9l_8_3pQG625D-T29w', title: 'دروس وكلمات (المكتبة الكاملة)' },
      { id: 'PL0S_Y1XpM30VrVp1VzYfXy5z8Q6', title: 'سلسلة كلمات (مختارات)' }
    ]
  },
  {
    id: 'samir',
    name: 'سمير مصطفى',
    channelId: '@SheikhSamirMustafa',
    playlists: [
      { id: 'UUZ-qS7pL-8Xv_Z_Z_Z_Z_Z_Z_Z', title: 'الدروس الكاملة' },
      { id: 'PLZ_vW7t_m_N1N7E6X_z7T5xX_z7T5xX_z', title: 'سلسلة التربية' }
    ]
  },
  {
    id: 'munir',
    name: 'أمير منير',
    channelId: '@AmirMounir',
    playlists: [
      { id: 'UU2H3w592q8nL7w36iT-W91Q', title: 'كل الفيديوهات' },
      { id: 'PL_S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'فيديوهات رمضانية' }
    ]
  },
  {
    id: 'hamed',
    name: 'علاء حامد',
    channelId: '@AlaaHamed',
    playlists: [
      { id: 'UU3lAAHame-dYk2j9d-J-J4w', title: 'المكتبة الإيمانية الكاملة' },
      { id: 'PL_S_Y1XpM30X1VzYfXy5z8Q6', title: 'دروس القلوب' }
    ]
  }
];

export const ZAD_ACADEMY_LEVELS = [
  { id: 'L1', title: 'المستوى الأول', playlistId: 'PL2-FkZlEhqXREiSg-uB7W99J78J3m9Z9z', description: 'بداية الرحلة في العلوم الشرعية' },
  { id: 'L2', title: 'المستوى الثاني', playlistId: 'PL2-FkZlEhqXT-pYpYpYpYpYpYpYpYpYp', description: 'تعميق الفهم في العقيدة والفقه' },
  { id: 'L3', title: 'المستوى الثالث', playlistId: 'PL2-FkZlEhqXU-pYpYpYpYpYpYpYpYpYp', description: 'دراسة الحديث والتفسير المتقدم' },
  { id: 'L4', title: 'المستوى الرابع', playlistId: 'PL2-FkZlEhqXV-pYpYpYpYpYpYpYpYpYp', description: 'ختام المنهج الأكاديمي' }
];
