(function() {
    console.log("🐺 Börü: Tam Korumalı Sistem Devreye Giriyor...");

    // 1. Görünürlük (Visibility) Sensörlerini Kör Et (Güvenli Getter Yöntemi)
    try {
        Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
        Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
        document.hasFocus = () => true;
    } catch(e) { 
        console.warn("🐺 Börü: Visibility override yakalandı, sorun yok devam ediliyor."); 
    }

    // 2. Tüm Event Listener'ları Kökten Yakala (EventTarget Prototype Üzerinden)
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        
        // Çoklu sekme / local depolama engelini yut
        if (type === "storage" && listener && listener.toString().includes("alreadyOpenPage")) {
            console.log("🐺 Börü: Storage polisi yutuldu.");
            return;
        }

        // Sekme arka plana atıldı olaylarını tamamen felç et
        if (["visibilitychange", "blur", "pagehide"].includes(type)) {
            const safeListener = function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            };
            return originalAddEventListener.call(this, type, safeListener, options);
        }

        return originalAddEventListener.call(this, type, listener, options);
    };

    // 3. WebSocket Çift Taraflı Kanca (onmessage ve addEventListener)
    const OrigWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const ws = new OrigWebSocket(url, protocols);

        // OYUN MOTORU "ws.onmessage = ..." KULLANIYORSA DİYE SETTER KANCASI
        const originalOnMessageDesc = Object.getOwnPropertyDescriptor(OrigWebSocket.prototype, 'onmessage');
        if (originalOnMessageDesc && originalOnMessageDesc.set) {
            Object.defineProperty(ws, 'onmessage', {
                set: function(customListener) {
                    const hookedListener = function(event) {
                        const data = event.data;
                        if (typeof data === 'string') {
                            if (data.includes('error-game-connection-lost') || data === '41' || data.startsWith('41')||data.includes('error-multi-device')) {
                                console.warn("🐺 Börü: Ölüm paketi onmessage'da engellendi ->", data);
                                return; // Fonksiyondan çık, oyuna iletme
                            }
                            if (data === '2') {
                                if (ws.readyState === 1) ws.send('3');
                            }
                        }
                        // Ölüm paketi değilse oyun motorunun kendi fonksiyonunu çalıştır
                        customListener.call(this, event);
                    };
                    originalOnMessageDesc.set.call(this, hookedListener);
                },
                get: function() {
                    return originalOnMessageDesc.get.call(this);
                }
            });
        }

        // OYUN MOTORU "ws.addEventListener('message', ...)" KULLANIYORSA DİYE EVENT KANCASI
        ws.addEventListener('message', function(event) {
            const data = event.data;
            if (typeof data === 'string') {
                if (data === '2') {
                    if (ws.readyState === 1) {
                        ws.send('3');
                    }
                }
                if (data.includes('error-game-connection-lost') || data === '41' || data.startsWith('41')) {
                    console.warn("🐺 Börü: Ölüm paketi event'te engellendi ->", data);
                    event.stopImmediatePropagation(); 
                }
            }
        });

        return ws;
    };
    
    // 🔥 KRİTİK DÜZELTME: Botun soketi tanıması için prototype zincirini onarıyoruz
    window.WebSocket.prototype = OrigWebSocket.prototype;

    console.log("🐺 Börü: Gelişmiş Anti-Disconnect Aktif!");
})();   