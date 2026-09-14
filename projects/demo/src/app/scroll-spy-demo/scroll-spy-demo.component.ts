import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RailnavComponent, RailnavContainerComponent, RailnavContentComponent, RailnavItemComponent } from "@softwarity/rail-nav";

/** Demo of the scroll-spy: items point at sections of the content with `anchor`. The item of the
 * section in view turns active as the content scrolls, and a click scrolls to its section — the
 * host keeps no `active` state. `scrollOffset` clears the sticky bar; the last section is short on
 * purpose, to show it still gets its turn once the content reaches the bottom. */
@Component({
  selector: "scroll-spy-demo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatToolbarModule, RailnavComponent, RailnavContainerComponent, RailnavContentComponent, RailnavItemComponent],
  templateUrl: "./scroll-spy-demo.component.html",
  styleUrl: "./scroll-spy-demo.component.scss",
})
export class ScrollSpyDemoComponent {
  protected readonly sections = [
    { id: "spy-overview", label: "Overview", icon: "dashboard" },
    { id: "spy-palette", label: "Palette", icon: "palette" },
    { id: "spy-forms", label: "Forms", icon: "edit_note" },
    { id: "spy-data", label: "Data", icon: "table_rows" },
    { id: "spy-credits", label: "Credits", icon: "favorite" },
  ];
}
