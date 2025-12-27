import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Toggle between Raw and Visual editor modes
 * @element je-editor-toggle
 * @property {string} mode - Current mode ('raw' | 'visual')
 * @fires mode-change - When mode changes, detail: { mode: string }
 */
export class JeEditorToggle extends LitElement {
  static properties = {
    mode: { type: String, reflect: true }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-flex;
      }

      .toggle-container {
        display: flex;
        background: var(--je-bg-primary);
        border-radius: var(--je-radius);
        padding: 2px;
        gap: 2px;
      }

      button {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 500;
        border: none;
        border-radius: calc(var(--je-radius) - 2px);
        cursor: pointer;
        transition: all 0.15s ease;
        background: transparent;
        color: var(--je-text-muted);
      }

      button:hover:not(.active) {
        color: var(--je-text);
      }

      button.active {
        background: var(--je-bg-input);
        color: var(--je-text);
      }
    `
  ];

  constructor() {
    super();
    this.mode = 'visual';
  }

  render() {
    return html`
      <div class="toggle-container">
        <button
          class="${this.mode === 'visual' ? 'active' : ''}"
          @click="${() => this._setMode('visual')}"
        >
          Visual
        </button>
        <button
          class="${this.mode === 'raw' ? 'active' : ''}"
          @click="${() => this._setMode('raw')}"
        >
          Raw
        </button>
      </div>
    `;
  }

  _setMode(newMode) {
    if (newMode !== this.mode) {
      this.dispatchEvent(new CustomEvent('mode-change', {
        detail: { mode: newMode },
        bubbles: true,
        composed: true
      }));
    }
  }
}

customElements.define('je-editor-toggle', JeEditorToggle);
