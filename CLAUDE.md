# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

JEDI Editor - Visual JSON Schema editor web component. Built with Lit, uses AJV for validation. Pure editing component with no persistence (handled externally).

## Tech Stack

- **Frontend**: Lit 3
- **Validation**: AJV 8 + AJV-Formats
- **Language**: JavaScript (ES2020+) with JSDoc types
- **Build**: esbuild (for bundling dependencies only)

## Development

```bash
npm install    # Install deps + bundle vendor/
npm run dev    # Dev server with live reload (http://localhost:17080)
```

## Architecture

### Component Structure
- `src/je-editor.js` - Main component, manages state and validation
- `src/schema-pane/` - Schema editing (visual + raw modes)
- `src/data-pane/` - Data editing (visual + raw modes)
- `src/shared/` - Reusable components (value-block, type-badge, etc.)
- `src/services/validation-service.js` - AJV wrapper
- `src/styles/shared-styles.js` - CSS theme

### Data Flow
1. JeEditor receives schema/data via properties or setState()
2. Child panes dispatch change events
3. JeEditor validates via validationService
4. JeEditor emits schema-change, data-change, validation-change events

## Code Conventions

- Lit components with `je-` prefix
- JSDoc for types (no TypeScript)
- CSS custom properties (`--je-*`)
- Event-driven component communication
