
const text = "سورة سبأ بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ٱلۡحَمۡدُ لِلَّهِ ٱلَّذِي لَهُۥ مَا فِي ٱلسَّمَٰوَٰتِ وَمَا فِي ٱلۡأَرۡضِ وَلَهُ ٱلۡحَمۡدُ فِي ٱلۡأٓخِرَةِۚ وَهُوَ ٱلۡحَكِيمُ ٱلۡخَبِيرُ (1)";
const surahHeaderRegex = /^\s*سُ?ورَ[ةه]ُ?\s+[^\n(]{1,40}?(?=\s+ب[ِـِّ]*سۡمِ|\s+ب[ِـِّ]*سم|\s*بِسۡمِ|\s*بِّسۡمِ|[\(\[﴿]|$)/u;
const cleaned = text.replace(surahHeaderRegex, "").trim();
console.log("Original:", text);
console.log("Cleaned:", cleaned);

const BASMALAH_REGEX = /^\s*ب[\u0650\u06EA-\u06ED]*س[\u0652\u06EA-\u06ED]*م[\u0650\u06EA-\u06ED]*\s+[\u0671\u0627]ل[\u0651\u06EA-\u06ED]*ل[\u064E\u064F\u0650\u0652\u06EA-\u06ED]*ه[\u0650\u064F\u064E\u0652\u06EA-\u06ED]*\s+ٱ?لر[\u0651\u06EA-\u06ED]*ح[\u0652\u06EA-\u06ED]*م[\u064E\u064F\u0650\u06EA-\u06ED]*ن[\u0650\u064E\u064F\u0652\u0670\u06EA-\u06ED]*\s+ٱ?لر[\u0651\u06EA-\u06ED]*ح[\u0652\u06EA-\u06ED]*ي[\u0650\u064E\u064F\u0652\u06EA-\u06ED]*م[\u0650\u064E\u064F\u0652\u06EA-\u06ED]*\s*/u;
const withoutBasmalah = cleaned.replace(BASMALAH_REGEX, "").trim();
console.log("Without Basmalah:", withoutBasmalah);
