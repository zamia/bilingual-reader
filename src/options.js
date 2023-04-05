import OptionsUtil from "./options-util";
import "./options.scss";

async function initUI() {
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'zh-TW', label: 'Chinese (Traditional)' },
    { value: 'es', label: 'Spanish' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ar', label: 'Arabic' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'bn', label: 'Bengali' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'de', label: 'German' },
    { value: 'ko', label: 'Korean' },
    { value: 'fr', label: 'French' },
    { value: 'it', label: 'Italian' },
    { value: 'nl', label: 'Dutch' },
    { value: 'sv', label: 'Swedish' },
    { value: 'pl', label: 'Polish' },
    { value: 'tr', label: 'Turkish' },
    { value: 'he', label: 'Hebrew' },
    { value: 'id', label: 'Indonesian' },
    { value: 'th', label: 'Thai' }
  ];
  const fontSizes = [
    { label: 'Small', value: 1.0 },
    { label: 'Medium', value: 1.2 },
    { label: 'Large', value: 1.4 },
  ];

  const languageSelect = document.getElementById("language-select");
  const fontSizeSelect = document.getElementById("font-size-select");

  languages.forEach(language => {
    const option = document.createElement("option");
    option.value = language.value;
    option.textContent = language.label;
    languageSelect.appendChild(option);
  });

  fontSizes.forEach(e => {
    const option = document.createElement("option");
    option.value = e.value;
    option.textContent = e.label;
    fontSizeSelect.appendChild(option);
  });

  languageSelect.addEventListener("change", event => {
    chrome.storage.local.set({ language: event.target.value });
  });

  fontSizeSelect.addEventListener("change", event => {
    chrome.storage.local.set({ fontSize: event.target.value });
  });

  const userLanguage = await OptionsUtil.getUserLanguage();
  console.log(userLanguage);
  if (userLanguage) {
    languageSelect.value = userLanguage;
  }

  // const userFontSize = await chrome.storage.local.get("fontSize");
  const userFontSize = await OptionsUtil.getUserFontSize();
  if (userFontSize) {
    fontSizeSelect.value = userFontSize;
  }
}

initUI();