import { Readability } from "@mozilla/readability";
import { addScrollListener } from "./scroll.js";
import { addSelectionListener } from "./selection.js";
import { AzureTranslator as translator } from "./translate.js";
import parser from "./parser.js";

function createCustomDiv() {
  const customDivWrapper = document.createElement("div");
  customDivWrapper.id = "custom-div-wrapper";
  customDivWrapper.style.overflow = "auto";

  const customDiv = document.createElement("div");
  customDiv.id = "custom-div";

  customDivWrapper.appendChild(customDiv);

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
    element.setAttribute('data-anchor-id', `anchor-${index}`);
  });
}

const pageLayoutUtil = {
  
  splitWebPage() {
    const customDivWrapper = createCustomDiv();
    const originalContentWrapper = adjustOriginalContent();
    const splitViewContainer = createSplitViewContainer(
      originalContentWrapper,
      customDivWrapper
    );
    document.body.appendChild(splitViewContainer);

    addScrollListener();
    addSelectionListener();
  },
  resetWebPage() {
    const splitViewContainer = document.getElementById("split-view-container");
    const originalContentWrapper = document.getElementById("original-content-wrapper");

    while (originalContentWrapper.firstChild) {
      document.body.appendChild(originalContentWrapper.firstChild);
    }

    document.body.removeChild(splitViewContainer);
  },
  
  async translatePage() {
    // 获取原始内容节点
    let documentClone = document.cloneNode(true);
    documentClone = loadImageSrcFromDataSrc(documentClone);
    documentClone = addNotranslateClass(documentClone);
    
    const reader = new Readability(documentClone, {
      keepClasses: false,
      classesToPreserve: ["data-anchor-id", "notranslate"]
    });
    const article = await parser.parse();

    const { title, author, excerpt} = article; 
    const metaDataHtml = `
      <h1>${title}</h1>
      <author class="notranslate">${author}</author>
      <p class="excerpt">${excerpt}</p>
    `;
    const { content } = await reader.parse();
    
    // 在解析后的文章内容中插入 H1 元素
    const articleContentWithH1 = metaDataHtml + content;

    // 初始化
    let translatedContentHtml = articleContentWithH1;

    // 翻译整个提取到的文章内容，并保留 HTML 标签
    try {
      translatedContentHtml = await translator.translateHtml(articleContentWithH1);
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