// Initial array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "The mind is everything. What you think you become.", category: "Mindset" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Motivation" }
  ];
  
  // Get DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
  const addQuoteButton = document.getElementById('addQuoteButton');
  const messageBox = document.getElementById('messageBox');
  
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
   * Displays a random quote from the 'quotes' array in the DOM.
   * Clears previous content before displaying the new quote.
   */
  function displayRandomQuote() {
    // Clear existing content in the display area
    quoteDisplay.innerHTML = '';
  
    // If no quotes are available, display a message
    if (quotes.length === 0) {
      const noQuoteMessage = document.createElement('p');
      noQuoteMessage.className = 'text-gray-500 italic';
      noQuoteMessage.textContent = "No quotes available. Add some!";
      quoteDisplay.appendChild(noQuoteMessage);
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
  }
  
  /**
   * Adds a new quote to the 'quotes' array based on user input from the form.
   * Clears input fields and updates the display.
   */
  function addQuote() {
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
  
    // Optionally, show the newly added quote or a confirmation message
    showMessage('Quote added successfully!', 'success');
    displayRandomQuote();
  }
  
  // --- Event Listeners ---
  
  // Event listener for the "Show New Quote" button
  newQuoteBtn.addEventListener('click', displayRandomQuote);
  
  // Event listener for the "Add Quote" button
  addQuoteButton.addEventListener('click', addQuote);
  
  // --- Initial setup on page load ---
  document.addEventListener('DOMContentLoaded', () => {
    // Display an initial random quote when the page loads
    displayRandomQuote();
  });
  