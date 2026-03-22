export async function requestAnki(action: string, params: Record<string, any> = {}, version = 6): Promise<any> {
  const requestId = Math.random().toString(36).slice(2)

  return new Promise((resolve) => {
    // 监听回调
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'CROSS_RES' && event.data.id === requestId) {
        window.removeEventListener('message', handler)
        resolve(event.data.data)
      }
    }
    window.addEventListener('message', handler)

    // 发起请求给 Content Script
    window.postMessage({
      type: 'CROSS_REQ',
      id: requestId,
      data: {
        params,
        action,
        version,
      },
    }, '*')
  })
}

export async function replaceFenbiUrlWithAnki(content: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const imgs = doc.querySelectorAll('img')

  for (const img of imgs) {
    const src = img.getAttribute('src')
    if (src && src.includes('/api/tarzan/images/')) {
      const url = new URL(`https:${src}`)
      const filename = url.pathname.split('/').pop()?.split('?')[0] || 'image.png'

      // Store in Anki using URL
      const ankiFilename = await requestAnki('storeMediaFile', {
        filename,
        url: `https:${src}`,
        deleteExisting: false, // TODO allow config
      })

      // Replace src
      img.setAttribute('src', ankiFilename)
    }
  }

  return doc.body.innerHTML
}
