import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Sun, Moon, Shield, BookOpen, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface Dhikr {
  id: number;
  text: string;
  reference: string;
  count: number;
  virtue?: string;
}

interface AthkarCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  athkar: Dhikr[];
}

const ATHKAR_DATA: AthkarCategory[] = [
  {
    id: "morning",
    title: "أذكار الصباح",
    icon: <Sun size={20} />,
    description: "تُقال بعد صلاة الفجر حتى طلوع الشمس",
    athkar: [
      { id: 1, text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", reference: "رواه مسلم", count: 1 },
      { id: 2, text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", reference: "رواه الترمذي", count: 1 },
      { id: 3, text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", reference: "رواه البخاري", count: 1, virtue: "سيد الاستغفار - من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة" },
      { id: 4, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", reference: "رواه مسلم", count: 100, virtue: "من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به" },
      { id: 5, text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", reference: "متفق عليه", count: 10, virtue: "كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة" },
      { id: 6, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", reference: "رواه مسلم", count: 3 },
      { id: 7, text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي", reference: "صحيح - رواه أبو داود وابن ماجه", count: 1 },
      { id: 8, text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", reference: "رواه أبو داود والترمذي", count: 3, virtue: "لم يضره شيء" },
      { id: 9, text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", reference: "رواه أبو داود والترمذي", count: 3, virtue: "كان حقاً على الله أن يرضيه يوم القيامة" },
      { id: 10, text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", reference: "صحيح - رواه الحاكم", count: 1 },
      { id: 11, text: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ", reference: "رواه أحمد", count: 1 },
      { id: 12, text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", reference: "رواه مسلم", count: 3 },
      { id: 13, text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ", reference: "صحيح - رواه أبو داود", count: 3 },
    ],
  },
  {
    id: "evening",
    title: "أذكار المساء",
    icon: <Moon size={20} />,
    description: "تُقال بعد صلاة العصر حتى المغرب",
    athkar: [
      { id: 101, text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", reference: "رواه مسلم", count: 1 },
      { id: 102, text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", reference: "رواه الترمذي", count: 1 },
      { id: 103, text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", reference: "رواه البخاري", count: 1, virtue: "سيد الاستغفار" },
      { id: 104, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", reference: "رواه مسلم", count: 100, virtue: "حُطت خطاياه وإن كانت مثل زبد البحر" },
      { id: 105, text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", reference: "رواه مسلم", count: 3 },
      { id: 106, text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", reference: "رواه أبو داود والترمذي", count: 3 },
      { id: 107, text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", reference: "رواه أبو داود والترمذي", count: 3 },
      { id: 108, text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", reference: "صحيح - رواه الحاكم", count: 1 },
      { id: 109, text: "أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ", reference: "رواه أحمد", count: 1 },
      { id: 110, text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي", reference: "صحيح - رواه أبو داود وابن ماجه", count: 1 },
      { id: 111, text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ", reference: "صحيح - رواه أبو داود", count: 3 },
      { id: 112, text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", reference: "متفق عليه", count: 10 },
    ],
  },
  {
    id: "sleep",
    title: "أذكار النوم",
    icon: <Moon size={20} />,
    description: "تُقال عند النوم",
    athkar: [
      { id: 201, text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", reference: "رواه البخاري", count: 1 },
      { id: 202, text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", reference: "رواه أبو داود والترمذي", count: 3 },
      { id: 203, text: "سُبْحَانَ اللَّهِ (٣٣ مرة) وَالْحَمْدُ لِلَّهِ (٣٣ مرة) وَاللَّهُ أَكْبَرُ (٣٤ مرة)", reference: "متفق عليه", count: 1, virtue: "خير لكما من خادم" },
      { id: 204, text: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنَزِّلَ التَّوْرَاةِ وَالإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ", reference: "رواه مسلم", count: 1 },
      { id: 205, text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ", reference: "متفق عليه", count: 1, virtue: "من قالها ثم مات مات على الفطرة" },
    ],
  },
  {
    id: "afterprayer",
    title: "أذكار بعد الصلاة",
    icon: <Shield size={20} />,
    description: "تُقال بعد كل صلاة مفروضة",
    athkar: [
      { id: 301, text: "أَسْتَغْفِرُ اللَّهَ (ثلاثاً). اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ", reference: "رواه مسلم", count: 1 },
      { id: 302, text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ", reference: "متفق عليه", count: 1 },
      { id: 303, text: "سُبْحَانَ اللَّهِ (٣٣ مرة) وَالْحَمْدُ لِلَّهِ (٣٣ مرة) وَاللَّهُ أَكْبَرُ (٣٣ مرة) وتمام المائة: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", reference: "رواه مسلم", count: 1, virtue: "غُفرت خطاياه وإن كانت مثل زبد البحر" },
      { id: 304, text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", reference: "رواه الترمذي", count: 10, virtue: "بعد صلاة المغرب والفجر" },
    ],
  },
  {
    id: "general",
    title: "أذكار متنوعة",
    icon: <BookOpen size={20} />,
    description: "أذكار وأدعية مأثورة من حصن المسلم",
    athkar: [
      { id: 401, text: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ", reference: "متفق عليه", count: 0, virtue: "كنز من كنوز الجنة" },
      { id: 402, text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ", reference: "رواه مسلم", count: 0, virtue: "أحب الكلام إلى الله" },
      { id: 403, text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", reference: "رواه مسلم", count: 10, virtue: "من صلى عليّ صلاة واحدة صلى الله عليه بها عشرا" },
      { id: 404, text: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", reference: "رواه أبو داود", count: 7, virtue: "من قالها سبع مرات كفاه الله ما أهمه" },
      { id: 405, text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", reference: "متفق عليه", count: 100, virtue: "كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة" },
    ],
  },
];

const COUNTER_KEY = "athkar-counters";

const getCounters = (): Record<number, number> => {
  try {
    const data = localStorage.getItem(COUNTER_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

const Athkar = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("morning");
  const [counters, setCounters] = useState<Record<number, number>>(getCounters);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const incrementCounter = (dhikrId: number) => {
    setCounters(prev => {
      const updated = { ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 };
      localStorage.setItem(COUNTER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetCounters = () => {
    setCounters({});
    localStorage.removeItem(COUNTER_KEY);
  };

  const copyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="flex justify-between items-center pt-3 pb-1">
          <Link to="/" className="flex items-center gap-1.5 bg-gold text-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all font-naskh text-sm font-bold shadow-md">
            <Home size={16} />
            الرئيسية
          </Link>
          <button onClick={resetCounters} className="text-xs font-naskh text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
            إعادة تعيين العدادات
          </button>
        </div>
        <div className="pb-6">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">الأذكار</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">من حصن المسلم</p>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-4 space-y-3">
        {ATHKAR_DATA.map(category => (
          <div key={category.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full gradient-islamic flex items-center justify-center shrink-0 text-primary-foreground">
                {category.icon}
              </div>
              <div className="flex-1 text-right">
                <p className="font-naskh text-sm font-bold text-foreground">{category.title}</p>
                <p className="text-xs text-muted-foreground font-naskh">{category.description}</p>
              </div>
              {expandedCategory === category.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {expandedCategory === category.id && (
              <div className="border-t border-border divide-y divide-border">
                {category.athkar.map(dhikr => {
                  const currentCount = counters[dhikr.id] || 0;
                  const isDone = dhikr.count > 0 && currentCount >= dhikr.count;
                  return (
                    <div key={dhikr.id} className={`px-4 py-4 transition-colors ${isDone ? "bg-primary/5" : ""}`}>
                      <p className="font-amiri text-base sm:text-lg leading-loose text-foreground mb-3">{dhikr.text}</p>
                      
                      {dhikr.virtue && (
                        <p className="text-xs font-naskh text-gold mb-2 bg-gold/10 rounded-lg px-3 py-1.5 inline-block">
                          ✨ {dhikr.virtue}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-naskh">{dhikr.reference}</span>
                          <button onClick={() => copyText(dhikr.text, dhikr.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                            {copiedId === dhikr.id ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {dhikr.count > 0 && (
                          <button
                            onClick={() => incrementCounter(dhikr.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-naskh text-sm font-bold transition-all active:scale-95 ${
                              isDone
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "gradient-islamic text-primary-foreground shadow-sm"
                            }`}
                          >
                            <span>{isDone ? "✓" : currentCount}/{dhikr.count}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="text-center py-4 text-muted-foreground text-xs font-naskh border-t border-border">
        المصدر: حصن المسلم - من أذكار الكتاب والسنة
      </footer>
    </div>
  );
};

export default Athkar;
