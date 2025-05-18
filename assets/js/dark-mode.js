---
layout: null
---

// Dark mode toggle script
// Adds a button allowing users to switch between light and dark modes

(function () {
  function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);

    var btn = document.createElement('button');
    btn.id = 'dark-mode-toggle';
    btn.type = 'button';
    btn.innerHTML = theme === 'dark' ? '☀' : '🌙';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark-mode');
      var next = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
      btn.innerHTML = next === 'dark' ? '☀' : '🌙';
    });
  });
})();
