// Create context menu when extension is installed
let readingTabs = {};
let currentVoiceLang = null;
let currentVoiceLabel = null;

function updateReadAloudMenuLabel() {
  let label = 'Read out loud';
  if (currentVoiceLang) {
    try {
      const displayNames = new Intl.DisplayNames([navigator.language], { type: 'language' });
      // Use only the language part (e.g., 'de' from 'de-DE')
      const langPart = currentVoiceLang.split('-')[0];
      const languageName = displayNames.of(langPart);
      if (languageName) {
        label = `Read out loud (${languageName})`;
      }
    } catch (e) {
      // Fallback: just show the language code
      label = `Read out loud (${currentVoiceLang})`;
    }
  }
  chrome.contextMenus.update('readAloud', { title: label });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Read out loud",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "stopReading",
    title: "Stop Reading",
    contexts: ["all"],
    enabled: false
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readAloud") {
    // Send message to content script to read the selected text
    chrome.tabs.sendMessage(tab.id, {
      action: "readAloud",
      text: info.selectionText
    });
  }
  if (info.menuItemId === "stopReading") {
    chrome.tabs.sendMessage(tab.id, {
      action: "stopReading"
    });
  }
});

// Listen for messages from content scripts about reading state and selected voice
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "voiceChanged") {
    currentVoiceLang = message.lang || null;
    updateReadAloudMenuLabel();
  }
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (message.action === "readingStarted") {
      readingTabs[tabId] = true;
      chrome.contextMenus.update("stopReading", { enabled: true });
    } else if (message.action === "readingStopped") {
      readingTabs[tabId] = false;
      chrome.contextMenus.update("stopReading", { enabled: false });
    }
  }
}); 