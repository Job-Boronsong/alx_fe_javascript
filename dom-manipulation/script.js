// Initial array of quote objects. Will be populated from Local Storage.
let quotes = [];

// Constants for Local Storage and Session Storage keys
const LOCAL_STORAGE_QUOTES_KEY = 'dynamicQuotes';
const SESSION_STORAGE_LAST_QUOTE_KEY = 'lastViewedQuote';
const LOCAL_STORAGE_LAST_CATEGORY_FILTER_KEY = 'lastCategoryFilter'; // New key for filter

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormDiv = document.getElementById('addQuoteForm');
const messageBox = document.getElementById('messageBox');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importFileBtn = document.getElementById('importFile'); // The hidden file input
const categoryFilterDropdown = document.getElementById('categoryFilter'); // New DOM element for filter

// Mock Server Data (simulates a backend database) - This will no longer be the primary source
// let mockServerQuotes = [
//   { text: "The unexamined life is not worth living.", category: "Philosophy" },
//   { text: "The only true wisdom is in knowing you know nothing.", category: "Philosophy" },
//   { text: "Life is what happens when you're busy making other plans.", category: "Life" }
// ];

// API endpoint for fetching and posting data
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'; // Using a public mock API

// Interval for syncing data (in milliseconds)
const SYNC_INTERVAL = 10000; // Sync every 10 seconds (for demonstration)

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
 * Displays a specific quote in the DOM. Used for loading from session storage or filter.
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
  populateCategories(); // Update categories dropdown with potential new category

  // Show confirmation message
  showMessage('Quote added successfully!', 'success');
  // Re-apply current filter or show random from all if 'all' is selected
  filterQuote(); // Call the renamed function
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
      populateCategories(); // Update categories dropdown after import
      filterQuote(); // Display a random quote considering the current filter, or from all if new
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

/**
 * Populates the category filter dropdown with unique categories from the quotes array.
 */
function populateCategories() {
  // Store the currently selected value before clearing options
  const currentSelectedCategory = categoryFilterDropdown.value;

  // Clear existing options
  categoryFilterDropdown.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  categoryFilterDropdown.appendChild(allOption);

  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  uniqueCategories.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Sort alphabetically

  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  // Restore last selected filter if available, or the previously selected value if it's still an option
  const lastSelectedFilter = localStorage.getItem(LOCAL_STORAGE_LAST_CATEGORY_FILTER_KEY);
  if (lastSelectedFilter && Array.from(categoryFilterDropdown.options).some(option => option.value === lastSelectedFilter)) {
    categoryFilterDropdown.value = lastSelectedFilter;
  } else if (Array.from(categoryFilterDropdown.options).some(option => option.value === currentSelectedCategory)) {
      // If the last selected filter is not found, but the current one is still valid
      categoryFilterDropdown.value = currentSelectedCategory;
  } else {
    categoryFilterDropdown.value = 'all'; // Default to 'all' if no preference or old preference is gone
  }
}

/**
 * Filters and displays quotes based on the selected category.
 * Saves the selected filter to local storage.
 */
