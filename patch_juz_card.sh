#!/bin/bash
cat << 'DIFF' > juz_card.diff
<<<<<<< SEARCH
import { getQuranPageImageUrl, juzData, surahIndex } from "@/data/quranData";
=======
import { getQuranPageImageUrl, juzData, surahByName } from "@/data/quranData";
>>>>>>> REPLACE
<<<<<<< SEARCH
      const surah = surahIndex.find(si => si.name === s);
=======
      const surah = surahByName.get(s);
>>>>>>> REPLACE
<<<<<<< SEARCH
            {juz.surahs.map(s => i18n.language === "ar" ? s : surahIndex.find(si => si.name === s)?.nameEn || s).join(i18n.language === "ar" ? "، " : ", ")}
=======
            {juz.surahs.map(s => i18n.language === "ar" ? s : surahByName.get(s)?.nameEn || s).join(i18n.language === "ar" ? "، " : ", ")}
>>>>>>> REPLACE
<<<<<<< SEARCH
              {i18n.language === "ar" ? juz.startSurah : surahIndex.find(si => si.name === juz.startSurah)?.nameEn || juz.startSurah}
=======
              {i18n.language === "ar" ? juz.startSurah : surahByName.get(juz.startSurah)?.nameEn || juz.startSurah}
>>>>>>> REPLACE
<<<<<<< SEARCH
                  {i18n.language === "ar" ? s : surahIndex.find(si => si.name === s)?.nameEn || s}
=======
                  {i18n.language === "ar" ? s : surahByName.get(s)?.nameEn || s}
>>>>>>> REPLACE
DIFF
