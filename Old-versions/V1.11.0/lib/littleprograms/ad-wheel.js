// ===========================================================
// 🎡 BÖRÜ PRO - TAM OTOMATİK ÇARK BOTU (DEBUGGER TIKLAMALI)
// ===========================================================

window.addEventListener("boru_ad-wheel_tetikle", () => {
    console.log("🎡 Tarayıcı İçi Çark Botu Modülü Aktif (Debugger Bağlantılı)!");

    let modal = document.getElementById("boru-wheel-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-wheel-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(15, 15, 10, 0.95); border: 1px solid #FF8C00; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(255, 140, 0, 0.2); font-family: sans-serif;";
        
        modal.innerHTML = `
            <div style="color: #FF8C00; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(255, 140, 0, 0.5); letter-spacing: 1px;">🎡 OTO ÇARK BOTU</div>
            
            <div style="background: rgba(255, 140, 0, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 140, 0, 0.2); margin-bottom: 10px;">
                <div style="font-size: 10px; color: #FFD700; margin-bottom: 8px; text-align: center;">⚠️ Oyun açıkken ve hesaba giriş yapmışken başlatın.</div>
                
                <button id="boru-wheel-run" style="width: 100%; padding: 10px; background: rgba(255, 140, 0, 0.15); border: 1px solid #FF8C00; color: #FF8C00; font-weight: 900; letter-spacing: 1px; border-radius: 4px; cursor: pointer; transition: 0.2s;">🚀 ÇARK BOTUNU BAŞLAT</button>
                <button id="boru-wheel-stop" style="width: 100%; padding: 6px; background: rgba(255, 0, 0, 0.15); border: 1px solid #FF0000; color: #FF0000; font-weight: bold; border-radius: 4px; cursor: pointer; margin-top: 5px; display: none;">🛑 DURDUR</button>
            </div>
            
            <div style="background: #000; border: 1px solid #333; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; color: #666; border-bottom: 1px dashed #333; padding-bottom: 3px; margin-bottom: 3px; text-transform: uppercase;">[ BOT DURUMU ]</div>
                <div id="boru-wheel-logs" style="height: 120px; overflow-y: auto; font-family: monospace; font-size: 10px; color: #00FF00; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">
                    <div style="color: #888;">> Beklemede... DOM taraması için hazır.</div>
                </div>
            </div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-wheel-run").onclick = baslatCarkBotu;
        document.getElementById("boru-wheel-stop").onclick = durdurCarkBotu;
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// --- YARDIMCI METOTLAR ---

let botCalisiyor = false;
const uyut = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function logYaz(mesaj, tip = "info") {
    const logKutusu = document.getElementById("boru-wheel-logs");
    if (!logKutusu) return;

    const satir = document.createElement("div");
    let renk = "#00FF00"; 
    if (tip === "error") renk = "#FF4444";
    if (tip === "warn") renk = "#FFD700";
    if (tip === "success") renk = "#00FFFF";
    
    const zaman = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    satir.style.color = renk;
    satir.innerText = `[${zaman}] ${mesaj}`;
    
    logKutusu.appendChild(satir);
    logKutusu.scrollTop = logKutusu.scrollHeight;
}

// XPATH ile elementi bulur
function xpathBul(xpath, anaEkran = document) {
    try {
        return document.evaluate(xpath, anaEkran, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (e) {
        return null;
    }
}

// --- YENİ TIKLAMA MOTORU (KÖPRÜ ÜZERİNDEN BACKGROUND'A EMİR GÖNDERİR) ---
async function tiklaVeGec(xpath, beklemeSuresi = 1500) {
    let eleman = xpathBul(xpath);
    let absX = 0;
    let absY = 0;
    let bulundu = false;

    // Eğer ana DOM'da yoksa ve iframe içi reklam çarpısı aranıyorsa iframeleri tara
    if (!eleman && (xpath.includes("dismiss-button") || xpath.includes("close-button"))) {
        const iframes = document.querySelectorAll("iframe");
        for (let iframe of iframes) {
            try {
                let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                eleman = xpathBul(xpath, innerDoc);
                if (eleman) {
                    let iframeRect = iframe.getBoundingClientRect();
                    let elemanRect = eleman.getBoundingClientRect();
                    
                    absX = iframeRect.left + elemanRect.left + (elemanRect.width / 2);
                    absY = iframeRect.top + elemanRect.top + (elemanRect.height / 2);
                    bulundu = true;
                    break;
                }
            } catch (e) {
                // CORS hatası
            }
        }
    } else if (eleman) {
        let rect = eleman.getBoundingClientRect();
        absX = rect.left + (rect.width / 2);
        absY = rect.top + (rect.height / 2);
        bulundu = true;
    }

    if (bulundu) {
        let finalX = Math.round(absX);
        let finalY = Math.round(absY);

        // İŞTE ÇÖZÜM BURASI: Doğrudan background'a değil, açık havaya fırlatıyoruz. 
        // Content.js bunu kapıp background'a iletecek!
        window.postMessage({ action: "BORU_NATIVE_CLICK", x: finalX, y: finalY }, "*");
        
        await uyut(beklemeSuresi);
        return true;
    }
    
    return false;
}

// Elementin olup olmadığını kontrol eder
async function elemanVarMi(xpath) {
    return xpathBul(xpath) !== null;
}

// --- ANA DÖNGÜ ---

async function durdurCarkBotu() {
    botCalisiyor = false;
    logYaz("Kullanıcı müdahalesi: Döngü kırılıyor...", "warn");
    document.getElementById("boru-wheel-run").style.display = "block";
    document.getElementById("boru-wheel-stop").style.display = "none";
}

async function baslatCarkBotu() {
    if (botCalisiyor) return;
    
    botCalisiyor = true;
    document.getElementById("boru-wheel-run").style.display = "none";
    document.getElementById("boru-wheel-stop").style.display = "block";
    document.getElementById("boru-wheel-logs").innerHTML = "";

    logYaz("🚀 Debugger Bot başlatıldı! Ekrana dokunmayın.", "success");

    let carkMenusuAcildi = false;
    let hakbitti = false;

    while (botCalisiyor && !hakbitti) {
        try {
            // 1. AŞAMA: MENÜYÜ AÇMA
            if (!carkMenusuAcildi) {
                logYaz("🎒 Envanter menüsü aranıyor...");
                await tiklaVeGec("//div[contains(@class, 'css-146c3p1') and contains(text(), 'INVENTORY')]", 2000);

                logYaz("💰 Free Gold menüsü aranıyor...");
                let goldAcildi = await tiklaVeGec("//div[contains(@class, 'css-146c3p1') and contains(text(), 'Free gold!')]", 2000);
                
                if (goldAcildi || await elemanVarMi("//div[contains(text(), 'WATCH VIDEO')]")) {
                    carkMenusuAcildi = true;
                    logYaz("✅ Çark menüsü açıldı.", "success");
                }
            }

            if (!botCalisiyor) break;

            // 2. AŞAMA: REKLAM İZLEME BAŞLATMA
            let izleBasildi = await tiklaVeGec("//div[contains(@class, 'css-146c3p1') and contains(text(), 'WATCH VIDEO')]", 2500);
            if (izleBasildi) {
                logYaz("📺 Reklam izle tuşuna (Hardware Click) basıldı!", "info");
            }

            // 3. AŞAMA: SAYAÇ KONTROLÜ
            let sayacVarMi = await elemanVarMi("//*[@id='count-down-text']");
            if (sayacVarMi) {
                logYaz("⏳ Reklam bitmesi bekleniyor...", "warn");
                await uyut(3000);
                continue; 
            }

            // 4. AŞAMA: REKLAMI KAPATMA
            let dismissKapatildi = await tiklaVeGec("//*[@id='dismiss-button']", 1500);
            let closeKapatildi = await tiklaVeGec("//*[@id='close-button']", 1500);
            
            if (dismissKapatildi || closeKapatildi) {
                logYaz("❌ Reklam çarpısına basıldı.", "info");
            }

            if (!botCalisiyor) break;

            // 5. AŞAMA: ÇARKI ÇEVİRME
            let spinBasildi = await tiklaVeGec("//div[contains(@class, 'css-146c3p1') and contains(text(), 'SPIN')]", 2000);
            if (spinBasildi) {
                logYaz("🎰 Çark çevrildi! Bekleniyor...", "success");
                await uyut(6000); 
                await uyut(2000); 
            }

            // 6. AŞAMA: LİMİT KONTROLÜ
            let limitUyarisi = await elemanVarMi("//div[contains(text(), 'New rewards will be available')]");
            if (limitUyarisi) {
                logYaz("🛑 Günlük limit doldu! İşlem bitti.", "error");
                hakbitti = true;
                break;
            }

            await uyut(1500); 

        } catch (hata) {
            logYaz(`💥 Hata: ${hata.message}`, "error");
            await uyut(2000);
        }
    }

    botCalisiyor = false;
    document.getElementById("boru-wheel-run").style.display = "block";
    document.getElementById("boru-wheel-stop").style.display = "none";
    logYaz("🏁 Bot işlemi sonlandırıldı.", "warn");
}

// Dosya çağrıldığında otomatik tetikle
window.dispatchEvent(new CustomEvent("boru_ad-wheel_tetikle"));