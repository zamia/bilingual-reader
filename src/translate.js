import axios from "axios";

// const azureEndpoint = "https://api.cognitive.microsofttranslator.com/";
const azureAuthURL = "https://edge.microsoft.com/translate/auth";
const azureEndpoint = "https://api-edge.cognitive.microsofttranslator.com/";

export const AzureTranslator = {
  async translateHtml(text, options = {}) {
    try {
      const authReponse = await axios.get(azureAuthURL);
      const authCode = authReponse.data;

      const response = await axios({
        baseURL: azureEndpoint,
        url: '/translate',
        method: 'post',
        headers: {
          // 'Ocp-Apim-Subscription-Key': azureKey,
          // 'Ocp-Apim-Subscription-Region': azureLocation,
          'Content-type': 'application/json',
          "authorization": `Bearer ${authCode}`
        },
        params: {
          'api-version': '3.0',
          'textType': 'html',
          'to': [options.targetLang || 'zh-CN'],
        },
        data: [{
          'text': text
        }],
        responseType: 'json'
      });

      return response.data[0].translations[0].text;
    } catch (error) {
      console.log(error);
    }
  }
};


const GoogleApiKey = ""; 
export var GoogleTranslator = {
  async translateHtml(text, options = {}) {
    const apiKey = GoogleApiKey;
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        format: options['format'] || 'html',
        target: options['targetLang'] || 'zh-CN',
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error translating HTML:", data.error.message);
      return html;
    }

    return data.data.translations[0].translatedText;
  }
};
