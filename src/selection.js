const HighlightClassName = "split-reader-highlighted";

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
 
  let highlightContainer;
  if (sourceContainer.contains(originalParagraph)) {
    highlightContainer = customDivWrapper;
  } else {
    highlightContainer = sourceContainer;
  }

  const translatedParagraph = highlightContainer.querySelector(
    `[z="${anchorId}"]`
  );

  if (!translatedParagraph) return;

  // 为高亮段落添加一个特定的类名，例如 'highlighted'
  translatedParagraph.classList.add(HighlightClassName);
}

function clearHighlight(container) {
  const highlighted = container.querySelector(`.${HighlightClassName}`);
  if (highlighted) {
    highlighted.classList.remove(HighlightClassName);
  }
}

// 添加事件监听器
export function addSelectionListener(sourceContainer, customDivWrapper) {
  document.addEventListener("selectionchange", () => {
    clearHighlight(sourceContainer);
    clearHighlight(customDivWrapper);
    highlightTranslationOnSelection(sourceContainer, customDivWrapper);
  });
}