import { Readability } from '@mozilla/readability';
import { AzureTranslator as translator } from "./translate.js";

function addNotranslateClass(element) {
  const elementsToSkip = element.querySelectorAll('pre, code');
  elementsToSkip.forEach((element) => {
    element.classList.add('notranslate');
  });

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

  return doc.body.innerHTML;
}

async function generateReaderContent(doc) {
  console.log(`start to generate reader content`);
  
  const reader = new Readability(doc, {
    keepClasses: false,
    classesToPreserve: ["z", "notranslate"]
  });
  const parsedContent = await reader.parse();
  const { title, byline, content } = parsedContent;

  const readerContent = `
    <h1>${title}</h1>
    <author class="notranslate">${byline ? byline : ""}</author>
    <div class="content">${content}</div>
  `;

  return readerContent;
}

function unescapeHTML(htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
}

function updateLazyLoadedImages(doc) {
  const imgElements = doc.querySelectorAll("img");

  imgElements.forEach((img) => {
    // 检查 img 的 src 是否为 1x1 透明 GIF
    if (
      img.src ===
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    ) {
      const nextSibling = img.nextElementSibling;
      // 检查 img 后面是否紧跟着 noscript 标签
      if (nextSibling && nextSibling.tagName.toLowerCase() === "noscript") {
        const parser = new DOMParser();
        const noscriptDoc = parser.parseFromString(
          unescapeHTML(nextSibling.innerHTML),
          "text/html"
        );
        const noscriptImg = noscriptDoc.querySelector("img");
        // 检查 noscript 标签内是否包含一个 img 元素
        if (noscriptImg) {
          img.src = noscriptImg.src;
          img.srcset = noscriptImg.srcset;
        }
      }
    }
  });
  
  return doc;
}

const parser = {
  async parseDocument(doc) {
    doc = addNotranslateClass(doc);
    doc = updateLazyLoadedImages(doc);
    const readerContent = await generateReaderContent(doc);
    console.log(readerContent);
    const cleanContent = removeAttributesFromParagraphs(readerContent);
    return cleanContent;
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