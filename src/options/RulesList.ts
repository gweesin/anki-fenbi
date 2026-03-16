import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { replacementRules } from './utils'

@customElement('rules-list')
export class RulesList extends LitElement {
  @state()
  expanded = false

  render() {
    return html`
      <div class="rules-container">
        <button class="toggle-btn" @click=${() => this.expanded = !this.expanded}>
          替换规则 ${this.expanded ? '▼' : '▶'}
        </button>
        <ul class=${this.expanded ? 'expanded' : ''}>
          ${replacementRules.map(rule => html`
            <li>${typeof rule === 'string' ? `"${rule}" -> 删除` : `"${rule.msg}" -> "${rule.replaced}"`}</li>
          `)}
        </ul>
      </div>
    `
  }

  static styles = css`
    .rules-container {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(98, 0, 238, 0.1);
      border-left: 4px solid var(--mdc-theme-primary);
    }

    .toggle-btn {
      background: none;
      border: none;
      color: var(--mdc-theme-primary);
      font-size: 1rem;
      cursor: pointer;
      padding: 0;
      margin: 0 0 0.5rem 0;
      font-weight: bold;
    }

    .toggle-btn:hover {
      text-decoration: underline;
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease;
    }

    ul.expanded {
      max-height: 2000px;
      opacity: 1;
    }

    li {
      font-size: 0.875rem;
      color: var(--mdc-theme-on-surface);
      padding-left: 1.2rem;
      position: relative;
    }

    li::before {
      content: '✔';
      position: absolute;
      left: 0;
      color: var(--mdc-theme-primary);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'rules-list': RulesList
  }
}

export default RulesList
