import { Component, signal, effect, input, contentChild, ElementRef, Directive, computed } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { NgTemplateOutlet } from '@angular/common';
import { RailnavDrawerOrchestrator } from './railnav-drawer.orchestrator';

/** Directive to mark custom branding content */
@Directive({
  selector: '[railNavBranding]'
})
export class RailnavBrandingDirective {}

@Component({
  selector: 'rail-nav',
  imports: [MatRippleModule, NgTemplateOutlet],
  template: `
    <!-- Default branding template (title/subtitle) -->
    <ng-template #defaultBrandingTpl>
      <div class="rail-branding" [class.position-end]="railPosition() === 'end'">
        @if (title()) {
          <span class="rail-title">{{ title() }}</span>
        }
        @if (subtitle()) {
          <span class="rail-subtitle">{{ subtitle() }}</span>
        }
      </div>
    </ng-template>
    <!-- Custom branding template (projected content) -->
    <ng-template #customBrandingTpl>
      <div class="rail-branding rail-branding-custom" [class.position-end]="railPosition() === 'end'">
        <ng-content select="[railNavBranding]" />
      </div>
    </ng-template>
    @if (!hideDefaultHeader()) {
      <div class="rail-header" [class.position-end]="railPosition() === 'end'" matRipple (click)="toggleExpanded()">
        @if (expanded() && hasBranding() && railPosition() === 'end') {
          <ng-container [ngTemplateOutlet]="customBranding() ? customBrandingTpl : defaultBrandingTpl" />
        }
        <div class="rail-burger" [class.expanded]="expanded()" [class.position-end]="railPosition() === 'end'">
          <svg class="icon-menu" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
          <svg class="icon-menu-open" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M120-240v-80h520v80H120Zm664-40L584-480l200-200 56 56-144 144 144 144-56 56ZM120-440v-80h400v80H120Zm0-200v-80h520v80H120Z"/>
          </svg>
        </div>
        @if (expanded() && hasBranding() && railPosition() === 'start') {
          <ng-container [ngTemplateOutlet]="customBranding() ? customBrandingTpl : defaultBrandingTpl" />
        }
      </div>
    }
    <nav class="rail-items">
      <ng-content />
    </nav>
  `,
  styles: [`
    /* Selectors are scoped to \`:host(.mat-drawer)\` (not bare \`:host\`) on
       purpose. The host carries Material's \`mat-drawer mat-sidenav\` classes, and
       Material's base \`.mat-drawer { width: 360px; background: ...surface }\`
       rule has the SAME specificity as a bare \`:host\` — so the rail would only
       win by stylesheet insertion order. The moment a consumer renders another
       MatDrawer/MatSidenav (e.g. a nested mat-drawer-container in routed
       content), Angular appends Material's sidenav styles AFTER the rail's, the
       tie flips, and the rail adopts Material's defaults (360px wide, surface
       background) — overlapping the content. \`:host(.mat-drawer)\` is one class
       more specific, so the rail wins deterministically regardless of order. */
    :host(.mat-drawer) {
      /* flex column so .rail-items can stretch (flex: 1) and */
      /* rail-nav-spacer inside it can push siblings to the bottom. */
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      width: var(--rail-nav-collapsed-width, 72px);
      border: none !important;
      outline: none !important;
      box-shadow: none;
      background: var(--rail-nav-surface-color, var(--mat-sys-surface));
      transition: width 0.2s ease;
      overflow: visible;

      /* Collapsed default: rail items show their label-below (~20px) but */
      /* the next pill keeps its margin-top, so the inter-item gap is */
      /* asymmetric. Shift the separator down to recenter it visually. */
      --rail-nav-separator-shift: 12px;
    }

    :host(.mat-drawer.expanded) {
      width: var(--rail-nav-expanded-width, fit-content);
      box-shadow: 4px 0 8px rgba(0,0,0,.2);
      /* Expanded mode has no label-below, items are flush. No shift needed. */
      --rail-nav-separator-shift: 0;
    }

    :host(.mat-drawer.position-end) {
      left: auto;
      right: 0;
    }

    :host(.mat-drawer.position-end.expanded) {
      box-shadow: -4px 0 8px rgba(0,0,0,.2);
    }

    .rail-header {
      display: flex;
      align-items: center;
      gap: 12px;
      height: var(--rail-nav-header-height, 64px);
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

    .rail-items {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      /* Symmetric vertical padding so the last item (typically Settings */
      /* anchored via <rail-nav-spacer/>) breathes against the rail edge. */
      padding: 12px;
      gap: 0;
      box-sizing: border-box;
      width: 100%;
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
    '[class.position-end]': 'railPosition() === "end"'
  },
  providers: [RailnavDrawerOrchestrator]
})
export class RailnavComponent extends MatSidenav {
  /** Position: 'start' (left) or 'end' (right) - aliased to avoid conflict with MatSidenav.position */
  readonly railPosition = input<'start' | 'end'>('start', { alias: 'position' });

  /** Hide the default header (burger + title/subtitle) */
  readonly hideDefaultHeader = input(false);

  /** Title displayed when expanded (ignored if railNavBranding is projected) */
  readonly title = input<string>();

  /** Subtitle displayed when expanded (ignored if railNavBranding is projected) */
  readonly subtitle = input<string>();

  /** Whether to auto-collapse when an item is clicked */
  readonly autoCollapse = input(true);

  /** Whether the rail is expanded to show labels */
  readonly expanded = signal(false);

  /** Detect custom branding content projection */
  protected readonly customBranding = contentChild(RailnavBrandingDirective);

  /** Whether there's any branding to show (custom or default) */
  protected readonly hasBranding = computed(() =>
    !!this.customBranding() || !!this.title() || !!this.subtitle()
  );

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
