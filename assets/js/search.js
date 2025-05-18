const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
let index = [];

fetch('/search.json')
  .then(response => response.json())
  .then(data => index = data);

searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';
  if (!query) return;

  const results = index.filter(page =>
    page.title.toLowerCase().includes(query) ||
    page.content.toLowerCase().includes(query)
  );

  results.slice(0, 10).forEach(page => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = page.url;
    link.textContent = page.title;
    item.appendChild(link);
    resultsContainer.appendChild(item);
  });
});
