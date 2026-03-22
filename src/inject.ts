import './inject/AnkiButton'
import type { SolutionWithMeta } from './types'
import { fetchGetMeta, fetchGetSolution, fetchSolution } from './inject/fenbiApi'
import { debounce } from 'es-toolkit'

const injectedGlobalIds = new Set<string>()

function injectButtons(solutions: SolutionWithMeta[]) {
  const tiContainers = Array.from(document.querySelectorAll('.tis-container .ti-container'))
  tiContainers.forEach(async tiContainer => {
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

    let solutionItem: SolutionWithMeta | undefined = solutions.find(item => item.globalId === globalId)
    if (!solutionItem) {
      return
    }

    const button = document.createElement('anki-button')

    // @ts-ignore
    button.data = solutionItem

    titleRight.appendChild(button)
    // @ts-ignore
    await button.updateComplete
    injectedGlobalIds.add(globalId)
  })
}

async function getSolutions() {
  const getSolutionResponseData = await fetchGetSolution()
  const solutionResponse = await fetchSolution(getSolutionResponseData.staticUrl.urls[0])

  const quizMetaMap = await fetchGetMeta(getSolutionResponseData.switchVO.requestKey)
  const materialMetaMap = solutionResponse.materials.reduce((acc, item) => {
    acc.set(item.globalId, item.content)
    return acc
  }, new Map<string, string>)

  const flatMapArray = solutionResponse.card.children.flatMap(solutionCard => solutionCard.children.flatMap(cardItem => cardItem))
  const materialKeyMap = flatMapArray.reduce((acc, item) => {
    if (item.materialKeys.length) {
      acc.set(item.key, item.materialKeys)
    }
    return acc
  }, new Map<string, string[]>);


  (solutionResponse.solutions as SolutionWithMeta[]).forEach(solutionItem => {
    solutionItem.quizMeta = quizMetaMap[solutionItem.globalId]

    const materialKeys = materialKeyMap.get(solutionItem.globalId)
    if (!materialKeys?.length) {
      return
    }

    solutionItem.background = materialKeys.map(key => materialMetaMap.get(key)).filter(Boolean).join('<br>')
  })

  return solutionResponse.solutions as SolutionWithMeta[]
}

(async function() {
  const solutions = await getSolutions()
  const debouncedInjectFn = debounce(() => injectButtons(solutions), 1000, { edges: ['trailing'] })
  const observer = new MutationObserver(debouncedInjectFn)

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
})()
