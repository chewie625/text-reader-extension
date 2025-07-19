// Create context menu when extension is installed
let readingTabs = {};

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

// Listen for messages from content scripts about reading state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return;
  const tabId = sender.tab.id;
  if (message.action === "readingStarted") {
    readingTabs[tabId] = true;
    chrome.contextMenus.update("stopReading", { enabled: true });
  } else if (message.action === "readingStopped") {
    readingTabs[tabId] = false;
    chrome.contextMenus.update("stopReading", { enabled: false });
  }
}); 