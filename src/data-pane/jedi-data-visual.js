import { LitElement, html, css, unsafeCSS } from 'lit';
import { themeStyles, buttonStyles, inputStyles, scrollbarStyles } from '../styles/shared-styles.js';
import { LAYOUT, SCHEMA_TYPES } from '../shared/constants.js';
import '../shared/jedi-value-block.js';
import '../shared/jedi-delete-button.js';

const DATA_TYPES = [...SCHEMA_TYPES, 'null'];

/**
 * Data visual editor with recursive value editing
 * @element jedi-data-visual
 * @property {*} data - Data to edit
 * @property {Object} schema - JSON Schema for type hints and ghost properties
 * @property {Array} errors - Validation errors
 * @fires data-change - When data changes, detail: { data }
 */
export class JediDataVisual extends LitElement {
  static properties = {
    data: { type: Object },
    schema: { type: Object },
    errors: { type: Array },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _expandedPaths: { type: Object, state: true },
    _editingPath: { type: String, state: true },
    _editValue: { type: String, state: true },
    _renamingPath: { type: String, state: true },
    _renameValue: { type: String, state: true },
    _typeMenuState: { type: Object, state: true }
  };

  static styles = [
    themeStyles,
    buttonStyles,
    inputStyles,
    scrollbarStyles,
    css`
      :host {
        display: block;
        padding: 1rem;
        background: var(--jedi-bg-secondary);
      }

      .property-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
      }

      .property-name {
        display: flex;
        align-items: center;
        padding: 0.25rem 0.5rem 0.25rem 0;
        min-height: ${unsafeCSS(LAYOUT.blockRowHeight)};
        box-sizing: border-box;
        overflow: visible;
      }

      .property-value {
        padding: 0.25rem 0;
        min-height: ${unsafeCSS(LAYOUT.blockRowHeight)};
        box-sizing: border-box;
      }

      /* Debug grid lines */
      :host([debug-grid]) .property-grid {
        border: 1px solid rgba(255, 0, 0, 0.3);
      }
      :host([debug-grid]) .property-name {
        border: 1px solid rgba(0, 255, 0, 0.3);
      }
      :host([debug-grid]) .property-value {
        border: 1px solid rgba(0, 0, 255, 0.3);
      }

      .name-btn {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        font-weight: 500;
        color: var(--jedi-text);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: color 0.15s ease;
        text-align: left;
      }

      .name-btn:hover {
        color: var(--jedi-info);
      }

      .name-btn.not-in-schema {
        border-bottom: 1px solid var(--jedi-text-dim);
      }

      .name-btn.has-error {
        text-decoration: underline wavy var(--jedi-error);
        text-underline-offset: 2px;
      }

      .array-index.has-error {
        text-decoration: underline wavy var(--jedi-error);
        text-underline-offset: 2px;
      }

      .array-index {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        color: var(--jedi-text-muted);
      }

      .ghost-name {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        color: var(--jedi-text-muted);
        font-style: italic;
      }

      .ghost-name.has-error {
        text-decoration: underline wavy var(--jedi-error);
        text-underline-offset: 2px;
      }

      .name-group {
        position: relative;
        display: flex;
        align-items: center;
      }

      .hover-actions {
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding-right: 0.5rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
        z-index: 10;
      }

      .hover-actions::after {
        content: '';
        position: absolute;
        top: -0.5rem;
        bottom: -0.5rem;
        left: -0.5rem;
        right: 0;
        z-index: -1;
      }

      .name-group:hover .hover-actions,
      .hover-actions:hover {
        opacity: 1;
        pointer-events: auto;
      }

      .empty-message {
        font-size: 0.75rem;
        color: var(--jedi-text-muted);
        font-style: italic;
      }

      /* Value editing */
      .value-display {
        font-size: 0.75rem;
        font-family: var(--jedi-font-mono);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity 0.15s ease;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .value-display:hover {
        opacity: 0.8;
      }

      .value-display.string {
        color: var(--jedi-string);
      }

      .value-display.number {
        color: var(--jedi-number);
      }

      .value-display.null {
        color: var(--jedi-text-muted);
      }

      .value-input {
        flex: 1;
        min-width: 0;
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
      }

      .name-input {
        width: 8rem;
        padding: 0.125rem 0.5rem;
        font-size: 0.875rem;
      }

      /* Boolean toggle */
      .bool-toggle {
        position: relative;
        width: 2.25rem;
        height: 1.25rem;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }

      .bool-toggle.on {
        background: var(--jedi-success);
        box-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
      }

      .bool-toggle.off {
        background: var(--jedi-text-muted);
      }

      .bool-toggle:hover {
        filter: brightness(1.1);
      }

      .bool-toggle:active .bool-toggle-knob {
        width: 0.95rem;
      }

      .bool-toggle-knob {
        position: absolute;
        top: 0.125rem;
        left: 0.125rem;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.1s ease;
      }

      .bool-toggle.on .bool-toggle-knob {
        transform: translateX(1rem);
      }

      /* Enum badges */
      .enum-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        align-items: center;
      }

      .enum-badge {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        font-family: var(--jedi-font-mono);
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .enum-badge.selected {
        background: var(--jedi-info);
        color: white;
      }

      .enum-badge:not(.selected) {
        background: var(--jedi-bg-input);
        color: var(--jedi-text-muted);
      }

      .enum-badge:not(.selected):hover {
        background: var(--jedi-bg-hover);
        color: var(--jedi-text);
      }

      .invalid-enum {
        padding: 0.125rem 0.375rem;
        border-radius: var(--jedi-radius);
        font-size: 0.625rem;
        font-family: var(--jedi-font-mono);
        background: rgba(255, 68, 68, 0.2);
        color: var(--jedi-error);
        border: 1px solid rgba(255, 68, 68, 0.5);
      }

      .type-menu {
        position: fixed;
        background: var(--jedi-bg-input);
        border: 1px solid #3a4a6a;
        border-radius: var(--jedi-radius);
        padding: 0.25rem;
        z-index: 10000;
        min-width: 100px;
      }

      .type-menu button {
        display: block;
        width: 100%;
        padding: 0.375rem 0.5rem;
        text-align: left;
        font-size: 0.75rem;
        background: none;
        border: none;
        color: var(--jedi-text);
        cursor: pointer;
        border-radius: 2px;
        transition: background 0.15s;
      }

      .type-menu button:hover {
        background: var(--jedi-bg-hover);
      }

      .type-menu button.selected {
        background: var(--jedi-info);
        color: white;
      }

    `
  ];

