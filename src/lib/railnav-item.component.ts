import { Component, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { RailnavComponent } from './railnav.component';

@Component({
  selector: 'rail-nav-item',
  imports: [RouterLink, RouterLinkActive, MatRippleModule],
  template: `
    @if (routerLink()) {
      <a
        class="rail-item"
        [class.expanded]="expanded()"
        [class.position-end]="position() === 'end'"
        [class.active]="active()"
        [routerLink]="routerLink()"
        routerLinkActive="active"
        (click)="onRouterLinkClick()">
        <div class="rail-item-pill">
          <div class="rail-item-ripple" matRipple></div>
          <div class="rail-item-icon-wrapper">
            <div class="rail-item-icon">
              <ng-content />
            </div>
            @if (hasBadge()) {
              <span class="rail-badge" [class.dot]="isDotBadge()">{{ isDotBadge() ? '' : badge() }}</span>
            }
          </div>
          <span class="rail-item-label label-inline">{{ label() }}</span>
        </div>
        <span class="rail-item-label label-below">{{ label() }}</span>
      </a>
    } @else {
      <button
        type="button"
        class="rail-item"
        [class.expanded]="expanded()"
        [class.position-end]="position() === 'end'"
        [class.active]="active()"
        (click)="onItemClick()">
        <div class="rail-item-pill">
          <div class="rail-item-ripple" matRipple></div>
          <div class="rail-item-icon-wrapper">
            <div class="rail-item-icon">
              <ng-content />
            </div>
            @if (hasBadge()) {
              <span class="rail-badge" [class.dot]="isDotBadge()">{{ isDotBadge() ? '' : badge() }}</span>
            }
          </div>
          <span class="rail-item-label label-inline">{{ label() }}</span>
        </div>
        <span class="rail-item-label label-below">{{ label() }}</span>
      </button>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .rail-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      text-decoration: none;
      color: var(--rail-nav-on-surface-variant, var(--mat-sys-on-surface-variant));
      cursor: pointer;
      padding: 0;
      gap: 4px;
      background: none;
      border: none;
      font: inherit;
      min-height: 56px;
      box-sizing: border-box;
      outline: none;
      width: 100%;
    }

    .rail-item.position-end {
      align-items: flex-end;
    }

    .rail-item:focus-visible .rail-item-pill {
      border-color: var(--rail-nav-primary, var(--mat-sys-primary));
    }

    .rail-item.position-end .rail-item-pill {
      justify-content: flex-end;
      padding-left: 0;
      padding-right: 10px;
    }

    .rail-item.expanded {
      gap: 0;
    }

    .rail-item-pill {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 48px;
      height: 32px;
      border-radius: 9999px;
      border: 2px solid transparent;
      overflow: visible;
      margin-top: 12px;
      padding-left: 10px;
      box-sizing: border-box;
      transition: background 0.2s ease, width 0.2s ease, height 0.2s ease, margin 0.2s ease;
    }

    .rail-item-ripple {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
    }

    .rail-item:hover .rail-item-pill {
      background: var(--rail-nav-surface-container-high, var(--mat-sys-surface-container-high));
    }

    .rail-item.active .rail-item-pill {
      background: var(--rail-nav-secondary-container, var(--mat-sys-secondary-container));
      color: var(--rail-nav-on-secondary-container, var(--mat-sys-on-secondary-container));
    }

    /* Expanded pill includes both icon and label */
    .rail-item.expanded .rail-item-pill {
      width: auto;
      height: 48px;
      border-radius: 9999px;
      padding: 0 16px 0 10px;
      gap: 12px;
      justify-content: flex-start;
      box-sizing: border-box;
      margin-top: 0;
    }

    .rail-item.expanded.position-end .rail-item-pill {
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 0 10px 0 16px;
    }

    /* First item: reduce space after header and keep icon stable during expand */
    /* Collapsed: 8px + 16px (half of 32px) = 24px from top */
    /* Expanded: 0px + 24px (half of 48px) = 24px from top */
    :host:first-child .rail-item-pill {
      margin-top: 8px;
    }

    :host:first-child .rail-item.expanded .rail-item-pill {
      margin-top: 0;
    }

    .rail-item-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: visible;
    }

    .rail-item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .rail-item-icon ::ng-deep > * {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .rail-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: var(--rail-nav-error, var(--mat-sys-error));
      color: var(--rail-nav-on-error, var(--mat-sys-on-error));
      font-size: 11px;
      font-weight: 500;
      line-height: 16px;
      text-align: center;
      box-sizing: border-box;
      z-index: 10;
    }

    /* Small dot badge (no text) */
    .rail-badge.dot {
      top: -2px;
      right: -2px;
      min-width: 6px;
      width: 6px;
      height: 6px;
      padding: 0;
      border-radius: 3px;
    }

    /* Label below icon (collapsed mode) */
    .rail-item-label.label-below {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 48px;
      max-height: 16px;
      opacity: 1;
      transition: opacity 0.1s ease, max-height 0.2s ease;
    }

    .rail-item.expanded .rail-item-label.label-below {
      opacity: 0;
      max-height: 0;
      pointer-events: none;
    }

    /* Label inline with icon (expanded mode) */
    .rail-item-label.label-inline {
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 0;
      opacity: 0;
      pointer-events: none;
    }

    .rail-item.expanded .rail-item-label.label-inline {
      width: auto;
      flex: 1;
      opacity: 1;
      pointer-events: auto;
      transition: opacity 0.15s ease 0.1s;
    }

    .rail-item.expanded.position-end .rail-item-label.label-inline {
      text-align: right;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.expanded]': 'expanded()',
    '[class.position-end]': 'position() === "end"'
  }
})
export class RailnavItemComponent {
  /** Router link for navigation */
  readonly routerLink = input<string | any[]>();

  /** Label text displayed */
  readonly label = input<string>();

  /** Badge value (number, text, or true for dot badge) */
  readonly badge = input<string | number | boolean>();

  /** Whether this item is active (for non-router usage) */
  readonly active = input(false);

  /** Whether to show a badge */
  protected readonly hasBadge = computed(() => {
    const b = this.badge();
    return b !== undefined && b !== null && b !== false;
  });

  /** Whether to show a small dot badge (no text) */
  protected readonly isDotBadge = computed(() => {
    const b = this.badge();
    return b === true || b === '';
  });

  /** Click event (for non-router usage) */
  readonly itemClick = output<void>();

  /** Reference to parent rail-nav */
  private railnav = inject(RailnavComponent);

  /** Whether the rail is expanded */
  protected expanded = computed(() => this.railnav.expanded());

  /** Position of the rail (start or end) */
  protected position = computed(() => this.railnav.railPosition());

  /** Handle item click - emit event and collapse rail */
  protected onItemClick(): void {
    this.itemClick.emit();
    this.railnav.collapse();
  }

  /** Handle router link click - collapse rail */
  protected onRouterLinkClick(): void {
    this.railnav.collapse();
  }
}
