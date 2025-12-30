import { LitElement, html, css, unsafeCSS } from 'lit';
import { themeStyles, inputStyles } from '../styles/shared-styles.js';
import { SCHEMA_TYPES, LAYOUT } from '../shared/constants.js';
import '../shared/jedi-value-block.js';
import '../shared/jedi-delete-button.js';
import '../shared/jedi-required-button.js';
import '../shared/jedi-add-button.js';
import '../shared/jedi-inline-edit.js';
import '../shared/jedi-inline-value.js';

/**
 * Visual schema editor with recursive property/items editing
 * @element jedi-schema-visual
 * @property {Object} schema - JSON Schema object
 * @property {*} data - Current data (for showing ghost fields)
 * @property {boolean} showDataGhosts - Show fields from data not in schema
 * @fires schema-change - When schema changes, detail: { schema }
 */
export class JediSchemaVisual extends LitElement {
  static properties = {
    schema: { type: Object },
    data: { type: Object },
    showDataGhosts: { type: Boolean, attribute: 'show-data-ghosts' },
    debugGrid: { type: Boolean, attribute: 'debug-grid' },
    _editingName: { type: String, state: true },
    _editingEnumKey: { type: String, state: true },
    _editingMinmaxKey: { type: String, state: true }
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

      .enum-value-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 0.25rem;
      }

      .enum-value-row jedi-delete-button {
        opacity: 0;
        transition: opacity 0.15s;
      }

      .enum-value-row:hover jedi-delete-button {
        opacity: 1;
      }

      /* Min/max editor styles */
      .minmax-editor {
        padding: 0.5rem;
        background: rgba(255, 183, 77, 0.05);
        border-radius: var(--jedi-radius);
        margin-top: 0.5rem;
      }

