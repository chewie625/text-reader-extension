// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readAloud") {
    readTextAloud(request.text);
  }
  if (request.action === "stopReading") {
    window.speechSynthesis.cancel();
    chrome.runtime.sendMessage({ action: "readingStopped" });
  }
});

// Listen for Delete key to stop reading
window.addEventListener('keydown', function(event) {
  if (event.key === 'Delete') {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      chrome.runtime.sendMessage({ action: "readingStopped" });
    }
  }
  // Listen for 'r' key to read selected text
  if (event.key === 'r' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
    // Only trigger if focus is not in an input, textarea, or contenteditable
    const active = document.activeElement;
    const isEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (!isEditable) {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : '';
      if (selectedText) {
        readTextAloud(selectedText);
      }
    }
  }
});

// Function to read text aloud using Web Speech API
function readTextAloud(text) {
  // Stop any existing speech
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // Create a new speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Get user-selected voice and settings from storage
  chrome.storage.sync.get({
    selectedVoice: 0,
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  }, function(items) {
    const voices = window.speechSynthesis.getVoices();
    if (voices[items.selectedVoice]) {
      utterance.voice = voices[items.selectedVoice];
    }
    utterance.rate = items.speed;
    utterance.pitch = items.pitch;
    utterance.volume = items.volume;

    // Notify background that reading started
    chrome.runtime.sendMessage({ action: "readingStarted" });

    // When reading ends, notify background
    utterance.onend = function() {
      chrome.runtime.sendMessage({ action: "readingStopped" });
    };
    utterance.onerror = function() {
      chrome.runtime.sendMessage({ action: "readingStopped" });
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);

    // Optional: Add visual feedback
    showReadingIndicator();
  });
}

// Function to show visual feedback that text is being read
function showReadingIndicator() {
  // Remove any existing indicator
  const existingIndicator = document.getElementById('text-reader-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Create indicator
  const indicator = document.createElement('div');
  indicator.id = 'text-reader-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: fadeInOut 3s ease-in-out;
  `;
  
  indicator.textContent = '🔊 Reading text...';
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(indicator);
  
  // Remove indicator after animation
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.remove();
    }
  }, 3000);
} 