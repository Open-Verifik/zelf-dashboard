import { Component, Inject } from "@angular/core";
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
		<div class="edit-modal">
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
				.modal-content {
					max-width: 500px;
					width: 100%;

					.modal-header {
						background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
						color: white;
						padding: 20px 24px;
						margin: -24px -24px 24px -24px;
						border-radius: 8px 8px 0 0;

						h2 {
							margin: 0;
							font-size: 20px;
							font-weight: 600;
						}
					}

					.form-container {
						padding: 24px;

						.tag-info {
							text-align: center;
							margin-bottom: 24px;
							padding: 16px;
							background: #f8fafc;
							border-radius: 8px;
							border: 1px solid #e2e8f0;

							.tag-name {
								font-size: 18px;
								font-weight: 600;
								color: #2d3748;
								margin: 0 0 8px 0;
							}

							.tag-description {
								color: #718096;
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
								background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
								border: 1px solid #e2e8f0;
								border-radius: 12px;
								padding: 20px;
								text-align: center;

								.cost-header {
									display: flex;
									align-items: center;
									justify-content: center;
									gap: 8px;
									margin-bottom: 12px;
									color: #374151;
									font-weight: 600;
									font-size: 16px;
								}

								.cost-amount {
									font-size: 32px;
									font-weight: 700;
									color: #1f2937;
									margin-bottom: 8px;
								}

								.cost-breakdown {
									color: #6b7280;
									font-size: 14px;
								}
							}
						}

						.warning-info {
							display: flex;
							align-items: flex-start;
							gap: 12px;
							padding: 16px;
							background: #fef3c7;
							border: 1px solid #fbbf24;
							border-radius: 8px;
							margin-top: 20px;

							mat-icon {
								color: #d97706;
								margin-top: 2px;
							}

							.warning-text {
								color: #92400e;
								font-size: 14px;
								line-height: 1.5;
							}
						}
					}

					.action-buttons {
						display: flex;
						justify-content: flex-end;
						gap: 12px;
						padding: 20px 24px;
						background: #f8fafc;
						margin: 0 -24px -24px -24px;
						border-radius: 0 0 8px 8px;

						.cancel-btn {
							color: #6b7280;
						}

						.confirm-btn {
							background: linear-gradient(135deg, #059669 0%, #047857 100%);
							color: white;

							&:disabled {
								background: #e5e7eb;
								color: #9ca3af;
							}
						}
					}
				}
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
		@Inject(MAT_DIALOG_DATA) public data: TagRecord
	) {
		this.parseCurrentExpiration();
		this.updateNewExpiration();
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