      .minmax-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 0.25rem;
      }

      .minmax-row jedi-delete-button {
        opacity: 0;
        transition: opacity 0.15s;
      }

      .minmax-row:hover jedi-delete-button {
        opacity: 1;
      }

      .minmax-label {
        font-size: 0.75rem;
        color: var(--jedi-text-muted);
        min-width: 2rem;
      }

      .ghost-name {
        font-size: 0.875rem;
        font-family: var(--jedi-font-mono);
        color: var(--jedi-text-muted);
        font-style: italic;
      }
    `
  ];

  constructor() {
    super();
    this.schema = { type: 'object', properties: {} };
    this.data = {};
    this.showDataGhosts = false;
    this.debugGrid = false;
    this._expandedPaths = new Set(['']);
    this._typeMenuState = { open: false, path: null, top: 0, left: 0 };
    this._editingName = null;
    this._editingEnumKey = null; // Format: "path.join('.')|index"
    this._editingMinmaxKey = null; // Format: "path.join('.')|min" or "path.join('.')|max"
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
    const hasMinmax = this._hasMinmax(this.schema);
    const isNumericType = type === 'number' || type === 'integer';

    return html`
      <jedi-value-block
        type="${type}"
        ?expanded="${isExpanded}"
        ?clickable="${hasChildren || isExpanded || hasMinmax}"
        .enumValues="${hasEnum ? this.schema.enum : null}"
        .minValue="${this.schema?.minimum}"
        .maxValue="${this.schema?.maximum}"
        ?show-ghost-minmax="${!hasMinmax && !hasChildren && isNumericType}"
        ?show-add-button="${type === 'object'}"
        add-button-title="Add property"
        .count="${type === 'object' ? Object.keys(this.schema?.properties || {}).length : null}"
        ?show-items-label="${type === 'array'}"
        @toggle-expand="${() => this._toggleExpand('')}"
        @type-click="${(e) => this._openTypeMenu(e.detail.event, [])}"
        @enum-click="${() => this._toggleExpand('')}"
        @minmax-click="${() => this._toggleExpand('')}"
        @ghost-minmax-click="${() => this._addMinmax([])}"
        @add-click="${(e) => this._handleAddProperty(e.detail.event, [])}"
      >
        <div slot="content">
          ${hasChildren ? this._renderChildren(this.schema, [], type) : ''}
          ${hasEnum ? this._renderEnumEditor(this.schema, []) : ''}
          ${hasMinmax ? this._renderMinmaxEditor(this.schema, []) : ''}
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
    const hasMinmax = this._hasMinmax(node);
    const isNumericType = type === 'number' || type === 'integer';
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
          ?clickable="${hasChildren || isExpanded || hasMinmax}"
          .enumValues="${hasEnum ? node.enum : null}"
          .minValue="${node?.minimum}"
          .maxValue="${node?.maximum}"
          ?show-ghost-enum="${!hasEnum && !hasChildren}"
          ?show-ghost-minmax="${!hasMinmax && !hasChildren && isNumericType}"
          ?show-add-button="${type === 'object'}"
          add-button-title="Add property"
          .count="${type === 'object' ? Object.keys(node.properties || {}).length : null}"
          ?show-items-label="${type === 'array'}"
          @toggle-expand="${() => this._toggleExpand(pathKey)}"
          @type-click="${(e) => this._openTypeMenu(e.detail.event, path)}"
          @enum-click="${() => this._toggleExpand(pathKey)}"
          @minmax-click="${() => this._toggleExpand(pathKey)}"
          @ghost-enum-click="${() => this._addEnum(path)}"
          @ghost-minmax-click="${() => this._addMinmax(path)}"
          @add-click="${(e) => this._handleAddProperty(e.detail.event, path)}"
        >
          <div slot="content">
            ${hasChildren ? this._renderChildren(node, path, type) : ''}
            ${hasEnum ? this._renderEnumEditor(node, path) : ''}
            ${hasMinmax ? this._renderMinmaxEditor(node, path) : ''}
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

      // Find ghost properties from data (keys in data but not in schema)
      const ghostEntries = [];
      if (this.showDataGhosts) {
        const dataAtPath = this._getDataAtSchemaPath(path);
        if (dataAtPath && typeof dataAtPath === 'object' && !Array.isArray(dataAtPath)) {
          const dataKeys = Object.keys(dataAtPath);
          const schemaKeys = Object.keys(properties);
          for (const key of dataKeys) {
            if (!schemaKeys.includes(key)) {
              ghostEntries.push({ name: key, value: dataAtPath[key] });
            }
          }
        }
      }

      const hasContent = propEntries.length > 0 || ghostEntries.length > 0;

      return !hasContent
        ? html`<div class="empty-message">No properties defined</div>`
        : html`
            <div class="property-grid">
              ${propEntries.map(([propName, propNode]) => {
                const propPath = [...path, 'properties', propName];
                const isReq = required.includes(propName);
                return this._renderProperty(propName, propNode, propPath, isReq, path);
              })}
              ${ghostEntries.map(({ name, value }) =>
                this._renderGhostProperty(name, value, path)
              )}
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
      const itemHasMinmax = this._hasMinmax(items);
      const itemIsNumericType = itemType === 'number' || itemType === 'integer';

      return html`
        <jedi-value-block
          type="${itemType}"
          ?expanded="${itemIsExpanded}"
          ?clickable="${itemHasChildren || itemIsExpanded || itemHasMinmax}"
          .enumValues="${itemHasEnum ? items.enum : null}"
          .minValue="${items?.minimum}"
          .maxValue="${items?.maximum}"
          ?show-ghost-enum="${!itemHasEnum && !itemHasChildren}"
          ?show-ghost-minmax="${!itemHasMinmax && !itemHasChildren && itemIsNumericType}"
          ?show-add-button="${itemType === 'object'}"
          add-button-title="Add property"
          .count="${itemType === 'object' ? Object.keys(items.properties || {}).length : null}"
          ?show-items-label="${itemType === 'array'}"
          @toggle-expand="${() => this._toggleExpand(itemsPathKey)}"
          @type-click="${(e) => this._openTypeMenu(e.detail.event, itemsPath)}"
          @enum-click="${() => this._toggleExpand(itemsPathKey)}"
          @minmax-click="${() => this._toggleExpand(itemsPathKey)}"
          @ghost-enum-click="${() => this._addEnum(itemsPath)}"
          @ghost-minmax-click="${() => this._addMinmax(itemsPath)}"
          @add-click="${(e) => this._handleAddProperty(e.detail.event, itemsPath)}"
        >
          <div slot="content">
            ${itemHasChildren ? this._renderChildren(items, itemsPath, itemType) : ''}
            ${itemHasEnum ? this._renderEnumEditor(items, itemsPath) : ''}
            ${itemHasMinmax ? this._renderMinmaxEditor(items, itemsPath) : ''}
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
        ${enumValues.map((value, index) => this._renderEnumValue(value, index, path, type))}
        <jedi-add-button
          title="Add enum value"
          @click="${() => this._addEnumValue(path, type)}"
        ></jedi-add-button>
      </div>
    `;
  }

  _renderEnumValue(value, index, path, type) {
    const pathKey = path.join('.');
    const enumKey = `${pathKey}|${index}`;
    const isEditing = this._editingEnumKey === enumKey;

    return html`
      <div class="enum-value-row">
        <jedi-delete-button
          @click="${() => this._deleteEnumValue(path, index)}"
          title="Delete value"
        ></jedi-delete-button>
        <jedi-inline-value
          .value="${value}"
          type="${type}"
          ?editing="${isEditing}"
          @edit-start="${() => { this._editingEnumKey = enumKey; }}"
          @edit-complete="${(e) => this._handleEnumEditComplete(path, index, e.detail.value)}"
          @edit-cancel="${() => { this._editingEnumKey = null; }}"
        ></jedi-inline-value>
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

  // Convert schema path to data path and get data at that path
  // Schema path: ['properties', 'name', 'properties', 'nested'] -> Data path: ['name', 'nested']
  _getDataAtSchemaPath(schemaPath) {
    const dataPath = [];
    for (let i = 0; i < schemaPath.length; i++) {
      if (schemaPath[i] === 'properties' && i + 1 < schemaPath.length) {
        dataPath.push(schemaPath[i + 1]);
        i++; // Skip the property name as we've consumed it
      } else if (schemaPath[i] === 'items') {
        // For items, we can't traverse further without an index
        // Just return the array itself if we're at items level
        break;
      }
    }

    let current = this.data;
    for (const key of dataPath) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    return current;
  }

  _getValueType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  _renderGhostProperty(name, value, parentPath) {
    const valueType = this._getValueType(value);

    return html`
      <div class="property-name">
        <span class="ghost-name">${name}</span>
      </div>
      <div class="property-value">
        <jedi-value-block
          ghost
          type="${valueType}"
          ghost-hint="click to add to schema"
          @ghost-click="${() => this._addPropertyFromData(parentPath, name, value)}"
        ></jedi-value-block>
      </div>
    `;
  }

  _addPropertyFromData(parentPath, name, value) {
    const valueType = this._getValueType(value);
    let schemaType = valueType;
    if (schemaType === 'null') schemaType = 'string'; // Default null to string in schema

    const newSchema = this._updateAtPath(this.schema, parentPath, node => {
      const properties = node.properties || {};
      const newPropSchema = { type: schemaType };

      // If it's an object or array with content, create nested schema
      if (schemaType === 'object' && value && Object.keys(value).length > 0) {
        newPropSchema.properties = {};
      }
      if (schemaType === 'array') {
        newPropSchema.items = { type: 'string' };
      }

      return {
        ...node,
        properties: { ...properties, [name]: newPropSchema }
      };
    });

    this._emitChange(newSchema);
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
    const pathKey = path.join('.');

    const newSchema = this._updateAtPath(this.schema, path, n => ({
      ...n,
      enum: [defaultValue]
    }));

    this._expandedPaths.add(pathKey);
    this._editingEnumKey = `${pathKey}|0`;
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
    const node = this._getNodeAtPath(path);
    const newIndex = (node?.enum || []).length;
    const pathKey = path.join('.');

    const newSchema = this._updateAtPath(this.schema, path, n => ({
      ...n,
      enum: [...(n.enum || []), defaultValue]
    }));
    this._emitChange(newSchema);

    // Enter edit mode for the new value
    this._editingEnumKey = `${pathKey}|${newIndex}`;
  }

  _handleEnumEditComplete(path, index, newValue) {
    this._editingEnumKey = null;

    // If empty string, remove the item instead of saving
    if (newValue === '') {
      this._deleteEnumValue(path, index);
      return;
    }

    const newSchema = this._updateAtPath(this.schema, path, node => {
      const newEnum = [...(node.enum || [])];
      newEnum[index] = newValue;
      return { ...node, enum: newEnum };
    });

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

  // Min/max methods
  _hasMinmax(node) {
    return node?.minimum !== undefined || node?.maximum !== undefined;
  }

  _renderMinmaxEditor(node, path) {
    if (!node) return '';
    const hasMin = node.minimum !== undefined;
    const hasMax = node.maximum !== undefined;
    const pathKey = path.join('.');

    return html`
      <div class="minmax-editor">
        ${hasMin ? this._renderMinmaxRow('min', node.minimum, path, pathKey) : ''}
        ${hasMax ? this._renderMinmaxRow('max', node.maximum, path, pathKey) : ''}
        ${!hasMin || !hasMax ? html`
          <jedi-add-button
            title="${!hasMin && !hasMax ? 'Add min or max' : !hasMin ? 'Add minimum' : 'Add maximum'}"
            @click="${() => this._addMinmaxValue(path, !hasMin ? 'min' : 'max')}"
          ></jedi-add-button>
        ` : ''}
      </div>
    `;
  }

  _renderMinmaxRow(field, value, path, pathKey) {
    const minmaxKey = `${pathKey}|${field}`;
    const isEditing = this._editingMinmaxKey === minmaxKey;

    return html`
      <div class="minmax-row">
        <jedi-delete-button
          @click="${() => this._deleteMinmaxValue(path, field)}"
          title="Delete ${field === 'min' ? 'minimum' : 'maximum'}"
        ></jedi-delete-button>
        <span class="minmax-label">${field}:</span>
        <jedi-inline-value
          .value="${value}"
          type="number"
          ?editing="${isEditing}"
          @edit-start="${() => { this._editingMinmaxKey = minmaxKey; }}"
          @edit-complete="${(e) => this._handleMinmaxEditComplete(path, field, e.detail.value)}"
          @edit-cancel="${() => { this._editingMinmaxKey = null; }}"
        ></jedi-inline-value>
      </div>
    `;
  }

  _addMinmax(path) {
    const pathKey = path.join('.');

    const newSchema = this._updateAtPath(this.schema, path, n => ({
      ...n,
      minimum: 0
    }));

    this._expandedPaths.add(pathKey);
    this._editingMinmaxKey = `${pathKey}|min`;
    this._emitChange(newSchema);
  }

  _addMinmaxValue(path, field) {
    const pathKey = path.join('.');
    const prop = field === 'min' ? 'minimum' : 'maximum';

    const newSchema = this._updateAtPath(this.schema, path, n => ({
      ...n,
      [prop]: 0
    }));

    this._editingMinmaxKey = `${pathKey}|${field}`;
    this._emitChange(newSchema);
  }

  _handleMinmaxEditComplete(path, field, newValue) {
    this._editingMinmaxKey = null;

    // If empty or not a valid number, remove the constraint
    if (newValue === '' || newValue === null || newValue === undefined || Number.isNaN(newValue)) {
      this._deleteMinmaxValue(path, field);
      return;
    }

    const prop = field === 'min' ? 'minimum' : 'maximum';
    const newSchema = this._updateAtPath(this.schema, path, node => ({
      ...node,
      [prop]: newValue
    }));

    this._emitChange(newSchema);
  }

  _deleteMinmaxValue(path, field) {
    const node = this._getNodeAtPath(path);
    const prop = field === 'min' ? 'minimum' : 'maximum';
    const otherProp = field === 'min' ? 'maximum' : 'minimum';
    const hasOther = node?.[otherProp] !== undefined;

    if (!hasOther) {
      // No other constraint, collapse the editor
      const pathKey = path.join('.');
      this._expandedPaths.delete(pathKey);
    }

    const newSchema = this._updateAtPath(this.schema, path, n => {
      const { [prop]: _, ...rest } = n;
      return rest;
    });
    this._emitChange(newSchema);
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
