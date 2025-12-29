import { LitElement, html, css, unsafeCSS } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';
import { TYPE_COLORS, LAYOUT } from './constants.js';
import './jedi-type-badge.js';
import './jedi-add-button.js';
import './jedi-enum-badge.js';

/**
 * Reusable value block component for schema and data panes
 * @element jedi-value-block
 *
 * @property {string} type - Value type (string, number, integer, boolean, object, array, null)
 * @property {boolean} expanded - Whether nested content is visible
 * @property {boolean} clickable - Whether header is clickable for expand/collapse
 * @property {boolean} ghost - Ghost variant (dashed border, transparent bg)
 * @property {boolean} typeClickable - Whether type badge opens type menu
 * @property {boolean} showAddButton - Show add button
 * @property {string} addButtonTitle - Tooltip for add button
 * @property {number} count - If set, shows count display
 * @property {string} countFormat - 'object' for {n}, 'array' for [n]
 * @property {Array} enumValues - If set, shows enum badge with these values
 * @property {boolean} enumEditing - Whether enum editor is open
 * @property {boolean} showGhostEnum - Show ghost "enum" button
 * @property {boolean} showItemsLabel - Show "items" label
 * @property {string} ghostHint - Hint text for ghost blocks
 *
 * @fires toggle-expand - Header clicked to expand/collapse
 * @fires type-click - Type badge clicked
 * @fires add-click - Add button clicked
 * @fires enum-click - Enum badge clicked
 * @fires ghost-enum-click - Ghost enum button clicked
 * @fires ghost-click - Ghost block clicked
 *
 * @slot - Additional header content
 * @slot content - Nested content area
 * @slot enum-editor - Enum editor content
 */
export class JediValueBlock extends LitElement {
  static properties = {
    // Core
    type: { type: String },
    expanded: { type: Boolean },
    clickable: { type: Boolean },
    ghost: { type: Boolean, reflect: true },
    // Type badge
    typeClickable: { type: Boolean, attribute: 'type-clickable' },
    // Add button
    showAddButton: { type: Boolean, attribute: 'show-add-button' },
    addButtonTitle: { type: String, attribute: 'add-button-title' },
    // Count display
    count: { type: Number },
    countFormat: { type: String, attribute: 'count-format' },
    // Enum badge
    enumValues: { type: Array, attribute: 'enum-values' },
    enumEditing: { type: Boolean, attribute: 'enum-editing' },
    showGhostEnum: { type: Boolean, attribute: 'show-ghost-enum' },
    // Labels
    showItemsLabel: { type: Boolean, attribute: 'show-items-label' },
    ghostHint: { type: String, attribute: 'ghost-hint' }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: block;
      }

      .block {
        border-radius: var(--jedi-radius);
        border: 1px solid;
        background: var(--jedi-bg-secondary);
      }

      :host([ghost]) .block {
        border-style: dashed;
        background: transparent;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      :host([ghost]) .block:hover {
        background: rgba(30, 42, 74, 0.5);
      }

      .block-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        min-height: ${unsafeCSS(LAYOUT.blockRowHeight)};
        box-sizing: border-box;
      }

      .block-header.clickable {
        cursor: pointer;
      }

