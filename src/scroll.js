function getCurrentAnchor(sourceContainer) {
  const anchors = sourceContainer.querySelectorAll('[z]');
  const scrollTop = document.defaultView.pageYOffset || sourceContainer.scrollTop;
  
  let currentAnchor = anchors[0];
  let minDistance = Math.abs(anchors[0].offsetTop - scrollTop);

  for (let i = 1; i < anchors.length; i++) {
    const distance = Math.abs(anchors[i].offsetTop - scrollTop);
    if (distance < minDistance) {
      minDistance = distance;
      currentAnchor = anchors[i];
    }
  }

  return currentAnchor;
}

function scrollToTranslatedAnchor(sourceContainer, customDivWrapper) {
  const currentAnchor = getCurrentAnchor(sourceContainer);
  const anchorId = currentAnchor.getAttribute('z');
  const translatedAnchor = customDivWrapper.querySelector(`[z="${anchorId}"]`);

  if (translatedAnchor) {
    translatedAnchor.scrollIntoView();
  }

  const scrollTop = document.defaultView.pageYOffset || sourceContainer.scrollTop;

  // 检测滚动到顶部
  if (scrollTop <= 100) {
    customDivWrapper.scrollTop = 0;
  }
}

export function addScrollListener(sourceContainer, customDivWrapper) {
  sourceContainer.addEventListener('scroll', () => {
    scrollToTranslatedAnchor(sourceContainer, customDivWrapper);
  });
}
