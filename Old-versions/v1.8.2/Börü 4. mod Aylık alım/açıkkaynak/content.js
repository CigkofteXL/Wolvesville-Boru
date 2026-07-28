// ===========================================================
// 🐺 BÖRÜ PRO V4.5 - RADAR & TRANSLATOR (CUSTOMIZABLE)
// ===========================================================

// --- AYARLAR & DEĞİŞKENLER ---
const USERS_URL = "https://raw.githubusercontent.com/CigkofteXL/Boru/main/users.json";
const DEFAULT_SOURCE = "auto";
const DEFAULT_TARGET = "tr";

// Kayıtlı Ayarları Yükle (Yoksa varsayılanları kullan)
let ayarKaynak = localStorage.getItem("boru_sl") || DEFAULT_SOURCE;
let ayarHedef = localStorage.getItem("boru_tl") || DEFAULT_TARGET;
// Radar Ayarları
let radarAktif = localStorage.getItem("boru_radar_aktif") !== "false"; // Varsayılan: Açık
let radarRenk = localStorage.getItem("boru_radar_renk") || "#00FFFF"; // Varsayılan: Cyan
let radarEmoji = localStorage.getItem("boru_radar_emoji") || "🐺"; // Varsayılan: Kurt

// Konum Ayarları (Varsayılan olarak boş, boşsa sağ altta çıkar)
let btnPosX = localStorage.getItem("boru_pos_x") || "";
let btnPosY = localStorage.getItem("boru_pos_y") || "";

let boruKullanicilari = []; // Kullanıcı listesi

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
setInterval(boruKullanicilariniGetir, 300000); // 5 dakikada bir güncelle

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

