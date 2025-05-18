---
layout: default
title: Search
search_exclude: true
---

<h2>Search</h2>
<input id="search-input" type="text" placeholder="Type to search" aria-label="Search" />
<p class="small text-muted">Results include a snippet preview and how many times your query appears on the page.</p>
<ul id="results" class="search-results"></ul>

<script src="{{ '/assets/js/search.js' | relative_url }}"></script>
<script src="{{ '/assets/js/dark-mode.js' | relative_url }}"></script>
