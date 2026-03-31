import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "hub": {
        "title": "Islamic Hub",
        "subtitle": "Integrated Islamic tools in one place",
        "spiritual": "Spiritual Fortress",
        "planning": "Planning & Progress",
        "location": "Location-Based",
        "knowledge": "Content & Knowledge",
        "qibla": "Qibla Finder",
        "tasbih": "Digital Tasbih",
        "zakat": "Zakat Calculator",
        "namesOfAllah": "Names of Allah",
        "khatma": "Khatma Planner",
        "prayerTracker": "Prayer Tracker",
        "mosqueFinder": "Mosque Finder",
        "halalPlaces": "Halal Places",
        "hijri": "Hijri Calendar",
        "dailyVerse": "Daily Verse",
        "tafsir": "Tafsir",
        "tafsirContent": {
          "title": "Tafsir Al-Muyassar",
          "description": "Choose surah and ayah to view the simplified tafsir.",
          "searchPlaceholder": "Search for an ayah to interpret...",
          "ayahLabel": "Ayah",
          "info": "This section provides a simplified interpretation of the Holy Verses to help you understand the meanings of the words of Allah Almighty.",
          "error": "Sorry, we couldn't fetch the tafsir for this ayah."
        },
        "search": "Search",
        "technical": "Technical Enhancements",
        "offline": {
          "title": "Offline Content",
          "download": "Download All",
          "downloading": "Downloading...",
          "ready": "Ready for Offline",
          "readyDesc": "All pages are downloaded and ready for offline use.",
          "notReadyDesc": "Download all pages to access them without internet connection.",
          "progress": "Progress",
          "pause": "Pause",
          "resume": "Resume"
        },
        "favorites": "Favorites",
        "prayerTimes": "Prayer Times",
        "qiyam": "Qiyam Al-Layl",
        "khatma_external": "Khatma",
        "guide": "User Guide",
        "tajweed": "Tajweed Rules",
        "install": "Install App",
        "readingActivity": {
          "title": "Reading Activity",
          "last7Days": "Last 7 Days",
          "pagesThisWeek": "Pages this week",
          "dailyAverage": "Daily Average",
          "mostReadDay": "Most Read Day",
          "pages": "Pages",
          "read": "Read"
        },
        "verseOfDay": "Verse of the Day",
        "quickRecitations": "Quick Recitations"
      },
      "recitations": {
        "audioLibrary": "Audio Library",
        "favorites": "Favorites",
        "recitersAndSurahs": "Reciters & Surahs",
        "playlists": "Playlists"
      },
      "tasbih": {
        "reset": "Reset Counter",
        "target": "Target",
        "total": "Total Tasbih",
        "confirmReset": "Are you sure you want to reset the counter?"
      },
      "athkar": {
        "title": "Athkar & Supplications",
        "subtitle": "A selection from the purified Prophetic Sunnah, to be a fortress for the Muslim in his day and night",
        "spiritualFortress": "Spiritual Fortress",
        "resetCounters": "Reset Counters",
        "sections": "Sections",
        "remembrances": "Remembrances",
        "searchPlaceholder": "Search in treasures of Athkar...",
        "resultsFound": "Found {{count}} results in {{sections}} sections",
        "noResults": "No results found for \"{{query}}\"",
        "done": "Dhikr Done",
        "source": "Source: Hisn al-Muslim, Sahih al-Bukhari and Muslim, and from the remembrances of the Book and the purified Sunnah of the Prophet",
        "charity": "Ongoing Charity",
        "favorites": "Favorites",
        "copy": "Copy",
        "copied": "Copied",
        "readMore": "Read More",
        "readLess": "Read Less",
        "reference": "Reference",
        "virtue": "Virtue"
      },
      "favorites": {
        "title": "My Favorite",
        "subtitle": "Treasures",
        "description": "Your private collection of blessed Juz, Prophetic Athkar, and fragrant recitations that touch your heart",
        "all": "All",
        "juz": "Juz",
        "athkar": "Athkar",
        "reciters": "Reciters",
        "recitations": "Recitations",
        "totalSaved": "Total Saved",
        "searchPlaceholder": "Search in your favorites...",
        "noResults": "No results found for \"{{query}}\"",
        "emptyTitle": "Your favorites list is empty",
        "emptySubtitle": "Start your spiritual journey and add what pleases your heart from the application's treasures",
        "exploreNow": "Explore Now",
        "remove": "Remove from favorites",
        "reciter": "Reciter",
        "noItemsInSection": "No items in this section yet"
      },
      "common": {
        "back": "Back",
        "close": "Close"
      },
      "search": {
        "placeholder": "Search in Quran (Surah or Ayah)...",
        "recent": "Recent Searches",
        "clearAll": "Clear All",
        "surahMatches": "Surah Matches",
        "ayahMatches": "Ayah Matches",
        "openInQuran": "Open in Quran",
        "noResults": "No results found for \"{{query}}\"",
        "searching": "Searching in the verses of Allah..."
      },
      "hijri": {
        "today": "Today is",
        "info": "The Hijri calendar is based on the lunar cycle, and the actual date may vary by one day depending on the moon sighting.",
        "weekDays": ["S", "M", "T", "W", "T", "F", "S"]
      },
      "nav": {
        "home": "Home",
        "quran": "Quran",
        "prayer": "Prayer",
        "athkar": "Athkar",
        "recitations": "Tilawat",
        "hub": "Hub",
        "settings": "Settings",
        "showMenu": "Show Menu",
        "hideMenu": "Hide Menu"
      },
      "settings": {
        "title": "Customize Experience",
        "subtitle": "Configure your spiritual space for comfort, making your daily routine a journey of peace and beauty",
        "language": {
          "title": "Language",
          "subtitle": "Choose the application interface language"
        },
        "theme": {
          "title": "Visual Appearance",
          "subtitle": "Choose the right theme for your eyes' comfort while reading"
        },
        "fontSize": {
          "title": "Font Size",
          "subtitle": "Control the text size of Athkar and Supplications for easy reading",
          "small": "Small",
          "medium": "Medium",
          "large": "Large",
          "xlarge": "X-Large"
        },
        "themes": {
          "light": "Light",
          "dark": "Dark / Night",
          "sepia": "Warm Sepia"
        }
      },
      "index": {
        "hero": {
          "badge": "Digital Gateway to Light",
          "title": "Mushaf Al-Madinah",
          "subtitle": "Digital Luxury Edition",
          "description": "Immerse yourself in an exceptional reading experience that combines the authenticity of Uthmanic calligraphy with the latest digital display technologies, to be your constant companion in the journey of reflection.",
          "resume": "Resume Reading",
          "start": "Start Reading",
          "lastRead": "Last Read Position",
          "ayah": "Page"
        },
        "stats": {
          "title": "Reading Stats",
          "completed": "Completed Juz",
          "read": "Pages Read",
          "progress": "Khatma Progress"
        },
        "verseOfDay": {
          "title": "Verse of the Day",
          "surah": "Surah",
          "ayah": "Ayah"
        },
        "search": {
          "placeholder": "Search in Juz and Surahs...",
          "noResults": "No results found matching your search..."
        },
        "offline": {
          "title": "Offline Access",
          "ready": "Quran is available offline",
          "readyDesc": "All Quran pages have been successfully downloaded, you can now read without an internet connection.",
          "notReadyDesc": "Download all Quran pages (604 pages) to be able to read at any time without connection.",
          "download": "Download Full Quran",
          "progress": "Progress",
          "pause": "Pause",
          "resume": "Resume",
          "downloading": "Downloading"
        },
        "quickAccess": {
          "prayer": "Prayer Times",
          "recitations": "Recitations",
          "qiyam": "Qiyam Al-Layl",
          "khatma": "Quran Khatma",
          "guide": "User Guide",
          "tajweed": "Tajweed Rules",
          "install": "Install App"
        },
        "quickRecitations": {
          "title": "Quick Recitations",
          "viewAll": "View All"
        },
        "juzSection": {
          "title": "Quran Juz",
          "surahResults": "Surah Results"
        },
        "footer": {
          "title": "The Holy Quran",
          "subtitle": "Electronic Mushaf Al-Madinah - Waqf for Allah"
        }
      }
    }
  },
  ar: {
    translation: {
      "hub": {
        "title": "المركز الإسلامي",
        "subtitle": "أدوات إسلامية متكاملة في مكان واحد",
        "spiritual": "الحصن الروحاني",
        "planning": "التخطيط والتقدم",
        "location": "خدمات الموقع",
        "knowledge": "المحتوى والمعرفة",
        "qibla": "بوصلة القبلة",
        "tasbih": "المسبحة الرقمية",
        "zakat": "حاسبة الزكاة",
        "namesOfAllah": "أسماء الله الحسنى",
        "khatma": "مخطط الختمة",
        "prayerTracker": "متتبع الصلاة",
        "mosqueFinder": "البحث عن مساجد",
        "halalPlaces": "أماكن حلال",
        "hijri": "التقويم الهجري",
        "dailyVerse": "آية اليوم",
        "tafsir": "التفسير الميسر",
        "tafsirContent": {
          "title": "التفسير الميسر",
          "description": "اختر السورة والآية لعرض التفسير الميسر والمختصر.",
          "searchPlaceholder": "ابحث عن آية لتفسيرها...",
          "ayahLabel": "الآية",
          "info": "هذا القسم يوفر تفسيراً مبسطاً للآيات الكريمة لمساعدتك على فهم معاني كلام الله عز وجل.",
          "error": "عذراً، لم نتمكن من جلب التفسير لهذه الآية."
        },
        "search": "محرك البحث",
        "technical": "تحسينات تقنية",
        "offline": {
          "title": "تحميل للمحتوى",
          "download": "تحميل الكل",
          "downloading": "جاري التحميل...",
          "ready": "جاهز للاستخدام أوفلاين",
          "readyDesc": "تم تحميل جميع الصفحات وهي جاهزة للاستخدام بدون إنترنت.",
          "notReadyDesc": "قم بتحميل جميع الصفحات للوصول إليها في أي وقت بدون إنترنت.",
          "progress": "التقدم",
          "pause": "إيقاف مؤقت",
          "resume": "استئناف"
        },
        "favorites": "المفضلة",
        "prayerTimes": "مواقيت الصلاة",
        "qiyam": "قيام الليل",
        "khatma_external": "ختمة",
        "guide": "دليل الاستخدام",
        "tajweed": "أحكام التجويد",
        "install": "تثبيت التطبيق",
        "readingActivity": {
          "title": "نشاط القراءة",
          "last7Days": "آخر ٧ أيام",
          "pagesThisWeek": "صفحة هذا الأسبوع",
          "dailyAverage": "المعدل اليومي",
          "mostReadDay": "أكثر يوم قراءة",
          "pages": "صفحة",
          "read": "قرأت"
        },
        "verseOfDay": "آية اليوم",
        "quickRecitations": "تلاوات سريعة"
      },
      "recitations": {
        "audioLibrary": "مكتبة التلاوات",
        "favorites": "المفضلة",
        "recitersAndSurahs": "القراء والسور",
        "playlists": "قوائم التشغيل"
      },
      "tasbih": {
        "reset": "إعادة ضبط العداد",
        "target": "المستهدف",
        "total": "إجمالي التسبيح",
        "confirmReset": "هل تريد إعادة ضبط العداد؟"
      },
      "athkar": {
        "title": "الأذكار والأدعية",
        "subtitle": "مجموعة مختارة من صحيح السنة النبوية المطهرة، لتكون حصناً للمسلم في يومه وليله",
        "spiritualFortress": "الحصن الروحاني",
        "resetCounters": "إعادة ضبط العدادات",
        "sections": "أقسام",
        "remembrances": "ذكر",
        "searchPlaceholder": "ابحث في كنوز الأذكار...",
        "resultsFound": "تم العثور على {{count}} نتيجة في {{sections}} أقسام",
        "noResults": "لم نجد نتائج للبحث عن \"{{query}}\"",
        "done": "تم الذكر",
        "source": "المصدر: حصن المسلم، صحيح البخاري ومسلم، ومن أذكار الكتاب والسنة النبوية المطهرة",
        "charity": "صدقة جارية",
        "favorites": "المفضلة",
        "copy": "نسخ",
        "copied": "تم النسخ",
        "readMore": "اقرأ المزيد",
        "readLess": "عرض أقل",
        "reference": "المرجع",
        "virtue": "الفضل"
      },
      "favorites": {
        "title": "كنوزي",
        "subtitle": "المفضلة",
        "description": "مجموعتك الخاصة من الأجزاء المباركة، الأذكار النبوية، والتلاوات العطرة التي تلامس قلبك",
        "all": "الكل",
        "juz": "الأجزاء",
        "athkar": "الأذكار",
        "reciters": "القراء",
        "recitations": "التلاوات",
        "totalSaved": "إجمالي المحفوظات",
        "searchPlaceholder": "ابحث في محفوظاتك...",
        "noResults": "لم نجد نتائج للبحث عن \"{{query}}\"",
        "emptyTitle": "سجل مفضلاتك فارغ",
        "emptySubtitle": "ابدأ برحلتك الإيمانية وأضف ما يروق لقلبك من كنوز التطبيق",
        "exploreNow": "استكشف الآن",
        "remove": "إزالة من المفضلة",
        "reciter": "قارئ",
        "noItemsInSection": "لا توجد عناصر في هذا القسم بعد"
      },
      "common": {
        "back": "رجوع",
        "close": "إغلاق"
      },
      "search": {
        "placeholder": "ابحث في القرآن (سورة أو آية)...",
        "recent": "عمليات البحث الأخيرة",
        "clearAll": "مسح الكل",
        "surahMatches": "السور المطابقة",
        "ayahMatches": "الآيات المطابقة",
        "openInQuran": "فتح في المصحف",
        "noResults": "لا توجد نتائج لـ \"{{query}}\"",
        "searching": "جاري البحث في آيات الله..."
      },
      "hijri": {
        "today": "اليوم هو",
        "info": "التقويم الهجري يعتمد على دورة القمر، وقد يختلف التاريخ الفعلي بيوم واحد حسب رؤية الهلال.",
        "weekDays": ["ح", "ن", "ث", "ر", "خ", "ج", "س"]
      },
      "nav": {
        "home": "الرئيسية",
        "quran": "القرآن",
        "prayer": "الصلاة",
        "athkar": "الأذكار",
        "recitations": "تلاوات",
        "hub": "المركز",
        "settings": "الإعدادات",
        "showMenu": "إظهار القائمة",
        "hideMenu": "إخفاء القائمة"
      },
      "settings": {
        "title": "تخصيص التجربة",
        "subtitle": "قم بتهيئة مساحتك الإيمانية بما يتناسب مع راحتك، ليكون وردك اليومي رحلة من السكينة والجمال",
        "language": {
          "title": "اللغة",
          "subtitle": "اختر لغة واجهة التطبيق"
        },
        "theme": {
          "title": "المظهر البصري",
          "subtitle": "اختر الثيم المناسب لراحة عينيك أثناء القراءة"
        },
        "fontSize": {
          "title": "حجم الخط",
          "subtitle": "تحكم في حجم نص الأذكار والأدعية لسهولة القراءة",
          "small": "صغير",
          "medium": "متوسط",
          "large": "كبير",
          "xlarge": "كبير جداً"
        },
        "themes": {
          "light": "فاتح",
          "dark": "داكن / ليلي",
          "sepia": "بني دافئ"
        }
      },
      "index": {
        "hero": {
          "badge": "بوابة النور الرقمية",
          "title": "مصحف المدينة المنورة",
          "subtitle": "الإصدار الرقمي الفاخر",
          "description": "انغمس في تجربة قراءة استثنائية تجمع بين أصالة الخط العثماني وأحدث تقنيات العرض الرقمي، لتكون رفيقك الدائم في رحلة التدبر.",
          "resume": "استئناف التلاوة",
          "start": "ابدأ القراءة",
          "lastRead": "آخر موضع قراءة",
          "ayah": "صفحة"
        },
        "stats": {
          "title": "إحصائيات القراءة",
          "completed": "أجزاء مكتملة",
          "read": "صفحات مقروءة",
          "progress": "تقدم الختمة"
        },
        "verseOfDay": {
          "title": "آية اليوم",
          "surah": "سورة",
          "ayah": "آية"
        },
        "search": {
          "placeholder": "ابحث في الأجزاء والسور...",
          "noResults": "لم نجد نتائج تطابق بحثك..."
        },
        "offline": {
          "title": "الوصول بدون إنترنت",
          "ready": "المصحف متاح أوفلاين",
          "readyDesc": "تم تحميل جميع صفحات المصحف بنجاح، يمكنك الآن القراءة دون الحاجة للاتصال بالإنترنت.",
          "notReadyDesc": "قم بتحميل صفحات المصحف كاملة (٦٠٤ صفحة) لتتمكن من القراءة في أي وقت دون اتصال.",
          "download": "تحميل كامل المصحف",
          "progress": "التقدم",
          "pause": "إيقاف مؤقت",
          "resume": "استئناف",
          "downloading": "جاري التحميل"
        },
        "quickAccess": {
          "prayer": "مواقيت الصلاة",
          "recitations": "تلاوات عطرة",
          "qiyam": "قيام الليل",
          "khatma": "ختمة القرآن",
          "guide": "دليل الاستخدام",
          "tajweed": "أحكام التجويد",
          "install": "تثبيت التطبيق"
        },
        "quickRecitations": {
          "title": "تلاوات سريعة",
          "viewAll": "عرض الكل"
        },
        "juzSection": {
          "title": "أجزاء القرآن الكريم",
          "surahResults": "نتائج السور"
        },
        "footer": {
          "title": "القرآن الكريم",
          "subtitle": "مصحف المدينة المنورة الإلكتروني - وقف لله تعالى"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
