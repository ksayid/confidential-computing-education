---
layout: null
---

// Dark-mode toggle script
// Adds a button allowing users to switch between light and dark modes

(function () {
  // Helper: apply the selected theme
  function applyTheme(theme) {
    document.body.classList.toggle('dark-mode',  theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Pick stored preference or fall back to the OS preference
    var stored = localStorage.getItem('theme');
    var theme  = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);

    // Build the toggle button
    var btn   = document.createElement('button');
    btn.id    = 'dark-mode-toggle';
    btn.type  = 'button';
    btn.innerHTML = theme === 'dark' ? '☀' : '🌙';
    document.body.appendChild(btn);

    // Click handler: flip theme, persist choice, update icon
    btn.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark-mode');
      var next   = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
      btn.innerHTML = next === 'dark' ? '☀' : '🌙';
    });
  });
})();
