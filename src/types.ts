export interface NetworkObserver {
  filter: (data: { url: string, data: any }) => boolean;
  handler: Function
}

export interface Response<T> {
  code: number
  data: T
  msg: string
}

export interface SolutionCard {
  children: SolutionCardChild[]
  nodeType: number
  type: number
}

export interface SolutionCardChild {
  children: SolutionCardGrandChild[]
  desc: string
  name: string
  nodeType: number
  questionCount: number
}

export interface SolutionCardGrandChild {
  key: string
  materialKeys: string[]
  nodeType: number
}

export interface SolutionMaterial {
  accessories: any[]
  content: string
  globalId: string;
  id: number;
  tikuPrefix: string
}

export interface SolutionResponse {
  card: SolutionCard
  materials: SolutionMaterial[]

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
  accessories: [{ options: string[], type: number }]
  solution: string
  source: string
  keypoints: { id: number, name: string }[]
  quizId: number
  solutionAccessories: any[]
  correctAnswer: { choice: string, type: number }
}

export type SolutionWithMeta = SolutionData & { quizMeta: QuizMetaInfo, background?: string };

export interface GetSolutionResponseData {
  /** 练习集 id */
  exerciseId: string,

  /** 练习集名称 */
  name: string,

  /** 练习集对应的试卷 id 和类型（行测、申论等） */
  ancientExerciseId: {
    id: number,
    tikuPrefix: string
  },

  /** 练习册类型，1 表示普通练习册，2 表示专项练习册 */
  sheetType: number,

  /** 开关信息，包括各种功能开关和请求 key */
  switchVO: {
    flags: string[],
    requestKey: string,
    pdf: {
      type: number,
      urls: string[]
    }
  },

  /** 静态资源信息，包括静态资源类型和 URL 列表 */
  staticUrl: {
    type: number,
    urls: string[]
  },

  /** 用户的答案数据，初始为空对象 */
  userAnswers: Record<string, any>,

  /** 其他特征信息，初始为空对象 */
  feature: Record<string, any>
}

export interface QuizMetaInfoMap {
  [key: string]: QuizMetaInfo
}

export interface QuizMetaInfo {
  id: number;
  wrongCount: number,
  totalCount: number,
  mostWrongAnswer: {
    choice: string,
    type: number
  },
  correctRatio: number
}
