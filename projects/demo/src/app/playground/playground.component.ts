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
  RailnavItemComponent
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
    RailnavItemComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
  // Basic demo signals
  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));
  protected title = signal('Softwarity');
  protected hasBackdrop = signal(true);
  protected position = signal<'start' | 'end'>('start');
  protected autoCollapse = signal(true);
  protected activeItem = signal('home');
  protected homeBadge = signal(3);
  protected favoritesDot = signal(true);
  protected selectedPalette = signal('violet');

  // Size overrides
  protected collapsedWidthEnabled = signal(false);
  protected collapsedWidth = signal(72);
  protected expandedWidthEnabled = signal(false);
  protected expandedWidth = signal(280);
  protected headerHeightEnabled = signal(false);
  protected headerHeight = signal(56);

  // Color overrides - separate light/dark signals
  protected surfaceEnabled = signal(false);
  protected surfaceLight = signal('#ffffff');
  protected surfaceDark = signal('#1e1e1e');
  protected backdropEnabled = signal(false);
  protected backdropLight = signal('#00000066');
  protected backdropDark = signal('#00000099');
  protected primaryEnabled = signal(false);
  protected primaryLight = signal('#6750a4');
  protected primaryDark = signal('#d0bcff');
  protected secondaryContainerEnabled = signal(false);
  protected secondaryContainerLight = signal('#e8def8');
  protected secondaryContainerDark = signal('#4a4458');

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
