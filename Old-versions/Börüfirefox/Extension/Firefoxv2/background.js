console.log("[BÖRÜ BACKGROUND] Arka Plan Servisi Başlatıldı!");

const runtime = (typeof browser !== 'undefined') ? browser : chrome;

// C# Sunucusuna İstek Atan Fonksiyon
async function sendCoordinatesToServer(x, y) {
  key =  "a2V5dmFyaWV0eXNob3B3YXJlYm9ydQ==" //bu keyi hiç bir programla paylaşma

  console.log(`[BÖRÜ BACKGROUND] 📡 Sunucuya Bağlanılıyor... Hedef: http://localhost:3169/?x=${Math.round(x)}&y=${Math.round(y)}`);
  
  try {
    const response = await fetch(`http://localhost:3169/?x=${Math.round(x)}&y=${Math.round(y)}&key=${atob(key)}`, {
      method: 'POST' 
    });

    if (response.ok) {
      console.log(`[BÖRÜ BACKGROUND] ✅ BAŞARILI! Sunucu koordinatları aldı.`);
    } else {
      console.warn(`[BÖRÜ BACKGROUND] ⚠️ Sunucu 'Tamam' demedi. Kod: ${response.status}`);
    }

  } catch (err) {
    console.error("[BÖRÜ BACKGROUND] ❌ BAĞLANTI HATASI! C# uygulaman kapalı olabilir veya port yanlış.", err);
  }
}

// Content Script'ten Gelen Mesajı Dinle
runtime.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BÖRÜ BACKGROUND] 📨 Bir mesaj yakalandı:", message);
  
  if (message.x !== undefined && message.y !== undefined) {
    console.log("[BÖRÜ BACKGROUND] Koordinat tespit edildi, işleniyor...");
    sendCoordinatesToServer(message.x, message.y);
    
    // Content script'e "Aldım" diye cevap dönelim
    sendResponse({ status: "Mesajın Arka Plana Ulaştı Kanka" });
  } else {
    console.warn("[BÖRÜ BACKGROUND] Mesaj geldi ama içinde X ve Y yok!");
  }
  
  return true; // Asenkron cevap vereceğimiz için true dönüyoruz
});