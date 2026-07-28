// ===========================================================
// 🐺 BÖRÜ PRO - KLAN DAVET SPAMMER (MERKEZİ VERİ BAĞLANTILI)
// ===========================================================

window.addEventListener("boru_clan-invite_tetikle", () => {
    console.log("🐺 Oto Klan Davet Modülü (Merkezi Bağlantı) Aktif!");

    let modal = document.getElementById("boru-clan-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-clan-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(10, 15, 25, 0.95); border: 1px solid #00FFCC; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(0, 255, 204, 0.2); font-family: sans-serif;";
        
        modal.innerHTML = `
            <div style="color: #00FFCC; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(0, 255, 204, 0.5); letter-spacing: 1px;">🐺 OTO KLAN SPAMMER</div>
            
            <div style="background: rgba(0, 255, 204, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(0, 255, 204, 0.2); margin-bottom: 10px;">
                <div style="font-size: 10px; color: #FFD700; margin-bottom: 8px; text-align: center;">⚠️ Başlat'a basın. Ana bot yeni maça girdiğinizi algıladığında davetleri otomatik fırlatır.</div>
                
                <div style="margin-bottom: 10px;">
                    <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: block;">Davet Mesajın:</label>
                    <textarea id="boru-clan-msg" rows="2" placeholder="Selam! Aktif ve rekabetçi klanımıza gelmek ister misin?" style="width: 100%; background: #000; border: 1px solid #00FFCC; color: #FFF; padding: 5px; border-radius: 4px; box-sizing: border-box; resize: vertical; font-family: sans-serif; font-size: 11px;">Aktif oyuncular aranıyor, klanımıza davetlisin!</textarea>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                    <button id="boru-clan-start" style="flex: 1; padding: 8px; background: rgba(0, 255, 204, 0.15); border: 1px solid #00FFCC; color: #00FFCC; font-weight: bold; border-radius: 4px; cursor: pointer; transition: 0.2s;">🎯 SİSTEMİ BAŞLAT</button>
                    <button id="boru-clan-stop" style="flex: 1; padding: 8px; background: rgba(255, 0, 0, 0.15); border: 1px solid #FF0000; color: #FF0000; font-weight: bold; border-radius: 4px; cursor: pointer; display: none;">🛑 ATIŞI KES</button>
                </div>
            </div>
            
            <div style="background: #000; border: 1px solid #333; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; color: #666; border-bottom: 1px dashed #333; padding-bottom: 3px; margin-bottom: 3px; text-transform: uppercase;">[ GATLING LOGU ]</div>
                <div id="boru-clan-logs" style="height: 120px; overflow-y: auto; font-family: monospace; font-size: 10px; color: #00FFCC; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">
                    <div style="color: #888;">> Ana bottan veri bekleniyor...</div>
                </div>
            </div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-clan-start").onclick = sistemiBaslat;
        document.getElementById("boru-clan-stop").onclick = durdurSistemi;
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// --- YARDIMCI METOTLAR ---
let spamAktif = false;
let eleGecirilenIDler = new Set(); 
let islemKuyruguGecikmesi = 0;

function logYaz(mesaj, tip = "info") {
    const logKutusu = document.getElementById("boru-clan-logs");
    if (!logKutusu) return;

    const satir = document.createElement("div");
    let renk = "#00FFCC"; 
    if (tip === "error") renk = "#FF4444";
    if (tip === "warn") renk = "#FFD700";
    if (tip === "success") renk = "#00FF00";
    if (tip === "hack") renk = "#B026FF";
    
    const zaman = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    satir.style.color = renk;
    satir.innerText = `[${zaman}] ${mesaj}`;
    
    logKutusu.appendChild(satir);
    logKutusu.scrollTop = logKutusu.scrollHeight;
}

function sistemiBaslat() {
    if (spamAktif) return;
    spamAktif = true;
    
    // YENİ EKLENDİ: Başlarken de temizlik yapar ki eski veriler takılı kalmasın
    eleGecirilenIDler.clear(); 
    islemKuyruguGecikmesi = 0;

    document.getElementById("boru-clan-start").style.display = "none";
    document.getElementById("boru-clan-stop").style.display = "block";
    logYaz("🎯 Spam motoru devrede! Ana bottan veri bekleniyor...", "warn");
    
    // Eğer o an oyun zaten açıksa ve PLAYERS doluysa direkt sömürsün
    if (typeof PLAYERS !== 'undefined' && PLAYERS.length > 0) {
        logYaz("♻️ Halihazırda yüklü olan oyuncular tarandı.", "info");
        oyuncuIdleriniAyikla(PLAYERS);
    }
}

function durdurSistemi() {
    spamAktif = false;
    document.getElementById("boru-clan-start").style.display = "block";
    document.getElementById("boru-clan-stop").style.display = "none";
    logYaz("🛑 Atış kesildi. Hafıza temizleniyor...", "error");
    
    // YENİ EKLENDİ: Sistemi durdurduğunda çekilen/ele geçirilen ID'leri siler (Unutur)
    eleGecirilenIDler.clear();
    islemKuyruguGecikmesi = 0;
}

// --- ANA BOTTAN GELEN SİNYALİ DİNLEME ---
window.addEventListener("BORU_YENI_OYUNCULAR", (event) => {
    if (!spamAktif) return;
    
    const oyuncuListesi = event.detail; 
    if (oyuncuListesi && oyuncuListesi.length > 0) {
        logYaz("📡 Merkezden yeni oyuncu listesi alındı!", "hack");
        oyuncuIdleriniAyikla(oyuncuListesi);
    }
});

// --- VERİ AYIKLAMA MOTORU ---
function oyuncuIdleriniAyikla(oyuncularArray) {
    let yeniKurbanSayisi = 0;
    const mesaj = document.getElementById("boru-clan-msg").value.trim();

    oyuncularArray.forEach(oyuncu => {
        // Benim ID'm olmasın, gerçek ID'si ve Nick'i olsun
        if (oyuncu && oyuncu.id && oyuncu.username && (typeof PLAYER !== 'undefined' && oyuncu.id !== PLAYER.id)) {
            if (!eleGecirilenIDler.has(oyuncu.id)) {
                eleGecirilenIDler.add(oyuncu.id);
                yeniKurbanSayisi++;
                davetAtesle(oyuncu.id, oyuncu.username, mesaj);
            }
        }
    });

    if (yeniKurbanSayisi > 0) {
        logYaz(`🎯 ${yeniKurbanSayisi} kurbana klan daveti hazırlanıyor...`, "success");
    }
}

// --- SPAM (GATLING) MOTORU ---
function davetAtesle(hedefId, hedefNick, mesaj) {
    islemKuyruguGecikmesi += 3000; 
    
    setTimeout(async () => {
        if (!spamAktif) return; 

        let token = "";
        if (typeof AUTHTOKENS !== 'undefined' && AUTHTOKENS.idToken) {
            token = AUTHTOKENS.idToken;
        } else {
            token = localStorage.getItem("boru_api_wolvesville") || "";
        }

        if (!token) {
            logYaz(`❌ Authorization Token bulunamadı!`, "error");
            durdurSistemi();
            return;
        }

        logYaz(`📨 Davet atılıyor: [${hedefNick}]...`, "info");

        try {
            const response = await fetch("https://core.api-wolvesville.com/clans/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    playerId: hedefId,
                    message: mesaj
                })
            });

            if (response.ok) {
                logYaz(`✅ Başarılı: ${hedefNick}`, "success");
            } else if (response.status === 400 || response.status === 403) {
                logYaz(`⚠️ Kapalı/Klanda: ${hedefNick}`, "warn");
            } else {
                logYaz(`❌ API Hatası (${response.status}) -> ${hedefNick}`, "error");
            }
        } catch (error) {
            logYaz(`💥 Ağ Hatası: ${hedefNick}`, "error");
        }

    }, islemKuyruguGecikmesi);

    setTimeout(() => {
        if (islemKuyruguGecikmesi > 0) islemKuyruguGecikmesi -= 3000;
        
        // YENİ EKLENDİ: Kuyruk 0'a ulaştığında (Tüm davetler bittiğinde) hafızayı temizle.
        // Böylece bot aynı maça bir daha girerse, "Bunları zaten eklemiştim" demeyip tekrar atar.
        if (islemKuyruguGecikmesi <= 0 && spamAktif) {
            logYaz("🧹 Davet kuyruğu bitti, liste sıfırlanıyor...", "info");
            eleGecirilenIDler.clear();
        }
    }, islemKuyruguGecikmesi + 1500);
}

// Dosya çağrıldığında otomatik tetikle
window.dispatchEvent(new CustomEvent("boru_clan-invite_tetikle"));