import { LitElement, html, css } from 'lit';
import { TYPE_COLORS } from './constants.js';

/**
 * Reusable type badge component
 * @element je-type-badge
 * @property {string} type - The type to display (string, number, integer, boolean, object, array, null)
 * @property {boolean} clickable - Whether the badge is clickable
 */
export class JeTypeBadge extends LitElement {
  static properties = {
    type: { type: String },
    clickable: { type: Boolean }
  };

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      min-width: 3.5rem;
      border: none;
      font-family: inherit;
      line-height: 1.4;
    }

    .badge.clickable {
      cursor: pointer;
      transition: filter 0.15s;
    }

    .badge.clickable:hover {
      filter: brightness(1.2);
    }
  `;

  constructor() {
    super();
    this.type = 'string';
    this.clickable = false;
  }

  render() {
    const colors = TYPE_COLORS[this.type] || TYPE_COLORS.null;

    return html`
      <span
        class="badge ${this.clickable ? 'clickable' : ''}"
        style="background: ${colors.badge}; color: ${colors.text}"
      >${this.type}</span>
    `;
  }
}

customElements.define('je-type-badge', JeTypeBadge);
