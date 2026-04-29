import json
import re
import os
import sys

# Set encoding for Windows
if sys.stdout.encoding != 'UTF-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

TAG_MAP = {
    "N": "اسم", "PN": "اسم علم", "ADJ": "صفة", "IMPN": "اسم فعل", 
    "PRON": "ضمير", "DEM": "اسم إشارة", "REL": "اسم موصول", "T": "ظرف", 
    "V": "فعل", "P": "حرف", "DET": "أداة تعريف", "NOM": "مرفوع", 
    "ACC": "منصوب", "GEN": "مجرور", "M": "مذكر", "F": "مؤنث", 
    "S": "مفرد", "D": "مثنى", "PL": "جمع", "1": "متكلم", "2": "مخاطب", "3": "غائب",
    "PREF": "سابقة", "SUFF": "لاحقة", "ADDR": "كاف الخطاب", "OBJ": "مفعول به"
}

def normalize_arabic(word):
    if not word: return ""
    w = word.replace('\u0670', 'ا')
    w = re.sub(r'[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]', '', w)
    w = re.sub(r'[أإآٱ]', 'ا', w)
    w = re.sub(r'[ىيئ]', 'ي', w)
    return w.strip()

def parse_morphology():
    backup_path = 'mujam_backup.json'
    existing_mujam = {}
    if os.path.exists(backup_path):
        for enc in ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be']:
            try:
                print(f"Loading backup with {enc}...")
                with open(backup_path, 'r', encoding=enc) as f:
                    existing_mujam = json.load(f)
                print("Successfully loaded backup.")
                break
            except: continue
    
    for encoding in ['utf-8', 'windows-1256']:
        try:
            with open('quran-morphology.txt', 'r', encoding=encoding) as f:
                lines = f.readlines()
            if lines and "1:1:1:1" in lines[0] or "1:1:1:1" in lines[1]:
                break
        except: continue
    else: return

    print(f"Processing {len(lines)} segments...")
    raw_word_map = {}
    for line in lines:
        parts = line.strip().split('\t')
        if len(parts) < 4: continue
        location, raw_word, pos_tag, morph_info = parts[0], parts[1], parts[2], parts[3]
        word_id = ":".join(location.split(':')[:3])
        if word_id not in raw_word_map: raw_word_map[word_id] = []
        raw_word_map[word_id].append({"word": raw_word, "pos": pos_tag, "morph": morph_info})

    final_mujam = {}
    for word_id, segments in raw_word_map.items():
        full_word = "".join([s["word"] for s in segments])
        norm = normalize_arabic(full_word)
        roots, lemmas, nahw_parts = [], [], []
        for s in segments:
            root_match = re.search(r'ROOT:([^|]+)', s["morph"])
            if root_match: roots.append(root_match.group(1))
            lem_match = re.search(r'LEM:([^|]+)', s["morph"])
            if lem_match: lemmas.append(lem_match.group(1))
            nahw_parts.append(TAG_MAP.get(s["pos"], s["pos"]))

        meaning = ""
        existing_entry = existing_mujam.get(norm)
        if isinstance(existing_entry, dict): meaning = existing_entry.get("meaning", "")
        if not meaning:
            for lem in lemmas:
                norm_lem = normalize_arabic(lem)
                lem_entry = existing_mujam.get(norm_lem)
                if isinstance(lem_entry, dict):
                    meaning = lem_entry.get("meaning", "")
                    if meaning: break
        if not meaning: meaning = " + ".join(lemmas) if lemmas else "معنى سياقي"

        final_mujam[norm] = {
            "word": full_word,
            "meaning": meaning,
            "nahw": " + ".join(nahw_parts),
            "root": " ".join(sorted(list(set(roots)))),
            "source": "quran_corpus_v04_final"
        }

    with open('src/data/Datasets/mujam.json', 'w', encoding='utf-8') as f:
        json.dump(final_mujam, f, ensure_ascii=False, indent=4)
    print(f"Done! Keys: {len(final_mujam)}")

if __name__ == "__main__":
    parse_morphology()
