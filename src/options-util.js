const LanguageUtil = {

  getFirstNonEnglishLanguage: function() {
    const languages = navigator.languages || [navigator.language || navigator.userLanguage];

    for (const language of languages) {
      if (!language.startsWith('en')) {
        return language;
      }
    }

    return 'zh-CN';
  },
  
  async getUserLanguage() {
    let targetLang;

    const result = await chrome.storage.local.get(["language"]);
    if (result.language) {
      targetLang = result.language;
    } else {
      targetLang = this.getFirstNonEnglishLanguage();   
    }
    
    return targetLang;
  },

  async getUserFontSize() {
    let fontSize = 1.2;

    const result = await chrome.storage.local.get(["fontSize"]);
    if (result.fontSize) {
      fontSize = +result.fontSize
    }
    
    return fontSize;
  }
  
};

export default LanguageUtil;