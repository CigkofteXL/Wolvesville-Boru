// ===========================================================
// 🎙️ BÖRÜ PRO - SES DEĞİŞTİRİCİ (BİLGİLENDİRME MODU)
// ===========================================================

window.addEventListener("boru_voice-change_tetikle", () => {
    console.log("🎙️ Ses Değiştirici Modülü (Bilgi Paneli) Açıldı.");

    let modal = document.getElementById("boru-voice-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-voice-modal";
        modal.style.cssText = "margin-top: 10px; padding: 15px; background: rgba(20, 10, 10, 0.95); border: 1px solid #FF4444; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(255, 68, 68, 0.2); font-family: sans-serif; transition: all 0.3s ease;";
        
        modal.innerHTML = `
            <div style="color: #FF4444; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(255, 68, 68, 0.5); letter-spacing: 1px;">🎙️ SES DEĞİŞTİRİCİ (PASİF)</div>
            
            <div style="background: rgba(255, 68, 68, 0.05); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 68, 68, 0.2); margin-bottom: 10px;">
                <div style="font-size: 11px; color: #FFD700; font-weight: bold; text-align: center; line-height: 1.6;">
                    ⚠️ Wolvesville Web sürümü şu an sesli sohbeti teknik olarak desteklememektedir.
                </div>
                
                <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 10px 0;"></div>
                
                <p style="font-size: 10px; color: #ccc; margin: 0; text-align: justify; opacity: 0.8;">
                    Geliştiriciler tarafından Web platformuna konulan donanımsal kilitler (NativeModules/Vivox) şu an için resmi olarak kapalıdır. Börü ekibi tarafından yapılan bypass denemeleri, oyun motorunun çökmesine (Beyaz Ekran) sebep olduğu için güvenlik gerekçesiyle bu özellik askıya alınmıştır.
                </p>
            </div>

            <div style="font-size: 9px; color: #888; text-align: center; font-style: italic;">
                *Web'e resmi sesli sohbet desteği geldiği an Özellik otomatik olarak aktif edilecektir.*
            </div>

            <button id="boru-voice-close-btn" style="width: 100%; margin-top: 12px; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid #444; color: #fff; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: 0.2s;">ANLADIM</button>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-voice-close-btn").onclick = () => {
            modal.style.display = "none";
        };
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// Otomatik tetikleyici (Eğer panelden çağrılırsa)
window.dispatchEvent(new CustomEvent("boru_voice-change_tetikle"));