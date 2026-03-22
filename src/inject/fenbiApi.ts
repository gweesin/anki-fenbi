import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { GetSolutionResponseData, QuizMetaInfoMap, Response, SolutionResponse } from '../types'

interface GetSolutionParams {
  key: string,
  routes: string
}

const fenbiApi = axios.create({
  baseURL: 'https://tiku.fenbi.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

fenbiApi.interceptors.request.use(config => {
  config.params = Object.assign({ kav: 125, av: 125, hav: 125, app: 'web' }, config.params)

  return config
})

function extractParams(url: string): GetSolutionParams {
  const urlObj = new URL(url)
  const pathSegments = urlObj.pathname.split('/').filter(segment => segment) // 过滤空字符串
  const solutionIndex = pathSegments.indexOf('solution')

  const searchParams = new URLSearchParams(urlObj.search)

  let result: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    result[key] = value
  })

  if (pathSegments[solutionIndex + 1]) {
    result.key = pathSegments[solutionIndex + 1]
  }

  return result as unknown as GetSolutionParams
}

export async function fetchGetSolution() {
  const axiosResponse: AxiosResponse<Response<GetSolutionResponseData>> = await fenbiApi.get(`/combine/exercise/getSolution`, {
    params: Object.assign({ format: 'html' }, extractParams(document.URL)),
  })

  return axiosResponse.data.data
}

export async function fetchSolution(url: string) {
  const response: AxiosResponse<SolutionResponse> = await fenbiApi.get(url, {
    params: extractParams(document.URL),
  })
  return response.data
}

export async function fetchQuizKeyPoint(quizId: number, keypointId: number) {
  const routecs = new URLSearchParams(window.location.search).get('routecs') || 'xingce'
  const response: AxiosResponse<QuizKeyPointResponse> = await fenbiApi.get(`/api/${routecs}/quizKeypoint`, {
    params: { quizId, keypointId },
  })

  return response.data
}

export async function fetchGetMeta(requestKey: string) {
  const routecs = new URLSearchParams(window.location.search).get('routecs') || 'xingce'
  const response: AxiosResponse<Response<QuizMetaInfoMap>> = await fenbiApi.get('/combine/question/getMeta', {
    params: { routecs, requestKey },
  })

  return response.data.data

}
