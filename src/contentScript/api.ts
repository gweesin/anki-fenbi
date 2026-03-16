import NetworkInterceptor from '../inject/NetworkInterceptor'
import { NetworkObserver, SolutionResponse } from '../types'

export async function getSolutionsResponse(): Promise<SolutionResponse> {
  return new Promise(resolve => {
    const observer: NetworkObserver = {
      filter: ({ url }) => {
        return url.includes('/combine/cdn/jam/solution') || url.includes('/combine/static/solution');
      },
      handler: (data: any) => {
        const json = JSON.parse(data.data);
        NetworkInterceptor.removeObserver(observer)
        return resolve(json);
      }
    }

    NetworkInterceptor.addObserver(observer);
  })
}

export async function invoke(action, params = {}, version = 6) {
  // const result = await GM.xmlHttpRequest({
  //   method: "POST",
  //   url: "http://127.0.0.1:8765",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   data: JSON.stringify({ action, version, params })
  // });
  //
  // try {
  //   const response = JSON.parse(result.responseText);
  //   if (Object.getOwnPropertyNames(response).length != 2) {
  //     throw 'response has an unexpected number of fields';
  //   }
  //   if (!response.hasOwnProperty('error')) {
  //     throw 'response is missing required error field';
  //   }
  //   if (!response.hasOwnProperty('result')) {
  //     throw 'response is missing required result field';
  //   }
  //   if (response.error) {
  //     throw response.error;
  //   }
  //   return response.result;
  // } catch (e) {
  //   return Promise.reject(e);
  // }
}
