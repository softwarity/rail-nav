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

    /* Establish a stacking context on the content so that any high z-index
       inside it stays trapped BELOW the backdrop (z-index 99) and the rail
       (z-index 100). Without this, a CDK sticky table header — which gets an
       inline z-index:100 (StickyStyler top increment), up to ~112 when sticky
       on several edges — leaks into the root stacking context and renders ABOVE
       the backdrop, even though the rest of the table sits correctly underneath.

       Material's own \`.mat-drawer-content { position:relative; z-index:1 }\` would
       normally provide this context, but that rule (ViewEncapsulation.None) is
       only injected when a real MatSidenavContent is instantiated; this component
       subclasses it with its own decorator, so the rule never loads. We set it
       explicitly. \`:host(.mat-drawer-content)\` (specificity 0,2,0) deterministically
       beats Material's \`.mat-drawer-content\` (0,1,0) if it ever IS loaded (nested
       real MatDrawer), regardless of stylesheet order. */
    :host(.mat-drawer-content) {
      position: relative;
      z-index: 1;
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
