function getCurrentAnchor(iframeDoc) {
  const anchors = iframeDoc.querySelectorAll('[z]');
  const scrollTop = iframeDoc.defaultView.pageYOffset || iframeDoc.documentElement.scrollTop;
  
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

function scrollToTranslatedAnchor(iframeDoc, customDivWrapper) {
  const currentAnchor = getCurrentAnchor(iframeDoc);
  const anchorId = currentAnchor.getAttribute('z');
  const translatedAnchor = customDivWrapper.querySelector(`[z="${anchorId}"]`);

  if (translatedAnchor) {
    translatedAnchor.scrollIntoView();
  }

  const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;

  // 检测滚动到顶部
  if (scrollTop <= 100) {
    customDivWrapper.scrollTop = 0;
  }
}

export function addScrollListener(iframeDoc, customDivWrapper) {
  iframeDoc.addEventListener('scroll', () => {
    scrollToTranslatedAnchor(iframeDoc, customDivWrapper);
  });
}