      .block-content {
        padding: 0.75rem;
        background: var(--jedi-bg-secondary);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .count-display {
        font-size: 0.75rem;
        font-family: var(--jedi-font-mono);
        color: var(--jedi-text-muted);
        user-select: none;
      }

      .items-label {
        font-size: 0.75rem;
        color: var(--jedi-text-dim);
      }

      .ghost-hint {
        font-size: 0.75rem;
        color: var(--jedi-text-muted);
      }

      .ghost-enum-btn {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        background: transparent;
        color: var(--jedi-text-dim);
        border: 1px dashed var(--jedi-text-dim);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s;
      }

      .block-header:hover .ghost-enum-btn {
        opacity: 1;
      }

      .ghost-enum-btn:hover {
        color: var(--jedi-info);
        border-color: var(--jedi-info);
      }

      :host([ghost]) .block-header {
        opacity: 0.4;
        transition: opacity 0.15s ease;
      }

      :host([ghost]) .block:hover .block-header {
        opacity: 0.7;
      }
    `
  ];

  constructor() {
    super();
    // Core
    this.type = 'string';
    this.expanded = false;
    this.clickable = false;
    this.ghost = false;
    // Type badge
    this.typeClickable = true;
    // Add button
    this.showAddButton = false;
    this.addButtonTitle = '';
    // Count display
    this.count = null;
    this.countFormat = 'object';
    // Enum badge
    this.enumValues = null;
    this.enumEditing = false;
    this.showGhostEnum = false;
    // Labels
    this.showItemsLabel = false;
    this.ghostHint = '';
  }

  render() {
    const borderColor = this._getBorderColor();

    if (this.ghost) {
      return html`
        <div
          class="block"
          style="border-color: ${borderColor}"
          @click="${this._handleGhostClick}"
        >
          <div class="block-header">
            <jedi-type-badge type="${this.type}"></jedi-type-badge>
            ${this.ghostHint ? html`<span class="ghost-hint">${this.ghostHint}</span>` : ''}
            <slot></slot>
          </div>
        </div>
      `;
    }

    return html`
      <div class="block" style="border-color: ${borderColor}">
        <div
          class="block-header ${this.clickable ? 'clickable' : ''}"
          @click="${this._handleHeaderClick}"
        >
          <jedi-type-badge
            type="${this.type}"
            ?clickable="${this.typeClickable}"
            @click="${this._handleTypeBadgeClick}"
          ></jedi-type-badge>
          ${this._renderEnumBadge()}
          ${this._renderGhostEnumButton()}
          ${this._renderAddButton()}
          ${this._renderCount()}
          ${this._renderItemsLabel()}
          <slot></slot>
        </div>
        ${this.expanded ? html`
          <div class="block-content">
            <slot name="content"></slot>
          </div>
        ` : ''}
        ${this.enumEditing ? html`<slot name="enum-editor"></slot>` : ''}
      </div>
    `;
  }

  _getBorderColor() {
    const colors = TYPE_COLORS[this.type] || TYPE_COLORS.null;
    return colors.border;
  }

  _renderEnumBadge() {
    if (!this.enumValues || this.enumValues.length === 0) return '';
    return html`
      <jedi-enum-badge
        .values="${this.enumValues}"
        @enum-badge-click="${this._handleEnumBadgeClick}"
      ></jedi-enum-badge>
    `;
  }

  _renderGhostEnumButton() {
    if (!this.showGhostEnum) return '';
    return html`
      <button
        class="ghost-enum-btn"
        @click="${this._handleGhostEnumClick}"
      >enum</button>
    `;
  }

  _renderAddButton() {
    if (!this.showAddButton) return '';
    return html`
      <jedi-add-button
        title="${this.addButtonTitle}"
        @click="${this._handleAddClick}"
      ></jedi-add-button>
    `;
  }

  _renderCount() {
    if (this.count === null || this.count === undefined || Number.isNaN(this.count)) return '';
    const formatted = this.countFormat === 'array'
      ? `[${this.count}]`
      : `{${this.count}}`;
    return html`<span class="count-display">${formatted}</span>`;
  }

  _renderItemsLabel() {
    if (!this.showItemsLabel) return '';
    return html`<span class="items-label">items</span>`;
  }

  _handleHeaderClick(e) {
    if (!this.clickable) return;
    // Don't toggle if clicking on interactive elements
    if (e.target.closest('jedi-type-badge, jedi-add-button, jedi-enum-badge, button')) return;

    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('toggle-expand', {
      bubbles: false,
      composed: false
    }));
  }

  _handleTypeBadgeClick(e) {
    if (!this.typeClickable) return;
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('type-click', {
      detail: { event: e },
      bubbles: false,
      composed: false
    }));
  }

  _handleEnumBadgeClick(e) {
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('enum-click', {
      detail: { event: e },
      bubbles: false,
      composed: false
    }));
  }

  _handleGhostEnumClick(e) {
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('ghost-enum-click', {
      detail: { event: e },
      bubbles: false,
      composed: false
    }));
  }

  _handleAddClick(e) {
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('add-click', {
      detail: { event: e },
      bubbles: false,
      composed: false
    }));
  }

  _handleGhostClick() {
    this.dispatchEvent(new CustomEvent('ghost-click', {
      bubbles: false,
      composed: false
    }));
  }
}

customElements.define('jedi-value-block', JediValueBlock);
