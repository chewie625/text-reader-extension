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

// Function to read text aloud using Web Speech API
function readTextAloud(text) {
  // Stop any existing speech
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // Create a new speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure speech settings
  utterance.rate = 1.0; // Speed (0.1 to 10)
  utterance.pitch = 1.0; // Pitch (0 to 2)
  utterance.volume = 1.0; // Volume (0 to 1)
  
  // Try to use a natural-sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.lang.includes('en') && voice.name.includes('Natural')
  ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

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