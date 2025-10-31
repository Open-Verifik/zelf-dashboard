import { Overlay } from "@angular/cdk/overlay";
import { NgClass, NgTemplateOutlet } from "@angular/common";
// Removed HttpClient usage for local suggestion-only behavior
import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation,
	inject,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from "@angular/forms";
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocomplete, MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations/public-api";
import { Subject, debounceTime, filter, map, takeUntil } from "rxjs";

@Component({
	selector: "search",
	templateUrl: "./search.component.html",
	encapsulation: ViewEncapsulation.None,
	exportAs: "fuseSearch",
	animations: fuseAnimations,
	imports: [
		MatButtonModule,
		MatIconModule,
		FormsModule,
		MatAutocompleteModule,
		ReactiveFormsModule,
		MatOptionModule,
		RouterLink,
		NgTemplateOutlet,
		MatFormFieldModule,
		MatInputModule,
		NgClass,
	],
	providers: [
		{
			provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
			useFactory: () => {
				const overlay = inject(Overlay);
				return () => overlay.scrollStrategies.block();
			},
		},
	],
})
export class SearchComponent implements OnChanges, OnInit, OnDestroy {
	@Input() appearance: "basic" | "bar" = "basic";
	@Input() debounce: number = 300;
	@Input() minLength: number = 2;
	@Output() search: EventEmitter<any> = new EventEmitter<any>();

	opened: boolean = false;
	resultSets: any[];
	searchControl: UntypedFormControl = new UntypedFormControl();
	private _matAutocomplete: MatAutocomplete;
	private _unsubscribeAll: Subject<any> = new Subject<any>();

	/**
	 * Constructor
	 */
	constructor(
		private _elementRef: ElementRef,
		private _renderer2: Renderer2,
		private _router: Router
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Host binding for component classes
	 */
	@HostBinding("class") get classList(): any {
		return {
			"search-appearance-bar": this.appearance === "bar",
			"search-appearance-basic": this.appearance === "basic",
			"search-opened": this.opened,
		};
	}

	/**
	 * Setter for bar search input
	 *
	 * @param value
	 */
	@ViewChild("barSearchInput")
	set barSearchInput(value: ElementRef) {
		// If the value exists, it means that the search input
		// is now in the DOM, and we can focus on the input..
		if (value) {
			// Give Angular time to complete the change detection cycle
			setTimeout(() => {
				// Focus to the input element
				value.nativeElement.focus();
			});
		}
	}

	/**
	 * Setter for mat-autocomplete element reference
	 *
	 * @param value
	 */
	@ViewChild("matAutocomplete")
	set matAutocomplete(value: MatAutocomplete) {
		this._matAutocomplete = value;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On changes
	 *
	 * @param changes
	 */
	ngOnChanges(changes: SimpleChanges): void {
		// Appearance
		if ("appearance" in changes) {
			// To prevent any issues, close the
			// search after changing the appearance
			this.close();
		}
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Subscribe to the search field value changes
		this.searchControl.valueChanges
			.pipe(
				debounceTime(this.debounce),
				takeUntil(this._unsubscribeAll),
				map((value) => {
					// Set the resultSets to null if there is no value or
					// the length of the value is smaller than the minLength
					// so the autocomplete panel can be closed
					if (!value || value.length < this.minLength) {
						this.resultSets = null;
					}

					// Continue
					return value;
				}),
				// Filter out undefined/null/false statements and also
				// filter out the values that are smaller than minLength
				filter((value) => value && value.length >= this.minLength)
			)
			.subscribe((value: string) => {
				const raw = (value || "").toString().trim();
				if (!raw) {
					this.resultSets = [];
					return;
				}

				let tagname = raw;
				let domain = "zelf";
				const lastDot = raw.lastIndexOf(".");
				if (lastDot > 0 && lastDot < raw.length - 1) {
					tagname = raw.substring(0, lastDot);
					domain = raw.substring(lastDot + 1);
				}

				const link = `/portfolio/payment?tagname=${encodeURIComponent(tagname)}&domain=${encodeURIComponent(domain)}`;

				this.resultSets = [
					{
						id: "pages",
						label: "Search",
						results: [
							{
								title: `Search ${tagname}.${domain}`,
								link,
								value: `${tagname}.${domain}`,
							},
						],
					},
				];

				this.search.next(this.resultSets);
			});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next(null);
		this._unsubscribeAll.complete();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On keydown of the search input
	 *
	 * @param event
	 */
	onKeydown(event: KeyboardEvent): void {
		// Escape
		if (event.code === "Escape") {
			// If the appearance is 'bar' and the mat-autocomplete is not open, close the search
			if (this.appearance === "bar" && !this._matAutocomplete.isOpen) {
				this.close();
			}
		}

		// Enter submits a tag search and navigates to /portfolio/payment
		if (event.code === "Enter" || event.key === "Enter") {
			const raw: string = (this.searchControl.value || "").toString().trim();
			if (!raw) {
				return;
			}

			// Parse input: default to .zelf if no domain provided
			let tagname = raw;
			let domain = "zelf";
			const lastDot = raw.lastIndexOf(".");
			if (lastDot > 0 && lastDot < raw.length - 1) {
				tagname = raw.substring(0, lastDot);
				domain = raw.substring(lastDot + 1);
			}

			// Navigate with query params used by payment.component.ts
			this._router.navigate(["/portfolio/payment"], {
				queryParams: {
					tagname,
					domain,
				},
			});

			// Close search bar after navigating
			if (this.appearance === "bar") {
				this.close();
			}
		}
	}

	/**
	 * Open the search
	 * Used in 'bar'
	 */
	open(): void {
		// Return if it's already opened
		if (this.opened) {
			return;
		}

		// Open the search
		this.opened = true;
	}

	/**
	 * Close the search
	 * * Used in 'bar'
	 */
	close(): void {
		// Return if it's already closed
		if (!this.opened) {
			return;
		}

		// Clear the search input
		this.searchControl.setValue("");

		// Close the search
		this.opened = false;
	}

	/**
	 * Track by function for ngFor loops
	 *
	 * @param index
	 * @param item
	 */
	trackByFn(index: number, item: any): any {
		return item.id || index;
	}
}
