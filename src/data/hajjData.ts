export interface HajjStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  dua: string;
  duaEn: string;
  type: "hajj" | "umrah" | "both";
  order: number;
}

export const hajjSteps: HajjStep[] = [
  {
    id: "ihram",
    title: "الإحرام",
    titleEn: "Ihram",
    description: "الإحرام هو نية الدخول في النسك، وهو أول أركان الحج والعمرة. يبدأ بالاغتسال وتطييب البدن (وليس ملابس الإحرام)، ثم لبس ملابس الإحرام: للرجل إزار ورداء أبيضين نظيفين غير مخيطين، وللمرأة ملابس ساترة فضفاضة لا زينة فيها. يسن صلاة ركعتين قبل الإحرام، ثم التلبية عند الميقات المخصص لبلدك. بمجرد الإحرام، يحرم على المحرم قص الشعر أو الأظافر، والتطيب، وتغطية الرأس للرجل، ولبس المخيط للرجل، والصيد، والجماع ومقدماته.",
    descriptionEn: "Ihram is the intention to enter the state of pilgrimage, and it is the first pillar of Hajj and Umrah. It begins with bathing and perfuming the body (not the Ihram clothes), then wearing the Ihram clothing: for men, two clean, white, unstitched pieces (Izār and Ridā'), and for women, modest, loose clothing without adornment. It is Sunnah to pray two rak'ahs before Ihram, then recite the Talbiyah at the designated Meeqat for your country. Once in Ihram, it is forbidden to cut hair or nails, use perfume, cover the head for men, wear stitched clothing for men, hunt, or engage in marital relations.",
    dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",
    duaEn: "Labbayk Allahumma Labbayk, Labbayka la sharika laka Labbayk, Innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    type: "both",
    order: 1
  },
  {
    id: "tawaf-umrah",
    title: "طواف العمرة / القدوم",
    titleEn: "Umrah / Arrival Tawaf",
    description: "الطواف هو الدوران حول الكعبة المشرفة سبعة أشواط. يبدأ كل شوط من محاذاة الحجر الأسود وينتهي عنده، مع جعل الكعبة عن اليسار. يسن للرجل في طواف القدوم 'الاضطباع' (كشف الكتف الأيمن) و'الرمل' (الإسراع في المشي مع تقارب الخطى) في الأشواط الثلاثة الأولى. يجب الطهارة من الحدثين الأكبر والأصغر. يسن استلام الحجر الأسود وتقبيله إن أمكن، أو الإشارة إليه مع التكبير. بعد الانتهاء، يسن صلاة ركعتين خلف مقام إبراهيم إن تيسر.",
    descriptionEn: "Tawaf is circumambulating the Holy Kaaba seven times. Each round starts and ends at the Black Stone, keeping the Kaaba on the left. For men in the Arrival Tawaf, it is Sunnah to perform 'Idtiba' (uncovering the right shoulder) and 'Raml' (walking quickly with short steps) in the first three rounds. Purity (Wudu) is mandatory. It is Sunnah to touch and kiss the Black Stone if possible, or point to it while saying 'Allahu Akbar'. After finishing, it is Sunnah to pray two rak'ahs behind the Station of Ibrahim if feasible.",
    dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    duaEn: "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and save us from the punishment of the Fire",
    type: "both",
    order: 2
  },
  {
    id: "sai-umrah",
    title: "السعي",
    titleEn: "Sa'i",
    description: "السعي هو المشي بين جبلي الصفا والمروة سبعة أشواط. يبدأ الشوط الأول من الصفا وينتهي في المروة، والعودة من المروة إلى الصفا تعتبر شوطاً ثانياً، وهكذا حتى ينتهي الشوط السابع في المروة. يسن الرقي على الصفا والمروة واستقبال القبلة والدعاء. يسن للرجال فقط 'الهرولة' (الجري الخفيف) بين العلمين الأخضرين. لا تشترط الطهارة للسعي لكنها مستحبة. السعي ركن في الحج والعمرة.",
    descriptionEn: "Sa'i is walking between the hills of Safa and Marwa seven times. The first round starts from Safa and ends at Marwa, and returning from Marwa to Safa is the second round, and so on until the seventh round ends at Marwa. It is Sunnah to climb Safa and Marwa, face the Qibla, and supplicate. It is Sunnah for men only to 'Harwala' (jog) between the two green lights. Purity is not mandatory for Sa'i but is recommended. Sa'i is a pillar in both Hajj and Umrah.",
    dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا",
    duaEn: "Indeed, Safa and Marwa are among the symbols of Allah. So whoever makes Hajj to the House or performs Umrah - there is no blame upon him for walking between them.",
    type: "both",
    order: 3
  },
  {
    id: "halq-umrah",
    title: "الحلق أو التقصير",
    titleEn: "Shaving or Cutting Hair",
    description: "بعد الانتهاء من السعي، يجب على الرجل حلق شعر رأسه بالكامل أو تقصيره من جميع جوانبه، والحلق أفضل لقول النبي ﷺ: 'اللهم اغفر للمحلقين'. أما المرأة فتقصر من أطراف شعرها قدر أنملة (حوالي 2 سم). بهذا العمل يتحلل المعتمر تحللاً كاملاً من عمرته، ويباح له ما كان محظوراً عليه بالإحرام. في حج التمتع، يفضل التقصير في العمرة ليبقى شعر للحلق في الحج.",
    descriptionEn: "After finishing Sa'i, men must either shave their entire head or shorten their hair from all sides; shaving is better as the Prophet (SAW) said: 'O Allah, forgive those who shave their heads.' Women shorten their hair by a fingertip's length (about 2 cm). With this act, the pilgrim completely exits the state of Ihram for Umrah, and what was forbidden becomes permissible. In Tamattu' Hajj, it's better to shorten hair for Umrah to leave hair for shaving during Hajj.",
    dua: "اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ، اللَّهُمَّ اغْفِرْ لِلْمُقَصِّرِينَ",
    duaEn: "O Allah, forgive those who shave their heads. O Allah, forgive those who cut their hair.",
    type: "both",
    order: 4
  },
  {
    id: "tarwiyah",
    title: "يوم التروية (8 ذو الحجة)",
    titleEn: "Day of Tarwiyah (8th Dhul-Hijjah)",
    description: "في ضحى يوم الثامن من ذي الحجة، يحرم الحاج المتمتع من مكانه بمكة، ثم يتوجه الحجاج جميعاً إلى منى. يسن المبيت في منى هذا اليوم وصلاة الظهر والعصر والمغرب والعشاء والفجر في أوقاتها مع قصر الصلاة الرباعية (ركعتين) دون جمع. سمي بيوم التروية لأن الناس كانوا يتروون فيه من الماء ويسقون إبلهم استعداداً للوقوف بعرفة. هذا اليوم سنة مؤكدة وليس ركناً.",
    descriptionEn: "On the morning of the 8th of Dhul-Hijjah, the Tamattu' pilgrim enters Ihram from their place in Makkah, then all pilgrims head to Mina. It is Sunnah to stay overnight in Mina and pray Dhuhr, Asr, Maghrib, Isha, and Fajr at their times, shortening the four-rak'ah prayers to two without combining them. It is called the Day of Tarwiyah because people used to provide themselves and their camels with water in preparation for standing at Arafat. This day is a confirmed Sunnah, not a pillar.",
    dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ",
    duaEn: "Labbayk Allahumma Labbayk, Labbayka la sharika laka Labbayk",
    type: "hajj",
    order: 5
  },
  {
    id: "arafat",
    title: "الوقوف بعرفة (9 ذو الحجة)",
    titleEn: "Standing at Arafat (9th Dhul-Hijjah)",
    description: "الوقوف بعرفة هو الركن الأعظم للحج، لقوله ﷺ: 'الحج عرفة'. يتوجه الحجاج إليها بعد شروق شمس التاسع. يسن صلاة الظهر والعصر جمع تقديم وقصراً في وقت الظهر. يجب البقاء في عرفة حتى غروب الشمس. يستحب الإكثار من الدعاء والذكر والتلبية والاستغفار، فهو يوم يباهي الله فيه ملائكته بأهل عرفات ويغفر لهم. يمتد وقت الوقوف من زوال شمس يوم التاسع إلى فجر يوم النحر.",
    descriptionEn: "Standing at Arafat is the greatest pillar of Hajj, as the Prophet (SAW) said: 'Hajj is Arafat.' Pilgrims head there after sunrise on the 9th. It is Sunnah to pray Dhuhr and Asr combined (at Dhuhr time) and shortened. One must stay in Arafat until sunset. It is recommended to increase supplication, remembrance, Talbiyah, and seeking forgiveness, as it is a day Allah boasts of the people of Arafat to His angels and forgives them. The standing time extends from noon on the 9th until the dawn of the Day of Sacrifice.",
    dua: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    duaEn: "There is none worthy of worship but Allah alone, He has no partner, His is the dominion and His is the praise, and He is Able to do all things",
    type: "hajj",
    order: 6
  },
  {
    id: "muzdelifah",
    title: "المزدلفة (ليلة 10 ذو الحجة)",
    titleEn: "Muzdalifah (Night of 10th Dhul-Hijjah)",
    description: "بعد غروب شمس يوم عرفة، يتوجه الحجاج إلى مزدلفة بسكينة ووقار. عند الوصول، يصلون المغرب والعشاء جمع تأخير وقصراً للعشاء. يجب المبيت بمزدلفة حتى الفجر (أو بعد منتصف الليل للضعفاء والنساء). يسن صلاة الفجر بها ثم الوقوف عند المشعر الحرام والدعاء حتى يسفر جداً. يجمع الحجاج من هنا الحصى لرمي الجمرات (7 حصيات لجمرة العقبة، و63 لبقية الأيام).",
    descriptionEn: "After sunset on the Day of Arafat, pilgrims head to Muzdalifah with tranquility and dignity. Upon arrival, they pray Maghrib and Isha combined (at Isha time) and shortened for Isha. Staying overnight in Muzdalifah until Fajr is mandatory (or after midnight for the weak and women). It is Sunnah to pray Fajr there, then stand at Al-Mash'ar al-Haram and supplicate until it becomes very bright. Pilgrims collect pebbles from here for stoning (7 for Jamrat al-Aqabah, and 63 for the remaining days).",
    dua: "فَإِذَا أَفَضْتُم مِّنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ عِندَ الْمَشْعَرِ الْحَرَامِ",
    duaEn: "When you depart from Arafat, remember Allah at al-Mash'ar al-Haram.",
    type: "hajj",
    order: 7
  },
  {
    id: "jamarat-aqabah",
    title: "رمي جمرة العقبة (10 ذو الحجة)",
    titleEn: "Stoning Jamrat al-Aqabah (10th Dhul-Hijjah)",
    description: "بعد صلاة الفجر في مزدلفة، يتوجه الحجاج إلى منى لرمي جمرة العقبة الكبرى (وهي الأقرب لمكة) بسبع حصيات متعاقبات، يرفع يده مع كل حصاة قائلاً: 'الله أكبر'. ينقطع التلبية مع أول حصاة. يرمي الحاج من بعد شروق الشمس، ويمتد الوقت إلى الغروب. هذا العمل يرمز لرجم الشيطان ومخالفته. بعد الرمي، يشرع الحاج في النحر ثم الحلق أو التقصير ليتحلل التحلل الأول.",
    descriptionEn: "After Fajr prayer in Muzdalifah, pilgrims head to Mina to stone the largest pillar (Jamrat al-Aqabah, the closest to Makkah) with seven consecutive pebbles, raising the hand with each and saying 'Allahu Akbar'. Talbiyah stops with the first pebble. Stoning starts after sunrise and extends until sunset. This act symbolizes stoning the devil and defying him. After stoning, the pilgrim proceeds to sacrifice, then shaving or shortening hair to achieve the first exit from Ihram.",
    dua: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ",
    duaEn: "Allah is the Greatest, Allah is the Greatest, Allah is the Greatest",
    type: "hajj",
    order: 8
  },
  {
    id: "hady",
    title: "النحر (الهدي)",
    titleEn: "Sacrifice (Hady)",
    description: "بعد رمي جمرة العقبة، يقوم الحاج المتمتع والقارن بذبح الهدي (شاة أو سبع بقرة أو سبع بدنة) شكراً لله على نعمة الحج. يسن أن يأكل منها ويهدي ويتصدق. أما الحاج المفرد فلا يجب عليه هدي بل يستحب. في الوقت الحالي، يتم ذلك غالباً عبر شراء سندات الهدي من الجهات المعتمدة التي تتولى الذبح والتوزيع على المستحقين في أنحاء العالم الإسلامي.",
    descriptionEn: "After stoning Jamrat al-Aqabah, the Tamattu' and Qiran pilgrims sacrifice the Hady (a sheep, or a seventh of a cow or camel) as gratitude to Allah for the blessing of Hajj. It is Sunnah to eat from it, give some as gifts, and give some as charity. The Mufrid pilgrim is not required to sacrifice but it is recommended. Currently, this is often done by purchasing sacrifice vouchers from authorized agencies that handle the slaughter and distribution to the needy worldwide.",
    dua: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ هَذَا مِنْكَ وَلَكَ",
    duaEn: "In the name of Allah, and Allah is the Greatest. O Allah, this is from You and for You.",
    type: "hajj",
    order: 9
  },
  {
    id: "ifadah",
    title: "طواف الإفاضة",
    titleEn: "Tawaf al-Ifadah",
    description: "طواف الإفاضة هو ركن من أركان الحج لا يصح الحج بدونه. يتوجه الحاج إلى مكة ليطوف بالبيت سبعة أشواط. وقته يبدأ من فجر يوم النحر، والأفضل أداؤه في ذلك اليوم. بعد الطواف، يسعى الحاج بين الصفا والمروة إذا كان متمتعاً، أو إذا كان قارناً أو مفرداً ولم يسعَ مع طواف القدوم. بعد طواف الإفاضة والسعي، يتحلل الحاج التحلل الأكبر (يحل له كل شيء حتى النساء).",
    descriptionEn: "Tawaf al-Ifadah is a pillar of Hajj without which Hajj is invalid. The pilgrim heads to Makkah to circumambulate the House seven times. Its time starts from the dawn of the Day of Sacrifice, and it is best performed on that day. After Tawaf, the pilgrim performs Sa'i between Safa and Marwa if they are performing Tamattu', or if they are Qiran/Mufrid and didn't perform Sa'i with the Arrival Tawaf. After Tawaf al-Ifadah and Sa'i, the pilgrim achieves the final exit from Ihram.",
    dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    duaEn: "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and save us from the punishment of the Fire",
    type: "hajj",
    order: 10
  },
  {
    id: "tashreeq",
    title: "أيام التشريق (11، 12، 13 ذو الحجة)",
    titleEn: "Days of Tashreeq (11th, 12th, 13th Dhul-Hijjah)",
    description: "هي الأيام الثلاثة التي تلي يوم النحر. يجب فيها المبيت بمنى، ورمي الجمرات الثلاث (الصغرى ثم الوسطى ثم الكبرى) كل يوم بعد زوال الشمس (وقت الظهر). يرمي كل جمرة بسبع حصيات مع التكبير. يسن الوقوف والدعاء بعد الجمرة الصغرى والوسطى، ولا يقف بعد الكبرى. يجوز للمتعجل مغادرة منى في اليوم الثاني عشر قبل الغروب، ومن تأخر لليوم الثالث عشر فهو أفضل وأعظم أجراً.",
    descriptionEn: "These are the three days following the Day of Sacrifice. Staying overnight in Mina is mandatory, as is stoning the three pillars (Small, then Middle, then Large) each day after noon (Dhuhr time). Each pillar is stoned with seven pebbles while saying 'Allahu Akbar'. It is Sunnah to stand and supplicate after the Small and Middle pillars, but not after the Large one. Those in a hurry may leave Mina on the 12th before sunset, but staying until the 13th is better and carries a greater reward.",
    dua: "وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ مَّعْدُودَاتٍ",
    duaEn: "And remember Allah during the numbered days.",
    type: "hajj",
    order: 11
  },
  {
    id: "wada",
    title: "طواف الوداع",
    titleEn: "Farewell Tawaf (Wada')",
    description: "طواف الوداع هو آخر ما يفعله الحاج قبل مغادرة مكة المكرمة مباشرة، ليكون آخر عهده بالبيت الطواف، لقوله ﷺ: 'لا ينفرن أحد حتى يكون آخر عهده بالبيت'. وهو واجب على كل حاج إلا الحائض والنفساء فقد خفف الله عنهما. يطوف سبعة أشواط دون رمل أو اضطباع، ثم يصلي ركعتين، ويغادر مكة. لا يسعى بعد هذا الطواف.",
    descriptionEn: "The Farewell Tawaf is the very last act a pilgrim performs before leaving Makkah, so that their last connection with the House is Tawaf, as the Prophet (SAW) said: 'No one should depart until their last act is circumambulating the House.' It is mandatory for every pilgrim except for menstruating women or those in postnatal bleeding, as Allah has excused them. One performs seven rounds without Raml or Idtiba', prays two rak'ahs, and leaves Makkah. No Sa'i is performed after this Tawaf.",
    dua: "اللَّهُمَّ لاَ تَجْعَلْ هَذَا آخِرَ الْعَهْدِ بِبَيْتِكَ الْحَرَامِ",
    duaEn: "O Allah, do not make this the last time I visit Your Sacred House.",
    type: "hajj",
    order: 12
  }
];

