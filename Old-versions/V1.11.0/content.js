// ===========================================================
// 🐺 BÖRÜ PRO V4.5 - MODERN KONTROL MERKEZİ & RADAR (GENİŞ EKRAN)
// ===========================================================

// --- AYARLAR & DEĞİŞKENLER ---
const USERS_URL = "https://raw.githubusercontent.com/CigkofteXL/Boru/main/users.json";
const DEFAULT_SOURCE = "auto";
const DEFAULT_TARGET = "tr";

// Kayıtlı Ayarları Yükle (Yoksa varsayılanları kullan)
let ayarKaynak = localStorage.getItem("boru_sl") || DEFAULT_SOURCE;
let ayarHedef = localStorage.getItem("boru_tl") || DEFAULT_TARGET;
// Radar & Sistem Ayarları
let radarAktif = localStorage.getItem("boru_radar_aktif") !== "false"; 
let radarRenk = localStorage.getItem("boru_radar_renk") || "#00FFFF"; 
let radarEmoji = localStorage.getItem("boru_radar_emoji") || "🐺"; 
let zamanGostericiAktif = localStorage.getItem("boru_zaman_aktif") === "true"; 

// Konum Ayarları
let btnPosX = localStorage.getItem("boru_pos_x") || "";
let btnPosY = localStorage.getItem("boru_pos_y") || "";

// API Ayarları
let apiGemini = localStorage.getItem("boru_api_gemini") || "";
let apiWolvesville = localStorage.getItem("boru_api_wolvesville") || "";

let boruKullanicilari = []; 

const DILLER = {
    "auto": "Otomatik", "tr": "Türkçe 🇹🇷", "en": "English 🇬🇧", "de": "Deutsch 🇩🇪",
    "fr": "Français 🇫🇷", "es": "Español 🇪🇸", "ru": "Russian 🇷🇺", "it": "Italiano 🇮🇹", "pt": "Português 🇵🇹"
};

// --- 1. RADAR SİSTEMİ (LİSTE ÇEKME) ---
async function boruKullanicilariniGetir() {
    try {
        const response = await fetch(`${USERS_URL}?t=${new Date().getTime()}`);
        if (response.ok) {
            boruKullanicilari = await response.json();
            console.log(`🐺 Börü Radar: ${boruKullanicilari.length} dost birim hatta.`);
        }
    } catch (e) {
        console.error("🐺 Radar Hatası: Liste çekilemedi.");
    }
}
boruKullanicilariniGetir();
setInterval(boruKullanicilariniGetir, 300000);

// --- 2. API MOTORU ---
async function googleApiRequest(metin, kaynak, hedef) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${kaynak}&tl=${hedef}&dt=t&q=${encodeURIComponent(metin)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0]) {
            let fullText = "";
            for (let i = 0; i < data[0].length; i++) { if (data[0][i][0]) fullText += data[0][i][0]; }
            return fullText;
        }
        return null;
    } catch { return null; }
}

