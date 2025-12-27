import { LitElement, html, css } from 'lit';
import { themeStyles } from './styles/shared-styles.js';
import { validationService } from './services/validation-service.js';
import { DEFAULT_SCHEMA, DEFAULT_DATA } from './shared/constants.js';
import './schema-pane/je-schema-pane.js';
import './data-pane/je-data-pane.js';

/**
 * Main JSON Editor container with dual-pane layout
 * A pure editing component - receives schema/data, emits change events.
 *
 * @element je-editor
 * @property {Object} initialSchema - Initial schema (optional, uses default if not provided)
 * @property {*} initialData - Initial data (optional, uses default if not provided)
 * @fires schema-change - When schema changes, detail: { schema }
 * @fires data-change - When data changes, detail: { data }
 * @fires validation-change - When validation state changes, detail: { isValid, errors }
 */
export class JeEditor extends LitElement {
  static properties = {
    initialSchema: { type: Object, attribute: 'initial-schema' },
    initialData: { type: Object, attribute: 'initial-data' },
    _schema: { type: Object, state: true },
    _data: { type: Object, state: true },
    _isValid: { type: Boolean, state: true },
    _errors: { type: Array, state: true },
    _debugGrid: { type: Boolean, state: true }
  };

  static styles = [
    themeStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--je-bg-primary);
        font-family: var(--je-font-sans);
      }

      .panes {
        display: flex;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .pane {
        flex: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .pane:first-child {
        border-right: 1px solid var(--je-border);
      }
    `
  ];

  constructor() {
    super();
    this.initialSchema = null;
    this.initialData = null;
    this._schema = null;
    this._data = null;
    this._isValid = true;
    this._errors = [];
    this._debugGrid = false;
    this._ready = false;
  }

  async connectedCallback() {
    super.connectedCallback();

    await validationService.init();
    this._ready = true;

    if (this._schema === null) {
      this._schema = this.initialSchema || DEFAULT_SCHEMA;
    }
    if (this._data === null) {
      this._data = this.initialData !== null && this.initialData !== undefined
        ? this.initialData
        : DEFAULT_DATA;
    }

    this._validate();
  }

  render() {
    return html`
      <div class="panes">
        <div class="pane">
          <je-schema-pane
            .schema="${this._schema}"
            ?debug-grid="${this._debugGrid}"
            @schema-change="${this._handleSchemaChange}"
          ></je-schema-pane>
        </div>
        <div class="pane">
          <je-data-pane
            .data="${this._data}"
            .schema="${this._schema}"
            ?is-valid="${this._isValid}"
            .errors="${this._errors}"
            ?debug-grid="${this._debugGrid}"
            @data-change="${this._handleDataChange}"
          ></je-data-pane>
        </div>
      </div>
    `;
  }

  _validate() {
    if (!this._ready) return;

    const compileResult = validationService.compileSchema(this._schema);
    if (!compileResult.success) {
      this._isValid = false;
      this._errors = [{ path: '', message: compileResult.error || 'Invalid schema', keyword: 'schema' }];
      this._emitValidationChange();
      return;
    }

    const validationResult = validationService.validate(this._data);
    this._isValid = validationResult.isValid;
    this._errors = validationResult.errors;
    this._emitValidationChange();
  }

  _emitValidationChange() {
    this.dispatchEvent(new CustomEvent('validation-change', {
      detail: { isValid: this._isValid, errors: this._errors },
      bubbles: true,
      composed: true
    }));
  }

  _handleSchemaChange(e) {
    this._schema = e.detail.schema;
    this._validate();

    this.dispatchEvent(new CustomEvent('schema-change', {
      detail: { schema: this._schema },
      bubbles: true,
      composed: true
    }));
  }

  _handleDataChange(e) {
    this._data = e.detail.data;
    this._validate();

    this.dispatchEvent(new CustomEvent('data-change', {
      detail: { data: this._data },
      bubbles: true,
      composed: true
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  get schema() {
    return this._schema;
  }

  set schema(value) {
    this._schema = value;
    this._validate();
    this.dispatchEvent(new CustomEvent('schema-change', {
      detail: { schema: this._schema },
      bubbles: true,
      composed: true
    }));
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this._validate();
    this.dispatchEvent(new CustomEvent('data-change', {
      detail: { data: this._data },
      bubbles: true,
      composed: true
    }));
  }

  get isValid() {
    return this._isValid;
  }

  get errors() {
    return this._errors;
  }

  validate() {
    this._validate();
    return { isValid: this._isValid, errors: this._errors };
  }

  getState() {
    return {
      schema: this._schema,
      data: this._data,
      isValid: this._isValid,
      errors: this._errors
    };
  }

  setState(schema, data) {
    this._schema = schema;
    this._data = data;
    this._validate();
  }

  set debugGrid(value) {
    this._debugGrid = value;
  }

  get debugGrid() {
    return this._debugGrid;
  }
}

customElements.define('je-editor', JeEditor);
