// --- inject.js (FİNAL SÜRÜM) ---

// Sürüm Kıyaslama Yardımcısı
function isNewer(newVer, oldVer) {
  if (!newVer || !oldVer) return false;
  const v1 = newVer.split('.').map(Number);
  const v2 = oldVer.split('.').map(Number);
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) return true;
    if (v1[i] < v2[i]) return false;
  }
  return false;
}

// Script Enjekte Etme Yardımcısı
function injectScript(src, data = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.type = 'text/javascript';
    
    // Verileri script etiketine damgalıyoruz
    if (data.version) script.setAttribute('data-version', data.version);
    if (data.hasUpdate) script.setAttribute('data-has-update', 'true');
    if (data.newVersion) script.setAttribute('data-new-version', data.newVersion);
    if (data.message) script.setAttribute('data-update-message', data.message);

    script.onload = function () {
      resolve();
      this.remove();
    };
    script.onerror = reject;
    document.documentElement.appendChild(script);
  });
}

(async () => {
  try {
    // 1. MANIFEST BİLGİLERİNİ AL
    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version; 
    const localName = manifest.name;

    // Varsayılan update verisi
    let updateData = { version: currentVersion };

    // 2. KİMLİK TESPİTİ: Ben Börü müyüm, Börücük müyüm?
    let targetBot = "Börücük"; // Varsayılan
    if (localName.toLowerCase().includes("börücük") || localName.toLowerCase().includes("borucuk")) {
        targetBot = "Börücük";
    }

    console.log(`[Börü Injector] Mod: ${targetBot} | Sürüm: ${currentVersion}`);

    try {
        // 🔥 CACHE BUSTING (Taze veri için)
        const bustCache = new Date().getTime();
        const response = await fetch(`https://raw.githubusercontent.com/CigkofteXL/Boru/main/version.json?t=${bustCache}`);
        
        if (!response.ok) throw new Error("GitHub bağlantı hatası: " + response.status);

        const fullJson = await response.json();
        
        // 3. DOĞRU KUTUYU SEÇ (Nested JSON Çözümü)
        const botData = fullJson[targetBot];

        if (botData && botData.version) {
             console.log(`[Börü Injector] GitHub'dan Gelen Sürüm: ${botData.version}`);

             // Sürüm Kıyaslama
             if (isNewer(botData.version, currentVersion)) {
                console.log("✅ GÜNCELLEME TESPİT EDİLDİ!");
                updateData.hasUpdate = true;
                updateData.newVersion = botData.version;
                updateData.message = botData.message; // JSON'daki mesajı al
             } else {
                console.log("❌ Sürüm güncel.");
             }
        } else {
            console.warn(`[Börü Injector] JSON içinde '${targetBot}' verisi bulunamadı!`);
        }

    } catch (e) {
        console.error("[Börü Injector] GitHub erişim/okuma hatası:", e);
    }

    // 4. SCRIPTLERİ SIRAYLA YÜKLE
    // Önce kütüphaneler
    await injectScript('lib/abc.js');
    await injectScript('lib/defpayload.js');
    await injectScript('lib/payload.js');
    
    // En son ana bot (Update bilgisini buna gönderiyoruz)
    await injectScript('lib/notpayload.js', updateData); 

    console.log('[Börü Injector] Tüm scriptler başarıyla enjekte edildi.');
    
  } catch (err) {
    console.error('Script yükleme hatası:', err);
  }
})();
