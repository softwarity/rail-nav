# Release Notes

## 1.0.18

---

## 1.1.0

### Features

- **Contextual drawer pattern** (`<rail-nav-drawer>` + `[for]` on items):
  - New `RailnavDrawerComponent` — declared anywhere in the host template, it holds the contextual content as an `<ng-template>`.
  - `RailnavItemComponent` gains a `for` input (aliased to match `mat-datepicker-toggle`):
    ```html
    <rail-nav-item label="Workspaces" [for]="wsDrawer">
      <mat-icon>workspaces</mat-icon>
    </rail-nav-item>
    <rail-nav-drawer #wsDrawer>
      <a routerLink="/ws/1">Workspace 1</a>
    </rail-nav-drawer>
    ```
  - The library handles **everything** consumers used to wire by hand:
    - CDK overlay rendering positioned next to the rail
    - Hover-intent (200 ms delay before opening, cancelled if the cursor leaves first)
    - Close debounce (300 ms after `mouseleave` on trigger or drawer, cancelled if the cursor comes back)
    - Mutual exclusion with the rail's expanded mode (no drawer stacks on top of the expanded rail; expanding closes any open drawer)
    - Single overlay reused across triggers — switching trigger items re-targets without flicker
  - Consumer-side code is now just two bindings — no signals, no timers, no `mouseenter`/`mouseleave` handlers.

---

## 1.0.16

### Features

- **RailnavBrandingDirective**: New directive for custom header branding via content projection
  - Use `<div railNavBranding>` to replace the default title/subtitle with custom content
  - Burger icon remains intact for expand/collapse functionality
  - Title and subtitle inputs are ignored when custom branding is projected
  - Exported from `@softwarity/rail-nav` public API

### Demo

- Migrated to `@softwarity/interactive-code` package for interactive code examples
- Added complete SCSS override playground with all 13 customizable tokens
- Real-time preview of CSS variable changes (size and color overrides)
- Support for HTML block comments (`${key}...${/key}`) and attribute toggles (`type="attribute"`)

---

## 1.0.15

- SCSS imports cleanup: use `rail-nav-theme` directly, remove unused index file

---

## 1.0.14

- Update styles and structure for rail-nav component assets

---

## 1.0.10 - 1.0.12

### Styles & Layout

- Wrap `ng-content` in `<nav>` element for better semantics
- Improved rail-items layout with flexbox
- Fixed rail-item alignment in collapsed and expanded states
- Added `box-sizing: border-box` for consistent sizing

---

## 1.0.8 - 1.0.9

### Internal Refactoring

- **RailnavItemComponent**: Use `NgTemplateOutlet` for icon rendering (cleaner template)
- **RailnavComponent**: Use `NgTemplateOutlet` for branding section
- Cleanup RailnavContainerComponent

---

## 1.0.3 - 1.0.7

*Chores: tslib dependency and importHelpers configuration adjustments*

---

## 1.0.2

### Documentation

- Updated README with API properties and CSS custom properties
- Added images for collapsed and expanded states

---

## 1.0.1

- **RailnavItemComponent**: New navigation item component with MD3 pill animation
  - Smooth transitions between collapsed (icon with label below) and expanded (pill with icon and label inline) modes
  - Badge support with number/text values or dot indicator (`[badge]="true"`)
  - Router link support with automatic rail collapse on navigation
  - Focus visible states with keyboard navigation
  - Material ripple effect on click

- **SCSS Theme Override**: New `@include rail-nav.overrides()` mixin for customization
  - Follows Angular Material theming pattern
  - 10 customizable tokens: backdrop-color, surface-color, surface-container-high, on-surface, on-surface-variant, secondary-container, on-secondary-container, primary, error, on-error

- **Adaptive Width**: `expandedWidth` now supports `'auto'` (default) for content-based width

### Improvements

- Enhanced light/dark mode support with CSS custom properties
- Improved backdrop animation (0.3s ease-in-out, reduced opacity to 0.4)
- Better header styling with title/subtitle support
- Position-aware layout for start/end rail positioning

### Documentation

- Updated demo with interactive playground showing all features
- Added SCSS theming section with available tokens
- Added RailnavItemComponent API documentation

---
