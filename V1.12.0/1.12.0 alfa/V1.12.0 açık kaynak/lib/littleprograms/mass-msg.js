// ===========================================================
// 💬 BÖRÜ PRO - TOPLU ÖZEL MESAJ SPAMMER (MASS DM)
// ===========================================================

(() => { // KORUMA KALKANI BAŞLANGICI (SCOPE ISOLATION)

    window.addEventListener("boru_mass-msg_tetikle", () => {
        console.log("💬 Toplu DM Modülü Aktif!");

        let modal = document.getElementById("boru-massdm-modal");
        
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "boru-massdm-modal";
            modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(15, 5, 20, 0.95); border: 1px solid #ff00a0; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(255, 0, 160, 0.2); font-family: sans-serif;";
            
            modal.innerHTML = `
                <div style="color: #ff00a0; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(255, 0, 160, 0.5); letter-spacing: 1px;">💬 ARKADAŞLARA TOPLU MESAJ (MASS DM)</div>
                
                <div style="background: rgba(255, 0, 160, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 0, 160, 0.2); margin-bottom: 10px;">
                    <div style="font-size: 10px; color: #FFD700; margin-bottom: 8px; text-align: center;">⚠️ Listedeki tüm arkadaşlarına sırayla mesaj gönderir. (Ban yememek için 2.5 saniye ara ile atar).</div>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 10px; color: #aaa; font-weight: bold; margin-bottom: 3px; display: flex; justify-content: space-between;">
                            <span>Gönderilecek Mesaj:</span>
                            <span id="boru-massdm-count" style="color:#ff00a0;">0 Arkadaş</span>
                        </label>
                        <textarea id="boru-massdm-msg" rows="2" placeholder="Örn: Kanka oyuna gel lobi kurdum..." style="width: 100%; background: #000; border: 1px solid #ff00a0; color: #FFF; padding: 5px; border-radius: 4px; box-sizing: border-box; resize: vertical; font-family: sans-serif; font-size: 11px;">sa kanka lobiye gel seri!</textarea>
                    </div>

                    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <button id="boru-massdm-start" style="flex: 1; padding: 8px; background: rgba(255, 0, 160, 0.15); border: 1px solid #ff00a0; color: #ff00a0; font-weight: bold; border-radius: 4px; cursor: pointer; transition: 0.2s;">🚀 HERKESE FIRLAT</button>
                        <button id="boru-massdm-stop" style="flex: 1; padding: 8px; background: rgba(255, 0, 0, 0.15); border: 1px solid #FF0000; color: #FF0000; font-weight: bold; border-radius: 4px; cursor: pointer; display: none;">🛑 GÖNDERİMİ KES</button>
                    </div>
                </div>
                
                <div style="background: #000; border: 1px solid #333; border-radius: 4px; padding: 5px;">
                    <div style="font-size: 9px; color: #666; border-bottom: 1px dashed #333; padding-bottom: 3px; margin-bottom: 3px; text-transform: uppercase;">[ GÖNDERİM LOGU ]</div>
                    <div id="boru-massdm-logs" style="height: 120px; overflow-y: auto; font-family: monospace; font-size: 10px; color: #ff00a0; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">
                        <div style="color: #888;">> Beklemede... Fırlat butonuna basın.</div>
                    </div>
                </div>
            `;
            
            const anaPanel = document.getElementById("boru-panel");
            if (anaPanel) anaPanel.appendChild(modal);

            document.getElementById("boru-massdm-start").onclick = baslatMassDM;
            document.getElementById("boru-massdm-stop").onclick = durdurMassDM;
            
            // Modal ilk açıldığında arkadaş sayısını göster
            guncelleArkadasSayisi();
        }

        modal.style.display = modal.style.display === "block" ? "none" : "block";
        if(modal.style.display === "block") guncelleArkadasSayisi();
    });

    // --- YARDIMCI METOTLAR ---
    let spamAktif = false;
    const uyut = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function logYaz(mesaj, tip = "info") {
        const logKutusu = document.getElementById("boru-massdm-logs");
        if (!logKutusu) return;

        const satir = document.createElement("div");
        let renk = "#ff00a0"; 
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

    // 🔥 YENİ: Tarayıcıdaki tüm arkadaş kasalarını toplayan fonksiyon
    function getTumArkadaslar() {
        let allFriendsMap = {}; // Aynı adamı iki kere eklememek için (Hesap çakışmaları)
        
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            // İsim tam uymasa da 'friends-cache-storage-' ile başlayan her şeyi bul
            if (key && key.startsWith('friends-cache-storage-')) {
                try {
                    let data = JSON.parse(localStorage.getItem(key));
                    // Objeleri birleştir (Aynı ID'li adam varsa üzerine yazar, kopya engellenir)
                    Object.assign(allFriendsMap, data);
                } catch(e) {
                    console.error("Kasa okuma hatası:", e);
                }
            }
        }
        
        return Object.values(allFriendsMap); // Listeye çevirip geri yolla
    }

    function guncelleArkadasSayisi() {
        const friendsArray = getTumArkadaslar();
        document.getElementById("boru-massdm-count").innerText = `${friendsArray.length} Arkadaş`;
    }

    async function durdurMassDM() {
        spamAktif = false;
        document.getElementById("boru-massdm-start").style.display = "block";
        document.getElementById("boru-massdm-stop").style.display = "none";
        logYaz("🛑 İşlem durduruldu. Kalan mesajlar iptal edildi.", "error");
    }

    // --- ANA DM MOTORU (GATLING) ---
    async function baslatMassDM() {
        if (spamAktif) return;
        
        const mesajMetni = document.getElementById("boru-massdm-msg").value.trim();
        if (!mesajMetni) {
            logYaz("⚠️ Kanka önce göndereceğin mesajı yazmalısın!", "warn");
            return;
        }

        // Token Kontrolü
        let token = "";
        if (typeof AUTHTOKENS !== 'undefined' && AUTHTOKENS.idToken) {
            token = AUTHTOKENS.idToken;
        } else {
            token = localStorage.getItem("boru_api_wolvesville") || "";
        }

        if (!token) {
            logYaz(`❌ Authorization Token bulunamadı! Hesaba giriş yapmış olmalısın.`, "error");
            return;
        }

        // 🔥 Yeni fonksiyonla tüm arkadaşları çek
        let friendsArray = getTumArkadaslar();

        if (friendsArray.length === 0) {
            logYaz("❌ Hafızada arkadaş bulunamadı! (Oyunun Arkadaşlar sekmesine bir kere girip çık)", "error");
            return;
        }

        // Arayüzü Ayarla
        spamAktif = true;
        document.getElementById("boru-massdm-start").style.display = "none";
        document.getElementById("boru-massdm-stop").style.display = "block";
        document.getElementById("boru-massdm-logs").innerHTML = ""; // Logları temizle

        logYaz(`🚀 DM Motoru Ateşlendi! Toplam Hedef: ${friendsArray.length} Kişi`, "hack");

        // --- ASYNC DÖNGÜ (KUSURSUZ FREN SİSTEMLİ) ---
        let basariliSayisi = 0;
        
        for (let i = 0; i < friendsArray.length; i++) {
            // Eğer döngü sırasında "Durdur" butonuna basıldıysa anında kır!
            if (!spamAktif) break;

            const arkadas = friendsArray[i];
            
            // Sadece ID ve Username'i olan geçerli kayıtları al
            if (arkadas && arkadas.id && arkadas.username) {
                logYaz(`📨 [${i+1}/${friendsArray.length}] Atılıyor -> ${arkadas.username}`, "info");

                try {
                    // Senin API Payload Formatın
                    const payload = {
                        targetId: arkadas.id,
                        msg: mesajMetni,
                        date: new Date().toISOString() // O anın canlı tarihini bas
                    };

                    const response = await fetch("https://core.api-wolvesville.com/privateChat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` 
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        logYaz(`✅ İletildi: ${arkadas.username}`, "success");
                        basariliSayisi++;
                    } else if (response.status === 429) {
                        logYaz(`⚠️ Rate Limit (Çok Hızlı)! Biraz bekleniyor...`, "warn");
                        await uyut(5000); // Eğer sınır yersek ekstra 5 saniye bekle
                        i--; // Bu adamı atlayamamak için sayacı bir geri al
                        continue;
                    } else if (response.status === 400 || response.status === 403) {
                        logYaz(`⚠️ Hata 400/403: Büyük ihtimalle bu hesaba arkadaş değilsin (Başka hesap kalıntısı).`, "warn");
                    } else {
                        logYaz(`❌ Hata (${response.status}): ${arkadas.username}`, "error");
                    }
                } catch (error) {
                    logYaz(`💥 Bağlantı Koptu: ${arkadas.username}`, "error");
                }

                // Her mesaj arası 2.5 saniye bekle (Ban Yememek İçin Altın Kural)
                if (i < friendsArray.length - 1 && spamAktif) {
                    await uyut(2500); 
                }
            }
        }

        // Döngü bittiğinde veya durdurulduğunda
        if (spamAktif) {
            logYaz(`🏁 İşlem Tamamlandı! Toplam ${basariliSayisi} kişiye mesaj iletildi.`, "hack");
            durdurMassDM();
        }
    }

    // Dosya çağrıldığında otomatik tetikle
    window.dispatchEvent(new CustomEvent("boru_mass-msg_tetikle"));

})(); // KORUMA KALKANI BİTİŞİ