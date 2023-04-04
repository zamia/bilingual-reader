function highlightTranslationOnSelection() {
  const selection = window.getSelection();
  if (selection.isCollapsed) {
    clearHighlight();
    return;
  };

  const range = selection.getRangeAt(0);
  let selectedNode = range.startContainer;

  // 如果选中的节点是 TextNode，获取其父元素
  if (selectedNode.nodeType === Node.TEXT_NODE) {
    selectedNode = selectedNode.parentNode;
  }
  
  const originalParagraph = selectedNode.closest("[data-anchor-id]");
  if (!originalParagraph) return;

  const anchorId = originalParagraph.getAttribute("data-anchor-id");

  const translatedParagraph = document.querySelector(
    `#custom-div [data-anchor-id="${anchorId}"]`
  );

  if (!translatedParagraph) return;

  // 为高亮段落添加一个特定的类名，例如 'highlighted'
  translatedParagraph.classList.add("highlighted");
}

function clearHighlight() {
  const highlighted = document.querySelector("#custom-div .highlighted");
  if (highlighted) {
    highlighted.classList.remove("highlighted");
  }
}

// 添加事件监听器
export function addSelectionListener() {
  document.addEventListener("selectionchange", () => {
    clearHighlight();
    highlightTranslationOnSelection();
  });
}