import json
import os
import requests
import re
import time
import sys
from bs4 import BeautifulSoup
import urllib3

# Disable SSL warnings as per user's script
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
    # Unify Taa Marbouta to Haa
    w = re.sub(r'ة', 'ه', w)
    # Remove Tatweel
    w = re.sub(r'ـ', '', w)
    # Remove zero-width spaces
    w = re.sub(r'[\u200B-\u200D\uFEFF]', '', w)
    return w.strip()

def fetch_meaning_from_kalimmat(word):
    clean = normalize_word(word)
    path = f"معنى-كلمة/{clean}"
    url = f"https://kalimmat.com/{path}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}
    
    try:
        response = requests.get(url, headers=headers, verify=False, timeout=10)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        
        # Extract meaning from kalimmat
        soup = BeautifulSoup(response.content, "html.parser")
        meaning_div = soup.find("div", class_=re.compile(r"meaning|definition|word-meaning", re.I))
        
        if not meaning_div:
            # Try a broader search for word-related content
            meaning_div = soup.find("div", class_="wordlist")
            
        if meaning_div:
            meaning_text = meaning_div.get_text(separator=" ", strip=True)
            # Clean up the text
            meaning_text = meaning_text.replace('&quot;', '"').replace('&nbsp;', ' ').replace('\xa0', ' ').strip()
            
            if meaning_text and meaning_text not in ["غير متوفر", "لا يوجد"]:
                return {
                    "word": word,
                    "meaning": meaning_text,
                    "source": "kalimmat"
                }
    except Exception as e:
        print(f"\nError fetching meaning for {word}: {e}")
    return None

def fetch_words_starting_with(letter_key):
    # Using the user's exact URL structure
    url = f"https://kalimmat.com/starts-with/{letter_key}/1/1/2/"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}
    
    try:
        response = requests.get(url, headers=headers, verify=False, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        
        word_divs = soup.find_all("div", class_="wordlist")
        words = []
        for div in word_divs:
            text = div.get_text().strip()
            # Clean individual word entries
            cleaned = text.replace(',', '').replace('.', '').replace('،', '').strip()
            if cleaned:
                # Sometimes kalimmat has multiple words in one div
                words.extend([w.strip() for w in cleaned.split() if w.strip()])
        return words
    except Exception as e:
        print(f"\nError fetching word list for {letter_key}: {e}")
        return []

def main():
    output_path = os.path.join(os.path.dirname(__file__), 'mujam.json')
    
    letters = ["alf", "hlf", "aaa", "eee", "hmz", "baa", "taa", "tah", "tha", "jim", "7aa", "kha", "dal", "thl", "raa",
               "zen", "sin", "shn", "sad", "dad", "6aa", "zaa", "3in", "ghn", "faa", "gaf", "kaf", "lam", "mim", "non",
               "haa", "waw", "waa", "yaa", "yea", "aae"]

    # Load existing mujam data
    mujam_data = {}
    if os.path.exists(output_path):
        with open(output_path, 'r', encoding='utf-8') as f:
            try:
                mujam_data = json.load(f)
            except Exception as e:
                print(f"Error loading existing data: {e}")
                mujam_data = {}

    existing_normalized_keys = {normalize_word(k) for k in mujam_data.keys()}
    print(f"Loaded {len(mujam_data)} existing entries.")

    newly_added_count = 0
    
    try:
        for letter in letters:
            print(f"\n--- Processing letter: {letter} ---")
            words = fetch_words_starting_with(letter)
            # Remove duplicates and already existing words
            words_to_fetch = []
            for w in words:
                if normalize_word(w) not in existing_normalized_keys:
                    words_to_fetch.append(w)
            
            print(f"Found {len(words)} total words, {len(words_to_fetch)} new words to fetch.")
            
            for word in words_to_fetch:
                norm = normalize_word(word)
                if norm in existing_normalized_keys:
                    continue
                
                print(f"Fetching: {word}...", end=" ", flush=True)
                result = fetch_meaning_from_kalimmat(word)
                
                if result:
                    print("Found!")
                    mujam_data[norm] = result
                    existing_normalized_keys.add(norm)
                    newly_added_count += 1
                    
                    # Save periodically
                    if newly_added_count % 10 == 0:
                        with open(output_path, 'w', encoding='utf-8') as f:
                            json.dump(mujam_data, f, ensure_ascii=False, indent=4)
                        print(f"--- Saved progress ({len(mujam_data)} total) ---")
                else:
                    print("No meaning.")
                
                time.sleep(0.3) # Faster delay but still polite
                
    except KeyboardInterrupt:
        print("\nInterrupted by user. Saving progress...")
        
    # Final save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(mujam_data, f, ensure_ascii=False, indent=4)
    
    print(f"\nDone! Added {newly_added_count} new words. Total entries: {len(mujam_data)}")

if __name__ == "__main__":
    main()
