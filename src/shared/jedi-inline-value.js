import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Inline value editor component
 * @element jedi-inline-value
 * @property {*} value - The value to display/edit
 * @property {string} type - Value type (string, number, integer, null)
 * @property {boolean} editing - Whether in edit mode
 * @fires edit-start - User clicked to start editing
 * @fires edit-complete - Edit completed, detail: { value, originalValue }
 * @fires edit-cancel - Edit cancelled
 */
export class JediInlineValue extends LitElement {
  static properties = {
    value: {},
    type: { type: String },
    editing: { type: Boolean }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-block;
      }

      .value-btn {
        font-size: 0.75rem;
        font-family: var(--jedi-font-mono);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }

      .value-btn:hover {
        opacity: 0.8;
      }

      .value-btn.string {
        color: var(--jedi-string);
      }

      .value-btn.number, .value-btn.integer {
        color: var(--jedi-number);
      }

      .value-btn.null {
        color: var(--jedi-text-muted);
      }

      .value-input {
        font-size: 0.75rem;
        font-family: var(--jedi-font-mono);
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
    this.type = 'string';
    this.editing = false;
    this._editValue = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('editing') && this.editing) {
      // For strings, edit raw value; for others, use JSON representation
      this._editValue = this.type === 'string' ? String(this.value ?? '') : JSON.stringify(this.value);
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('editing') && this.editing) {
      const input = this.shadowRoot.querySelector('.value-input');
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
          class="value-input"
          .value="${this._editValue}"
          size="${Math.max(this._editValue.length, 1)}"
          @input="${this._handleInput}"
          @blur="${this._handleBlur}"
          @keydown="${this._handleKeyDown}"
          @click="${e => e.stopPropagation()}"
        />
      `;
    }

    const displayValue = this._formatDisplayValue();
    return html`
      <button
        class="value-btn ${this.type}"
        @click="${this._handleClick}"
        title="Click to edit"
      >${displayValue}</button>
    `;
  }

  _formatDisplayValue() {
    if (this.type === 'null' || this.value === null) return 'null';
    return String(this.value ?? '');
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
    let newValue;
    try {
      if (this.type === 'string') {
        newValue = this._editValue;
      } else if (this.type === 'number' || this.type === 'integer') {
        newValue = Number(this._editValue);
        if (isNaN(newValue)) {
          this._cancel();
          return;
        }
      } else if (this.type === 'null') {
        newValue = null;
      } else {
        newValue = JSON.parse(this._editValue);
      }
    } catch {
      this._cancel();
      return;
    }

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

customElements.define('jedi-inline-value', JediInlineValue);