// --- 3. ARAYÜZ OLUŞTURUCU (GELİŞMİŞ PANEL) ---
function arayuzuOlustur() {
    if (document.getElementById("boru-panel")) return;

    // --- Stil Tanımları ---
    const stil = document.createElement("style");
    stil.id = "boru-dinamik-stil"; // Dinamik renk değişimi için ID verdik
    stil.innerHTML = `
        /* Yüzen Tuş */
        #boru-toggle-btn {
            position: fixed; bottom: 90px; right: 20px; z-index: 2147483647;
            width: 45px; height: 45px; background: #111; border: 2px solid #00FF00;
            border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 22px; box-shadow: 0 0 10px #00FF00; transition: 0.3s; user-select: none;
        }
        #boru-toggle-btn:hover { transform: scale(1.1); background: #222; }
        
        /* Panel */
        #boru-panel {
            position: fixed; bottom: 150px; right: 20px; z-index: 2147483647;
            width: 280px; background: rgba(16, 16, 30, 0.98); border: 1px solid #444;
            border-radius: 8px; padding: 12px; color: white; font-family: sans-serif;
            display: none; box-shadow: 0 5px 25px rgba(0,0,0,0.9);
        }
        .boru-row { margin-bottom: 8px; }
        .boru-label { font-size: 11px; color: #aaa; display: block; margin-bottom: 3px; font-weight: bold; }
        .boru-select { width: 100%; padding: 4px; background: #222; color: white; border: 1px solid #555; border-radius: 4px; font-size: 12px; }
        .boru-input { width: 100%; padding: 6px; background: #000; color: #00FF00; border: 1px solid #333; border-radius: 4px; box-sizing: border-box; font-family: monospace; font-size: 12px; resize: vertical; }
        .boru-btn { width: 100%; padding: 6px; background: #004400; color: #00FF00; border: 1px solid #00FF00; cursor: pointer; border-radius: 4px; font-weight: bold; margin-top: 5px; font-size: 11px; }
        .boru-btn:hover { background: #00FF00; color: #000; }
        #boru-result-box { margin-top: 8px; padding: 8px; background: #080808; border-left: 2px solid #00FF00; font-size: 12px; color: #eee; min-height: 15px; word-wrap: break-word; display: none; }
        .boru-title { text-align: center; color: #00FF00; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px; font-size: 13px; }
        
        /* Yeni Ayar Satırları */
        .boru-cfg-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; background: #1a1a2e; padding: 5px; border-radius: 4px; border: 1px solid #333; }
        .boru-cfg-label { font-size: 10px; color: #00FF00; font-weight: bold; }
        .boru-color-picker { border: none; width: 30px; height: 20px; cursor: pointer; background: none; padding: 0; }
        .boru-emoji-input { width: 40px; background: #000; border: 1px solid #444; color: white; text-align: center; font-size: 14px; border-radius: 3px; }
        
        /* Manuel Koordinat Inputu İçin Özel */
        .boru-coord-input { width: 50px; background: #000; border: 1px solid #444; color: #00FF00; text-align: center; font-size: 12px; border-radius: 3px; padding: 2px; }

        /* RADAR STİLİ (Dinamik) */
        .boru-dost {
            text-shadow: 0 0 5px ${radarRenk}, 0 0 10px ${radarRenk} !important;
            color: ${radarRenk} !important;
            font-weight: bold !important;
        }
        .boru-badge-icon {
            font-size: 14px; margin-right: 4px; vertical-align: middle;
            filter: drop-shadow(0 0 2px ${radarRenk});
        }
    `;
    document.head.appendChild(stil);

    // Toggle Buton
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "boru-toggle-btn";
    toggleBtn.innerText = "🐺";
    document.body.appendChild(toggleBtn);

    // Başlangıç Konumunu Uygula
    if (btnPosX && btnPosY) {
        toggleBtn.style.left = btnPosX + "px";
        toggleBtn.style.top = btnPosY + "px";
        toggleBtn.style.bottom = "auto";
        toggleBtn.style.right = "auto";
    }

    // Panel HTML
    const panel = document.createElement("div");
    panel.id = "boru-panel";
    
    let optionsSource = "", optionsTarget = "";
    for (const [code, name] of Object.entries(DILLER)) {
        optionsSource += `<option value="${code}" ${code === ayarKaynak ? "selected" : ""}>${name}</option>`;
        if (code !== "auto") optionsTarget += `<option value="${code}" ${code === ayarHedef ? "selected" : ""}>${name}</option>`;
    }

    panel.innerHTML = `
        <div class="boru-title">🐺 BÖRÜ KONTROL MERKEZİ</div>
        
        <div class="boru-row"><label class="boru-label">Oyun Dili:</label><select id="boru-sl" class="boru-select">${optionsSource}</select></div>
        <div class="boru-row"><label class="boru-label">Çevrilecek Dil:</label><select id="boru-tl" class="boru-select">${optionsTarget}</select></div>
        
        <hr style="border:0; border-top:1px solid #333; margin:8px 0;">
        
        <div class="boru-title" style="font-size:10px; color:#aaa; margin-top:5px;">📍 KONUM & RADAR AYARLARI</div>
        
        <div class="boru-cfg-row">
            <span class="boru-cfg-label">BUTON X (SOL):</span>
            <input type="number" id="boru-pos-x" class="boru-coord-input" value="${btnPosX}" placeholder="Örn: 50">
        </div>
        <div class="boru-cfg-row">
            <span class="boru-cfg-label">BUTON Y (ÜST):</span>
            <input type="number" id="boru-pos-y" class="boru-coord-input" value="${btnPosY}" placeholder="Örn: 100">
        </div>

        <div class="boru-cfg-row" style="margin-top:8px;">
            <span class="boru-cfg-label">RADAR SİSTEMİ:</span>
            <input type="checkbox" id="boru-radar-toggle" ${radarAktif ? "checked" : ""}>
        </div>
        <div class="boru-cfg-row">
            <span class="boru-cfg-label">DOST RENGİ:</span>
            <input type="color" id="boru-radar-color" class="boru-color-picker" value="${radarRenk}">
        </div>
        <div class="boru-cfg-row">
            <span class="boru-cfg-label">DOST EMOJİSİ:</span>
            <input type="text" id="boru-radar-emoji-val" class="boru-emoji-input" maxlength="2" value="${radarEmoji}">
        </div>

        <hr style="border:0; border-top:1px solid #333; margin:8px 0;">
        
        <div class="boru-row"><label class="boru-label">💬 Hızlı Çeviri:</label><textarea id="boru-text-input" class="boru-input" rows="2" placeholder="Türkçe yaz..."></textarea><button id="boru-translate-btn" class="boru-btn">ÇEVİR & KOPYALA</button></div>
        <div id="boru-result-box"></div>
    `;
    document.body.appendChild(panel);

    // --- AKILLI BUTON TIKLAMA VE HİZALAMA MANTIĞI ---
    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const panelAcikMi = panel.style.display === "block";
        panel.style.display = panelAcikMi ? "none" : "block";
        
        if (!panelAcikMi) {
            // Milisaniyelik bir gecikme ekliyoruz ki tarayıcı panelin yüksekliğini tam hesaplayabilsin
            setTimeout(() => {
                const btnRect = toggleBtn.getBoundingClientRect();
                const panelYukseklik = panel.offsetHeight || 380; // Panel ortalama boyu
                const panelGenislik = 280; // Panel varsayılan genişliği
                
                // 1. Varsayılan Hizalama (Butonun tam üstünde, sağ tarafları bitişik)
                let pX = btnRect.right - panelGenislik; 
                let pY = btnRect.top - panelYukseklik - 15; 
                
                // 2. Yukarıda yer yoksa Panel butonun ALTINA açılsın! (Çarpışma Engelleme)
                if (pY < 10) {
                    pY = btnRect.bottom + 15;
                }
                
                // 3. Solda yer yoksa Panel butonun SAĞINA doğru hizalansın!
                if (pX < 10) {
                    pX = btnRect.left;
                }
                
                panel.style.left = pX + "px";
                panel.style.top = pY + "px";
                panel.style.bottom = "auto";
                panel.style.right = "auto";
            }, 10);
        }
    };

    // Olay Engelleyiciler
    ['click', 'mousedown', 'keydown'].forEach(evt => panel.addEventListener(evt, e => e.stopPropagation()));

    // --- AYARLARI KAYDET VE UYGULA ---
    const updateSettings = () => {
        // Değerleri Al
        ayarKaynak = document.getElementById("boru-sl").value;
        ayarHedef = document.getElementById("boru-tl").value;
        radarAktif = document.getElementById("boru-radar-toggle").checked;
        radarRenk = document.getElementById("boru-radar-color").value;
        radarEmoji = document.getElementById("boru-radar-emoji-val").value;
        
        const valX = document.getElementById("boru-pos-x").value;
        const valY = document.getElementById("boru-pos-y").value;

        // Kaydet
        localStorage.setItem("boru_sl", ayarKaynak);
        localStorage.setItem("boru_tl", ayarHedef);
        localStorage.setItem("boru_radar_aktif", radarAktif);
        localStorage.setItem("boru_radar_renk", radarRenk);
        localStorage.setItem("boru_radar_emoji", radarEmoji);

        // Koordinatları Anlık Güncelle ve Hizala
        if (valX !== "" && valY !== "") {
            let numX = parseInt(valX, 10);
            let numY = parseInt(valY, 10);

            // UZAYA UÇMAYI ENGELLEYEN SINIR KONTROLÜ
            const maxX = window.innerWidth - 90; // Ekran genişliği - buton genişliği
            const maxY = window.innerHeight - 90; // Ekran yüksekliği - buton yüksekliği
            
            if (numX > maxX) numX = maxX;
            if (numX < 0) numX = 0;
            if (numY > maxY) numY = maxY;
            if (numY < 0) numY = 0;

            // Düzeltilmiş değerleri kaydet
            localStorage.setItem("boru_pos_x", numX);
            localStorage.setItem("boru_pos_y", numY);
            
            toggleBtn.style.left = numX + "px";
            toggleBtn.style.top = numY + "px";
            toggleBtn.style.bottom = "auto";
            toggleBtn.style.right = "auto";

            // Panel açıksa onun da yerini akıllıca kaydır
            if (panel.style.display === "block") {
                const panelYukseklik = panel.offsetHeight || 380;
                const panelGenislik = 280;
                
                let pX = (numX + 45) - panelGenislik; 
                let pY = numY - panelYukseklik - 15;
                
                if (pY < 10) pY = numY + 45 + 15; // Yukarı sığmazsa aşağı at
                if (pX < 10) pX = numX; // Sola sığmazsa sağa at
                
                panel.style.left = pX + "px";
                panel.style.top = pY + "px";
            }
        }

        // Görünümü Anlık Güncelle (CSS Injection)
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

    // Event Listenerlar
    document.getElementById("boru-sl").addEventListener("change", updateSettings);
    document.getElementById("boru-tl").addEventListener("change", updateSettings);
    document.getElementById("boru-radar-toggle").addEventListener("change", updateSettings);
    document.getElementById("boru-radar-color").addEventListener("input", updateSettings); 
    document.getElementById("boru-radar-emoji-val").addEventListener("input", updateSettings);

    // Konum inputları anlık olarak etki etsin diye "input" olayı eklendi
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
            kutu.innerHTML = `<span style="color:#00FF00">✅ Kopyalandı!</span><br>${sonuc}`;
            setTimeout(() => kutu.innerText = sonuc, 2000);
        } else { kutu.innerText = "❌ Hata"; }
    };
}

