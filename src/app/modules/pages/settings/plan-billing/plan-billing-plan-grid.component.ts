import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";

/** Heading shown above the plan cards */
export type PlanBillingGridHeading = "select" | "upgrade" | "none";

@Component({
    selector: "plan-billing-plan-grid",
    templateUrl: "./plan-billing-plan-grid.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule, TranslocoModule],
})
export class PlanBillingPlanGridComponent {
    @Input({ required: true }) heading!: PlanBillingGridHeading;

    @Output() readonly cancelUpgrade = new EventEmitter<void>();

    onCancelUpgrade(): void {
        this.cancelUpgrade.emit();
    }
}
