// --- inject.js ---

function isNewer(newVer, oldVer) {
  const v1 = newVer.split('.').map(Number);
  const v2 = oldVer.split('.').map(Number);
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) return true;
    if (v1[i] < v2[i]) return false;
  }
  return false;
}

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
    const currentVersion = chrome.runtime.getManifest().version; 
    let updateData = { version: currentVersion };

    // DEBUG İÇİN KONSOL MESAJI
    console.log(`[Börü Injector] Yerel Sürüm: ${currentVersion}`);

    try {
        // 🔥 CACHE BUSTING: Linkin sonuna "?t=zaman" ekledik.
        // Bu sayede GitHub her seferinde TAZE dosya göndermek zorunda kalır.
        const bustCache = new Date().getTime();
        const response = await fetch(`https://raw.githubusercontent.com/CigkofteXL/Boru/main/version.json?t=${bustCache}`);
        
        if (!response.ok) throw new Error("GitHub bağlantı hatası: " + response.status);

        const githubData = await response.json();
        
        // DEBUG: GitHub'dan ne geldiğini gör
        console.log(`[Börü Injector] GitHub'dan Gelen Sürüm: ${githubData.version}`);

        if (isNewer(githubData.version, currentVersion)) {
            console.log("✅ GÜNCELLEME TESPİT EDİLDİ!");
            updateData.hasUpdate = true;
            updateData.newVersion = githubData.version;
            updateData.message = githubData.message;
        } else {
            console.log("❌ Sürüm güncel veya GitHub sürümü daha düşük.");
        }

    } catch (e) {
        console.error("[Börü Injector] GitHub erişim hatası:", e);
    }

    // Scriptleri Yükle
    await injectScript('lib/abc.js');
    await injectScript('lib/defpayload.js');
    await injectScript('lib/payload.js');
    
    // Botu yükle
    await injectScript('lib/notpayload.js', updateData); 

    console.log('[Börü Injector] Başlatıldı.');
    
  } catch (err) {
    console.error('Script yükleme hatası:', err);
  }
})();