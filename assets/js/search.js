---
---

const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
let index = [];

fetch('{{ "/search.json" | relative_url }}')
  .then(response => response.json())
  .then(data => index = data)
  .catch(err => console.error('Failed to load search index:', err));

searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';
  if (!query) return;

  const results = index.filter(page => {
    const title = page.title ? page.title.toLowerCase() : '';
    const content = page.content ? page.content.toLowerCase() : '';
    return title.includes(query) || content.includes(query);
  });

  results.slice(0, 10).forEach(page => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = page.url;
    link.textContent = page.title || page.url;
    item.appendChild(link);
    resultsContainer.appendChild(item);
  });
});
