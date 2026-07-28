function click(x, y, button = 'left') {
chrome.tabs.query({ url: "*://www.wolvesville.com/*" }, function (tabs) {
    if (tabs.length === 0) return console.warn("No Wolvesville tab found");
    const target = { tabId: tabs[0].id };

    chrome.debugger.attach(target, '1.2', function () {
      chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
      chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
        type: 'mousePressed',
        button,
        x,
        y,
        clickCount: 1,
      })
      chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        button,
        x,
        y,
        clickCount: 1,
      })
    })
  })
}

chrome.runtime.onMessage.addListener(({ x, y }) => {
  console.log('onMessage')
  console.log(x, y)
  click(x, y)
})
// --- DİSCORD KURYE SİSTEMİ (CSP BYPASS) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendToDiscord") {
    fetch(request.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.data)
    })
    .then(res => console.log("[Background] Discord Status:", res.status))
    .catch(err => console.error("[Background] Discord Error:", err));
    
    return true; // Asenkron işlem için
  }
});