  constructor() {
    super();
    this.data = {};
    this.schema = {};
    this.errors = [];
    this.debugGrid = false;
    this._expandedPaths = new Set(['']);
    this._editingPath = null;
    this._editValue = '';
    this._renamingPath = null;
    this._renameValue = '';
    this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
  }

  render() {
    const rootType = this._getValueType(this.data);
    const hasChildren = rootType === 'object' || rootType === 'array';
    const isExpanded = this._expandedPaths.has('');

    return html`
      <jedi-value-block
        type="${rootType}"
        ?expanded="${isExpanded}"
        ?clickable="${hasChildren}"
        ?show-add-button="${hasChildren}"
        add-button-title="${rootType === 'array' ? 'Add item' : 'Add property'}"
        count="${hasChildren ? (rootType === 'array' ? this.data.length : Object.keys(this.data || {}).length) : null}"
        count-format="${rootType === 'array' ? 'array' : 'object'}"
        @toggle-expand="${() => this._toggleExpand('')}"
        @type-click="${(e) => this._openTypeMenu(e.detail.event, [])}"
        @add-click="${rootType === 'array' ? this._handleAddRootItem : this._handleAddRootProperty}"
      >
        ${!hasChildren ? this._renderPrimitiveEditor(this.data, rootType, this.schema, []) : ''}
        <div slot="content">
          ${this._renderChildren(this.data, this.schema, [])}
        </div>
      </jedi-value-block>

      ${this._renderTypeMenu()}
    `;
  }

