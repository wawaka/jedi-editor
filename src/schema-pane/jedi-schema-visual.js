import { LitElement, html, css, unsafeCSS } from 'lit';
import { themeStyles, inputStyles } from '../styles/shared-styles.js';
import { SCHEMA_TYPES, LAYOUT } from '../shared/constants.js';
import '../shared/jedi-value-block.js';
import '../shared/jedi-delete-button.js';
import '../shared/jedi-required-button.js';
import '../shared/jedi-inline-edit.js';

/**
 * Visual schema editor with recursive property/items editing
 * @element jedi-schema-visual
 * @property {Object} schema - JSON Schema object
 * @fires schema-change - When schema changes, detail: { schema }
 */
export class JediSchemaVisual extends LitElement {
  static properties = {
    schema: { type: Object },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _editingName: { type: String, state: true }
  };

  static styles = [
    themeStyles,
    inputStyles,
    css`
      :host {
        display: block;
        padding: 1rem;
        background: var(--jedi-bg-secondary);
      }

      .property-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
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

      .empty-message {
        font-size: 0.75rem;
        color: var(--jedi-text-dim);
        font-style: italic;
        padding: 0.25rem 0;
      }

      /* Enum editor styles */
      .enum-editor {
        padding: 0.5rem;
        background: rgba(77, 166, 255, 0.05);
        border-radius: var(--jedi-radius);
        margin-top: 0.5rem;
      }

      .enum-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .enum-header span {
        font-size: 0.75rem;
        color: var(--jedi-text-muted);
      }

      .enum-header button {
        font-size: 0.625rem;
        color: var(--jedi-text-dim);
        background: none;
        border: none;
        cursor: pointer;
      }

      .enum-header button:hover {
        color: var(--jedi-error);
      }

      .enum-value-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .enum-value-row .index {
        width: 1rem;
        font-size: 0.625rem;
        color: var(--jedi-text-dim);
        text-align: right;
      }

      .enum-value-row .value-btn {
        flex: 1;
        text-align: left;
        font-size: 0.75rem;
        font-family: var(--jedi-font-mono);
        padding: 0.125rem 0.5rem;
        border-radius: var(--jedi-radius);
        background: none;
        border: none;
        cursor: pointer;
        transition: background 0.15s;
      }

      .enum-value-row .value-btn:hover {
        background: var(--jedi-bg-input);
      }

      .enum-value-row .value-btn.string { color: var(--jedi-string); }
      .enum-value-row .value-btn.number { color: var(--jedi-number); }
      .enum-value-row .value-btn.boolean { color: var(--jedi-boolean); }

      .enum-value-row jedi-delete-button {
        opacity: 0;
        transition: opacity 0.15s;
      }

      .enum-value-row:hover jedi-delete-button {
        opacity: 1;
      }

      .add-enum-value {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--jedi-success);
        background: none;
        border: none;
        cursor: pointer;
        margin-top: 0.5rem;
        padding: 0;
      }

      .add-enum-value:hover {
        color: #00e67a;
      }

      .add-enum-value svg {
        width: 0.75rem;
        height: 0.75rem;
      }
    `
  ];

  constructor() {
    super();
    this.schema = { type: 'object', properties: {} };
    this.debugGrid = false;
    this._expandedPaths = new Set(['']);
    this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
    this._editingName = null;
    this._editingEnum = { path: null, index: null, value: '' };
  }

  render() {
    return html`
      ${this._renderRootNode()}
      ${this._renderTypeMenu()}
    `;
  }

  _renderRootNode() {
    const type = this._getType(this.schema);
    const hasChildren = type === 'object' || type === 'array';
    const isExpanded = this._expandedPaths.has('');
    const hasEnum = Array.isArray(this.schema?.enum) && this.schema.enum.length > 0;

    return html`
      <jedi-value-block
        type="${type}"
        ?expanded="${isExpanded}"
        ?clickable="${hasChildren || isExpanded}"
        .enumValues="${hasEnum ? this.schema.enum : null}"
        ?show-add-button="${type === 'object'}"
        add-button-title="Add property"
        .count="${type === 'object' ? Object.keys(this.schema?.properties || {}).length : null}"
        ?show-items-label="${type === 'array'}"
        @toggle-expand="${() => this._toggleExpand('')}"
        @type-click="${(e) => this._openTypeMenu(e.detail.event, [])}"
        @enum-click="${() => this._toggleExpand('')}"
        @add-click="${(e) => this._handleAddProperty(e.detail.event, [])}"
      >
        <div slot="content">
          ${hasChildren ? this._renderChildren(this.schema, [], type) : ''}
          ${hasEnum ? this._renderEnumEditor(this.schema, []) : ''}
        </div>
      </jedi-value-block>
    `;
  }

