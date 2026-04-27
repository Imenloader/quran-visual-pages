import json
import os
import requests
import re
import time
import sys
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
sys.stdout.reconfigure(encoding='utf-8')

def normalize_word(word):
    if not word: return ""
    w = re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]', '', word)
    w = re.sub(r'[أإآٱ]', 'ا', w)
    w = re.sub(r'[ىي]', 'ي', w)
    w = re.sub(r'ة', 'ه', w)
    w = re.sub(r'ـ', '', w)
    return w.strip()

def fetch_meaning_from_kalimmat(word):
    clean = normalize_word(word)
    url = f"https://kalimmat.com/معنى-كلمة/{clean}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        response = requests.get(url, headers=headers, verify=False, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            meaning_div = soup.find("div", class_=re.compile(r"meaning|definition|wordlist", re.I))
            if meaning_div:
                return meaning_div.get_text(separator=" ", strip=True)
    except: pass
    return None

def fetch_words_starting_with(letter_key):
    # Using the official dictionary URL which might be more lenient
    url = f"https://kalimmat.com/starts-with/{letter_key}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        response = requests.get(url, headers=headers, verify=False, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        return [div.get_text().strip() for div in soup.find_all("div", class_="wordlist")]
    except: return []

def main():
    output_path = os.path.join(os.path.dirname(__file__), 'mujam.json')
    letters = ["alf", "baa", "taa", "tha", "jim", "7aa", "kha", "dal", "thl", "raa", "zen", "sin", "shn", "sad", "dad", "6aa", "zaa", "3in", "ghn", "faa", "gaf", "kaf", "lam", "mim", "non", "haa", "waw", "yaa"]
    
    with open(output_path, 'r', encoding='utf-8') as f:
        mujam_data = json.load(f)

    existing = {normalize_word(k) for k in mujam_data.keys()}
    new_count = 0

    for letter in letters:
        print(f"Processing {letter}...")
        words = fetch_words_starting_with(letter)
        for w in words:
            norm = normalize_word(w)
            if norm not in existing:
                print(f"New word: {w}", end=" ")
                meaning = fetch_meaning_from_kalimmat(w)
                if meaning:
                    print("Found!")
                    mujam_data[norm] = {"word": w, "meaning": meaning, "source": "kalimmat"}
                    existing.add(norm)
                    new_count += 1
                    if new_count % 5 == 0:
                        with open(output_path, 'w', encoding='utf-8') as f:
                            json.dump(mujam_data, f, ensure_ascii=False, indent=4)
                else: print("No meaning.")
                time.sleep(1)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(mujam_data, f, ensure_ascii=False, indent=4)
    print(f"Finished. Added {new_count} words.")

if __name__ == "__main__":
    main()
