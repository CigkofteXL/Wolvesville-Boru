// ===========================================================
// 🐺 BÖRÜ PRO - SADECE PROXY YÖNETİCİSİ (KURYE UYUMLU)
// ===========================================================

(() => { 
    window.addEventListener("boru_proxy-changer_tetikle", () => {
        let modal = document.getElementById("boru-proxy-modal");
        
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "boru-proxy-modal";
            modal.style.cssText = "margin-top: 10px; padding: 15px; background: rgba(0, 20, 25, 0.95); border: 1px solid #00E5FF; border-radius: 8px; color: white; box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); font-family: 'Segoe UI', Tahoma, sans-serif; width: 100%; box-sizing: border-box; display: none;";
            
            let sonIp = localStorage.getItem("boru_proxy_ip") || "";
            let sonPort = localStorage.getItem("boru_proxy_port") || "";
            let sonTip = localStorage.getItem("boru_proxy_type") || "http";

            modal.innerHTML = `
                <div style="color: #00E5FF; font-weight: 900; text-align: center; margin-bottom: 12px; font-size: 15px; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);">🌐 PROXY TÜNELİ</div>
                <div style="background: rgba(0, 229, 255, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(0, 229, 255, 0.2); margin-bottom: 10px; font-size: 10px; color: #ccc; text-align: center;">
                    Hesabından çıkış yapmaz. Sadece tüm tarayıcının ağ bağlantısını yönlendirir.
                </div>

                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <div style="flex: 2;">
                        <label style="font-size: 10px; color: #00E5FF;">IP:</label>
                        <input type="text" id="boru-proxy-ip" value="${sonIp}" placeholder="192.168.1.1" style="width: 100%; padding: 6px; background: #111; border: 1px solid #444; color: #00E5FF; border-radius: 4px; box-sizing: border-box;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 10px; color: #00E5FF;">Port:</label>
                        <input type="number" id="boru-proxy-port" value="${sonPort}" placeholder="8080" style="width: 100%; padding: 6px; background: #111; border: 1px solid #444; color: #00E5FF; border-radius: 4px; box-sizing: border-box;">
                    </div>
                </div>

                <select id="boru-proxy-type" style="width: 100%; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px; margin-bottom: 10px;">
                    <option value="http" ${sonTip === "http" ? "selected" : ""}>HTTP / HTTPS</option>
                    <option value="socks4" ${sonTip === "socks4" ? "selected" : ""}>SOCKS4</option>
                    <option value="socks5" ${sonTip === "socks5" ? "selected" : ""}>SOCKS5</option>
                </select>

                <button id="btn-set-proxy-only" style="width: 100%; padding: 10px; background: rgba(0, 229, 255, 0.2); border: 1px solid #00E5FF; color: #00E5FF; font-weight: bold; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">🔥 BAĞLAN</button>
                <button id="btn-clear-proxy-only" style="width: 100%; padding: 8px; background: transparent; border: 1px dashed #aaa; color: #aaa; cursor: pointer; border-radius: 4px;">🛑 Kapat</button>
                <div id="boru-proxy-status" style="font-size: 11px; color: #aaa; text-align: center; margin-top: 10px;">Durum: Normal Ağ</div>
            `;
            
            const anaPanel = document.getElementById("boru-panel");
            if (anaPanel) anaPanel.appendChild(modal);

            // Tünele Bağlan Butonu
            document.getElementById("btn-set-proxy-only").onclick = () => {
                const ip = document.getElementById("boru-proxy-ip").value.trim();
                const port = document.getElementById("boru-proxy-port").value.trim();
                const tip = document.getElementById("boru-proxy-type").value;
                if (!ip || !port) return;

                localStorage.setItem("boru_proxy_ip", ip);
                localStorage.setItem("boru_proxy_port", port);
                localStorage.setItem("boru_proxy_type", tip);

                // Kuryeye mesaj yolluyoruz
                window.postMessage({
                    action: "BORU_BG_COMMAND",
                    payload: { action: "BORU_SET_PROXY", host: ip, port: port, scheme: tip }
                }, "*");
            };

            // Kapat Butonu
            document.getElementById("btn-clear-proxy-only").onclick = () => {
                window.postMessage({
                    action: "BORU_BG_COMMAND",
                    payload: { action: "BORU_CLEAR_PROXY" }
                }, "*");
            };

            // Kuryeden gelen cevabı dinle ve ekrana yaz
            window.addEventListener("message", (event) => {
                if (event.source !== window) return;
                if (event.data && event.data.type === "BORU_BG_RESPONSE") {
                    if (event.data.command === "BORU_SET_PROXY") {
                        document.getElementById("boru-proxy-status").innerText = "✅ Tünele Girildi!";
                        document.getElementById("boru-proxy-status").style.color = "#00E5FF";
                    } 
                    else if (event.data.command === "BORU_CLEAR_PROXY") {
                        document.getElementById("boru-proxy-status").innerText = "🛑 Orijinal ağdasın.";
                        document.getElementById("boru-proxy-status").style.color = "#FF4444";
                    }
                }
            });
        }
        
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    });
})();