  _renderChildren(data, schema, path) {
    const type = this._getValueType(data);

    if (type === 'object') {
      const dataKeys = Object.keys(data);
      const schemaProps = schema?.properties || {};
      const schemaKeys = Object.keys(schemaProps);

      // Keys in schema order (real or ghost)
      const schemaItems = schemaKeys.map(key => {
        if (dataKeys.includes(key)) {
          return { type: 'real', key, value: data[key], schema: schemaProps[key] };
        } else {
          return { type: 'ghost', key, schema: schemaProps[key] };
        }
      });

      // Extra keys not in schema (at the bottom)
      const extraItems = dataKeys
        .filter(key => !schemaKeys.includes(key))
        .map(key => ({ type: 'extra', key, value: data[key], schema: null }));

      if (schemaItems.length === 0 && extraItems.length === 0) {
        return html`<div class="empty-message">Empty object</div>`;
      }

      return html`
        <div class="property-grid">
          ${schemaItems.map(item =>
            item.type === 'ghost'
              ? this._renderGhost(item.key, item.schema, path)
              : this._renderProperty(item.key, item.value, item.schema, path, false)
          )}
          ${extraItems.map(item => this._renderProperty(item.key, item.value, null, path, false))}
        </div>
      `;
    }

    if (type === 'array') {
      if (data.length === 0) {
        return html`<div class="empty-message">Empty array</div>`;
      }

      return html`
        <div class="property-grid">
          ${data.map((item, index) => this._renderProperty(String(index), item, schema?.items, path, true))}
        </div>
      `;
    }

    return '';
  }

  _renderProperty(name, value, schemaNode, parentPath, isArrayItem) {
    const path = [...parentPath, name];
    const pathStr = path.join('/');
    const valueType = this._getValueType(value);
    const hasChildren = valueType === 'object' || valueType === 'array';
    const isExpanded = this._expandedPaths.has(pathStr);
    const hasError = this._hasError(path);

    // Name element
    const nameElement = isArrayItem ? html`
      <span class="array-index ${hasError ? 'has-error' : ''}">[${name}]</span>
    ` : this._renamingPath === pathStr ? html`
      <input
        type="text"
        class="input name-input"
        .value="${this._renameValue}"
        @input="${e => this._renameValue = e.target.value}"
        @blur="${() => this._finishRename(path)}"
        @keydown="${e => this._handleRenameKeyDown(e, path)}"
        autofocus
      />
    ` : html`
      <button
        class="name-btn ${schemaNode ? '' : 'not-in-schema'} ${hasError ? 'has-error' : ''}"
        @click="${() => this._startRename(pathStr, name)}"
        title="${schemaNode ? 'Click to rename' : 'Not in schema - click to rename'}"
      >${name}</button>
    `;

    // Value element
    const valueElement = this._renderValueEditor(value, valueType, schemaNode, path, hasChildren, isExpanded);

    return html`
      <div class="property-name">
        <div class="name-group">
          <div class="hover-actions">
            <jedi-delete-button
              @click="${e => this._handleDelete(e, path, name, isArrayItem)}"
              title="${isArrayItem ? 'Delete item' : 'Delete property'}"
            ></jedi-delete-button>
          </div>
          ${nameElement}
        </div>
      </div>
      <div class="property-value">
        ${valueElement}
      </div>
    `;
  }

  _renderGhost(name, schemaNode, parentPath) {
    const schemaType = this._getSchemaType(schemaNode);
    const path = [...parentPath, name];
    const hasError = this._hasError(path);

    return html`
      <div class="property-name">
        <span class="ghost-name ${hasError ? 'has-error' : ''}">${name}</span>
      </div>
      <div class="property-value">
        <jedi-value-block
          ghost
          type="${schemaType}"
          ghost-hint="click to add"
          @ghost-click="${() => this._addGhostProperty(parentPath, name, schemaNode)}"
        ></jedi-value-block>
      </div>
    `;
  }

