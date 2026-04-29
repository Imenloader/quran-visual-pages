const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export function speakPrayerName(prayerNameEn: string): boolean {
  // التحقق الصارم من توفر الكائن لتجنب مشاكل WebView في الأندرويد
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported or disabled in this environment.");
    return false;
  }

  console.log("Attempting to speak prayer name:", prayerNameEn);

  try {
    // Ensure it's not paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const arabicName = PRAYER_NAMES_AR[prayerNameEn] || prayerNameEn;
    const textAr = `حان الآن موعد أذان صلاة ${arabicName}`;
    const textEn = `Now is the Time for ${prayerNameEn} Prayer`;
    
    const utterance = new SpeechSynthesisUtterance(textAr);
    
    // Configure utterance for Arabic
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // استخدام Optional Chaining وتوفير مصفوفة فارغة كبديل لتجنب أخطاء undefined
    const voices = window.speechSynthesis.getVoices?.() || [];
    const arabicVoice = voices.find(v => v.lang.startsWith("ar"));

    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => console.log("TTS started speaking (Arabic)");
    utterance.onerror = (event) => {
      console.error("TTS error event:", event);
      // Fallback to English if Arabic fails - Wrapped in try/catch for safety
      try {
        const engUtterance = new SpeechSynthesisUtterance(textEn);
        engUtterance.lang = "en-US";
        window.speechSynthesis.speak(engUtterance);
      } catch (e) {
        console.error("Fallback TTS failed", e);
      }
    };
    utterance.onend = () => console.log("TTS finished speaking");

    // Small delay to ensure cancel() has finished processing
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);

    return !!arabicVoice;
  } catch (error) {
    // التقاط أي خطأ غير متوقع لمنع التطبيق من الانهيار
    console.error("Speech synthesis execution failed:", error);
    return false;
  }
}

// Pre-load voices safely
if (typeof window !== "undefined" && window.speechSynthesis) {
  try {
    // Safe calls for early initialization
    window.speechSynthesis.getVoices?.();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices?.();
    }
  } catch (error) {
    console.warn("Failed to initialize voices early:", error);
  }
}
