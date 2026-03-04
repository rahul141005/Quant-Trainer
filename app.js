/**
 * app.js — Shared application bootstrap
 *
 * Responsibilities:
 *   1. Register the service worker
 *   2. Handle the PWA install prompt
 *   3. Apply saved dark mode setting
 *   4. Provide a loading animation until the page is ready
 */

/* ---- Apply dark mode from settings ---- */
(function () {
  try {
    var settings = JSON.parse(localStorage.getItem('quant_reflex_settings') || '{}');
    if (settings.darkMode) document.body.classList.add('dark-mode');
  } catch (_) { /* ignore */ }
})();

/* ---- Service Worker Registration ---- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('./service-worker.js')
      .catch(function (err) { console.warn('SW registration failed:', err); });
  });
}

/* ---- PWA Install Prompt ---- */
var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;

  /* Show the install card on the Settings page */
  var installCard = document.getElementById('installCard');
  var btn = document.getElementById('installBtn');
  if (installCard && btn) {
    installCard.style.display = 'block';
    btn.addEventListener('click', function () {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installCard.style.display = 'none';
      });
    });
  }
});

/* ---- Page-ready animation ---- */
window.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('loaded');
});
