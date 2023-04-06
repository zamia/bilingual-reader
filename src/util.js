import { addScrollListener } from "./scroll.js";
import { addSelectionListener } from "./selection.js";
import parser from "./parser.js";
import { addControlsListener, updateFontSize } from "./controls.js";
import OptionsUtil from "./options-util.js";

function showLoading() {
  const loadingOverlay = document.querySelector('#loading-overlay');
  loadingOverlay.style.display = 'flex';
}
function hideLoading() {
  const loadingOverlay = document.querySelector('#loading-overlay');
  loadingOverlay.style.display = 'none';
}

function createCustomWrapper() {
  const customDivWrapper = document.createElement("div");
  customDivWrapper.id = "custom-div-wrapper";
  customDivWrapper.style.overflow = "auto";
  
  const customControls = document.createElement("div");
  customControls.id = "custom-controls";

  const minusIconURL = chrome.runtime.getURL('icons/MinusCircleOutlined.svg');
  const plusIconURL = chrome.runtime.getURL('icons/PlusCircleOutlined.svg');
  const settingsIconURL = chrome.runtime.getURL('icons/SettingsOutline.svg');
  const refreshIconURL = chrome.runtime.getURL('icons/RefreshOutlined.svg');

  customControls.innerHTML = `
    <div id="font-size-controls">
      <img id="font-size-decrease" src="${minusIconURL}" alt="-" />
      <span>A</span>
      <img id="font-size-increase" src="${plusIconURL}" alt="+" />
      <span class="divider"></span>
    </div>
    <div id="settings-controls">
      <img id="refresh" src="${refreshIconURL}" alt="refresh" />
      <span>&nbsp;</span>
      <img id="settings" src="${settingsIconURL}" alt="preferences" />
    </div>
  `;

  const customDiv = document.createElement("div");
  customDiv.id = "custom-div";
  customDiv.innerHTML = `
    <div id="loading-overlay">
      <div class="loader"></div>
      <div class="text"> Translating ... </div>
    </div>
  `
  const footer = document.createElement("div");
  footer.classList.add("footer");
  footer.innerHTML = `
    <p> A simple product made by <a target="_blank" href="https://twitter.com/medalhuang">@medalhuang</a> & chatGPT </p>
  `

  customDivWrapper.appendChild(customControls);
  customDivWrapper.appendChild(customDiv);
  customDivWrapper.appendChild(footer);

  return customDivWrapper;
}

function createOriginalWrapper() {
  const originalContentWrapper = document.createElement("div");
  originalContentWrapper.id = "original-content-wrapper";
  originalContentWrapper.style.overflow = "auto";

  const bodyChildren = Array.from(document.body.childNodes);

  bodyChildren.forEach((child) => {
    originalContentWrapper.appendChild(child);
  });

  return originalContentWrapper;
}

function createSplitViewContainer(originalContentWrapper, customDivWrapper) {
  const splitViewContainer = document.createElement("div");
  splitViewContainer.id = "split-view-container";

  splitViewContainer.appendChild(originalContentWrapper);
  splitViewContainer.appendChild(customDivWrapper);

  return splitViewContainer;
}

function addAnchorsToElements(doc) {
  const elements = doc.querySelectorAll('p, img, a, h1, h2, h3, h4, h5, h6, ul, ol, li');
  elements.forEach((element, index) => {
    element.setAttribute('z', `${index}`);
  });
}

function appendToElement(element, className, innerHTML) {
  const div = document.createElement("div");
  div.classList.add(className);
  div.innerHTML = innerHTML;
  
  element.appendChild(div);
};

const pageLayoutUtil = {
  preProcess() {
    addAnchorsToElements(document);
  },

  async parseContent(document) {
    // clone document 出来分析内容
    const doc = document.cloneNode(true);
    const readerContent = await parser.parseDocument(doc);
    const targetLang = await OptionsUtil.getUserLanguage();
    const translatedContent = await parser.translateDocument(readerContent, targetLang); 
    
    return { readerContent, translatedContent };
  },
  
  async createLayout() {
      // 构建 layout
    const splitViewContainer = createSplitViewContainer(
      createOriginalWrapper(),
      createCustomWrapper()
    );
    document.body.appendChild(splitViewContainer);
  
    // 根据用户配置初始化默认字体大小
    let userFontSize = await OptionsUtil.getUserFontSize();
    updateFontSize(userFontSize);

    // UI 控件事件
    addScrollListener();
    addSelectionListener();
    addControlsListener();
  },
  
  async parseAndFill() {
    this.preProcess(document);
    showLoading();
    const { readerContent, translatedContent } = await this.parseContent(document);

    const customDiv = document.getElementById("custom-div");
    // appendToElement(customDiv, "reader-content-wrapper", readerContent);
    appendToElement(customDiv, "translated-content-wrapper", translatedContent);
    
    hideLoading(); 
  },
  
  async clearParsedContent() {
    const customDiv = document.getElementById("custom-div");
    const elements = customDiv.querySelectorAll(".reader-content-wrapper, .translated-content-wrapper");
    elements.forEach((e) => e.remove());
  },
  
  showSplit() {
    const container = document.querySelector("#split-view-container");
    if (container) {
      container.classList.remove("hide");
    }
  },

  hideSplit() {
    const container = document.querySelector("#split-view-container");
    if (container) {
      container.classList.add("hide");
    }
  },
};

export default pageLayoutUtil;