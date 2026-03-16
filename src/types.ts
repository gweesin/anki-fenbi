export type NetworkMethod = 'FETCH' | 'XHR';

export interface NetworkMessage {
  type: 'NETWORK_DATA';
  method: NetworkMethod;
  url: string;
  data: string; // 序列化后的响应内容
  status: number;
}

export interface NetworkObserver {
  filter: (data: { url: string, data: any }) => boolean;
  handler: Function
}

export interface Response<T> {
  code: number
  data: T
  msg: string
}

export interface SolutionResponse {
  card: any[]
  material: any[]

  /** 试卷标题  */
  name: string

  solutions: SolutionData[]
}

export interface SolutionData {
  id: number
  globalId: string
  tikuPrefix: string
  content: string
  type: number
  accessories: [{options: string[], type: number}]
  solution: string
  source: string
  keypoints: {id: number, name: string}[]
  quizId: number
  solutionAccessories: any[]
  correctAnswer: {choice: string, type: number}
}
