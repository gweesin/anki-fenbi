import './inject/AnkiButton'
import type { QuizMetaInfoMap, SolutionData } from './types'
import { fetchGetMeta, fetchGetSolution, fetchSolution } from './inject/fenbiApi'
import { debounce } from 'es-toolkit'

const injectedGlobalIds = new Set<string>()

function injectButtons(quizMetaMap: QuizMetaInfoMap, solutions: SolutionData[]) {
  console.log('Inject ' + Date.now())
  const tiContainers = document.querySelectorAll('.tis-container .ti-container');
  tiContainers.forEach(tiContainer => {
    const titleRight = tiContainer.querySelector('.title-right')
    if (!titleRight || titleRight.querySelector('anki-button')) {
      return
    }

    // Find the closest .ti element
    const questionEl = titleRight.closest('.ti')
    if (!questionEl) {
      return
    }

    // Find globalId
    const resultSection = questionEl.querySelector('app-result-common .result-common-section')
    const globalId = resultSection?.getAttribute('id')?.replace(/([a-zA-Z]+-){2,}/, '')

    if (!globalId) {
      return
    }

    if (injectedGlobalIds.has(globalId)) {
      return
    }

    let solutionItem: SolutionData | undefined = solutions.find(item => item.globalId === globalId)
    if (!solutionItem) {
      return
    }

    const button = document.createElement('anki-button')

    // @ts-ignore
    solutionItem.quizMeta = quizMetaMap[solutionItem.globalId]!
    // @ts-ignore
    button.data = solutionItem

    titleRight.appendChild(button)

    injectedGlobalIds.add(globalId)
  })
}

(async function() {
  const solutionResponse = await fetchGetSolution()
  const solutions = await fetchSolution(solutionResponse.staticUrl.urls[0])

  const quizMetaMap = await fetchGetMeta(solutionResponse.switchVO.requestKey)

  const debouncedInjectFn = debounce(() => injectButtons(quizMetaMap, solutions), 1000, { edges: ['trailing'] })
  const observer = new MutationObserver(debouncedInjectFn)

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
})()
