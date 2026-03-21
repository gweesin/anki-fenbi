import axios from 'axios'

console.log('background is running')

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background received message:', request?.count)
    // No sendResponse needed here unless you want one
  }

  if (request.type === 'FETCH_PROXY') {
    const { action, params, version } = request.data
    invoke(action, params, version)
      .then(data => sendResponse(data))
      .catch(err => sendResponse(err))
  }

  return true
})

export async function invoke(action: string, params = {}, version = 6) {
  const { data: response } = await axios.post('http://127.0.0.1:8765', { action, version, params }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })

  if (Object.getOwnPropertyNames(response).length != 2) {
    return Promise.reject('response has an unexpected number of fields')
  }

  if (response.error) {
    return Promise.reject(response.error)
  }

  return response.result
}
