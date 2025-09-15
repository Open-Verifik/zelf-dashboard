import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from "@angular/core";
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../biometric-verification/biometric-verification.component";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "auth-sign-in",
	templateUrl: "./sign-in.component.html",
	encapsulation: ViewEncapsulation.None,
	animations: fuseAnimations,
	imports: [
		RouterLink,
		FuseAlertComponent,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatRadioModule,
		MatSelectModule,
		DataBiometricsComponent,
		TranslocoModule,
	],
})
export class AuthSignInComponent implements OnInit {
	@ViewChild("signInNgForm") signInNgForm: NgForm;
	@ViewChild("biometricVerification") biometricVerification: DataBiometricsComponent;

	alert: { type: FuseAlertType; message: string } = {
		type: "success",
		message: "",
	};
	signInForm: UntypedFormGroup;
	showAlert: boolean = false;
	showBiometricVerification: boolean = false;
	userData: any = {};

	// Language picker
	availableLanguages = [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "es", name: "Español", flag: "🇪🇸" },
		{ code: "fr", name: "Français", flag: "🇫🇷" },
		{ code: "zh", name: "中文", flag: "🇨🇳" },
		{ code: "ja", name: "日本語", flag: "🇯🇵" },
		{ code: "ko", name: "한국어", flag: "🇰🇷" },
	];
	currentLanguage = "en";

	// Country codes for phone number
	countryCodes = [
		{ code: "+1", country: "United States", flag: "🇺🇸" },
		{ code: "+1", country: "Canada", flag: "🇨🇦" },
		{ code: "+44", country: "United Kingdom", flag: "🇬🇧" },
		{ code: "+49", country: "Germany", flag: "🇩🇪" },
		{ code: "+33", country: "France", flag: "🇫🇷" },
		{ code: "+34", country: "Spain", flag: "🇪🇸" },
		{ code: "+39", country: "Italy", flag: "🇮🇹" },
		{ code: "+31", country: "Netherlands", flag: "🇳🇱" },
		{ code: "+32", country: "Belgium", flag: "🇧🇪" },
		{ code: "+41", country: "Switzerland", flag: "🇨🇭" },
		{ code: "+43", country: "Austria", flag: "🇦🇹" },
		{ code: "+45", country: "Denmark", flag: "🇩🇰" },
		{ code: "+46", country: "Sweden", flag: "🇸🇪" },
		{ code: "+47", country: "Norway", flag: "🇳🇴" },
		{ code: "+358", country: "Finland", flag: "🇫🇮" },
		{ code: "+86", country: "China", flag: "🇨🇳" },
		{ code: "+81", country: "Japan", flag: "🇯🇵" },
		{ code: "+82", country: "South Korea", flag: "🇰🇷" },
		{ code: "+91", country: "India", flag: "🇮🇳" },
		{ code: "+61", country: "Australia", flag: "🇦🇺" },
		{ code: "+55", country: "Brazil", flag: "🇧🇷" },
		{ code: "+52", country: "Mexico", flag: "🇲🇽" },
		{ code: "+54", country: "Argentina", flag: "🇦🇷" },
		{ code: "+56", country: "Chile", flag: "🇨🇱" },
		{ code: "+57", country: "Colombia", flag: "🇨🇴" },
		{ code: "+51", country: "Peru", flag: "🇵🇪" },
		{ code: "+58", country: "Venezuela", flag: "🇻🇪" },
		{ code: "+27", country: "South Africa", flag: "🇿🇦" },
		{ code: "+234", country: "Nigeria", flag: "🇳🇬" },
		{ code: "+20", country: "Egypt", flag: "🇪🇬" },
		{ code: "+971", country: "UAE", flag: "🇦🇪" },
		{ code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
		{ code: "+974", country: "Qatar", flag: "🇶🇦" },
		{ code: "+965", country: "Kuwait", flag: "🇰🇼" },
		{ code: "+973", country: "Bahrain", flag: "🇧🇭" },
		{ code: "+968", country: "Oman", flag: "🇴🇲" },
		{ code: "+7", country: "Russia", flag: "🇷🇺" },
		{ code: "+380", country: "Ukraine", flag: "🇺🇦" },
		{ code: "+48", country: "Poland", flag: "🇵🇱" },
		{ code: "+420", country: "Czech Republic", flag: "🇨🇿" },
		{ code: "+421", country: "Slovakia", flag: "🇸🇰" },
		{ code: "+36", country: "Hungary", flag: "🇭🇺" },
		{ code: "+40", country: "Romania", flag: "🇷🇴" },
		{ code: "+359", country: "Bulgaria", flag: "🇧🇬" },
		{ code: "+385", country: "Croatia", flag: "🇭🇷" },
		{ code: "+386", country: "Slovenia", flag: "🇸🇮" },
		{ code: "+381", country: "Serbia", flag: "🇷🇸" },
		{ code: "+382", country: "Montenegro", flag: "🇲🇪" },
		{ code: "+387", country: "Bosnia and Herzegovina", flag: "🇧🇦" },
		{ code: "+389", country: "North Macedonia", flag: "🇲🇰" },
		{ code: "+355", country: "Albania", flag: "🇦🇱" },
		{ code: "+383", country: "Kosovo", flag: "🇽🇰" },
		{ code: "+90", country: "Turkey", flag: "🇹🇷" },
		{ code: "+30", country: "Greece", flag: "🇬🇷" },
		{ code: "+357", country: "Cyprus", flag: "🇨🇾" },
		{ code: "+356", country: "Malta", flag: "🇲🇹" },
		{ code: "+353", country: "Ireland", flag: "🇮🇪" },
		{ code: "+351", country: "Portugal", flag: "🇵🇹" },
		{ code: "+64", country: "New Zealand", flag: "🇳🇿" },
		{ code: "+65", country: "Singapore", flag: "🇸🇬" },
		{ code: "+60", country: "Malaysia", flag: "🇲🇾" },
		{ code: "+66", country: "Thailand", flag: "🇹🇭" },
		{ code: "+63", country: "Philippines", flag: "🇵🇭" },
		{ code: "+62", country: "Indonesia", flag: "🇮🇩" },
		{ code: "+84", country: "Vietnam", flag: "🇻🇳" },
		{ code: "+855", country: "Cambodia", flag: "🇰🇭" },
		{ code: "+856", country: "Laos", flag: "🇱🇦" },
		{ code: "+95", country: "Myanmar", flag: "🇲🇲" },
		{ code: "+880", country: "Bangladesh", flag: "🇧🇩" },
		{ code: "+92", country: "Pakistan", flag: "🇵🇰" },
		{ code: "+93", country: "Afghanistan", flag: "🇦🇫" },
		{ code: "+98", country: "Iran", flag: "🇮🇷" },
		{ code: "+964", country: "Iraq", flag: "🇮🇶" },
		{ code: "+963", country: "Syria", flag: "🇸🇾" },
		{ code: "+961", country: "Lebanon", flag: "🇱🇧" },
		{ code: "+962", country: "Jordan", flag: "🇯🇴" },
		{ code: "+972", country: "Israel", flag: "🇮🇱" },
		{ code: "+970", country: "Palestine", flag: "🇵🇸" },
		{ code: "+218", country: "Libya", flag: "🇱🇾" },
		{ code: "+216", country: "Tunisia", flag: "🇹🇳" },
		{ code: "+213", country: "Algeria", flag: "🇩🇿" },
		{ code: "+212", country: "Morocco", flag: "🇲🇦" },
		{ code: "+221", country: "Senegal", flag: "🇸🇳" },
		{ code: "+233", country: "Ghana", flag: "🇬🇭" },
		{ code: "+254", country: "Kenya", flag: "🇰🇪" },
		{ code: "+256", country: "Uganda", flag: "🇺🇬" },
		{ code: "+250", country: "Rwanda", flag: "🇷🇼" },
		{ code: "+255", country: "Tanzania", flag: "🇹🇿" },
		{ code: "+260", country: "Zambia", flag: "🇿🇲" },
		{ code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
		{ code: "+267", country: "Botswana", flag: "🇧🇼" },
		{ code: "+268", country: "Swaziland", flag: "🇸🇿" },
		{ code: "+266", country: "Lesotho", flag: "🇱🇸" },
		{ code: "+264", country: "Namibia", flag: "🇳🇦" },
		{ code: "+265", country: "Malawi", flag: "🇲🇼" },
		{ code: "+258", country: "Mozambique", flag: "🇲🇿" },
		{ code: "+261", country: "Madagascar", flag: "🇲🇬" },
		{ code: "+262", country: "Reunion", flag: "🇷🇪" },
		{ code: "+230", country: "Mauritius", flag: "🇲🇺" },
		{ code: "+248", country: "Seychelles", flag: "🇸🇨" },
		{ code: "+269", country: "Comoros", flag: "🇰🇲" },
		{ code: "+290", country: "Saint Helena", flag: "🇸🇭" },
		{ code: "+291", country: "Eritrea", flag: "🇪🇷" },
		{ code: "+251", country: "Ethiopia", flag: "🇪🇹" },
		{ code: "+252", country: "Somalia", flag: "🇸🇴" },
		{ code: "+253", country: "Djibouti", flag: "🇩🇯" },
		{ code: "+249", country: "Sudan", flag: "🇸🇩" },
		{ code: "+211", country: "South Sudan", flag: "🇸🇸" },
		{ code: "+235", country: "Chad", flag: "🇹🇩" },
		{ code: "+236", country: "Central African Republic", flag: "🇨🇫" },
		{ code: "+237", country: "Cameroon", flag: "🇨🇲" },
		{ code: "+238", country: "Cape Verde", flag: "🇨🇻" },
		{ code: "+239", country: "Sao Tome and Principe", flag: "🇸🇹" },
		{ code: "+240", country: "Equatorial Guinea", flag: "🇬🇶" },
		{ code: "+241", country: "Gabon", flag: "🇬🇦" },
		{ code: "+242", country: "Republic of the Congo", flag: "🇨🇬" },
		{ code: "+243", country: "Democratic Republic of the Congo", flag: "🇨🇩" },
		{ code: "+244", country: "Angola", flag: "🇦🇴" },
		{ code: "+245", country: "Guinea-Bissau", flag: "🇬🇼" },
		{ code: "+246", country: "British Indian Ocean Territory", flag: "🇮🇴" },
		{ code: "+247", country: "Ascension Island", flag: "🇦🇨" },
		{ code: "+248", country: "Seychelles", flag: "🇸🇨" },
		{ code: "+249", country: "Sudan", flag: "🇸🇩" },
		{ code: "+250", country: "Rwanda", flag: "🇷🇼" },
		{ code: "+251", country: "Ethiopia", flag: "🇪🇹" },
		{ code: "+252", country: "Somalia", flag: "🇸🇴" },
		{ code: "+253", country: "Djibouti", flag: "🇩🇯" },
		{ code: "+254", country: "Kenya", flag: "🇰🇪" },
		{ code: "+255", country: "Tanzania", flag: "🇹🇿" },
		{ code: "+256", country: "Uganda", flag: "🇺🇬" },
		{ code: "+257", country: "Burundi", flag: "🇧🇮" },
		{ code: "+258", country: "Mozambique", flag: "🇲🇿" },
		{ code: "+260", country: "Zambia", flag: "🇿🇲" },
		{ code: "+261", country: "Madagascar", flag: "🇲🇬" },
		{ code: "+262", country: "Reunion", flag: "🇷🇪" },
		{ code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
		{ code: "+264", country: "Namibia", flag: "🇳🇦" },
		{ code: "+265", country: "Malawi", flag: "🇲🇼" },
		{ code: "+266", country: "Lesotho", flag: "🇱🇸" },
		{ code: "+267", country: "Botswana", flag: "🇧🇼" },
		{ code: "+268", country: "Swaziland", flag: "🇸🇿" },
		{ code: "+269", country: "Comoros", flag: "🇰🇲" },
		{ code: "+290", country: "Saint Helena", flag: "🇸🇭" },
		{ code: "+291", country: "Eritrea", flag: "🇪🇷" },
		{ code: "+297", country: "Aruba", flag: "🇦🇼" },
		{ code: "+298", country: "Faroe Islands", flag: "🇫🇴" },
		{ code: "+299", country: "Greenland", flag: "🇬🇱" },
		{ code: "+350", country: "Gibraltar", flag: "🇬🇮" },
		{ code: "+351", country: "Portugal", flag: "🇵🇹" },
		{ code: "+352", country: "Luxembourg", flag: "🇱🇺" },
		{ code: "+353", country: "Ireland", flag: "🇮🇪" },
		{ code: "+354", country: "Iceland", flag: "🇮🇸" },
		{ code: "+355", country: "Albania", flag: "🇦🇱" },
		{ code: "+356", country: "Malta", flag: "🇲🇹" },
		{ code: "+357", country: "Cyprus", flag: "🇨🇾" },
		{ code: "+358", country: "Finland", flag: "🇫🇮" },
		{ code: "+359", country: "Bulgaria", flag: "🇧🇬" },
		{ code: "+370", country: "Lithuania", flag: "🇱🇹" },
		{ code: "+371", country: "Latvia", flag: "🇱🇻" },
		{ code: "+372", country: "Estonia", flag: "🇪🇪" },
		{ code: "+373", country: "Moldova", flag: "🇲🇩" },
		{ code: "+374", country: "Armenia", flag: "🇦🇲" },
		{ code: "+375", country: "Belarus", flag: "🇧🇾" },
		{ code: "+376", country: "Andorra", flag: "🇦🇩" },
		{ code: "+377", country: "Monaco", flag: "🇲🇨" },
		{ code: "+378", country: "San Marino", flag: "🇸🇲" },
		{ code: "+379", country: "Vatican City", flag: "🇻🇦" },
		{ code: "+380", country: "Ukraine", flag: "🇺🇦" },
		{ code: "+381", country: "Serbia", flag: "🇷🇸" },
		{ code: "+382", country: "Montenegro", flag: "🇲🇪" },
		{ code: "+383", country: "Kosovo", flag: "🇽🇰" },
		{ code: "+385", country: "Croatia", flag: "🇭🇷" },
		{ code: "+386", country: "Slovenia", flag: "🇸🇮" },
		{ code: "+387", country: "Bosnia and Herzegovina", flag: "🇧🇦" },
		{ code: "+389", country: "North Macedonia", flag: "🇲🇰" },
		{ code: "+420", country: "Czech Republic", flag: "🇨🇿" },
		{ code: "+421", country: "Slovakia", flag: "🇸🇰" },
		{ code: "+423", country: "Liechtenstein", flag: "🇱🇮" },
		{ code: "+500", country: "Falkland Islands", flag: "🇫🇰" },
		{ code: "+501", country: "Belize", flag: "🇧🇿" },
		{ code: "+502", country: "Guatemala", flag: "🇬🇹" },
		{ code: "+503", country: "El Salvador", flag: "🇸🇻" },
		{ code: "+504", country: "Honduras", flag: "🇭🇳" },
		{ code: "+505", country: "Nicaragua", flag: "🇳🇮" },
		{ code: "+506", country: "Costa Rica", flag: "🇨🇷" },
		{ code: "+507", country: "Panama", flag: "🇵🇦" },
		{ code: "+508", country: "Saint Pierre and Miquelon", flag: "🇵🇲" },
		{ code: "+509", country: "Haiti", flag: "🇭🇹" },
		{ code: "+590", country: "Guadeloupe", flag: "🇬🇵" },
		{ code: "+591", country: "Bolivia", flag: "🇧🇴" },
		{ code: "+592", country: "Guyana", flag: "🇬🇾" },
		{ code: "+593", country: "Ecuador", flag: "🇪🇨" },
		{ code: "+594", country: "French Guiana", flag: "🇬🇫" },
		{ code: "+595", country: "Paraguay", flag: "🇵🇾" },
		{ code: "+596", country: "Martinique", flag: "🇲🇶" },
		{ code: "+597", country: "Suriname", flag: "🇸🇷" },
		{ code: "+598", country: "Uruguay", flag: "🇺🇾" },
		{ code: "+599", country: "Netherlands Antilles", flag: "🇧🇶" },
		{ code: "+670", country: "East Timor", flag: "🇹🇱" },
		{ code: "+672", country: "Antarctica", flag: "🇦🇶" },
		{ code: "+673", country: "Brunei", flag: "🇧🇳" },
		{ code: "+674", country: "Nauru", flag: "🇳🇷" },
		{ code: "+675", country: "Papua New Guinea", flag: "🇵🇬" },
		{ code: "+676", country: "Tonga", flag: "🇹🇴" },
		{ code: "+677", country: "Solomon Islands", flag: "🇸🇧" },
		{ code: "+678", country: "Vanuatu", flag: "🇻🇺" },
		{ code: "+679", country: "Fiji", flag: "🇫🇯" },
		{ code: "+680", country: "Palau", flag: "🇵🇼" },
		{ code: "+681", country: "Wallis and Futuna", flag: "🇼🇫" },
		{ code: "+682", country: "Cook Islands", flag: "🇨🇰" },
		{ code: "+683", country: "Niue", flag: "🇳🇺" },
		{ code: "+684", country: "American Samoa", flag: "🇦🇸" },
		{ code: "+685", country: "Samoa", flag: "🇼🇸" },
		{ code: "+686", country: "Kiribati", flag: "🇰🇮" },
		{ code: "+687", country: "New Caledonia", flag: "🇳🇨" },
		{ code: "+688", country: "Tuvalu", flag: "🇹🇻" },
		{ code: "+689", country: "French Polynesia", flag: "🇵🇫" },
		{ code: "+690", country: "Tokelau", flag: "🇹🇰" },
		{ code: "+691", country: "Micronesia", flag: "🇫🇲" },
		{ code: "+692", country: "Marshall Islands", flag: "🇲🇭" },
		{ code: "+850", country: "North Korea", flag: "🇰🇵" },
		{ code: "+852", country: "Hong Kong", flag: "🇭🇰" },
		{ code: "+853", country: "Macau", flag: "🇲🇴" },
		{ code: "+855", country: "Cambodia", flag: "🇰🇭" },
		{ code: "+856", country: "Laos", flag: "🇱🇦" },
		{ code: "+880", country: "Bangladesh", flag: "🇧🇩" },
		{ code: "+886", country: "Taiwan", flag: "🇹🇼" },
		{ code: "+960", country: "Maldives", flag: "🇲🇻" },
		{ code: "+961", country: "Lebanon", flag: "🇱🇧" },
		{ code: "+962", country: "Jordan", flag: "🇯🇴" },
		{ code: "+963", country: "Syria", flag: "🇸🇾" },
		{ code: "+964", country: "Iraq", flag: "🇮🇶" },
		{ code: "+965", country: "Kuwait", flag: "🇰🇼" },
		{ code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
		{ code: "+967", country: "Yemen", flag: "🇾🇪" },
		{ code: "+968", country: "Oman", flag: "🇴🇲" },
		{ code: "+970", country: "Palestine", flag: "🇵🇸" },
		{ code: "+971", country: "UAE", flag: "🇦🇪" },
		{ code: "+972", country: "Israel", flag: "🇮🇱" },
		{ code: "+973", country: "Bahrain", flag: "🇧🇭" },
		{ code: "+974", country: "Qatar", flag: "🇶🇦" },
		{ code: "+975", country: "Bhutan", flag: "🇧🇹" },
		{ code: "+976", country: "Mongolia", flag: "🇲🇳" },
		{ code: "+977", country: "Nepal", flag: "🇳🇵" },
		{ code: "+992", country: "Tajikistan", flag: "🇹🇯" },
		{ code: "+993", country: "Turkmenistan", flag: "🇹🇲" },
		{ code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
		{ code: "+995", country: "Georgia", flag: "🇬🇪" },
		{ code: "+996", country: "Kyrgyzstan", flag: "🇰🇬" },
		{ code: "+998", country: "Uzbekistan", flag: "🇺🇿" },
	];

	/**
	 * Constructor
	 */
	private _translocoService = inject(TranslocoService);

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _authService: AuthService,
		private _formBuilder: UntypedFormBuilder,
		private _router: Router
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Create the form
		this.signInForm = this._formBuilder.group({
			identificationMethod: ["email", Validators.required],
			email: ["", [Validators.required, Validators.email]],
			countryCode: ["+1"],
			phone: [""],
			masterPassword: ["", Validators.required],
			rememberMe: [""],
		});

		// Watch for identification method changes to update validation
		this.signInForm.get("identificationMethod")?.valueChanges.subscribe((method) => {
			this.updateValidation(method);
		});

		// Set initial validation
		this.updateValidation("email");

		// Load saved data from localStorage
		this.loadRememberedData();

		// Initialize current language
		this.currentLanguage = this._translocoService.getActiveLang() || "en";
	}

	/**
	 * Update form validation based on identification method
	 */
	private updateValidation(method: string): void {
		const emailControl = this.signInForm.get("email");
		const countryCodeControl = this.signInForm.get("countryCode");
		const phoneControl = this.signInForm.get("phone");

		if (method === "email") {
			// Email validation
			emailControl?.setValidators([Validators.required, Validators.email]);
			countryCodeControl?.clearValidators();
			phoneControl?.clearValidators();
		} else if (method === "phone") {
			// Phone validation
			emailControl?.clearValidators();
			countryCodeControl?.setValidators([Validators.required]);
			phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{8,12}$/)]);
		}

		// Update validation status
		emailControl?.updateValueAndValidity();
		countryCodeControl?.updateValueAndValidity();
		phoneControl?.updateValueAndValidity();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Sign in
	 */
	signIn(): void {
		if (this.signInForm.invalid) return;

		// Save remembered data if checkbox is checked
		this.saveRememberedData();

		// Prepare user data based on identification method
		const formValue = this.signInForm.value;
		const identificationMethod = formValue.identificationMethod;

		if (identificationMethod === "email") {
			this.userData = {
				email: formValue.email,
				masterPassword: formValue.masterPassword,
				identificationMethod: "email",
			};
		} else if (identificationMethod === "phone") {
			this.userData = {
				countryCode: formValue.countryCode,
				phone: formValue.phone,
				masterPassword: formValue.masterPassword,
				identificationMethod: "phone",
			};
		}

		/**
		 * {
    "data": {
        "id": "7de688a7-302d-4a32-962b-9e37d0b716d4",
        "ipfs_pin_hash": "bafkreif43dolp3yedc2cos6kkhlho6zriglmyi3owetx65xvimualqh5ju",
        "size": 1189,
        "user_id": "622f63b9-c03d-4702-9679-5d1409ae5e20",
        "date_pinned": "2025-09-11T16:32:04.266Z",
        "date_unpinned": null,
        "metadata": {
            "name": "emery.garcia@icloud.com.account",
            "keyvalues": {
                "type": "client_account",
                "email": "emery.garcia@icloud.com",
                "phone": "8131259467",
                "company": "Smart Contracts Ltd",
                "zelfProof": "A5boXuG+IXX0FsSzEmPfXQLCT7dP2qKum81DZqaDkInIYNkO6mmYFIo9j7dgsAaF5fA4TuRYeewTOXuiF4k2+L6USP2qC7lpMiOUr8cqWshWaqCROorkA9+cJ2AAYY0bJIuTcoSUWX5tec9HoYHC1TGcoMOnYvIX7IMiDQpkdbD59TA+BD6H3yAa6vCS6bp5Enezyj474jg8ODy5CJHDuh1jRs9X+UE41j5IQGecKR64zKMjc4SflfvkdrLuXKfrsxuKBO/q15EllywddDNyH8DnLsGi8BYYXAiJ3V4n3J26nJhyIs1v0gVMXpxHd3P30pZOIQFXWYDr3kcKGoLOFBfPsqf8gSoD61cMtm4Bso9mh6WMkCk8zlEhQrqH8W7O6+dbkc6dlWJAC6stLAQAC0lyiReiEif5HXKSwRbMxh5di73IeQVl2VPD4OXP7nHV0/u3rMjXrh7ZZ4pMQWjgsbirko6roO/at9KegvOODD0LSgFAEbUM+hq3bGkGiisQNjYYV595Z9onflJxWUYu9Xv+upsEo99tYfO4soqmANlNcEtDC6OPOIQ6CpRpHxyzDbbdckWMl4QASI2uuHmlUAhuQ84UzrLiPdHDc9dOvK2E8gewm9adQXlej/MOtLcU+T7h4o8lqyTYYorlooTLinlmmh3aM/+rxaCTc3i5LAMIoSFN1vI5KsoGfIm4T6XTObB2/BKMCFgcUlXsKqi5LEKf3UvLZ4ZrJWFX6M2pRsDTMre2xLckyjg3XwK6ywoiRL2agxSMuh+5hVq1AwVUmw5W1XVdSpxMDtn+I7KpP3Vn7YcyGQOhrG6lTkjl6haqldJ2J1aFqql8jNwoZVUS28ImOkiWJUwugLwrnwU02BkeybceYsKzzSC/zYY3sf32bDDx0OYgThxqSc2hCdLBKWaeG3wBaMnkFX4r5nFmnoD/8IqFY5F/B34Io1JZAA==",
                "countryCode": "+64",
                "subscriptionId": "free"
            }
        },
        "regions": [
            {
                "regionId": "pinata",
                "currentReplicationCount": 1,
                "desiredReplicationCount": 1
            }
        ],
        "mime_type": "false",
        "number_of_files": 1,
        "url": "https://blush-selective-earwig-920.mypinata.cloud/ipfs/bafkreif43dolp3yedc2cos6kkhlho6zriglmyi3owetx65xvimualqh5ju"
    }
}
		 */

		// here we will need to call the backend to try to find the client using the identification method and the identifier
		this._authService.verifyClientExists(this.userData).subscribe(
			(response) => {
				const metadata = response.data?.metadata?.keyvalues;

				this.userData = {
					...this.userData, // Preserve original userData including masterPassword and identificationMethod
					email: metadata?.accountEmail,
					phone: metadata?.accountPhone,
					countryCode: metadata?.accountCountryCode,
					zelfProof: metadata?.accountZelfProof,
				};

				if (this.userData.zelfProof) {
					this.showBiometricVerification = true;

					this.showAlert = false;

					return;
				}

				this.showAlert = true;

				this.alert = {
					type: "error",
					message: this.getErrorMessage({ message: "Client not found" }),
				};
			},
			(error) => {
				console.error("Verify client exists error:", error);
				this.showAlert = true;
				this.alert = {
					type: "error",
					message: this.getErrorMessage(error),
				};
			}
		);
	}

	/**
	 * Handle successful biometric verification
	 */
	onBiometricSuccess(biometricData: BiometricData): void {
		// Disable the form
		this.signInForm.disable();

		// Combine user data with biometric data
		const signInData = {
			...this.userData,
			masterPassword: biometricData.password,
			faceBase64: biometricData.faceBase64,
		};

		console.info({ signInData, biometricData });

		// Sign in with biometric data
		this._authService.signIn(signInData).then(
			(response) => {
				console.info({ response });

				// Check if we have all required data for authentication
				if (response.data?.token && response.data?.zelfProof && response.data?.zelfAccount) {
					// Set session data
					this._authService.setSession({
						zelfProof: response.data.zelfProof,
						zelfAccount: response.data.zelfAccount,
					});

					// Set access token
					this._authService.setAccessToken(response.data.token);

					// Navigate to dashboard
					this._router.navigateByUrl("/analytics");
				} else {
					// Handle case where required data is missing
					console.error("Sign in response missing required authentication data:", response);

					// Show error message
					this.alert = {
						type: "error",
						message: this.getErrorMessage({ message: "Incomplete authentication data received" }),
					};
					this.showAlert = true;

					// Re-enable the form
					this.signInForm.enable();
					this.showBiometricVerification = false;
				}
			},
			(error) => {
				console.error("Sign in error:", error);

				// Check if this is a biometric-related error
				if (
					error?.message &&
					(error.message.includes("Multiple face were detected") ||
						error.message.includes("No face detected") ||
						error.message.includes("Face not recognized") ||
						error.message.includes("biometric") ||
						error.message.includes("face"))
				) {
					// Handle biometric-specific errors in the biometric component
					if (this.biometricVerification) {
						this.biometricVerification.handleApiError(error);
					}
					return; // Don't show the general error alert
				}

				// Re-enable the form
				this.signInForm.enable();

				// Reset the form
				this.signInNgForm.resetForm();

				// Hide biometric verification
				this.showBiometricVerification = false;

				// Get translated error message
				const errorMessage = this.getErrorMessage(error);

				// Set the alert with translated message
				this.alert = {
					type: "error",
					message: errorMessage,
				};

				// Show the alert
				this.showAlert = true;
			}
		);
	}

	/**
	 * Handle biometric verification cancellation
	 */
	onBiometricCancel(): void {
		this.showBiometricVerification = false;
		this.userData = {};
		// Clear remembered data when user cancels biometric verification
		this.clearRememberedData();
	}

	/**
	 * Map error codes to translated messages
	 */
	private getErrorMessage(error: any): string {
		// Extract error code from error response
		// Backend returns: { status, message, code } or HttpErrorResponse with nested error structure
		const errorCode = error?.error?.code || error?.code || error?.error?.message || error?.message || "unknown_error";
		const errorMessage = error?.error?.message || error?.message || "";

		// Map error codes to translation keys
		const errorMapping: { [key: string]: string } = {
			client_not_found: "errors.client_not_found",
			client_invalid_api_key: "errors.client_invalid_api_key",
			"403:client_not_found": "errors.client_not_found",
			"403:client_invalid_api_key": "errors.client_invalid_api_key",
			Forbidden: "errors.unknown_error", // Generic 403 error
			Conflict: "errors.unknown_error", // Generic 409 error
			BadRequest: "errors.validation_error",
			UnprocessableEntity: "errors.validation_error",
			InternalServerError: "errors.unknown_error",
			Timeout: "errors.network_error",
			unknown_error: "errors.unknown_error",
			network_error: "errors.network_error",
			validation_error: "errors.validation_error",
		};

		// Check if it's a specific error message that contains our error codes
		if (errorMessage) {
			if (errorMessage.includes("client_not_found")) {
				return this._translocoService.translate("errors.client_not_found");
			}
			if (errorMessage.includes("client_invalid_api_key")) {
				return this._translocoService.translate("errors.client_invalid_api_key");
			}
			if (errorMessage.includes("Incomplete authentication data received")) {
				return this._translocoService.translate("errors.incomplete_auth_data");
			}
		}

		const translationKey = errorMapping[errorCode] || "errors.unknown_error";

		// Return translated message
		return this._translocoService.translate(translationKey);
	}

	/**
	 * Load remembered data from localStorage
	 */
	private loadRememberedData(): void {
		try {
			const rememberedData = localStorage.getItem("zelf_remembered_signin");
			if (rememberedData) {
				const data = JSON.parse(rememberedData);

				// Set the identification method
				if (data.identificationMethod) {
					this.signInForm.patchValue({
						identificationMethod: data.identificationMethod,
					});
					this.updateValidation(data.identificationMethod);
				}

				// Set email if available
				if (data.email) {
					this.signInForm.patchValue({
						email: data.email,
					});
				}

				// Set phone data if available
				if (data.countryCode) {
					this.signInForm.patchValue({
						countryCode: data.countryCode,
					});
				}
				if (data.phone) {
					this.signInForm.patchValue({
						phone: data.phone,
					});
				}

				// Set remember me checkbox
				if (data.rememberMe) {
					this.signInForm.patchValue({
						rememberMe: data.rememberMe,
					});
				}
			}
		} catch (error) {
			console.error("Error loading remembered data:", error);
		}
	}

	/**
	 * Save data to localStorage if remember me is checked
	 */
	private saveRememberedData(): void {
		const formValue = this.signInForm.value;
		const rememberMe = formValue.rememberMe;

		if (rememberMe) {
			try {
				const dataToSave: any = {
					identificationMethod: formValue.identificationMethod,
					rememberMe: true,
				};

				if (formValue.identificationMethod === "email" && formValue.email) {
					dataToSave.email = formValue.email;
				} else if (formValue.identificationMethod === "phone") {
					if (formValue.countryCode) {
						dataToSave.countryCode = formValue.countryCode;
					}
					if (formValue.phone) {
						dataToSave.phone = formValue.phone;
					}
				}

				localStorage.setItem("zelf_remembered_signin", JSON.stringify(dataToSave));
			} catch (error) {
				console.error("Error saving remembered data:", error);
			}
		} else {
			// Clear saved data if remember me is unchecked
			localStorage.removeItem("zelf_remembered_signin");
		}
	}

	/**
	 * Clear remembered data from localStorage
	 */
	private clearRememberedData(): void {
		localStorage.removeItem("zelf_remembered_signin");
	}

	/**
	 * Change language
	 */
	onLanguageChange(languageCode: string): void {
		this.currentLanguage = languageCode;
		this._translocoService.setActiveLang(languageCode);
	}
}
