import json
import os
import requests
import re
import time
import glob
import sys
import random
import urllib3
from bs4 import BeautifulSoup

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Fix encoding issue for windows consoles printing arabic
sys.stdout.reconfigure(encoding='utf-8')

def normalize_word(word):
    if not word: return ""
    # Remove all Quranic marks, diacritics, and small vowels
    w = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]', '', word)
    # Normalize Alif Wasla and other Alifs
    w = re.sub(r'[أإآٱ]', 'ا', w)
    # Simplify Yaa/Alif Maqsura
    w = re.sub(r'[ىي]', 'ي', w)
    # Remove Tatweel and other noise
    w = re.sub(r'[ـ\u200B-\u200D\uFEFF]', '', w)
    # Keep only basic Arabic letters
    w = re.sub(r'[^\u0621-\u064A\u067E\u0686\u0698\u06AF\u06A9\u0640]', '', w)
    return w.strip()

def strip_prefix(word):
    # Common prefixes to strip for dictionary lookups
    prefixes = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل"]
    for p in prefixes:
        if word.startswith(p) and len(word) > len(p) + 1:
            return word[len(p):]
    return word

def parse_source_file(file_path):
    """Greedy parser to extract EVERY possible row and meaning from HTML/Text sources."""
    local_data = {} # norm -> {word: str, meanings: set, source: str}
    if not os.path.exists(file_path):
        return local_data

    print(f"Parsing local source file: {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        # If it's a View Source format, we need to decode the spans
        if soup.find(id="viewsource") or "start-tag" in content:
            raw_html = soup.get_text()
            soup = BeautifulSoup(raw_html, 'html.parser')
            
        # Find all rows (case insensitive)
        rows = soup.find_all(re.compile(r'^tr$', re.I))
        if not rows:
            rows = soup.find_all(['tr', 'TR'])
            
        rows_parsed = 0
        for row in rows:
            tds = row.find_all(['td', 'TD'])
            if len(tds) >= 3:
                # Ayah # | Word | Meaning
                raw_word = tds[1].get_text(strip=True)
                raw_meaning = tds[2].get_text(strip=True)
                
                # Check if it's a header
                if "الكلمة" in raw_word or "التفسير" in raw_meaning:
                    continue

                if raw_word and raw_meaning and len(raw_word) < 150:
                    rows_parsed += 1
                    norm = normalize_word(raw_word)
                    if not norm: continue
                    
                    if norm not in local_data:
                        local_data[norm] = {
                            "word": raw_word,
                            "meanings": set(),
                            "source": os.path.basename(file_path)
                        }
                    local_data[norm]["meanings"].add(raw_meaning)
                    
                    # Split phrases aggressively
                    parts = re.split(r'\s+', raw_word)
                    if len(parts) > 1:
                        for part in parts:
                            p_norm = normalize_word(part)
                            if p_norm and len(p_norm) > 1:
                                if p_norm not in local_data:
                                    local_data[p_norm] = {
                                        "word": part,
                                        "meanings": set(),
                                        "source": f"extracted_from_{os.path.basename(file_path)}"
                                    }
                                local_data[p_norm]["meanings"].add(f"({raw_word}): {raw_meaning}")

        print(f"Successfully parsed {rows_parsed} rows from {os.path.basename(file_path)}.")
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        
    return local_data

def extract_all_quran_words():
    juz_files = glob.glob("../juz/juz*.ts")
    unique_words = set()
    for file in sorted(juz_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                match = re.search(r'`(.*)`', content, re.DOTALL)
                if match:
                    text = match.group(1)
                    tokens = text.split()
                    for t in tokens:
                        clean_t = re.sub(r'[\(\)\d]', '', t)
                        if clean_t and not clean_t.isdigit():
                            unique_words.add(clean_t)
        except Exception as e:
            print(f"Error reading {file}: {e}")
    return sorted(list(unique_words))

def main():
    mujam_path = 'mujam.json'
    if os.path.exists(mujam_path):
        with open(mujam_path, 'r', encoding='utf-8') as f:
            mujam = json.load(f)
    else:
        mujam = {}

    unique_words = extract_all_quran_words()
    print(f"Total unique raw tokens in Quran: {len(unique_words)}")
    
    source_files = [
        os.path.join(os.path.dirname(__file__), '..', '..', 'source.txt'),
        os.path.join(os.path.dirname(__file__), '..', '..', 'https___quran.mu.edu.sa_words.html#Qwords.htm')
    ]
    
    mega_local = {}
    for sf in source_files:
        file_data = parse_source_file(sf)
        for norm, data in file_data.items():
            if norm not in mega_local:
                mega_local[norm] = data
            else:
                mega_local[norm]["meanings"].update(data["meanings"])
    
    print(f"Combined Local meanings: {len(mega_local)} normalized keys")

    new_found = 0
    updated_count = 0
    
    for w in unique_words:
        norm = normalize_word(w)
        if not norm: continue
        
        # Variations to try: exact, stripped prefix
        match = None
        for attempt in [norm, normalize_word(strip_prefix(w))]:
            if attempt in mega_local:
                match = mega_local[attempt]
                break
        
        if match:
            # Aggregate all unique meanings
            sorted_meanings = sorted(list(match["meanings"]))
            final_meaning = " | ".join(sorted_meanings)
            
            if norm not in mujam:
                mujam[norm] = {
                    "word": match["word"],
                    "meaning": final_meaning,
                    "source": "local_greedy_final"
                }
                new_found += 1
            else:
                # Supplemental update
                current = mujam[norm].get("meaning", "")
                # Only add if it's new information
                if final_meaning not in current and len(final_meaning) > 5:
                    if current:
                        mujam[norm]["meaning"] = f"{current} || {final_meaning}"
                    else:
                        mujam[norm]["meaning"] = final_meaning
                    updated_count += 1

    with open(mujam_path, 'w', encoding='utf-8') as f:
        json.dump(mujam, f, ensure_ascii=False, indent=4)
        
    print(f"Final Report:")
    print(f"- New meanings added: {new_found}")
    print(f"- Existing meanings supplemented: {updated_count}")
    print(f"- Total dictionary size: {len(mujam)} keys")

if __name__ == "__main__":
    main()
