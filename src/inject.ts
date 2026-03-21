import './inject/AnkiButton'
import type { QuizMetaInfoMap, SolutionData } from './types'
import { fetchGetMeta, fetchGetSolution, fetchSolution } from './inject/fenbiApi'
import { debounce } from 'es-toolkit'

function injectButtons(quizMetaMap: QuizMetaInfoMap, solutions: SolutionData[]) {
  const tiContainers = document.querySelectorAll('.tis-container .ti-container');
  tiContainers.forEach(tiContainer => {
    const titleRight = tiContainer.querySelector('.title-right');
    if (titleRight && !titleRight.querySelector('anki-button')) {
      // Find the closest .ti element
      const questionEl = titleRight.closest('.ti');
      let solutionItem: SolutionData | undefined;
      if (questionEl) {
        // Find globalId
        const resultSection = questionEl.querySelector('app-result-common .result-common-section');
        const globalId = resultSection?.getAttribute('id')?.replace(/([a-zA-Z]+-){2,}/, '');
        if (globalId) {
          solutionItem = solutions.find(item => item.globalId === globalId);
        }
      }
      const button = document.createElement('anki-button');
      if (solutionItem) {
        // @ts-ignore
        button.data = solutionItem;
        button.quizMetaMap = quizMetaMap;
      }
      titleRight.appendChild(button);
    }
  });
}

(async function() {
  const solutionResponse = await fetchGetSolution()
  const solutions = await fetchSolution(solutionResponse.staticUrl.urls[0])

  const quizMetaMap =  await fetchGetMeta(solutionResponse.switchVO.requestKey)
  const debouncedInjectFn = debounce(() => injectButtons(quizMetaMap, solutions), 300)
  const observer = new MutationObserver(debouncedInjectFn);

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  debouncedInjectFn()
})();
