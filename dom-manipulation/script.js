let quotes = [];

const serverQuotesUrl = "https://jsonplaceholder.typicode.com/posts";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage or initialize
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
} else {
  quotes = [
    { text: "Believe in yourself!", category: "Motivation" },
    { text: "Knowledge is power.", category: "Education" }
  ];
  saveQuotes();
}

// Show notifications for syncing
function showNotification(msg, color = "green") {
  const status = document.getElementById("syncStatus");
  status.innerText = msg;
  status.style.color = color;
  setTimeout(() => (status.innerText = ""), 4000);
}

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  const res = await fetch(serverQuotesUrl);
  const data = await res.json();
  return data.slice(0, 5).map(q => ({
    text: q.title,
    category: "Server"
  }));
}

// Post a new quote to server
async function postQuoteToServer(quote) {
  try {
    const res = await fetch(serverQuotesUrl, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    });
    const result = await res.json();
    console.log("Posted to server:", result);
  } catch (err) {
    console.error("Error posting to server", err);
  }
}

// Sync quotes and resolve conflicts
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: server data takes priority
    const newQuotes = [
      ...serverQuotes,
      ...quotes.filter(q => q.category !== "Server")
    ];

    quotes = newQuotes;
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server (server wins).");
  } catch (err) {
    showNotification("Failed to sync with server.", "red");
  }
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

// Show a random quote based on category
function showRandomQuote() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById('quoteDisplay');

  if (filteredQuotes.length === 0) {
    display.innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  display.innerHTML = `
    <p>"${quote.text}"</p>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Filter quotes
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    postQuoteToServer(newQuote);
    alert("Quote added!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert("Please fill both quote and category.");
  }
}

// Export to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Periodically sync with server every 30 seconds
setInterval(syncQuotes, 30000);

// Run on load
window.onload = function () {
  populateCategories();
  showRandomQuote();
};
