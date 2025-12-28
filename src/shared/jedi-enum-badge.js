import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';

/**
 * Enum badge with hover tooltip showing values
 * @element jedi-enum-badge
 * @property {Array} values - Enum values to display
 */
export class JediEnumBadge extends LitElement {
  static properties = {
    values: { type: Array },
    _showTooltip: { type: Boolean, state: true },
    _tooltipPos: { type: Object, state: true }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .badge {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        background: rgba(77, 166, 255, 0.2);
        color: var(--jedi-info);
        border: 1px solid rgba(77, 166, 255, 0.5);
        cursor: pointer;
      }

      .badge:hover {
        background: rgba(77, 166, 255, 0.3);
      }

      .tooltip {
        position: fixed;
        padding: 0.375rem 0.5rem;
        border-radius: var(--jedi-radius);
        background: var(--jedi-bg-input);
        border: 1px solid #3a4a6a;
        z-index: 10001;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        max-width: 16rem;
        transform: translateY(-100%);
        margin-top: -4px;
        pointer-events: none;
      }

      .tooltip.hidden {
        display: none;
      }

      .value {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        font-family: var(--jedi-font-mono);
      }

      .value.string {
        background: rgba(0, 255, 136, 0.15);
        color: var(--jedi-string);
      }

      .value.number {
        background: rgba(255, 107, 0, 0.15);
        color: var(--jedi-number);
      }

      .value.boolean {
        background: rgba(255, 166, 77, 0.15);
        color: var(--jedi-boolean);
      }

      .value.other {
        background: rgba(107, 114, 128, 0.3);
        color: var(--jedi-text-muted);
      }
    `
  ];

  constructor() {
    super();
    this.values = [];
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
        enum
      </span>
      <div
        class="tooltip ${this._showTooltip ? '' : 'hidden'}"
        style="top: ${this._tooltipPos.top}px; left: ${this._tooltipPos.left}px;"
      >
        ${this.values.map(v => this._renderValue(v))}
      </div>
    `;
  }

  _renderValue(value) {
    const type = typeof value;
    const display = type === 'string' ? `"${value}"` : String(value);
    const typeClass = type === 'string' ? 'string' :
                      type === 'number' ? 'number' :
                      type === 'boolean' ? 'boolean' : 'other';
    return html`<span class="value ${typeClass}">${display}</span>`;
  }

  _handleClick(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('enum-badge-click', {
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

customElements.define('jedi-enum-badge', JediEnumBadge);
