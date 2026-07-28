// ===========================================================
// 💎 BÖRÜ PRO - KARABORSA HESAP DEĞERİ (BLACK MARKET INDEX)
// ===========================================================

window.addEventListener("boru_bm-index_tetikle", () => {
    console.log("💎 Karaborsa Endeksi Modülü Aktif!");

    let modal = document.getElementById("boru-bm-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-bm-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(20, 10, 30, 0.95); border: 1px solid #00FFFF; border-radius: 8px; color: white; display: none; box-shadow: 0 0 25px rgba(0, 255, 255, 0.2); font-family: sans-serif;";
        
        modal.innerHTML = `
            <div style="color: #00FFFF; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 14px; text-shadow: 0 0 8px rgba(0,255,255,0.5); letter-spacing: 1px;">💎 KARABORSA DEĞER ENDEKSİ</div>
            
            <div style="background: rgba(0, 255, 255, 0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(0, 255, 255, 0.1); margin-bottom: 12px;">
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px;">
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Seviye:</label><input type="number" id="bm-level" value="50" min="1" style="width:100%; background:#000; border:1px solid #333; color:#00FFFF; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Altın:</label><input type="number" id="bm-gold" value="5000" min="0" style="width:100%; background:#000; border:1px solid #333; color:#FFD700; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Elmas:</label><input type="number" id="bm-gems" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#00FFFF; padding:4px; text-align:center;"></div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px;">
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Elmaslı Eşya:</label><input type="number" id="bm-gem-items" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#00FFFF; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Mistik Rol (Adet):</label><input type="number" id="bm-mystic-roles" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#FF00FF; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Gül (Adet):</label><input type="number" id="bm-roses" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#FF4444; padding:4px; text-align:center;"></div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px;">
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">S. Tokeni:</label><input type="number" id="bm-tokens" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#00FF00; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Süper Tılsım:</label><input type="number" id="bm-talismans" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#FFaa00; padding:4px; text-align:center;"></div>
                    <div><label style="font-size:9px; color:#aaa; font-weight:bold; display:block;">Avatar Slotu:</label><input type="number" id="bm-avatar-slots" value="0" min="0" style="width:100%; background:#000; border:1px solid #333; color:#eee; padding:4px; text-align:center;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #FFF; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px; border: 1px dashed #333; margin-bottom: 10px;">
                    <div><label style="font-size:9px; color:#FFD700; font-weight:bold; display:block;">Özel Paket (Adet):</label><input type="number" id="bm-special-packs" value="0" min="0" style="width:60px; background:#000; border:1px solid #FFD700; color:#FFD700; padding:2px; text-align:center;" title="Örn: Özelleştirme, Oda, 2xXP, P. Tılsım vb."></div>
                    <label style="cursor:pointer; display:flex; align-items:center; gap:4px; color:#FF0044; font-weight:bold;"><input type="checkbox" id="bm-og-name"> OG / Şekilli Nick</label>
                </div>

                <button id="boru-bm-run" style="width: 100%; padding: 10px; background: rgba(0, 255, 255, 0.1); border: 1px solid #00FFFF; color: #00FFFF; font-weight: 900; letter-spacing: 1px; border-radius: 4px; cursor: pointer; transition: 0.2s;">HESAP DEĞERİNİ BİÇ</button>
            </div>
            
            <div id="boru-bm-result" style="display: none; text-align: center; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 6px; border: 1px solid #333; position: relative;">
                <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Tahmini Piyasa Değeri</div>
                <div id="bm-final-price" style="font-size: 26px; font-weight: 900; color: #00FFFF; text-shadow: 0 0 15px rgba(0,255,255,0.5);">0 ₺</div>
                <div id="bm-analysis" style="margin-top: 10px; font-size: 10px; color: #aaa; text-align: left; padding-top: 8px; border-top: 1px dashed #333; line-height: 1.4;"></div>
            </div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-bm-run").onclick = hesapDegeriHesapla;
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// --- KARABORSA MATEMATİĞİ ---
function hesapDegeriHesapla() {
    const btn = document.getElementById("boru-bm-run");
    const resultBox = document.getElementById("boru-bm-result");
    const priceText = document.getElementById("bm-final-price");
    const analysisText = document.getElementById("bm-analysis");

    // Değerleri Al
    const lvl = parseInt(document.getElementById("bm-level").value) || 0;
    const gold = parseInt(document.getElementById("bm-gold").value) || 0;
    const gems = parseInt(document.getElementById("bm-gems").value) || 0;
    const gemItems = parseInt(document.getElementById("bm-gem-items").value) || 0;
    const mysticRoles = parseInt(document.getElementById("bm-mystic-roles").value) || 0;
    const roses = parseInt(document.getElementById("bm-roses").value) || 0;
    const tokens = parseInt(document.getElementById("bm-tokens").value) || 0;
    const talismans = parseInt(document.getElementById("bm-talismans").value) || 0;
    const avatarSlots = parseInt(document.getElementById("bm-avatar-slots").value) || 0;
    const specialPacks = parseInt(document.getElementById("bm-special-packs").value) || 0;
    
    const hasOG = document.getElementById("bm-og-name").checked;

    // Animasyon ve Kilit
    btn.disabled = true;
    btn.innerText = "PİYASA ANALİZ EDİLİYOR...";
    btn.style.opacity = "0.5";
    resultBox.style.display = "block";
    priceText.innerHTML = "⏳";
    analysisText.innerHTML = "";

    setTimeout(() => {
        // --- GÜNCELLENMİŞ FİYATLANDIRMA ALGORİTMASI ---
        let degerTL = 0;
        let analizRaporu = [];

        // 1. Seviye Çarpanı (1000 Level = 600 TL -> 1 Level = 0.6 TL)
        const lvlDeger = lvl * 0.6;
        degerTL += lvlDeger;
        if (lvlDeger >= 1) analizRaporu.push(`<span style="color:#FFF;">Seviye Emeği:</span> <span style="color:#00FFFF;">+${Math.round(lvlDeger)} ₺</span>`);

        // 2. Altın Çarpanı (10.000 Altın = 80 TL -> 1 Altın = 0.008 TL)
        const goldDeger = gold * 0.008;
        degerTL += goldDeger;
        if (goldDeger >= 1) analizRaporu.push(`<span style="color:#FFF;">Altın Stoku:</span> <span style="color:#FFD700;">+${Math.round(goldDeger)} ₺</span>`);

        // 3. Elmas Miktarı (1000 Elmas = 250 TL -> 1 Elmas = 0.25 TL)
        const gemDeger = gems * 0.25;
        degerTL += gemDeger;
        if (gemDeger >= 1) analizRaporu.push(`<span style="color:#FFF;">Saf Elmas:</span> <span style="color:#00FFFF;">+${Math.round(gemDeger)} ₺</span>`);

        // 4. Elmaslı Eşyalar (Tanesi 50 TL)
        const gemItemDeger = gemItems * 50;
        degerTL += gemItemDeger;
        if (gemItemDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Elmaslı Eşyalar:</span> <span style="color:#00FFFF;">+${gemItemDeger} ₺</span>`);

        // 5. Mistik Rol Kartları (Tanesi 300 TL)
        const roleDeger = mysticRoles * 300;
        degerTL += roleDeger;
        if (roleDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Mistik Rol Kartı:</span> <span style="color:#FF00FF;">+${roleDeger} ₺</span>`);

        // 6. Güller (600 Gül = 40 TL -> 1 Gül = ~0.066 TL)
        const roseDeger = roses * (40 / 600);
        degerTL += roseDeger;
        if (roseDeger >= 1) analizRaporu.push(`<span style="color:#FFF;">Gül Değeri:</span> <span style="color:#FF4444;">+${Math.round(roseDeger)} ₺</span>`);

        // 7. Sadakat Tokenleri (25 Token = 500 TL -> 1 Token = 20 TL)
        const tokenDeger = tokens * 20;
        degerTL += tokenDeger;
        if (tokenDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Sadakat Tokeni:</span> <span style="color:#00FF00;">+${tokenDeger} ₺</span>`);

        // 8. Süper Tılsımlar (Tanesi 150 TL)
        const talismanDeger = talismans * 150;
        degerTL += talismanDeger;
        if (talismanDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Süper Tılsımlar:</span> <span style="color:#FFaa00;">+${talismanDeger} ₺</span>`);

        // 9. Avatar Slotları (Tanesi 5 TL)
        const slotDeger = avatarSlots * 5;
        degerTL += slotDeger;
        if (slotDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Avatar Slotları:</span> <span style="color:#eee;">+${slotDeger} ₺</span>`);

        // 10. Özel Paketler (Tanesi ortalama 250 TL)
        const packDeger = specialPacks * 250;
        degerTL += packDeger;
        if (packDeger > 0) analizRaporu.push(`<span style="color:#FFF;">Özel Paketler:</span> <span style="color:#FFD700;">+${packDeger} ₺</span>`);

        // 11. Ekstra Özellikler (OG İsim)
        if (hasOG) {
            degerTL += 250; // OG Nick'in şanına 250 ekliyoruz
            analizRaporu.push(`<span style="color:#FFF;">OG / Şekil İsim:</span> <span style="color:#FF0044; font-weight:bold;">+250 ₺</span>`);
        }

        // Sonuçları Ekrana Bas
        const finalDeger = Math.round(degerTL);
        
        // Fiyat rengini değerin büyüklüğüne göre değiştir
        let pColor = "#00FFFF";
        if (finalDeger > 2000) pColor = "#FFD700"; // Altın hesap
        if (finalDeger > 5000) pColor = "#FF0044"; // Efsanevi hesap

        priceText.style.color = pColor;
        priceText.style.textShadow = `0 0 15px ${pColor}80`;
        
        // Sayıyı havalı yaz (örn: 1,500)
        let count = 0;
        const sayacInterval = setInterval(() => {
            count += Math.ceil(finalDeger / 15);
            if (count >= finalDeger) {
                count = finalDeger;
                clearInterval(sayacInterval);
                
                if (analizRaporu.length === 0) {
                    analysisText.innerHTML = "<span style='color:#888;'>Hesapta kayda değer bir şey bulunamadı. Boş çar.</span>";
                } else {
                    analysisText.innerHTML = analizRaporu.join("<br>");
                }
            }
            priceText.innerHTML = count.toLocaleString('tr-TR') + " ₺";
        }, 30);

        // Butonu Sıfırla
        btn.disabled = false;
        btn.innerText = "HESAP DEĞERİNİ BİÇ";
        btn.style.opacity = "1";

    }, 800); // 0.8 Saniye bekleme
}

// Dosya çağrıldığında tetikle
window.dispatchEvent(new CustomEvent("boru_bm-index_tetikle"));