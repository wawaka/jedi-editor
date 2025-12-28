import { LitElement, html, css } from 'lit';
import { themeStyles, buttonStyles, scrollbarStyles } from '../styles/shared-styles.js';
import './jedi-schema-visual.js';
import '../shared/jedi-raw-editor.js';
import '../shared/jedi-editor-toggle.js';

/**
 * Schema pane component with mode toggle
 * @element jedi-schema-pane
 * @property {Object} schema - Current schema object
 * @fires schema-change - When schema changes, detail: { schema }
 */
export class JediSchemaPane extends LitElement {
  static properties = {
    schema: { type: Object },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _mode: { type: String, state: true },
    _rawValue: { type: String, state: true },
    _parseError: { type: String, state: true }
  };

  static styles = [
    themeStyles,
    buttonStyles,
    scrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

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

      .title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--jedi-text);
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
    `
  ];

  constructor() {
    super();
    this.schema = {};
    this.debugGrid = false;
    this._mode = 'visual';
    this._rawValue = '{}';
    this._parseError = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('schema') && this._mode === 'visual') {
      try {
        this._rawValue = JSON.stringify(this.schema, null, 2);
      } catch {
        // Ignore stringify errors
      }
    }
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <span class="title">Schema</span>
        </div>
        <jedi-editor-toggle
          mode="${this._mode}"
          @mode-change="${this._handleModeChange}"
        ></jedi-editor-toggle>
      </div>

      ${this._parseError ? html`
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
          <jedi-schema-visual
            .schema="${this.schema}"
            ?debug-grid="${this.debugGrid}"
            @schema-change="${this._handleVisualChange}"
          ></jedi-schema-visual>
        `}
      </div>
    `;
  }

  _handleModeChange(e) {
    const newMode = e.detail.mode;

    if (newMode === 'visual' && this._mode === 'raw') {
      try {
        const parsed = JSON.parse(this._rawValue);
        this._emitSchemaChange(parsed);
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
      this._emitSchemaChange(parsed);
      this._parseError = null;
    } catch {
      // Don't update schema if invalid JSON
    }
  }

  _handleVisualChange(e) {
    this._emitSchemaChange(e.detail.schema);
  }

  _emitSchemaChange(schema) {
    this.dispatchEvent(new CustomEvent('schema-change', {
      detail: { schema },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('jedi-schema-pane', JediSchemaPane);
