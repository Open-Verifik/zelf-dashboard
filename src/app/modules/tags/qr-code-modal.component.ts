import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { TagRecord } from "./tags.component";

@Component({
	selector: "app-qr-code-modal",
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule],
	template: `
		<div class="qr-modal">
			<div class="modal-content">
				<div class="modal-header">
					<h2>QR Code Preview</h2>
				</div>
				<div class="modal-body">
					<div class="qr-container">
						<img [src]="data.url" [alt]="'QR Code for ' + data.name" class="qr-image" (error)="onImageError($event)" />
						<div class="qr-url">{{ data.url }}</div>
						<div class="mt-4 text-center">
							<p class="text-sm text-gray-600 mb-2">
								Tag: <strong>{{ data.name }}</strong>
							</p>
							<p class="text-xs text-gray-500">Click the image to open in new tab</p>
						</div>
					</div>
				</div>
				<div class="flex justify-end gap-3 p-6 bg-gray-50 -mx-6 -mb-6">
					<button mat-button (click)="openInNewTab()" class="text-blue-700">
						<mat-icon>open_in_new</mat-icon>
						Open in New Tab
					</button>
					<button mat-button (click)="copyToClipboard()" class="text-emerald-700">
						<mat-icon>content_copy</mat-icon>
						Copy URL
					</button>
					<button mat-button (click)="close()" class="text-gray-700">Close</button>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.qr-modal {
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

					.qr-container {
						display: flex;
						flex-direction: column;
						align-items: center;
						padding: 24px;

						.qr-image {
							width: 300px;
							height: 300px;
							border-radius: 12px;
							border: 2px solid #e2e8f0;
							margin-bottom: 20px;
							cursor: pointer;
							transition: all 0.2s ease-in-out;

							&:hover {
								transform: scale(1.02);
								border-color: #4299e1;
								box-shadow: 0 8px 25px rgba(66, 153, 225, 0.15);
							}
						}

						.qr-url {
							font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
							font-size: 12px;
							color: #4a5568;
							background: #f7fafc;
							padding: 12px 16px;
							border-radius: 8px;
							border: 1px solid #e2e8f0;
							word-break: break-all;
							max-width: 100%;
							text-align: center;
						}
					}
				}
			}
		`,
	],
})
export class QRCodeModalComponent {
	constructor(
		public dialogRef: MatDialogRef<QRCodeModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: TagRecord
	) {}

	onImageError(event: any): void {
		event.target.src =
			"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNS4xIDEwMCAxMDUgMTIwLjEgMTA1IDE0NUMxMDUgMTY5LjkgMTI1LjEgMTkwIDE1MCAxOTBDMTc0LjkgMTkwIDE5NSAxNjkuOSAxOTUgMTQ1QzE5NSAxMjAuMSAxNzQuOSAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxMzAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgNDAgNDAiIGZpbGw9Im5vbmUiPgo8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCAxMEMyNi4wNzExIDEwIDMxIDE0LjkyODkgMzEgMjFDMzEgMjcuMDcxMSAyNi4wNzExIDMyIDIwIDMyQzEzLjkyODkgMzIgOSAyNy4wNzExIDkgMjFDOSAxNC45Mjg5IDEzLjkyODkgMTAgMjAgMTBaIiBmaWxsPSIjMzc0MTUxIi8+Cjwvc3ZnPgo8L3N2Zz4K";
		event.target.alt = "QR Code not available";
	}

	openInNewTab(): void {
		window.open(this.data.url, "_blank");
	}

	async copyToClipboard(): Promise<void> {
		try {
			await navigator.clipboard.writeText(this.data.url);
			// You could add a toast notification here
			console.log("URL copied to clipboard");
		} catch (err) {
			console.error("Failed to copy URL: ", err);
		}
	}

	close(): void {
		this.dialogRef.close();
	}
}
