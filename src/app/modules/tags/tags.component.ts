import { Component, ViewEncapsulation, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { QRCodeModalComponent } from "./qr-code-modal.component";
import { DetailsModalComponent } from "./details-modal.component";
import { EditModalComponent } from "./edit-modal.component";

// Interfaces
export interface TagRecord {
	id: string;
	name: string;
	cid: string;
	size: number;
	number_of_files: number;
	mime_type: string;
	group_id: string | null;
	created_at: string;
	url: string;
	publicData: {
		avaxName: string;
		btcAddress: string;
		domain: string;
		ethAddress: string;
		extraParams: string;
		solanaAddress: string;
	};
}

export interface TagsResponse {
	data: TagRecord[];
}

@Component({
	selector: "tags",
	standalone: true,
	templateUrl: "./tags.component.html",
	styleUrls: ["./tags.component.scss"],
	encapsulation: ViewEncapsulation.None,
	imports: [
		CommonModule,
		MatTableModule,
		MatButtonModule,
		MatIconModule,
		MatDialogModule,
		MatCardModule,
		MatChipsModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		FormsModule,
	],
})
export class TagsComponent implements OnInit {
	displayedColumns: string[] = ["name", "domain", "created_at", "size", "actions"];
	dataSource: TagRecord[] = [];

	// Pagination properties
	currentPage: number = 1;
	pageSize: number = 10;
	totalPages: number = 5;
	totalItems: number = 50;
	pageSizeOptions: number[] = [5, 10, 25, 50];
	visiblePages: (number | string)[] = [1, 2, 3, 4, 5];

	// Sample data - replace with actual API call
	sampleData: TagsResponse = {
		data: [
			{
				id: "019963ee-6545-7ee5-ba60-e628dd83ddfa",
				name: "demo3002.avax.hold",
				cid: "bafkreigvcfzyhylhbwg2v3ufeu3nbu3nvfgyolcampyeq5jvcl5qd342ye",
				size: 20342,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T21:43:12.202Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreigvcfzyhylhbwg2v3ufeu3nbu3nvfgyolcampyeq5jvcl5qd342ye",
				publicData: {
					avaxName: "demo3002.avax.hold",
					btcAddress: "bc1q6j9623dppusjwknxvgnkzff343f7qck2encnxx",
					domain: "avax",
					ethAddress: "0x79F92e243ce602fD01Df5dEDe654b680fD8d760D",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 16:43:11","expiresAt":"2025-10-19 16:43:11","suiAddress":"0x74d423aef5e8e81473f3529f1f5370bb7d9c846c0b8524c413c2019960e16bbb"}',
					solanaAddress: "25X9Hkk124EWfEp2XJcqwDEGuv7D2L2r8Mun7QMAFUWY",
				},
			},
			{
				id: "019963d1-df25-7ce0-99aa-e936323cb4f4",
				name: "demo3001.avax.hold",
				cid: "bafkreibgd3dmkjoovh3z2rh42z5xdfi5l4pbajbxe5mdajwmez3umito74",
				size: 20478,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T21:12:02.827Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreibgd3dmkjoovh3z2rh42z5xdfi5l4pbajbxe5mdajwmez3umito74",
				publicData: {
					avaxName: "demo3001.avax.hold",
					btcAddress: "bc1qu692kx9fha5hcp0k09vd6umuhhhvup0z9mdpep",
					domain: "avax",
					ethAddress: "0x2F659709fE249e0224D32BEBE11e113185e271EA",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 16:12:02","expiresAt":"2025-10-19 16:12:02","suiAddress":"0x9d77313cb2b04e85b0ffe84f83b23ab67ae52f7d91380e5f5882f74b780ff24b"}',
					solanaAddress: "DXT97q2GP5YduBS3xoTAbDqRvwB7VGSqhrGdrt6m19ha",
				},
			},
			{
				id: "019963bc-e039-7d38-81c5-60199886c806",
				name: "demo2008.avax.hold",
				cid: "bafkreidjkzjszoejgpzzjjnfegn3uyzkbpvw7tert4cooo7xxsgn6eb5ku",
				size: 20190,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T20:49:06.858Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreidjkzjszoejgpzzjjnfegn3uyzkbpvw7tert4cooo7xxsgn6eb5ku",
				publicData: {
					avaxName: "demo2008.avax.hold",
					btcAddress: "bc1q5l6g8ca2g4f3ksnh03jzh8fe6v4sujf5mgdz72",
					domain: "avax",
					ethAddress: "0x1953d3c4071d7cF9897e0c10DAE17B2bDBAbbF67",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 15:49:06","expiresAt":"2025-10-19 15:49:06","suiAddress":"0x5b8d824d417140187e665ba04b55a2f876b6763d18f5aaf91438bd0a737214a9"}',
					solanaAddress: "BZWy2dVUVgtm1V8UGgoNENJUYCxBNFLLaa3gCVKv88uq",
				},
			},
			{
				id: "019963b4-037d-75d6-ae23-3d464fc32ea9",
				name: "demo2007.avax.hold",
				cid: "bafkreih4m327hqs6te3jx54y4y35fibzbse7ha2lli6nvzxuiubreag3iu",
				size: 20402,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T20:39:26.035Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreih4m327hqs6te3jx54y4y35fibzbse7ha2lli6nvzxuiubreag3iu",
				publicData: {
					avaxName: "demo2007.avax.hold",
					btcAddress: "bc1qtdak02vs3kq8j6vgkgelpqj2t56604xnjhw6nq",
					domain: "avax",
					ethAddress: "0xC3aA467a35f786BDABA7E201EAFD36DDe2Ec0cd0",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 15:39:25","expiresAt":"2025-10-19 15:39:25","suiAddress":"0x6059af88ec97876f363ba77c2d044fe9f2bb6034e9d5764240398303889651e4"}',
					solanaAddress: "BLJW7afi5RjHPDS2WUMW1Dgarn3ZvwwZk9q7bzA3vrpt",
				},
			},
			{
				id: "01996317-2271-79d3-ae61-1bcd0b9f77cd",
				name: "demo2005.avax.hold",
				cid: "bafkreidddu7en7ygqs5pzmh7wi26qp35mxxxwcgyzecurc6ljpe23fvcym",
				size: 20327,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T17:48:05.112Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreidddu7en7ygqs5pzmh7wi26qp35mxxxwcgyzecurc6ljpe23fvcym",
				publicData: {
					avaxName: "demo2005.avax.hold",
					btcAddress: "bc1qcf33sp2nfsawt4fk60mw79ndv7780qntmykqe7",
					domain: "avax",
					ethAddress: "0x9D6e8Bd1d890084e1Fa1655c968877BcEf93f669",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 12:48:04","expiresAt":"2025-10-19 12:48:04","suiAddress":"0x643eb95b930af925165bdb5400d6af952f6905bfb432d067b335539576d83676"}',
					solanaAddress: "Cfn9YnkMUcsJjU7eYMhXSvqB3CvajZHwNjFiu3ukoUs8",
				},
			},
			{
				id: "01996301-24bf-7762-8a4d-bc006dd2d186",
				name: "demo2004.avax.hold",
				cid: "bafkreig4gmfqrftfimekcwy3gtjcxjrgalckkv5uasr6r4zf2kknt5nfam",
				size: 20510,
				number_of_files: 1,
				mime_type: "image/png",
				group_id: null,
				created_at: "2025-09-19T17:24:03.686Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreig4gmfqrftfimekcwy3gtjcxjrgalckkv5uasr6r4zf2kknt5nfam",
				publicData: {
					avaxName: "demo2004.avax.hold",
					btcAddress: "bc1qpt5jclyr28nhe6cy3hhzhcmmnpwyrrzpsx30s5",
					domain: "avax",
					ethAddress: "0x5cBCc9Ab5Fe5c74373745f80e387327f8645A26f",
					extraParams:
						'{"hasPassword":"true","type":"hold","origin":"online","registeredAt":"2025-09-19 12:24:02","expiresAt":"2025-10-19 12:24:02","suiAddress":"0xf0e989702723d5c626ea99ceca1271523f03a60bdc9aa9c97143a505127e370f"}',
					solanaAddress: "BmymNc6rZ2E2RfWhXAL36kkuH9wSVRtAvF2WU8rC6i2g",
				},
			},
			{
				id: "3f4341cd-5d21-4ef4-b513-58491dcd273c",
				name: "offline14.avax",
				cid: "bafkreicc7lz67muzrolmsbsgn4mttkcb4tn6myp6kpiv7m3vnuzlbwxbqq",
				size: 18126,
				number_of_files: 1,
				mime_type: "false",
				group_id: null,
				created_at: "2025-09-15T01:31:45.853Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreicc7lz67muzrolmsbsgn4mttkcb4tn6myp6kpiv7m3vnuzlbwxbqq",
				publicData: {
					avaxName: "offline14.avax",
					btcAddress: "bc1q4s3qsncsgv8e65lmhk2mhjmk07sj42f0dg6mf5",
					domain: "avax",
					ethAddress: "0x718550c3EB3d6a89C7577F255fB5e499E49c1594",
					extraParams:
						'{"origin":"online","price":0,"duration":1,"registeredAt":"2025-09-14 20:31:25","expiresAt":"2026-09-14 20:31:25","type":"mainnet","suiAddress":"0x171b345e00d2e814517f30464c2c2f6082d1def45c43ac7dc2ac7682bb37cd09","hasPassword":"true","referralTagName":"privacy.avax.hold","referralDomain":"avax","referralSolanaAddress":"Gguf316pNeD7H3thWUaywK2EtZKwVjLDyMfiVTFQhmNS","walrus":"H8zhqQo9Xdhj6n4nfNbWGGxsIYbHo9Utz1guQA9fWH8"}',
					solanaAddress: "BZCk4bj797CWbYRkP4EGPFV5THA3cGroYt4QqoWPq7Ld",
				},
			},
			{
				id: "4f4179d7-2d7e-4eec-a900-cefdbd1eda72",
				name: "offline13.avax.hold",
				cid: "bafkreicazvi7dfxnn2cqri5rhnsh34vtb2opirilgr5uk4nbwqjpr7yqt4",
				size: 18153,
				number_of_files: 1,
				mime_type: "false",
				group_id: null,
				created_at: "2025-09-15T01:31:10.723Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreicazvi7dfxnn2cqri5rhnsh34vtb2opirilgr5uk4nbwqjpr7yqt4",
				publicData: {
					avaxName: "offline13.avax.hold",
					btcAddress: "bc1qza56tsn6n972hvas5lqzykkf9e9wdqut03fgn7",
					domain: "avax",
					ethAddress: "0xAec553F62B3BbC36873045b57bF640183A74357B",
					extraParams:
						'{"hasPassword":"true","duration":1,"type":"hold","origin":"online","price":24,"registeredAt":"2025-09-14 20:31:10","expiresAt":"2025-10-14 20:31:10","suiAddress":"0x3bef1f8d8dacff855f1c96d73aaed1627ce8c0eef19ee43f10fc99c586ef126f"}',
					solanaAddress: "F2goJtiG9dGVpMfRNtZ9Zx1rbzEDNmVnifbCVYdM9poZ",
				},
			},
			{
				id: "e90002aa-abe8-4338-8c37-d3d66362a310",
				name: "offline11.avax.hold",
				cid: "bafkreic5mgckngf4q7p2jz3c2w4ln7uy63suan6pi7ydfuhjvjzlonkufm",
				size: 18252,
				number_of_files: 1,
				mime_type: "false",
				group_id: null,
				created_at: "2025-09-15T01:11:46.61Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreic5mgckngf4q7p2jz3c2w4ln7uy63suan6pi7ydfuhjvjzlonkufm",
				publicData: {
					avaxName: "offline11.avax.hold",
					btcAddress: "bc1qwzmvze884klaj0qs4rkpwscpmw605rvcr2d5pd",
					domain: "avax",
					ethAddress: "0xE655d07cfF2ceEA60fcA31A2180F31b475F78f8E",
					extraParams:
						'{"hasPassword":"true","duration":1,"type":"hold","origin":"offline","price":18,"registeredAt":"2025-09-14 20:11:46","expiresAt":"2025-10-14 20:11:46","suiAddress":"bc1qwzmvze884klaj0qs4rkpwscpmw605rvcr2d5pd","referralTagName":"security.avax.hold","referralSolanaAddress":"D5W9ELZSwu69ukQymcRk5hksdmqr7bqjxv1VnoNkMf6W"}',
					solanaAddress: "66Tuor2gAWs6hX9qHU8zTZVQ5FNcKb6WvWxfP5yM13h4",
				},
			},
			{
				id: "be24d973-1f04-4d16-ad55-5b34b32f8d50",
				name: "offline10.avax",
				cid: "bafkreifzoubss3qo5ekkg54pxdtrgtfli53kmlgjhxingbzqf2jjk5vxya",
				size: 18146,
				number_of_files: 1,
				mime_type: "false",
				group_id: null,
				created_at: "2025-09-15T00:06:34.458Z",
				url: "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreifzoubss3qo5ekkg54pxdtrgtfli53kmlgjhxingbzqf2jjk5vxya",
				publicData: {
					avaxName: "offline10.avax",
					btcAddress: "bc1q2l9fn0gjgfx8pprmkf26lvv00e9sxvhnda9qtu",
					domain: "avax",
					ethAddress: "0x203480BaD43336bE71597bF207c0744f204c70CD",
					extraParams:
						'{"origin":"offline","price":0,"duration":1,"registeredAt":"2025-09-14 19:06:07","expiresAt":"2026-09-14 19:06:07","type":"mainnet","hasPassword":"true","referralTagName":"privacy.avax.hold","referralDomain":"avax","referralSolanaAddress":"Gguf316pNeD7H3thWUaywK2EtZKwVjLDyMfiVTFQhmNS","walrus":"RHye-ZUcD2qx7kftD_UZ_Hi0FX0iKBL-tS80TzAZnG4"}',
					solanaAddress: "FQAM2XCocS1KY5sgsDVbsdAhEXnAdbMicHmZXBHzdyJV",
				},
			},
		],
	};

	constructor(private dialog: MatDialog) {}

	ngOnInit(): void {
		this.dataSource = this.sampleData.data;
		this.updateVisiblePages();
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

	canDelete(record: TagRecord): boolean {
		return record.name.includes(".hold");
	}

	openQRCodeModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(QRCodeModalComponent, {
			width: "500px",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				console.log("QR Code modal closed with result:", result);
			}
		});
	}

	openDetailsModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(DetailsModalComponent, {
			width: "700px",
			maxHeight: "80vh",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result === "openQR") {
				// Open QR code modal if requested from details modal
				this.openQRCodeModal(record);
			}
		});
	}

	openEditModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(EditModalComponent, {
			width: "500px",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				console.log("Edit modal closed with result:", result);
				// Here you would typically make an API call to extend the lease
				this.handleLeaseExtension(result);
			}
		});
	}

	private handleLeaseExtension(extensionData: any): void {
		// TODO: Implement actual API call to extend lease
		console.log("Extending lease:", extensionData);
		// You would typically:
		// 1. Make an API call to extend the lease
		// 2. Update the local data source
		// 3. Show a success/error message
		// 4. Refresh the table data
	}

	deleteRecord(record: TagRecord): void {
		if (!this.canDelete(record)) {
			console.warn("Cannot delete record - not a .hold tag");
			return;
		}

		// TODO: Implement confirmation dialog and delete functionality
		console.log("Deleting record:", record);
		// You would typically:
		// 1. Show a confirmation dialog
		// 2. Make an API call to delete the record
		// 3. Update the local data source
		// 4. Show a success/error message
	}

	// Pagination methods
	goToFirstPage(): void {
		this.currentPage = 1;
		this.updateVisiblePages();
		console.log("Going to first page");
	}

	goToPreviousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.updateVisiblePages();
			console.log("Going to previous page:", this.currentPage);
		}
	}

	goToNextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.updateVisiblePages();
			console.log("Going to next page:", this.currentPage);
		}
	}

	goToLastPage(): void {
		this.currentPage = this.totalPages;
		this.updateVisiblePages();
		console.log("Going to last page");
	}

	goToPage(page: number | string): void {
		if (typeof page === "number" && page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			this.updateVisiblePages();
			console.log("Going to page:", page);
		}
	}

	onPageSizeChange(): void {
		this.currentPage = 1;
		this.totalPages = Math.ceil(this.totalItems / this.pageSize);
		this.updateVisiblePages();
		console.log("Page size changed to:", this.pageSize);
	}

	private updateVisiblePages(): void {
		// Simple pagination logic - show first 5 pages or current page ± 2
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (this.totalPages <= maxVisible) {
			// Show all pages if total is less than max visible
			for (let i = 1; i <= this.totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show ellipsis logic
			if (this.currentPage <= 3) {
				// Show first 4 pages + ellipsis + last page
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(this.totalPages);
			} else if (this.currentPage >= this.totalPages - 2) {
				// Show first page + ellipsis + last 4 pages
				pages.push(1);
				pages.push("...");
				for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
					pages.push(i);
				}
			} else {
				// Show first + ellipsis + current-1, current, current+1 + ellipsis + last
				pages.push(1);
				pages.push("...");
				for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(this.totalPages);
			}
		}

		this.visiblePages = pages;
	}

	getStartItem(): number {
		return (this.currentPage - 1) * this.pageSize + 1;
	}

	getEndItem(): number {
		const end = this.currentPage * this.pageSize;
		return Math.min(end, this.totalItems);
	}
}
