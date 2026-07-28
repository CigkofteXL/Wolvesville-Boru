// ===========================================================
// 👑 BÖRÜ PRO - OG NAME JENERATÖRÜ (API KONTROLLÜ + FİLTRELİ)
// ===========================================================

window.addEventListener("boru_og-name_tetikle", () => {
    console.log("👑 OG Name API Modülü Aktif!");

    let modal = document.getElementById("boru-og-name-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-og-name-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(10, 10, 20, 0.9); border: 1px solid #FFD700; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);";
        
        modal.innerHTML = `
            <div style="color: #FFD700; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 13px; text-shadow: 0 0 8px rgba(255, 215, 0, 0.4); letter-spacing: 1px;">👑 OG NAME & API CHECKER</div>
            
            <div style="background: rgba(255, 215, 0, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 215, 0, 0.1); margin-bottom: 10px;">
                <div style="font-size: 10px; color: #FFD700; margin-bottom: 8px; text-align: center; opacity: 0.8;">⚠️ ÜRETİLEN İSMİN BOŞTA OLUP OLMADIĞINI DENETLER</div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; font-size: 11px; color: #FFF;">
                    <label style="cursor:pointer; display:flex; align-items:center; gap:3px;"><input type="checkbox" id="boru-og-upper" checked> ABC</label>
                    <label style="cursor:pointer; display:flex; align-items:center; gap:3px;"><input type="checkbox" id="boru-og-lower" checked> abc</label>
                    <label style="cursor:pointer; display:flex; align-items:center; gap:3px;"><input type="checkbox" id="boru-og-num"> 123</label>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                    <label class="boru-label" style="margin:0; font-size: 11px;">UZUNLUK:</label>
                    <input type="number" id="boru-og-length" class="boru-input" value="4" min="3" max="6" style="width: 45px; text-align: center; border-color: #FFD700; color: #FFD700;">
                    <button id="boru-og-run" class="boru-btn" style="flex: 1; background: rgba(255, 215, 0, 0.1); border-color: #FFD700; color: #FFD700; transition: 0.2s;">İSİM BUL & SORGULA</button>
                </div>
            </div>
            
            <div id="boru-og-status" style="font-size: 10px; color: #888; text-align: center; margin-bottom: 5px; display: none;"></div>
            <div id="boru-og-result" style="font-size: 16px; font-weight: 900; text-align: center; letter-spacing: 4px; min-height: 40px; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; display: none; border: 1px dashed rgba(255, 215, 0, 0.3);"></div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-og-run").onclick = uretVeSorgula;
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// Spam Koruması İçin Global Değişken
let ogCooldown = false;

// --- İSİM ÜRETME VE API SORGULAMA MANTIĞI ---
async function uretVeSorgula() {
    // Eğer cooldown süresindeyse (buton kilitliyse) işlemi direkt reddet
    if (ogCooldown) return;

    const length = parseInt(document.getElementById("boru-og-length").value);
    const useUpper = document.getElementById("boru-og-upper").checked;
    const useLower = document.getElementById("boru-og-lower").checked;
    const useNum = document.getElementById("boru-og-num").checked;
    
    const status = document.getElementById("boru-og-status");
    const result = document.getElementById("boru-og-result");
    const runBtn = document.getElementById("boru-og-run");

    // LocalStorage'dan API Key'i oku
    const apiWolvesville = localStorage.getItem("boru_api_wolvesville");

    if (!apiWolvesville || apiWolvesville.trim() === "") {
        status.style.display = "block";
        status.innerHTML = "❌ HATA: Wolvesville API Key eksik! Ayarlardan API girin.";
        status.style.color = "#FF0044";
        result.style.display = "none";
        return;
    }

    // Kullanıcı hiçbir harf/rakam havuzu seçmediyse uyar
    if (!useUpper && !useLower && !useNum) {
        status.style.display = "block";
        status.innerHTML = "❌ HATA: En az bir karakter türü (ABC, abc, 123) seçmelisin!";
        status.style.color = "#FF0044";
        result.style.display = "none";
        return;
    }

    // UI Temizliği & Cooldown Başlatma
    ogCooldown = true;
    result.style.display = "none";
    status.style.display = "block";
    status.innerHTML = "⏳ İsim üretiliyor ve API'de taranıyor...";
    status.style.color = "#888";
    runBtn.disabled = true;
    runBtn.style.opacity = "0.5";
    runBtn.innerText = "BEKLEYİN...";

    try {
        // 1. AŞAMA: Seçilenlere Göre Dinamik Karakter Havuzu Oluştur
        let pool = "";
        if (useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (useLower) pool += "abcdefghijklmnopqrstuvwxyz";
        if (useNum) pool += "0123456789";

        let generatedName = "";
        for (let i = 0; i < length; i++) {
            generatedName += pool[Math.floor(Math.random() * pool.length)];
        }

        // 2. AŞAMA: C# Mantığını JS Fetch ile Simüle Etmek
        const targetUrl = `https://api.wolvesville.com/players/search?username=${generatedName}`;
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${apiWolvesville}`,
                'Accept': 'application/json'
            }
        });

        // 3. AŞAMA: Gelen Yanıtı Analiz Et
        result.style.display = "block";

        if (response.ok) {
            // HTTP 200 (OK) -> Bu isim alınmış
            status.innerHTML = "⚠️ Tüh! Bu isim veritabanında mevcut.";
            status.style.color = "#FFaa00";
            
            result.innerHTML = `
                <span style='text-decoration: line-through; opacity: 0.4; color: #FFF;'>${generatedName}</span><br>
                <span style='font-size: 10px; color: #FF0044; letter-spacing: 1px; font-family: sans-serif;'>[ KULLANILIYOR ]</span>
            `;
            result.style.borderColor = "rgba(255, 0, 68, 0.3)";
        } 
        else if (response.status === 404) {
            // HTTP 404 Not Found -> İSİM BOŞTA
            status.innerHTML = "✅ JACKPOT! Bu OG isim tamamen boşta!";
            status.style.color = "#00FF00";
            
            result.innerHTML = `
                <span style='color: #00FFFF; text-shadow: 0 0 15px #00FFFF;'>${generatedName}</span><br>
                <span style='font-size: 10px; color: #00FF00; letter-spacing: 1px; font-family: sans-serif;'>[ MÜSAİT - HEMEN AL ]</span>
            `;
            result.style.borderColor = "rgba(0, 255, 255, 0.5)";
        } 
        else {
            // Rate limit (429) veya başka bir hata
            status.innerHTML = `❌ API Hatası (Kod: ${response.status})`;
            status.style.color = "#FF0044";
            
            result.innerHTML = `
                <span style='color: #FFD700;'>${generatedName}</span><br>
                <span style='font-size: 10px; color: #888; letter-spacing: 1px; font-family: sans-serif;'>[ SORGULANAMADI ]</span>
            `;
            result.style.borderColor = "rgba(255, 215, 0, 0.3)";
        }

    } catch (e) {
        status.innerHTML = "❌ Bağlantı Hatası! Ağa ulaşılamıyor.";
        status.style.color = "#FF0044";
    } finally {
        // İŞTE BEKLEME ENGELİ (COOLDOWN) BURADA:
        // Sorgu bittikten sonra tam 1 saniye (1000ms) bekleyip butonu açıyoruz
        setTimeout(() => {
            ogCooldown = false;
            runBtn.disabled = false;
            runBtn.style.opacity = "1";
            runBtn.innerText = "İSİM BUL & SORGULA";
        }, 1000);
    }
}

// Dosya çağrıldığında tetikle
window.dispatchEvent(new CustomEvent("boru_og-name_tetikle"));