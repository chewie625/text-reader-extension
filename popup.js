let allVoices = [];
let currentLanguage = '';

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', function() {
    loadVoices();
    loadSettings();
    setupEventListeners();
});

// Load available voices
function loadVoices() {
    const voiceSelect = document.getElementById('voiceSelect');
    const languageSelect = document.getElementById('languageSelect');
    
    // Get voices from speech synthesis
    allVoices = speechSynthesis.getVoices();
    
    if (allVoices.length === 0) {
        speechSynthesis.onvoiceschanged = function() {
            loadVoices();
        };
        return;
    }

    // Populate language dropdown
    const languages = Array.from(new Set(allVoices.map(v => v.lang))).sort();
    languageSelect.innerHTML = '<option value="">All Languages</option>';
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelect.appendChild(option);
    });

    // Set language if previously selected
    chrome.storage.sync.get(['selectedLanguage'], function(result) {
        if (result.selectedLanguage) {
            languageSelect.value = result.selectedLanguage;
            currentLanguage = result.selectedLanguage;
        } else {
            currentLanguage = '';
        }
        populateVoices();
    });
}

function populateVoices() {
    const voiceSelect = document.getElementById('voiceSelect');
    let filteredVoices = allVoices;
    if (currentLanguage) {
        filteredVoices = allVoices.filter(v => v.lang === currentLanguage);
    }
    voiceSelect.innerHTML = '';
    filteredVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = allVoices.indexOf(voice); // Use index in allVoices for storage
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    // Load saved voice preference
    chrome.storage.sync.get(['selectedVoice'], function(result) {
        if (result.selectedVoice !== undefined) {
            voiceSelect.value = result.selectedVoice;
        }
    });
}

// Load saved settings
function loadSettings() {
    chrome.storage.sync.get({
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
    }, function(items) {
        document.getElementById('speedSlider').value = items.speed;
        document.getElementById('speedValue').textContent = items.speed.toFixed(1);
        
        document.getElementById('pitchSlider').value = items.pitch;
        document.getElementById('pitchValue').textContent = items.pitch.toFixed(1);
        
        document.getElementById('volumeSlider').value = items.volume;
        document.getElementById('volumeValue').textContent = items.volume.toFixed(1);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Voice selection
    document.getElementById('voiceSelect').addEventListener('change', function() {
        chrome.storage.sync.set({
            selectedVoice: parseInt(this.value)
        });
        // Notify background of the new voice's language
        const selectedVoiceIndex = parseInt(this.value);
        if (allVoices[selectedVoiceIndex]) {
            chrome.runtime.sendMessage({
                action: 'voiceChanged',
                lang: allVoices[selectedVoiceIndex].lang || null
            });
        }
    });
    
    // Speed slider
    document.getElementById('speedSlider').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('speedValue').textContent = value.toFixed(1);
        chrome.storage.sync.set({ speed: value });
    });
    
    // Pitch slider
    document.getElementById('pitchSlider').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('pitchValue').textContent = value.toFixed(1);
        chrome.storage.sync.set({ pitch: value });
    });
    
    // Volume slider
    document.getElementById('volumeSlider').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('volumeValue').textContent = value.toFixed(1);
        chrome.storage.sync.set({ volume: value });
    });
    
    // Test button
    document.getElementById('testButton').addEventListener('click', function() {
        const testText = document.getElementById('testText').value;
        if (testText.trim()) {
            testVoice(testText);
        }
    });

    // Language selection
    document.getElementById('languageSelect').addEventListener('change', function() {
        currentLanguage = this.value;
        chrome.storage.sync.set({ selectedLanguage: currentLanguage });
        populateVoices();
    });

    // Stop button
    document.getElementById('stopButton').addEventListener('click', function() {
        // Stop speech in the popup (if any)
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        // Tell all tabs to stop speech
        chrome.tabs.query({}, function(tabs) {
            for (let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, { action: "stopReading" });
            }
        });
    });
}

// Test voice with current settings
function testVoice(text) {
    // Stop any existing speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply current settings
    chrome.storage.sync.get({
        selectedVoice: 0,
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
    }, function(items) {
        const voices = speechSynthesis.getVoices();
        if (voices[items.selectedVoice]) {
            utterance.voice = voices[items.selectedVoice];
        }
        
        utterance.rate = items.speed;
        utterance.pitch = items.pitch;
        utterance.volume = items.volume;
        
        // Speak the text
        speechSynthesis.speak(utterance);
    });
} 