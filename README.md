# JEDI Editor

Visual JSON Schema editor web component. Built with Lit.

## Features

- **Dual-pane layout**: Schema on the left, data on the right
- **Visual & raw modes**: Toggle between form-based editing and raw JSON
- **Real-time validation**: AJV-powered schema validation with inline error display
- **Schema-aware editing**: Ghost properties show missing schema fields, type badges, enum selectors
- **Inline editing**: Click to edit values, rename keys, change types
- **Zero native dependencies**: Uses esbuild for bundling (no rollup/native binaries)

## Usage

```bash
npm install
npm run dev
```

Open http://localhost:17080

### Updating vendor dependencies

When you update versions in `package.json`:

```bash
npm install
npm run bundle-deps
```

This rebuilds `vendor/lit.js`, `vendor/ajv.js`, `vendor/ajv-formats.js`. Commit the updated vendor files.

## Components

```html
<je-editor
  .initialSchema="${schema}"
  .initialData="${data}"
  @schema-change="${e => console.log(e.detail.schema)}"
  @data-change="${e => console.log(e.detail.data)}"
  @validation-change="${e => console.log(e.detail.isValid, e.detail.errors)}"
></je-editor>
```

### Public API

```javascript
const editor = document.querySelector('je-editor');

editor.schema          // Get/set schema
editor.data            // Get/set data
editor.isValid         // Validation state
editor.errors          // Validation errors
editor.validate()      // Re-validate, returns { isValid, errors }
editor.getState()      // Get { schema, data, isValid, errors }
editor.setState(schema, data)  // Set both at once
editor.debugGrid       // Toggle debug grid overlay
```

## Project Structure

```
src/
  je-editor.js           # Main editor component
  schema-pane/           # Schema editing (visual + raw)
  data-pane/             # Data editing (visual + raw)
  shared/                # Reusable components (value-block, type-badge, etc.)
  services/              # Validation service (AJV wrapper)
  styles/                # Shared CSS
scripts/
  dev-server.js          # Dev server with live reload
  bundle-deps.js         # Bundles lit/ajv to vendor/
```

## License

Public Domain (Unlicense)
