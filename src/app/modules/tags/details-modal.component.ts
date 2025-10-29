import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { TagRecord } from "./tags.component";

@Component({
	selector: "app-details-modal",
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
	template: `
		<div class="details-modal">
			<div class="modal-content">
				<div class="modal-header">
					<h2>Tag Details</h2>
				</div>
				<div class="modal-body">
					<div class="detail-section">
						<h3 class="section-title">Basic Information</h3>
						<div class="detail-item">
							<span class="label">Tag Name</span>
							<span class="value">{{ data.name }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Domain</span>
							<span class="domain-chip">{{ data.publicData.domain }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Created At</span>
							<span class="value">{{ formatDate(data.created_at) }}</span>
						</div>
						<div class="detail-item">
							<span class="label">File Size</span>
							<span class="value">{{ formatFileSize(data.size) }}</span>
						</div>
						<div class="detail-item">
							<span class="label">MIME Type</span>
							<span class="value">{{ data.mime_type }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Number of Files</span>
							<span class="value">{{ data.number_of_files }}</span>
						</div>
					</div>

					<div class="detail-section">
						<h3 class="section-title">Blockchain Addresses</h3>
						<div class="detail-item">
							<span class="label">Bitcoin Address</span>
							<span class="address-value">{{ data.publicData.btcAddress }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Ethereum Address</span>
							<span class="address-value">{{ data.publicData.ethAddress }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Solana Address</span>
							<span class="address-value">{{ data.publicData.solanaAddress }}</span>
						</div>
					</div>

					<div class="detail-section">
						<h3 class="section-title">Additional Information</h3>
						<div class="detail-item">
							<span class="label">CID</span>
							<span class="address-value">{{ data.cid }}</span>
						</div>
						<div class="detail-item">
							<span class="label">IPFS URL</span>
							<span class="address-value">{{ data.url }}</span>
						</div>
						<div class="detail-item">
							<span class="label">Group ID</span>
							<span class="value">{{ data.group_id || "None" }}</span>
						</div>
					</div>

					<div class="detail-section" *ngIf="extraParams">
						<h3 class="section-title">Extra Parameters</h3>
						<div class="extra-params">
							<div class="param-item" *ngFor="let param of extraParams | keyvalue">
								<span class="param-label">{{ param.key }}</span>
								<span class="param-value">{{ param.value }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="flex justify-end gap-3 p-6 bg-gray-50 -mx-6 -mb-6">
					<button mat-button (click)="copyAllData()" class="text-blue-700">
						<mat-icon>content_copy</mat-icon>
						Copy All Data
					</button>
					<button mat-button (click)="openQRCode()" class="text-emerald-700">
						<mat-icon>qr_code</mat-icon>
						View QR Code
					</button>
					<button mat-button (click)="close()" class="text-gray-700">Close</button>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.details-modal {
				.modal-content {
					max-width: 700px;
					width: 100%;
					max-height: 80vh;
					overflow-y: auto;

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

					.modal-body {
						padding: 0 24px 24px 24px;
					}

					.detail-section {
						margin-bottom: 32px;

						.section-title {
							font-size: 18px;
							font-weight: 600;
							color: #2d3748;
							margin-bottom: 16px;
							padding-bottom: 8px;
							border-bottom: 2px solid #e2e8f0;
						}
					}

					.detail-item {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						padding: 12px 0;
						border-bottom: 1px solid #f1f5f9;

						&:last-child {
							border-bottom: none;
						}

						.label {
							font-weight: 600;
							color: #4a5568;
							font-size: 14px;
							min-width: 140px;
							flex-shrink: 0;
						}

						.value {
							color: #2d3748;
							font-size: 14px;
							word-break: break-all;
							text-align: right;
							flex: 1;
						}

						.domain-chip {
							background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
							color: white;
							font-size: 12px;
							font-weight: 500;
							padding: 4px 12px;
							border-radius: 16px;
							display: inline-block;
						}

						.address-value {
							font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
							font-size: 12px;
							background: #f7fafc;
							padding: 8px 12px;
							border-radius: 6px;
							border: 1px solid #e2e8f0;
							word-break: break-all;
							text-align: right;
							flex: 1;
						}
					}

					.extra-params {
						background: #f8fafc;
						border-radius: 8px;
						padding: 16px;
						border: 1px solid #e2e8f0;

						.param-item {
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding: 8px 0;
							border-bottom: 1px solid #e2e8f0;

							&:last-child {
								border-bottom: none;
							}

							.param-label {
								font-weight: 600;
								color: #4a5568;
								font-size: 13px;
								min-width: 120px;
							}

							.param-value {
								color: #2d3748;
								font-size: 13px;
								word-break: break-all;
								text-align: right;
								flex: 1;
							}
						}
					}
				}
			}
		`,
	],
})
export class DetailsModalComponent {
	extraParams: any = null;

	constructor(
		public dialogRef: MatDialogRef<DetailsModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: TagRecord
	) {
		this.parseExtraParams();
	}

	private parseExtraParams(): void {
		try {
			this.extraParams = JSON.parse(this.data.publicData.extraParams);
		} catch (error) {
			console.error("Error parsing extra params:", error);
			this.extraParams = null;
		}
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	async copyAllData(): Promise<void> {
		const dataString = JSON.stringify(this.data, null, 2);
		try {
			await navigator.clipboard.writeText(dataString);
		} catch (err) {
			console.error("Failed to copy data: ", err);
		}
	}

	openQRCode(): void {
		// Close this modal and open QR code modal
		this.dialogRef.close("openQR");
	}

	close(): void {
		this.dialogRef.close();
	}
}
