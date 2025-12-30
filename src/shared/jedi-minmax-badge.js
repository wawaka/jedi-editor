import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Min/Max badge with hover tooltip showing values
 * @element jedi-minmax-badge
 * @property {number|null} min - Minimum value
 * @property {number|null} max - Maximum value
 */
export class JediMinmaxBadge extends LitElement {
  static properties = {
    min: { type: Number },
    max: { type: Number },
    _showTooltip: { type: Boolean, state: true },
    _tooltipPos: { type: Object, state: true }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        position: relative;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        line-height: 1.4;
        background: rgba(255, 183, 77, 0.2);
        color: var(--jedi-warning);
        border: 1px solid rgba(255, 183, 77, 0.5);
        box-sizing: border-box;
        cursor: pointer;
      }

      .badge:hover {
        background: rgba(255, 183, 77, 0.3);
      }

      .tooltip {
        position: fixed;
        padding: 0.375rem 0.5rem;
        border-radius: var(--jedi-radius);
        background: var(--jedi-bg-input);
        border: 1px solid #3a4a6a;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-width: 16rem;
        transform: translateY(-100%);
        margin-top: -4px;
        pointer-events: none;
      }

      .tooltip.hidden {
        display: none;
      }

      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.625rem;
      }

      .tooltip-label {
        color: var(--jedi-text-muted);
        min-width: 2rem;
      }

      .tooltip-value {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-family: var(--jedi-font-mono);
        background: var(--jedi-warning);
        color: #1a1a2e;
      }
    `
  ];

  constructor() {
    super();
    this.min = null;
    this.max = null;
    this._showTooltip = false;
    this._tooltipPos = { top: 0, left: 0 };
  }

  render() {
    return html`
      <span
        class="badge"
        @click="${this._handleClick}"
        @mouseenter="${this._handleMouseEnter}"
        @mouseleave="${this._handleMouseLeave}"
      >
        min/max
      </span>
      <div
        class="tooltip ${this._showTooltip ? '' : 'hidden'}"
        style="top: ${this._tooltipPos.top}px; left: ${this._tooltipPos.left}px;"
      >
        ${this._renderTooltipContent()}
      </div>
    `;
  }

  _renderTooltipContent() {
    const rows = [];
    if (this.min !== null && this.min !== undefined) {
      rows.push(html`
        <div class="tooltip-row">
          <span class="tooltip-label">min:</span>
          <span class="tooltip-value">${this.min}</span>
        </div>
      `);
    }
    if (this.max !== null && this.max !== undefined) {
      rows.push(html`
        <div class="tooltip-row">
          <span class="tooltip-label">max:</span>
          <span class="tooltip-value">${this.max}</span>
        </div>
      `);
    }
    return rows;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('minmax-badge-click', {
      bubbles: true,
      composed: true
    }));
  }

  _handleMouseEnter() {
    const badge = this.shadowRoot.querySelector('.badge');
    if (badge) {
      const rect = badge.getBoundingClientRect();
      this._tooltipPos = {
        top: rect.top - 4,
        left: rect.left
      };
      this._showTooltip = true;
    }
  }

  _handleMouseLeave() {
    this._showTooltip = false;
  }
}

customElements.define('jedi-minmax-badge', JediMinmaxBadge);
