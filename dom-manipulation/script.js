let quotes = [];

const serverQuotesUrl = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from localStorage
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
} else {
  quotes = [
    { text: "Believe in yourself!", category: "Motivation" },
    { text: "Knowledge is power.", category: "Education" }
  ];
  saveQuotes();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show Notification
function showNotification(msg, color = "green") {
  const status = document.getElementById("syncStatus");
  status.innerText = msg;
  status.style.color = color;
  setTimeout(() => (status.innerText = ""), 4000);
}

// Populate category dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    filter.value = savedFilter;
    filterQuotes();
  }
}

// Show random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  document.getElementById('quoteDisplay').innerHTML = `
    <p>"${quote.text}"</p>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Filter quotes by category
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

// Add new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert("Please fill both quote and category.");
  }
}

// Export quotes to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported!");
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Sync with server
async function syncWithServer() {
  try {
    const res = await fetch(serverQuotesUrl);
    const serverData = await res.json();

    const newQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    quotes = [...newQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    showNotification("Data synced from server and merged (server wins).");
  } catch (err) {
    showNotification("Sync failed. Try again.", "red");
  }
}

// On load
window.onload = function () {
  populateCategories();

  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById('quoteDisplay').innerHTML = `
      <p>"${quote.text}"</p>
      <p><em>Category: ${quote.category}</em></p>
    `;
  }

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);

  // Periodic sync every 60 seconds
  setInterval(syncWithServer, 60000);
};
