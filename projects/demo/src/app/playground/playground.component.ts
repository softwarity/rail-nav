import { Component, signal, computed, ElementRef, viewChild, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  RailnavComponent,
  RailnavContainerComponent,
  RailnavContentComponent,
  RailnavItemComponent,
  RailnavBrandingDirective
} from '@softwarity/rail-nav';
// Register interactive-code custom elements
import { registerInteractiveCode } from '@softwarity/interactive-code';
registerInteractiveCode();

const PALETTES = [
  'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'chartreuse', 'spring-green', 'azure', 'violet', 'rose'
] as const;

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent,
    RailnavBrandingDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
  // Basic demo signals
  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));
  protected hasBackdrop = signal(true);
  protected position = signal<'start' | 'end'>('start');
  protected autoCollapse = signal(true);
  protected activeItem = signal('home');
  protected homeBadge = signal(3);
  protected favoritesDot = signal(true);
  protected selectedPalette = signal('violet');

  // Branding options (comment toggles)
  protected useCustomBranding = signal(true);
  protected useTitle = signal(false);
  protected useSubtitle = signal(false);

  // Size overrides
  protected collapsedWidthEnabled = signal(false);
  protected collapsedWidth = signal(72);
  protected expandedWidthEnabled = signal(false);
  protected expandedWidth = signal(280);
  protected headerHeightEnabled = signal(false);
  protected headerHeight = signal(56);

  // Color overrides - separate light/dark signals
  // Surface colors
  protected surfaceEnabled = signal(false);
  protected surfaceLight = signal('#fff8e1');  // Warm cream
  protected surfaceDark = signal('#1a237e');   // Deep indigo
  protected surfaceContainerHighEnabled = signal(false);
  protected surfaceContainerHighLight = signal('#ffe082');  // Amber
  protected surfaceContainerHighDark = signal('#303f9f');   // Indigo
  // Text colors
  protected onSurfaceEnabled = signal(false);
  protected onSurfaceLight = signal('#bf360c');   // Deep orange
  protected onSurfaceDark = signal('#ffeb3b');    // Yellow
  protected onSurfaceVariantEnabled = signal(false);
  protected onSurfaceVariantLight = signal('#6a1b9a');  // Purple
  protected onSurfaceVariantDark = signal('#ce93d8');   // Light purple
  // Backdrop
  protected backdropEnabled = signal(false);
  protected backdropLight = signal('#ff572280');  // Orange transparent
  protected backdropDark = signal('#7c4dff80');   // Purple transparent
  // Primary (focus ring)
  protected primaryEnabled = signal(false);
  protected primaryLight = signal('#d32f2f');  // Red
  protected primaryDark = signal('#ff5252');   // Bright red
  // Secondary container (active item)
  protected secondaryContainerEnabled = signal(false);
  protected secondaryContainerLight = signal('#c8e6c9');  // Light green
  protected secondaryContainerDark = signal('#2e7d32');   // Green
  protected onSecondaryContainerEnabled = signal(false);
  protected onSecondaryContainerLight = signal('#1b5e20');  // Dark green
  protected onSecondaryContainerDark = signal('#a5d6a7');   // Light green
  // Badge colors
  protected errorEnabled = signal(false);
  protected errorLight = signal('#e91e63');   // Pink
  protected errorDark = signal('#f48fb1');    // Light pink
  protected onErrorEnabled = signal(false);
  protected onErrorLight = signal('#ffffff'); // White
  protected onErrorDark = signal('#880e4f');  // Dark pink

  // Preview area reference for applying CSS variables
  protected previewArea = viewChild<ElementRef<HTMLElement>>('previewArea');

  protected navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'favorites', icon: 'favorite', label: 'Favorites' },
    { id: 'settings', icon: 'settings', label: 'Settings' }
  ];

  // Computed for dark mode class display
  protected darkModeClass = computed(() => this.isDarkMode() ? 'dark-mode' : '');

  // List of available palettes for the select
  protected readonly palettes = PALETTES;

  constructor() {
    // Apply palette changes
    effect(() => {
      const palette = this.selectedPalette();
      const html = document.documentElement;
      PALETTES.forEach(p => html.classList.remove(p));
      if (palette) {
        html.classList.add(palette);
      }
    });

    // Apply CSS variables when overrides change
    effect(() => {
      const preview = this.previewArea()?.nativeElement;
      if (!preview) return;

      // Size overrides
      if (this.collapsedWidthEnabled()) {
        preview.style.setProperty('--rail-nav-collapsed-width', `${this.collapsedWidth()}px`);
      } else {
        preview.style.removeProperty('--rail-nav-collapsed-width');
      }

      if (this.expandedWidthEnabled()) {
        preview.style.setProperty('--rail-nav-expanded-width', `${this.expandedWidth()}px`);
      } else {
        preview.style.removeProperty('--rail-nav-expanded-width');
      }

      if (this.headerHeightEnabled()) {
        preview.style.setProperty('--rail-nav-header-height', `${this.headerHeight()}px`);
      } else {
        preview.style.removeProperty('--rail-nav-header-height');
      }

      // Color overrides
      if (this.surfaceEnabled()) {
        preview.style.setProperty('--rail-nav-surface-color', `light-dark(${this.surfaceLight()}, ${this.surfaceDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-surface-color');
      }

      if (this.backdropEnabled()) {
        preview.style.setProperty('--rail-nav-backdrop-color', `light-dark(${this.backdropLight()}, ${this.backdropDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-backdrop-color');
      }

      if (this.primaryEnabled()) {
        preview.style.setProperty('--rail-nav-primary', `light-dark(${this.primaryLight()}, ${this.primaryDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-primary');
      }

      if (this.secondaryContainerEnabled()) {
        preview.style.setProperty('--rail-nav-secondary-container', `light-dark(${this.secondaryContainerLight()}, ${this.secondaryContainerDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-secondary-container');
      }

      if (this.surfaceContainerHighEnabled()) {
        preview.style.setProperty('--rail-nav-surface-container-high', `light-dark(${this.surfaceContainerHighLight()}, ${this.surfaceContainerHighDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-surface-container-high');
      }

      if (this.onSurfaceEnabled()) {
        preview.style.setProperty('--rail-nav-on-surface', `light-dark(${this.onSurfaceLight()}, ${this.onSurfaceDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-on-surface');
      }

      if (this.onSurfaceVariantEnabled()) {
        preview.style.setProperty('--rail-nav-on-surface-variant', `light-dark(${this.onSurfaceVariantLight()}, ${this.onSurfaceVariantDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-on-surface-variant');
      }

      if (this.onSecondaryContainerEnabled()) {
        preview.style.setProperty('--rail-nav-on-secondary-container', `light-dark(${this.onSecondaryContainerLight()}, ${this.onSecondaryContainerDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-on-secondary-container');
      }

      if (this.errorEnabled()) {
        preview.style.setProperty('--rail-nav-error', `light-dark(${this.errorLight()}, ${this.errorDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-error');
      }

      if (this.onErrorEnabled()) {
        preview.style.setProperty('--rail-nav-on-error', `light-dark(${this.onErrorLight()}, ${this.onErrorDark()})`);
      } else {
        preview.style.removeProperty('--rail-nav-on-error');
      }
    });
  }

  toggleColorScheme(): void {
    this.isDarkMode.update(dark => !dark);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  selectItem(id: string): void {
    this.activeItem.set(id);
  }
}
