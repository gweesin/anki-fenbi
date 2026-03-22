import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fetchQuizKeyPoint } from './fenbiApi'
import { matchTailWord } from '../utils'
import { formatSolution } from './formatter'
import { findLast } from 'es-toolkit/compat'
import './AnkiToast'
import { cloneDeep } from 'es-toolkit'
import type { QuizMetaInfo, SolutionData } from '../types'

function showMessage({ type, text }: { type: string; text: string }) {
  const toast = document.createElement('anki-toast') as any
  toast.type = type
  toast.text = text
  document.body.appendChild(toast)
  toast.visible = true
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

const ASCII_A = 'A'.charCodeAt(0)

async function requestAnki(action: string, params: Record<string, any> = {}, version = 6): Promise<any> {
  const requestId = Math.random().toString(36).slice(2)

  return new Promise((resolve) => {
    // 监听回调
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'CROSS_RES' && event.data.id === requestId) {
        window.removeEventListener('message', handler)
        resolve(event.data.data)
      }
    }
    window.addEventListener('message', handler)

    // 发起请求给 Content Script
    window.postMessage({
      type: 'CROSS_REQ',
      id: requestId,
      data: {
        params,
        action,
        version,
      },
    }, '*')
  })
}

async function matchDeckName(tags: string[]) {
  const deckNames = (await requestAnki('deckNames')) as string[]
  const wrongDeckNames = deckNames.filter(name => name.includes('错题本'))

  return findLast(wrongDeckNames, (name => {
    const [keypoint] = tags
    if (!keypoint) {
      return
    }

    return findLast(keypoint.split('::'), word => matchTailWord(name, word))
  }))
}

async function getKeypoints(data: SolutionData) {
  let result = []
  for (const item of data.keypoints) {
    const keypointData = await fetchQuizKeyPoint(data!.quizId, item.id)
    result.push(keypointData)
  }

  return result
}

@customElement('anki-button')
export class AnkiButton extends LitElement {
  @property({ type: Object, hasChanged: () => false })
  data: SolutionData & { quizMeta: QuizMetaInfo } | undefined

