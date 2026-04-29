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

export const SCHOLARS_DATA = [
  {
    id: 'ghaleez',
    name: 'محمد الغليظ',
    channelId: '@mohelghaleez',
    playlists: [
      { id: 'PL0S_Y1XpM30Xp5p6z8Q6H1VzYfXy5z8Q6', title: 'كلمات' },
      { id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'فضفضة الأحد' }
    ]
  },
  {
    id: 'samir',
    name: 'سمير مصطفى',
    channelId: '@SheikhSamirMustafa',
    playlists: [
      { id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'سلسلة التربية' }
    ]
  },
  {
    id: 'munir',
    name: 'أمير منير',
    channelId: '@AmirMounir',
    playlists: [
      { id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'فيديوهات مميزة' }
    ]
  },
  {
    id: 'hamed',
    name: 'علاء حامد',
    channelId: '@AlaaHamed',
    playlists: [
      { id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'دروس القلوب' }
    ]
  },
  {
    id: 'zad',
    name: 'أكاديمية زاد',
    channelId: '@ZadAcademy',
    playlists: [
      { id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'المستوى الأول' }
    ]
  }
];
