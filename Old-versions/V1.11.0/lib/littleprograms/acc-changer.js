// ===========================================================
// 🐺 BÖRÜ PRO - AES-256 ŞİFRELİ HESAP KASASI & OTO-GİRİŞ
// ===========================================================

(() => { // KORUMA KALKANI BAŞLANGICI
    // --- 1. NATIVE WEB CRYPTO API (AES-GCM) MOTORU ---
    const Kripto = {
        async getKey(password) {
            const enc = new TextEncoder();
            // PBKDF2 ile ana şifreden 256-bit AES anahtarı türetme
            const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), {name: "PBKDF2"}, false, ["deriveKey"]);
            return crypto.subtle.deriveKey(
                { name: "PBKDF2", salt: enc.encode("BoruPro_Askeri_Tuz_2026"), iterations: 100000, hash: "SHA-256" },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
        },
        async encrypt(text, password) {
            const key = await this.getKey(password);
            const iv = crypto.getRandomValues(new Uint8Array(12)); // Benzersiz başlatma vektörü
            const enc = new TextEncoder();
            const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));
            
            // IV ve Şifreli metni birleştirip Base64 yap
            const cipherBytes = new Uint8Array(cipher);
            const result = new Uint8Array(iv.length + cipherBytes.length);
            result.set(iv, 0);
            result.set(cipherBytes, iv.length);
            return btoa(String.fromCharCode(...result));
        },
        async decrypt(base64Str, password) {
            try {
                const key = await this.getKey(password);
                const raw = atob(base64Str);
                const bytes = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
                
                const iv = bytes.slice(0, 12);
                const data = bytes.slice(12);
                const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
                return new TextDecoder().decode(decrypted);
            } catch (e) {
                return null; // Yanlış ana şifre veya bozuk veri
            }
        }
    };

    // --- 2. ARAYÜZ VE İŞLEMLER ---
    window.addEventListener("boru_acc-changer_tetikle", () => {
        let modal = document.getElementById("boru-account-modal");
        
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "boru-account-modal";
            
            modal.style.cssText = "margin-top: 10px; padding: 15px; background: rgba(20, 0, 20, 0.95); border: 1px solid #FF00FF; border-radius: 8px; color: white; box-shadow: 0 0 20px rgba(255, 0, 255, 0.3); font-family: 'Segoe UI', Tahoma, sans-serif; width: 100%; box-sizing: border-box; display: none;";
            
            modal.innerHTML = `
                <div style="color: #FF00FF; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 15px; text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);">🔐 ŞİFRELİ HESAP KASASI</div>
                <div style="background: rgba(255, 0, 255, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 0, 255, 0.2); margin-bottom: 10px; font-size: 10px; color: #ccc; text-align: center;">
                    Yerel depodaki veriler AES-256 ile şifrelenir. Kasayı açmak ve yeni hesap eklemek için bir Ana Şifre girin.
                </div>

                <div style="margin-bottom: 10px; border-bottom: 1px solid #FF00FF; padding-bottom: 10px;">
                    <label style="font-size: 10px; color: #FF00FF; font-weight: bold;">🔑 Kasa Ana Şifresi (Master Key):</label>
                    <input type="password" id="boru-master-pass" placeholder="Kasayı açmak için şifrenizi girin..." style="width: 100%; padding: 6px; background: #0a000a; border: 1px solid #FF00FF; color: #FF00FF; border-radius: 4px; font-size: 11px; margin-top: 3px; box-sizing: border-box; text-align: center;">
                </div>

                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                    <input type="text" id="boru-acc-email" placeholder="E-Posta / Kullanıcı Adı" style="flex: 1; padding: 6px; background: #111; border: 1px solid #444; color: #FFF; border-radius: 4px; font-size: 11px;">
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <input type="password" id="boru-acc-pass" placeholder="Oyun Şifresi" style="flex: 2; padding: 6px; background: #111; border: 1px solid #444; color: #FFF; border-radius: 4px; font-size: 11px;">
                    <button id="btn-add-account" style="flex: 1; background: rgba(0, 255, 0, 0.2); border: 1px solid #00FF00; color: #00FF00; font-weight: bold; cursor: pointer; border-radius: 4px; font-size: 11px;">➕ EKLE</button>
                </div>

                <div style="font-size: 10px; color: #FF00FF; border-bottom: 1px dashed #333; padding-bottom: 3px; margin-bottom: 5px; font-weight: bold;">[ KAYITLI HESAPLAR ]</div>
                <div id="boru-account-list" style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; padding-right: 5px;">
                    </div>

                <button id="btn-clear-session-only" style="width: 100%; padding: 8px; background: rgba(255, 0, 0, 0.1); border: 1px solid #FF0000; color: #FF0000; font-weight: bold; cursor: pointer; border-radius: 4px; transition: 0.2s; font-size: 10px;">🧹 AKTİF HESAPTAN ÇIKIŞ YAP</button>
                <div id="boru-account-status" style="font-size: 11px; color: #aaa; text-align: center; margin-top: 10px;">Kasa Kilitli...</div>
            `;
            
            const anaPanel = document.getElementById("boru-panel");
            if (anaPanel) anaPanel.appendChild(modal);

            const durumYaz = (mesaj, renk) => {
                const s = document.getElementById("boru-account-status");
                s.innerText = mesaj;
                s.style.color = renk;
            };

            const kasayiGetir = () => JSON.parse(localStorage.getItem("boru_secure_vault") || "[]");
            const kasayiKaydet = (data) => localStorage.setItem("boru_secure_vault", JSON.stringify(data));

            // Listeyi Ekrana Çizen Fonksiyon (Asenkron - Şifre Çözücü)
            const listeyiGuncelle = async () => {
                const listeDiv = document.getElementById("boru-account-list");
                listeDiv.innerHTML = "";
                const hesaplar = kasayiGetir();
                const anaSifre = document.getElementById("boru-master-pass").value;

                if (hesaplar.length === 0) {
                    listeDiv.innerHTML = `<div style="text-align: center; color: #666; font-size: 10px; margin-top: 10px;">Kasa boş.</div>`;
                    if(anaSifre) durumYaz("Kasa açık, hesap ekleyebilirsiniz.", "#00FF00");
                    else durumYaz("Kasa boş.", "#aaa");
                    return;
                }

                let basariliCozumSayisi = 0;

                for (let i = 0; i < hesaplar.length; i++) {
                    const h = hesaplar[i];
                    let cozulmusSifre = null;

                    // Eğer ana şifre girildiyse AES çözümlemesi yap
                    if (anaSifre) {
                        cozulmusSifre = await Kripto.decrypt(h.encPassword, anaSifre);
                    }

                    const satir = document.createElement("div");
                    satir.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 5px; border: 1px solid #333; border-radius: 4px;";
                    
                    if (cozulmusSifre) {
                        basariliCozumSayisi++;
                        satir.innerHTML = `
                            <div style="font-size: 11px; color: #00FF00; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 130px;" title="${h.email}">
                                🔓 ${h.email}
                            </div>
                            <div style="display: flex; gap: 4px;">
                                <button class="boru-btn-login" data-pass="${cozulmusSifre}" data-email="${h.email}" style="background: rgba(0, 255, 255, 0.2); border: 1px solid #00FFFF; color: #00FFFF; cursor: pointer; border-radius: 3px; font-size: 9px; padding: 3px 6px; font-weight: bold;">GİR</button>
                                <button class="boru-btn-delete" data-index="${i}" style="background: rgba(255, 0, 0, 0.2); border: 1px solid #FF0000; color: #FF0000; cursor: pointer; border-radius: 3px; font-size: 9px; padding: 3px 6px;">X</button>
                            </div>
                        `;
                    } else {
                        satir.innerHTML = `
                            <div style="font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;">
                                🔒 ${h.email}
                            </div>
                            <button class="boru-btn-delete" data-index="${i}" style="background: rgba(255, 0, 0, 0.2); border: 1px dashed #FF0000; color: #FF0000; cursor: pointer; border-radius: 3px; font-size: 9px; padding: 3px 6px;">SİL</button>
                        `;
                    }
                    listeDiv.appendChild(satir);
                }

                if (anaSifre) {
                    if (basariliCozumSayisi === hesaplar.length) durumYaz("✅ Kasa Kilidi Açıldı!", "#00FF00");
                    else durumYaz("❌ Ana Şifre Yanlış!", "#FF0000");
                } else {
                    durumYaz("Kasa Kilitli. Şifrelerinizi görmek için Ana Şifreyi girin.", "#aaa");
                }

                // Silme Butonları İşlevi
                document.querySelectorAll(".boru-btn-delete").forEach(btn => {
                    btn.onclick = (e) => {
                        const idx = e.target.getAttribute("data-index");
                        let h = kasayiGetir();
                        h.splice(idx, 1);
                        kasayiKaydet(h);
                        listeyiGuncelle();
                        durumYaz("Hesap kasadan silindi.", "#FF0000");
                    };
                });

                // Giriş Butonları İşlevi (Oto-Doldurma)
                document.querySelectorAll(".boru-btn-login").forEach(btn => {
                    btn.onclick = (e) => {
                        const em = e.target.getAttribute("data-email");
                        const pw = e.target.getAttribute("data-pass");
                        
                        try {
                            const emailInput = document.querySelector("input[type='email'], input[name='username'], input[placeholder*='E-mail']");
                            const passInput = document.querySelector("input[type='password'], input[name='password']");
                            
                            if (emailInput && passInput) {
                                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                                
                                nativeInputValueSetter.call(emailInput, em);
                                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                                
                                nativeInputValueSetter.call(passInput, pw);
                                passInput.dispatchEvent(new Event('input', { bubbles: true }));

                                durumYaz(`✅ Bilgiler dolduruldu: ${em}`, "#00FFFF");
                            } else {
                                durumYaz("❌ Giriş kutuları bulunamadı!", "#FF4444");
                            }
                        } catch (err) {
                            durumYaz("Hata: " + err.message, "#FF4444");
                        }
                    };
                });
            };

            // Ana şifre yazıldıkça anlık olarak kasayı çözmeyi dene
            document.getElementById("boru-master-pass").addEventListener("input", listeyiGuncelle);

            // Hesap Ekleme İşlemi (Şifreleyerek)
            document.getElementById("btn-add-account").onclick = async () => {
                const em = document.getElementById("boru-acc-email").value.trim();
                const pa = document.getElementById("boru-acc-pass").value.trim();
                const anaSifre = document.getElementById("boru-master-pass").value;
                
                if (!anaSifre) {
                    durumYaz("⚠️ Önce yukarıdan bir Ana Şifre belirleyin/girin!", "#FFD700");
                    return;
                }
                if (!em || !pa) {
                    durumYaz("E-posta ve şifre boş olamaz!", "#FFD700");
                    return;
                }

                const hesaplar = kasayiGetir();
                if (hesaplar.find(h => h.email === em)) {
                    durumYaz("Bu hesap zaten kayıtlı!", "#FFD700");
                    return;
                }

                durumYaz("Şifreleniyor...", "#00FFFF");
                const sifreliOyunSifresi = await Kripto.encrypt(pa, anaSifre); // Asıl büyü burada

                hesaplar.push({ email: em, encPassword: sifreliOyunSifresi });
                kasayiKaydet(hesaplar);
                
                document.getElementById("boru-acc-email").value = "";
                document.getElementById("boru-acc-pass").value = "";
                
                listeyiGuncelle();
                durumYaz("✅ Hesap AES-256 ile şifrelenip kasaya eklendi.", "#00FF00");
            };

            document.getElementById("btn-clear-session-only").onclick = () => {
                durumYaz("İzler siliniyor...", "#FF00FF");
                chrome.runtime.sendMessage({ action: "BORU_CLEAR_SESSION" }, () => {
                    durumYaz("✅ Temizlendi! Sayfa yenileniyor...", "#00FF00");
                    setTimeout(() => window.location.reload(), 800);
                });
            };

            // İlk açılışta listeyi kilitli halde çiz
            listeyiGuncelle();
        }
        
        // Modal aç-kapa mantığı
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    });
})(); // KORUMA KALKANI BİTİŞİ