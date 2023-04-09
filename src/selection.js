function highlightTranslationOnSelection(sourceContainer, customDivWrapper) {
  const selection = window.getSelection();
  if (selection.isCollapsed) {
    clearHighlight(customDivWrapper);
    return;
  };

  const range = selection.getRangeAt(0);
  let selectedNode = range.startContainer;

  // 如果选中的节点是 TextNode，获取其父元素
  if (selectedNode.nodeType === Node.TEXT_NODE) {
    selectedNode = selectedNode.parentNode;
  }
  
  const originalParagraph = selectedNode.closest("[z]");
  if (!originalParagraph) return;

  const anchorId = originalParagraph.getAttribute("z");

  const translatedParagraph = customDivWrapper.querySelector(
    `#custom-div [z="${anchorId}"]`
  );

  if (!translatedParagraph) return;

  // 为高亮段落添加一个特定的类名，例如 'highlighted'
  translatedParagraph.classList.add("highlighted");
}

function clearHighlight(customDivWrapper) {
  const highlighted = customDivWrapper.querySelector("#custom-div .highlighted");
  if (highlighted) {
    highlighted.classList.remove("highlighted");
  }
}

// 添加事件监听器
export function addSelectionListener(sourceContainer, customDivWrapper) {
  sourceContainer.addEventListener("selectionchange", () => {
    clearHighlight(customDivWrapper);
    highlightTranslationOnSelection(sourceContainer, customDivWrapper);
  });
}