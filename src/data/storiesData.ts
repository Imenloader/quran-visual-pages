export interface Story {
  id: string;
  title: string;
  targetAudience: 'child' | 'adult';
  category: string;
  coverImage: string;
  markdownContent: string;
  estimatedReadTime: string;
  author?: string;
  language: 'ar' | 'en';
}

export const stories: Story[] = [
  {
    id: 'prophet-nuh-ark',
    title: 'سفينة نوح عليه السلام',
    targetAudience: 'child',
    category: 'Prophets',
    coverImage: 'https://images.unsplash.com/photo-1590076214667-cda43216bb8b?q=80&w=1000&auto=format&fit=crop',
    estimatedReadTime: '5 min',
    language: 'ar',
    markdownContent: `
# قصة سيدنا نوح عليه السلام

كان هناك نبي عظيم اسمه نوح. كان نوح يدعو قومه ليعبدوا الله وحده.

### بناء السفينة
أمر الله نوحاً أن يبني سفينة كبيرة جداً. بدأ نوح وأصحابه ببناء السفينة في وسط الصحراء. كان الناس يضحكون ويقولون: "كيف ستسير السفينة في الرمل؟"

لكن نوحاً كان يثق بالله.

### الطوفان
عندما انتهى نوح من بناء السفينة، أمر الله السماء أن تمطر والأرض أن تخرج الماء. ركب نوح والمؤمنون السفينة، وأخذوا معهم من كل زوجين اثنين من الحيوانات.

نجا نوح ومن معه بفضل الله، وعاشت الحيوانات بسلام.

**الدرس المستفاد:** دائماً نثق بالله ونطيعه.
    `
  },
  {
    id: 'companion-musab',
    title: 'Musab ibn Umayr: The First Ambassador',
    targetAudience: 'adult',
    category: 'Companions',
    coverImage: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop',
    estimatedReadTime: '12 min',
    language: 'en',
    markdownContent: `
# Musab ibn Umayr (RA)

Musab ibn Umayr was one of the most handsome and wealthiest youths in Makkah. He was known for his fine clothes and expensive perfumes.

### The Turning Point
When he heard about the message of Prophet Muhammad (PBUH), he embraced Islam secretly. Despite his family's wealth, they persecuted him when they found out. He chose the path of Allah over his riches.

### The Mission to Madinah
Musab was chosen by the Prophet (PBUH) to be the first ambassador to Madinah. His gentleness and deep knowledge of the Quran helped many people in Madinah embrace Islam even before the Hijrah.

### Legacy
He fell as a martyr in the Battle of Uhud. When he passed away, they couldn't even find a cloth long enough to cover his entire body, showing the immense sacrifice he made from being the wealthiest youth to a humble martyr for Allah.

*Musab's story is a testament to prioritizing eternal values over temporary worldly gains.*
    `
  }
];
