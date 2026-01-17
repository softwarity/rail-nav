<p align="center">
  <a href="https://www.softwarity.io/">
    <img src="https://www.softwarity.io/img/softwarity.svg" alt="Softwarity" height="60">
  </a>
</p>

# @softwarity/rail-nav

<p align="center">
  <a href="https://www.npmjs.com/package/@softwarity/rail-nav">
    <img src="https://img.shields.io/npm/v/@softwarity/rail-nav?color=blue&label=npm" alt="npm version">
  </a>
  <a href="https://github.com/softwarity/rail-nav/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="license">
  </a>
</p>

Material Design 3 Navigation Rail component for Angular. Extends Angular Material `mat-sidenav` to provide a collapsible rail navigation pattern.

**[Live Demo](https://softwarity.github.io/rail-nav/)**

## Features

- **Material Design 3** - Implements the Navigation Rail pattern from MD3
- **Extends Material** - Built on top of `MatSidenav` for reliability
- **Navigation Items** - `rail-nav-item` component with MD3 pill animation, badges, and router support
- **Expand/Collapse** - Smooth transition between rail and drawer with adaptive width
- **Backdrop** - Optional backdrop overlay when expanded
- **Position** - Support for left (start) or right (end) positioning
- **Dark Mode** - Automatically adapts to light/dark color scheme
- **SCSS Theming** - Customizable via SCSS mixin following Angular Material pattern

## Installation

```bash
npm install @softwarity/rail-nav
```

### Peer Dependencies

| Package | Version |
|---------|---------|
| @angular/common | >= 21.0.0 |
| @angular/core | >= 21.0.0 |
| @angular/cdk | >= 21.0.0 |
| @angular/material | >= 21.0.0 |

## Usage

Import the components in your Angular component:

```typescript
import {
  RailnavComponent,
  RailnavContainerComponent,
  RailnavContentComponent,
  RailnavItemComponent
} from '@softwarity/rail-nav';

@Component({
  imports: [
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent
  ],
  template: `
    <rail-nav-container>
      <rail-nav title="My App" subtitle="v1.0">
        <rail-nav-item label="Home" routerLink="/home">
          <mat-icon>home</mat-icon>
        </rail-nav-item>
        <rail-nav-item label="Settings" routerLink="/settings">
          <mat-icon>settings</mat-icon>
        </rail-nav-item>
      </rail-nav>
      <rail-nav-content>
        <!-- Page content -->
      </rail-nav-content>
    </rail-nav-container>
  `
})
export class AppComponent {}
```

## API

### RailnavComponent

The main navigation rail component. Extends `MatSidenav`.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `collapsedWidth` | `number` | `72` | Width in pixels when collapsed (icon-only mode) |
| `expandedWidth` | `number \| 'auto'` | `'auto'` | Width when expanded. Use `'auto'` for content-based width |
| `position` | `'start' \| 'end'` | `'start'` | Position of the rail (left or right) |
| `title` | `string` | - | Title displayed next to burger when expanded |
| `subtitle` | `string` | - | Subtitle displayed below title when expanded |
| `headerHeight` | `number` | `56` | Header height in pixels (to match toolbar) |
| `hideDefaultHeader` | `boolean` | `false` | Hide the default header to provide custom content |

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `expanded` | `Signal<boolean>` | Read the current expanded state |
| `toggleExpanded()` | `void` | Toggle between collapsed and expanded |
| `expand()` | `void` | Expand the rail |
| `collapse()` | `void` | Collapse the rail |

### RailnavContainerComponent

Container component. Extends `MatSidenavContainer`.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `showBackdrop` | `boolean` | `true` | Show backdrop overlay when expanded |

### RailnavContentComponent

Content area component. Extends `MatSidenavContent`.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `collapsedWidth` | `number` | `auto` | Width of collapsed rail. Auto-detected from sibling `rail-nav` if not set |
| `position` | `'start' \| 'end'` | `auto` | Position of rail. Auto-detected from sibling `rail-nav` if not set |

**Note:** Both inputs are optional. When placed inside a `rail-nav-container` alongside a `rail-nav`, the component automatically reads `collapsedWidth` and `position` from the sibling rail.

### RailnavItemComponent

Navigation item with MD3 pill animation.

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `routerLink` | `string \| any[]` | - | Router link for navigation |
| `label` | `string` | - | Label text (below icon when collapsed, beside when expanded) |
| `badge` | `string \| number \| boolean` | - | Badge value. Use `true` for a small dot badge |
| `active` | `boolean` | `false` | Whether this item is active (for non-router usage) |

| Output | Type | Description |
|--------|------|-------------|
| `itemClick` | `void` | Emitted when clicked (automatically collapses rail) |

## SCSS Theming

Use the SCSS mixin to customize colors following the Angular Material pattern:

```scss
@use '@softwarity/rail-nav' as rail-nav;

:root {
  @include rail-nav.overrides((
    backdrop-color: rgba(0, 0, 0, 0.5),
    primary: #6200ea,
    surface-color: #f5f5f5,
  ));
}
```

### Available Tokens

| Token | Description |
|-------|-------------|
| `backdrop-color` | Background color for the backdrop overlay |
| `surface-color` | Background color for the rail |
| `surface-container-high` | Background color for hover states |
| `on-surface` | Text color for primary content |
| `on-surface-variant` | Text color for secondary content |
| `secondary-container` | Background color for active items |
| `on-secondary-container` | Text color for active items |
| `primary` | Focus ring color |
| `error` | Badge background color |
| `on-error` | Badge text color |

## CSS Custom Properties

You can also use CSS custom properties directly:

```css
:root {
  --rail-nav-backdrop-color: rgba(0, 0, 0, 0.5);
  --rail-nav-surface-color: #ffffff;
  --rail-nav-on-surface: #1c1b1f;
  --rail-nav-primary: #6750a4;
  --rail-nav-error: #b3261e;
}
```

The component uses Material Design 3 system tokens (`--mat-sys-*`) as fallbacks.

## Light/Dark Theme Support

Use the CSS `light-dark()` function to define colors that automatically adapt to the user's color scheme:

### With SCSS mixin

```scss
@use '@softwarity/rail-nav' as rail-nav;

:root {
  @include rail-nav.overrides((
    backdrop-color: light-dark(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)),
    surface-color: light-dark(#ffffff, #1e1e1e),
    on-surface: light-dark(#1c1b1f, #e6e1e5),
    primary: light-dark(#6750a4, #d0bcff),
  ));
}
```

### With CSS custom properties

```css
:root {
  --rail-nav-backdrop-color: light-dark(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
  --rail-nav-surface-color: light-dark(#ffffff, #1e1e1e);
  --rail-nav-on-surface: light-dark(#1c1b1f, #e6e1e5);
  --rail-nav-on-surface-variant: light-dark(#49454f, #cac4d0);
  --rail-nav-secondary-container: light-dark(#e8def8, #4a4458);
  --rail-nav-on-secondary-container: light-dark(#1d192b, #e8def8);
  --rail-nav-primary: light-dark(#6750a4, #d0bcff);
  --rail-nav-error: light-dark(#b3261e, #f2b8b5);
  --rail-nav-on-error: light-dark(#ffffff, #601410);
}
```

### Setting up color-scheme

For `light-dark()` to work, set the `color-scheme` property on your document:

```scss
html {
  color-scheme: light;
  &.dark-mode { color-scheme: dark; }
}

/* Or use system preference */
html {
  color-scheme: light dark;
}
```

## Example

```typescript
@Component({
  imports: [
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent,
    MatIconModule
  ],
  template: `
    <rail-nav-container [showBackdrop]="true">
      <rail-nav title="My App" subtitle="v1.0">
        <rail-nav-item label="Home" [badge]="3" routerLink="/home">
          <mat-icon>home</mat-icon>
        </rail-nav-item>
        <rail-nav-item label="Favorites" [badge]="true" routerLink="/favorites">
          <mat-icon>favorite</mat-icon>
        </rail-nav-item>
        <rail-nav-item label="Settings" routerLink="/settings">
          <mat-icon>settings</mat-icon>
        </rail-nav-item>
      </rail-nav>
      <rail-nav-content>
        <main>Your content here</main>
      </rail-nav-content>
    </rail-nav-container>
  `
})
export class MyComponent {}
```

## License

MIT
