(() => {
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    return originalSetTimeout(callback, delay + 5000, ...args);
  };
  originalSetTimeout(() => {
    window.setTimeout = originalSetTimeout;
  }, 5000);
})();
