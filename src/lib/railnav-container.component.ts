import { Component, ContentChild, AfterContentInit, input } from '@angular/core';
import { MatSidenavContainer, MatDrawerContainer } from '@angular/material/sidenav';
import { RailnavComponent } from './railnav.component';

@Component({
  selector: 'rail-nav-container',
  template: `
    <ng-content />
    @if (showBackdrop()) {
      <div
        class="railnav-backdrop"
        [class.visible]="railnav?.expanded()"
        [class.position-end]="railnav?.railPosition() === 'end'"
        [style.left.px]="railnav?.railPosition() === 'start' ? railnav?.collapsedWidth() : 0"
        [style.right.px]="railnav?.railPosition() === 'end' ? railnav?.collapsedWidth() : 0"
        (click)="railnav?.collapse()">
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    .railnav-backdrop {
      position: absolute;
      top: 0;
      bottom: 0;
      background: var(--rail-nav-backdrop-color, rgba(0, 0, 0, 0.4));
      z-index: 99;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease-in-out;
    }

    .railnav-backdrop.visible {
      opacity: 1;
      pointer-events: auto;
    }
  `],
  host: {
    'class': 'mat-drawer-container mat-sidenav-container'
  },
  providers: [
    { provide: MatDrawerContainer, useExisting: RailnavContainerComponent }
  ]
})
export class RailnavContainerComponent extends MatSidenavContainer implements AfterContentInit {
  /** Whether to show backdrop when expanded */
  readonly showBackdrop = input(true);

  @ContentChild(RailnavComponent) railnav?: RailnavComponent;

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
  }
}
