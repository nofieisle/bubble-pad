chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-bubble-pad") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId !== undefined) {
        chrome.tabs.sendMessage(tabId, { action: "toggle-bubble-pad" });
      }
    });
  }
});