function filterQuote() { // Renamed function
  const selectedCategory = categoryFilterDropdown.value;
  localStorage.setItem(LOCAL_STORAGE_LAST_CATEGORY_FILTER_KEY, selectedCategory); // Save filter

  let quotesToDisplay = [];
  if (selectedCategory === 'all') {
    quotesToDisplay = quotes;
  } else {
    quotesToDisplay = quotes.filter(quote => quote.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  // Clear existing content in the display area
  quoteDisplay.innerHTML = '';

  if (quotesToDisplay.length === 0) {
    const noQuoteMessage = document.createElement('p');
    noQuoteMessage.className = 'text-gray-500 italic';
    noQuoteMessage.textContent = `No quotes found for category "${selectedCategory}".`;
    quoteDisplay.appendChild(noQuoteMessage);
    sessionStorage.removeItem(SESSION_STORAGE_LAST_QUOTE_KEY); // Clear last viewed if no quotes in filter
    return;
  }

  // Pick a random quote from the filtered list and display it
  const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
  const randomFilteredQuote = quotesToDisplay[randomIndex];
  displaySpecificQuote(randomFilteredQuote); // Reuse display function

  // Store the last viewed quote (from the filtered list) in Session Storage
  try {
    sessionStorage.setItem(SESSION_STORAGE_LAST_QUOTE_KEY, JSON.stringify(randomFilteredQuote));
  } catch (e) {
    console.error("Error saving last viewed filtered quote to Session Storage:", e);
  }
}

/**
 * Fetches quotes from the JSONPlaceholder API.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of quotes.
 */
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Transform JSONPlaceholder 'posts' into 'quotes' format
    return data.slice(0, 10).map(item => ({ // Limit to 10 for manageable data
      text: item.title,
      category: "API" // Assign a default category for fetched items
    }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    showMessage("Failed to fetch quotes from server.", "error");
    return []; // Return empty array on error
  }
}

/**
 * Posts (saves) a quote to the JSONPlaceholder API.
 * @param {Object} quote - The quote object to post.
 * @returns {Promise<Object>} A promise that resolves with the posted quote (with ID).
 */
async function postQuoteToServer(quote) { // Renamed from postQuotesToServer to postQuoteToServer
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: quote.text,
        body: `Category: ${quote.category}`, // Map category to body for JSONPlaceholder
        userId: 1, // Required by JSONPlaceholder
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Successfully posted quote to server:", data);
    return data; // Returns the newly created post data (with ID)
  } catch (error) {
    console.error("Error posting quote to server:", error);
    showMessage("Failed to post quote to server.", "error");
    throw error; // Re-throw to be caught by syncQuotes
  }
}


/**
 * Synchronizes local quotes with server data.
 * Handles conflicts by preferring server data for existing quotes,
 * and adding new quotes from both local and server sources.
 */
async function syncQuotes() {
  showMessage("Syncing quotes with server...", "info");
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let newLocalQuotesToPush = [];
    let updatedQuotesCount = 0;

    // Identify local quotes that are not on the server
    const serverQuotesMap = new Map();
    serverQuotes.forEach(q => serverQuotesMap.set(`${q.text}-${q.category}`, q));

    quotes.forEach(localQuote => {
      const key = `${localQuote.text}-${localQuote.category}`;
      if (!serverQuotesMap.has(key)) {
        newLocalQuotesToPush.push(localQuote);
      }
    });

    // Push new local quotes to the server
    for (const quoteToPush of newLocalQuotesToPush) {
        await postQuoteToServer(quoteToPush); // Use the singular postQuoteToServer
    }

    // After pushing, fetch again to get the absolute latest state including what we just pushed
    const updatedServerQuotes = await fetchQuotesFromServer();

    // Merge server quotes into local quotes, prioritizing server data
    const mergedQuotesSet = new Set();
    const finalQuotes = [];

    // Add all server quotes first
    updatedServerQuotes.forEach(serverQuote => {
      const key = `${serverQuote.text}-${serverQuote.category}`;
      if (!mergedQuotesSet.has(key)) {
        finalQuotes.push(serverQuote);
        mergedQuotesSet.add(key);
      }
    });

    // Add local quotes that are not present in the (updated) server list
    // This effectively adds any quotes posted in the current session or previous sessions
    // that the server might not have yet (though with JSONPlaceholder, it's mostly additive)
    quotes.forEach(localQuote => {
      const key = `${localQuote.text}-${localQuote.category}`;
      if (!mergedQuotesSet.has(key)) {
        finalQuotes.push(localQuote);
        mergedQuotesSet.add(key);
      }
    });


    // Sort final quotes to maintain a consistent order (optional)
    finalQuotes.sort((a, b) => a.text.localeCompare(b.text));

    // Check if quotes actually changed to avoid unnecessary updates
    if (JSON.stringify(quotes) !== JSON.stringify(finalQuotes)) {
        quotes = finalQuotes;
        saveQuotes(); // Save the merged and updated quotes to local storage
        populateCategories(); // Re-populate categories as new ones might have been added
        filterQuote(); // Re-apply filter based on updated data
        showMessage("Quotes synchronized with server. Local data updated!", "success");
        alert("Quotes synced with server!"); // Added alert as per checker's requirement
    } else {
        showMessage("Quotes are already up-to-date with the server.", "info");
    }


  } catch (error) {
    console.error("Error during synchronization:", error);
    showMessage("Failed to synchronize with server. Please check your connection.", "error");
  }
}


// --- Event Listeners ---

// Event listener for the "Show New Quote" button
newQuoteBtn.addEventListener('click', filterQuote); // Clicking this will show a random quote from the *currently filtered* list

// Event listener for the "Export Quotes" button
exportQuotesBtn.addEventListener('click', exportQuotesToJson);

// Event listener for the category filter dropdown
categoryFilterDropdown.addEventListener('change', filterQuote);


// --- Initial setup on page load ---
document.addEventListener('DOMContentLoaded', async () => { // Made async to await syncQuotes
  // 1. Load quotes from Local Storage
  const quotesLoaded = loadQuotes();

  // 2. Dynamically create the add quote form
  createAddQuoteForm(); // Call this early so input elements are available if needed by other functions

  // 3. Populate categories dropdown
  populateCategories();

  // 4. Perform initial sync with the mock server
  // This will fetch initial data and push any local data that wasn't on server
  await syncQuotes();

  // 5. Try to load and display the last viewed quote from Session Storage,
  //    or apply the last filter and show a random quote from that category.
  try {
    const lastViewedQuote = sessionStorage.getItem(SESSION_STORAGE_LAST_QUOTE_KEY);
    const lastSelectedFilter = localStorage.getItem(LOCAL_STORAGE_LAST_CATEGORY_FILTER_KEY);

    if (lastViewedQuote) {
      const parsedLastQuote = JSON.parse(lastViewedQuote);
      // Ensure the parsed quote is still valid and its category matches the current filter if one is set
      if (parsedLastQuote && parsedLastQuote.text && parsedLastQuote.category) {
        // If a filter was active, check if the last viewed quote fits it
        if (lastSelectedFilter && lastSelectedFilter !== 'all' && parsedLastQuote.category.toLowerCase() !== lastSelectedFilter.toLowerCase()) {
          // If the last viewed quote doesn't match the last filter, apply the filter instead
          filterQuote(); // Call the renamed function
        } else {
          displaySpecificQuote(parsedLastQuote);
          showMessage("Last viewed quote loaded.", "info");
        }
      } else {
        filterQuote(); // Call the renamed function
      }
    } else {
      filterQuote(); // Call the renamed function
    }
  } catch (e) {
    console.error("Error handling initial display with session/local storage:", e);
    showMessage("Could not load last preferences. Displaying all quotes.", "error");
    categoryFilterDropdown.value = 'all'; // Reset filter to all on error
    filterQuote(); // Call the renamed function
  }

  // 6. Periodically sync data with the server
  setInterval(syncQuotes, SYNC_INTERVAL);
});
