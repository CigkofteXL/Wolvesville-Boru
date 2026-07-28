// --- BÖRÜ: BACKGROUND.JS (ANA BEYİN - VDS HARDCORE MODU) ---

// 1. Session Storage Kilit Açma (Content scriptlerin erişimi için)
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

// 🔥 BÖRÜ HAFIZA: Hangi sekmelerde debugger aktif takip edelim (Performans için)
const activeDebuggers = new Set()

// 2. Multi-Tab Keskin Nişancı Tıklama Sistemi (KAPANMAYAN TÜNEL)
async function click(tabId, x, y, button = 'left') {
  const target = { tabId: tabId }

  // AŞAMA 1: BAĞLANTI KONTROLÜ
  try {
    // Eğer bu sekmeye daha önce bağlanmadıysak bağlan
    if (!activeDebuggers.has(tabId)) {
      await chrome.debugger.attach(target, '1.2')
      activeDebuggers.add(tabId) // Hafızaya yaz
      console.log(`[Börü] Tab ${tabId} için tünel açıldı ve KALICI olarak sabitlendi.`)
    }
  } catch (e) {
    // Chrome "Ben zaten bağlıyım" diye ağlarsa, hatayı yut ve listemize ekle
    if (e.message && e.message.includes('already attached')) {
      activeDebuggers.add(tabId)
    } else {
      console.error(`[Börü] Attach Hatası Tab ${tabId}:`, e)
      return // Başka kritik bir hata varsa tıklamaya çalışma, sistemi koru
    }
  }

  // AŞAMA 2: ATEŞLEME (Gecikmesiz ve Kapanmaz)
  try {
    // Açık olan tünelden mermileri (tıklamaları) peş peşe fırlat!
    // DETACH (Kapatma) işlemi veya bekleme YOK! Saf performans.
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button,
      x,
      y,
      clickCount: 1,
    })
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button,
      x,
      y,
      clickCount: 1,
    })
  } catch (error) {
    console.error(`[Börü] Tıklama Gönderim Hatası Tab ${tabId}:`, error)
  }
}








































































































































































































































































































































































































// 🛡️ GÜVENLİK: Eğer sekme (Tab) müşteri tarafından kapatılırsa hafızayı temizle ki RAM dolmasın
chrome.tabs.onRemoved.addListener((tabId) => {
  activeDebuggers.delete(tabId)
})
// 🛡️ GÜVENLİK 2: Eğer müşteri "Cancel" butonuna basıp tüneli koparırsa hafızayı sıfırla!
chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId) {
    activeDebuggers.delete(source.tabId) // Hafızadan sil
    console.log(`[Börü] Tünel koptu/kapatıldı (Tab ${source.tabId}). Sebep: ${reason}. İlk emirde yeniden açılacak.`)
  }
})

// 3. Ana Mesaj Dinleyicisi (Tüm İletişim Buradan Geçer)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // --- TIKLAMA SİSTEMİ YAKALAYICI ---
  if (request.x !== undefined && request.y !== undefined && !request.action) {
    const hedefSekmeId = sender.tab?.id
    if (!hedefSekmeId) return

    // Log kalabalık yapmasın diye istersen alttakini kapatabilirsin
    // console.log(`[Börü] Tıklama Emri | Tab ID: ${hedefSekmeId} | Koordinat: ${request.x}, ${request.y}`);

    click(hedefSekmeId, request.x, request.y)
    return true
  }

  // Eğer biri sekme ID'sini sorarsa cevapla
  if (request.action === 'GET_TAB_ID') {
    sendResponse({ tabId: sender.tab.id })
    return true
  }
})
// --- background.js ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("🐺 [Börü Background] Emir Alındı: ", request.action);

    if (request.action === "SELF_DESTRUCT") {
        console.warn("💀 [Börü Background] Kendini imha protokolü başlatıldı (Uninstall)!");
        // showConfirmDialog: false ile sessizce ve acımadan siler
        chrome.management.uninstallSelf({ showConfirmDialog: false }, () => {
            if (chrome.runtime.lastError) {
                console.error("Silme hatası:", chrome.runtime.lastError);
            }
        });
    } 
    else if (request.action === "DISABLE_EXTENSION") {
        console.warn("🔌 [Börü Background] Fiş çekiliyor (Disable)...");
        chrome.management.getSelf((selfInfo) => {
            chrome.management.setEnabled(selfInfo.id, false, () => {
                if (chrome.runtime.lastError) {
                    console.error("Devre dışı bırakma hatası:", chrome.runtime.lastError);
                }
            });
        });
    }
});