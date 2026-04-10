// --- Sekme (Tab) Mantığı ---
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Aktif sınıfları temizle
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        // Yenisini ekle
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// --- 1. Dünya Saati ve Konum ---
let userTimezone = null;
const timeDisplay = document.getElementById('current-time');
const dateDisplay = document.getElementById('current-date');
const locationStatus = document.getElementById('location-status');
const dnIndicator = document.getElementById('dn-indicator');

// Konum İzni İsteme ve Ayarlama
function initLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // İzin verildi, sistemin yerel saatini kullanıyoruz.
                userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                locationStatus.innerText = `Konum: ${userTimezone.split('/')[1].replace('_', ' ')}`;
            },
            (error) => {
                // İzin reddedildi veya hata oluştu -> Varsayılan İstanbul
                userTimezone = "Europe/Istanbul";
                locationStatus.innerText = "Konum reddedildi. Varsayılan: İstanbul";
            }
        );
    } else {
        userTimezone = "Europe/Istanbul";
    }
}

function updateWorldClock() {
    if (!userTimezone) return;

    const now = new Date();
    const optionsTime = { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const optionsDate = { timeZone: userTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    const timeString = new Intl.DateTimeFormat('tr-TR', optionsTime).format(now);
    const dateString = new Intl.DateTimeFormat('tr-TR', optionsDate).format(now);
    
    timeDisplay.innerText = timeString;
    dateDisplay.innerText = dateString;

    // Gece/Gündüz Göstergesi (Sabah 6 ile Akşam 18 arası gündüz kabul edildi)
    const hour = parseInt(timeString.split(':')[0]);
    if (hour >= 6 && hour < 18) {
        dnIndicator.innerHTML = '<i class="fa-solid fa-sun"></i>';
        dnIndicator.style.color = "#ffd700"; // Sarı güneş
    } else {
        dnIndicator.innerHTML = '<i class="fa-solid fa-moon"></i>';
        dnIndicator.style.color = "#00f0ff"; // Mavi ay
    }
}

setInterval(updateWorldClock, 1000);
initLocation();

// --- 2. Özel Şık Alarm ---
let alarmHour = 7;
let alarmMinute = 30;
let alarmSet = false;

const hourEl = document.getElementById('alarm-hour');
const minuteEl = document.getElementById('alarm-minute');
const statusText = document.getElementById('active-alarm-text');

function adjustTime(type, amount) {
    if (type === 'hour') {
        alarmHour = (alarmHour + amount + 24) % 24;
        hourEl.innerText = alarmHour.toString().padStart(2, '0');
        animateElement(hourEl);
    } else {
        alarmMinute = (alarmMinute + amount + 60) % 60;
        minuteEl.innerText = alarmMinute.toString().padStart(2, '0');
        animateElement(minuteEl);
    }
}

function animateElement(el) {
    el.classList.remove('pop-animation');
    void el.offsetWidth; // Reflow tetikle (animasyonu yeniden başlatmak için)
    el.classList.add('pop-animation');
}

document.getElementById('set-alarm-btn').addEventListener('click', () => {
    alarmSet = true;
    const hText = alarmHour.toString().padStart(2, '0');
    const mText = alarmMinute.toString().padStart(2, '0');
    statusText.innerText = `Alarm ${hText}:${mText} için kuruldu.`;
});

// Alarm Kontrol Döngüsü
setInterval(() => {
    if (!alarmSet || !userTimezone) return;
    const now = new Date();
    const optionsTime = { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', hour12: false };
    const currentTime = new Intl.DateTimeFormat('tr-TR', optionsTime).format(now);
    
    const alarmTimeStr = `${alarmHour.toString().padStart(2,'0')}:${alarmMinute.toString().padStart(2,'0')}`;
    
    if (currentTime === alarmTimeStr && now.getSeconds() === 0) {
        alert(`⏰ ALARM VAKTİ! Saat: ${alarmTimeStr}`);
        alarmSet = false;
        statusText.innerText = "";
    }
}, 1000);


// --- 3. Kronometre ---
let swStartTime;
let swInterval;
let swRunning = false;
let swElapsedTime = 0;
const swDisplay = document.getElementById('stopwatch-display');
const swStartBtn = document.getElementById('sw-start');

function updateStopwatch() {
    const now = Date.now();
    const diff = now - swStartTime + swElapsedTime;
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const ms = Math.floor((diff % 1000) / 10);
    
    swDisplay.innerText = 
        `${h > 0 ? h.toString().padStart(2,'0') + ':' : ''}` +
        `${m.toString().padStart(2,'0')}:` +
        `${s.toString().padStart(2,'0')}.` +
        `${ms.toString().padStart(2,'0')}`;
}

swStartBtn.addEventListener('click', () => {
    if (!swRunning) {
        swStartTime = Date.now();
        swInterval = setInterval(updateStopwatch, 10);
        swStartBtn.innerText = "Durdur";
        swRunning = true;
    } else {
        clearInterval(swInterval);
        swElapsedTime += Date.now() - swStartTime;
        swStartBtn.innerText = "Devam Et";
        swRunning = false;
    }
});

document.getElementById('sw-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swRunning = false;
    swElapsedTime = 0;
    swDisplay.innerText = "00:00:00.00";
    swStartBtn.innerText = "Başlat";
});

// --- 4. Zamanlayıcı (Timer) ---
let timerInterval;
let timerSeconds = 0;
const timerSetup = document.getElementById('timer-setup');
const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');

function updateTimerDisplay() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    timerDisplay.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

timerStartBtn.addEventListener('click', () => {
    if (timerStartBtn.innerText === "Başlat") {
        const mInput = parseInt(document.getElementById('timer-m').value) || 0;
        const sInput = parseInt(document.getElementById('timer-s').value) || 0;
        timerSeconds = (mInput * 60) + sInput;
        
        if (timerSeconds <= 0) return;

        timerSetup.classList.add('hidden');
        timerDisplay.classList.remove('hidden');
        updateTimerDisplay();
        
        timerStartBtn.innerText = "Durdur";
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                alert("Zaman doldu!");
                resetTimer();
            }
        }, 1000);
    } else {
        clearInterval(timerInterval);
        timerStartBtn.innerText = "Başlat";
    }
});

function resetTimer() {
    clearInterval(timerInterval);
    timerSetup.classList.remove('hidden');
    timerDisplay.classList.add('hidden');
    timerStartBtn.innerText = "Başlat";
    document.getElementById('timer-m').value = '';
    document.getElementById('timer-s').value = '';
}

document.getElementById('timer-reset').addEventListener('click', resetTimer);
