/**
 * JSON Editor Web Components
 *
 * A pure JSON editor with schema validation, built with Lit web components.
 * No persistence or storage - those are external concerns.
 *
 * Usage:
 *   <jedi-editor
 *     .initialSchema="${mySchema}"
 *     .initialData="${myData}"
 *     @schema-change="${e => console.log(e.detail.schema)}"
 *     @data-change="${e => console.log(e.detail.data)}"
 *     @validation-change="${e => console.log(e.detail.isValid, e.detail.errors)}"
 *   ></jedi-editor>
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
export { JediEditor } from './jedi-editor.js';

// Panes
export { JediSchemaPane } from './schema-pane/jedi-schema-pane.js';
export { JediDataPane } from './data-pane/jedi-data-pane.js';

// Visual editors
export { JediSchemaVisual } from './schema-pane/jedi-schema-visual.js';
export { JediDataVisual } from './data-pane/jedi-data-visual.js';

// Shared components
export { JediRawEditor } from './shared/jedi-raw-editor.js';
export { JediEditorToggle } from './shared/jedi-editor-toggle.js';
export { JediAddButton } from './shared/jedi-add-button.js';
export { JediEnumBadge } from './shared/jedi-enum-badge.js';
export { JediTypeBadge } from './shared/jedi-type-badge.js';
export { JediValueBlock } from './shared/jedi-value-block.js';

// Services
export { validationService } from './services/validation-service.js';

// Constants and types
export { TYPE_COLORS, SCHEMA_TYPES, DEFAULT_SCHEMA, DEFAULT_DATA, LAYOUT } from './shared/constants.js';