  render() {
    console.log('render' + Date.now())
    return html`
      <button @click=${this.handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" version="1">
          <path fill="#0088d1"
                d="m13.118 2.0897a2.9557 2.8785 0 0 0 -2.168 2.2255l-1.2568 6.1428-5.9069 2.475a2.9557 2.8785 0 0 0 -0.2767 5.154l5.6088 3.0618 0.58994 6.2361a2.9557 2.8785 0 0 0 4.9483 1.8514l4.7253-4.25 6.272 1.3803a2.9557 2.8785 0 0 0 3.3348 -4.0129l-2.6908-5.6879 3.2876-5.3833a2.9557 2.8785 0 0 0 -2.886 -4.3281l-6.389 0.7336-4.24-4.7086a2.9557 2.8785 0 0 0 -2.953 -0.8892z" />
          <path fill="#e4e4e4"
                d="m13.703 2.0039a2.9557 2.8785 0 0 0 -0.586 0.0859 2.9557 2.8785 0 0 0 -2.166 2.2247l-1.2576 6.1445-5.9063 2.475a2.9557 2.8785 0 0 0 -0.2773 5.154l5.6093 3.06 0.5899 6.237a2.9557 2.8785 0 0 0 4.947 1.851l4.727-4.25 6.271 1.381a2.9557 2.8785 0 0 0 3.334 -4.013l-2.689-5.688 3.287-5.383a2.9557 2.8785 0 0 0 -2.887 -4.3299l-6.388 0.7344-4.241-4.709a2.9557 2.8785 0 0 0 -2.367 -0.9746zm0.141 2.9844l0.004 0.0039c0 0.0002-0.005 0.0059-0.004 0.0058 0.009 0.0007 0.017 0.009 0-0.0097zm0.025 0.0273l4.213 4.6797a3.0003 3.0003 0 0 0 2.572 0.9727l6.229-0.7168-3.145 5.1508a3.0003 3.0003 0 0 0 -0.152 2.847l2.584 5.459-6.143-1.351a3.0003 3.0003 0 0 0 -2.652 0.699l-4.691 4.221-0.579-6.11a3.0003 3.0003 0 0 0 -1.548 -2.351l-5.3558-2.924 5.6508-2.367a3.0003 3.0003 0 0 0 1.781 -2.164l1.236-6.0454z" />
          <path fill="#fff" opacity=".2"
                d="m13.703 2.0039a2.9557 2.8785 0 0 0 -0.586 0.0859 2.9557 2.8785 0 0 0 -2.166 2.2247l-1.2576 6.1445-5.9063 2.475a2.9557 2.8785 0 0 0 -1.7402 3.136 2.9557 2.8785 0 0 1 1.7402 -2.136l5.9063-2.475 1.2576-6.1445a2.9557 2.8785 0 0 1 2.166 -2.2247 2.9557 2.8785 0 0 1 2.953 0.8887l4.241 4.709 6.388-0.7344a2.9557 2.8785 0 0 1 3.254 2.3539 2.9557 2.8785 0 0 0 -3.254 -3.3539l-6.388 0.7344-4.241-4.709a2.9557 2.8785 0 0 0 -2.367 -0.9746zm12.861 15.226l-0.265 0.436 2.689 5.688a2.9557 2.8785 0 0 1 0.225 0.707 2.9557 2.8785 0 0 0 -0.225 -1.707l-2.424-5.124z" />
          <path opacity=".2"
                d="m29.953 10.308a2.9557 2.8785 0 0 1 -0.367 0.976l-3.2871 5.3828 0.26562 0.56445 3.0215-4.9473a2.9557 2.8785 0 0 0 0.36719 -1.9766zm-27.906 5.7637a2.9557 2.8785 0 0 0 1.4629 3.0176l5.6094 3.0605 0.58984 6.2363a2.9557 2.8785 0 0 0 4.9473 1.8516l4.7266-4.25 6.2715 1.3809a2.9557 2.8785 0 0 0 3.5586 -3.3066 2.9557 2.8785 0 0 1 -3.5586 2.3066l-6.2715-1.3809-4.7266 4.25a2.9557 2.8785 0 0 1 -4.947 -1.853l-0.5899-6.237-5.6093-3.06a2.9557 2.8785 0 0 1 -1.4629 -2.018z" />
        </svg>
      </button>
    `
  }

  private async handleClick() {
    if (!this.data) {
      return
    }
    const data = formatSolution(cloneDeep(this.data))

    const keypoints = await getKeypoints(data)

    const tags = keypoints.map(keyp => {
      const keys = keyp.path.concat(keyp.keypoint)
      return '考点::' + keys.map(i => i.name).join('::')
    })

    const form = {
      deckName: await matchDeckName(tags),
      modelName: 'Extra - 选择题模板',
      fields: {
        Question: data.content,
        Options: data.accessories[0].options.map((data, index) => `${String.fromCharCode(ASCII_A + index)}. ${data}`).join('<br>'),
        Answer: String.fromCharCode(ASCII_A + parseInt(data.correctAnswer.choice)),
        SuccessRate: Math.round(data.quizMeta.correctRatio).toString(),
        Remark: data.solution,
        Source: data.source,
      },
      tags,
    }

    console.log('form', form)
    const [canAddNote] = await requestAnki('canAddNotes', { 'notes': [form] }) as unknown as boolean[]
    if (!canAddNote) {
      return showMessage({ type: 'warn', text: '当前卡片已添加！' })
    }
    const ankiID = await requestAnki('addNote', { 'note': form }) as string
    showMessage({ type: 'success', text: `卡片添加成功，Anki Id ${ankiID}` })
  }

  static styles = css`
    button {
      background: #fff;
      color: #222;
      border: 1px solid #e5e6eb;
      padding: 0;
      border-radius: 4px;
      font-family: 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: none;
      height: 26px;
      width: 26px;
      transition: border-color 0.2s, background 0.2s;
      margin-left: 14px;
    }

    button:hover {
      border-color: #a3a4a8;
      background: #f7f8fa;
    }

    svg,
    img {
      width: 24px;
      height: 24px;
      display: block;
    }
  `
}
