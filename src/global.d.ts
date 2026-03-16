/// <reference types="vite/client" />
interface KeyPointInfo {
  id: number
  name: string
  count: number
  optional: boolean
  children: null
  requestNum: number
  requestType: number
  additional: boolean
  keypointType: number
  parentId: number
  level: number
  desc: string | null
  giantOnly: boolean
  choiceOnly: boolean
}

interface QuizKeyPointResponse {
  keypoint: KeyPointInfo
  frequency: number
  path: KeyPointInfo[]
}
