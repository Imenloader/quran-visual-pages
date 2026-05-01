export interface IslamicEvent {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriDate: { day: number; month: number }; // month 1-12
  descriptionAr: string;
  descriptionEn: string;
  tipsAr: string[];
  tipsEn: string[];
  color: string;
}

export const islamicEvents: IslamicEvent[] = [
  {
    id: 'ramadan',
    nameAr: 'شهر رمضان المبارك',
    nameEn: 'Ramadan',
    hijriDate: { day: 1, month: 9 },
    descriptionAr: 'شهر الصيام والقرآن والقيام.',
    descriptionEn: 'The month of fasting, Quran, and nocturnal prayers.',
    tipsAr: ['ابدأ بختمة تدبرية', 'جهز جدولك للقيام', 'نظم وجبات السحور'],
    tipsEn: ['Start a reflective Khatma', 'Prepare your Qiyam schedule', 'Organize Suhoor meals'],
    color: 'bg-emerald-500'
  },
  {
    id: 'eid-al-fitr',
    nameAr: 'عيد الفطر',
    nameEn: 'Eid al-Fitr',
    hijriDate: { day: 1, month: 10 },
    descriptionAr: 'جائزة الصائمين بعد شهر رمضان.',
    descriptionEn: 'The reward for those who fasted during Ramadan.',
    tipsAr: ['أخرج زكاة الفطر', 'صل الأرحام', 'أكثر من التكبير'],
    tipsEn: ['Pay Zakat al-Fitr', 'Visit relatives', 'Recite Takbeer frequently'],
    color: 'bg-gold'
  },
  {
    id: 'hajj-season',
    nameAr: 'موسم الحج (عشر ذي الحجة)',
    nameEn: 'Hajj Season (10 Days of Dhul-Hijjah)',
    hijriDate: { day: 1, month: 12 },
    descriptionAr: 'أفضل أيام الدنيا، فيها الأجر مضاعف.',
    descriptionEn: 'The best days of the world, where rewards are multiplied.',
    tipsAr: ['صم يوم عرفة', 'أكثر من التهليل والتكبير', 'جهز للأضحية'],
    tipsEn: ['Fast on the Day of Arafah', 'Recite Tahlil and Takbeer', 'Prepare for Udhiyah (Sacrifice)'],
    color: 'bg-blue-500'
  },
  {
    id: 'eid-al-adha',
    nameAr: 'عيد الأضحى',
    nameEn: 'Eid al-Adha',
    hijriDate: { day: 10, month: 12 },
    descriptionAr: 'ذكرى امتثال إبراهيم عليه السلام لأمر ربه.',
    descriptionEn: 'Commemorating Prophet Ibrahim\'s obedience to God.',
    tipsAr: ['صلاة العيد', 'توزيع الأضحية', 'إظهار الفرح'],
    tipsEn: ['Eid Prayer', 'Distribute the sacrifice', 'Express joy'],
    color: 'bg-indigo-500'
  },
  {
    id: 'islamic-new-year',
    nameAr: 'رأس السنة الهجرية',
    nameEn: 'Islamic New Year',
    hijriDate: { day: 1, month: 1 },
    descriptionAr: 'بداية عام هجري جديد، ذكرى الهجرة النبوية.',
    descriptionEn: 'Start of a new Hijri year, commemorating the Hijra.',
    tipsAr: ['حاسب نفسك على العام الماضي', 'ضع أهدافاً إيمانية جديدة'],
    tipsEn: ['Reflect on the past year', 'Set new spiritual goals'],
    color: 'bg-emerald-600'
  },
  {
    id: 'ashura',
    nameAr: 'يوم عاشوراء',
    nameEn: 'Ashura',
    hijriDate: { day: 10, month: 1 },
    descriptionAr: 'يوم نجى الله فيه موسى عليه السلام.',
    descriptionEn: 'The day God saved Prophet Musa (Moses).',
    tipsAr: ['صم اليوم العاشر والتاسع', 'وسع على أهلك'],
    tipsEn: ['Fast on the 9th and 10th', 'Be generous with family'],
    color: 'bg-amber-500'
  }
];
