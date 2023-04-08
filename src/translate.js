import axios from "axios";

// const azureEndpoint = "https://api.cognitive.microsofttranslator.com/";
const azureAuthURL = "https://edge.microsoft.com/translate/auth";
const azureEndpoint = "https://api-edge.cognitive.microsofttranslator.com/";
const MaxLength = 45000;

function findSafeSplitIndex(htmlString, maxLength) {
  let splitIndex = maxLength;
  let openTag = false;

  for (let i = 0; i < htmlString.length; i++) {
    if (htmlString[i] === '<') {
      openTag = true;
    } else if (htmlString[i] === '>') {
      openTag = false;
    }

    if (i === maxLength) {
      if (openTag) {
        while (htmlString[i] !== '>') {
          i--;
        }
      }
      splitIndex = i;
      break;
    }
  }
  return splitIndex;
}

function splitHtmlString(htmlString, maxLength) {
  const chunks = [];
  let remainingString = htmlString;

  while (remainingString.length > maxLength) {
    const splitIndex = findSafeSplitIndex(remainingString, maxLength);
    const chunk = remainingString.substring(0, splitIndex);
    chunks.push(chunk);
    remainingString = remainingString.substring(splitIndex);
  }

  chunks.push(remainingString);
  return chunks;
}

async function translate(text, options = {}) {
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
};

export const AzureTranslator = {
  async translateHtml(htmlString, options) {
    const chunks = splitHtmlString(htmlString, MaxLength);
    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
      return await translate(chunk, options); // 假设 translate 是你的翻译函数
    }));

    return translatedChunks.join('');
  }
};
