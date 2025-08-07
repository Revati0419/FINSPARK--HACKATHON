// Background script for Bank Buddy Extension
console.log('Bank Buddy Extension loaded!');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bank Buddy Extension installed successfully!');
  
  // Set default settings
  chrome.storage.sync.set({
    language: 'hi', // Default to Hindi
    voiceEnabled: false,
    assistantEnabled: true
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['language', 'voiceEnabled', 'assistantEnabled'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Context menu for quick translation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-text",
    title: "Translate to Hindi/Marathi",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-text") {
    chrome.tabs.sendMessage(tab.id, {
      action: "translateSelection",
      text: info.selectionText
    });
  }
});