// --- 3. MODERN ARAYÜZ OLUŞTURUCU (GENİŞLETİLMİŞ) ---
function arayuzuOlustur() {
    if (document.getElementById("boru-panel")) return;

    // --- Stil Tanımları (Modern Glassmorphism & Cyberpunk) ---
    const stil = document.createElement("style");
    stil.id = "boru-dinamik-stil";
    stil.innerHTML = `
        /* Yüzen Tuş */
        #boru-toggle-btn {
            position: fixed; bottom: 90px; right: 20px; z-index: 2147483647;
            width: 50px; height: 50px; background: rgba(10, 10, 20, 0.9); 
            border: 2px solid ${radarRenk}; border-radius: 50%; cursor: pointer; 
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; box-shadow: 0 0 15px ${radarRenk}80; transition: all 0.3s ease; 
            user-select: none; backdrop-filter: blur(5px);
        }
        #boru-toggle-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 0 25px ${radarRenk}; }
        
        /* Modern Panel */
        #boru-panel {
            position: fixed; bottom: 150px; right: 20px; z-index: 2147483647;
            width: 440px; 
            max-height: 65vh; 
            overflow-y: auto;
            background: rgba(15, 15, 25, 0.85); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; 
            padding: 15px; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: none; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        
        /* Scrollbar Ayarı */
        #boru-panel::-webkit-scrollbar { width: 6px; }
        #boru-panel::-webkit-scrollbar-track { background: transparent; }
        #boru-panel::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.3); border-radius: 10px; }

        .boru-title-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed rgba(0, 255, 255, 0.3); padding-bottom: 5px;}
        .boru-title { text-align: center; color: #00FFFF; font-weight: 800; font-size: 15px; text-shadow: 0 0 8px rgba(0,255,255,0.5); letter-spacing: 1px; margin: 0;}
        
        /* Ayarlar İkonu ve Paneli */
        #boru-settings-icon { cursor: pointer; font-size: 16px; transition: transform 0.3s; opacity: 0.8; }
        #boru-settings-icon:hover { transform: rotate(90deg); opacity: 1; text-shadow: 0 0 5px #00FFFF; }
        #boru-api-settings { display: none; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1); }

        .boru-subtitle { font-size: 10px; color: #888; font-weight: bold; margin: 15px 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 3px; letter-spacing: 0.5px; text-transform: uppercase; }
        
        /* Form Elemanları */
        .boru-row { margin-bottom: 10px; }
        .boru-label { font-size: 11px; color: #bbb; display: block; margin-bottom: 4px; font-weight: 600; }
        .boru-select, .boru-input { width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 12px; outline: none; transition: 0.3s; box-sizing: border-box; }
        .boru-select:focus, .boru-input:focus { border-color: #00FFFF; box-shadow: 0 0 5px rgba(0,255,255,0.3); }
        .boru-input { font-family: monospace; color: #00FFFF; resize: vertical; }
        
        /* Satır Ayarları */
        .boru-cfg-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
        .boru-cfg-label { font-size: 11px; color: #00FFFF; font-weight: bold; }
        .boru-color-picker { border: none; width: 25px; height: 25px; cursor: pointer; background: none; padding: 0; border-radius: 50%; overflow: hidden; }
        .boru-emoji-input, .boru-coord-input { width: 45px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: white; text-align: center; font-size: 13px; border-radius: 4px; padding: 4px; outline: none; }
        
        /* Yeni Özellikler Izgarası (Grid) */
        .boru-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .boru-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; } 
        .boru-grid-full { grid-template-columns: 1fr; }
        
        /* Modern Butonlar */
        .boru-btn { width: 100%; padding: 8px; background: rgba(0, 255, 255, 0.1); color: #00FFFF; border: 1px solid #00FFFF; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 11px; transition: all 0.2s; text-transform: uppercase; }
        .boru-btn:hover { background: #00FFFF; color: #000; box-shadow: 0 0 10px rgba(0,255,255,0.5); }
        
        .boru-tool-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #ddd; padding: 8px 4px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; text-align: center; }
        .boru-tool-btn:hover { background: rgba(0, 255, 255, 0.1); border-color: #00FFFF; color: #fff; transform: translateY(-2px); }
        .boru-btn-gold { color: #FFD700; border-color: rgba(255, 215, 0, 0.3); }
        .boru-btn-gold:hover { background: rgba(255, 215, 0, 0.15); border-color: #FFD700; color: #FFD700; }

        /* Switch Toggle Görünümü */
        .boru-switch { position: relative; display: inline-block; width: 34px; height: 18px; }
        .boru-switch input { opacity: 0; width: 0; height: 0; }
        .boru-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.2); transition: .4s; border-radius: 34px; }
        .boru-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .boru-slider { background-color: #00FFFF; }
        input:checked + .boru-slider:before { transform: translateX(16px); background-color: #000; }

        #boru-result-box { margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.6); border-left: 3px solid #00FFFF; border-radius: 0 6px 6px 0; font-size: 12px; color: #eee; min-height: 20px; word-wrap: break-word; display: none; }

        /* RADAR STİLİ (Dinamik) */
        .boru-dost { text-shadow: 0 0 5px ${radarRenk}, 0 0 10px ${radarRenk} !important; color: ${radarRenk} !important; font-weight: bold !important; }
        .boru-badge-icon { font-size: 14px; margin-right: 4px; vertical-align: middle; filter: drop-shadow(0 0 2px ${radarRenk}); }
        /* Zaman Gösterici Stili */
        .boru-timestamp { font-size: 9px; color: #888; margin-right: 5px; opacity: 0.8; font-family: monospace; }
    `;
    document.head.appendChild(stil);

    // Toggle Buton
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "boru-toggle-btn";
    toggleBtn.innerText = radarEmoji;
    document.body.appendChild(toggleBtn);

    if (btnPosX && btnPosY) {
        toggleBtn.style.left = btnPosX + "px";
        toggleBtn.style.top = btnPosY + "px";
        toggleBtn.style.bottom = "auto";
        toggleBtn.style.right = "auto";
    }

    const panel = document.createElement("div");
    panel.id = "boru-panel";
    
    let optionsSource = "", optionsTarget = "";
    for (const [code, name] of Object.entries(DILLER)) {
        optionsSource += `<option value="${code}" ${code === ayarKaynak ? "selected" : ""}>${name}</option>`;
        if (code !== "auto") optionsTarget += `<option value="${code}" ${code === ayarHedef ? "selected" : ""}>${name}</option>`;
    }

    // Ana Yapı
    panel.innerHTML = `
        <div class="boru-title-container">
            <div class="boru-title">🐺 BÖRÜ PRO PANEL</div>
            <div id="boru-settings-icon" title="API Ayarları">⚙️</div>
        </div>

        <div id="boru-api-settings">
            <div class="boru-subtitle" style="margin-top:0;">🔑 API BAĞLANTILARI</div>
            <div class="boru-row" style="margin-bottom: 5px;">
                <label class="boru-label">Gemini AI API Key:</label>
                <input type="password" id="boru-inp-gemini" class="boru-input" value="${apiGemini}" placeholder="AIzaSy..." autocomplete="off">
            </div>
            <div class="boru-row">
                <label class="boru-label">Wolvesville API Key:</label>
                <input type="password" id="boru-inp-wolvesville" class="boru-input" value="${apiWolvesville}" placeholder="Wv..." autocomplete="off">
            </div>
            <button id="boru-save-api-btn" class="boru-btn" style="margin-top:5px;">KAYDET</button>
        </div>
        
        <div class="boru-grid">
            <div>
                <div class="boru-subtitle" style="margin-top:0;">🌍 ÇEVİRİ MERKEZİ</div>
                <div class="boru-grid" style="margin-bottom: 5px;">
                    <div><label class="boru-label">Oyun Dili:</label><select id="boru-sl" class="boru-select">${optionsSource}</select></div>
                    <div><label class="boru-label">Hedef Dil:</label><select id="boru-tl" class="boru-select">${optionsTarget}</select></div>
                </div>
                <div class="boru-row" style="margin-top:5px;">
                    <textarea id="boru-text-input" class="boru-input" rows="2" placeholder="Hızlı çeviri için metin gir..."></textarea>
                    <button id="boru-translate-btn" class="boru-btn" style="margin-top:5px;">ÇEVİR & KOPYALA</button>
                    <div id="boru-result-box"></div>
                </div>
            </div>

            <div>
                <div class="boru-subtitle" style="margin-top:0;">📡 RADAR & SİSTEM</div>
                <div class="boru-cfg-row">
                    <span class="boru-cfg-label">Radar Sistemi</span>
                    <label class="boru-switch"><input type="checkbox" id="boru-radar-toggle" ${radarAktif ? "checked" : ""}><span class="boru-slider"></span></label>
                </div>
                <div class="boru-cfg-row">
                    <span class="boru-cfg-label">Mesaj Zamanı</span>
                    <label class="boru-switch"><input type="checkbox" id="boru-time-toggle" ${zamanGostericiAktif ? "checked" : ""}><span class="boru-slider"></span></label>
                </div>
                <div class="boru-cfg-row">
                    <span class="boru-cfg-label">Dost Rengi</span>
                    <input type="color" id="boru-radar-color" class="boru-color-picker" value="${radarRenk}">
                </div>
                <div class="boru-cfg-row">
                    <span class="boru-cfg-label">Dost Emojisi</span>
                    <input type="text" id="boru-radar-emoji-val" class="boru-emoji-input" maxlength="2" value="${radarEmoji}">
                </div>
            </div>
        </div>

        <div class="boru-subtitle">🛠️ MİNİ PROGRAMLAR (YENİ)</div>
        <div class="boru-grid-3"> 
            <button class="boru-tool-btn" id="btn-og-name">OG Name Jeneratörü</button>
            <button class="boru-tool-btn" id="btn-bm-index">Hesap Değeri</button>
            <button class="boru-tool-btn" id="btn-assassins">Assassins Mode 🇬🇧</button>
            <button class="boru-tool-btn" id="btn-quick-msg">Hızlı Taslaklar</button>
            <button class="boru-tool-btn" id="btn-voice-change">Ses Değiştirici</button>
            <button class="boru-tool-btn" id="btn-clan-donate">Klan Bağış Oto</button>
            <button class="boru-tool-btn" id="btn-ai-lie">AI Yalan Üretici</button>
            <button class="boru-tool-btn" id="btn-acc-changer">Hesap Kasası</button>
            <button class="boru-tool-btn" id="btn-ad-wheel">Reklam Çarkı</button>
            <button class="boru-tool-btn" id="btn-clan-invite">Toplu klan davet</button>
            <button class="boru-tool-btn" id="btn-mass-msg">Toplu Mesaj Gönder</button>
            <button class="boru-tool-btn" id="btn-proxy-changer">Proxy Değiştirici</button>
        </div>

        <div>
            <div class="boru-subtitle">📍 KONUM SABİTLEME</div>
            <div style="display:flex; gap:5px;">
                <div class="boru-cfg-row" style="flex:1; margin-bottom:0;"><span class="boru-cfg-label">X:</span><input type="number" id="boru-pos-x" class="boru-coord-input" style="width:100%;" value="${btnPosX}"></div>
                <div class="boru-cfg-row" style="flex:1; margin-bottom:0;"><span class="boru-cfg-label">Y:</span><input type="number" id="boru-pos-y" class="boru-coord-input" style="width:100%;" value="${btnPosY}"></div>
            </div>
        </div>
        
        <div class="boru-grid boru-grid-full" style="margin-top:8px;">
            <button class="boru-tool-btn boru-btn-gold" id="btn-donate">💛 BÖRÜ'YE BAĞIŞ YAP</button>
        </div>
    `;
    document.body.appendChild(panel);

    // --- AKILLI BUTON TIKLAMA VE HİZALAMA ---
    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const panelAcikMi = panel.style.display === "block";
        panel.style.display = panelAcikMi ? "none" : "block";
        
        if (!panelAcikMi) {
            setTimeout(() => {
                const btnRect = toggleBtn.getBoundingClientRect();
                const panelYukseklik = panel.offsetHeight;
                const panelGenislik = panel.offsetWidth;
                
                let pX = btnRect.right - panelGenislik; 
                let pY = btnRect.top - panelYukseklik - 15; 
                
                if (pY < 10) pY = btnRect.bottom + 15;
                if (pX < 10) pX = btnRect.left;
                
                panel.style.left = pX + "px";
                panel.style.top = pY + "px";
                panel.style.bottom = "auto";
                panel.style.right = "auto";
            }, 10);
        }
    };

    ['click', 'mousedown', 'keydown'].forEach(evt => panel.addEventListener(evt, e => e.stopPropagation()));

    // --- Ayarlar Menüsü Aç/Kapa İşlemi ---
    document.getElementById("boru-settings-icon").onclick = (e) => {
        e.stopPropagation();
        const apiMenu = document.getElementById("boru-api-settings");
        apiMenu.style.display = apiMenu.style.display === "block" ? "none" : "block";
    };

    // --- API Kaydetme İşlemi ---
    document.getElementById("boru-save-api-btn").onclick = (e) => {
        e.stopPropagation();
        const geminiVal = document.getElementById("boru-inp-gemini").value;
        const wvVal = document.getElementById("boru-inp-wolvesville").value;
        
        localStorage.setItem("boru_api_gemini", geminiVal);
        localStorage.setItem("boru_api_wolvesville", wvVal);
        
        apiGemini = geminiVal;
        apiWolvesville = wvVal;

        const btn = document.getElementById("boru-save-api-btn");
        btn.innerText = "KAYDEDİLDİ ✔️";
        btn.style.background = "#004400";
        btn.style.color = "#00FF00";
        
        setTimeout(() => { 
            btn.innerText = "KAYDET"; 
            btn.style.background = "rgba(0, 255, 255, 0.1)"; 
            btn.style.color = "#00FFFF";
        }, 2000);
    };

    // --- AYARLARI KAYDET VE UYGULA ---
    const updateSettings = () => {
        ayarKaynak = document.getElementById("boru-sl").value;
        ayarHedef = document.getElementById("boru-tl").value;
        radarAktif = document.getElementById("boru-radar-toggle").checked;
        zamanGostericiAktif = document.getElementById("boru-time-toggle").checked;
        radarRenk = document.getElementById("boru-radar-color").value;
        radarEmoji = document.getElementById("boru-radar-emoji-val").value;
        
        const valX = document.getElementById("boru-pos-x").value;
        const valY = document.getElementById("boru-pos-y").value;

        localStorage.setItem("boru_sl", ayarKaynak);
        localStorage.setItem("boru_tl", ayarHedef);
        localStorage.setItem("boru_radar_aktif", radarAktif);
        localStorage.setItem("boru_zaman_aktif", zamanGostericiAktif);
        localStorage.setItem("boru_radar_renk", radarRenk);
        localStorage.setItem("boru_radar_emoji", radarEmoji);

        document.getElementById("boru-toggle-btn").innerText = radarEmoji;
        document.getElementById("boru-toggle-btn").style.borderColor = radarRenk;
        document.getElementById("boru-toggle-btn").style.boxShadow = `0 0 15px ${radarRenk}80`;

        if (valX !== "" && valY !== "") {
            let numX = parseInt(valX, 10);
            let numY = parseInt(valY, 10);

            const maxX = window.innerWidth - 60; 
            const maxY = window.innerHeight - 60; 
            
            if (numX > maxX) numX = maxX; if (numX < 0) numX = 0;
            if (numY > maxY) numY = maxY; if (numY < 0) numY = 0;

            localStorage.setItem("boru_pos_x", numX);
            localStorage.setItem("boru_pos_y", numY);
            
            toggleBtn.style.left = numX + "px";
            toggleBtn.style.top = numY + "px";
            toggleBtn.style.bottom = "auto";
            toggleBtn.style.right = "auto";

            if (panel.style.display === "block") {
                const panelYukseklik = panel.offsetHeight;
                const panelGenislik = panel.offsetWidth;
                let pX = (numX + 50) - panelGenislik; 
                let pY = numY - panelYukseklik - 15;
                if (pY < 10) pY = numY + 50 + 15; 
                if (pX < 10) pX = numX; 
                panel.style.left = pX + "px";
                panel.style.top = pY + "px";
            }
        }

        const stilBlogu = document.getElementById("boru-dinamik-stil");
        if(stilBlogu) {
            const yeniKural = `
                .boru-dost { text-shadow: 0 0 5px ${radarRenk}, 0 0 10px ${radarRenk} !important; color: ${radarRenk} !important; font-weight: bold !important; }
                .boru-badge-icon { font-size: 14px; margin-right: 4px; vertical-align: middle; filter: drop-shadow(0 0 2px ${radarRenk}); }
            `;
            if(!stilBlogu.innerHTML.includes("/* DYNAMIC_UPDATE */")) {
                stilBlogu.innerHTML += `\n/* DYNAMIC_UPDATE */\n` + yeniKural;
            } else {
                const parts = stilBlogu.innerHTML.split("/* DYNAMIC_UPDATE */");
                stilBlogu.innerHTML = parts[0] + "/* DYNAMIC_UPDATE */" + yeniKural;
            }
        }
    };

    document.getElementById("boru-sl").addEventListener("change", updateSettings);
    document.getElementById("boru-tl").addEventListener("change", updateSettings);
    document.getElementById("boru-radar-toggle").addEventListener("change", updateSettings);
    document.getElementById("boru-time-toggle").addEventListener("change", updateSettings);
    document.getElementById("boru-radar-color").addEventListener("input", updateSettings); 
    document.getElementById("boru-radar-emoji-val").addEventListener("input", updateSettings);
    document.getElementById("boru-pos-x").addEventListener("input", updateSettings);
    document.getElementById("boru-pos-y").addEventListener("input", updateSettings);

    // Çeviri Butonu
    document.getElementById("boru-translate-btn").onclick = async () => {
        const metin = document.getElementById("boru-text-input").value.trim();
        const kutu = document.getElementById("boru-result-box");
        if (!metin) return;
        kutu.style.display = "block"; kutu.innerText = "⏳ ...";
        let target = ayarKaynak === "auto" ? "en" : ayarKaynak;
        const sonuc = await googleApiRequest(metin, "auto", target);
        if (sonuc) {
            kutu.innerText = sonuc;
            navigator.clipboard.writeText(sonuc);
            kutu.innerHTML = `<span style="color:#00FFFF">✅ Kopyalandı!</span><br>${sonuc}`;
            setTimeout(() => kutu.innerText = sonuc, 2000);
        } else { kutu.innerText = "❌ Hata"; }
    };

    // Butonlara tıklandığında ilgili modül dosyasını yükle veya çalıştır
    document.getElementById("btn-og-name").onclick = () => modulYukle("og-name");
    document.getElementById("btn-bm-index").onclick = () => modulYukle("bm-index");
    document.getElementById("btn-assassins").onclick = () => modulYukle("assassins");
    document.getElementById("btn-quick-msg").onclick = () => modulYukle("quick-msg");
    document.getElementById("btn-voice-change").onclick = () => modulYukle("voice-change");
    document.getElementById("btn-clan-donate").onclick = () => modulYukle("clan-donate");
    document.getElementById("btn-ai-lie").onclick = () => modulYukle("ai-lie");
    document.getElementById("btn-acc-changer").onclick = () => modulYukle("acc-changer");
    document.getElementById("btn-ad-wheel").onclick = () => modulYukle("ad-wheel");
    document.getElementById("btn-clan-invite").onclick = () => modulYukle("clan-invite");
    document.getElementById("btn-mass-msg").onclick = () => modulYukle("mass-msg");
    document.getElementById("btn-proxy-changer").onclick = () => modulYukle("proxy-changer");
    
    // Bağış Butonu (Statik kalabilir)
    document.getElementById("btn-donate").onclick = () => { window.open("https://www.itemsatis.com/diger-urun-satislari/ozel-ilan-5155320.html", "_blank"); };
}

    // ==============================================================
