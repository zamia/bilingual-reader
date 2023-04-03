const GoogleApiKey = "AIzaSyCXLK3kpcwEOo4n7wT220bnNKr8VcDRD18"; 

export async function translateHtml(text, options = {}) {
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