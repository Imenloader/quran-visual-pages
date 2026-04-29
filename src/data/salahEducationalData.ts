export interface EducationalSection {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  icon?: string;
}

export const salahEducationalContent: EducationalSection[] = [
  {
    id: 'pillars',
    title: 'Pillars of Salah (Arkan)',
    titleAr: 'أركان الصلاة',
    content: `
      Salah has 14 essential pillars (Arkan) that must be performed for the prayer to be valid. If any of these are missed intentionally or unintentionally, the prayer is void and must be repeated.
      
      1. **Standing (Qiyam)**: During obligatory prayers for those who are able.
      2. **Takbiratul Ihram**: The opening "Allahu Akbar".
      3. **Reciting Surah Al-Fatiha**: In every Rakah.
      4. **Ruku (Bowing)**: Bending forward so hands touch the knees.
      5. **Rising from Ruku**: And standing straight.
      6. **Sujud (Prostration)**: On seven body parts.
      7. **Rising from Sujud**: And sitting between the two prostrations.
      8. **Sitting between the two prostrations**.
      9. **Tranquility (Tuma'ninah)**: In all physical actions.
      10. **The Final Tashahhud**.
      11. **Sitting for the Final Tashahhud**.
      12. **The Ibrahimic Prayer (Salat ala al-Nabi)**.
      13. **The Taslim**: Saying "Assalamu Alaikum".
      14. **Sequence**: Performing the pillars in the correct order.
    `,
    contentAr: `
      أركان الصلاة هي الأجزاء التي لا تسقط عمداً ولا سهواً، وإذا نقص ركن بطلت الصلاة. وهي 14 ركناً:
      
      1. **القيام**: في الفرض للقادر عليه.
      2. **تكبيرة الإحرام**: وهي قول "الله أكبر" في بداية الصلاة.
      3. **قراءة الفاتحة**: في كل ركعة.
      4. **الركوع**: وأقله أن ينحني بحيث تلمس يداه ركبتيه.
      5. **الرفع من الركوع**.
      6. **الاعتدال قائماً**.
      7. **السجود**: على الأعضاء السبعة (الجبهة والأنف، الكفان، الركبتان، أطراف القدمين).
      8. **الرفع من السجود**.
      9. **الجلسة بين السجدتين**.
      10. **الطُمأنينة**: وهي السكون في كل ركن فعلي.
      11. **التشهد الأخير**.
      12. **الجلوس للتشهد الأخير وللتسليمتين**.
      13. **الصلاة على النبي ﷺ**: بعد التشهد الأخير.
      14. **التسليمتان**: وهي قول "السلام عليكم ورحمة الله".
      15. **الترتيب**: بين الأركان كما ذكرنا.
    `
  },
  {
    id: 'zikr',
    title: 'Zikr After Salah',
    titleAr: 'الأذكار بعد الصلاة',
    content: `
      It is highly recommended to perform the following supplications after completing the Taslim:
      
      1. **Astaghfirullah (3 times)**: "I seek Allah's forgiveness."
      2. **Allahumma Antas-Salam...**: "O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honor."
      3. **Tasbih (Subhanallah)**: 33 times.
      4. **Tahmid (Alhamdulillah)**: 33 times.
      5. **Takbir (Allahu Akbar)**: 33 times.
      6. **Completing the 100**: "La ilaha illallah wahdahu la sharika lah..."
      7. **Ayat al-Kursi**: Reciting this after every prayer is a means to enter Paradise.
      8. **Surah Al-Ikhlas, Al-Falaq, and An-Nas**: Once after Dhuhr, Asr, and Isha; three times after Fajr and Maghrib.
    `,
    contentAr: `
      يُستحب للمصلي بعد الفراغ من الصلاة أن يأتي بالأذكار المأثورة:
      
      1. **الاستغفار ثلاثاً**: (أستغفر الله، أستغفر الله، أستغفر الله).
      2. **اللهم أنت السلام**: (اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام).
      3. **التسبيح**: (سبحان الله) 33 مرة.
      4. **التحميد**: (الحمد لله) 33 مرة.
      5. **التكبير**: (الله أكبر) 33 مرة.
      6. **تمام المائة**: (لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير).
      7. **قراءة آية الكرسي**: (من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت).
      8. **المعوذات**: (سورة الإخلاص، الفلق، الناس) مرة بعد كل صلاة، وثلاثاً بعد الفجر والمغرب.
    `
  },
  {
    id: 'benefits',
    title: 'Benefits & Virtues',
    titleAr: 'فضائل الصلاة وفوائدها',
    content: `
      Salah is the second pillar of Islam and the primary connection between the servant and his Creator.
      
      * **Spiritual Purification**: The Prophet ﷺ compared the five daily prayers to a river flowing at one's door; if he bathes in it five times a day, no dirt will remain on him.
      * **Inner Peace**: It provides relief from the stresses of daily life (as the Prophet said: "O Bilal, give us comfort with it").
      * **Discipline**: It teaches time management and commitment.
      * **Forgiveness of Sins**: Sins committed between prayers are forgiven as long as major sins are avoided.
      * **Success**: "Successful indeed are the believers, those who offer their prayers with Khushu (humility)." [Quran 23:1-2]
    `,
    contentAr: `
      الصلاة هي عماد الدين ورأس الإسلام، ولها فضائل لا تُعد ولا تُحصى:
      
      * **تكفير الذنوب**: الصلاة إلى الصلاة كفارة لما بينهما إذا اجتنبت الكبائر.
      * **نور في القلب والوجه**: هي صلة العبد بربه ومصدر طمأنينته.
      * **الراحة النفسية**: كان النبي ﷺ يقول: "أرحنا بها يا بلال".
      * **النهي عن الفحشاء والمنكر**: {إن الصلاة تنهى عن الفحشاء والمنكر}.
      * **أول ما يُحاسب عليه العبد**: إذا صلحت صلح سائر عمله، وإذا فسدت فسد سائر عمله.
    `
  },
  {
    id: 'consistency',
    title: 'Tips for Consistency',
    titleAr: 'كيف تحافظ على صلاتك؟',
    content: `
      Consistency (Istiqamah) is key to a successful spiritual life. Here is how to avoid laziness:
      
      1. **Pray on Time**: The most beloved deed to Allah is prayer at its earliest time.
      2. **Make Dua**: Ask Allah: "O Allah, help me to remember You, thank You, and worship You in the best manner."
      3. **Find Good Company**: Surround yourself with friends who prioritize their prayers.
      4. **Learn the Meanings**: Understanding what you recite in prayer increases Khushu and makes you look forward to it.
      5. **Start Small**: If you find it hard, start with the obligatory (Fard) prayers first, then gradually add Sunnah.
      6. **Think of the Grave**: Remember that the first question in the grave will be about your Salah.
    `,
    contentAr: `
      الاستقامة على الصلاة هي سر النجاح في الدنيا والآخرة. إليك طرقاً عملية لترك التكاسل:
      
      1. **الصلاة في أول وقتها**: أحب الأعمال إلى الله الصلاة على وقتها.
      2. **الدعاء**: ألح على الله بدعاء: "اللهم أعني على ذكرك وشكرك وحسن عبادتك".
      3. **الصحبة الصالحة**: ابحث عن أصدقاء يذكرونك بالصلاة ويشجعونك عليها.
      4. **فهم معاني الصلاة**: عندما تفهم ما تقول في الركوع والسجود، سيزداد خشوعك وتشتاق للصلاة.
      5. **استشعر الوقوف بين يدي الله**: أنت الآن تخاطب ملك الملوك، فاستحضر عظمته.
      6. **تذكر الموت**: الصلاة هي أول ما تُسأل عنه، فاجعلها أول اهتماماتك.
    `
  },
  {
    id: 'hadiths',
    title: 'Prophetic Hadiths',
    titleAr: 'أحاديث نبوية في الصلاة',
    content: `
      * "The key to Paradise is prayer, and the key to prayer is purification (Wudu)." [Musnad Ahmad]
      * "Between a man and shirk and disbelief is the abandonment of prayer." [Muslim]
      * "Pray as you have seen me praying." [Bukhari]
      * "The closest a servant comes to his Lord is when he is in prostration (Sujud)." [Muslim]
    `,
    contentAr: `
      * "مفتاح الجنة الصلاة، ومفتاح الصلاة الوضوء" [رواه أحمد].
      * "بين الرجل وبين الشرك والكفر ترك الصلاة" [رواه مسلم].
      * "صلوا كما رأيتموني أصلي" [رواه البخاري].
      * "أقرب ما يكون العبد من ربه وهو ساجد، فأكثروا الدعاء" [رواه مسلم].
    `
  },
  {
    id: 'mistakes',
    title: 'Common Mistakes',
    titleAr: 'أخطاء شائعة في الصلاة',
    content: `
      Avoiding common mistakes ensures your prayer is performed correctly and with full reward:
      
      1. **Moving Too Fast**: Lack of tranquility (Tuma'ninah) is one of the most common mistakes. Each posture should be held until you are still.
      2. **Preceding the Imam**: In congregational prayer, you must follow the Imam, not move before him.
      3. **Looking Around**: You should keep your eyes on the place of prostration.
      4. **Incorrect Sujud**: Not placing all seven body parts firmly on the ground (forehead/nose, two palms, two knees, and two sets of toes).
      5. **Tucking Up Clothes/Hair**: The Prophet ﷺ forbade tucking up hair or clothes during prayer.
    `,
    contentAr: `
      تجنب الأخطاء الشائعة يزيد من أجر الصلاة ويضمن صحتها:
      
      1. **السرعة وعدم الطمأنينة**: الطمأنينة ركن، والسرعة الزائدة قد تبطل الصلاة.
      2. **مسابقة الإمام**: يجب متابعة الإمام وعدم التحرك قبله أو معه.
      3. **الالتفات بالبصر**: السنة النظر إلى موضع السجود وعدم الالتفات يميناً أو يساراً.
      4. **عدم التمكين في السجود**: يجب السجود على الأعضاء السبعة كاملة.
      5. **كفت الثياب أو الشعر**: نهى النبي ﷺ عن كفت (ضم) الثياب أو الشعر في الصلاة.
    `
  }
];