  _renderValueEditor(value, valueType, schemaNode, path, hasChildren, isExpanded) {
    const pathStr = path.join('/');

    if (hasChildren) {
      return html`
        <jedi-value-block
          type="${valueType}"
          ?expanded="${isExpanded}"
          clickable
          show-add-button
          add-button-title="${valueType === 'array' ? 'Add item' : 'Add property'}"
          count="${valueType === 'array' ? value.length : Object.keys(value || {}).length}"
          count-format="${valueType === 'array' ? 'array' : 'object'}"
          @toggle-expand="${() => this._toggleExpand(pathStr)}"
          @type-click="${(e) => this._openTypeMenu(e.detail.event, path)}"
          @add-click="${valueType === 'array'
            ? (e) => this._handleAddItem(e.detail.event, path, schemaNode)
            : (e) => this._handleAddProperty(e.detail.event, path, value)}"
        >
          <div slot="content">
            ${this._renderChildren(value, schemaNode, path)}
          </div>
        </jedi-value-block>
      `;
    }

    // Primitives
    return html`
      <jedi-value-block
        type="${valueType}"
        @type-click="${(e) => this._openTypeMenu(e.detail.event, path)}"
      >
        ${this._renderPrimitiveEditor(value, valueType, schemaNode, path)}
      </jedi-value-block>
    `;
  }

  _renderPrimitiveEditor(value, valueType, schemaNode, path) {
    const pathStr = path.join('/');

    // Null - no value to edit
    if (valueType === 'null') {
      return '';
    }

    // Boolean toggle
    if (valueType === 'boolean') {
      return html`
        <button
          class="bool-toggle ${value ? 'on' : 'off'}"
          @click="${() => this._updateAtPath(path, !value)}"
          title="${value ? 'true - click to toggle' : 'false - click to toggle'}"
        >
          <span class="bool-toggle-knob"></span>
        </button>
      `;
    }

    // Enum values
    const enumValues = schemaNode?.enum;
    if (Array.isArray(enumValues) && enumValues.length > 0) {
      const valueInEnum = enumValues.some(v => v === value);
      return html`
        <div class="enum-badges">
          ${enumValues.map(enumVal => html`
            <button
              class="enum-badge ${enumVal === value ? 'selected' : ''}"
              @click="${() => this._updateAtPath(path, enumVal)}"
            >${typeof enumVal === 'string' ? enumVal : String(enumVal)}</button>
          `)}
          ${!valueInEnum && value !== undefined ? html`
            <span class="invalid-enum">${typeof value === 'string' ? `"${value}"` : String(value)}</span>
          ` : ''}
        </div>
      `;
    }

    // Regular editing
    if (this._editingPath === pathStr) {
      return html`
        <input
          type="text"
          class="input value-input"
          .value="${this._editValue}"
          @input="${e => this._editValue = e.target.value}"
          @blur="${() => this._finishEdit(path, valueType)}"
          @keydown="${e => this._handleEditKeyDown(e, path, valueType)}"
          autofocus
        />
      `;
    }

    const displayValue = this._formatDisplayValue(value, valueType);
    return html`
      <button
        class="value-display ${valueType}"
        @click="${() => this._startEdit(pathStr, value, valueType)}"
        title="Click to edit"
      >${displayValue}</button>
    `;
  }

  // Helper methods
  _hasError(path) {
    if (!this.errors || this.errors.length === 0) return false;
    const pathStr = '/' + path.join('/');
    return this._errorsForPath(pathStr).length > 0;
  }

