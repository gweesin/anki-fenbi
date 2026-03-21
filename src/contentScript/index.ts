const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inject.ts.js');
script.type = 'module';
(document.head || document.documentElement).appendChild(script);
script.remove()

window.addEventListener("message", async (event: MessageEvent) => {
  // console.log("Content Script 收到任何消息了:", event.data);
  if (event.source !== window || event.data?.type !== 'CROSS_REQ') return;

  const { id, data } = event.data;

  // 转发给 Background (Service Worker)
  // 因为 Content Script 现在的 fetch 依然受目标站点的 CSP 限制
  // 所以最稳妥的是发给 Background 执行
  chrome.runtime.sendMessage({ type: 'FETCH_PROXY', data }, (response) => {
    // 收到结果后，传回给 Inject
    window.postMessage({
      type: 'CROSS_RES',
      id: id,
      data: response
    }, "*");
  });
});
