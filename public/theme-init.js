// Applies a pinned colour scheme before first paint. The default follows the system.
try {
  var pinned = localStorage.getItem('tonga:color-scheme');
  if (pinned === 'light' || pinned === 'dark') {
    document.querySelector('meta[name="color-scheme"]').content = pinned;
    document.documentElement.dataset.theme = pinned;
  }
} catch {
  /* storage blocked: follow the system */
}
