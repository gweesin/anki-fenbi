const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inject.ts.js');
script.type = 'module';
(document.head || document.documentElement).appendChild(script);

console.info('contentScript is running')

// async function fetchQuizKeyPoint(quizId: number, keypointId: number) {
//   const response = await chrome.runtime.sendMessage({ type: 'FETCH_QUIZ_KEYPOINT', quizId, keypointId }) as QuizKeyPointResponse
//   console.log('Fetched quiz keypoint:', response);
// }

// fetchQuizKeyPoint(95,841947,)

// 接收来自 inject.js 的数据
// window.addEventListener("message", (event) => {
//   if (event.data.type === 'FETCH_DATA') {
//     console.log("监听到请求数据：", event.data.data);
//   }
// });
