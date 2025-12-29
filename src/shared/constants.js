/**
 * Shared constants for JsonEditor Lit components
 */

import { TYPE_COLOR_SCHEMES, DEFAULT_TYPE_SCHEME } from '../styles/themes.js';

// Type colors for visual distinction (CSS values)
// Uses the configured default type color scheme
// badge: background color for type badge
// text: text color for type badge
// border: border/frame color for blocks
export const TYPE_COLORS = TYPE_COLOR_SCHEMES[DEFAULT_TYPE_SCHEME];

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
