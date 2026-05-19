import { Component, DestroyRef, TemplateRef, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { RailnavComponent } from './railnav.component';
import { RailnavDrawerOrchestrator } from './railnav-drawer.orchestrator';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'rail-nav-item',
  imports: [RouterLink, RouterLinkActive, MatRippleModule, NgTemplateOutlet],
  template: `
    <ng-template #iconTpl>
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
    </ng-template>
    @if (routerLink()) {
      <a
        class="rail-item"
        [class.expanded]="expanded()"
        [class.position-end]="position() === 'end'"
        [class.active]="active()"
        [routerLink]="routerLink()"
        routerLinkActive="active"
        (click)="onRouterLinkClick()">
        <ng-container [ngTemplateOutlet]="iconTpl" />
      </a>
    } @else {
      <button
        type="button"
        class="rail-item"
        [class.expanded]="expanded()"
        [class.position-end]="position() === 'end'"
        [class.active]="active()"
        (click)="onItemClick()">
        <ng-container [ngTemplateOutlet]="iconTpl" />
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
      /* Transition gap so it animates in sync with the pill (height, margin) */
      /* and the label (max-height) — otherwise gap snaps instantly to 0 and */
      /* siblings jolt during the expand/collapse animation. */
      transition: gap 0.2s ease;
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
      padding: 0 16px 0 10px;
      gap: 12px;
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

    /* Last item (typically anchored at the bottom via <rail-nav-spacer/>): */
    /* in expanded mode the pill loses both its margin-top AND the label-below */
    /* below it, so the icon center jumps up 12px relative to the rail bottom. */
    /* Mirror of the first-child fix: add a matching margin-bottom on the pill */
    /* in expanded mode to keep the icon visually anchored. */
    :host:last-child .rail-item.expanded .rail-item-pill {
      margin-bottom: 12px;
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
    '[class.position-end]': 'position() === "end"',
    // pointer* events let us filter by pointerType: touch devices emit
    // synthetic mouseenter/leave around taps, which would arm the close timer
    // right after a click-to-open and shut the drawer instantly. Hover-intent
    // only applies for real mouse pointers.
    '(pointerenter)': 'onHostPointerEnter($event)',
    '(pointerleave)': 'onHostPointerLeave($event)'
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

  /** Template projected as a contextual side panel when the item is hovered
   * or clicked. Aliased `for` to mirror Material's `mat-datepicker-toggle`
   * (`<rail-nav-item [for]="myTpl">`). Declare the content as a plain
   * `<ng-template #myTpl>...</ng-template>` anywhere in the host template.
   *
   * When set, the item becomes a trigger; the rail's orchestrator handles
   * overlay rendering, animation, hover-intent and close timer. The panel
   * carries the `rail-nav-drawer-panel` class — style it via the theme mixin
   * `rail-nav.panel()` (or your own global rule). Suppressed while the rail
   * is `expanded()`. */
  readonly for = input<TemplateRef<unknown> | null>(null, { alias: 'for' });

  /** Hover-intent delay (ms) before opening the drawer. Cancelled if the
   * cursor leaves the item first. Click bypasses the delay. */
  private static readonly ENTER_DELAY_MS = 200;

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

  /** Owned by the parent rail (one orchestrator per rail). null in tests where
   * the item is rendered outside a real rail. */
  private orchestrator = inject(RailnavDrawerOrchestrator, { optional: true });

  /** Pending hover-intent timer, cleared on leave or destroy. */
  private enterTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearEnterTimeout());
  }

  /** Whether the rail is expanded */
  protected expanded = computed(() => this.railnav.expanded());

  /** Position of the rail (start or end) */
  protected position = computed(() => this.railnav.railPosition());

  /** Handle item click - emit event, optionally collapse rail, then open drawer.
   * Collapse must come BEFORE openDrawer: while the rail is expanded, the
   * orchestrator suppresses opens (mutual exclusion). Collapsing first ensures
   * the click on an expanded rail still opens the drawer. */
  protected onItemClick(): void {
    this.itemClick.emit();
    if (this.railnav.autoCollapse()) {
      this.railnav.collapse();
    }
    this.openDrawerIfAny();
  }

  /** Handle router link click - optionally collapse rail */
  protected onRouterLinkClick(): void {
    if (this.railnav.autoCollapse()) {
      this.railnav.collapse();
    }
  }

  /** Hover-intent: when the item carries a `for` drawer, open it after a
   * short delay. The delay is cancelled if the cursor leaves before it fires.
   * Ignored on non-mouse pointers (touch/pen) — the click path handles them. */
  protected onHostPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (!this.for() || !this.orchestrator) return;
    if (this.railnav.expanded()) return;
    this.clearEnterTimeout();
    this.enterTimeout = setTimeout(
      () => this.openDrawerIfAny(),
      RailnavItemComponent.ENTER_DELAY_MS,
    );
  }

  /** Arm the orchestrator's close timer when leaving the trigger item. If
   * the cursor reaches the overlay before it fires, the overlay's own
   * `pointerenter` cancels it. Ignored on touch/pen for the same reason. */
  protected onHostPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.clearEnterTimeout();
    if (this.for()) this.orchestrator?.armClose();
  }

  private openDrawerIfAny(): void {
    const drawer = this.for();
    if (!drawer || !this.orchestrator) return;
    this.clearEnterTimeout();
    this.orchestrator.open(drawer);
  }

  private clearEnterTimeout(): void {
    if (this.enterTimeout !== undefined) {
      clearTimeout(this.enterTimeout);
      this.enterTimeout = undefined;
    }
  }
}
