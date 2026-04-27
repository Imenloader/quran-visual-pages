import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

url = "https://kalimmat.com/starts-with/alf/1/1/2/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
}

try:
    print(f"Testing URL: {url}")
    response = requests.get(url, headers=headers, verify=False, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Content Length: {len(response.content)}")
    if response.status_code == 200:
        print("Success!")
        print(response.text[:500])
    else:
        print("Failed.")
        print(response.headers)
except Exception as e:
    print(f"Error: {e}")
