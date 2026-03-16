import { getSolutionsResponse } from './contentScript/api'
import './inject/AnkiButton'
import { SolutionData } from './types'

function injectButtons(solutions: SolutionData[]) {
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
        const globalId = resultSection?.getAttribute('id')?.replace(/([a-zA-Z]+\-){2,}/, '');
        if (globalId) {
          solutionItem = solutions.find(item => item.globalId === globalId);
        }
      }
      const button = document.createElement('anki-button');
      if (solutionItem) {
        // @ts-ignore
        button.data = solutionItem;
      }
      titleRight.appendChild(button);
    }
  });
}

(async function() {
  const { solutions } = await getSolutionsResponse()
  console.log('solutions', solutions)

  let debounceTimer: number | undefined;
  const observer = new MutationObserver(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
      injectButtons(solutions);
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  injectButtons(solutions);
})();
