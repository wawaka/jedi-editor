import { css } from 'lit';
import { THEMES, SHARED_THEME, DEFAULT_THEME } from './themes.js';

/**
 * Generate CSS custom properties string from theme
 * @param {string} themeName
 * @returns {string}
 */
export function generateThemeCSS(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return '';

  const lines = [];

  // Theme-specific properties
  for (const [key, value] of Object.entries(theme)) {
    if (key !== 'name') {
      lines.push(`--jedi-${key}: ${value};`);
    }
  }

  // Shared properties
  for (const [key, value] of Object.entries(SHARED_THEME)) {
    lines.push(`--jedi-${key}: ${value};`);
  }

  return lines.join('\n    ');
}

/**
 * Theme variable definitions - ONLY use in jedi-editor root component.
 * This sets the actual CSS custom property values.
 */
export const themeVarsStyles = css`
  :host {
    ${css([generateThemeCSS(DEFAULT_THEME)])}
  }
`;

/**
 * Base theme styles for all components.
 * Does NOT define CSS custom properties - inherits them from jedi-editor.
 * Only sets font-family and color using the inherited variables.
 */
export const themeStyles = css`
  :host {
    font-family: var(--jedi-font-sans);
    color: var(--jedi-text);
  }
`;

/**
 * Common button styles
 */
export const buttonStyles = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--jedi-radius);
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: var(--jedi-info);
    color: white;
  }
  .btn-primary:hover {
    background: #3b8ed6;
  }

  .btn-success {
    background: var(--jedi-success);
    color: #0a0e27;
  }
  .btn-success:hover {
    background: #00e67a;
  }

  .btn-danger {
    background: var(--jedi-error);
    color: white;
  }
  .btn-danger:hover {
    background: #e63939;
  }

  .btn-ghost {
    background: transparent;
    color: var(--jedi-text-muted);
  }
  .btn-ghost:hover {
    background: var(--jedi-bg-input);
    color: var(--jedi-text);
  }

  .btn-icon {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
  }
`;

/**
 * Common input styles
 */
export const inputStyles = css`
  .input {
    background: var(--jedi-bg-input);
    border: 1px solid var(--jedi-border);
    border-radius: var(--jedi-radius);
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    font-family: var(--jedi-font-mono);
    color: var(--jedi-text);
    outline: none;
    transition: border-color 0.15s ease;
  }
  .input:focus {
    border-color: var(--jedi-info);
  }
  .input::placeholder {
    color: var(--jedi-text-dim);
  }
`;

/**
 * Pane header styles (shared by schema-pane and data-pane)
 */
export const paneHeaderStyles = css`
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--jedi-bg-primary);
    border-bottom: 1px solid var(--jedi-border);
    padding: 0.5rem 0.75rem;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-controls {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--jedi-text);
  }
`;

/**
 * Scrollbar styles
 */
export const scrollbarStyles = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--jedi-bg-primary);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--jedi-border);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--jedi-text-dim);
  }
`;
