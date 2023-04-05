'use strict';

import pageLayoutUtil from './util.js';
import "./layout.scss";
import "./style.scss";
import "./loading.scss";

let layoutCreated = false; //first time
let layoutSplitted = false; // splitted
let currentTabId;

async function splitLayout(tabId) {
  console.log(`layoutSplitted: ${layoutSplitted}`);
  
  if (!layoutSplitted) {
    if (!layoutCreated) {
      await pageLayoutUtil.splitWebPage();
      // 显示加载界面
      const loadingOverlay = document.querySelector('#loading-overlay');
      loadingOverlay.style.display = 'flex';
      
      await pageLayoutUtil.translatePage();
      pageLayoutUtil.showSplit();
      layoutCreated = !layoutCreated;
      
      // 隐藏加载界面
      loadingOverlay.style.display = 'none';

    } else {
      pageLayoutUtil.showSplit();
    }

    chrome.runtime.sendMessage({ tabId: tabId, action: 'changeIcon' });
  } else {
    pageLayoutUtil.hideSplit();
    chrome.runtime.sendMessage({ tabId: tabId, action: 'changeIcon', reset: true });
  }

  layoutSplitted = !layoutSplitted;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "splitLayout") {
    console.log(`message received: splitLayout, tabId: ${request.tabId}`);

    currentTabId = request.tabId;
    splitLayout(currentTabId);
  }
});
