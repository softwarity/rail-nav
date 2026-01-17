import { Component, input, inject, computed } from '@angular/core';
import { MatSidenavContent } from '@angular/material/sidenav';
import { RailnavContainerComponent } from './railnav-container.component';

@Component({
  selector: 'rail-nav-content',
  template: `<ng-content />`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      margin-left: var(--rail-nav-collapsed-width, 72px);
    }

    :host(.position-end) {
      margin-left: 0;
      margin-right: var(--rail-nav-collapsed-width, 72px);
    }
  `],
  host: {
    'class': 'mat-drawer-content mat-sidenav-content',
    '[class.position-end]': 'effectivePosition() === "end"'
  }
})
export class RailnavContentComponent extends MatSidenavContent {
  /** Optional: Position of the rail. If not set, uses the sibling rail-nav's position */
  readonly position = input<'start' | 'end' | undefined>(undefined);

  /** Parent container that gives access to sibling rail-nav */
  private container = inject(RailnavContainerComponent, { optional: true });

  /** Effective position - from input or from sibling rail-nav */
  protected readonly effectivePosition = computed(() => {
    const inputValue = this.position();
    if (inputValue !== undefined) return inputValue;
    return this.container?.railnav?.railPosition() ?? 'start';
  });
}