export const packingChecklist = [
  { item: "ملابس الإحرام (قطعتين)", itemEn: "Ihram Clothing (2 pieces)", category: "essentials" },
  { item: "جواز السفر وتأشيرة الحج/العمرة", itemEn: "Passport & Hajj/Umrah Visa", category: "essentials" },
  { item: "سجادة صلاة خفيفة للسفر", itemEn: "Light Travel Prayer Mat", category: "essentials" },
  { item: "مصحف جيب وكتيب أدعية", itemEn: "Pocket Quran & Dua Booklet", category: "spiritual" },
  { item: "شاحن متنقل (باور بانك)", itemEn: "Power Bank", category: "electronics" },
  { item: "أدوية أساسية (مسكنات، مضادات)", itemEn: "Basic Medications (Painkillers, etc.)", category: "health" },
  { item: "مظلة شمسية بيضاء", itemEn: "White Sun Umbrella", category: "essentials" },
  { item: "مناديل مبللة غير معطرة", itemEn: "Unscented Wet Wipes", category: "hygiene" },
  { item: "صابون وشامبو غير معطر", itemEn: "Unscented Soap & Shampoo", category: "hygiene" },
  { item: "حقيبة خصر للمتعلقات الشخصية", itemEn: "Waist Bag for Personal Items", category: "essentials" },
  { item: "حذاء مريح للمشي", itemEn: "Comfortable Walking Shoes", category: "essentials" },
  { item: "كمامات طبية", itemEn: "Medical Face Masks", category: "health" },
  { item: "معقم يدين", itemEn: "Hand Sanitizer", category: "health" }
];
