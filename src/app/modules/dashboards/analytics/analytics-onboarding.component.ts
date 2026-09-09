import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";
import { Subject, takeUntil } from "rxjs";
import {
	AnalyticsOnboardingProgress,
	AnalyticsOnboardingService,
	AnalyticsOnboardingStep,
} from "./analytics-onboarding.service";

@Component({
	selector: "analytics-onboarding",
	standalone: true,
	imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, TranslocoModule],
	templateUrl: "./analytics-onboarding.component.html",
	styleUrls: ["./analytics-onboarding.component.scss"],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsOnboardingComponent implements OnInit, OnDestroy {
	progress: AnalyticsOnboardingProgress | null = null;

	private _destroy$ = new Subject<void>();

	constructor(
		private _onboardingService: AnalyticsOnboardingService,
		private _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this._onboardingService.progress$.pipe(takeUntil(this._destroy$)).subscribe((progress) => {
			this.progress = progress;
			this._cdr.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	get progressPercent(): number {
		if (!this.progress?.totalRequired) return 0;
		return Math.round((this.progress.completedRequiredCount / this.progress.totalRequired) * 100);
	}

	trackByStepId(_index: number, step: AnalyticsOnboardingStep): string {
		return step.id;
	}
}
