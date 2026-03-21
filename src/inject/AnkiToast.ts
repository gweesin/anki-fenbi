import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('anki-toast')
export class AnkiToast extends LitElement {
  @property({ type: String })
  type: string = 'success'

  @property({ type: String })
  text: string = ''

  render() {
    return html`
      <div class="toast ${this.type}">
        ${this.text}
      </div>
    `
  }

  static styles = css`
    .toast {
      background: #fff;
      color: #222;
      border: 1px solid #e5e6eb;
      padding: 10px 20px;
      border-radius: 4px;
      font-family: 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      transition: opacity 0.3s ease;
    }

    .toast.warn {
      border-color: #ff9800;
      background: #fff3e0;
    }

    .toast.success {
      border-color: #4caf50;
      background: #e8f5e8;
    }
  `
}
