import { Story } from './storiesData';

const realStories: Story[] = [
  {
    id: 'prophet-yusuf-beauty',
    title: 'جمال وصبر يوسف عليه السلام',
    targetAudience: 'child',
    category: 'Prophets',
    coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop',
    estimatedReadTime: '8 min',
    language: 'ar',
    isReal: true,
    markdownContent: `
# قصة يوسف عليه السلام
كان يوسف ولداً جميلاً ومحبوباً من والده يعقوب. حسده إخوته وألقوه في البئر...
### الصبر والفرج
بعد سنوات من الصبر والسجن، أصبح يوسف عزيز مصر. سامح إخوته وعاد شمل العائلة.
**الدرس:** الصبر مفتاح الفرج.
    `
  },
  {
    id: 'ashab-kahf',
    title: 'أصحاب الكهف',
    targetAudience: 'adult',
    category: 'Quranic Stories',
    coverImage: 'https://images.unsplash.com/photo-1505933333345-0d293f0b83e6?q=80&w=1000&auto=format&fit=crop',
    estimatedReadTime: '10 min',
    language: 'ar',
    isReal: true,
    markdownContent: `
# قصة أصحاب الكهف
فتية آمنوا بربهم فزادهم الله هدى. هربوا من ظلم الملك الجبار واختبؤوا في كهف.
### المعجزة
ناموا في الكهف 309 سنوات. عندما استيقظوا وجدوا العالم قد تغير وأصبح الجميع مؤمنين.
    `
  },
  {
    id: 'prophet-muhammad-mercy',
    title: 'The Mercy of Prophet Muhammad',
    targetAudience: 'child',
    category: 'Seerah',
    coverImage: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1000&auto=format&fit=crop',
    estimatedReadTime: '6 min',
    language: 'en',
    isReal: true,
    markdownContent: `
# The Prophet and the Bird
One day, the Prophet (PBUH) saw a bird distressed because its chicks were taken. He ordered them to be returned immediately.
### Compassion for All
The Prophet taught us to be kind not just to humans, but to every living creature.
    `
  }
];

const generatedStories: Story[] = Array.from({ length: 97 }).map((_, i) => ({
  id: `gen-story-${i + 1}`,
  title: `Generated Story #${i + 1} - الحكمة في ${i % 2 === 0 ? 'الصدق' : 'الأمانة'}`,
  targetAudience: i % 2 === 0 ? 'child' : 'adult',
  category: 'Spiritual Lessons',
  coverImage: `https://picsum.photos/seed/story${i}/800/500`,
  estimatedReadTime: `${Math.floor(Math.random() * 5) + 3} min`,
  language: i % 3 === 0 ? 'en' : 'ar',
  isReal: false,
  markdownContent: `
# Generated Spiritual Lesson #${i + 1}
This is an AI generated story meant to teach a lesson about ${i % 2 === 0 ? 'Honesty' : 'Trustworthiness'}.
### The Journey
Once upon a time, in a small village, there was a lesson to be learned...
**Moral:** Always do the right thing even when no one is watching.
  `
}));

export const allStories: Story[] = [...realStories, ...generatedStories];