// 🟢 DİNAMİK MODÜL YÜKLEYİCİ (LITTLE PROGRAMS) - GARANTİLİ VERSİYON
// ==============================================================
function modulYukle(modulAdi, sessiz = false) {
    // Eğer dosya zaten çekildiyse
    if (document.getElementById(`boru-modul-${modulAdi}`)) {
        // Sessiz modda değilsek arayüzü tetikle (butona basılmış demektir)
        if (!sessiz) window.dispatchEvent(new CustomEvent(`boru_${modulAdi}_tetikle`));
        return;
    }
    
    console.log(`🐺 Modül aranıyor: lib/littleprograms/${modulAdi}.js`);
    const script = document.createElement("script");
    script.id = `boru-modul-${modulAdi}`;
    
    // KOD %100 YÜKLENDİKTEN SONRA
    script.onload = () => {
        console.log(`✅ ${modulAdi}.js başarıyla yüklendi!`);
        // Sessiz yükleme DEĞİLSE arayüzü aç. Sessizse sadece arkada çalışmaya başlar.
        if (!sessiz) {
            window.dispatchEvent(new CustomEvent(`boru_${modulAdi}_tetikle`));
        }
    };

    script.onerror = () => {
        console.error(`❌ HATA: lib/littleprograms/${modulAdi}.js bulunamadı!`);
        const kutu = document.getElementById("boru-result-box");
        if(kutu) {
            kutu.style.display = "block";
            kutu.innerHTML = `<span style="color:#FF0000">❌ ${modulAdi} dosyası eksik! F12 Console'a bak.</span>`;
            setTimeout(() => kutu.style.display = "none", 4000);
        }
    };
    
    script.src = chrome.runtime.getURL(`lib/littleprograms/${modulAdi}.js`);
    document.body.appendChild(script);
}




