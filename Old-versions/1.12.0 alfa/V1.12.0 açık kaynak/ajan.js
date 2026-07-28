(function() {
    console.log("🐺 Börü: Gelişmiş Tam Korumalı Sistem Devreye Giriyor...");

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
        if (type === "storage" && listener && listener.toString().includes("alreadyOpenPage")) {
            return;
        }

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

    // BroadcastChannel Susturucusu
    const OrigBroadcastChannel = window.BroadcastChannel;
    if (typeof OrigBroadcastChannel === 'function') {
        window.BroadcastChannel = function(name) {
            const bc = new OrigBroadcastChannel(name);
            bc.postMessage = function() {};
            return bc;
        };
        window.BroadcastChannel.prototype = OrigBroadcastChannel.prototype;
    }

    // 3. WebSocket Çift Taraflı Kanca (AKILLI FİLTRE)
    const OrigWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        
        // 🔥 SORUN 2 ÇÖZÜLDÜ: PeerJS ve diğer masum soketleri serbest bırak!
        // Sadece URL'sinde oyunun sunucu adresi geçenlere kanca atıyoruz.
        if (!url || typeof url !== 'string' || !url.includes('wolvesville')) {
            return new OrigWebSocket(url, protocols);
        }

        const ws = new OrigWebSocket(url, protocols);

        // 🔥 SORUN 1 ÇÖZÜLDÜ: Akıllı Kapatma (Sadece oyundayken engelle)
        const originalClose = ws.close;
        ws.close = function(code, reason) {
            // Eğer oyun başladıysa (GAME_STATUS 'started' ise) kapanmayı ENGELLE
            if (window.GAME_STATUS === 'started') {
                console.warn(`🐺 Börü: Maç sırasında ws.close() çağrıldı, ENGELLENDİ!`);
                return;
            }
            
            // Oyun bittiyse (GAME_STATUS 'over' ise) veya lobideysek soketin kapanmasına izin ver ki RAM şişmesin
            console.log(`🐺 Börü: Oyun bitti, zombi soketlerin temizlenmesine izin verildi.`);
            originalClose.call(this, code, reason);
        };

        const blockCloseEvent = function(type) {
            // Yine sadece maç içindeysek close eventlerini gizle
            if ((type === 'close' || type === 'error') && window.GAME_STATUS === 'started') {
                return true; 
            }
            return false;
        };

        const originalWsAddEventListener = ws.addEventListener;
        ws.addEventListener = function(type, listener, options) {
            if (blockCloseEvent(type)) return; 

            if (type === 'message') {
                const hookedListener = function(event) {
                    const data = event.data;
                    if (typeof data === 'string') {
                        if (data.includes('error-game-connection-lost') || data === '41' || data.startsWith('41') || data.includes('error-multi-device')) {
                            console.warn("🐺 Börü: Ölüm paketi event'te engellendi ->", data);
                            return; 
                        }
                        if (data === '2') {
                            if (ws.readyState === 1) OrigWebSocket.prototype.send.call(ws, '3');
                        }
                    }
                    listener.call(this, event);
                };
                return originalWsAddEventListener.call(this, type, hookedListener, options);
            }
            return originalWsAddEventListener.call(this, type, listener, options);
        };

        const originalOnMessageDesc = Object.getOwnPropertyDescriptor(OrigWebSocket.prototype, 'onmessage');
        if (originalOnMessageDesc && originalOnMessageDesc.set) {
            Object.defineProperty(ws, 'onmessage', {
                set: function(customListener) {
                    const hookedListener = function(event) {
                        const data = event.data;
                        if (typeof data === 'string') {
                            if (data.includes('error-game-connection-lost') || data === '41' || data.startsWith('41') || data.includes('error-multi-device')) {
                                console.warn("🐺 Börü: Ölüm paketi onmessage'da engellendi ->", data);
                                return;
                            }
                            if (data === '2') {
                                if (ws.readyState === 1) OrigWebSocket.prototype.send.call(ws, '3');
                            }
                        }
                        customListener.call(this, event);
                    };
                    originalOnMessageDesc.set.call(this, hookedListener);
                },
                get: function() {
                    return originalOnMessageDesc.get.call(this);
                }
            });
        }

        // Kapatma eventlerini tamamen yok etmek yerine, sadece oyun sırasında etkisiz bırakıyoruz.
        // O yüzden aşağıdaki kilitleri kaldırdım ki oyun bittiğinde çöp toplayıcı (Garbage Collector) işini yapabilsin.
        
        return ws;
    };
    
    window.WebSocket.prototype = OrigWebSocket.prototype;
    console.log("🐺 Börü: Kusursuz (Memory Leak Korumalı) Anti-Disconnect Aktif!");
})();