import { css } from 'lit';

/**
 * Shared CSS custom properties theme
 */
export const themeStyles = css`
  :host {
    /* Background colors */
    --jedi-bg-primary: #0a0e27;
    --jedi-bg-secondary: #0f1629;
    --jedi-bg-input: #1e2a4a;
    --jedi-bg-hover: #2a3a5a;

    /* Border colors */
    --jedi-border: #1e2a4a;
    --jedi-border-light: rgba(255, 255, 255, 0.1);

    /* Accent colors */
    --jedi-accent: #ff6b00;
    --jedi-success: #00ff88;
    --jedi-error: #ff4444;
    --jedi-warning: #ffa64d;
    --jedi-info: #4da6ff;

    /* Text colors */
    --jedi-text: #ffffff;
    --jedi-text-muted: #9ca3af;
    --jedi-text-dim: #6b7280;

    /* Type colors */
    --jedi-string: #00ff88;
    --jedi-number: #ff6b00;
    --jedi-boolean: #ffa64d;
    --jedi-object: #4da6ff;
    --jedi-array: #06b6d4;
    --jedi-null: #9ca3af;

    /* Sizing */
    --jedi-radius: 4px;
    --jedi-radius-lg: 8px;

    /* Fonts */
    --jedi-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    --jedi-font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

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
