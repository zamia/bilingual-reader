'use strict';

import pageLayoutUtil from './util.js';
import "./layout.scss";
import "./style.scss";
import "./loading.scss";

let contentParsed = false; 
let layoutCreated = false; 
let layoutSplitted = false; 
let currentTabId;

async function splitLayout(tabId) {
  if (!layoutCreated) {
    pageLayoutUtil.createLayout();
    layoutCreated = !layoutCreated;
  }
  if (!contentParsed) {
    pageLayoutUtil.parseAndFill();
    contentParsed = !contentParsed;
  }
  if (!layoutSplitted) {
    pageLayoutUtil.showSplit();
    chrome.runtime.sendMessage({ tabId: tabId, action: 'changeIcon' });
  } else {
    pageLayoutUtil.hideSplit();
    chrome.runtime.sendMessage({ tabId: tabId, action: 'changeIcon', reset: true });
  }
  layoutSplitted = !layoutSplitted;
}

document.addEventListener("refreshLayout", () => {
  console.log(`event received: refreshLayout`);

  // clear old content
  pageLayoutUtil.clearParsedContent();
  pageLayoutUtil.parseAndFill();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "splitLayout") {
    console.log(`message received: splitLayout, tabId: ${request.tabId}`);
    currentTabId = request.tabId;
    splitLayout(currentTabId);
  }
});