  _renderProperty(name, node, path, isRequired, parentPath) {
    const pathKey = path.join('.');
    const type = this._getType(node);
    const hasChildren = type === 'object' || type === 'array';
    const isExpanded = this._expandedPaths.has(pathKey);
    const hasEnum = Array.isArray(node?.enum) && node.enum.length > 0;
    const isEditing = this._editingName === pathKey;

    return html`
      <div class="property-name">
        <div class="name-group">
          <div class="hover-actions">
            <jedi-required-button
              ?active="${isRequired}"
              @click="${() => this._toggleRequired(parentPath, name)}"
              title="${isRequired ? 'Required - click to make optional' : 'Optional - click to make required'}"
            ></jedi-required-button>
            <jedi-delete-button
              @click="${() => this._deleteProperty(parentPath, name)}"
              title="Delete property"
            ></jedi-delete-button>
          </div>
          <jedi-inline-edit
            .value="${name}"
            ?editing="${isEditing}"
            ?required="${isRequired}"
            @edit-start="${() => this._startRename(pathKey)}"
            @edit-complete="${(e) => this._handleRenameComplete(parentPath, name, e.detail.value)}"
            @edit-cancel="${() => { this._editingName = null; }}"
          ></jedi-inline-edit>
        </div>
      </div>
      <div class="property-value">
        <jedi-value-block
          type="${type}"
          ?expanded="${isExpanded}"
          ?clickable="${hasChildren || isExpanded}"
          .enumValues="${hasEnum ? node.enum : null}"
          ?show-ghost-enum="${!hasEnum && !hasChildren}"
          ?show-add-button="${type === 'object'}"
          add-button-title="Add property"
          .count="${type === 'object' ? Object.keys(node.properties || {}).length : null}"
          ?show-items-label="${type === 'array'}"
          @toggle-expand="${() => this._toggleExpand(pathKey)}"
          @type-click="${(e) => this._openTypeMenu(e.detail.event, path)}"
          @enum-click="${() => this._toggleExpand(pathKey)}"
          @ghost-enum-click="${() => this._addEnum(path)}"
          @add-click="${(e) => this._handleAddProperty(e.detail.event, path)}"
        >
          <div slot="content">
            ${hasChildren ? this._renderChildren(node, path, type) : ''}
            ${hasEnum ? this._renderEnumEditor(node, path) : ''}
          </div>
        </jedi-value-block>
      </div>
    `;
  }

  _renderTypeMenu() {
    if (!this._typeMenuState.open) return '';

    return html`
      <div
        class="type-menu"
        style="top: ${this._typeMenuState.top}px; left: ${this._typeMenuState.left}px;"
        @click="${e => e.stopPropagation()}"
      >
        ${SCHEMA_TYPES.map(t => html`
          <button
            class="${this._getTypeAtPath(this._typeMenuState.path) === t ? 'selected' : ''}"
            @click="${() => this._setType(this._typeMenuState.path, t)}"
          >${t}</button>
        `)}
      </div>
    `;
  }

  _renderChildren(node, path, type) {
    if (!node) return '';

    if (type === 'object') {
      const properties = node.properties || {};
      const required = node.required || [];
      const propEntries = Object.entries(properties);

      return propEntries.length === 0
        ? html`<div class="empty-message">No properties defined</div>`
        : html`
            <div class="property-grid">
              ${propEntries.map(([propName, propNode]) => {
                const propPath = [...path, 'properties', propName];
                const isReq = required.includes(propName);
                return this._renderProperty(propName, propNode, propPath, isReq, path);
              })}
            </div>
          `;
    }

    if (type === 'array') {
      const items = node.items || { type: 'string' };
      const itemsPath = [...path, 'items'];
      const itemsPathKey = itemsPath.join('.');
      const itemType = this._getType(items);
      const itemHasChildren = itemType === 'object' || itemType === 'array';
      const itemIsExpanded = this._expandedPaths.has(itemsPathKey);
      const itemHasEnum = Array.isArray(items?.enum) && items.enum.length > 0;

      return html`
        <jedi-value-block
          type="${itemType}"
          ?expanded="${itemIsExpanded}"
          ?clickable="${itemHasChildren || itemIsExpanded}"
          .enumValues="${itemHasEnum ? items.enum : null}"
          ?show-ghost-enum="${!itemHasEnum && !itemHasChildren}"
          ?show-add-button="${itemType === 'object'}"
          add-button-title="Add property"
          .count="${itemType === 'object' ? Object.keys(items.properties || {}).length : null}"
          ?show-items-label="${itemType === 'array'}"
          @toggle-expand="${() => this._toggleExpand(itemsPathKey)}"
          @type-click="${(e) => this._openTypeMenu(e.detail.event, itemsPath)}"
          @enum-click="${() => this._toggleExpand(itemsPathKey)}"
          @ghost-enum-click="${() => this._addEnum(itemsPath)}"
          @add-click="${(e) => this._handleAddProperty(e.detail.event, itemsPath)}"
        >
          <div slot="content">
            ${itemHasChildren ? this._renderChildren(items, itemsPath, itemType) : ''}
            ${itemHasEnum ? this._renderEnumEditor(items, itemsPath) : ''}
          </div>
        </jedi-value-block>
      `;
    }

    return '';
  }

