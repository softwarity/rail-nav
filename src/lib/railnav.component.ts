import { Component, signal, effect, input, computed } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'rail-nav',
  imports: [MatRippleModule],
  template: `
    @if (!hideDefaultHeader()) {
      <div class="rail-header" [class.position-end]="railPosition() === 'end'" matRipple [style.height.px]="headerHeight()" (click)="toggleExpanded()">
        @if (expanded() && (title() || subtitle()) && railPosition() === 'end') {
          <div class="rail-branding position-end">
            @if (title()) {
              <span class="rail-title">{{ title() }}</span>
            }
            @if (subtitle()) {
              <span class="rail-subtitle">{{ subtitle() }}</span>
            }
          </div>
        }
        <div class="rail-burger" [class.expanded]="expanded()" [class.position-end]="railPosition() === 'end'">
          <!-- Menu icon (collapsed state) -->
          <svg class="icon-menu" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
          <!-- Menu open icon (expanded state) -->
          <svg class="icon-menu-open" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M120-240v-80h520v80H120Zm664-40L584-480l200-200 56 56-144 144 144 144-56 56ZM120-440v-80h400v80H120Zm0-200v-80h520v80H120Z"/>
          </svg>
        </div>
        @if (expanded() && (title() || subtitle()) && railPosition() === 'start') {
          <div class="rail-branding">
            @if (title()) {
              <span class="rail-title">{{ title() }}</span>
            }
            @if (subtitle()) {
              <span class="rail-subtitle">{{ subtitle() }}</span>
            }
          </div>
        }
      </div>
    }
    <ng-content />
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      border: none !important;
      border-right: none !important;
      border-left: none !important;
      outline: none !important;
      box-shadow: none;
      background: var(--rail-nav-surface-color, var(--mat-sys-surface));
      transition: width 0.2s ease;
      overflow: visible;
    }

    :host(.expanded) {
      box-shadow: 4px 0 8px rgba(0,0,0,.2);
    }

    :host(.position-end) {
      left: auto;
      right: 0;
    }

    :host(.position-end.expanded) {
      box-shadow: -4px 0 8px rgba(0,0,0,.2);
    }

    .rail-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 16px 24px;
      box-sizing: border-box;
      cursor: pointer;
      color: var(--rail-nav-on-surface, var(--mat-sys-on-surface));
    }

    .rail-header.position-end {
      padding: 16px 24px 16px 16px;
    }

    .rail-header.position-end .rail-burger {
      margin-left: auto;
    }

    .rail-header:hover {
      background: var(--rail-nav-surface-container-high, var(--mat-sys-surface-container-high));
    }

    .rail-burger {
      position: relative;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .rail-burger.position-end {
      transform: scaleX(-1);
    }

    .rail-burger svg {
      position: absolute;
      top: 0;
      left: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    /* Position start (left) - clockwise rotation */
    .rail-burger .icon-menu {
      opacity: 1;
      transform: rotate(0deg);
    }

    .rail-burger .icon-menu-open {
      opacity: 0;
      transform: rotate(-90deg);
    }

    .rail-burger.expanded .icon-menu {
      opacity: 0;
      transform: rotate(90deg);
    }

    .rail-burger.expanded .icon-menu-open {
      opacity: 1;
      transform: rotate(0deg);
    }

    /* Position end (right) - counter-clockwise rotation (mirrored) */
    .rail-burger.position-end .icon-menu {
      transform: rotate(0deg);
    }

    .rail-burger.position-end .icon-menu-open {
      transform: rotate(90deg);
    }

    .rail-burger.position-end.expanded .icon-menu {
      transform: rotate(-90deg);
    }

    .rail-burger.position-end.expanded .icon-menu-open {
      transform: rotate(0deg);
    }

    .rail-branding {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
      min-width: 0;
      overflow: hidden;
      text-align: right;
      padding-top: 5px;
    }

    .rail-branding.position-end {
      text-align: left;
    }

    .rail-title {
      font-size: 16px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--rail-nav-on-surface, var(--mat-sys-on-surface));
    }

    .rail-subtitle {
      font-size: 11px;
      line-height: 1;
      color: var(--rail-nav-on-surface-variant, var(--mat-sys-on-surface-variant));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.7;
    }
  `],
  host: {
    'class': 'mat-drawer mat-sidenav',
    '[class.expanded]': 'expanded()',
    '[class.position-end]': 'railPosition() === "end"',
    '[style.width]': 'computedWidth()'
  }
})
export class RailnavComponent extends MatSidenav {
  /** Width when collapsed (icon-only mode) */
  readonly collapsedWidth = input(72);

  /** Width when expanded (with labels). Use 'auto' for content-based width, or a number in pixels */
  readonly expandedWidth = input<number | 'auto'>('auto');

  /** Position: 'start' (left) or 'end' (right) */
  readonly railPosition = input<'start' | 'end'>('start');

  /** Hide the default header (burger + title/subtitle) */
  readonly hideDefaultHeader = input(false);

  /** Header height in pixels (to match toolbar height) */
  readonly headerHeight = input(56);

  /** Title displayed when expanded */
  readonly title = input<string>();

  /** Subtitle displayed when expanded */
  readonly subtitle = input<string>();

  /** Whether the rail is expanded to show labels */
  readonly expanded = signal(false);

  /** Computed width for the host element */
  protected readonly computedWidth = computed(() => {
    if (!this.expanded()) {
      return `${this.collapsedWidth()}px`;
    }
    const width = this.expandedWidth();
    return width === 'auto' ? 'fit-content' : `${width}px`;
  });

  constructor() {
    super();
    // Default settings for rail behavior
    this.opened = true;
    this.disableClose = true;
    this.mode = 'side';

    // Sync mode with expanded state
    effect(() => {
      this.mode = this.expanded() ? 'over' : 'side';
    });
  }

  /** Toggle between collapsed (rail) and expanded (drawer) */
  toggleExpanded(): void {
    this.expanded.update(e => !e);
  }

  /** Collapse the rail */
  collapse(): void {
    this.expanded.set(false);
  }

  /** Expand the rail to drawer */
  expand(): void {
    this.expanded.set(true);
  }
}
