// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Read out loud",
    contexts: ["selection"]
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
}); 