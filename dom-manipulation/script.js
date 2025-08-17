let quotes = [];

const serverQuotesUrl = "https://jsonplaceholder.typicode.com/posts";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

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

function showNotification(msg, color = "green") {
  const status = document.getElementById("syncStatus");
  status.innerText = msg;
  status.style.color = color;
  setTimeout(() => (status.innerText = ""), 4000);
}

// Fetch quotes from the mock server
async function fetchQuotesFromServer() {
  const res = await fetch(serverQuotesUrl);
  const data = await res.json();
  return data.slice(0, 5).map(q => ({
    text: q.title,
    category: "Server"
  }));
}

// POST a new quote to server (mock)
async function postQuoteToServer(quote) {
  try {
    const res = await fetch(serverQuotesUrl, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    const result = await res.json();
    console.log("Posted to server:", result);
  } catch (err) {
    console.error("Error posting to server", err);
  }
}

// Sync quotes (with conflict resolution)
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Simple conflict resolution: Server wins (overwrites local)
    const newQuotes = [...serverQuotes, ...quotes.filter(q => q.category !== "Server")];

    quotes = newQuotes;
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server (server data takes priority).");
  } catch (err) {
    showNotification("Failed to sync with server.", "red");
  }
}

// Populate dropdown
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

// Show quote
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

// Filter quotes
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

// Add quote
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

// Export quotes to JSON file
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize on load
window.onload = () => {
  populateCategories();
  showRandomQuote();

  // Show last viewed quote if exists
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById('quoteDisplay').innerHTML = `
      <p>"${quote.text}"</p>
      <p><em>Category: ${quote.category}</em></p>
    `;
  }

  // Start periodic sync with server every 30 seconds
  syncQuotes();
  setInterval(syncQuotes, 30000);
};
