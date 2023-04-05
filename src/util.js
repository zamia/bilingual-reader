import { Readability } from "@mozilla/readability";
import { addScrollListener } from "./scroll.js";
import { addSelectionListener } from "./selection.js";
import { AzureTranslator as translator } from "./translate.js";
import parser from "./parser.js";
import { addControlsListener, updateFontSize } from "./controls.js";
import OptionsUtil from "./options-util.js";

function createCustomDiv() {
  const customDivWrapper = document.createElement("div");
  customDivWrapper.id = "custom-div-wrapper";
  customDivWrapper.style.overflow = "auto";
  
  const customControls = document.createElement("div");
  customControls.id = "custom-controls";

  const minusIconURL = chrome.runtime.getURL('icons/MinusCircleOutlined.svg');
  const plusIconURL = chrome.runtime.getURL('icons/PlusCircleOutlined.svg');
  const settingsIconURL = chrome.runtime.getURL('icons/SettingsOutline.svg');

  customControls.innerHTML = `
    <div id="font-size-controls">
      <img id="font-size-decrease" src="${minusIconURL}" alt="-" />
      <span>A</span>
      <img id="font-size-increase" src="${plusIconURL}" alt="+" />
    </div>
    <div id="settings-controls">
      <img id="settings" src="${settingsIconURL}" alt="+" />
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

function adjustOriginalContent() {
  addAnchorsToElements();
  
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

function addNotranslateClass(element) {
  const elementsToSkip = element.querySelectorAll('pre, code');
  elementsToSkip.forEach((element) => {
    element.classList.add('notranslate');
  });

  return element;
}

function loadImageSrcFromDataSrc(element) {
  const images = element.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const dataSrc = img.getAttribute('data-src');
    if (dataSrc) {
      img.setAttribute('src', dataSrc);
    }
  }
  return element;
}

function addAnchorsToElements() {
  const elements = document.querySelectorAll('p, img, a, h1, h2, h3, h4, h5, h6, ul, ol, li');
  elements.forEach((element, index) => {
    element.setAttribute('z', `${index}`);
  });
}

function removeAttributesFromParagraphs(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('p, img, a, h1, h2, h3, h4, h5, h6, ul, ol, li');

  paragraphs.forEach((paragraph) => {
    paragraph.removeAttribute('id');
    paragraph.removeAttribute('data-selectable-paragraph');
  });

  return doc.documentElement.innerHTML;
}

const pageLayoutUtil = {
  
  async splitWebPage() {
    const customDivWrapper = createCustomDiv();
    const originalContentWrapper = adjustOriginalContent();
    const splitViewContainer = createSplitViewContainer(
      originalContentWrapper,
      customDivWrapper
    );
    document.body.appendChild(splitViewContainer);

    addScrollListener();
    addSelectionListener();
    addControlsListener();

    // init some ui
    let userFontSize = await OptionsUtil.getUserFontSize();
    updateFontSize(userFontSize);
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

  async translatePage() {
    // 获取原始内容节点
    let documentClone = document.cloneNode(true);
    documentClone = loadImageSrcFromDataSrc(documentClone);
    documentClone = addNotranslateClass(documentClone);

    const article = await parser.parse();
    const { title, author, excerpt} = article; 
    const metaDataHtml = `
      <h1>${title}</h1>
      <author class="notranslate">${author ? author : ""}</author>
      <p class="excerpt">${excerpt}</p>
    `;
    console.log(`translate page start`);
    console.log(metaDataHtml);
    
    const reader = new Readability(documentClone, {
      keepClasses: false,
      classesToPreserve: ["z", "notranslate"]
    });
    
    const { content } = await reader.parse();
    
    // 在解析后的文章内容中插入 H1 元素
    const articleContentWithH1 = metaDataHtml + content;

    // 初始化
    const cleanedContent = removeAttributesFromParagraphs(articleContentWithH1);
    let translatedContentHtml = cleanedContent;

    // 翻译整个提取到的文章内容，并保留 HTML 标签
    try {
      const targetLang = await OptionsUtil.getUserLanguage();
      translatedContentHtml = await translator.translateHtml(cleanedContent, {targetLang: targetLang});
    } catch (error) {
      // TODO: ignore first
    }

    // 创建一个新的节点，用于存放翻译后的内容
    const translatedContent = document.createElement("div");
    translatedContent.innerHTML = translatedContentHtml;

    const customDiv = document.getElementById('custom-div');

    // 清除原有子元素
    while (customDiv.firstChild) {
      customDiv.removeChild(customDiv.firstChild);
    }
    
    // 添加翻译后的子元素
    Array.from(translatedContent.childNodes).forEach((child) => {
      customDiv.appendChild(child);
    });
  },
};

export default pageLayoutUtil;