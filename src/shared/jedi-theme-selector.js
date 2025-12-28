import { LitElement, html, css } from 'lit';
import { themeStyles } from '../styles/shared-styles.js';
import { THEME_NAMES } from '../styles/themes.js';

/**
 * Theme selector toggle component
 * @element jedi-theme-selector
 * @property {string} theme - Current theme name
 * @fires theme-change - When theme changes, detail: { theme: string }
 */
export class JediThemeSelector extends LitElement {
  static properties = {
    theme: { type: String, reflect: true }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: inline-flex;
      }

      .toggle-container {
        display: inline-flex;
        background: var(--jedi-bg-primary);
        border-radius: var(--jedi-radius);
        padding: 2px;
        gap: 2px;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        font-size: 0.625rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: none;
        border-radius: calc(var(--jedi-radius) - 2px);
        cursor: pointer;
        transition: all 0.15s ease;
        background: transparent;
        color: var(--jedi-text-muted);
      }

      .toggle-btn:hover:not(.active) {
        color: var(--jedi-text);
      }

      .toggle-btn.active {
        background: var(--jedi-bg-input);
        color: var(--jedi-text);
      }

      .icon {
        width: 12px;
        height: 12px;
        margin-right: 4px;
      }
    `
  ];

  constructor() {
    super();
    this.theme = 'dark';
  }

  render() {
    return html`
      <div class="toggle-container">
        ${THEME_NAMES.map(themeName => html`
          <button
            class="toggle-btn ${this.theme === themeName ? 'active' : ''}"
            @click="${() => this._selectTheme(themeName)}"
            title="${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme"
          >
            ${this._renderIcon(themeName)}
            ${themeName}
          </button>
        `)}
      </div>
    `;
  }

  _renderIcon(themeName) {
    if (themeName === 'dark') {
      return html`
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
        </svg>
      `;
    }
    return html`
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
      </svg>
    `;
  }

  _selectTheme(themeName) {
    if (this.theme === themeName) return;

    this.theme = themeName;
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: themeName },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('jedi-theme-selector', JediThemeSelector);
