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
      <img id="split-translator-decrease" src="${minusIconURL}" alt="-" />
      <span>A</span>
      <img id="split-translator-increase" src="${plusIconURL}" alt="+" />
      <span class="divider"></span>
    </div>
    <div id="settings-controls">
      <img id="split-translator-refresh" src="${refreshIconURL}" alt="refresh" />
      <span>&nbsp;</span>
      <img id="split-translator-settings" src="${settingsIconURL}" alt="preferences" />
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
  const originalContentWrapper = document.createElement("iframe");
  originalContentWrapper.id = "original-content-wrapper";
  originalContentWrapper.src = window.location.href;
  originalContentWrapper.style.overflow = "auto";
  
  const originBodyElement = document.body;
  originBodyElement.classList.add("split-reader-active")
  
  originalContentWrapper.addEventListener('load', async () => {
    console.log("iframe load finished!");
    originalContentWrapper.classList.add("split-translator-loaded");
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

function extractAttributes(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const elements = doc.querySelectorAll("a, img, video, figure, source");
  const attributes = {};
  const attributeNames = ["src", "srcset", "data-src", "href", "sizes"];

  elements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase();
    const id = `${tagName}-${index}`;
    element.setAttribute("data-attr-id", id);
    const attrInfo = {
      id,
      tagName,
    };

    attributeNames.forEach((attrName) => {
      if (element.hasAttribute(attrName)) {
        attrInfo[attrName] = element.getAttribute(attrName);
        element.removeAttribute(attrName);
      }
    });

    attributes[id] = attrInfo;
  });

  return {
    updatedHtmlString: doc.body.innerHTML,
    attributes,
  };
}

function insertAttributes(translatedHtmlString, attributes) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(translatedHtmlString, "text/html");

  const supportedTags = ["a", "img", "video", "figure", "source"];
  const supportedAttributes = ["src", "srcset", "data-src", "href", "sizes"];

  const nodes = doc.querySelectorAll(supportedTags.join(', '));
  nodes.forEach((node) => {
    const id = node.getAttribute("data-attr-id");

    if (id && attributes[id]) {
      supportedAttributes.forEach((attribute) => {
        if (attributes[id][attribute]) {
          node.setAttribute(attribute, attributes[id][attribute]);
        }
      });
      node.removeAttribute("data-attr-id");
    }
  });
  
  return doc.body.innerHTML;
}


async function parseContent(document) {
  console.log(`parseCOntent called`);

  // clone document 出来分析内容
  const doc = document.cloneNode(true);
  const readerContent = await parser.parseDocument(doc);
  const { updatedHtmlString: updatedReaderContent, attributes } = extractAttributes(readerContent);

  const targetLang = await OptionsUtil.getUserLanguage();
  let translatedContent = await parser.translateDocument(updatedReaderContent, targetLang); 
  translatedContent = insertAttributes(translatedContent, attributes);
  
  return { readerContent, translatedContent };
}

async function realParseAndFill(iframeDoc) {
  // pre-process document
  addAnchorsToElements(iframeDoc);

  // UI 控件事件
  addScrollListener(iframeDoc, document.getElementById('custom-div-wrapper'));
  addSelectionListener(iframeDoc, document.getElementById('custom-div-wrapper'));

  showLoading();
  const { readerContent, translatedContent } = await parseContent(iframeDoc);

  const customDiv = document.getElementById("custom-div");
  // appendToElement(customDiv, "reader-content-wrapper", readerContent);
  appendToElement(customDiv, "translated-content-wrapper", translatedContent);
    
  hideLoading();
}

const pageLayoutUtil = {

  
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

    // for custom-div controls
    addControlsListener();
  },
  
  async parseAndFill() {
    console.log("parseAndFill was called!");
    const iframe = document.getElementById("original-content-wrapper");

    // 定义检查函数
    async function checkIframeLoaded() {
      if (iframe.classList.contains('split-translator-loaded')) {
        // 清除定时器
        clearInterval(checkInterval);

        // iframe 加载完成，执行后续操作
        await realParseAndFill(iframe.contentDocument || iframe.contentWindow.document);
      }
    }

    // 设置定时器，每隔 300 毫秒检查一次
    const checkInterval = setInterval(checkIframeLoaded, 300);

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

    const body = document.body;
    body.classList.add("split-reader-active");
  },

  hideSplit() {
    const container = document.querySelector("#split-view-container");
    if (container) {
      container.classList.add("hide");
    }
    const body = document.body;
    body.classList.remove("split-reader-active");
  },
};

export default pageLayoutUtil;