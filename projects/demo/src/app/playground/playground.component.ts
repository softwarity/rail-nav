import { Component, signal, ElementRef, viewChild, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

const PALETTES = [
  'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'chartreuse', 'spring-green', 'azure', 'violet', 'rose'
] as const;
import {
  RailnavComponent,
  RailnavContainerComponent,
  RailnavContentComponent,
  RailnavItemComponent
} from '@softwarity/rail-nav';

interface ColorOverride {
  enabled: boolean;
  light: string;
  dark: string;
}

interface SizeOverride {
  enabled: boolean;
  value: number;
}

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatRippleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
  protected readonly palettes = PALETTES;
  protected readonly selectedPalette = signal('violet');
  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));
  protected hasBackdrop = signal(true);
  protected position = signal<'start' | 'end'>('start');
  protected autoCollapse = signal(true);
  protected activeItem = signal('home');
  protected homeBadge = signal(3);
  protected favoritesDot = signal(true);

  // Size overrides
  protected collapsedWidthOverride = signal<SizeOverride>({ enabled: false, value: 72 });
  protected expandedWidthOverride = signal<SizeOverride>({ enabled: false, value: 280 });
  protected headerHeightOverride = signal<SizeOverride>({ enabled: false, value: 56 });

  // Color overrides
  protected surfaceOverride = signal<ColorOverride>({ enabled: false, light: '#ffffff', dark: '#1e1e1e' });
  protected backdropOverride = signal<ColorOverride>({ enabled: false, light: '#00000066', dark: '#00000099' });
  protected primaryOverride = signal<ColorOverride>({ enabled: false, light: '#6750a4', dark: '#d0bcff' });
  protected secondaryContainerOverride = signal<ColorOverride>({ enabled: false, light: '#e8def8', dark: '#4a4458' });

  // Preview area reference for applying CSS variables
  protected previewArea = viewChild<ElementRef<HTMLElement>>('previewArea');

  protected navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'favorites', icon: 'favorite', label: 'Favorites' },
    { id: 'settings', icon: 'settings', label: 'Settings' }
  ];

  constructor() {
    // Apply CSS variables when overrides change
    effect(() => {
      const preview = this.previewArea()?.nativeElement;
      if (!preview) return;

      const collapsedWidth = this.collapsedWidthOverride();
      const expandedWidth = this.expandedWidthOverride();
      const headerHeight = this.headerHeightOverride();
      const surface = this.surfaceOverride();
      const backdrop = this.backdropOverride();
      const primary = this.primaryOverride();
      const secondaryContainer = this.secondaryContainerOverride();

      if (collapsedWidth.enabled) {
        preview.style.setProperty('--rail-nav-collapsed-width', `${collapsedWidth.value}px`);
      } else {
        preview.style.removeProperty('--rail-nav-collapsed-width');
      }

      if (expandedWidth.enabled) {
        preview.style.setProperty('--rail-nav-expanded-width', `${expandedWidth.value}px`);
      } else {
        preview.style.removeProperty('--rail-nav-expanded-width');
      }

      if (headerHeight.enabled) {
        preview.style.setProperty('--rail-nav-header-height', `${headerHeight.value}px`);
      } else {
        preview.style.removeProperty('--rail-nav-header-height');
      }

      if (surface.enabled) {
        preview.style.setProperty('--rail-nav-surface-color', `light-dark(${surface.light}, ${surface.dark})`);
      } else {
        preview.style.removeProperty('--rail-nav-surface-color');
      }

      if (backdrop.enabled) {
        preview.style.setProperty('--rail-nav-backdrop-color', `light-dark(${backdrop.light}, ${backdrop.dark})`);
      } else {
        preview.style.removeProperty('--rail-nav-backdrop-color');
      }

      if (primary.enabled) {
        preview.style.setProperty('--rail-nav-primary', `light-dark(${primary.light}, ${primary.dark})`);
      } else {
        preview.style.removeProperty('--rail-nav-primary');
      }

      if (secondaryContainer.enabled) {
        preview.style.setProperty('--rail-nav-secondary-container', `light-dark(${secondaryContainer.light}, ${secondaryContainer.dark})`);
      } else {
        preview.style.removeProperty('--rail-nav-secondary-container');
      }
    });
  }

  toggleColorScheme(): void {
    this.isDarkMode.update(dark => !dark);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  toggleBackdrop(): void {
    this.hasBackdrop.update(b => !b);
  }

  togglePosition(): void {
    this.position.update(p => p === 'start' ? 'end' : 'start');
  }

  toggleAutoCollapse(): void {
    this.autoCollapse.update(a => !a);
  }

  selectItem(id: string): void {
    this.activeItem.set(id);
  }

  toggleOverride(type: 'surface' | 'backdrop' | 'primary' | 'secondaryContainer'): void {
    const signalMap = {
      surface: this.surfaceOverride,
      backdrop: this.backdropOverride,
      primary: this.primaryOverride,
      secondaryContainer: this.secondaryContainerOverride
    };
    signalMap[type].update(o => ({ ...o, enabled: !o.enabled }));
  }

  updateOverrideColor(type: 'surface' | 'backdrop' | 'primary' | 'secondaryContainer', mode: 'light' | 'dark', event: Event): void {
    const input = event.target as HTMLInputElement;
    const signalMap = {
      surface: this.surfaceOverride,
      backdrop: this.backdropOverride,
      primary: this.primaryOverride,
      secondaryContainer: this.secondaryContainerOverride
    };
    signalMap[type].update(o => ({ ...o, [mode]: input.value }));
  }

  toggleSizeOverride(type: 'collapsedWidth' | 'expandedWidth' | 'headerHeight'): void {
    const signalMap = {
      collapsedWidth: this.collapsedWidthOverride,
      expandedWidth: this.expandedWidthOverride,
      headerHeight: this.headerHeightOverride
    };
    signalMap[type].update(o => ({ ...o, enabled: !o.enabled }));
  }

  updateSizeOverride(type: 'collapsedWidth' | 'expandedWidth' | 'headerHeight', event: Event): void {
    const input = event.target as HTMLInputElement;
    const signalMap = {
      collapsedWidth: this.collapsedWidthOverride,
      expandedWidth: this.expandedWidthOverride,
      headerHeight: this.headerHeightOverride
    };
    signalMap[type].update(o => ({ ...o, value: input.valueAsNumber || 0 }));
  }

  onPaletteChange(palette: string): void {
    const html = document.documentElement;
    PALETTES.forEach(p => html.classList.remove(p));
    if (palette) {
      html.classList.add(palette);
    }
    this.selectedPalette.set(palette);
  }
}
