document.getElementById("openAssistant").addEventListener("click", () => {
    chrome.scripting.executeScript({
      target: { tabId: chrome.tabs.TAB_ID_CURRENT },
      files: ["content.js"]
    });
  });
  
  document.getElementById("translatePage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          document.body.innerHTML = document.body.innerHTML.replace(/Transfer/g, "स्थानांतरण");
        }
      });
    });
  });
  