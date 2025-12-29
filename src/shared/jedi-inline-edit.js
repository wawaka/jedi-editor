import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Inline edit component for property names
 * @element jedi-inline-edit
 * @property {string} value - The text value to display/edit
 * @property {boolean} editing - Whether in edit mode
 * @property {boolean} required - Show required styling (underline)
 * @property {boolean} muted - Show muted styling (dimmed text)
 * @property {boolean} error - Show error styling
 * @fires edit-start - User clicked to start editing
 * @fires edit-complete - Edit completed, detail: { value, originalValue }
 * @fires edit-cancel - Edit cancelled
 */
export class JediInlineEdit extends LitElement {
  static properties = {
    value: { type: String },
    editing: { type: Boolean },
    required: { type: Boolean },
    muted: { type: Boolean },
    error: { type: Boolean }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-block;
      }

      .name-btn {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        font-weight: 500;
        color: var(--jedi-text);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: color 0.15s ease;
        text-align: left;
      }

      .name-btn:hover {
        color: var(--jedi-info);
      }

      .name-btn.required {
        border-bottom: 1px solid var(--jedi-error);
      }

      .name-btn.muted {
        color: var(--jedi-text-muted);
        border-bottom: 1px dashed var(--jedi-text-dim);
      }

      .name-btn.error {
        text-decoration: underline wavy var(--jedi-error);
        text-underline-offset: 2px;
      }

      .name-input {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        font-weight: 500;
        color: var(--jedi-text);
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--jedi-info);
        padding: 0;
        outline: none;
      }
    `
  ];

  constructor() {
    super();
    this.value = '';
    this.editing = false;
    this.required = false;
    this.muted = false;
    this.error = false;
    this._editValue = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('editing') && this.editing) {
      this._editValue = this.value;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('editing') && this.editing) {
      const input = this.shadowRoot.querySelector('.name-input');
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  render() {
    if (this.editing) {
      return html`
        <input
          type="text"
          class="name-input"
          .value="${this._editValue}"
          size="${Math.max(this._editValue.length, 1)}"
          @input="${this._handleInput}"
          @blur="${this._handleBlur}"
          @keydown="${this._handleKeyDown}"
          @click="${e => e.stopPropagation()}"
        />
      `;
    }

    const classes = [
      'name-btn',
      this.required ? 'required' : '',
      this.muted ? 'muted' : '',
      this.error ? 'error' : ''
    ].filter(Boolean).join(' ');

    return html`
      <button
        class="${classes}"
        @click="${this._handleClick}"
        title="Click to rename"
      >${this.value}</button>
    `;
  }

  _handleClick() {
    this.dispatchEvent(new CustomEvent('edit-start', { bubbles: true, composed: true }));
  }

  _handleInput(e) {
    this._editValue = e.target.value;
    e.target.size = Math.max(this._editValue.length, 1);
  }

  _handleBlur() {
    if (!this.editing) return;
    this._complete();
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter') {
      this._complete();
    } else if (e.key === 'Escape') {
      this._cancel();
    }
  }

  _complete() {
    const newValue = this._editValue.trim();
    this.dispatchEvent(new CustomEvent('edit-complete', {
      detail: { value: newValue, originalValue: this.value },
      bubbles: true,
      composed: true
    }));
  }

  _cancel() {
    this.editing = false;
    this.dispatchEvent(new CustomEvent('edit-cancel', { bubbles: true, composed: true }));
  }
}

customElements.define('jedi-inline-edit', JediInlineEdit);
