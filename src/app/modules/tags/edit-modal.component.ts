import { Component, Inject, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { TagRecord } from "./tags.component";

@Component({
	selector: "app-edit-modal",
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		FormsModule,
	],
	template: `
		<div class="edit-modal" [ngClass]="{ 'dark-mode': isDarkMode }">
			<div class="modal-content">
				<div class="modal-header">
					<h2>Extend Lease</h2>
				</div>
				<div class="modal-body">
					<div class="form-container">
						<div class="tag-info">
							<h3 class="tag-name">{{ data.name }}</h3>
							<p class="tag-description">Extend the lease duration for this tag</p>
						</div>

						<div class="form-field">
							<mat-form-field appearance="outline" class="years-input">
								<mat-label>Years to Add</mat-label>
								<mat-select [(ngModel)]="selectedYears" name="years" (selectionChange)="onYearsChange()">
									<mat-option *ngFor="let year of yearOptions" [value]="year">
										{{ year }} {{ year === 1 ? "Year" : "Years" }}
									</mat-option>
								</mat-select>
							</mat-form-field>
						</div>

						<div class="form-field">
							<mat-form-field appearance="outline">
								<mat-label>Current Expiration</mat-label>
								<input matInput [value]="currentExpiration" readonly />
							</mat-form-field>
						</div>

						<div class="form-field">
							<mat-form-field appearance="outline">
								<mat-label>New Expiration</mat-label>
								<input matInput [value]="newExpiration" readonly />
							</mat-form-field>
						</div>

						<div class="cost-info" *ngIf="selectedYears">
							<div class="cost-card">
								<div class="cost-header">
									<mat-icon>attach_money</mat-icon>
									<span>Estimated Cost</span>
								</div>
								<div class="cost-amount">\${{ calculateCost() }}</div>
								<div class="cost-breakdown">
									{{ selectedYears }} {{ selectedYears === 1 ? "year" : "years" }} × \${{ costPerYear }}/year
								</div>
							</div>
						</div>

						<div class="warning-info">
							<mat-icon>info</mat-icon>
							<div class="warning-text">
								<strong>Important:</strong> This action will extend the lease for your tag. The cost will be calculated based on the
								current pricing and the selected duration.
							</div>
						</div>
					</div>
				</div>
				<div class="action-buttons">
					<button mat-button (click)="close()" class="cancel-btn">Cancel</button>
					<button mat-raised-button (click)="confirmExtension()" [disabled]="!selectedYears" class="confirm-btn">
						<mat-icon>check</mat-icon>
						Extend Lease
					</button>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.edit-modal {
				--modal-bg: #ffffff;
				--modal-text: #1f2937;
				--modal-header-bg: #f1f5f9;
				--modal-header-text: #1f2937;
				--modal-footer-bg: #f8fafc;
				--modal-card-bg: #f8fafc;
				--modal-secondary-text: #6b7280;
				--modal-border: #e2e8f0;

				&.dark-mode {
					--modal-bg: #1e293b;
					--modal-text: #f1f5f9;
					--modal-header-bg: #334155;
					--modal-header-text: #f1f5f9;
					--modal-footer-bg: #334155;
					--modal-card-bg: #334155;
					--modal-secondary-text: #94a3b8;
					--modal-border: #475569;
				}

				.modal-content {
					max-width: 500px;
					width: 100%;
					background: var(--modal-bg);
					color: var(--modal-text);

					.modal-header {
						background: var(--modal-header-bg);
						color: var(--modal-header-text);
						padding: 20px 24px;
						margin: -24px -24px 24px -24px;
						border-radius: 8px 8px 0 0;
						border-bottom: 2px solid var(--modal-border);

						h2 {
							margin: 0;
							font-size: 20px;
							font-weight: 600;
							color: var(--modal-header-text);
						}
					}

					.modal-body {
						background: var(--modal-bg);
						color: var(--modal-text);
					}

					.form-container {
						padding: 24px;

						.tag-info {
							text-align: center;
							margin-bottom: 24px;
							padding: 16px;
							background: var(--modal-card-bg);
							border-radius: 8px;
							border: 1px solid var(--modal-border);

							.tag-name {
								font-size: 18px;
								font-weight: 600;
								color: var(--modal-text);
								margin: 0 0 8px 0;
							}

							.tag-description {
								color: var(--modal-secondary-text);
								font-size: 14px;
								margin: 0;
							}
						}

						.form-field {
							margin-bottom: 20px;

							.mat-mdc-form-field {
								width: 100%;
							}

							&.years-input {
								.mat-mdc-form-field {
									width: 200px;
								}
							}
						}

						.cost-info {
							margin: 24px 0;

							.cost-card {
								background: var(--fuse-accent-50);
								border: 1px solid var(--fuse-border);
								border-radius: 12px;
								padding: 20px;
								text-align: center;

								.cost-header {
									display: flex;
									align-items: center;
									justify-content: center;
									gap: 8px;
									margin-bottom: 12px;
									color: var(--fuse-text);
									font-weight: 600;
									font-size: 16px;
								}

								.cost-amount {
									font-size: 32px;
									font-weight: 700;
									color: var(--fuse-text);
									margin-bottom: 8px;
								}

								.cost-breakdown {
									color: var(--fuse-text-secondary);
									font-size: 14px;
								}
							}
						}

						.warning-info {
							display: flex;
							align-items: flex-start;
							gap: 12px;
							padding: 16px;
							background: var(--fuse-warn-50);
							border: 1px solid var(--fuse-warn);
							border-radius: 8px;
							margin-top: 20px;

							mat-icon {
								color: var(--fuse-warn);
								margin-top: 2px;
							}

							.warning-text {
								color: var(--fuse-text);
								font-size: 14px;
								line-height: 1.5;

								strong {
									color: var(--fuse-warn);
								}
							}
						}
					}

					.action-buttons {
						display: flex;
						justify-content: flex-end;
						gap: 12px;
						padding: 20px 24px;
						background: var(--fuse-accent-50);
						margin: 0 -24px -24px -24px;
						border-radius: 0 0 8px 8px;
						border-top: 1px solid var(--fuse-border);

						.cancel-btn {
							color: var(--fuse-text);
							border: 1px solid var(--fuse-border);
							background: transparent;
							font-weight: 500;
							opacity: 0.8;

							&:hover {
								opacity: 1;
								background: var(--fuse-accent-100);
							}
						}

						.confirm-btn {
							background: var(--fuse-success);
							color: var(--fuse-on-success);
							font-weight: 500;

							&:hover {
								background: var(--fuse-success-600);
							}

							&:disabled {
								background: var(--fuse-accent-200);
								color: var(--fuse-text-secondary);
								opacity: 0.6;
							}
						}
					}
				}
			}

			// Dark mode specific overrides
			::ng-deep .dark .edit-modal,
			::ng-deep body.dark .edit-modal {
				.modal-content {
					background: var(--fuse-card, #1e293b);
					color: var(--fuse-text, #f1f5f9);

					.modal-header {
						background: var(--fuse-accent-100, #334155);
						color: var(--fuse-text, #f1f5f9);

						h2 {
							color: var(--fuse-text, #f1f5f9);
						}
					}

					.modal-body {
						background: var(--fuse-card, #1e293b);
						color: var(--fuse-text, #f1f5f9);
					}

					.form-container {
						.tag-info {
							background: var(--fuse-accent-50, #334155);
							border-color: var(--fuse-border, #475569);

							.tag-name {
								color: var(--fuse-text, #f1f5f9);
							}

							.tag-description {
								color: var(--fuse-text-secondary, #94a3b8);
							}
						}

						.cost-info {
							.cost-card {
								background: var(--fuse-accent-50, #334155);
								border-color: var(--fuse-border, #475569);

								.cost-header {
									color: var(--fuse-text, #f1f5f9);
								}

								.cost-amount {
									color: var(--fuse-text, #f1f5f9);
								}

								.cost-breakdown {
									color: var(--fuse-text-secondary, #94a3b8);
								}
							}
						}

						.warning-info {
							background: var(--fuse-warn-50, rgba(251, 191, 36, 0.1));
							border-color: var(--fuse-warn, #fbbf24);

							mat-icon {
								color: var(--fuse-warn, #fbbf24);
							}

							.warning-text {
								color: var(--fuse-text, #f1f5f9);

								strong {
									color: var(--fuse-warn, #fbbf24);
								}
							}
						}
					}

					.action-buttons {
						background: var(--fuse-accent-50, #334155);
						border-top-color: var(--fuse-border, #475569);

						.cancel-btn {
							color: var(--fuse-text, #f1f5f9);
							border-color: var(--fuse-border, #475569);
						}

						.confirm-btn {
							background: var(--fuse-success, #34d399);
							color: var(--fuse-on-success, #0f172a);
						}
					}
				}
			}
		`,

		// Global dark mode overrides for dialog overlay
		`
			html.dark .cdk-overlay-container .edit-modal .modal-content,
			body.dark .cdk-overlay-container .edit-modal .modal-content,
			html.dark .mat-mdc-dialog-container .edit-modal .modal-content,
			body.dark .mat-mdc-dialog-container .edit-modal .modal-content {
				background: #1e293b !important;
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .modal-header,
			body.dark .cdk-overlay-container .edit-modal .modal-header {
				background: #334155 !important;
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .modal-header h2,
			body.dark .cdk-overlay-container .edit-modal .modal-header h2 {
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .tag-name,
			body.dark .cdk-overlay-container .edit-modal .tag-name {
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .tag-description,
			body.dark .cdk-overlay-container .edit-modal .tag-description {
				color: #94a3b8 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .cost-header,
			body.dark .cdk-overlay-container .edit-modal .cost-header {
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .cost-amount,
			body.dark .cdk-overlay-container .edit-modal .cost-amount {
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .cost-breakdown,
			body.dark .cdk-overlay-container .edit-modal .cost-breakdown {
				color: #94a3b8 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .warning-text,
			body.dark .cdk-overlay-container .edit-modal .warning-text {
				color: #f1f5f9 !important;
			}

			html.dark .cdk-overlay-container .edit-modal .cancel-btn,
			body.dark .cdk-overlay-container .edit-modal .cancel-btn {
				color: #f1f5f9 !important;
			}
		`,
	],
})
export class EditModalComponent {
	selectedYears: number = 1;
	yearOptions: number[] = [1, 2, 3, 4, 5, 10];
	costPerYear: number = 24; // This should come from your pricing configuration
	currentExpiration: string = "";
	newExpiration: string = "";

