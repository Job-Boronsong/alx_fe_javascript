// Initial array of quote objects. Will be populated from Local Storage.
let quotes = [];

// Constants for Local Storage and Session Storage keys
const LOCAL_STORAGE_QUOTES_KEY = 'dynamicQuotes';
const SESSION_STORAGE_LAST_QUOTE_KEY = 'lastViewedQuote';

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormDiv = document.getElementById('addQuoteForm');
const messageBox = document.getElementById('messageBox');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importFileBtn = document.getElementById('importFile'); // The hidden file input


/**
 * Displays a message to the user in a styled box.
 * @param {string} message - The message to display.
 * @param {'success' | 'error' | 'info'} type - The type of message (determines styling).
 */
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = 'mt-4 p-3 rounded-lg text-sm'; // Reset classes
  switch (type) {
    case 'success':
      messageBox.classList.add('bg-green-100', 'text-green-800');
      break;
    case 'error':
      messageBox.classList.add('bg-red-100', 'text-red-800');
      break;
    case 'info':
    default:
      messageBox.classList.add('bg-blue-100', 'text-blue-800');
      break;
  }
  messageBox.classList.remove('hidden'); // Make sure it's visible
  // Automatically hide message after 3 seconds
  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 3000);
}

/**
 * Saves the current 'quotes' array to Local Storage.
 * The array is stringified to JSON before saving.
 */
function saveQuotes() {
  try {
    const quotesJson = JSON.stringify(quotes); // Stringify the array to JSON
    localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, quotesJson); // Explicitly set item
  } catch (e) {
    console.error("Error saving quotes to Local Storage:", e);
    showMessage("Could not save quotes locally. Storage might be full or blocked.", "error");
  }
}

/**
 * Loads quotes from Local Storage into the 'quotes' array.
 * Parses the JSON string from storage back into an array of objects.
 * Returns true if quotes were loaded, false otherwise.
 */
function loadQuotes() {
  try {
    const storedQuotes = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      return true; // Indicates quotes were loaded
    }
  } catch (e) {
    console.error("Error loading quotes from Local Storage:", e);
    showMessage("Could not load saved quotes. Data might be corrupted.", "error");
    quotes = []; // Reset quotes if there's an error parsing
  }
  return false; // Indicates no quotes were loaded
}

/**
 * Displays a random quote from the 'quotes' array in the DOM.
 * Clears previous content before displaying the new quote.
 * Also stores the last viewed quote in Session Storage.
 */
function showRandomQuote() {
  // Clear existing content in the display area
  quoteDisplay.innerHTML = '';

  if (quotes.length === 0) {
    const noQuoteMessage = document.createElement('p');
    noQuoteMessage.className = 'text-gray-500 italic';
    noQuoteMessage.textContent = "No quotes available. Add some or import from JSON!";
    quoteDisplay.appendChild(noQuoteMessage);
    sessionStorage.removeItem(SESSION_STORAGE_LAST_QUOTE_KEY); // Clear last viewed if no quotes
    return;
  }

  // Generate a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Create a paragraph element for the quote text
  const quoteTextElement = document.createElement('p');
  quoteTextElement.className = 'text-xl italic font-semibold mb-2'; // Styling for quote text
  quoteTextElement.textContent = `"${randomQuote.text}"`;

  // Create a paragraph element for the quote category
  const quoteCategoryElement = document.createElement('p');
  quoteCategoryElement.className = 'text-md text-indigo-600 font-medium'; // Styling for category
  quoteCategoryElement.textContent = `- ${randomQuote.category}`;

  // Append the created elements to the quote display div
  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);

  // Store the last viewed quote in Session Storage
  try {
    sessionStorage.setItem(SESSION_STORAGE_LAST_QUOTE_KEY, JSON.stringify(randomQuote));
  } catch (e) {
    console.error("Error saving last viewed quote to Session Storage:", e);
  }
}

/**
 * Displays a specific quote in the DOM. Used for loading from session storage.
 * @param {object} quote - The quote object to display.
 */
function displaySpecificQuote(quote) {
  quoteDisplay.innerHTML = ''; // Clear previous content

  const quoteTextElement = document.createElement('p');
  quoteTextElement.className = 'text-xl italic font-semibold mb-2';
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  quoteCategoryElement.className = 'text-md text-indigo-600 font-medium';
  quoteCategoryElement.textContent = `- ${quote.category}`;

  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);
}


/**
 * Adds a new quote to the 'quotes' array based on user input from the form.
 * Clears input fields, updates the display, and saves quotes to local storage.
 */
function addQuote() {
  // Get the dynamically created input fields
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const quoteText = newQuoteTextInput.value.trim();
  const quoteCategory = newQuoteCategoryInput.value.trim();

  // Validate inputs
  if (quoteText === '' || quoteCategory === '') {
    showMessage('Please enter both quote text and category.', 'error');
    return;
  }

  // Create a new quote object
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };

  // Add the new quote to the array
  quotes.push(newQuote);

  // Clear the input fields
  newQuoteTextInput.value = '';
  newQuoteCategoryInput.value = '';

  // Save quotes to local storage after modification
  saveQuotes();

  // Show confirmation message
  showMessage('Quote added successfully!', 'success');
  // Display the newly added quote or a random one
  showRandomQuote();
}

