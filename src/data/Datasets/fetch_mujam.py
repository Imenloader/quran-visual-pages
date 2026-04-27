import json
import os
import urllib.request
import urllib.parse
import re
import time
import glob
import sys

# Fix encoding issue for windows consoles printing arabic
sys.stdout.reconfigure(encoding='utf-8')

# Robust normalization matching our UI arabicUtils.ts
def normalize_word(word):
    if not word: return ""
    # Strip diacritics
    w = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]', '', word)
    # Unify Alifs
    w = re.sub(r'[أإآٱ]', 'ا', w)
    # Unify Yaa
    w = re.sub(r'[ىي]', 'ي', w)
    # Remove Tatweel
    w = re.sub(r'ـ', '', w)
    # Remove zero-width spaces
    w = re.sub(r'[\u200B-\u200D\uFEFF]', '', w)
    return w.strip()

def fetch_from_kalimmat(word):
    clean = normalize_word(word)
    path = urllib.parse.quote(f"معنى-كلمة/{clean}")
    url = f"https://kalimmat.com/{path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    
    try:
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        
        # Extract meaning from kalimmat
        match = re.search(r'<div[^>]*class=["\'].*?meaning.*?["\'][^>]*>(.*?)</div>', html, re.IGNORECASE | re.DOTALL)
        if match:
            meaning_html = match.group(1)
            meaning_text = re.sub(r'<[^>]+>', '', meaning_html).strip()
            
            # Clean up the text further
            meaning_text = meaning_text.replace('&quot;', '"').replace('&nbsp;', ' ').strip()
            
            if meaning_text and meaning_text != "غير متوفر":
                return {
                    "word": word,
                    "meaning": meaning_text,
                    "source": "kalimmat"
                }
    except Exception as e:
        # 404 means word not found on kalimmat, which is fine
        if hasattr(e, 'code') and e.code == 404:
            return None
        print(f"Error fetching {clean}: {e}")
    return None

def extract_all_quran_words():
    words = set()
    juz_dir = os.path.join(os.path.dirname(__file__), '..', 'juz')
    ts_files = glob.glob(os.path.join(juz_dir, '*.ts'))
    
    for file in ts_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            # Extract all text inside backticks `...`
            matches = re.findall(r'`([^`]+)`', content)
            for m in matches:
                # Remove end-of-ayah numbers and markers
                clean_ayah = re.sub(r'[٠١٢٣٤٥٦٧٨٩]', '', m)
                # Remove other symbols like brackets, parens
                clean_ayah = re.sub(r'[()\[\]{}]', '', clean_ayah)
                for w in clean_ayah.split():
                    w = w.strip()
                    # Skip 'سورة' and 'الفاتحة' headers or empty words
                    if w and len(normalize_word(w)) > 0:
                        words.add(w)
    return words

def main():
    output_path = os.path.join(os.path.dirname(__file__), 'mujam.json')
    
    # Load existing mujam data
    mujam_data = {}
    if os.path.exists(output_path):
        with open(output_path, 'r', encoding='utf-8') as f:
            try:
                mujam_data = json.load(f)
            except:
                pass

    print("Extracting all unique words from Juz files...")
    quran_words = extract_all_quran_words()
    print(f"Total unique raw words in Quran: {len(quran_words)}")
    
    # Filter out words we already have in the dictionary
    existing_normalized_keys = {normalize_word(k) for k in mujam_data.keys()}
    
    words_to_scrape = []
    for w in quran_words:
        norm = normalize_word(w)
        if norm not in existing_normalized_keys:
            words_to_scrape.append(w)
            
    print(f"Words already in dictionary: {len(existing_normalized_keys)}")
    print(f"Words remaining to scrape: {len(words_to_scrape)}")
    
    if len(words_to_scrape) == 0:
        print("Dictionary is complete!")
        return

    print("Starting scraping process. Press Ctrl+C to stop at any time.")
    print("Data will be saved every 10 words.")
    
    count = 0
    try:
        for w in words_to_scrape:
            norm = normalize_word(w)
            # Skip if we fetched it in this session already (since multiple raw words can map to same normalized word)
            if norm in existing_normalized_keys:
                continue
                
            print(f"[{count+1}/{len(words_to_scrape)}] Fetching: {w} ({norm})...", end=" ", flush=True)
            result = fetch_from_kalimmat(w)
            
            if result:
                print("Found!")
                mujam_data[norm] = result
                existing_normalized_keys.add(norm)
            else:
                print("Not found.")
                # We can mark it as not found so we don't retry, but for now we just skip
                pass
                
            count += 1
            
            # Save every 10 fetches to prevent data loss
            if count % 10 == 0:
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(mujam_data, f, ensure_ascii=False, indent=4)
                print(f"--- Saved progress ({len(mujam_data)} total entries) ---")
                
            time.sleep(1.0) # Polite delay to avoid IP ban from kalimmat.com
                
    except KeyboardInterrupt:
        print("\nScraping interrupted by user.")
        
    # Final save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(mujam_data, f, ensure_ascii=False, indent=4)
    print(f"Saved! Total words in dataset: {len(mujam_data)}")

if __name__ == "__main__":
    main()