	constructor(
		public dialogRef: MatDialogRef<EditModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: TagRecord,
		private _cdr: ChangeDetectorRef
	) {
		this.parseCurrentExpiration();
		this.updateNewExpiration();
		this._checkDarkMode();
		this._watchDarkMode();
	}

	isDarkMode: boolean = false;

	private _checkDarkMode(): void {
		this.isDarkMode = document.body.classList.contains("dark") || document.documentElement.classList.contains("dark");
		this._cdr.markForCheck();
	}

	private _watchDarkMode(): void {
		const observer = new MutationObserver(() => {
			this._checkDarkMode();
		});

		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["class"],
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	private parseCurrentExpiration(): void {
		try {
			const extraParams = JSON.parse(this.data.publicData.extraParams);
			if (extraParams.expiresAt) {
				this.currentExpiration = new Date(extraParams.expiresAt).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			} else {
				this.currentExpiration = "Not available";
			}
		} catch (error) {
			this.currentExpiration = "Not available";
		}
	}

	updateNewExpiration(): void {
		if (this.selectedYears) {
			try {
				const extraParams = JSON.parse(this.data.publicData.extraParams);
				if (extraParams.expiresAt) {
					const currentDate = new Date(extraParams.expiresAt);
					const newDate = new Date(currentDate);
					newDate.setFullYear(newDate.getFullYear() + this.selectedYears);

					this.newExpiration = newDate.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					});
				} else {
					this.newExpiration = "Not available";
				}
			} catch (error) {
				this.newExpiration = "Not available";
			}
		}
	}

	onYearsChange(): void {
		this.updateNewExpiration();
	}

	calculateCost(): number {
		return this.selectedYears * this.costPerYear;
	}

	confirmExtension(): void {
		if (this.selectedYears) {
			const result = {
				tagId: this.data.id,
				yearsToAdd: this.selectedYears,
				newExpiration: this.newExpiration,
				cost: this.calculateCost(),
			};
			this.dialogRef.close(result);
		}
	}

	close(): void {
		this.dialogRef.close();
	}
}
