import OptionsUtil from './options-util.js';

export function updateFontSize(fontSize) {
  const customDivContent = document.getElementById('custom-div');
  customDivContent.style.setProperty("--font-size", `${fontSize}em`);
}

export async function addControlsListener() {
  let fontSize = await OptionsUtil.getUserFontSize();

  const fontSizeDecreaseBtn = document.getElementById('split-translator-decrease');
  fontSizeDecreaseBtn.addEventListener('click', () => {
    fontSize -= 0.1;
    updateFontSize(fontSize);
  });

  const fontSizeIncreaseBtn = document.getElementById('split-translator-increase');
  fontSizeIncreaseBtn.addEventListener('click', () => {
    fontSize += 0.1;
    console.log(fontSize);
    updateFontSize(fontSize);
  });

  const settingsBtn = document.getElementById('split-translator-settings');
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({"action": "OpenOptionsPage"});
  });

  const refreshBtn = document.getElementById('split-translator-refresh');
  refreshBtn.addEventListener('click', () => {
    console.log("send message refreshLayout");
    refreshBtn.dispatchEvent(new Event("refreshLayout", { bubbles: true }));
  });

}