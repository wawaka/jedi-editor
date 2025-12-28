import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Simple textarea for raw JSON editing that auto-sizes to content
 * @element jedi-raw-editor
 * @property {string} value - JSON string value
 * @property {boolean} readonly - Whether editor is read-only
 * @fires change - When content changes, detail: { value: string }
 */
export class JediRawEditor extends LitElement {
  static properties = {
    value: { type: String },
    readonly: { type: Boolean }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      textarea {
        width: 100%;
        min-height: 4rem;
        background: var(--jedi-bg-secondary);
        color: var(--jedi-text);
        border: none;
        padding: 0.75rem;
        font-family: var(--jedi-font-mono);
        font-size: 0.8125rem;
        line-height: 1.5;
        resize: none;
        outline: none;
        tab-size: 2;
        overflow-x: hidden;
        overflow-y: hidden;
        box-sizing: border-box;
        word-wrap: break-word;
        white-space: pre-wrap;
      }

      textarea:focus {
        background: var(--jedi-bg-input);
      }
    `
  ];

  constructor() {
    super();
    this.value = '';
    this.readonly = false;
  }

  render() {
    return html`
      <textarea
        .value="${this.value}"
        ?readonly="${this.readonly}"
        @input="${this._handleInput}"
        spellcheck="false"
      ></textarea>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('value')) {
      this._autoResize();
    }
  }

  firstUpdated() {
    this._autoResize();
  }

  _autoResize() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  _handleInput(e) {
    this._autoResize();
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: e.target.value },
      bubbles: true,
      composed: true
    }));
  }

  focus() {
    this.shadowRoot.querySelector('textarea')?.focus();
  }
}

customElements.define('jedi-raw-editor', JediRawEditor);