// --- 4. CHAT İŞLEYİCİ & RADAR & ZAMAN GÖSTERİCİ ---
function baslatSistem() {
    function mesajMi(element) {
        if (!element || !element.getAttribute || element.getAttribute("dir") !== "auto") return false;
        if (["TEXTAREA", "INPUT"].includes(element.tagName)) return false;
        const text = element.innerText || "";
        if (!text.includes(":") || text.indexOf(":") > 30) return false;
        return true;
    }

    function islemYap(element) {
        if (element.dataset.boruIslem === "ok") return;
        element.dataset.boruIslem = "ok";

        const hamMetin = element.innerText;
        const isimBolumu = hamMetin.split(":")[0];
        const temizIsim = isimBolumu.replace(/^\d+\s/, "").trim(); 

        // YENİ: Zaman Gösterici (Analiz için - Ayarlardan açıksa)
        if (zamanGostericiAktif) {
            const simdi = new Date();
            const saat = simdi.getHours().toString().padStart(2, '0');
            const dakika = simdi.getMinutes().toString().padStart(2, '0');
            const saniye = simdi.getSeconds().toString().padStart(2, '0');
            const zamanSpan = document.createElement("span");
            zamanSpan.className = "boru-timestamp";
            zamanSpan.innerText = `[${saat}:${dakika}:${saniye}]`;
            element.prepend(zamanSpan);
        }

        // --- A) RADAR KONTROLÜ (Eğer Radar Açıksa) ---
        if (radarAktif && boruKullanicilari.includes(temizIsim)) {
            element.classList.add("boru-dost");
            const badge = document.createElement("span");
            badge.className = "boru-badge-icon";
            badge.innerText = radarEmoji; 
            badge.title = "Doğrulanmış Börü Kullanıcısı";
            badge.style.filter = `drop-shadow(0 0 2px ${radarRenk})`;
            element.prepend(badge);
        }

        // --- B) ÇEVİRİ BUTONU ---
        const btn = document.createElement("span");
        btn.innerText = ` [${ayarHedef.toUpperCase()}]`;
        btn.style.cssText = "cursor:pointer; color:#00FFFF; font-weight:bold; font-size:10px; margin-left:5px; opacity:0.7; transition:0.2s;";
        btn.onmouseover = () => btn.style.opacity = "1";
        btn.onmouseout = () => btn.style.opacity = "0.7";
        
        btn.onclick = async (e) => {
            e.stopPropagation(); e.preventDefault();
            let mesajKismi = hamMetin;
            if (hamMetin.includes(":")) {
                mesajKismi = hamMetin.split(":").slice(1).join(":").trim();
            }
            mesajKismi = mesajKismi.split("➤")[0].trim();

            btn.innerText = " ⏳";
            const ceviri = await googleApiRequest(mesajKismi, ayarKaynak, ayarHedef);
            
            if (ceviri) {
                const eski = element.querySelector(".boru-ceviri-sonuc");
                if (eski) eski.remove();

                const sonucDiv = document.createElement("div");
                sonucDiv.className = "boru-ceviri-sonuc";
                sonucDiv.innerText = "➤ " + ceviri;
                sonucDiv.style.cssText = "color:#00FFFF; font-size:0.9em; margin-top:4px; padding-top:4px; border-top:1px dashed rgba(0,255,255,0.3); font-family:sans-serif;";
                element.appendChild(sonucDiv);
                btn.remove();
            } else {
                btn.innerText = " [X]";
            }
        };
        element.appendChild(btn);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { 
                    if (mesajMi(node)) islemYap(node);
                    else if (node.querySelectorAll) {
                        node.querySelectorAll('[dir="auto"]').forEach(child => { if (mesajMi(child)) islemYap(child); });
                    }
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}



// --- 🐺 BÖRÜ: ARKA PLAN KLAN BAĞIŞ MOTORU (SİNSİ VE GARANTİCİ) ---
function bagisMotorunuUyandir() {
    try {
        // Eğer zaten yüklendiyse bir daha yükleme (Çift dikiş olmasın)
        if (document.getElementById("boru-modul-clan-donate")) return;

        console.log("🏛️ Börü: Bağış motoru sızdırılıyor...");
        modulYukle("clan-donate", true);
    } catch (e) {
        console.error("🏛️ Börü: Motor sızdırılırken hata oluştu!", e);
    }
}
// Sayfa yüklendikten 7 saniye sonra sessizce motoru ateşle
setTimeout(bagisMotorunuUyandir, 7000);

setTimeout(() => {
    arayuzuOlustur();
    baslatSistem();
    console.log("🐺 Börü Pro V4.5 (Modern Panel + Dinamik Modüller) Hazır!");
}, 2000);

// İletişim Hattı (RPC & Webhook)
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && (event.data.type === 'FROM_PAGE_CLICK' || event.data.type === 'FROM_GAME_TO_DISCORD')) {
        try { chrome.runtime.sendMessage(event.data.type === 'FROM_GAME_TO_DISCORD' ? { action: "sendToDiscord", webhookUrl: event.data.webhookUrl, data: event.data.payload } : { x: event.data.x, y: event.data.y }); } catch (e) {}
    }
});



