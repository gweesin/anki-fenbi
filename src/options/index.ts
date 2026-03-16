import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './RulesList'

function saveOptions(data: object) {
  chrome.storage.sync.set(data, () => {
    console.log('Data saved:', data)
  })
}

@customElement('options-root')
export class Options extends LitElement {
  @state()
  url = 'http://127.0.0.1:8765'

  @state()
  simplifySource = false

  @state()
  isValidUrl = true

  @state()
  connectionStatus: 'not_connected' | 'connecting' | 'success' | 'error' = 'not_connected'

  @state()
  version = ''

  @state()
  error = ''

  constructor() {
    super()
    // Force scrollbar to always be visible to prevent layout shifts
    const style = document.createElement('style');
    style.textContent = 'html { overflow-y: scroll; }';
    document.head.appendChild(style);
    chrome.storage.sync.get(['url', 'simplifySource'], (result) => {
      this.url = result.url || 'http://127.0.0.1:8765'
      this.simplifySource = result.simplifySource || false
      this.isValidUrl = this.validateUrl(this.url)
      if (this.isValidUrl) {
        this.testConnection()
      }
    })
  }

  private validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private saveUrl(e: Event) {
    const target = e.target as HTMLInputElement
    this.url = target.value
    this.isValidUrl = this.validateUrl(this.url)
    this.connectionStatus = 'not_connected'
    this.version = ''
    this.error = ''
    saveOptions({ url: this.url })
  }

  private async testConnection() {
    if (!this.isValidUrl) return
    this.connectionStatus = 'connecting'
    this.version = ''
    this.error = ''
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'version' })
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      this.version = data || 'Unknown'
      this.connectionStatus = 'success'
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Connection failed'
      this.connectionStatus = 'error'
    }
  }

  private saveSimplifySource(e: Event) {
    const target = e.target as HTMLInputElement
    this.simplifySource = target.checked
    saveOptions({ simplifySource: this.simplifySource })
  }

  render() {
    return html`
      <main>
        <h3>Anki Fenbi 配置</h3>
        <form>
          <div class="form-field">
            <label for="url">Anki Connect 服务器地址</label>
            <div class="input-group">
              <input id="url" type="text" .value=${this.url} @input=${this.saveUrl} placeholder="http://127.0.0.1:8765" />
              <button type="button" @click=${this.testConnection} .disabled=${!this.isValidUrl || this.connectionStatus === 'connecting'}>
                ${this.connectionStatus === 'connecting' ? '测试中...' : '测试连接'}
              </button>
            </div>
            ${this.connectionStatus === 'connecting' ? html`<p class="info">正在测试连接...</p>` : ''}
            ${this.connectionStatus === 'success' ? html`<p class="success">测试连接成功！当前为 Anki Connect v${this.version} 版本</p>` : ''}
            ${this.connectionStatus === 'error' ? html`<p class="error">${this.error}</p>` : ''}
            ${this.connectionStatus === 'not_connected' && this.isValidUrl ? html`<p class="info">请点击测试连接按钮验证服务器状态</p>` : ''}
          </div>
          <div class="form-field checkbox-field">
            <div class="checkbox-row">
              <label for="simplify">简化题目来源信息</label>
              <input id="simplify" type="checkbox" .checked=${this.simplifySource} @change=${this.saveSimplifySource} />
            </div>
            ${this.simplifySource ? html`
              <rules-list></rules-list>
            ` : ''}
          </div>
        </form>
      </main>
    `
  }

  static styles = css`
    :host {
      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      --mdc-theme-primary: #6200ee;
      --mdc-theme-surface: #ffffff;
      --mdc-theme-on-surface: #000000;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --mdc-theme-surface: #12121220;
        --mdc-theme-on-surface: #ffffff;
      }
    }

    main {
      max-width: 600px;
      margin: 1rem auto 0 auto;
      padding: 2rem;
      background: var(--mdc-theme-surface);
      color: var(--mdc-theme-on-surface);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h3 {
      text-align: center;
      margin-bottom: 2rem;
      margin-top: 0;
      color: var(--mdc-theme-primary);
      font-weight: 400;
      font-size: 1.5rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .checkbox-field {
      flex-direction: column;
    }

    .checkbox-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .checkbox-row label {
      margin-bottom: 0;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--mdc-theme-on-surface);
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    input[type="text"] {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: var(--mdc-theme-primary);
      box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.2);
    }

    button {
      padding: 0.75rem 1rem;
      border: 1px solid var(--mdc-theme-primary);
      border-radius: 4px;
      background-color: var(--mdc-theme-primary);
      color: white;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
      background-color: #4a00c2;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      border-color: #ccc;
    }

    .success {
      color: green;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .error {
      color: red;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .info {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: var(--mdc-theme-primary);
    }

    a {
      display: block;
      text-align: center;
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #666;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `
}

export default Options

declare global {
  interface HTMLElementTagNameMap {
    'options-root': Options
  }
}