  _renderEnumEditor(node, path) {
    if (!node) return '';
    const enumValues = node.enum || [];
    const type = this._getType(node);

    return html`
      <div class="enum-editor">
        <div class="enum-header">
          <span>Enum values</span>
          <button @click="${() => this._removeEnum(path)}">remove enum</button>
        </div>
        ${enumValues.map((value, index) => this._renderEnumValue(value, index, path, type))}
        <button class="add-enum-value" @click="${() => this._addEnumValue(path, type)}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add value
        </button>
      </div>
    `;
  }

  _renderEnumValue(value, index, path, type) {
    const pathKey = path.join('.');
    const isEditing = this._editingEnum.path === pathKey && this._editingEnum.index === index;
    const valueType = typeof value;
    const display = valueType === 'string' ? `"${value}"` : String(value);

    if (isEditing) {
      return html`
        <div class="enum-value-row">
          <span class="index">${index}</span>
          <input
            type="text"
            class="input"
            style="flex: 1;"
            .value="${this._editingEnum.value}"
            @input="${(e) => this._editingEnum = { ...this._editingEnum, value: e.target.value }}"
            @blur="${() => this._saveEnumValue(path, index, type)}"
            @keydown="${(e) => {
              if (e.key === 'Enter') this._saveEnumValue(path, index, type);
              if (e.key === 'Escape') this._editingEnum = { path: null, index: null, value: '' };
            }}"
            autofocus
          />
        </div>
      `;
    }

    return html`
      <div class="enum-value-row">
        <span class="index">${index}</span>
        <button
          class="value-btn ${valueType}"
          @click="${() => this._startEditEnumValue(path, index, value)}"
        >${display}</button>
        <jedi-delete-button
          @click="${() => this._deleteEnumValue(path, index)}"
          title="Delete value"
        ></jedi-delete-button>
      </div>
    `;
  }

  // Helper methods
  _getType(node) {
    if (!node) return 'object';
    if (Array.isArray(node.type)) return node.type[0] || 'string';
    return node.type || 'object';
  }

  _getTypeAtPath(path) {
    const node = this._getNodeAtPath(path);
    return this._getType(node);
  }

  _getNodeAtPath(path) {
    let node = this.schema;
    for (const key of path) {
      if (!node) return null;
      node = node[key];
    }
    return node;
  }

  _toggleExpand(pathKey) {
    if (this._expandedPaths.has(pathKey)) {
      this._expandedPaths.delete(pathKey);
    } else {
      this._expandedPaths.add(pathKey);
    }
    this.requestUpdate();
  }

  _openTypeMenu(e, path) {
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
    const newSchema = this._updateAtPath(this.schema, path, node => {
      const newNode = { ...node, type: newType };
      if (newType === 'object' && !newNode.properties) {
        newNode.properties = {};
      } else if (newType !== 'object') {
        delete newNode.properties;
        delete newNode.required;
      }
      if (newType === 'array' && !newNode.items) {
        newNode.items = { type: 'string' };
      } else if (newType !== 'array') {
        delete newNode.items;
      }
      return newNode;
    });
    this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
    this._emitChange(newSchema);
  }

  _handleAddProperty(e, path) {
    e.stopPropagation();
    this._addProperty(path);
  }

  _addProperty(path) {
    const newSchema = this._updateAtPath(this.schema, path, node => {
      const properties = node.properties || {};
      let counter = 1;
      let newName = `key${counter}`;
      while (properties[newName]) {
        newName = `key${++counter}`;
      }
      return {
        ...node,
        properties: { ...properties, [newName]: { type: 'string' } }
      };
    });
    // Expand to show the new property
    const pathKey = path.join('.');
    this._expandedPaths.add(pathKey);
    this.requestUpdate();
    this._emitChange(newSchema);
  }

