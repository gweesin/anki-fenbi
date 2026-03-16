import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SolutionData } from '../types'
import { formatSolution } from './formatter'
import { invoke } from '../contentScript/api'

const ASCII_A = 'A'.charCodeAt(0);

@customElement('anki-button')
export class AnkiButton extends LitElement {
  @property({ type: Object })
  data: SolutionData | undefined;

  render() {
    return html`
      <button @click=${this.handleClick}>
        <slot>Anki</slot>
      </button>
    `
  }

  private async handleClick() {
    this.data = formatSolution(this.data!)
    console.log('Custom button clicked', this.data)
    const form = {
      deckName: 'TODO',
      modelName: 'TODO',
      fields: {
        Question: this.data.content,
        Options: this.data.accessories[0].options.map((data, index) => `${String.fromCharCode(ASCII_A + index)}. ${data}`).join('<br>'),
        Answer: String.fromCharCode(ASCII_A + parseInt(this.data.correctAnswer.choice)),
        SuccessRate: '', // TODO questionEl.querySelector('.overall-item-value.correct-rate').textContent.replace('%', '').trim(),
        Remark: this.data.solution,
        Source: this.data.source,
      },
      tags: [] // TODO
    }

    // const deckNames = await invoke('deckNames').then(names => {
    //   return names.filter(name => name.includes('错题本'));
    // });
    // const targetDeckName = deckNames.findLast(name => {
    //   const [keypoint] = keypoints;
    //   if(!keypoint) { return; }
    //
    //   return keypoint.split('::').findLast(word => matchTailWord(name, word));
    // }) || deckNames.find(name => name.includes(need2FindDeckName));
    console.log('form', form)
    const [canAddNote] = await invoke('canAddNotes', { 'notes': [form] }) as unknown as boolean[];
    if(!canAddNote) {
      // TODO
      // return showMessage({ type: 'warn', text: '当前卡片已添加！'});
    }
    const addResult = await invoke(/*'guiAddCards'*/ 'addNote', { "note": form });
    console.log('addResult', addResult);
    await invoke('addNote', { "note": form })
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

    ::slotted(svg),
    ::slotted(img) {
      width: 24px;
      height: 24px;
      display: block;
    }
  `
}
