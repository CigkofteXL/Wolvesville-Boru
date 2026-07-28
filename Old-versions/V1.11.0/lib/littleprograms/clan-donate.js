// ===========================================================
// 🏛️ BÖRÜ PRO - KLAN BAĞIŞ OTOMASYONU (DUAL MOD: SESSİZ + ARAYÜZ)
// ===========================================================

// -----------------------------------------------------------
// 1. KISIM: SESSİZ MOTOR (Sayfa yüklendiği an arka planda başlar)
// -----------------------------------------------------------
function bagisKontrolDöngüsü() {
    if (window.boruDonateInterval) clearInterval(window.boruDonateInterval);

    console.log("🐺 BÖRÜ SİNSİ MOTOR: Oto-Bağış arka planda devrede!");

    // İlk kontrolü hemen yap
    bagisKontroluYap();

    // 60 saniyede bir kontrol etmeye devam et
    window.boruDonateInterval = setInterval(bagisKontroluYap, 60000); 
}

async function bagisKontroluYap() {
    console.log("🏛️ BÖRÜ: Arka plan kontrolü yapılıyor..."); // Bu logu ekle
    const rawConfig = localStorage.getItem('boru-clan-donate-config');
    if (!rawConfig) return; // Ayar yoksa uyu

    const config = JSON.parse(rawConfig);
    const simdi = new Date();
    
    const [hedefSaat, hedefDakika] = config.time.split(':').map(Number);
    const hedefZaman = new Date();
    hedefZaman.setHours(hedefSaat, hedefDakika, 0, 0);

    const sonBagisMs = parseInt(localStorage.getItem('boru-last-donation-date') || "0");
    const sonBagisTarihi = new Date(sonBagisMs);
    let bagisYapilmaliMi = false;

    // --- 🔧 DÜZELTİLMİŞ KUSURSUZ TELAFİ MANTIĞI ---
    
    // Kural 1: Gün içindeki normal saati geldiğinde
    if (simdi.getTime() >= hedefZaman.getTime()) {
        if (sonBagisTarihi.toLocaleDateString('tr-TR') !== simdi.toLocaleDateString('tr-TR')) {
            bagisYapilmaliMi = true;
        }
    }

    // Kural 2: Dünü kaçırıp ertesi gün sabah oyuna girdiyse (Telafi Atışı)
    if (sonBagisMs > 0) {
        const periyotMs = config.period * 24 * 60 * 60 * 1000;
        // 2 saat esneklik payı bırakıyoruz ki milisaniye sapmalarına takılmasın
        if ((simdi.getTime() - sonBagisMs) >= (periyotMs - (2 * 60 * 60 * 1000))) {
            bagisYapilmaliMi = true;
        }
    }

    // Bağış zamanı gelmediyse motoru yorma, sessizce çık
    if (!bagisYapilmaliMi) return;

    let token = "";
    // Önce Börü'nün kendi token değişkenine bak
    if (typeof AUTHTOKENS !== 'undefined' && AUTHTOKENS.idToken) {
        token = AUTHTOKENS.idToken;
    } else {
        token = localStorage.getItem("boru_api_wolvesville") || "";
    }

    if (!token) {
        // Sessiz moddaysa sadece konsola atar, arayüz açıksa oraya yazar
        logBagisArayuzYadaKonsol("❌ Bağış Beklemede: Token bulunamadı. Oyuna giriş yapılması bekleniyor.", "error");
        return;
    }

    const isGem = config.type === "gems";
    const typeStr = isGem ? "💎 Elmas" : "🪙 Altın";
    
    const endpoint = isGem 
        ? `https://core.api-wolvesville.com/clans/gems/donate2?gems=${config.amount}`
        : `https://core.api-wolvesville.com/clans/gold/donate2?gold=${config.amount}`;

    logBagisArayuzYadaKonsol(`🚀 Bağış sırası geldi! ${config.amount} ${typeStr} fırlatılıyor...`, "warn");

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ comment: config.note || "" })
        });

        if (response.ok) {
            const basariZamani = new Date().getTime();
            localStorage.setItem('boru-last-donation-date', basariZamani.toString());
            
            // Arayüz açıksa güncelle
            if (document.getElementById("boru-last-donate-info")) {
                sonBagisBilgisiniYaz();
            }
            
            logBagisArayuzYadaKonsol(`✅ BAŞARILI: ${config.amount} ${typeStr} klan kasasına girdi!`, "success");
        } else if (response.status === 400 || response.status === 403) {
            const err = await response.json().catch(() => ({}));
            logBagisArayuzYadaKonsol(`❌ Hata 400/403: ${err.message || 'Yetersiz bakiye veya klan yok.'}`, "error");
        } else {
            logBagisArayuzYadaKonsol(`❌ Sunucu Hatası (${response.status})`, "error");
        }
    } catch (e) {
        logBagisArayuzYadaKonsol("💥 Bağlantı koptu, bir sonraki dakikada tekrar denenecek.", "error");
    }
}

