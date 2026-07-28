window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === 'FROM_PAGE_CLICK') {
    chrome.runtime.sendMessage({ x: event.data.x, y: event.data.y });
  }
});