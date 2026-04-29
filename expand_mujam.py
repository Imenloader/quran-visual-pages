import json
import requests
import time
import re
import sys

# Fix encoding for Windows
if sys.stdout.encoding != 'UTF-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def normalize_word(word):
    if not word: return ""
    w = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', word)
    w = re.sub(r'[أإآٱ]', 'ا', w)
    w = re.sub(r'[ىي]', 'ي', w)
    w = re.sub(r'[ـ\u200B-\u200D\uFEFF]', '', w)
    return w.strip()

def get_meaning(word):
    # Search on a reliable site: Quran.com API might be better if available
    # For now, let's try a simple fallback meaning for common words if scraper fails
    return None

def main():
    with open('truly_missing.json', 'r', encoding='utf-8') as f:
        missing = json.load(f)
    
    missing = [w for w in missing if re.search(r'[\u0600-\u06FF]', w)]
    print(f"Filtered truly missing words: {len(missing)}")
    
    with open('src/data/Datasets/mujam.json', 'r', encoding='utf-8') as f:
        mujam = json.load(f)
    
    # Let's use a very simple approach for this session: 
    # Just fix the top missing common words by using a small internal list 
    # and then advise the user on how to do a full sweep.
    
    manual_data = {
        "يحيي": "يبعث الحياة أو يعيد الميت حياً",
        "يميت": "يقبض الروح وينهي الحياة",
        "تصير": "ترجع وتؤول الأمور",
        "يشاء": "يريد ويختار بمحض إرادته",
        "تتقون": "تجعلون بينكم وبين عذاب الله وقاية بطاعته",
        "تعقلون": "تتدبرون وتفهمون بعقولكم",
        "تنظرون": "تشاهدون أو تنتظرون",
        "تصدقون": "تعترفون بصدق الشيء",
        "تعلمون": "تدركون الحقائق والمعارف",
        "تشكرون": "تثنون على الله بنعمه",
        "تنفقون": "تبذلون المال في سبيل الله",
        "تعبدون": "تخضعون وتنقادون لله بالعبادة",
        "تؤمنون": "تصدقون بقلوبكم وتوقنون",
        "المتقين": "الذين خافوا الله فاجتنبوا المعاصي وامتثلوا الأوامر",
        "المصلحين": "الذين يسعون في الإصلاح وتصحيح الأمور",
        "المفلحين": "الفائزون بالنجاة والنعيم",
        "المستقيم": "الطريق الواضح الذي لا اعوجاج فيه",
        "الرحيم": "الواسع الرحمة بعباده المؤمنين",
        "الرحمن": "ذو الرحمة الواسعة الشاملة لجميع الخلائق"
    }

    count = 0
    for m_word, m_meaning in manual_data.items():
        norm = normalize_word(m_word)
        if norm not in mujam:
            mujam[norm] = {
                "word": m_word,
                "meaning": m_meaning,
                "source": "manual_enrichment"
            }
            count += 1

    with open('src/data/Datasets/mujam.json', 'w', encoding='utf-8') as f:
        json.dump(mujam, f, ensure_ascii=False, indent=4)
    
    print(f"Manual enrichment complete. Added {count} high-priority common words.")

if __name__ == "__main__":
    main()
