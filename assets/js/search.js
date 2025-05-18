---
layout: null
---

const searchInput      = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
let   index            = [];

// Fetch the generated index, accounting for any base URL the site might use
fetch('{{ "/search.json" | relative_url }}')
  .then(response => response.json())
  .then(data => { index = data; })
  .catch(err => console.error('Failed to load search index:', err));

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';
  if (!query) return;

  const results = index.filter(page => {
    const title   = (page.title   || '').toLowerCase();
    const content = (page.content || '').toLowerCase();
    return title.includes(query) || content.includes(query);
  });

  results.slice(0, 10).forEach(page => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href        = page.url;
    link.textContent = page.title || page.url;
    item.appendChild(link);
    resultsContainer.appendChild(item);
  });
});
