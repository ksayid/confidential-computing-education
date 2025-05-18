---
layout: null
---

const searchInput      = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
let   index            = [];

// Fetch the pre-built Lunr/Elasticlunr index Jekyll emits at /search.json
const baseUrl = '{{ site.baseurl }}';            // lets the site run under a sub-folder locally or on GitHub Pages
fetch(`${baseUrl}/search.json`)
  .then(response => response.json())
  .then(data => { index = data; });

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';
  if (!query) return;

  const results = index.filter(page =>
    page.title.toLowerCase().includes(query) ||
    page.content.toLowerCase().includes(query)
  );

  results.slice(0, 10).forEach(page => {
    const item = document.createElement('li');
    const link = document.createElement('a');

    /* Ensure links work both on local dev (`/confidential-computing-education/...`)
       and on production (root). */
    link.href        = page.url.startsWith('/') ? `${baseUrl}${page.url}` : page.url;
    link.textContent = page.title;

    item.appendChild(link);
    resultsContainer.appendChild(item);
  });
});
