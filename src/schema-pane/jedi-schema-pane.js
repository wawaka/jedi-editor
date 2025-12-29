import { LitElement, html, css } from 'lit';
import { themeStyles, buttonStyles, scrollbarStyles, paneHeaderStyles } from '../styles/shared-styles.js';
import './jedi-schema-visual.js';
import '../shared/jedi-raw-editor.js';
import '../shared/jedi-editor-toggle.js';

/**
 * Schema pane component with mode toggle
 * @element jedi-schema-pane
 * @property {Object} schema - Current schema object
 * @property {*} data - Current data (for showing ghost fields)
 * @fires schema-change - When schema changes, detail: { schema }
 */
export class JediSchemaPane extends LitElement {
  static properties = {
    schema: { type: Object },
    data: { type: Object },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _mode: { type: String, state: true },
    _rawValue: { type: String, state: true },
    _parseError: { type: String, state: true },
    _showDataGhosts: { type: Boolean, state: true }
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

      .ghost-toggle {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.625rem;
        color: var(--jedi-text-muted);
        background: none;
        border: 1px dashed var(--jedi-text-dim);
        border-radius: var(--jedi-radius);
        cursor: pointer;
        transition: all 0.15s;
        opacity: 0.6;
      }

      .ghost-toggle:hover {
        opacity: 1;
        color: var(--jedi-text);
        border-color: var(--jedi-text-muted);
      }

      .ghost-toggle.active {
        opacity: 1;
        color: var(--jedi-info);
        border-color: var(--jedi-info);
        border-style: solid;
      }

      .ghost-toggle svg {
        width: 0.75rem;
        height: 0.75rem;
      }
    `
  ];

  constructor() {
    super();
    this.schema = {};
    this.data = {};
    this.debugGrid = false;
    this._mode = 'visual';
    this._rawValue = '{}';
    this._parseError = null;
    this._showDataGhosts = false;
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
        <div class="header-controls">
          <slot name="header-controls"></slot>
        </div>
        <div class="header-right">
          <button
            class="ghost-toggle ${this._showDataGhosts ? 'active' : ''}"
            @click="${this._toggleDataGhosts}"
            title="${this._showDataGhosts ? 'Hide data fields' : 'Show fields from data not in schema'}"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            data
          </button>
          <jedi-editor-toggle
            mode="${this._mode}"
            @mode-change="${this._handleModeChange}"
          ></jedi-editor-toggle>
        </div>
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
            .data="${this.data}"
            ?show-data-ghosts="${this._showDataGhosts}"
            ?debug-grid="${this.debugGrid}"
            @schema-change="${this._handleVisualChange}"
          ></jedi-schema-visual>
        `}
      </div>
    `;
  }

  _toggleDataGhosts() {
    this._showDataGhosts = !this._showDataGhosts;
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