// --- 4. CHAT İŞLEYİCİ & RADAR ---
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
        btn.style.cssText = "cursor:pointer; color:#00FF00; font-weight:bold; font-size:10px; margin-left:5px; opacity:0.7;";
        
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
                sonucDiv.style.cssText = "color:#00FFFF; font-size:0.9em; margin-top:2px; border-top:1px solid #444; font-family:sans-serif;";
                element.appendChild(sonucDiv);
                btn.remove();
            } else {
                btn.innerText = " [X]";
            }
        };
        element.appendChild(btn);
    }

    // Gözlemci
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

// --- 5. BAŞLAT ---
setTimeout(() => {
    arayuzuOlustur();
    baslatSistem();
    console.log("🐺 Börü Pro V4.5 (Radar+Customizer) Hazır!");
}, 2000);

// İletişim Hattı (RPC & Webhook)
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && (event.data.type === 'FROM_PAGE_CLICK' || event.data.type === 'FROM_GAME_TO_DISCORD')) {
        try { chrome.runtime.sendMessage(event.data.type === 'FROM_GAME_TO_DISCORD' ? { action: "sendToDiscord", webhookUrl: event.data.webhookUrl, data: event.data.payload } : { x: event.data.x, y: event.data.y }); } catch (e) {}
    }
});