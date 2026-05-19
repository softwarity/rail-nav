import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Visual separator between groups of `<rail-nav-item>`. Renders a thin
 * horizontal rule with sensible margins so groups of items breathe.
 *
 *   <rail-nav>
 *     <rail-nav-item label="Home">...</rail-nav-item>
 *     <rail-nav-item label="Search">...</rail-nav-item>
 *     <rail-nav-separator />
 *     <rail-nav-item label="Trash">...</rail-nav-item>
 *   </rail-nav>
 *
 * Color overridable via `--rail-nav-separator-color`.
 */
@Component({
  selector: 'rail-nav-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styles: [`
    /* Fixed-height host with the 1px line centered via flex. */
    /* The parent rail sets --rail-nav-separator-shift to recenter the */
    /* line visually between items (label-below in collapsed mode makes */
    /* the inter-item gap asymmetric without this). */
    :host {
      display: flex;
      align-items: center;
      height: 20px;
      padding: 0 12px;
      margin-top: var(--rail-nav-separator-shift, 0);
      box-sizing: border-box;
      transition: margin-top 0.2s ease;
    }
    :host::before {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--rail-nav-separator-color, var(--mat-sys-outline-variant));
    }
  `],
})
export class RailnavSeparatorComponent {}
