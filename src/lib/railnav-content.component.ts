import { Component, input } from '@angular/core';
import { MatSidenavContent } from '@angular/material/sidenav';

@Component({
  selector: 'rail-nav-content',
  template: `<ng-content />`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
    }

    :host(.position-end) {
      margin-left: 0 !important;
    }
  `],
  host: {
    'class': 'mat-drawer-content mat-sidenav-content',
    '[class.position-end]': 'railPosition() === "end"',
    '[style.margin-left.px]': 'railPosition() === "start" ? collapsedWidth() : 0',
    '[style.margin-right.px]': 'railPosition() === "end" ? collapsedWidth() : 0'
  }
})
export class RailnavContentComponent extends MatSidenavContent {
  /** Width of the collapsed rail (must match RailnavComponent) */
  readonly collapsedWidth = input(72);

  /** Position of the rail: 'start' (left) or 'end' (right) */
  readonly railPosition = input<'start' | 'end'>('start');
}
