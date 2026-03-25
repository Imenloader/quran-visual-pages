export function speakPrayerName(prayerNameEn: string): boolean {
  if (!("speechSynthesis" in window)) {
    console.error("Speech synthesis not supported in this browser.");
    return false;
  }

  console.log("Attempting to speak in English:", prayerNameEn);

  // Ensure it's not paused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const text = `Now is the Time for ${prayerNameEn} Prayer`;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure utterance for English
  utterance.lang = "en-US";
  utterance.rate = 0.9; // Normal pace for English
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a specific English voice if available
  const voices = window.speechSynthesis.getVoices();
  console.log("Available voices:", voices.length);
  
  const englishVoice = voices.find(v => 
    v.lang.toLowerCase().startsWith("en") || 
    v.name.toLowerCase().includes("english")
  );

  if (englishVoice) {
    console.log("Using English voice:", englishVoice.name, "(", englishVoice.lang, ")");
    utterance.voice = englishVoice;
    utterance.lang = englishVoice.lang;
  } else {
    console.warn("No English voice found on this device. Using default.");
    utterance.lang = "en-US";
  }

  utterance.onstart = () => console.log("TTS started speaking (English)");
  utterance.onerror = (event) => console.error("TTS error event:", event);
  utterance.onend = () => console.log("TTS finished speaking (English)");

  // Small delay to ensure cancel() has finished processing
  setTimeout(() => {
    console.log("Calling speak()");
    window.speechSynthesis.speak(utterance);
  }, 150);

  return !!englishVoice;
}

// Pre-load voices
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
