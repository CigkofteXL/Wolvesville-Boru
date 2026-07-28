// ===========================================================
// ⚡ BÖRÜ PRO - HIZLI TASLAKLAR (DİNAMİK ROL MOTORU)
// ===========================================================

window.addEventListener("boru_quick-msg_tetikle", () => {
    console.log("⚡ Dinamik Hızlı Taslaklar Modülü Aktif!");

    let modal = document.getElementById("boru-quick-msg-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-quick-msg-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(10, 20, 10, 0.95); border: 1px solid #00FF00; border-radius: 8px; color: white; display: none; box-shadow: 0 0 20px rgba(0, 255, 0, 0.2); font-family: sans-serif;";
        
        modal.innerHTML = `
            <div style="color: #00FF00; font-weight: 900; text-align: center; margin-bottom: 10px; font-size: 14px; text-shadow: 0 0 8px rgba(0,255,0,0.5); letter-spacing: 1px;">⚡ DİNAMİK ROL TASLAKLARI</div>
            
            <div style="margin-bottom: 8px;">
                <select id="boru-qm-role-select" class="boru-select" style="border-color:#00FF00; color:#00FF00; font-weight:bold; background:#000;">
                    <option value="genel">🌍 Genel Oyun </option>
                    <option value="aura">👁️ Aura Seer </option>
                    <option value="dedektif">🔎 Detective </option>
                    <option value="kizil">💃 Red Lady (O...)</option>
                    <option value="kahin">🔮 Seer </option>
                    <option value="medyum">👻 Medium </option>
                    <option value="silahsor">🔫 Gunner </option>
                    <option value="bodyguard">🛡️ Bodyguard </option>
                    <option value="kumarbaz">🎲 Gambler </option>
                    <option value="vurucu">🗡️ Vurucu Roller (İmam/yargıç)</option>
                </select>
            </div>

            <div style="background: rgba(0, 255, 0, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(0, 255, 0, 0.2); margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
                <label style="font-size: 10px; color: #00FF00; font-weight: bold; margin:0;">🎯 HEDEF 1:</label>
                <input type="number" id="boru-qm-t1" class="boru-input" placeholder="No" style="width: 40px; text-align: center; border-color: #00FF00; color: #00FF00; background: #000; padding: 4px;">
                
                <label id="boru-qm-t2-label" style="font-size: 10px; color: #00FF00; font-weight: bold; margin:0; display:none;">🎯 HEDEF 2:</label>
                <input type="number" id="boru-qm-t2" class="boru-input" placeholder="No" style="width: 40px; text-align: center; border-color: #00FF00; color: #00FF00; background: #000; padding: 4px; display:none;">
            </div>

            <div id="boru-qm-button-area" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 5px;">
                </div>

            <div id="boru-qm-status" style="font-size: 10px; color: #00FF00; text-align: center; margin-top: 8px; display: none;">✔️ Mesaj Chate Fırlatıldı!</div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        // Rol değiştiğinde butonları ve UI'ı güncelle
        document.getElementById("boru-qm-role-select").addEventListener("change", updateUIByRole);
        
        // İlk açılışta butonları yükle
        updateUIByRole();
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// --- DİNAMİK CÜMLE MOTORU (PARÇALI YAPI) ---
const sentenceParts = {
    girisler: ["Beyler", "Arkadaşlar", "Millet", "Dinleyin,", "Bende net info var,", "Bakın", "Hey", "Acil bakın,", ""],
    bitisler: ["bana güvenin.", "oyları ona atalım.", "kesin bilgi.", "net asıyoruz.", "başka şansı yok.", "dinleyin beni.", "oyunuzu ona verin.", ""],
    
    // Rol bazlı gövde cümleleri (Varyasyonlar)
    genel_kurt: [
        "{X} numaradan çok şüpheliyim", 
        "{X} kesinlikle kötü takımda", 
        "{X} yalan söylüyor bence", 
        "Oyları {X} numaraya toplayalım, net kurt"
    ],
    genel_savunma: [
        "Ben köylüyüm, beni asarsanız kaybederiz", 
        "Rolüm önemli, beni asmayın valla yazık olur", 
        "AFK değilim, chati okuyup analiz yapıyorum",
        "Doktor bu gece acil bana baksın"
    ],
    
    aura_kotu: [
        "Gece {X} numaraya baktım, aurası KÖTÜ", 
        "Aura kontrolünde {X} KIRMIZI (kötü) çıktı", 
        "{X} numarayı taradım, kesin kötü auralı"
    ],
    aura_iyi: [
        "Gece {X} numarayı kontrol ettim, aurası İYİ", 
        "{X} temiz çıktı beyler, ona dokunmayın", 
        "Aurasını gördüm, {X} iyi takımda"
    ],
    aura_unk: [
        "{X} numaraya baktım ama aurası BİLİNMİYOR", 
        "Aura kontrolünde {X} MAVİ (Bilinmeyen) verdi", 
        "{X} bilinmeyen auralı, dikkatli olalım"
    ],

    dedektif_ayni: [
        "Dedektif olarak {X} ve {Y} baktım, AYNI takımdalar", 
        "{X} ile {Y} numarayı taradım, aynı taraftalar", 
        "Gece {X} ve {Y} kontrol edildi, ikisi de aynı ekipte"
    ],
    dedektif_farkli: [
        "{X} ve {Y} numaraya baktım, FARKLI takımdalar", 
        "Dedektif infosu: {X} ile {Y} kesinlikle farklı takım", 
        "Tarama sonucum: {X} ve {Y} zıt kutuplar (farklı)"
    ],

    kizil_temiz: [
        "Gece {X} numaraya gittim ve hayattayım, {X} temiz", 
        "Kızıl olarak {X} evindeydim, bana bir şey olmadı iyi biri", 
        "Dün geceyi {X} ile geçirdim, o köyden rahat olun"
    ],

    kahin_kurt: [
        "Kahin olarak {X} numarayı açtım, KURT adam", 
        "Gece {X} numaraya baktım, net kurt çıktı", 
        "Bende kahin infosu var, {X} kesin kurt asın"
    ],
    kahin_koylu: [
        "{X} numarayı açtım, temiz köylü rolünde", 
        "Kahin infosu: {X} bizden, asmayın", 
        "Gece {X} numaraya baktım, kötü bir rolü yok"
    ],

    medyum_kurt: [
        "Ölüler konuştu, {X} numaraya kesin kurt diyorlar", 
        "Medyum infosu: Mezardakiler {X} kötü diyor", 
        "Ölülerden info aldım, {X} numaranın kurt olduğunu söylüyorlar"
    ],

    silahsor_vur: [
        "Silahşörüm, bugün {X} numarayı vuracağım karışmayın", 
        "Kurşunumu {X} için kullanacağım, kimse heal atmasın", 
        "Ben silahşörüm, {X} numarayı indiriyorum izleyin"
    ],

    bodyguard_korudu: [
        "Gece {X} numarayı korudum, bana saldırdılar",
        "Bodyguardım, {X} hedefti ben araya girdim",
        "Korumam {X} numaranın üzerinde patladı"
    ],
    bodyguard_temiz: [
        "Gece {X} üzerindeydim, saldıran olmadı",
        "Bodyguard olarak {X} korumasındaydım, gece sakindi",
        "{X} numarayı korudum, bir olay yaşanmadı"
    ],

    kumarbaz_koylu_evet: [
        "Kumarbaz olarak {X} numaranın köylü olduğunu biliyorum",
        "{X} kesin köylü, tahmin ettim doğru çıktı",
        "Tahminim tuttu, {X} numara köyden"
    ],
    kumarbaz_koylu_hayir: [
        "Kumarbaz infosu: {X} numara KÖYLÜ DEĞİL",
        "Tahmin ettim, {X} köyden değil beyler",
        "{X} numaranın köylü olmadığını net biliyorum"
    ],
    kumarbaz_kurt_evet: [
        "Tahminim tuttu, {X} numara net KURT",
        "Kumarbaz olarak {X} numaranın kurt olduğunu gördüm",
        "{X} kurt adam, tahminim doğru çıktı asın"
    ],
    kumarbaz_kurt_hayir: [
        "Kumarbaz infosu: {X} numara KURT DEĞİL",
        "Tahmin ettim, {X} kurt değil rahat bırakın",
        "{X} numaranın kurt adam olmadığını net biliyorum"
    ],
    kumarbaz_solo_evet: [
        "Tahminim tuttu, {X} numara SOLO",
        "Kumarbaz olarak {X} numaranın solo takıldığını gördüm",
        "{X} solo rolünde, tahminim doğru çıktı asın"
    ],
    kumarbaz_solo_hayir: [
        "Kumarbaz infosu: {X} numara SOLO DEĞİL",
        "Tahmin ettim, {X} solo değil haberiniz olsun",
        "{X} numaranın solo rolünde olmadığını net biliyorum"
    ],

    vurucu_taarruz: [
        "Ben vurucuyum, {X} numarayı aradan çıkarıyorum",
        "Bugün {X} numaranın icabına ben bakacağım",
        "Herkes geri çekilsin, {X} numarayı indiriyorum"
    ],
    vurucu_vurdum: [
        "{X} numarayı ben vurdum beyler, haberiniz olsun",
        "Benim rolüm vurucu, gece {X} numarayı ben indirdim",
        "{X} numaranın fişini ben çektim, bilginize"
    ]
};

// --- BUTON VE ARAYÜZ YAPILANDIRICISI ---
const roleButtons = {
    genel: [
        { label: "🐺 {X} Kesin Kurt", action: "genel_kurt", color: "#FF4444" },
        { label: "🛡️ Savunma Yap", action: "genel_savunma", color: "#00AAFF" }
    ],
    aura: [
        { label: "🔴 {X} Aurası KÖTÜ", action: "aura_kotu", color: "#FF4444" },
        { label: "🟢 {X} Aurası İYİ", action: "aura_iyi", color: "#00FF00" },
        { label: "🔵 {X} Aurası UNK", action: "aura_unk", color: "#00AAFF" }
    ],
    dedektif: [
        { label: "🔗 {X} ve {Y} AYNI", action: "dedektif_ayni", color: "#00FF00" },
        { label: "⚡ {X} ve {Y} FARKLI", action: "dedektif_farkli", color: "#FF4444" }
    ],
    kizil: [
        { label: "💃 {X} Temiz (Gittim)", action: "kizil_temiz", color: "#FF00FF" },
        { label: "💀 Gittim Ölüyorum", action: "kizil_olu", color: "#FF4444", static: "Kızıl kadınım, gece {X} numaraya gittim! Ölürsem onu kesin asın!" }
    ],
    kahin: [
        { label: "🐺 {X} Kurt Adam", action: "kahin_kurt", color: "#FF4444" },
        { label: "🧑‍🌾 {X} Bizden (İyi)", action: "kahin_koylu", color: "#00FF00" }
    ],
    medyum: [
        { label: "👻 Ölüler: {X} Kurt", action: "medyum_kurt", color: "#FF4444" },
        { label: "🔮 Ölüler Revive İstiyor", action: "medyum_rev", color: "#00AAFF", static: "Medyum infosu: Ölüler {X} numaranın diriltilmesini istiyor." }
    ],
    silahsor: [
        { label: "🔫 {X} Vuruyorum", action: "silahsor_vur", color: "#FFD700" },
        { label: "✋ İki Kurşunum Var", action: "silahsor_info", color: "#00AAFF", static: "Ben silahşörüm, ateş etmedim hala kurşunlarım duruyor." }
    ],
    bodyguard: [
        { label: "🛡️ {X} Korudum (Saldırı)", action: "bodyguard_korudu", color: "#00AAFF" },
        { label: "✅ {X} Korudum (Temiz)", action: "bodyguard_temiz", color: "#00FF00" },
        { label: "💀 Korumam Düştü", action: "bodyguard_düştü", color: "#FF4444", static: "Bodyguardım, korumam düştü artık koruyamıyorum." }
    ],
    kumarbaz: [
        { label: "🧑‍🌾 {X} Köylü", action: "kumarbaz_koylu_evet", color: "#00FF00" },
        { label: "🚫 {X} Köylü DEĞİL", action: "kumarbaz_koylu_hayir", color: "#FF4444" },
        { label: "🐺 {X} Kurt", action: "kumarbaz_kurt_evet", color: "#FF4444" },
        { label: "🚫 {X} Kurt DEĞİL", action: "kumarbaz_kurt_hayir", color: "#00FF00" },
        { label: "🔪 {X} Solo", action: "kumarbaz_solo_evet", color: "#FFaa00" },
        { label: "🚫 {X} Solo DEĞİL", action: "kumarbaz_solo_hayir", color: "#00FF00" }
    ],
    vurucu: [
        { label: "🎯 {X} Vuruyorum", action: "vurucu_taarruz", color: "#FFD700" },
        { label: "💥 {X} Ben Vurdum", action: "vurucu_vurdum", color: "#00AAFF" }
    ]
};

function updateUIByRole() {
    const role = document.getElementById("boru-qm-role-select").value;
    const btnArea = document.getElementById("boru-qm-button-area");
    const t2Input = document.getElementById("boru-qm-t2");
    const t2Label = document.getElementById("boru-qm-t2-label");

    // Dedektif seçildiyse 2. Hedef kutusunu aç
    if (role === "dedektif") {
        t2Input.style.display = "block";
        t2Label.style.display = "block";
    } else {
        t2Input.style.display = "none";
        t2Label.style.display = "none";
    }

    // Butonları temizle ve yeniden oluştur
    btnArea.innerHTML = "";
    
    roleButtons[role].forEach(btnData => {
        const btn = document.createElement("button");
        btn.className = "boru-tool-btn boru-qm-btn";
        btn.style.cssText = `width:100%; border-color:${btnData.color}; color:${btnData.color}; font-weight:bold; font-size: 10px; padding: 4px;`;
        btn.innerText = btnData.label;
        
        btn.onclick = () => generateAndSendMessage(btnData.action, btnData.static);
        btnArea.appendChild(btn);
    });
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateAndSendMessage(actionKey, staticMsg) {
    const t1 = document.getElementById("boru-qm-t1").value.trim();
    const t2 = document.getElementById("boru-qm-t2").value.trim();

    // Numara kontrolü
    if (actionKey !== "genel_savunma" && actionKey !== "silahsor_info" && actionKey !== "bodyguard_düştü") {
        if (!t1) {
            alert("Kanka bir Hedef 1 numarası girmelisin!");
            return;
        }
        if (actionKey.includes("dedektif") && !t2) {
            alert("Dedektif infosu için Hedef 2 numarasını da girmelisin!");
            return;
        }
    }

    let finalMessage = "";

    // Eğer statik bir istisna mesajı verilmişse direkt onu kullan ve {X}'i değiştir
    if (staticMsg) {
        finalMessage = staticMsg.replace(/{X}/g, t1);
    } 
    // Yoksa yapay zeka gibi parçaları birleştirerek rastgele dinamik cümle kur
    else {
        const p1 = getRandom(sentenceParts.girisler);
        const p2 = getRandom(sentenceParts[actionKey]);
        const p3 = getRandom(sentenceParts.bitisler);

        // Boşlukları ayarla ve {X} / {Y} değişkenlerini yerleştir
        finalMessage = `${p1} ${p2} ${p3}`.trim().replace(/{X}/g, t1).replace(/{Y}/g, t2);
    }

    oyunChatineYaz(finalMessage);
}

// --- OYUNUN CHAT KUTUSUNA YAZIP ENTER'A BASAN ENJEKTÖR ---
function oyunChatineYaz(mesaj) {
    let chatInput = document.querySelector('textarea[placeholder*="Mesaj"], textarea[placeholder*="chat"], input[placeholder*="Mesaj"], input[placeholder*="chat"], .chat-input, textarea');
    
    if (!chatInput) {
        const allInputs = document.querySelectorAll('input[type="text"], textarea');
        if(allInputs.length > 0) chatInput = allInputs[allInputs.length - 1];
    }

    if (!chatInput) {
        const status = document.getElementById("boru-qm-status");
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

    const status = document.getElementById("boru-qm-status");
    status.innerText = "✔️ Mesaj Fırlatıldı!";
    status.style.color = "#00FF00";
    status.style.display = "block";
    setTimeout(() => status.style.display = "none", 1500);
}

// Dosya çağrıldığında otomatik tetikle
window.dispatchEvent(new CustomEvent("boru_quick-msg_tetikle"));