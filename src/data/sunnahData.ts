export interface SunnahAction {
  id: number;
  textAr: string;
  textEn: string;
  category: string;
}

export const sunnahActions: SunnahAction[] = [
  {
    id: 1,
    textAr: "التبسم في وجه أخيك صدقة",
    textEn: "Smiling in the face of your brother is charity.",
    category: "Social"
  },
  {
    id: 2,
    textAr: "البدء بالوضوء قبل النوم",
    textEn: "Performing Wudu before sleeping.",
    category: "Daily"
  },
  {
    id: 3,
    textAr: "التسمية قبل الأكل",
    textEn: "Saying Bismillah before eating.",
    category: "Daily"
  },
  {
    id: 4,
    textAr: "السواك عند كل صلاة",
    textEn: "Using Miswak before every prayer.",
    category: "Prayer"
  },
  {
    id: 5,
    textAr: "شرب الماء على ثلاث دفعات وجالساً",
    textEn: "Drinking water in three breaths while sitting.",
    category: "Daily"
  },
  {
    id: 6,
    textAr: "إفشاء السلام على من عرفت ومن لم تعرف",
    textEn: "Spreading peace (Salam) to those you know and those you don't.",
    category: "Social"
  },
  {
    id: 7,
    textAr: "المصافحة عند اللقاء",
    textEn: "Shaking hands when meeting.",
    category: "Social"
  }
];
