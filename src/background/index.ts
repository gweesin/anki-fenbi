console.log('background is running')

function getUrlParams(url:string, param:string) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(param);
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background received message:', request?.count);
    // No sendResponse needed here unless you want one
  }

  if (request.type === 'FETCH_QUIZ_KEYPOINT') {
    const { quizId, keypointId } = request;
    const routecs = getUrlParams(sender.tab!.url!, 'routecs') || 'xingce';

    // Call an async IIFE or a separate function
    (async () => {
      const response = await fetch(`https://tiku.fenbi.com/api/${routecs}/quizKeypoint?keypointId=${keypointId}&quizId=${quizId}&kav=121&av=121&hav=121&app=web`, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site"
        },
        "referrer": "https://spa.fenbi.com/",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      });

      const json = await response.json() as QuizKeyPointResponse;
      sendResponse(json);
    })();
  }

  return true;
});
