'use strict';

function changeIcon(tabId, options = { reset: false }) {
  let path = {
    "16": "icons/splited-icon-16.png",
    "32": "icons/splited-icon-32.png",
    "48": "icons/splited-icon-48.png",
    "128": "icons/splited-icon-128.png"
  };

  if (options['reset']) {
    path = {
      "16": "icons/simple-icon-16.png",
      "32": "icons/simple-icon-32.png",
      "48": "icons/simple-icon-48.png",
      "128": "icons/simple-icon-128.png"
    };
  }
  chrome.action.setIcon({
    tabId: tabId,
    path: path 
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log(`extension icon clicked, current tab id: ${tab.id}`);

  chrome.tabs.sendMessage(tab.id, {
    action: "splitLayout",
    tabId: tab.id,
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'changeIcon') {
    console.log(`receive message changeIcon: ${request.tabId}`);

    const { tabId, reset} = request;
    changeIcon(tabId, { reset: reset});
  }
  if (request.action === 'OpenOptionsPage') {
    console.log(`receive message open options page`);

    chrome.runtime.openOptionsPage();
  }
});
