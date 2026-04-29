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
  {
    id: 'pushups',
    name: 'تمرين الضغط (Pushups)',
    target: 'الصدر والترايسيبس',
    videoId: 'kYJ5_l_0V4Y',
    difficulty: 'متوسط',
    description: 'تمرين أساسي لتقوية الجزء العلوي من الجسم.'
  },
  {
    id: 'squats',
    name: 'تمرين القرفصاء (Squats)',
    target: 'الأرجل والأرداف',
    videoId: 'qcG69UM9JOU',
    difficulty: 'سهل',
    description: 'تمرين ممتاز لتقوية عضلات الأرجل وبناء القوة.'
  },
  {
    id: 'plank',
    name: 'تمرين البلانك (Plank)',
    target: 'عضلات البطن والمركز',
    videoId: 'y3mIn64_kUo',
    difficulty: 'متوسط',
    description: 'تمرين الثبات لتقوية عضلات البطن والظهر.'
  },
  {
    id: 'burpees',
    name: 'تمرين البيربي (Burpees)',
    target: 'كامل الجسم - كارديو',
    videoId: 'kR6ZfWlX10A',
    difficulty: 'صعب',
    description: 'تمرين عالي الشدة لحرق الدهون ورفع اللياقة.'
  }
];

export const NUTRITION_TIPS = [
  {
    id: 'protein',
    title: 'أهمية البروتين لبناء العضلات',
    content: 'يعد البروتين حجر الأساس لبناء الأنسجة العضلية وترميمها بعد التمرين.',
    videoId: '2pZ8D1_6Q6Y'
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
      { id: 'UU_a8j9l_8_3pQG625D-T29w', title: 'دروس وكلمات' },
      { id: 'PL0S_Y1XpM30VrVp1VzYfXy5z8Q6', title: 'سلسلة كلمات' }
    ]
  },
  {
    id: 'samir',
    name: 'سمير مصطفى',
    channelId: '@SheikhSamirMustafa',
    playlists: [
      { id: 'PLZ_vW7t_m_N1N7E6X_z7T5xX_z7T5xX_z', title: 'سلسلة التربية' }
    ]
  },
  {
    id: 'munir',
    name: 'أمير منير',
    channelId: '@AmirMounir',
    playlists: [
      { id: 'UU2H3w592q8nL7w36iT-W91Q', title: 'فيديوهات مختارة' }
    ]
  },
  {
    id: 'hamed',
    name: 'علاء حامد',
    channelId: '@AlaaHamed',
    playlists: [
      { id: 'UU3lAAHame-dYk2j9d-J-J4w', title: 'دروس إيمانية' }
    ]
  },
  {
    id: 'zad',
    name: 'أكاديمية زاد',
    channelId: '@AcademyZAD',
    playlists: [
      { id: 'PL2-FkZlEhqXQYy9kGZ9Z9Z9Z9Z9Z9Z9Z', title: 'منهج المستوى الأول' }
    ]
  }
];
