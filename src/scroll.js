function getCurrentAnchor(container) {
  const anchors = container.querySelectorAll('[data-anchor-id]');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let currentAnchor = anchors[0];

  anchors.forEach((anchor) => {
    const rect = anchor.getBoundingClientRect();
    if (rect.top <= scrollTop && rect.bottom > scrollTop) {
      currentAnchor = anchor;
    }
  });

  return currentAnchor;
}

function scrollToTranslatedAnchor(sourceContainer, targetContainer) {
  const currentAnchor = getCurrentAnchor(sourceContainer);
  const anchorId = currentAnchor.getAttribute('data-anchor-id');
  const translatedAnchor = targetContainer.querySelector(`[data-anchor-id="${anchorId}"]`);

  if (translatedAnchor) {
    translatedAnchor.scrollIntoView();
  }
}

export function addScrollListener() {
  const sourceContainer = document.getElementById('original-content-wrapper');
  const targetContainer = document.getElementById('custom-div-wrapper');

  sourceContainer.addEventListener('scroll', () => {
    scrollToTranslatedAnchor(sourceContainer, targetContainer);
  });

  console.log(`scroll listener added`);
}
