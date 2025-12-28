/**
 * Theme definitions for JEDI Editor
 * Each theme defines all CSS custom property values
 */

export const THEMES = {
  dark: {
    name: 'dark',
    // Background colors
    'bg-primary': '#0a0e27',
    'bg-secondary': '#0f1629',
    'bg-input': '#1e2a4a',
    'bg-hover': '#2a3a5a',
    // Border colors
    'border': '#1e2a4a',
    'border-light': 'rgba(255, 255, 255, 0.1)',
    // Accent colors
    'accent': '#ff6b00',
    'success': '#00ff88',
    'error': '#ff4444',
    'warning': '#ffa64d',
    'info': '#4da6ff',
    // Text colors
    'text': '#ffffff',
    'text-muted': '#9ca3af',
    'text-dim': '#6b7280',
    // Type colors
    'string': '#00ff88',
    'number': '#ff6b00',
    'boolean': '#ffa64d',
    'object': '#4da6ff',
    'array': '#06b6d4',
    'null': '#9ca3af'
  },

  light: {
    name: 'light',
    // Background colors
    'bg-primary': '#ffffff',
    'bg-secondary': '#f8fafc',
    'bg-input': '#f1f5f9',
    'bg-hover': '#e2e8f0',
    // Border colors
    'border': '#e2e8f0',
    'border-light': 'rgba(0, 0, 0, 0.1)',
    // Accent colors (adjusted for contrast on light backgrounds)
    'accent': '#ea580c',
    'success': '#059669',
    'error': '#dc2626',
    'warning': '#d97706',
    'info': '#2563eb',
    // Text colors
    'text': '#1e293b',
    'text-muted': '#64748b',
    'text-dim': '#94a3b8',
    // Type colors (adjusted for contrast on light backgrounds)
    'string': '#059669',
    'number': '#c2410c',
    'boolean': '#d97706',
    'object': '#2563eb',
    'array': '#0891b2',
    'null': '#6b7280'
  }
};

// Shared values that don't change between themes
export const SHARED_THEME = {
  'radius': '4px',
  'radius-lg': '8px',
  'font-mono': 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  'font-sans': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
};

export const DEFAULT_THEME = 'dark';
export const THEME_NAMES = Object.keys(THEMES);
