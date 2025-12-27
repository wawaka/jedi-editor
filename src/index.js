/**
 * JSON Editor Web Components
 *
 * A pure JSON editor with schema validation, built with Lit web components.
 * No persistence or storage - those are external concerns.
 *
 * Usage:
 *   <je-editor
 *     .initialSchema="${mySchema}"
 *     .initialData="${myData}"
 *     @schema-change="${e => console.log(e.detail.schema)}"
 *     @data-change="${e => console.log(e.detail.data)}"
 *     @validation-change="${e => console.log(e.detail.isValid, e.detail.errors)}"
 *   ></je-editor>
 *
 * Public API:
 *   editor.schema        // get/set schema
 *   editor.data          // get/set data
 *   editor.isValid       // get validation state
 *   editor.errors        // get validation errors
 *   editor.validate()    // trigger validation
 *   editor.getState()    // get { schema, data, isValid, errors }
 *   editor.setState(schema, data)  // set both at once
 */

// Main container
export { JeEditor } from './je-editor.js';

// Panes
export { JeSchemaPane } from './schema-pane/je-schema-pane.js';
export { JeDataPane } from './data-pane/je-data-pane.js';

// Visual editors
export { JeSchemaVisual } from './schema-pane/je-schema-visual.js';
export { JeDataVisual } from './data-pane/je-data-visual.js';

// Shared components
export { JeRawEditor } from './shared/je-raw-editor.js';
export { JeEditorToggle } from './shared/je-editor-toggle.js';
export { JeAddButton } from './shared/je-add-button.js';
export { JeEnumBadge } from './shared/je-enum-badge.js';
export { JeTypeBadge } from './shared/je-type-badge.js';
export { JeValueBlock } from './shared/je-value-block.js';

// Services
export { validationService } from './services/validation-service.js';

// Constants and types
export { TYPE_COLORS, SCHEMA_TYPES, DEFAULT_SCHEMA, DEFAULT_DATA, LAYOUT } from './shared/constants.js';
