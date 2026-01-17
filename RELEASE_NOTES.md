# Release Notes

## 1.0.7

---

## 1.0.6

---

## 1.0.5

---

## 1.0.4

---

## 1.0.3

---

## 1.0.2

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


