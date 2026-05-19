import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Flexible spacer between rail items. Placed between two groups of items, it
 * pushes everything after it to the bottom of the rail — the classic pattern
 * for keeping primary nav at the top and secondary entries (Settings,
 * Profile…) anchored at the bottom.
 *
 *   <rail-nav>
 *     <rail-nav-item label="Home">...</rail-nav-item>
 *     <rail-nav-item label="Inbox">...</rail-nav-item>
 *     <rail-nav-spacer />
 *     <rail-nav-item label="Settings">...</rail-nav-item>
 *   </rail-nav>
 *
 * Requires the rail to own its full height (already the case by default).
 */
@Component({
  selector: 'rail-nav-spacer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styles: [`
    :host {
      display: block;
      flex: 1 1 auto;
    }
  `],
})
export class RailnavSpacerComponent {}
