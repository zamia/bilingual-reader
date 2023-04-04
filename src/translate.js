import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const azureKey = "8baf1645a12640b68ee5ffdfd45e010e";
const azureEndpoint = "https://api.cognitive.microsofttranslator.com/";
// const azureEndpoint = "https://split-translator-01.cognitiveservices.azure.com/";
const azureLocation = 'westus2';

export const AzureTranslator = {
  async translateHtml(text, options = {}) {
    const response = await axios({
      baseURL: azureEndpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Ocp-Apim-Subscription-Region': azureLocation,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      params: {
        'api-version': '3.0',
        'textType': 'html',
        'to': [options['targetLang'] || 'zh-CN'],
      },
      data: [{
        'text': text
      }],
      responseType: 'json'
    });

    return response.data[0].translations[0].text;
  },
};


const GoogleApiKey = "AIzaSyCXLK3kpcwEOo4n7wT220bnNKr8VcDRD18"; 
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
