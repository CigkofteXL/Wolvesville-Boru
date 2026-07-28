console.log("[BÖRÜ] Content Script Yüklendi! (Köprü Hazır)");

window.addEventListener('message', (event) => {
  // Güvenlik kontrolü: Sadece kendi penceremizden gelenleri dinle
  if (event.source !== window) return;

  if (event.data && event.data.type === 'FROM_PAGE_CLICK') {
    console.log("[BÖRÜ CONTENT] ✅ Sayfadan Tıklama Sinyali Alındı:", event.data);
    
    // Firefox ve Chrome uyumluluğu
    const runtime = (typeof browser !== 'undefined') ? browser : chrome;

    try {
      console.log("[BÖRÜ CONTENT] 📨 Mesaj Arka Plana (Background) Gönderiliyor...");
      
      runtime.runtime.sendMessage({ x: event.data.x, y: event.data.y }, (response) => {
        // Hata kontrolü
        if (runtime.runtime.lastError) {
          console.error("[BÖRÜ CONTENT] ❌ Mesaj Gönderilemedi! Hata:", runtime.runtime.lastError.message);
        } else {
          console.log("[BÖRÜ CONTENT] 👍 Arka Plandan Cevap Geldi:", response);
        }
      });
      
    } catch (e) {
        console.error("[BÖRÜ CONTENT] 💥 Kritik Hata:", e);
    }
  }
});