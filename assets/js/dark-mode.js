---
layout: null
---

// Dark mode toggle script
// Adds a button allowing users to switch between light and dark modes

(function() {
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    var stored = localStorage.getItem('theme');
    applyTheme(stored);

    var btn = document.createElement('button');
    btn.id = 'dark-mode-toggle';
    btn.type = 'button';
    btn.innerHTML = '🌙';
    document.body.appendChild(btn);

    btn.addEventListener('click', function() {
      var isDark = document.body.classList.contains('dark-mode');
      var theme = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  });
})();
