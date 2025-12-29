import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Square delete button with X icon
 * @element jedi-delete-button
 * @property {string} title - Tooltip text
 * @fires click - When button is clicked
 */
export class JediDeleteButton extends LitElement {
  static properties = {
    title: { type: String }
  };

  constructor() {
    super();
    this.title = 'Delete';
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
        background: rgba(255, 68, 68, 0.1);
        color: var(--jedi-error);
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
      }

      button:hover {
        background: rgba(255, 68, 68, 0.2);
        color: #ff6b6b;
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
      <button title="${this.title || 'Delete'}" @click="${this._handleClick}">
        <svg fill="none" stroke="currentColor" viewBox="2 2 20 20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    `;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('click', { bubbles: true, composed: true }));
  }
}

customElements.define('jedi-delete-button', JediDeleteButton);
