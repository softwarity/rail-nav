# Release Notes

## 1.1.5

---

## 1.1.4

### Fixes

- **Rail no longer inherits stray Material `.mat-drawer` defaults next to a nested drawer.** Follow-up to the 1.1.3 fix: a few more base `.mat-drawer` declarations the rail never reset leaked through when Material's stylesheet won the cascade (e.g. on a route hosting another `MatDrawer`/`MatSidenav`). All collisions are now pinned on `:host(.mat-drawer)`:
  - `border-radius` (`corner-large`) — was rounding the rail's right corners → now `border-radius: 0`.
  - `color` — overrode the rail's text color → now `var(--rail-nav-on-surface, …)`.
  - `transform: translate3d(-100%, 0, 0)` — now `transform: none`, so the rail no longer relies on Material's own side/opened resets winning the source order.
  - `z-index` — Material's two-class rule `.mat-drawer.mat-drawer-side { z-index: 2 }` ties `:host(.mat-drawer)` on specificity, so the rail's `z-index: 100` is now `!important` (it's a fixed value, not themed) to keep the rail above page content.

---

## 1.1.3

### Fixes

- **Rail no longer balloons to 360px (and turns the wrong background) when a `mat-drawer-container` is nested in the content.** The rail's `:host` styles (width, background, position, …) shared the exact specificity of Material's base `.mat-drawer` rule (`width: var(--mat-sidenav-container-width, 360px); background: …surface`), so the rail only won the cascade by stylesheet insertion order. As soon as a consumer rendered another `MatDrawer`/`MatSidenav` — e.g. a `mat-drawer-container` inside routed content — Angular appended Material's sidenav styles **after** the rail's, the tie flipped, and the rail adopted Material's defaults: 360px wide with a surface background, overlapping the page content. The rail's host rules are now scoped to `:host(.mat-drawer)` (one class more specific than `.mat-drawer`), so the rail wins deterministically regardless of insertion order.

---

## 1.1.2

### Improvements

- **Smoother drawer transition when switching triggers** — moving the cursor from one trigger item to another now keeps the overlay perfectly still and cross-fades only its content (old content fades out, new content fades in). It no longer reads as the drawer closing and reopening.

### Docs

- Documented the contextual drawer (`[for]` + `<ng-template>`), `RailnavSeparatorComponent` and `RailnavSpacerComponent` in the demo's API reference (and the README) — including the drawer's CSS custom properties.

---

## 1.1.1

### Features

- **Contextual drawer pattern** — a rail item can declare `[for]="someTemplate"` pointing to a plain `<ng-template>`, rendered in a CDK overlay next to the rail:
  ```html
  <rail-nav-item label="Workspaces" [for]="wsTpl">
    <mat-icon>workspaces</mat-icon>
  </rail-nav-item>
  <ng-template #wsTpl>
    <a routerLink="/ws/1">Workspace 1</a>
  </ng-template>
  ```
  - `for` input on `RailnavItemComponent`, aliased to match `mat-datepicker-toggle` ergonomics.
  - The library handles everything consumers used to wire by hand:
    - CDK overlay rendering positioned next to the rail, scroll-aware so it stays glued to it
    - Hover-intent (200 ms delay before opening, cancelled if the cursor leaves first)
    - Close debounce (300 ms after leaving the trigger or the drawer, cancelled if the cursor comes back)
    - Outside-tap dismiss; mobile/touch tap to open (synthetic mouse events after a tap are guarded so the drawer doesn't close instantly)
    - Mutual exclusion with the rail's expanded mode (no drawer stacks on the expanded rail; expanding closes any open drawer)
    - Single overlay reused across triggers — switching from one trigger to another re-targets the same overlay
  - Panel chrome (background, shadow, rounded corner) and nav-list layout (flex column, padding, gap, fixed width) are applied by the library, so the template only needs its children. Themable via CSS custom properties: `--rail-nav-drawer-width`, `--rail-nav-drawer-padding`, `--rail-nav-drawer-gap`, `--rail-nav-drawer-surface`, `--rail-nav-drawer-on-surface`, `--rail-nav-drawer-shadow`, `--rail-nav-drawer-radius`.
- **`RailnavSeparatorComponent`** (`<rail-nav-separator />`) — hairline rule between item groups, kept visually centered in both collapsed and expanded modes via a mode-aware vertical shift. Color via `--rail-nav-separator-color`.
- **`RailnavSpacerComponent`** (`<rail-nav-spacer />`) — flexible spacer that pushes following items to the bottom of the rail (e.g. Settings anchored at the bottom).

### Fixes

- Rail items no longer jolt during expand/collapse: the inter-icon `gap` transitions in sync with the pill, and the first/last items keep their icon visually stable across modes via mirrored margin compensation.

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
