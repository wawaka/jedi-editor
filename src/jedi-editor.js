import { LitElement, html, css } from 'lit';
import { themeStyles, themeVarsStyles } from './styles/shared-styles.js';
import { validationService } from './services/validation-service.js';
import { themeService } from './services/theme-service.js';
import { DEFAULT_SCHEMA, DEFAULT_DATA } from './shared/constants.js';
import './schema-pane/jedi-schema-pane.js';
import './data-pane/jedi-data-pane.js';

/**
 * Main JSON Editor container with dual-pane layout
 * A pure editing component - receives schema/data, emits change events.
 *
 * @element jedi-editor
 * @property {Object} initialSchema - Initial schema (optional, uses default if not provided)
 * @property {*} initialData - Initial data (optional, uses default if not provided)
 * @property {string} theme - Current theme name ('dark' | 'light')
 * @fires schema-change - When schema changes, detail: { schema }
 * @fires data-change - When data changes, detail: { data }
 * @fires validation-change - When validation state changes, detail: { isValid, errors }
 * @fires theme-change - When theme changes, detail: { theme }
 */
export class JediEditor extends LitElement {
  static properties = {
    initialSchema: { type: Object, attribute: 'initial-schema' },
    initialData: { type: Object, attribute: 'initial-data' },
    _schema: { type: Object, state: true },
    _data: { type: Object, state: true },
    _isValid: { type: Boolean, state: true },
    _errors: { type: Array, state: true },
    _debugGrid: { type: Boolean, state: true },
    _theme: { type: String, state: true }
  };

  static styles = [
    themeVarsStyles,
    themeStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--jedi-bg-primary);
        font-family: var(--jedi-font-sans);
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
        border-right: 1px solid var(--jedi-border);
      }

      slot[name="schema-header-controls"],
      slot[name="data-header-controls"] {
        display: none;
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
    this._theme = null;
  }

  async connectedCallback() {
    super.connectedCallback();

    // Initialize services
    themeService.init();
    await validationService.init();
    this._ready = true;

    // Initialize theme
    if (this._theme === null) {
      this._theme = themeService.getTheme();
    }
    this._applyTheme(this._theme);

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
      <slot name="schema-header-controls" @slotchange="${this._handleSchemaSlotChange}"></slot>
      <slot name="data-header-controls" @slotchange="${this._handleDataSlotChange}"></slot>
      <div class="panes">
        <div class="pane">
          <jedi-schema-pane
            .schema="${this._schema}"
            ?debug-grid="${this._debugGrid}"
            @schema-change="${this._handleSchemaChange}"
          ></jedi-schema-pane>
        </div>
        <div class="pane">
          <jedi-data-pane
            .data="${this._data}"
            .schema="${this._schema}"
            ?is-valid="${this._isValid}"
            .errors="${this._errors}"
            ?debug-grid="${this._debugGrid}"
            @data-change="${this._handleDataChange}"
          ></jedi-data-pane>
        </div>
      </div>
    `;
  }

  _handleSchemaSlotChange(e) {
    const slot = e.target;
    const schemaPane = this.shadowRoot.querySelector('jedi-schema-pane');
    if (!schemaPane) return;

    const assigned = slot.assignedElements();
    if (assigned.length === 0) return;

    // Move assigned elements to schema pane's light DOM (preserves event listeners)
    assigned.forEach(el => {
      el.setAttribute('slot', 'header-controls');
      this._applyHeaderControlStyles(el);
      schemaPane.appendChild(el);
    });
  }

  _handleDataSlotChange(e) {
    const slot = e.target;
    const dataPane = this.shadowRoot.querySelector('jedi-data-pane');
    if (!dataPane) return;

    const assigned = slot.assignedElements();
    if (assigned.length === 0) return;

    // Move assigned elements to data pane's light DOM (preserves event listeners)
    assigned.forEach(el => {
      el.setAttribute('slot', 'header-controls');
      this._applyHeaderControlStyles(el);
      dataPane.appendChild(el);
    });
  }

  _applyHeaderControlStyles(container) {
    // Style the container
    container.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-left:auto;';

    // Style buttons
    container.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = `
        padding: 0.25rem 0.5rem;
        font-size: 0.6875rem;
        font-weight: 500;
        font-family: var(--jedi-font-sans);
        border: none;
        border-radius: var(--jedi-radius);
        background: transparent;
        color: var(--jedi-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
      `.replace(/\s+/g, ' ');
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'var(--jedi-bg-input)';
        btn.style.color = 'var(--jedi-text)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--jedi-text-muted)';
      });
    });

    // Style selects
    container.querySelectorAll('select').forEach(sel => {
      sel.style.cssText = `
        padding: 0.25rem 1.25rem 0.25rem 0.5rem;
        font-size: 0.6875rem;
        font-weight: 500;
        font-family: var(--jedi-font-sans);
        border: none;
        border-radius: var(--jedi-radius);
        background-color: var(--jedi-bg-primary);
        color: var(--jedi-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.375rem center;
      `.replace(/\s+/g, ' ');
      sel.addEventListener('mouseenter', () => {
        sel.style.backgroundColor = 'var(--jedi-bg-input)';
        sel.style.color = 'var(--jedi-text)';
      });
      sel.addEventListener('mouseleave', () => {
        sel.style.backgroundColor = 'var(--jedi-bg-primary)';
        sel.style.color = 'var(--jedi-text-muted)';
      });
      sel.addEventListener('focus', () => {
        sel.style.backgroundColor = 'var(--jedi-bg-input)';
        sel.style.color = 'var(--jedi-text)';
        sel.style.outline = 'none';
      });
      sel.addEventListener('blur', () => {
        sel.style.backgroundColor = 'var(--jedi-bg-primary)';
        sel.style.color = 'var(--jedi-text-muted)';
      });
    });

    // Style dividers
    container.querySelectorAll('.divider').forEach(div => {
      div.style.cssText = 'width:1px;height:1rem;background:var(--jedi-border);';
    });
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

  // Theme API
  get theme() {
    return this._theme;
  }

  set theme(value) {
    const oldTheme = this._theme;
    if (value === oldTheme) return;

    this._theme = value;
    themeService.setTheme(value);
    this._applyTheme(value);

    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: value },
      bubbles: true,
      composed: true
    }));
  }

  getAvailableThemes() {
    return themeService.getAvailableThemes();
  }

  _applyTheme(themeName) {
    themeService.applyThemeToElement(this, themeName);
  }
}

customElements.define('jedi-editor', JediEditor);
