import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Square add button with plus icon
 * @element jedi-add-button
 * @property {string} title - Tooltip text
 * @fires click - When button is clicked
 */
export class JediAddButton extends LitElement {
  static properties = {
    title: { type: String }
  };

  constructor() {
    super();
    this.title = 'Add';
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
        background: rgba(0, 255, 136, 0.1);
        color: var(--jedi-success);
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
      }

      button:hover {
        background: rgba(0, 255, 136, 0.2);
        color: #86efac;
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
      <button title="${this.title || 'Add'}" @click="${this._handleClick}">
        <svg fill="none" stroke="currentColor" viewBox="2 2 20 20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    `;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('click', { bubbles: true, composed: true }));
  }
}

customElements.define('jedi-add-button', JediAddButton);
