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
- `src/jedi-editor.js` - Main component, manages state, validation, and themes
- `src/schema-pane/` - Schema editing (visual + raw modes)
- `src/data-pane/` - Data editing (visual + raw modes)
- `src/shared/` - Reusable components (value-block, type-badge, theme-selector, etc.)
- `src/services/validation-service.js` - AJV wrapper
- `src/services/theme-service.js` - Theme state management
- `src/styles/themes.js` - Theme color definitions (dark, light)
- `src/styles/shared-styles.js` - CSS theme variables and shared styles

### Data Flow
1. JediEditor receives schema/data via properties or setState()
2. Child panes dispatch change events
3. JediEditor validates via validationService
4. JediEditor emits schema-change, data-change, validation-change, theme-change events

### Theming
- Two built-in themes: `dark` (default) and `light`
- Theme colors defined in `src/styles/themes.js`
- Use `editor.theme = 'light'` or `editor.theme = 'dark'` to switch
- Theme persisted to localStorage automatically
- `<jedi-theme-selector>` component provides UI toggle
- All colors use CSS custom properties (`--jedi-*`)

## Code Conventions

- Lit components with `jedi-` prefix
- JSDoc for types (no TypeScript)
- CSS custom properties (`--jedi-*`)
- Event-driven component communication