  _errorsForPath(pathStr) {
    if (!this.errors || this.errors.length === 0) return [];
    // Normalize: AJV uses '' for root, we use '/'
    const normalizedPathStr = pathStr === '/' ? '' : pathStr;
    return this.errors.filter(err => {
      const errPath = err.path || '';
      // Direct path match or child path
      if (errPath === normalizedPathStr || errPath.startsWith(normalizedPathStr + '/')) return true;
      // Required property error at parent - check if message mentions this property
      const propName = pathStr.split('/').pop();
      if (propName && err.keyword === 'required' && err.message?.includes(`'${propName}'`)) {
        // Parent path: for '/id' -> '', for '/address/city' -> '/address'
        const parentPath = normalizedPathStr.substring(0, normalizedPathStr.lastIndexOf('/'));
        if (errPath === parentPath) return true;
      }
      return false;
    });
  }

  _getValueType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  _getSchemaType(schema) {
    if (!schema || !schema.type) return 'string';
    return Array.isArray(schema.type) ? schema.type[0] : schema.type;
  }

  _getDefaultValue(schema) {
    if (!schema) return '';
    const type = this._getSchemaType(schema);
    switch (type) {
      case 'string': return '';
      case 'number': return 0;
      case 'integer': return 0;
      case 'boolean': return false;
      case 'object': return {};
      case 'array': return [];
      case 'null': return null;
      default: return '';
    }
  }

  _formatDisplayValue(value, type) {
    if (type === 'string') return `"${value}"`;
    if (type === 'null') return 'null';
    return String(value);
  }

  // Expand/collapse
  _toggleExpand(pathStr) {
    const newSet = new Set(this._expandedPaths);
    if (newSet.has(pathStr)) {
      newSet.delete(pathStr);
    } else {
      newSet.add(pathStr);
    }
    this._expandedPaths = newSet;
  }

  // Edit value
  _startEdit(pathStr, value, valueType) {
    this._editingPath = pathStr;
    this._editValue = valueType === 'string' ? String(value) : JSON.stringify(value);
  }

  _finishEdit(path, valueType) {
    if (this._editingPath === null) return;

    let newValue;
    try {
      if (valueType === 'string') {
        newValue = this._editValue;
      } else if (valueType === 'number' || valueType === 'integer') {
        newValue = Number(this._editValue);
        if (isNaN(newValue)) {
          this._editingPath = null;
          return;
        }
      } else if (valueType === 'null') {
        newValue = null;
      } else {
        newValue = JSON.parse(this._editValue);
      }
      this._updateAtPath(path, newValue);
    } catch {
      // Invalid input
    }
    this._editingPath = null;
  }

  _handleEditKeyDown(e, path, valueType) {
    if (e.key === 'Enter') {
      this._finishEdit(path, valueType);
    } else if (e.key === 'Escape') {
      this._editingPath = null;
    }
  }

  // Rename property
  _startRename(pathStr, name) {
    this._renamingPath = pathStr;
    this._renameValue = name;
  }

  _finishRename(path) {
    if (this._renamingPath === null) return;

    const oldName = path[path.length - 1];
    const newName = this._renameValue.trim();

    if (newName && newName !== oldName) {
      this._renameAtPath(path, newName);
    }
    this._renamingPath = null;
  }

  _handleRenameKeyDown(e, path) {
    if (e.key === 'Enter') {
      this._finishRename(path);
    } else if (e.key === 'Escape') {
      this._renamingPath = null;
    }
  }

  // Delete
  _handleDelete(e, path) {
    e.stopPropagation();
    this._deleteAtPath(path);
  }

  // Add property/item
  _handleAddRootProperty(e) {
    e.stopPropagation();
    if (typeof this.data !== 'object' || this.data === null || Array.isArray(this.data)) return;

    let counter = 1;
    let newName = `key${counter}`;
    while (this.data[newName] !== undefined) {
      newName = `key${++counter}`;
    }
    this._expand('');
    this._emitDataChange({ ...this.data, [newName]: '' });
  }

