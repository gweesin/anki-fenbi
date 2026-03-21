import NetworkInterceptor from '../inject/NetworkInterceptor'
import { NetworkObserver, SolutionResponse } from '../types'

export async function getSolutionsResponse(): Promise<SolutionResponse> {
  return new Promise(resolve => {
    const observer: NetworkObserver = {
      filter: ({ url }) => {
        return url.includes('/combine/cdn/jam/solution') || url.includes('/combine/static/solution')
      },
      handler: (data: any) => {
        const json = JSON.parse(data.data)
        NetworkInterceptor.removeObserver(observer)
        return resolve(json)
      },
    }

    NetworkInterceptor.addObserver(observer)
  })
}
