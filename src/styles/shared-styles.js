import { css } from 'lit';

/**
 * Shared CSS custom properties theme
 */
export const themeStyles = css`
  :host {
    /* Background colors */
    --je-bg-primary: #0a0e27;
    --je-bg-secondary: #0f1629;
    --je-bg-input: #1e2a4a;
    --je-bg-hover: #2a3a5a;

    /* Border colors */
    --je-border: #1e2a4a;
    --je-border-light: rgba(255, 255, 255, 0.1);

    /* Accent colors */
    --je-accent: #ff6b00;
    --je-success: #00ff88;
    --je-error: #ff4444;
    --je-warning: #ffa64d;
    --je-info: #4da6ff;

    /* Text colors */
    --je-text: #ffffff;
    --je-text-muted: #9ca3af;
    --je-text-dim: #6b7280;

    /* Type colors */
    --je-string: #00ff88;
    --je-number: #ff6b00;
    --je-boolean: #ffa64d;
    --je-object: #4da6ff;
    --je-array: #06b6d4;
    --je-null: #9ca3af;

    /* Sizing */
    --je-radius: 4px;
    --je-radius-lg: 8px;

    /* Fonts */
    --je-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    --je-font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

    font-family: var(--je-font-sans);
    color: var(--je-text);
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
    border-radius: var(--je-radius);
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: var(--je-info);
    color: white;
  }
  .btn-primary:hover {
    background: #3b8ed6;
  }

  .btn-success {
    background: var(--je-success);
    color: #0a0e27;
  }
  .btn-success:hover {
    background: #00e67a;
  }

  .btn-danger {
    background: var(--je-error);
    color: white;
  }
  .btn-danger:hover {
    background: #e63939;
  }

  .btn-ghost {
    background: transparent;
    color: var(--je-text-muted);
  }
  .btn-ghost:hover {
    background: var(--je-bg-input);
    color: var(--je-text);
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
    background: var(--je-bg-input);
    border: 1px solid var(--je-border);
    border-radius: var(--je-radius);
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    font-family: var(--je-font-mono);
    color: var(--je-text);
    outline: none;
    transition: border-color 0.15s ease;
  }
  .input:focus {
    border-color: var(--je-info);
  }
  .input::placeholder {
    color: var(--je-text-dim);
  }
`;

/**
 * Type badge styles
 */
export const typeBadgeStyles = css`
  .type-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.125rem 0.5rem;
    border-radius: var(--je-radius);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    min-width: 3.5rem;
  }

  .type-badge.string { background: #047857; color: #d1fae5; }
  .type-badge.number, .type-badge.integer { background: #7e22ce; color: #f3e8ff; }
  .type-badge.boolean { background: #b45309; color: #fef3c7; }
  .type-badge.object { background: #1d4ed8; color: #dbeafe; }
  .type-badge.array { background: #0891b2; color: #cffafe; }
  .type-badge.null { background: #4b5563; color: #f3f4f6; }
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
    background: var(--je-bg-primary);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--je-border);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--je-text-dim);
  }
`;
