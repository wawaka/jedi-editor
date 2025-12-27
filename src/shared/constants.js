/**
 * Shared constants for JsonEditor Lit components
 */

// Type colors for visual distinction (CSS values)
// badge: background color for type badge
// text: text color for type badge
// border: border/frame color for blocks
export const TYPE_COLORS = {
  string:  { badge: '#047857', text: '#d1fae5', border: 'rgba(4, 120, 87, 0.5)' },
  number:  { badge: '#7e22ce', text: '#f3e8ff', border: 'rgba(126, 34, 206, 0.5)' },
  integer: { badge: '#7e22ce', text: '#f3e8ff', border: 'rgba(126, 34, 206, 0.5)' },
  boolean: { badge: '#b45309', text: '#fef3c7', border: 'rgba(180, 83, 9, 0.5)' },
  object:  { badge: '#1d4ed8', text: '#dbeafe', border: 'rgba(29, 78, 216, 0.5)' },
  array:   { badge: '#0891b2', text: '#cffafe', border: 'rgba(8, 145, 178, 0.5)' },
  null:    { badge: '#4b5563', text: '#f3f4f6', border: 'rgba(75, 85, 99, 0.5)' },
};

// Theme colors
export const THEME = {
  bgPrimary: '#0a0e27',
  bgSecondary: '#0f1629',
  bgInput: '#1e2a4a',
  border: '#1e2a4a',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  accent: '#ff6b00',
  success: '#00ff88',
  error: '#ff4444',
  warning: '#ffa64d',
  info: '#4da6ff',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
};

// Available schema types
export const SCHEMA_TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array'];

// Default schema (simple fallback)
export const DEFAULT_SCHEMA = {
  type: 'object',
  properties: {}
};

// Default data (simple fallback)
export const DEFAULT_DATA = {};

// Layout dimensions
export const LAYOUT = {
  blockRowHeight: '1.75rem',
};