chrome.runtime.sendMessage({ action: "GET_TAB_ID" }, function(response) {
    if (response && response.tabId) {
        window.postMessage({ type: 'BORU_TAB_ID_GELDI', tabId: response.tabId }, '*');
    }
});
// --- BÖRÜ: MAIN WORLD İLE BACKGROUND ARASI SİBER KURYE KÖPRÜSÜ ---
window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    // 1. Tıklama Botu Köprüsü
    if (event.data && event.data.action === "BORU_NATIVE_CLICK") {
        chrome.runtime.sendMessage({ x: event.data.x, y: event.data.y });
    }

    // 2. PROXY YÖNETİMİ KÖPRÜSÜ
    if (event.data && event.data.action === "BORU_BG_COMMAND") {
        chrome.runtime.sendMessage(event.data.payload, (response) => {
            window.postMessage({ 
                type: "BORU_BG_RESPONSE", 
                command: event.data.payload.action, 
                response: response 
            }, "*");
        });
    }
});
// ===========================================================
// 🐺 BÖRÜ PRO - ANTİ-SLEEP (SİBER KAHVE / AUDIO HACK)
// ===========================================================

function boruUykuyuKapat() {
    // Sadece bir kere çalışmasını sağla
    if (window.boruUykusuzlukAktif) return;
    
    try {
        // Tarayıcının Ses Motorunu (AudioContext) çalıştır
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Boş bir ses kaynağı (Osilatör) yarat
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // SES SEVİYESİNİ SIFIR YAP (Kimse hiçbir şey duymayacak)
        gainNode.gain.value = 0; 
        
        // Ses dalgasını sisteme bağla ve sonsuza kadar çalmaya başla
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();

        window.boruUykusuzlukAktif = true;
        console.log("☕ [BÖRÜ] Anti-Sleep devrede! Chrome artık bu sekmeyi uyutamaz.");
        
        // Ekrana da ufak bir uyarı verebilirsin
        let status = document.getElementById("boru-proxy-status");
        if(status) status.innerText += " | ☕ Uyku Modu İptal";

    } catch (e) {
        console.error("❌ [BÖRÜ] Anti-Sleep başlatılamadı:", e);
    }
}

// Oyun ekranında rastgele bir yere tıklandığında (Kullanıcı etkileşimi şarttır) sesi başlat
document.addEventListener("click", boruUykuyuKapat, { once: true });