// Logları arayüz açıksa oraya, kapalıysa konsola basar
function logBagisArayuzYadaKonsol(mesaj, tip = "info") {
    const logBox = document.getElementById("boru-donate-logs");
    const zaman = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    const tamMesaj = `[${zaman}] ${mesaj}`;

    if (logBox) {
        let color = "#FFD700";
        if (tip === "error") color = "#FF4444";
        if (tip === "success") color = "#00FF00";
        if (tip === "warn") color = "#FFA500";

        const entry = document.createElement("div");
        entry.style.color = color;
        entry.innerText = tamMesaj;
        logBox.appendChild(entry);
        logBox.scrollTop = logBox.scrollHeight;
    } else {
        // Arayüz kapalıyken (sessiz mod) sadece konsola yaz
        console.log(`🏛️ BÖRÜ OTO-BAĞIŞ: ${tamMesaj}`);
    }
}

// Dosya yüklendiği an sessiz motoru başlat!
bagisKontrolDöngüsü();


// -----------------------------------------------------------
// 2. KISIM: ARAYÜZ (Sadece menü butonuna tıklandığında açılır)
// -----------------------------------------------------------
window.addEventListener("boru_clan-donate_tetikle", () => {
    let modal = document.getElementById("boru-donate-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-donate-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(20, 15, 5, 0.95); border: 1px solid #FFD700; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(255, 215, 0, 0.2); font-family: sans-serif; transition: all 0.3s ease;";
        
        modal.innerHTML = `
            <div id="boru-donate-header" style="color: #FFD700; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); letter-spacing: 1px; transition: color 0.3s ease, text-shadow 0.3s ease;">🏛️ OTO KLAN BAĞIŞ SİSTEMİ</div>
            
            <div id="boru-donate-inner-box" style="background: rgba(255, 215, 0, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 215, 0, 0.2); margin-bottom: 10px; transition: all 0.3s ease;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div>
                        <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Bağış Tipi:</label>
                        <select id="boru-donate-type" class="boru-donate-input" style="width: 100%; background: #000; border: 1px solid #FFD700; color: #FFF; padding: 5px; border-radius: 4px; font-size: 11px; outline: none; transition: border-color 0.3s ease;">
                            <option value="gold">🪙 Altın (Gold)</option>
                            <option value="gems">💎 Elmas (Gem)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Bağış Saati:</label>
                        <input type="time" id="boru-donate-time" class="boru-donate-input" value="20:00" style="width: 100%; background: #000; border: 1px solid #FFD700; color: #FFF; padding: 4px; border-radius: 4px; box-sizing: border-box; text-align: center; outline: none; transition: border-color 0.3s ease;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 8px;">
                    <div>
                        <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Miktar:</label>
                        <input type="number" id="boru-donate-amount" class="boru-donate-input" value="500" min="1" style="width: 100%; background: #000; border: 1px solid #FFD700; color: #FFD700; padding: 5px; border-radius: 4px; box-sizing: border-box; text-align: center; font-weight: bold; outline: none; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Bağış Notu (Opsiyonel):</label>
                        <input type="text" id="boru-donate-note" class="boru-donate-input" placeholder="Börü ordusundan selamlar!" style="width: 100%; background: #000; border: 1px solid #FFD700; color: #FFF; padding: 5px; border-radius: 4px; box-sizing: border-box; font-size: 11px; outline: none; transition: border-color 0.3s ease;">
                    </div>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Tekrar Periyodu:</label>
                    <select id="boru-donate-period" class="boru-donate-input" style="width: 100%; background: #000; border: 1px solid #FFD700; color: #FFF; padding: 5px; border-radius: 4px; font-size: 11px; outline: none; transition: border-color 0.3s ease;">
                        <option value="1">Her Gün</option>
                        <option value="3">3 Günde Bir</option>
                        <option value="7">Haftalık (7 Gün)</option>
                        <option value="30">Aylık (30 Gün)</option>
                    </select>
                </div>

                <button id="boru-donate-save" style="width: 100%; padding: 10px; background: rgba(255, 215, 0, 0.15); border: 1px solid #FFD700; color: #FFD700; font-weight: 900; letter-spacing: 1px; border-radius: 4px; cursor: pointer; transition: all 0.3s ease;">💾 PROGRAMI KAYDET</button>
            </div>
            
            <div style="background: #000; border: 1px solid #333; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; color: #666; border-bottom: 1px dashed #333; padding-bottom: 3px; margin-bottom: 3px; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center;">
                    <span>[ BAĞIŞ TAKİP SİSTEMİ ]</span>
                    <div>
                        <span id="boru-donate-reset" style="cursor:pointer; margin-right: 8px; font-size: 12px; transition: transform 0.2s;" title="Geçmişi Sıfırla (Bugün tekrar test edebilmek için)">🔄</span>
                        <span id="boru-last-donate-info" style="color: #FFD700; transition: color 0.3s ease;">Son Bağış: Yok</span>
                    </div>
                </div>
                <div id="boru-donate-logs" style="height: 100px; overflow-y: auto; font-family: monospace; font-size: 10px; color: #FFD700; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">
                    <div id="boru-donate-status-line" style="color: #888;">> Arka plan motoru devrede. Ayarları buradan yönetebilirsiniz.</div>
                </div>
            </div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-donate-save").onclick = bagisPrograminiKaydet;
        
        document.getElementById("boru-donate-reset").onclick = function() {
            localStorage.removeItem('boru-last-donation-date');
            sonBagisBilgisiniYaz();
            
            this.style.transform = "rotate(360deg)";
            setTimeout(() => { this.style.transform = "rotate(0deg)"; }, 300);
            
            logBagisArayuzYadaKonsol("🔄 Hafıza sıfırlandı! Ayarladığın saat geldiğinde bot bugün tekrar bağış atacak.", "warn");
            // Motoru hemen sıfırlayıp tetikle
            bagisKontrolDöngüsü();
        };

        const changeTheme = (type) => {
            const isGem = type === "gems";
            const mainColor = isGem ? "#fe4080" : "#FFD700"; 
            const bgColor = isGem ? "rgba(254, 64, 128, 0.05)" : "rgba(255, 215, 0, 0.05)";
            const borderColor = isGem ? "rgba(254, 64, 128, 0.2)" : "rgba(255, 215, 0, 0.2)";
            const btnBgColor = isGem ? "rgba(254, 64, 128, 0.15)" : "rgba(255, 215, 0, 0.15)";
            
            modal.style.borderColor = mainColor;
            modal.style.boxShadow = `0 0 20px ${borderColor}`;
            document.getElementById("boru-donate-header").style.color = mainColor;
            document.getElementById("boru-donate-header").style.textShadow = `0 0 10px ${borderColor}`;
            document.getElementById("boru-last-donate-info").style.color = mainColor;
            
            const innerBox = document.getElementById("boru-donate-inner-box");
            innerBox.style.background = bgColor;
            innerBox.style.borderColor = borderColor;
            
            const inputs = document.querySelectorAll(".boru-donate-input");
            inputs.forEach(input => { input.style.borderColor = mainColor; });
            document.getElementById("boru-donate-amount").style.color = mainColor;
            
            const saveBtn = document.getElementById("boru-donate-save");
            saveBtn.style.borderColor = mainColor;
            saveBtn.style.color = mainColor;
            saveBtn.style.background = btnBgColor;
        };

        document.getElementById("boru-donate-type").addEventListener("change", function() {
            const miktarInput = document.getElementById("boru-donate-amount");
            if (this.value === "gems") {
                miktarInput.value = "10";
            } else {
                miktarInput.value = "500";
            }
            changeTheme(this.value);
        });

        // Modül Yüklendiğinde Ayarları Arayüze Bas
        bagisAyariniArayuzeBas(changeTheme);
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

function bagisAyariniArayuzeBas(themeCallback) {
    const saved = localStorage.getItem('boru-clan-donate-config');
    sonBagisBilgisiniYaz();

    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById("boru-donate-type").value = config.type || "gold";
        document.getElementById("boru-donate-amount").value = config.amount;
        document.getElementById("boru-donate-time").value = config.time;
        document.getElementById("boru-donate-note").value = config.note;
        document.getElementById("boru-donate-period").value = config.period;
        
        if(themeCallback) themeCallback(config.type || "gold");
    }
}

function sonBagisBilgisiniYaz() {
    const sonBagisMs = parseInt(localStorage.getItem('boru-last-donation-date') || "0");
    const infoSpan = document.getElementById("boru-last-donate-info");
    if (sonBagisMs > 0 && infoSpan) {
        const tarih = new Date(sonBagisMs);
        infoSpan.innerText = `Son Başarılı: ${tarih.toLocaleDateString('tr-TR')} ${tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (infoSpan) {
        infoSpan.innerText = "Son Bağış: Yok"; 
    }
}

function bagisPrograminiKaydet() {
    const timeInput = document.getElementById("boru-donate-time").value;
    const saatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!saatRegex.test(timeInput)) {
        alert("❌ Geçersiz saat formatı! Lütfen 00:00 ile 23:59 arasında geçerli bir saat giriniz.");
        return;
    }

    const config = {
        type: document.getElementById("boru-donate-type").value,
        amount: parseInt(document.getElementById("boru-donate-amount").value),
        time: timeInput,
        note: document.getElementById("boru-donate-note").value,
        period: parseInt(document.getElementById("boru-donate-period").value)
    };

    localStorage.setItem('boru-clan-donate-config', JSON.stringify(config));
    const typeStr = config.type === "gems" ? "💎 Elmas" : "🪙 Altın";
    
    logBagisArayuzYadaKonsol(`💾 Ayarlar kaydedildi. Saat ${config.time}'de ${config.amount} ${typeStr} fırlatılacak.`, "warn");
    
    // Ayar değiştiği için motoru tazeleyip hemen ilk kontrolü vurduruyoruz
    bagisKontrolDöngüsü();
}