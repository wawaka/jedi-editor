import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Square required button with asterisk icon
 * @element jedi-required-button
 * @property {string} title - Tooltip text
 * @property {boolean} active - Whether the field is required
 * @fires click - When button is clicked
 */
export class JediRequiredButton extends LitElement {
  static properties = {
    title: { type: String },
    active: { type: Boolean }
  };

  constructor() {
    super();
    this.title = 'Toggle required';
    this.active = false;
  }

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-flex;
      }

      button {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--jedi-radius);
        background: var(--jedi-bg-input);
        color: var(--jedi-text-dim);
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
      }

      button:hover {
        background: rgba(255, 166, 77, 0.2);
        color: var(--jedi-warning);
      }

      button.active {
        background: rgba(255, 166, 77, 0.3);
        color: var(--jedi-warning);
      }

      button.active:hover {
        background: rgba(255, 166, 77, 0.4);
      }

      svg {
        width: 11px;
        height: 11px;
        flex-shrink: 0;
      }
    `
  ];

  render() {
    return html`
      <button
        class="${this.active ? 'active' : ''}"
        title="${this.title || 'Toggle required'}"
        @click="${this._handleClick}"
      >
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16l-6.4 5.2 2.4-7.2-6-4.8h7.6z" />
        </svg>
      </button>
    `;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('click', { bubbles: true, composed: true }));
  }
}

customElements.define('jedi-required-button', JediRequiredButton);
