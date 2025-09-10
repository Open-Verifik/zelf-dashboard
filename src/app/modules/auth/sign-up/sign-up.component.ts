import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from "@angular/core";
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../biometric-verification/biometric-verification.component";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "auth-sign-up",
	templateUrl: "./sign-up.component.html",
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
		MatSelectModule,
		DataBiometricsComponent,
		TranslocoModule,
	],
})
export class AuthSignUpComponent implements OnInit {
	@ViewChild("signUpNgForm") signUpNgForm: NgForm;

	alert: { type: FuseAlertType; message: string } = {
		type: "success",
		message: "",
	};
	signUpForm: UntypedFormGroup;
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

	// Random data generators for testing
	private firstNames = [
		"Alex",
		"Jordan",
		"Taylor",
		"Morgan",
		"Casey",
		"Riley",
		"Avery",
		"Quinn",
		"Sage",
		"River",
		"Blake",
		"Cameron",
		"Drew",
		"Emery",
		"Finley",
		"Hayden",
		"Jamie",
		"Kendall",
		"Logan",
		"Parker",
	];

	private lastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Garcia",
		"Miller",
		"Davis",
		"Rodriguez",
		"Martinez",
		"Anderson",
		"Taylor",
		"Thomas",
		"Hernandez",
		"Moore",
		"Martin",
		"Jackson",
		"Thompson",
		"White",
		"Lopez",
	];

	private companies = [
		"TechCorp",
		"InnovateLabs",
		"Digital Solutions",
		"Cloud Systems",
		"Data Dynamics",
		"Cyber Security Inc",
		"AI Innovations",
		"Blockchain Technologies",
		"Web3 Solutions",
		"Crypto Ventures",
		"Smart Contracts Ltd",
		"Decentralized Systems",
		"NFT Marketplace",
		"DeFi Protocols",
		"Metaverse Corp",
		"Quantum Computing",
		"Machine Learning Co",
		"Big Data Analytics",
		"IoT Solutions",
		"Edge Computing",
	];

	private domains = [
		"gmail.com",
		"yahoo.com",
		"outlook.com",
		"hotmail.com",
		"icloud.com",
		"protonmail.com",
		"company.com",
		"business.org",
		"enterprise.net",
		"corp.io",
	];

	/**
	 * Constructor
	 */
	private _translocoService = inject(TranslocoService);

	constructor(
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
		this.signUpForm = this._formBuilder.group({
			name: ["", Validators.required],
			email: ["", [Validators.required, Validators.email]],
			password: ["", Validators.required],
			countryCode: ["+1", Validators.required],
			phone: ["", [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
			company: ["", Validators.required],
			agreements: ["", Validators.requiredTrue],
		});

		// Initialize current language
		this.currentLanguage = this._translocoService.getActiveLang() || "en";

		// Auto-fill form with random data for testing
		this.fillRandomData();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Private methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Map error codes to translated messages
	 */
	private getErrorMessage(error: any): string {
		// Extract error code from error response
		// Backend returns: { status, message, code }
		const errorCode = error?.code || error?.message || "unknown_error";

		// Map error codes to translation keys
		const errorMapping: { [key: string]: string } = {
			phone_already_exists: "errors.phone_already_exists",
			email_already_exists: "errors.email_already_exists",
			"403:phone_already_exists": "errors.phone_already_exists",
			"403:email_already_exists": "errors.email_already_exists",
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
		if (error?.message) {
			if (error.message.includes("phone_already_exists")) {
				return this._translocoService.translate("errors.phone_already_exists");
			}
			if (error.message.includes("email_already_exists")) {
				return this._translocoService.translate("errors.email_already_exists");
			}
			if (error.message.includes("Incomplete authentication data received")) {
				return this._translocoService.translate("errors.incomplete_auth_data");
			}
		}

		const translationKey = errorMapping[errorCode] || "errors.unknown_error";

		// Return translated message
		return this._translocoService.translate(translationKey);
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Sign up
	 */
	signUp(): void {
		// Do nothing if the form is invalid
		if (this.signUpForm.invalid) {
			return;
		}

		// Store user data and show biometric verification
		this.userData = this.signUpForm.value;
		this.showBiometricVerification = true;
		this.showAlert = false;
	}

	/**
	 * Handle successful biometric verification
	 */
	onBiometricSuccess(biometricData: BiometricData): void {
		// Disable the form
		this.signUpForm.disable();

		// Combine user data with biometric data
		const signUpData = {
			...this.userData,
			faceBase64: biometricData.faceBase64,
			masterPassword: biometricData.password,
		};

		console.info({ signUpData });

		// Sign up with biometric data
		this._authService
			.signUp(signUpData)
			.then((response) => {
				console.log({ response });

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
					console.error("Sign up response missing required authentication data:", response);

					// Show error message
					this.alert = {
						type: "error",
						message: this.getErrorMessage({ message: "Incomplete authentication data received" }),
					};
					this.showAlert = true;

					// Re-enable the form
					this.signUpForm.enable();
					this.showBiometricVerification = false;
				}
			})
			.catch((error) => {
				console.error("Sign up error:", error);

				// Re-enable the form
				this.signUpForm.enable();

				// Reset the form
				this.signUpNgForm.resetForm();

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
			});
	}

	/**
	 * Handle biometric verification cancellation
	 */
	onBiometricCancel(): void {
		this.showBiometricVerification = false;
		this.userData = {};
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Helper methods for testing
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Fill form with random data for easy testing
	 */
	fillRandomData(): void {
		const randomData = this.generateRandomUserData();

		this.signUpForm.patchValue({
			name: randomData.name,
			email: randomData.email,
			password: randomData.password,
			countryCode: randomData.countryCode,
			phone: randomData.phone,
			company: randomData.company,
			faceBase64: randomData.faceBase64,
			masterPassword: randomData.masterPassword,
			agreements: true,
		});
	}

	/**
	 * Generate random user data
	 */
	private generateRandomUserData(): any {
		const firstName = this.getRandomItem(this.firstNames);
		const lastName = this.getRandomItem(this.lastNames);
		const company = this.getRandomItem(this.companies);
		const domain = this.getRandomItem(this.domains);
		const countryCode = this.getRandomItem(this.countryCodes);

		return {
			name: `${firstName} ${lastName}`,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
			password: this.generateRandomPassword(),
			countryCode: countryCode.code,
			phone: this.generateRandomPhoneNumber(),
			company: company,
		};
	}

	/**
	 * Get random item from array
	 */
	private getRandomItem<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	}

	/**
	 * Generate random password
	 */
	private generateRandomPassword(): string {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < 12; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return password;
	}

	/**
	 * Generate random phone number
	 */
	private generateRandomPhoneNumber(): string {
		// Generate 10-digit phone number
		return Math.floor(1000000000 + Math.random() * 9000000000).toString();
	}

	/**
	 * Manually fill random data (for testing button)
	 */
	onFillRandomData(): void {
		this.fillRandomData();
	}

	/**
	 * Change language
	 */
	onLanguageChange(languageCode: string): void {
		this.currentLanguage = languageCode;
		this._translocoService.setActiveLang(languageCode);
	}
}