  _handleAddRootItem(e) {
    e.stopPropagation();
    if (!Array.isArray(this.data)) return;

    const itemSchema = this.schema?.items;
    const defaultVal = this._getDefaultValue(itemSchema);
    this._expand('');
    this._emitDataChange([...this.data, defaultVal]);
  }

  _handleAddProperty(e, path, value) {
    e.stopPropagation();
    let counter = 1;
    let newName = `key${counter}`;
    while (value[newName] !== undefined) {
      newName = `key${++counter}`;
    }
    this._expand(path.join('/'));
    this._updateAtPath(path, { ...value, [newName]: '' });
  }

  _handleAddItem(e, path, schemaNode) {
    e.stopPropagation();
    const itemSchema = schemaNode?.items;
    const defaultVal = this._getDefaultValue(itemSchema);

    // Get current array value
    let current = this.data;
    for (const key of path) {
      current = current[key];
    }
    this._expand(path.join('/'));
    this._updateAtPath(path, [...current, defaultVal]);
  }

  _addGhostProperty(parentPath, name, schemaNode) {
    const defaultVal = this._getDefaultValue(schemaNode);
    this._expand(parentPath.join('/'));
    this._updateAtPath([...parentPath, name], defaultVal);
  }

  _expand(pathStr) {
    const newSet = new Set(this._expandedPaths);
    newSet.add(pathStr);
    this._expandedPaths = newSet;
  }

  // Data mutation helpers
  _updateAtPath(path, value) {
    if (path.length === 0) {
      this._emitDataChange(value);
      return;
    }

    const newData = JSON.parse(JSON.stringify(this.data));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    this._emitDataChange(newData);
  }

  _deleteAtPath(path) {
    if (path.length === 0) return;

    const newData = JSON.parse(JSON.stringify(this.data));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const key = path[path.length - 1];
    if (Array.isArray(current)) {
      current.splice(Number(key), 1);
    } else {
      delete current[key];
    }
    this._emitDataChange(newData);
  }

  _renameAtPath(path, newName) {
    if (path.length === 0) return;

    const newData = JSON.parse(JSON.stringify(this.data));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const oldName = path[path.length - 1];
    if (oldName === newName || current[newName] !== undefined) return;

    const value = current[oldName];
    delete current[oldName];
    current[newName] = value;
    this._emitDataChange(newData);
  }

  // Type menu methods
  _renderTypeMenu() {
    if (!this._typeMenuState.open) return '';

    const currentType = this._getValueAtPath(this._typeMenuState.path);
    const currentTypeName = this._getValueType(currentType);

    return html`
      <div
        class="type-menu"
        style="top: ${this._typeMenuState.top}px; left: ${this._typeMenuState.left}px;"
        @click="${e => e.stopPropagation()}"
      >
        ${DATA_TYPES.map(t => html`
          <button
            class="${currentTypeName === t ? 'selected' : ''}"
            @click="${() => this._setType(this._typeMenuState.path, t)}"
          >${t}</button>
        `)}
      </div>
    `;
  }

  _openTypeMenu(e, path) {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    this._typeMenuState = {
      open: true,
      path,
      top: rect.bottom + 4,
      left: rect.left
    };
    this.requestUpdate();

    const closeHandler = () => {
      this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
      this.requestUpdate();
      document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }

  _setType(path, newType) {
    let newValue;
    switch (newType) {
      case 'string': newValue = ''; break;
      case 'number': newValue = 0; break;
      case 'integer': newValue = 0; break;
      case 'boolean': newValue = false; break;
      case 'object': newValue = {}; break;
      case 'array': newValue = []; break;
      case 'null': newValue = null; break;
      default: newValue = '';
    }

    this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
    this._updateAtPath(path, newValue);
  }

  _getValueAtPath(path) {
    let current = this.data;
    for (const key of path) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    return current;
  }

  _emitDataChange(data) {
    this.dispatchEvent(new CustomEvent('data-change', {
      detail: { data },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('jedi-data-visual', JediDataVisual);