/**
 * Dynamically creates the form for adding new quotes and appends it to the DOM.
 */
function createAddQuoteForm() {
  // Clear any existing content in the form div to prevent duplicates
  addQuoteFormDiv.innerHTML = '';
  addQuoteFormDiv.className = 'space-y-4'; // Ensure consistent styling for dynamic content

  // Create h2 for the title
  const titleElement = document.createElement('h2');
  titleElement.className = 'text-2xl font-bold text-gray-800';
  titleElement.textContent = 'Add Your Own Quote';
  addQuoteFormDiv.appendChild(titleElement);

  // Create input for quote text
  const quoteTextInput = document.createElement('input');
  quoteTextInput.id = 'newQuoteText';
  quoteTextInput.type = 'text';
  quoteTextInput.placeholder = 'Enter a new quote';
  quoteTextInput.className = 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';
  addQuoteFormDiv.appendChild(quoteTextInput);

  // Create input for quote category
  const quoteCategoryInput = document.createElement('input');
  quoteCategoryInput.id = 'newQuoteCategory';
  quoteCategoryInput.type = 'text';
  quoteCategoryInput.placeholder = 'Enter quote category (e.g., Inspiration)';
  quoteCategoryInput.className = 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';
  addQuoteFormDiv.appendChild(quoteCategoryInput);

  // Create button to add quote
  const addQuoteButton = document.createElement('button');
  addQuoteButton.id = 'addQuoteButton';
  addQuoteButton.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75';
  addQuoteButton.textContent = 'Add Quote';
  addQuoteButton.addEventListener('click', addQuote);
  addQuoteFormDiv.appendChild(addQuoteButton);
}

/**
 * Exports the current 'quotes' array as a JSON file for download.
 */
function exportQuotesToJson() {
  if (quotes.length === 0) {
    showMessage("No quotes to export!", "info");
    return;
  }
  try {
    const jsonString = JSON.stringify(quotes, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json'; // Default filename
    document.body.appendChild(a); // Append to body for Firefox compatibility
    a.click(); // Programmatically click the link to trigger download
    document.body.removeChild(a); // Clean up the element

    URL.revokeObjectURL(url); // Release the object URL

    showMessage('Quotes exported successfully!', 'success');
  } catch (e) {
    console.error("Error exporting quotes:", e);
    showMessage("Failed to export quotes. An error occurred.", "error");
  }
}

/**
 * Imports quotes from a selected JSON file.
 * This function is called by the onchange event of the file input.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showMessage("No file selected.", "info");
    return;
  }

  const fileReader = new FileReader();

  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        showMessage("Invalid JSON file. Expected an array of quotes.", "error");
        return;
      }
      // Validate each quote object has 'text' and 'category'
      const isValid = importedQuotes.every(q => typeof q.text === 'string' && typeof q.category === 'string');
      if (!isValid) {
        showMessage("Invalid JSON format. Each quote must have 'text' and 'category' properties.", "error");
        return;
      }

      // Add imported quotes to the existing quotes array
      quotes.push(...importedQuotes);
      saveQuotes(); // Save updated array to local storage
      showMessage(`Successfully imported ${importedQuotes.length} quotes!`, 'success');
      showRandomQuote(); // Display a random quote including the new ones
    } catch (parseError) {
      console.error("Error parsing JSON file:", parseError);
      showMessage("Failed to import quotes. Invalid JSON format.", "error");
    }
  };

  fileReader.onerror = function() {
    showMessage("Error reading file. Please try again.", "error");
  };

  fileReader.readAsText(file);
}


// --- Event Listeners ---

// Event listener for the "Show New Quote" button
newQuoteBtn.addEventListener('click', showRandomQuote);

// Event listener for the "Export Quotes" button
exportQuotesBtn.addEventListener('click', exportQuotesToJson);

// --- Initial setup on page load ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load quotes from Local Storage
  const quotesLoaded = loadQuotes();

  // 2. Try to load and display the last viewed quote from Session Storage
  try {
    const lastViewedQuote = sessionStorage.getItem(SESSION_STORAGE_LAST_QUOTE_KEY);
    if (lastViewedQuote) {
      const parsedLastQuote = JSON.parse(lastViewedQuote);
      if (parsedLastQuote && parsedLastQuote.text && parsedLastQuote.category) {
        displaySpecificQuote(parsedLastQuote);
        showMessage("Last viewed quote loaded from session.", "info");
      } else {
        // Fallback if session storage content is corrupted or incomplete
        if (quotesLoaded) { // Only show random if quotes were loaded from local storage
          showRandomQuote();
        } else {
          displaySpecificQuote({ text: "Welcome! Add your first quote.", category: "Getting Started" });
        }
      }
    } else {
      // If no last viewed quote in session, show a random one from loaded quotes (or initial ones if none in local storage)
      showRandomQuote();
    }
  } catch (e) {
    console.error("Error parsing last viewed quote from Session Storage:", e);
    showMessage("Could not load last viewed quote. Session data might be corrupted.", "error");
    showRandomQuote(); // Fallback to showing a random quote
  }


  // 3. Dynamically create the add quote form
  createAddQuoteForm();
});
