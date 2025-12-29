import { LitElement, html, css } from 'lit';
import { themeStyles, buttonStyles, scrollbarStyles, paneHeaderStyles } from '../styles/shared-styles.js';
import './jedi-data-visual.js';
import '../shared/jedi-raw-editor.js';
import '../shared/jedi-editor-toggle.js';

/**
 * Data pane component with mode toggle and validation display
 * @element jedi-data-pane
 * @property {*} data - Current data
 * @property {Object} schema - JSON Schema for validation hints
 * @property {boolean} isValid - Whether data is valid
 * @property {Array} errors - Validation errors
 * @fires data-change - When data changes, detail: { data }
 */
export class JediDataPane extends LitElement {
  static properties = {
    data: { type: Object },
    schema: { type: Object },
    isValid: { type: Boolean, attribute: 'is-valid' },
    errors: { type: Array },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _mode: { type: String, state: true },
    _rawValue: { type: String, state: true },
    _parseError: { type: String, state: true }
  };

  static styles = [
    themeStyles,
    buttonStyles,
    scrollbarStyles,
    paneHeaderStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .validation-icon {
        font-size: 0.875rem;
      }

      .validation-icon.valid {
        color: var(--jedi-success);
      }

      .validation-icon.invalid {
        color: var(--jedi-error);
      }

      .error-bar {
        background: rgba(255, 68, 68, 0.15);
        border-bottom: 1px solid var(--jedi-error);
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
        color: var(--jedi-error);
        flex-shrink: 0;
      }

      .content {
        position: relative;
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }

      .errors-footer {
        background: rgba(26, 26, 42, 1);
        border-top: 1px solid var(--jedi-error);
        padding: 0.5rem 0.75rem;
        max-height: 8rem;
        overflow: auto;
        flex-shrink: 0;
      }

      .errors-title {
        color: var(--jedi-error);
        font-size: 0.75rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .error-item {
        font-size: 0.75rem;
        color: var(--jedi-text-muted);
        padding: 0.125rem 0;
      }

      .error-path {
        color: var(--jedi-info);
      }
    `
  ];

  constructor() {
    super();
    this.data = {};
    this.schema = {};
    this.isValid = true;
    this.errors = [];
    this.debugGrid = false;
    this._mode = 'visual';
    this._rawValue = '{}';
    this._parseError = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('data') && this._mode === 'visual') {
      try {
        this._rawValue = JSON.stringify(this.data, null, 2);
      } catch {
        // Ignore stringify errors
      }
    }
  }

  render() {
    const allErrors = this._parseError
      ? [{ path: '', message: this._parseError, keyword: 'parse' }]
      : this.errors;
    const currentIsValid = this.isValid && !this._parseError;

    return html`
      <div class="header">
        <div class="header-left">
          <span class="title">Data</span>
          <span
            class="validation-icon ${currentIsValid ? 'valid' : 'invalid'}"
            title="${currentIsValid ? 'Valid' : `${allErrors.length} error${allErrors.length !== 1 ? 's' : ''}`}"
          >
            ${currentIsValid ? '\u2713' : '\u2717'}
          </span>
        </div>
        <div class="header-controls">
          <slot name="header-controls"></slot>
        </div>
        <div class="header-right">
          <jedi-editor-toggle
            mode="${this._mode}"
            @mode-change="${this._handleModeChange}"
          ></jedi-editor-toggle>
        </div>
      </div>

      ${this._parseError && this._mode === 'raw' ? html`
        <div class="error-bar">
          Parse error: ${this._parseError}
        </div>
      ` : ''}

      <div class="content">
        ${this._mode === 'raw' ? html`
          <jedi-raw-editor
            .value="${this._rawValue}"
            @change="${this._handleRawChange}"
          ></jedi-raw-editor>
        ` : html`
          <jedi-data-visual
            .data="${this.data}"
            .schema="${this.schema}"
            .errors="${this.errors}"
            ?debug-grid="${this.debugGrid}"
            @data-change="${this._handleVisualChange}"
          ></jedi-data-visual>
        `}
      </div>

      ${allErrors.length > 0 ? html`
        <div class="errors-footer">
          <div class="errors-title">Validation Errors (${allErrors.length})</div>
          ${allErrors.map(error => html`
            <div class="error-item">
              <span class="error-path">${error.path || '/'}</span>: ${error.message}
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }

  _handleModeChange(e) {
    const newMode = e.detail.mode;

    if (newMode === 'visual' && this._mode === 'raw') {
      try {
        const parsed = JSON.parse(this._rawValue);
        this._emitDataChange(parsed);
        this._parseError = null;
        this._mode = newMode;
      } catch (err) {
        this._parseError = err instanceof Error ? err.message : 'Invalid JSON';
      }
    } else {
      this._parseError = null;
      this._mode = newMode;
    }
  }

  _handleRawChange(e) {
    this._rawValue = e.detail.value;
    try {
      const parsed = JSON.parse(e.detail.value);
      this._emitDataChange(parsed);
      this._parseError = null;
    } catch {
      // Don't update data if invalid JSON
    }
  }

  _handleVisualChange(e) {
    this._emitDataChange(e.detail.data);
  }

  _emitDataChange(data) {
    this.dispatchEvent(new CustomEvent('data-change', {
      detail: { data },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('jedi-data-pane', JediDataPane);
