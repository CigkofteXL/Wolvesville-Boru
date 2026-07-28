// ===========================================================
// 🤖 BÖRÜ PRO - AI YALAN ÜRETİCİ (GEMINI API)
// ===========================================================

window.addEventListener("boru_ai-lie_tetikle", () => {
    console.log("🤖 AI Yalan Üretici Modülü Aktif!");

    let modal = document.getElementById("boru-ai-lie-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-ai-lie-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(10, 5, 20, 0.95); border: 1px solid #B026FF; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(176, 38, 255, 0.2); font-family: sans-serif;";
        
        modal.innerHTML = `
            <div style="color: #B026FF; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 10px rgba(176, 38, 255, 0.5); letter-spacing: 1px;">🤖 AI YALAN ÜRETİCİ</div>
            
            <div style="background: rgba(176, 38, 255, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(176, 38, 255, 0.2); margin-bottom: 10px;">
                
                <div style="margin-bottom: 10px;">
                    <label style="font-size: 11px; color: #aaa; font-weight: bold; margin-bottom: 5px; display: block; text-align: center;">Söylemek İstediğin Rol veya Yalan:</label>
                    <input type="text" id="boru-ai-fake" placeholder="Örn: Doktor, 3 numara köylü..." style="width: 100%; background: #000; border: 1px solid #B026FF; color: #FFF; padding: 8px; border-radius: 4px; box-sizing: border-box; text-align: center; font-size: 12px;">
                </div>

                <button id="boru-ai-run" style="width: 100%; padding: 10px; background: rgba(176, 38, 255, 0.15); border: 1px solid #B026FF; color: #B026FF; font-weight: 900; letter-spacing: 1px; border-radius: 4px; cursor: pointer; transition: 0.2s;">🧠 YALAN UYDUR</button>
            </div>
            
            <div id="boru-ai-status" style="font-size: 10px; color: #888; text-align: center; margin-bottom: 5px; display: none;"></div>
            
            <div id="boru-ai-result-container" style="display: none; flex-direction: column; gap: 8px;">
                <div id="boru-ai-result" style="font-size: 12px; font-weight: normal; color: #FFF; min-height: 40px; background: rgba(0,0,0,0.6); padding: 12px; border-radius: 6px; border-left: 3px solid #B026FF; font-style: italic;"></div>
                <button id="boru-ai-send-chat" style="width: 100%; padding: 8px; background: rgba(0, 255, 0, 0.1); border: 1px solid #00FF00; color: #00FF00; font-weight: bold; border-radius: 4px; cursor: pointer;">💬 BU YALANI CHATE FIRLAT</button>
            </div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-ai-run").onclick = generateLie;
        
        // Chate gönderme butonu
        document.getElementById("boru-ai-send-chat").onclick = () => {
            const yalanMetni = document.getElementById("boru-ai-result").innerText;
            if (yalanMetni) {
                oyunChatineYazAI(yalanMetni);
            }
        };
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// --- GEMINI API BAĞLANTISI VE PROMPT MÜHENDİSLİĞİ ---
async function generateLie() {
    const fakeRole = document.getElementById("boru-ai-fake").value.trim();
    
    const status = document.getElementById("boru-ai-status");
    const resultBox = document.getElementById("boru-ai-result");
    const resultContainer = document.getElementById("boru-ai-result-container");
    const runBtn = document.getElementById("boru-ai-run");

    const apiKey = localStorage.getItem("boru_api_gemini");

    if (!apiKey || apiKey.trim() === "") {
        status.style.display = "block";
        status.innerHTML = "❌ HATA: Gemini API Key eksik! Önce Ayarlardan (⚙️) API anahtarını gir.";
        status.style.color = "#FF4444";
        resultContainer.style.display = "none";
        return;
    }

    if (!fakeRole) {
        status.style.display = "block";
        status.innerHTML = "⚠️ Kanka önce söylemek istediğin yalanı yazmalısın.";
        status.style.color = "#FFaa00";
        return;
    }

    // UI Temizliği & Kilit
    resultContainer.style.display = "none";
    status.style.display = "block";
    status.innerHTML = "⏳ Yapay zeka senaryoyu analiz ediyor...";
    status.style.color = "#888";
    runBtn.disabled = true;
    runBtn.style.opacity = "0.5";

    // 🧠 GÜNCELLENMİŞ MÜKEMMEL PROMPT HAZIRLIĞI
    const promptMetni = `Sen "Wolvesville" (Kurtadam) oyununda hayatta kalmaya çalışan, profesyonel bir yalancı ve manipülatörsün.
Amacım oyun içindeki diğer oyunculara şu rolü/yalanı inandırmak: ${fakeRole}

Görev: Bana oyunun chat kutusuna kopyalayıp yapıştırabileceğim bir mesaj yaz. 
Kurallar:
1. SADECE direkt gönderilecek mesajı yaz. (Başına "İşte mesajınız:" gibi açıklamalar veya tırnak işaretleri KESİNLİKLE koyma).
2. Oyuncu argosu kullan (örn: beyler, kanka, net info, saçmalamayın, asın vb.).
3. En fazla 1 veya 2 kısa cümle olsun. Kesinlikle destan yazma.
4. İddiama uygun, çok inandırıcı, duruma göre agresif veya masum rolü yapan zekice bir mesaj olsun.`;

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptMetni }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 500 // <--- DÜZELTİLDİ: Token limitini 500'e (2 katına) çıkardık
                }
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.finishReason === "MAX_TOKENS" && (!candidate.content || !candidate.content.parts)) {
                status.innerHTML = "⚠️ AI çok düşündü, cümleyi bitiremedi. Tekrar bas kanka.";
                status.style.color = "#FFaa00";
            } 
            else if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                let aiText = candidate.content.parts[0].text.trim();
                aiText = aiText.replace(/^["']|["']$/g, ''); // Tırnak temizliği

                status.innerHTML = "✅ Kusursuz bir mesaj hazırlandı.";
                status.style.color = "#B026FF";
                
                resultBox.innerText = aiText;
                resultContainer.style.display = "flex";
            } 
            else {
                status.innerHTML = "❌ AI boş yanıt verdi (İllegal bir şey istemiş olabilirsin).";
                status.style.color = "#FF4444";
            }
        } else {
            console.error("Gemini API Hatası:", data);
            let errorMsg = "Bilinmeyen API Hatası";
            if (data.error && data.error.message) {
                errorMsg = data.error.message;
            }
            status.innerHTML = `❌ API Hatası: ${errorMsg}`;
            status.style.color = "#FF4444";
        }

    } catch (e) {
        console.error("CATCH BLOĞUNA DÜŞTÜ:", e);
        status.innerHTML = "❌ Kod Hatası / Bağlantı Koptu! Console'a (F12) bak.";
        status.style.color = "#FF4444";
    } finally {
        runBtn.disabled = false;
        runBtn.style.opacity = "1";
    }
}

// --- REACT CHAT ENJEKTÖRÜ (Hızlı Taslaklardan Miras) ---
function oyunChatineYazAI(mesaj) {
    let chatInput = document.querySelector('textarea[placeholder*="Mesaj"], textarea[placeholder*="chat"], input[placeholder*="Mesaj"], input[placeholder*="chat"], .chat-input, textarea');
    
    if (!chatInput) {
        const allInputs = document.querySelectorAll('input[type="text"], textarea');
        if(allInputs.length > 0) chatInput = allInputs[allInputs.length - 1];
    }

    if (!chatInput) {
        const status = document.getElementById("boru-ai-status");
        status.innerText = "❌ Chat kutusu bulunamadı!";
        status.style.color = "#FF4444";
        status.style.display = "block";
        setTimeout(() => status.style.display = "none", 2000);
        return;
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set 
                                || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(chatInput, mesaj);
    } else {
        chatInput.value = mesaj;
    }

    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    chatInput.dispatchEvent(new Event('change', { bubbles: true }));

    const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter' });
    chatInput.dispatchEvent(enterEvent);
    
    const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter' });
    chatInput.dispatchEvent(keyupEvent);

    const status = document.getElementById("boru-ai-status");
    status.innerText = "✔️ Manipülasyon Fırlatıldı!";
    status.style.color = "#00FF00";
    status.style.display = "block";
    setTimeout(() => status.style.display = "none", 2000);
}

// Dosya çağrıldığında otomatik tetikle
window.dispatchEvent(new CustomEvent("boru_ai-lie_tetikle"));