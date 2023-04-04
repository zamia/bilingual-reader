'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.action.onClicked.addListener(async (tab) => {
  console.log('extension icon clicked');

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"]
  }).then(() => console.log("script injected"))
  .catch((err) => console.warn("unexpected error", err))
});