  _deleteProperty(parentPath, propName) {
    const newSchema = this._updateAtPath(this.schema, parentPath, node => {
      const { [propName]: _, ...rest } = node.properties || {};
      const required = (node.required || []).filter(r => r !== propName);
      return { ...node, properties: rest, required: required.length ? required : undefined };
    });
    this._emitChange(newSchema);
  }

  _toggleRequired(parentPath, propName) {
    const newSchema = this._updateAtPath(this.schema, parentPath, node => {
      const required = node.required || [];
      const isReq = required.includes(propName);
      const newRequired = isReq
        ? required.filter(r => r !== propName)
        : [...required, propName];
      return { ...node, required: newRequired.length ? newRequired : undefined };
    });
    this._emitChange(newSchema);
  }

  _startRename(pathKey) {
    this._editingName = pathKey;
  }

  _handleRenameComplete(parentPath, oldName, newName) {
    this._editingName = null;
    newName = newName.trim();
    if (!newName || newName === oldName) return;

    const newSchema = this._updateAtPath(this.schema, parentPath, node => {
      const { [oldName]: propValue, ...rest } = node.properties || {};
      const required = (node.required || []).map(r => r === oldName ? newName : r);
      return {
        ...node,
        properties: { ...rest, [newName]: propValue },
        required: required.length ? required : undefined
      };
    });
    this._emitChange(newSchema);
  }

  // Enum methods
  _addEnum(path) {
    const node = this._getNodeAtPath(path);
    const type = this._getType(node);
    const defaultValue = type === 'string' ? '' : type === 'boolean' ? true : 0;

    const newSchema = this._updateAtPath(this.schema, path, n => ({
      ...n,
      enum: [defaultValue]
    }));

    this._expandedPaths.add(path.join('.'));
    this._emitChange(newSchema);
  }

  _removeEnum(path) {
    const pathKey = path.join('.');
    this._expandedPaths.delete(pathKey);

    const newSchema = this._updateAtPath(this.schema, path, node => {
      const { enum: _, ...rest } = node;
      return rest;
    });
    this._emitChange(newSchema);
  }

  _addEnumValue(path, type) {
    const defaultValue = type === 'string' ? '' : type === 'boolean' ? true : 0;
    const newSchema = this._updateAtPath(this.schema, path, node => ({
      ...node,
      enum: [...(node.enum || []), defaultValue]
    }));
    this._emitChange(newSchema);
  }

  _startEditEnumValue(path, index, value) {
    this._editingEnum = {
      path: path.join('.'),
      index,
      value: typeof value === 'string' ? value : String(value)
    };
    this.requestUpdate();
  }

  _saveEnumValue(path, index, type) {
    let parsed;
    const raw = this._editingEnum.value;

    if (type === 'string') {
      parsed = raw;
    } else if (type === 'number' || type === 'integer') {
      parsed = Number(raw);
      if (isNaN(parsed)) {
        this._editingEnum = { path: null, index: null, value: '' };
        this.requestUpdate();
        return;
      }
    } else if (type === 'boolean') {
      parsed = raw === 'true';
    } else {
      parsed = raw;
    }

    const newSchema = this._updateAtPath(this.schema, path, node => {
      const newEnum = [...(node.enum || [])];
      newEnum[index] = parsed;
      return { ...node, enum: newEnum };
    });

    this._editingEnum = { path: null, index: null, value: '' };
    this._emitChange(newSchema);
  }

  _deleteEnumValue(path, index) {
    const node = this._getNodeAtPath(path);
    const newEnum = (node.enum || []).filter((_, i) => i !== index);

    if (newEnum.length === 0) {
      this._removeEnum(path);
    } else {
      const newSchema = this._updateAtPath(this.schema, path, n => ({
        ...n,
        enum: newEnum
      }));
      this._emitChange(newSchema);
    }
  }

  // Immutable update helper
  _updateAtPath(obj, path, updater) {
    if (path.length === 0) {
      return updater(obj);
    }

    const [head, ...tail] = path;
    return {
      ...obj,
      [head]: this._updateAtPath(obj[head] || {}, tail, updater)
    };
  }

  _emitChange(newSchema) {
    this.schema = newSchema;
    this.dispatchEvent(new CustomEvent('schema-change', {
      detail: { schema: newSchema },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('jedi-schema-visual', JediSchemaVisual);
