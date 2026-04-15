const DEFAULT_LAT = 30.0444;
const DEFAULT_LNG = 31.2357;
const DEFAULT_METHOD = 5;

const prayerNames = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
};

async function init() {
    loadDailyVerse();
    updatePrayerTimes();
    setInterval(updateCountdown, 1000);
}

async function updatePrayerTimes() {
    let lat = DEFAULT_LAT;
    let lng = DEFAULT_LNG;
    
    // Try to get location
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
    } catch (e) {
        console.log("Using default location");
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${DEFAULT_METHOD}`);
        const data = await res.json();
        const timings = data.data.timings;
        window.prayerTimings = timings;
        
        displayPrayerList(timings);
        findNextPrayer(timings);
    } catch (e) {
        document.getElementById('next-prayer-name').innerText = "خطأ في الاتصال";
    }
}

function displayPrayerList(timings) {
    const list = document.getElementById('prayer-list');
    list.innerHTML = '';
    
    const relevantPrayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    relevantPrayers.forEach(id => {
        const item = document.createElement('div');
        item.className = 'prayer-item';
        item.innerHTML = `
            <span>${prayerNames[id]}</span>
            <span>${formatTime(timings[id])}</span>
        `;
        list.appendChild(item);
    });
}

function formatTime(time24) {
    const [h, m] = time24.split(':');
    let hours = parseInt(h);
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${period}`;
}

function findNextPrayer(timings) {
    const now = new Date();
    const relevantPrayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    let next = null;
    
    for (const id of relevantPrayers) {
        const [h, m] = timings[id].split(':');
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);
        
        if (pDate > now) {
            next = { id, time: pDate };
            break;
        }
    }
    
    if (!next) {
        // Next is Fajr tomorrow
        const [h, m] = timings.Fajr.split(':');
        const pDate = new Date();
        pDate.setDate(pDate.getDate() + 1);
        pDate.setHours(h, m, 0, 0);
        next = { id: "Fajr", time: pDate };
    }
    
    window.nextPrayer = next;
    document.getElementById('next-prayer-name').innerText = prayerNames[next.id];
    updateCountdown();
}

function updateCountdown() {
    if (!window.nextPrayer) return;
    
    const now = new Date();
    const diff = window.nextPrayer.time - now;
    
    if (diff <= 0) {
        updatePrayerTimes();
        return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown').innerText = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function loadDailyVerse() {
    try {
        // Fetch a random ayan (total verses in Quran is 6236)
        const randomEdition = "ar.alafasy";
        const randomAyah = Math.floor(Math.random() * 6236) + 1;
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.abdulsamad`);
        const data = await res.json();
        
        document.getElementById('verse-text').innerText = data.data.text;
        document.getElementById('verse-info').innerText = `${data.data.surah.name} - آية ${data.data.numberInSurah}`;
    } catch (e) {
        document.getElementById('verse-text').innerText = "تعذر جلب آية، اقرأ ما تيسر من القرآن.";
    }
}

init();
