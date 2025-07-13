// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readAloud") {
    readTextAloud(request.text);
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
  
  // Load saved settings and apply them
  chrome.storage.sync.get({
    selectedVoice: 0,
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  }, function(items) {
    // Apply voice setting
    const voices = window.speechSynthesis.getVoices();
    if (voices[items.selectedVoice]) {
      utterance.voice = voices[items.selectedVoice];
    } else if (voices.length > 0) {
      // Fallback to first available voice
      utterance.voice = voices[0];
    }
    
    // Apply other settings
    utterance.rate = items.speed;
    utterance.pitch = items.pitch;
    utterance.volume = items.volume;
    
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