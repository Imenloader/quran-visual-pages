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
          "title": "Offline Mode",
          "manageDesc": "Manage offline content and storage",
          "clearConfirm": "Do you want to delete all downloaded files?",
          "clearSuccess": "All files deleted successfully",
          "clearError": "Error deleting files",
          "usedSpace": "Used Space",
          "quran": "Holy Quran",
          "athkar": "Athkar",
          "quranDesc": "Available for offline reading",
          "athkarDesc": "Available for offline reading",
          "clearAll": "Delete All Files",
          "info": "Content is automatically downloaded when you browse it for the first time to be available for you next time without internet connection.",
          "onlineStatus": "Online",
          "offlineStatus": "You are currently offline",
          "downloading": "Preparing... {{progress}}%",
          "downloadAll": "Prepare Quran for offline reading",
          "ready": "Quran is fully ready for offline reading",
          "storageInfo": "Preparing the Quran for offline reading requires approximately 150MB of storage in your browser.",
          "deleteData": "Delete Downloaded Data",
          "pages": "Pages",
          "downloadFailed": "Quran prepared with {{count}} pages failed to download. Please try again later.",
          "connectToStart": "Please connect to the internet to start preparing",
          "download": "Download All",
          "progress": "Progress",
          "pause": "Pause",
          "resume": "Resume",
          "readyDesc": "All pages are downloaded and ready for offline use.",
          "notReadyDesc": "Download all pages to access them without internet connection."
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
        "recitersDesc": "Explore a collection of the most beautiful recitations from around the world"
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
        "all": "All",
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
        "profile": "Profile",
        "showMenu": "Show Menu",
        "hideMenu": "Hide Menu"
      },
      "profile": {
        "title": "My Profile",
        "settings": "Settings",
        "ayahsRead": "Ayahs Read",
        "activeDays": "Active Days",
        "pointsToNext": "Points to Next Level",
        "spiritualProgress": "Spiritual Progress",
        "keepReading": "Keep reading to raise your rank",
        "appSettings": "App Settings",
        "customizeDesc": "Customize appearance, fonts, and alerts",
        "userGuide": "User Guide",
        "learnHow": "Learn how to use the app",
        "level": "Level",
        "points": "Points",
        "editProfile": "Edit Profile",
        "factoryReset": "Factory Reset",
        "saveChanges": "Save Changes",
        "name": "Name",
        "chooseAvatar": "Choose Avatar",
        "advancedStats": "Advanced Stats",
        "joinedDate": "Joined Date",
        "totalPoints": "Total Points",
        "exit": "Exit",
        "controlMenu": "Control Menu",
        "language": "Language",
        "theme": "Theme",
        "fontSize": "Font Size",
        "notifications": "Notifications",
        "account": "Account",
        "appLanguage": "App Language",
        "chooseLanguage": "Choose your preferred language",
        "appTheme": "App Theme",
        "chooseTheme": "Choose a theme that's comfortable for your eyes",
        "adjustFontSize": "Adjust font size for comfortable reading",
        "notifReminders": "Notifications & Reminders",
        "manageReminders": "Manage daily reminder times",
        "notifNotSupported": "Notifications are not supported in your browser",
        "accountManagement": "Account Management",
        "editAccountDesc": "Edit your personal data or reset",
        "athkarMorning": "Morning Athkar",
        "athkarEvening": "Evening Athkar",
        "quranReading": "Quran Reading",
        "successUpdate": "Profile updated successfully",
        "confirmReset": "Are you sure you want to reset all settings?",
        "defaultName": "Honored Guest",
        "testNotification": "Test Adhan Notification",
        "testNotifSent": "Test notification and Adhan sound sent",
        "levels": {
          "1": "Beginner",
          "2": "Diligent",
          "3": "Perseverant",
          "4": "Reader",
          "5": "Reciter",
          "6": "Memorizer",
          "7": "Master",
          "8": "Completer",
          "9": "Quran Ambassador",
          "10": "Light of Guidance"
        }
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
          "page": "Page",
          "ayah": "Ayah"
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
        "juzSection": {
          "title": "Quran Juz",
          "surahResults": "Surah Results"
        },
        "footer": {
          "title": "The Holy Quran",
          "subtitle": "Electronic Mushaf Al-Madinah - Waqf for Allah"
        }
      },
      "player": {
        "nowPlaying": "Now Playing",
        "queue": "Playlist Queue",
        "shuffle": "Shuffle",
        "repeat": "Repeat",
        "previous": "Previous Surah",
        "next": "Next Surah",
        "play": "Play",
        "pause": "Pause",
        "mute": "Mute",
        "unmute": "Unmute",
        "close": "Close Player",
        "stop": "Stop Playback",
        "expand": "Expand Player",
        "collapse": "Collapse Player"
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
          "title": "وضع عدم الاتصال",
          "manageDesc": "إدارة المحتوى والمساحة التخزينية",
          "clearConfirm": "هل تريد حذف جميع الملفات المحملة؟",
          "clearSuccess": "تم حذف جميع الملفات بنجاح",
          "clearError": "حدث خطأ أثناء حذف الملفات",
          "usedSpace": "المساحة المستخدمة",
          "quran": "القرآن الكريم",
          "athkar": "الأذكار",
          "quranDesc": "متاح للقراءة دون اتصال",
          "athkarDesc": "متاحة للقراءة دون اتصال",
          "clearAll": "حذف جميع الملفات",
          "info": "يتم تحميل المحتوى تلقائياً عند تصفحه لأول مرة ليكون متاحاً لك في المرات القادمة دون الحاجة للاتصال بالإنترنت.",
          "onlineStatus": "متصل بالإنترنت",
          "offlineStatus": "أنت الآن في وضع عدم الاتصال",
          "downloading": "جاري التجهيز... {{progress}}%",
          "downloadAll": "تجهيز المصحف للقراءة دون اتصال (Offline)",
          "ready": "المصحف جاهز بالكامل للقراءة دون اتصال",
          "storageInfo": "تجهيز المصحف للقراءة دون اتصال يتطلب مساحة تخزين تقريبية (١٥٠ ميجابايت) في متصفحك.",
          "deleteData": "حذف البيانات المحملة",
          "pages": "صفحة",
          "downloadFailed": "تم تجهيز المصحف مع فشل تحميل {{count}} صفحة. يرجى المحاولة مرة أخرى لاحقاً.",
          "connectToStart": "يرجى الاتصال بالإنترنت لبدء التجهيز",
          "download": "تحميل الكل",
          "progress": "التقدم",
          "pause": "إيقاف مؤقت",
          "resume": "استئناف",
          "readyDesc": "تم تحميل جميع الصفحات وهي جاهزة للاستخدام بدون إنترنت.",
          "notReadyDesc": "قم بتحميل جميع الصفحات للوصول إليها في أي وقت بدون إنترنت."
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
        "recitersDesc": "استكشف مجموعة من أجمل التلاوات من مختلف أنحاء العالم"
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
        "all": "الكل",
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
        "profile": "الملف الشخصي",
        "showMenu": "إظهار القائمة",
        "hideMenu": "إخفاء القائمة"
      },
      "profile": {
        "title": "ملفي الشخصي",
        "settings": "الإعدادات",
        "ayahsRead": "آيات مقروءة",
        "activeDays": "أيام النشاط",
        "pointsToNext": "نقاط للمستوى التالي",
        "spiritualProgress": "التقدم الروحاني",
        "keepReading": "استمر في القراءة لرفع رتبتك",
        "appSettings": "إعدادات التطبيق",
        "customizeDesc": "تخصيص المظهر، الخطوط، والتنبيهات",
        "userGuide": "دليل الاستخدام",
        "learnHow": "تعلم كيفية استخدام التطبيق",
        "level": "المستوى",
        "points": "النقاط",
        "editProfile": "تعديل الملف",
        "factoryReset": "إعادة ضبط المصنع",
        "saveChanges": "حفظ التغييرات",
        "name": "الاسم",
        "chooseAvatar": "اختر الأفاتار",
        "advancedStats": "إحصائيات متقدمة",
        "joinedDate": "تاريخ الانضمام",
        "totalPoints": "إجمالي النقاط",
        "exit": "خروج",
        "controlMenu": "قائمة التحكم",
        "language": "اللغة",
        "theme": "المظهر",
        "fontSize": "حجم الخط",
        "notifications": "التنبيهات",
        "account": "الحساب",
        "appLanguage": "لغة التطبيق",
        "chooseLanguage": "اختر لغتك المفضلة",
        "appTheme": "ثيم التطبيق",
        "chooseTheme": "اختر الثيم المريح لعينيك",
        "adjustFontSize": "ضبط حجم الخط لقراءة مريحة",
        "notifReminders": "التنبيهات والتذكيرات",
        "manageReminders": "إدارة أوقات التذكير اليومية",
        "notifNotSupported": "التنبيهات غير مدعومة في متصفحك",
        "accountManagement": "إدارة الحساب",
        "editAccountDesc": "تعديل بياناتك الشخصية أو إعادة الضبط",
        "athkarMorning": "أذكار الصباح",
        "athkarEvening": "أذكار المساء",
        "quranReading": "ورد القرآن",
        "successUpdate": "تم تحديث الملف بنجاح",
        "confirmReset": "هل أنت متأكد من إعادة ضبط جميع الإعدادات؟",
        "defaultName": "زائر كريم",
        "testNotification": "تجربة تنبيه الأذان",
        "testNotifSent": "تم إرسال تنبيه تجريبي وصوت الأذان",
        "levels": {
          "1": "مبتدئ",
          "2": "مجتهد",
          "3": "مثابر",
          "4": "قارئ",
          "5": "مرتل",
          "6": "حافظ",
          "7": "متقن",
          "8": "خاتم",
          "9": "سفير القرآن",
          "10": "نور الهداية"
        }
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
          "resume": "متابعة القراءة",
          "start": "ابدأ القراءة",
          "lastRead": "آخر موضع قراءة",
          "page": "صفحة",
          "ayah": "آية"
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
        "juzSection": {
          "title": "أجزاء القرآن الكريم",
          "surahResults": "نتائج السور"
        },
        "footer": {
          "title": "القرآن الكريم",
          "subtitle": "مصحف المدينة المنورة الإلكتروني - وقف لله تعالى"
        }
      },
      "player": {
        "nowPlaying": "يتم تشغيله الآن",
        "queue": "قائمة التشغيل",
        "shuffle": "تشغيل عشوائي",
        "repeat": "تكرار",
        "previous": "السورة السابقة",
        "next": "السورة التالية",
        "play": "تشغيل",
        "pause": "إيقاف مؤقت",
        "mute": "كتم الصوت",
        "unmute": "إلغاء كتم الصوت",
        "close": "إغلاق المشغل",
        "stop": "إيقاف التشغيل",
        "expand": "توسيع المشغل",
        "collapse": "طي المشغل"
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
