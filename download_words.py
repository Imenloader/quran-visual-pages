import requests
import json
import os
import time

base_url = "https://raw.githubusercontent.com/RN0x/Quran-Data/master/data/json/words/{:03d}.json"
save_dir = "downloaded_words"
os.makedirs(save_dir, exist_ok=True)

for i in range(1, 115):
    url = base_url.format(i)
    try:
        print(f"Downloading Surah {i}...")
        resp = requests.get(url)
        if resp.status_code == 200:
            with open(os.path.join(save_dir, f"{i:03d}.json"), 'w', encoding='utf-8') as f:
                json.dump(resp.json(), f, ensure_ascii=False, indent=4)
        else:
            print(f"Failed to download Surah {i}: {resp.status_code}")
        time.sleep(0.1) # Be nice
    except Exception as e:
        print(f"Error downloading Surah {i}: {e}")

print("Download complete.")
