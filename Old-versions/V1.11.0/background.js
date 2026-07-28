// --- BÖRÜ: BACKGROUND.JS (ANA BEYİN - VDS HARDCORE MODU) ---

// 1. Session Storage Kilit Açma (Content scriptlerin erişimi için)
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

// 🔥 BÖRÜ HAFIZA: Hangi sekmelerde debugger aktif takip edelim (Performans için)
const activeDebuggers = new Set();

// 2. Multi-Tab Keskin Nişancı Tıklama Sistemi (KAPANMAYAN TÜNEL)
async function click(tabId, x, y, button = 'left') {
    const target = { tabId: tabId };

    // AŞAMA 1: BAĞLANTI KONTROLÜ
    try {
        // Eğer bu sekmeye daha önce bağlanmadıysak bağlan
        if (!activeDebuggers.has(tabId)) {
            await chrome.debugger.attach(target, '1.2');
            activeDebuggers.add(tabId); // Hafızaya yaz
            console.log(`[Börü] Tab ${tabId} için tünel açıldı ve KALICI olarak sabitlendi.`);
        }
    } catch (e) {
        // Chrome "Ben zaten bağlıyım" diye ağlarsa, hatayı yut ve listemize ekle
        if (e.message && e.message.includes('already attached')) {
            activeDebuggers.add(tabId);
        } else {
            console.error(`[Börü] Attach Hatası Tab ${tabId}:`, e);
            return; // Başka kritik bir hata varsa tıklamaya çalışma, sistemi koru
        }
    }

    // AŞAMA 2: ATEŞLEME (Gecikmesiz ve Kapanmaz)
    try {
        // Açık olan tünelden mermileri (tıklamaları) peş peşe fırlat!
        // DETACH (Kapatma) işlemi veya bekleme YOK! Saf performans.
        await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mousePressed', button, x, y, clickCount: 1 });
        await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseReleased', button, x, y, clickCount: 1 });
    } catch (error) {
        console.error(`[Börü] Tıklama Gönderim Hatası Tab ${tabId}:`, error);
    }
}

// 🛡️ GÜVENLİK: Eğer sekme (Tab) müşteri tarafından kapatılırsa hafızayı temizle ki RAM dolmasın
chrome.tabs.onRemoved.addListener((tabId) => {
    activeDebuggers.delete(tabId);
});
// 🛡️ GÜVENLİK 2: Eğer müşteri "Cancel" butonuna basıp tüneli koparırsa hafızayı sıfırla!
chrome.debugger.onDetach.addListener((source, reason) => {
    if (source.tabId) {
        activeDebuggers.delete(source.tabId); // Hafızadan sil
        console.log(`[Börü] Tünel koptu/kapatıldı (Tab ${source.tabId}). Sebep: ${reason}. İlk emirde yeniden açılacak.`);
    }
});

// 3. Ana Mesaj Dinleyicisi (Tüm İletişim Buradan Geçer)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // --- TIKLAMA SİSTEMİ YAKALAYICI ---
    if (request.x !== undefined && request.y !== undefined && !request.action) {
        const hedefSekmeId = sender.tab?.id;
        if (!hedefSekmeId) return; 

        // Log kalabalık yapmasın diye istersen alttakini kapatabilirsin
        // console.log(`[Börü] Tıklama Emri | Tab ID: ${hedefSekmeId} | Koordinat: ${request.x}, ${request.y}`);
        
        click(hedefSekmeId, request.x, request.y);
        return true; 
    }
    
    // Eğer biri sekme ID'sini sorarsa cevapla
    if (request.action === "GET_TAB_ID") {
        sendResponse({ tabId: sender.tab.id });
        return true; 
    }
    
    // --- DİSCORD KURYE SİSTEMİ (CSP BYPASS) ---
    if (request.action === "sendToDiscord") {
        fetch(request.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request.data)
        })
        .then(res => console.log("[Börü Discord] Status:", res.status))
        .catch(err => console.error("[Börü Discord] Error:", err));
        
        return true; 
    }
});

// ===========================================================
// 🐺 BÖRÜ PRO - BACKGROUND PROXY & SESSION MANAGER
// ===========================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. PROXY AYARLAMA EMRİ GELDİĞİNDE
    if (request.action === "BORU_SET_PROXY") {
        let config = {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: request.scheme, // "http", "https", "socks4", "socks5"
                    host: request.host,
                    port: parseInt(request.port)
                },
                bypassList: ["localhost", "127.0.0.1"] // Kendi bilgisayarını hariç tut
            }
        };
        
        // Chrome'un ağ yönlendirmesini zorla değiştir
        chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
            console.log("🐺 [BÖRÜ] Ağ Tüneli Değiştirildi:", config.rules.singleProxy);
            sendResponse({ status: "ok" });
        });
        return true; // Asenkron cevap vereceğimizi belirtiyoruz
    } 
    
    // 2. PROXY'İ SIFIRLAMA EMRİ GELDİĞİNDE
    else if (request.action === "BORU_CLEAR_PROXY") {
        chrome.proxy.settings.clear({ scope: 'regular' }, () => {
            console.log("🛑 [BÖRÜ] Ağ Tüneli Kapatıldı. Orijinal IP'ye dönüldü.");
            sendResponse({ status: "ok" });
        });
        return true;
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "kill-proxy") {
        console.log("🚨 [BÖRÜ] KILL SWITCH TETİKLENDİ! Proxy fişi çekiliyor...");
        
        // Proxy'i zorla temizle
        chrome.proxy.settings.clear({ scope: 'regular' }, () => {
            
            // Kullanıcıya sağ alttan sistem bildirimi at
            chrome.notifications.create("boru-kill-switch", {
                type: "basic",
                iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Eğer icon.png yoksa boş görünebilir, sorun değil
                title: "🐺 BÖRÜ PRO - ACİL ÇIKIŞ",
                message: "Ölü proxy tünelinden çıkıldı. Orijinal ağa dönüldü! Sayfayı yenileyebilirsin."
            });
            
        });
    }
});