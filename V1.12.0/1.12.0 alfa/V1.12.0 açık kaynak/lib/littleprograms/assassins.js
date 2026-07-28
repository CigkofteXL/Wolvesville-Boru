// ===========================================================
// 🔪 BÖRÜ PRO - ASSASSINS MODE (ROLE GUESSER)
// ===========================================================

window.addEventListener("boru_assassins_tetikle", () => {
    console.log("🔪 Assassins Mode Tetiklendi!");

    let modal = document.getElementById("boru-assassins-modal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boru-assassins-modal";
        modal.style.cssText = "margin-top: 10px; padding: 12px; background: rgba(20, 0, 0, 0.85); border: 1px dashed #FF0044; border-radius: 8px; color: white; display: none; box-shadow: 0 0 15px rgba(255, 0, 68, 0.3);";
        
        modal.innerHTML = `
            <div style="color: #FF0044; font-weight: 900; text-align: center; margin-bottom: 10px; font-size: 13px; text-shadow: 0 0 5px #FF0044;">🔪 ASSASSINS MODE AKTİF</div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 8px;">Kelimelerin harf sayılarını bitişik gir.<br><i style="color:#888;">(Örn: "Red Lady" = 34 | "Sorcerer" = 8)</i></div>
            
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <input type="number" id="boru-assassins-input" class="boru-input" placeholder="Harf Sayıları (Örn: 34)" style="flex: 1; border-color: #FF0044; color: #FF0044; background: rgba(255, 0, 68, 0.05); font-weight: bold; text-align: center;">
                <button id="boru-assassins-run" class="boru-btn" style="width: auto; padding: 0 15px; background: rgba(255, 0, 68, 0.2); border-color: #FF0044; color: #FF0044;">ANALİZ ET</button>
            </div>
            
            <div id="boru-assassins-result" style="font-size: 11px; color: #ddd; min-height: 20px; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; display: none;"></div>
        `;
        
        const anaPanel = document.getElementById("boru-panel");
        if (anaPanel) anaPanel.appendChild(modal);

        document.getElementById("boru-assassins-run").onclick = hesaplaAssassins;
        document.getElementById("boru-assassins-input").addEventListener("keypress", function(e) {
            if (e.key === "Enter") hesaplaAssassins();
        });
    }

    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

function hesaplaAssassins() {
    const inputVal = document.getElementById("boru-assassins-input").value.trim();
    const resultBox = document.getElementById("boru-assassins-result");

    resultBox.style.display = "block";

    if (!inputVal) {
        resultBox.innerHTML = "<span style='color:#FF0044; font-weight:bold;'>❌ Şifreyi boş bırakma kanka!</span>";
        return;
    }

    const rawData = localStorage.getItem("roles-meta-data");
    if (!rawData) {
        resultBox.innerHTML = "<span style='color:#FF0044;'>❌ Hata: Veri bulunamadı! Oyun menüsüne girdiğinden emin ol.</span>";
        return;
    }

    try {
        const data = JSON.parse(rawData);
        const roles = data.roles;
        
        if (!roles) throw new Error("Roller listesi boş!");

        const targetLengths = inputVal.split('').map(Number);
        let matchedRoles = [];

        for (const key in roles) {
            const roleName = roles[key].name;
            const cleanName = roleName.replace(/-/g, " ").trim();
            const words = cleanName.split(/\s+/);
            
            if (words.length !== targetLengths.length) continue;
            
            let eslesiyor = true;
            for (let i = 0; i < words.length; i++) {
                const harfSayisi = words[i].replace(/[^a-zA-ZğüşöçİĞÜŞÖÇ]/gi, "").length;
                if (harfSayisi !== targetLengths[i]) {
                    eslesiyor = false;
                    break;
                }
            }

            if (eslesiyor) {
                matchedRoles.push(roleName);
            }
        }

        if (matchedRoles.length === 0) {
            resultBox.innerHTML = "<span style='color:#FFaa00;'>⚠️ Bu uzunluğa uygun rol bulunamadı.</span>";
            return;
        }

        let ciktiHTML = "";

        if (matchedRoles.length <= 5) {
            ciktiHTML += `<strong style="color:#00FFFF; border-bottom: 1px solid #00FFFF; padding-bottom:2px; display:inline-block; margin-bottom:5px;">🎯 KESİN HEDEFLER (${matchedRoles.length}):</strong><br>`;
            ciktiHTML += matchedRoles.map(r => `<span style="color:white;">• ${r}</span>`).join("<br>");
            ciktiHTML += "<br><br>";
        } else {
            ciktiHTML += `<strong style="color:#00FFFF;">🔍 Olası Rol Sayısı: ${matchedRoles.length}</strong><br><br>`;
        }

        let harfFrekans = {};
        
        matchedRoles.forEach(role => {
            const benzersizHarfler = [...new Set(role.toUpperCase().replace(/[^A-ZĞÜŞİÖÇ]/g, ''))];
            benzersizHarfler.forEach(harf => {
                harfFrekans[harf] = (harfFrekans[harf] || 0) + 1;
            });
        });

        const siraliHarfler = Object.entries(harfFrekans)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        ciktiHTML += `<strong style="color:#FFD700;">📊 ÇIKMA İHTİMALİ EN YÜKSEK HARFLER:</strong><br><div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px;">`;
        
        siraliHarfler.forEach(([harf, frekans]) => {
            const yuzde = Math.round((frekans / matchedRoles.length) * 100);
            const bgRenk = yuzde > 75 ? "#FF0044" : (yuzde > 40 ? "#FFaa00" : "#555");
            const yaziRenk = yuzde > 40 ? "#000" : "#FFF";
            ciktiHTML += `<span style="padding: 2px 6px; background: ${bgRenk}; color: ${yaziRenk}; border-radius: 4px; font-weight: bold; font-size: 10px;">${harf} (%${yuzde})</span>`;
        });
        
        ciktiHTML += `</div>`;
        resultBox.innerHTML = ciktiHTML;

    } catch (e) {
        console.error(e);
        resultBox.innerHTML = "<span style='color:#FF0044;'>❌ Veri işlenirken bir hata oluştu!</span>";
    }
}