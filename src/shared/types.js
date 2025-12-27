/**
 * JSDoc Type Definitions for JsonEditor Lit components
 * These provide IDE support without TypeScript
 */

/**
 * @typedef {'raw' | 'visual'} EditorMode
 */

/**
 * @typedef {'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null'} SchemaType
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} path - JSON path to the error
 * @property {string} message - Error message
 * @property {string} keyword - Validation keyword that failed
 */

/**
 * @typedef {Object} SchemaNode
 * @property {SchemaType | SchemaType[]} [type] - The type(s) of this schema node
 * @property {string} [title] - Human-readable title
 * @property {string} [description] - Description of this node
 * @property {Object<string, SchemaNode>} [properties] - Object properties
 * @property {SchemaNode} [items] - Array items schema
 * @property {string[]} [required] - Required property names
 * @property {*[]} [enum] - Allowed enum values
 * @property {*} [default] - Default value
 * @property {string} [format] - String format (e.g., 'email', 'uri')
 * @property {number} [minimum] - Minimum number value
 * @property {number} [maximum] - Maximum number value
 * @property {number} [minItems] - Minimum array items
 * @property {number} [maxItems] - Maximum array items
 * @property {boolean | SchemaNode} [additionalProperties] - Additional properties config
 */

/**
 * @typedef {SchemaNode & { $schema?: string }} JsonSchema
 */

/**
 * @typedef {Object} DiffStats
 * @property {number} added - Number of added lines
 * @property {number} removed - Number of removed lines
 * @property {boolean} hasChanges - Whether there are any changes
 */

/**
 * @typedef {Object} DiffLine
 * @property {'same' | 'added' | 'removed'} type - Line type
 * @property {string} content - Line content
 * @property {{ saved?: number, current?: number }} lineNum - Line numbers
 */

/**
 * @typedef {Object} DisplayLine
 * @property {'same' | 'added' | 'removed' | 'collapse'} type - Line type
 * @property {string} content - Line content
 * @property {{ saved?: number, current?: number }} lineNum - Line numbers
 * @property {number} [collapsedCount] - Number of collapsed lines
 */

export {};
