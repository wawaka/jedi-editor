/**
 * Theme service for managing JEDI Editor themes
 * Singleton service that applies themes and persists selection
 */
import { THEMES, SHARED_THEME, DEFAULT_THEME, THEME_NAMES } from '../styles/themes.js';

const STORAGE_KEY = 'jedi-editor-theme';

class ThemeService {
  constructor() {
    this._currentTheme = DEFAULT_THEME;
    this._listeners = new Set();
    this._initialized = false;
  }

  /**
   * Initialize the theme service
   * Loads saved theme from localStorage and applies it
   */
  init() {
    if (this._initialized) return;

    // Load saved theme
    const saved = this._loadFromStorage();
    if (saved && THEMES[saved]) {
      this._currentTheme = saved;
    }

    this._initialized = true;
  }

  /**
   * Get current theme name
   * @returns {string}
   */
  getTheme() {
    return this._currentTheme;
  }

  /**
   * Get list of available theme names
   * @returns {string[]}
   */
  getAvailableThemes() {
    return THEME_NAMES;
  }

  /**
   * Get theme definition by name
   * @param {string} themeName
   * @returns {Object|null}
   */
  getThemeDefinition(themeName) {
    return THEMES[themeName] || null;
  }

  /**
   * Set and apply a theme
   * @param {string} themeName
   * @returns {boolean} Success
   */
  setTheme(themeName) {
    if (!THEMES[themeName]) {
      console.warn(`Theme "${themeName}" not found`);
      return false;
    }

    this._currentTheme = themeName;
    this._saveToStorage(themeName);
    this._notifyListeners(themeName);
    return true;
  }

  /**
   * Get CSS custom properties for a theme
   * @param {string} themeName
   * @returns {Object} CSS property map { '--jedi-bg-primary': '#0a0e27', ... }
   */
  getThemeCSS(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return {};

    const cssProps = {};

    // Add theme-specific properties
    for (const [key, value] of Object.entries(theme)) {
      if (key !== 'name') {
        cssProps[`--jedi-${key}`] = value;
      }
    }

    // Add shared properties
    for (const [key, value] of Object.entries(SHARED_THEME)) {
      cssProps[`--jedi-${key}`] = value;
    }

    return cssProps;
  }

  /**
   * Apply theme CSS properties to an element
   * @param {HTMLElement} element
   * @param {string} themeName
   */
  applyThemeToElement(element, themeName) {
    const cssProps = this.getThemeCSS(themeName);
    for (const [prop, value] of Object.entries(cssProps)) {
      element.style.setProperty(prop, value);
    }
  }

  /**
   * Subscribe to theme changes
   * @param {function} callback - Called with (themeName) when theme changes
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners(themeName) {
    for (const listener of this._listeners) {
      try {
        listener(themeName);
      } catch (e) {
        console.error('Theme listener error:', e);
      }
    }
  }

  _loadFromStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  _saveToStorage(themeName) {
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch {
      // Ignore storage errors
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();
