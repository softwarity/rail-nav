import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RailnavComponent, RailnavContainerComponent, RailnavContentComponent, RailnavItemComponent, RailnavSeparatorComponent, RailnavSpacerComponent } from "@softwarity/rail-nav";

/** Demo of the contextual drawer pattern: a rail item declares
 * `[for]="someTpl"` pointing to an `<ng-template>`, and the lib renders it in
 * a CDK overlay positioned next to the rail. Hover-intent, close timer, outside
 * tap to dismiss and mutual exclusion with the rail's expanded mode are all
 * handled by the library — the consumer just writes a trigger + a template. */
@Component({
  selector: "hover-drawer-demo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent,
    RailnavSeparatorComponent,
    RailnavSpacerComponent,
  ],
  templateUrl: "./hover-drawer-demo.component.html",
  styleUrl: "./hover-drawer-demo.component.scss",
})
export class HoverDrawerDemoComponent {
  /** Single nav cursor: only one item across all drawers can be "current". */
  protected readonly selected = signal<string | null>(null);

  protected readonly channels = ["# general", "# random", "# releases", "# support"];

  protected readonly recents = ["Quarterly report", "Design mockups", "Meeting notes"];
}
