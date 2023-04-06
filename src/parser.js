import Parser from '@postlight/parser';
import { Readability } from '@mozilla/readability';
import { AzureTranslator as translator } from "./translate.js";

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

function removeAttributesFromParagraphs(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('div, p, img, a, h1, h2, h3, h4, h5, h6, ul, ol, li');

  paragraphs.forEach((paragraph) => {
    paragraph.removeAttribute('id');
    paragraph.removeAttribute('dir');
    paragraph.removeAttribute('tabindex');
    paragraph.removeAttribute('data-selectable-paragraph');
  });

  return doc.documentElement.innerHTML;
}

// @postlight/parser 只能处理当前的 document，不接受传参，因此它的调用时机要注意, 否则可能会出错
async function generateMeta(){
  const article = await Parser.parse();
  const {title, author, excerpt} = article; 
  const metaHtml = `
    <h1>${title}</h1>
    <author class="notranslate">${author ? author : ""}</author>
  `;
  return metaHtml;
}

async function generateReaderContent(doc) {
  console.log(`start to generate reader content`);
  
  const reader = new Readability(doc, {
    keepClasses: false,
    classesToPreserve: ["z", "notranslate"]
  });
  const { content } = await reader.parse();
  
  return content;
}

const parser = {
  async parseDocument(doc) {
    // 先调用 meta 生成
    const metaHtml = await generateMeta();

    doc = addNotranslateClass(doc);
    doc = loadImageSrcFromDataSrc(doc);
    const content = await generateReaderContent(doc);
    
    const readerContent = removeAttributesFromParagraphs(metaHtml + content);
    return readerContent;
  },

  async translateDocument(doc, targetLang) {
    let content = "";
    try {
      content = await translator.translateHtml(doc, {targetLang: targetLang});
    } catch (e) {
      console.log(`tranlate content error: ${e}`);
    }
    return content;
  }
}

export default parser; 