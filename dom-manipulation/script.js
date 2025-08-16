const quotes = [
  { text: "The only limit is your mind.", category: "Motivation" },
  { text: "Believe you can and you're halfway there.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" },
];

function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear existing content
  quoteDisplay.innerHTML = "";

  // Create quote paragraph
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  // Create category label
  const category = document.createElement("small");
  category.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(category);
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote and category.");
  }
}
