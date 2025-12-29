/**
 * Theme definitions for JEDI Editor
 * Each theme defines all CSS custom property values
 */

/**
 * Type color schemes for JSON types
 * Each scheme defines colors for: string, number, integer, boolean, object, array, null
 * Format: { badge: background, text: foreground, border: border/frame color }
 */
export const TYPE_COLOR_SCHEMES = {
  // Current JEDI colors (green strings, purple numbers)
  jedi: {
    string:  { badge: '#b45309', text: '#fef3c7', border: 'rgba(180, 83, 9, 0.5)' },
    number:  { badge: '#047857', text: '#d1fae5', border: 'rgba(4, 120, 87, 0.5)' },
    integer: { badge: '#047857', text: '#d1fae5', border: 'rgba(4, 120, 87, 0.5)' },
    boolean: { badge: '#7e22ce', text: '#f3e8ff', border: 'rgba(126, 34, 206, 0.5)' },
    object:  { badge: '#1d4ed8', text: '#dbeafe', border: 'rgba(29, 78, 216, 0.5)' },
    array:   { badge: '#0891b2', text: '#cffafe', border: 'rgba(8, 145, 178, 0.5)' },
    null:    { badge: '#4b5563', text: '#f3f4f6', border: 'rgba(75, 85, 99, 0.5)' },
  },

  // VS Code Dark+ (orange strings, light green numbers)
  vscode: {
    string:  { badge: '#CE9178', text: '#1e1e1e', border: 'rgba(206, 145, 120, 0.5)' },
    number:  { badge: '#B5CEA8', text: '#1e1e1e', border: 'rgba(181, 206, 168, 0.5)' },
    integer: { badge: '#B5CEA8', text: '#1e1e1e', border: 'rgba(181, 206, 168, 0.5)' },
    boolean: { badge: '#569CD6', text: '#1e1e1e', border: 'rgba(86, 156, 214, 0.5)' },
    object:  { badge: '#9CDCFE', text: '#1e1e1e', border: 'rgba(156, 220, 254, 0.5)' },
    array:   { badge: '#4EC9B0', text: '#1e1e1e', border: 'rgba(78, 201, 176, 0.5)' },
    null:    { badge: '#569CD6', text: '#1e1e1e', border: 'rgba(86, 156, 214, 0.5)' },
  },

  // JetBrains Darcula (green strings, blue numbers)
  jetbrains: {
    string:  { badge: '#6A8759', text: '#f0f0f0', border: 'rgba(106, 135, 89, 0.5)' },
    number:  { badge: '#6897BB', text: '#f0f0f0', border: 'rgba(104, 151, 187, 0.5)' },
    integer: { badge: '#6897BB', text: '#f0f0f0', border: 'rgba(104, 151, 187, 0.5)' },
    boolean: { badge: '#CC7832', text: '#f0f0f0', border: 'rgba(204, 120, 50, 0.5)' },
    object:  { badge: '#9876AA', text: '#f0f0f0', border: 'rgba(152, 118, 170, 0.5)' },
    array:   { badge: '#629755', text: '#f0f0f0', border: 'rgba(98, 151, 85, 0.5)' },
    null:    { badge: '#CC7832', text: '#f0f0f0', border: 'rgba(204, 120, 50, 0.5)' },
  },

  // Monokai (yellow strings, purple numbers)
  monokai: {
    string:  { badge: '#E6DB74', text: '#272822', border: 'rgba(230, 219, 116, 0.5)' },
    number:  { badge: '#AE81FF', text: '#f0f0f0', border: 'rgba(174, 129, 255, 0.5)' },
    integer: { badge: '#AE81FF', text: '#f0f0f0', border: 'rgba(174, 129, 255, 0.5)' },
    boolean: { badge: '#F92672', text: '#f0f0f0', border: 'rgba(249, 38, 114, 0.5)' },
    object:  { badge: '#66D9EF', text: '#272822', border: 'rgba(102, 217, 239, 0.5)' },
    array:   { badge: '#A6E22E', text: '#272822', border: 'rgba(166, 226, 46, 0.5)' },
    null:    { badge: '#F92672', text: '#f0f0f0', border: 'rgba(249, 38, 114, 0.5)' },
  },

  // GitHub (blue-focused, muted)
  github: {
    string:  { badge: '#0A3069', text: '#f0f0f0', border: 'rgba(10, 48, 105, 0.5)' },
    number:  { badge: '#0550AE', text: '#f0f0f0', border: 'rgba(5, 80, 174, 0.5)' },
    integer: { badge: '#0550AE', text: '#f0f0f0', border: 'rgba(5, 80, 174, 0.5)' },
    boolean: { badge: '#0550AE', text: '#f0f0f0', border: 'rgba(5, 80, 174, 0.5)' },
    object:  { badge: '#8250DF', text: '#f0f0f0', border: 'rgba(130, 80, 223, 0.5)' },
    array:   { badge: '#1B7C83', text: '#f0f0f0', border: 'rgba(27, 124, 131, 0.5)' },
    null:    { badge: '#57606A', text: '#f0f0f0', border: 'rgba(87, 96, 106, 0.5)' },
  },
};

export const DEFAULT_TYPE_SCHEME = 'jedi';
export const TYPE_SCHEME_NAMES = Object.keys(TYPE_COLOR_SCHEMES);

// Helper to extract type colors from scheme for CSS variables
const getTypeColors = (scheme) => ({
  'string': scheme.string.badge,
  'number': scheme.number.badge,
  'boolean': scheme.boolean.badge,
  'object': scheme.object.badge,
  'array': scheme.array.badge,
  'null': scheme.null.badge,
});

const typeColors = getTypeColors(TYPE_COLOR_SCHEMES[DEFAULT_TYPE_SCHEME]);

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
    // Type colors (from selected type scheme)
    ...typeColors
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
    // Type colors (from selected type scheme)
    ...typeColors
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
