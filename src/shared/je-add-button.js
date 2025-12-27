import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Square add button with plus icon
 * @element je-add-button
 * @fires click - When button is clicked
 */
export class JeAddButton extends LitElement {
  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-block;
      }

      button {
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--je-radius);
        background: rgba(0, 255, 136, 0.1);
        color: var(--je-success);
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      button:hover {
        background: rgba(0, 255, 136, 0.2);
        color: #00e67a;
      }

      svg {
        width: 0.875rem;
        height: 0.875rem;
      }
    `
  ];

  render() {
    return html`
      <button title="${this.title || 'Add'}" @click="${this._handleClick}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    `;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('click', { bubbles: true, composed: true }));
  }
}

customElements.define('je-add-button', JeAddButton);
