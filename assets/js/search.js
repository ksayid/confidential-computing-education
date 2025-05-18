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
    const item   = document.createElement('li');
    const link   = document.createElement('a');
    const text   = page.content || '';
    const lower  = text.toLowerCase();

    link.href        = page.url;
    link.textContent = page.title || page.url;
    item.appendChild(link);

    const count = query ? (lower.split(query).length - 1) : 0;
    if (count > 0) {
      const firstIdx = lower.indexOf(query);
      const start = Math.max(0, firstIdx - 40);
      const end   = Math.min(text.length, firstIdx + query.length + 40);
      let snippet  = text.substring(start, end).replace(/\n/g, ' ');
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';

      const preview = document.createElement('div');
      preview.className = 'search-snippet';
      preview.textContent = snippet;

      const countSpan = document.createElement('span');
      countSpan.className = 'search-count';
      countSpan.textContent = ` (${count})`;

      item.appendChild(countSpan);
      item.appendChild(preview);
    }

    resultsContainer.appendChild(item);
  });
});
