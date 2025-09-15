import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ElementRef, ChangeDetectorRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { WebcamComponent, WebcamImage, WebcamInitError, WebcamModule } from "ngx-webcam";
import { Subject, takeUntil, Observable } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { BiometricService } from "app/core/services/biometric.service";
import * as faceapi from "@vladmandic/face-api";

export interface BiometricData {
	faceBase64: string;
	password?: string;
}

@Component({
	selector: "app-data-biometrics",
	standalone: true,
	imports: [CommonModule, FormsModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, WebcamModule, RouterModule],
	templateUrl: "./biometric-verification.component.html",
	styleUrls: ["./biometric-verification.component.scss"],
})
export class DataBiometricsComponent implements OnInit, OnDestroy {
	@ViewChild("maskResult", { static: false }) public maskResultCanvasRef: ElementRef | undefined;
	@ViewChild("toSend", { static: false }) public ToSendCanvasRef: ElementRef | undefined;
	@ViewChild("webcam", { static: false }) public webcamRef?: WebcamComponent;

	@Input() userData: any = {};
	@Input() isModalContext: boolean = false;
	@Output() biometricsSuccess: EventEmitter<BiometricData> = new EventEmitter<BiometricData>();
	@Output() biometricsCancel: EventEmitter<void> = new EventEmitter<void>();

	private unsubscriber$: Subject<void> = new Subject<void>();
	private _takePicture: Subject<void> = new Subject<void>();
	private _intervals: any = {};

	// Camera and face detection properties
	camera = {
		isLoading: true,
		hasPermissions: true,
		isLowQuality: false,
		dimensions: {
			video: { width: 0, height: 0, max: { width: 800, height: 600 } },
			result: { width: 0, height: 0, offsetX: 0, offsetY: 0 },
			real: { width: 0, height: 0, offsetX: 0, offsetY: 0 },
		} as { [key: string]: { width: number; height: number; offsetX?: number; offsetY?: number; max?: { width: number; height: number } } },
		configuration: {
			facingMode: "user",
			width: { ideal: 800 },
			height: { ideal: 600 },
		},
	};

	face = {
		video: { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 }, margin: { x: 0, y: 0 } },
		real: { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 }, margin: { x: 0, y: 0 } },
		minHeight: 200,
		minPixels: 200,
		successPosition: 0,
		threshold: 0.25,
	};

	response = {
		base64Image: "",
		isLoading: false,
	};

	errorFace: any = null;
	lastFace: any;
	aspectRatio = 0.75;
	masterPassword: string = "";

	// Error handling
	apiError: string = "";
	hasApiError: boolean = false;

	// Optional master password
	useMasterPassword: boolean = false;

	// Make Math and Date available in template
	Math = Math;
	Date = Date;

	// Active Liveness Detection properties
	livenessDetection = {
		isActive: false,
		currentStep: 0,
		totalSteps: 3,
		steps: [
			{ name: "Center", angle: 0, tolerance: 15, completed: false },
			{ name: "Left", angle: -30, tolerance: 15, completed: false },
			{ name: "Right", angle: 30, tolerance: 15, completed: false },
		],
		faceAngles: [] as number[],
		requiredHoldTime: 1000, // 1 second to hold position
		holdStartTime: 0,
		isHolding: false,
	};

	constructor(
		private _changeDetectorRef: ChangeDetectorRef,
		private _router: Router,
		private _biometricService: BiometricService
	) {}

	async ngOnInit(): Promise<void> {
		// Initialize biometric verification
		this._initializeBiometrics();
	}

	ngOnDestroy(): void {
		// Clear intervals
		if (this._intervals.detectFace) {
			clearInterval(this._intervals.detectFace);
		}
		if (this._intervals.checkNgxVideo) {
			clearInterval(this._intervals.checkNgxVideo);
		}

		// Stop camera stream
		this._stopCamera();

		// Complete observables
		this.unsubscriber$.next();
		this.unsubscriber$.complete();
	}

	get takePicture$(): Observable<void> {
		return this._takePicture.asObservable();
	}

	/**
	 * Handle successful biometrics verification
	 */
	onBiometricsSuccess(faceBase64: string, password?: string): void {
		// Stop camera before emitting success
		this._stopCamera();

		this.biometricsSuccess.emit({
			faceBase64,
			password: this.masterPassword || password,
		});
	}

	/**
	 * Handle biometrics cancellation
	 */
	onBiometricsCancel(): void {
		// Stop camera before closing
		this._stopCamera();
		this.biometricsCancel.emit();
	}

	/**
	 * Stop camera stream and cleanup
	 */
	private _stopCamera(): void {
		try {
			// Stop the webcam component
			if (this.webcamRef) {
				// Access the native video element and stop its stream
				const videoElement = this.webcamRef.nativeVideoElement;
				if (videoElement && videoElement.srcObject) {
					const stream = videoElement.srcObject as MediaStream;
					if (stream) {
						stream.getTracks().forEach((track) => {
							track.stop();
						});
					}
					videoElement.srcObject = null;
				}
			}
		} catch (error) {
			console.warn("Error stopping camera:", error);
		}
	}

	/**
	 * Toggle master password input visibility
	 */
	toggleMasterPassword(): void {
		this.useMasterPassword = !this.useMasterPassword;
		if (!this.useMasterPassword) {
			this.masterPassword = ""; // Clear password when toggling off
		}
	}

	/**
	 * Clear API error and retry
	 */
	clearApiError(): void {
		this.apiError = "";
		this.hasApiError = false;
		this.response.isLoading = false;
		this.response.base64Image = "";
		this._changeDetectorRef.markForCheck();

		// Restart face detection
		this._startFaceDetectionInterval();
	}

	/**
	 * Handle API errors from parent component
	 */
	handleApiError(error: any): void {
		console.error("API Error in biometric verification:", error);

		// Check for specific error messages
		if (error?.message) {
			if (error.message.includes("Multiple face were detected")) {
				this.apiError = "Multiple faces detected in the image. Please ensure only one person is visible in the camera frame.";
			} else if (error.message.includes("No face detected")) {
				this.apiError = "No face detected. Please look directly at the camera.";
			} else if (error.message.includes("Face not recognized")) {
				this.apiError = "Face not recognized. Please try again or contact support.";
			} else {
				this.apiError = error.message;
			}
		} else {
			this.apiError = "Biometric verification failed. Please try again.";
		}

		this.hasApiError = true;
		this.response.isLoading = false;
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Start active liveness detection
	 */
	startLivenessDetection(): void {
		this.livenessDetection.isActive = true;
		this.livenessDetection.currentStep = 0;
		this.livenessDetection.steps.forEach((step) => (step.completed = false));
		this.livenessDetection.faceAngles = [];
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Calculate face angle from face landmarks
	 */
	private _calculateFaceAngle(face: any): number {
		if (!face.landmarks || face.landmarks.length < 68) return 0;

		// Use eye landmarks to calculate head rotation
		const leftEye = face.landmarks.slice(36, 42); // Left eye points
		const rightEye = face.landmarks.slice(42, 48); // Right eye points

		// Calculate center of each eye
		const leftEyeCenter = {
			x: leftEye.reduce((sum: number, point: any) => sum + point.x, 0) / leftEye.length,
			y: leftEye.reduce((sum: number, point: any) => sum + point.y, 0) / leftEye.length,
		};

		const rightEyeCenter = {
			x: rightEye.reduce((sum: number, point: any) => sum + point.x, 0) / rightEye.length,
			y: rightEye.reduce((sum: number, point: any) => sum + point.y, 0) / rightEye.length,
		};

		// Calculate angle based on eye positions
		const eyeDistance = Math.sqrt(Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2));

		// Normalize and convert to degrees
		const normalizedDistance = (rightEyeCenter.x - leftEyeCenter.x) / eyeDistance;
		const angle = Math.asin(normalizedDistance) * (180 / Math.PI);

		return angle;
	}

	/**
	 * Check if face is at the correct angle for current step
	 */
	private _isFaceAtCorrectAngle(face: any): boolean {
		const currentStep = this.livenessDetection.steps[this.livenessDetection.currentStep];
		const faceAngle = this._calculateFaceAngle(face);

		// Check if face is within tolerance of required angle
		const angleDiff = Math.abs(faceAngle - currentStep.angle);
		return angleDiff <= currentStep.tolerance;
	}

	/**
	 * Update liveness detection progress
	 */
	private _updateLivenessProgress(face: any): void {
		if (!this.livenessDetection.isActive) return;

		const currentStep = this.livenessDetection.steps[this.livenessDetection.currentStep];

		if (this._isFaceAtCorrectAngle(face)) {
			if (!this.livenessDetection.isHolding) {
				this.livenessDetection.isHolding = true;
				this.livenessDetection.holdStartTime = Date.now();
			}

			// Check if held long enough
			const holdTime = Date.now() - this.livenessDetection.holdStartTime;
			if (holdTime >= this.livenessDetection.requiredHoldTime) {
				// Mark step as completed
				currentStep.completed = true;
				this.livenessDetection.faceAngles.push(this._calculateFaceAngle(face));

				// Move to next step
				if (this.livenessDetection.currentStep < this.livenessDetection.totalSteps - 1) {
					this.livenessDetection.currentStep++;
					this.livenessDetection.isHolding = false;
				} else {
					// All steps completed
					this._onLivenessDetectionComplete();
				}

				this._changeDetectorRef.markForCheck();
			}
		} else {
			// Reset holding if face moves away
			this.livenessDetection.isHolding = false;
		}
	}

	/**
	 * Handle liveness detection completion
	 */
	private _onLivenessDetectionComplete(): void {
		this.livenessDetection.isActive = false;
		// Capture the final image and proceed
		this._captureFinalImage();
	}

	/**
	 * Capture final image after liveness detection
	 */
	private _captureFinalImage(): void {
		if (this.webcamRef?.nativeVideoElement) {
			const video = this.webcamRef.nativeVideoElement;
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (ctx) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx.drawImage(video, 0, 0);

				const img = new Image();
				img.onload = () => {
					this._takePictureLiveness(img);
				};
				img.src = canvas.toDataURL("image/jpeg");
			}
		}
	}

	private async _initializeBiometrics(): Promise<void> {
		try {
			console.log({ userData: this.userData });
			// Initialize master password from user data
			if (this.userData && this.userData.masterPassword) {
				this.masterPassword = this.userData.masterPassword;
				this.useMasterPassword = true;
			}

			// Always wait for the biometric service to load the models
			this._biometricService.faceapi$.pipe(takeUntil(this.unsubscriber$)).subscribe(async (isLoaded) => {
				if (!isLoaded) return;

				this.camera.isLoading = false;
				await this._setMaxVideoDimensions();
				this._startNgxVideoInterval();
			});
		} catch (error) {
			console.error("❌ Error initializing biometrics:", error);
		}
	}

	private async _setMaxVideoDimensions(): Promise<void> {
		const maxWidth = 800;
		const maxHeight = 600;

		// Set initial video dimensions
		this.camera.dimensions.video.width = maxWidth;
		this.camera.dimensions.video.height = maxHeight;

		// Set result dimensions
		this.camera.dimensions.result.width = maxWidth;
		this.camera.dimensions.result.height = maxHeight;

		// Initialize face dimensions
		this.face.video = this._getCenterAndRadius(maxHeight, maxWidth);

		this._changeDetectorRef.markForCheck();
	}

	private _startNgxVideoInterval(): void {
		if (this._intervals.checkNgxVideo) {
			clearInterval(this._intervals.checkNgxVideo);

			this._intervals.checkNgxVideo = null;
		}

		this._intervals.checkNgxVideo = setInterval(this._checkVideoStreamReady, 100);
	}

	private _checkVideoStreamReady = () => {
		const videoNgx = this.webcamRef?.nativeVideoElement;

		if (!videoNgx) return;

		clearInterval(this._intervals.checkNgxVideo);

		this._intervals.checkNgxVideo = null;

		videoNgx.addEventListener(
			"loadeddata",
			() => {
				this._startFaceDetectionInterval();

				this._setVideoDimensions(videoNgx);
				this._drawOvalCenterAndMask();
			},
			{ once: true }
		);

		this._setVideoDimensions(videoNgx);
		this._drawOvalCenterAndMask();
	};

	private _setVideoDimensions(videoElement: HTMLVideoElement) {
		const actualWidth = videoElement.clientWidth;
		const actualHeight = videoElement.clientHeight;

		this.camera.dimensions.video.height = actualHeight;
		this.camera.dimensions.video.width = actualWidth;
		this.camera.dimensions.result = { height: 0, width: 0, offsetX: 0, offsetY: 0 };

		this._setResultDimensions("result", actualHeight, actualWidth);

		this.face.video = this._getCenterAndRadius(actualHeight, actualWidth);

		const maskResultCanvas = this.maskResultCanvasRef?.nativeElement;

		if (maskResultCanvas) {
			maskResultCanvas.style.marginLeft = `0px`;
			maskResultCanvas.style.marginTop = `0px`;
		}

		this._changeDetectorRef.markForCheck();
	}

	private _getCenterAndRadius(
		height: number,
		width: number
	): { center: { x: number; y: number }; radius: { x: number; y: number }; margin: { x: number; y: number } } {
		const center = {
			x: width / 2,
			y: height / 2,
		};

		const margin = {
			y: height * 0.05,
			x: 0,
		};

		margin.x = margin.y * 0.8;

		const radius = {
			y: height * 0.42,
			x: 0,
		};

		radius.x = radius.y * this.aspectRatio;

		if (radius.x * 2 >= width) {
			radius.x = width * 0.48;
			radius.y = radius.x / this.aspectRatio;
		}

		return { center, radius, margin };
	}

	private _setResultDimensions(type: string, height: number, width: number): void {
		const dimensions = this.camera.dimensions[type as keyof typeof this.camera.dimensions] as any;
		if (!dimensions) return;

		dimensions.height = height;
		dimensions.offsetY = 0;
		dimensions.width = Math.min(2.8 * (this.face.real?.radius?.x || 0), width);
		dimensions.offsetX = (this.face.real?.center?.x || 0) - dimensions.width / 2;
	}

	private _drawOvalCenterAndMask(): void {
		const maskResultCanvas = this.maskResultCanvasRef?.nativeElement;
		if (!maskResultCanvas) {
			return;
		}

		const ctx = maskResultCanvas.getContext("2d");
		if (!ctx) {
			return;
		}

		const videoDim = this.camera.dimensions.video;
		if (!videoDim.width || !videoDim.height) {
			return;
		}
		maskResultCanvas.width = videoDim.width;
		maskResultCanvas.height = videoDim.height;

		const { center, radius } = this.face.video || { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 } };

		ctx.clearRect(0, 0, maskResultCanvas.width, maskResultCanvas.height);

		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
		ctx.fillRect(0, 0, maskResultCanvas.width, maskResultCanvas.height);

		ctx.globalCompositeOperation = "destination-out";

		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.beginPath();
		ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();

		ctx.globalCompositeOperation = "source-over";
	}

	private _drawStatusOval(ctx: any, isOk: boolean): void {
		const { center, radius } = this.face.video || { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 } };

		ctx.beginPath();
		ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
		ctx.lineWidth = 5;
		ctx.strokeStyle = isOk ? "green" : "red";
		ctx.stroke();
		ctx.closePath();
	}

	private _inRange(value: number, min: number, max: number): boolean {
		return value >= min && value <= max;
	}

	private _isFaceCentered(nose: any): void {
		const faceCenterX = nose.x;
		const faceCenterY = nose.y;

		const { center, margin } = this.face.real || { center: { x: 0, y: 0 }, margin: { x: 0, y: 0 } };

		const inRangeX = this._inRange(faceCenterX, center.x - margin.x, center.x + margin.x);
		const inRangeY = this._inRange(faceCenterY, center.y, center.y + margin.y * 2.5);

		const isFaceCentered = inRangeX && inRangeY;

		if (isFaceCentered) return;

		let direction = "";

		if (!inRangeX) direction += `${faceCenterX < center.x - margin.x ? "←" : "→"}`;
		if (!inRangeY) direction += `${faceCenterY < center.y ? "↓" : "↑"}`;

		this.errorFace = {
			canvas: direction,
			subtitle: "Center your face in the oval",
			title: "Center your face",
		};
	}

	private _isFaceClose(landmarks: any): void {
		const realDim = this.camera.dimensions.real || { height: 0, width: 0 };
		const totalFaceArea = landmarks.imageHeight * landmarks.imageWidth;
		const totalImageArea = realDim.height * realDim.width;
		const faceProportion = totalFaceArea / totalImageArea;

		if (faceProportion < this.face.threshold || landmarks.imageHeight < this.face.minPixels || landmarks.imageWidth < this.face.minPixels) {
			this.errorFace = {
				title: "Get closer",
				subtitle: "Move your face closer to the camera",
			};
		}
	}

	private _startFaceDetectionInterval(): void {
		if (this._intervals.detectFace) {
			clearInterval(this._intervals.detectFace);
			this._intervals.detectFace = null;
		}

		this._intervals.detectFace = setInterval(() => {
			this._detectFace();
		}, 100);
	}

	private async _detectFace(): Promise<void> {
		const videoNgx = this.webcamRef?.nativeVideoElement;
		if (!videoNgx || this.response.base64Image) {
			return;
		}

		try {
			const detection = await faceapi.detectAllFaces(videoNgx, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })).withFaceLandmarks();

			const context = this.maskResultCanvasRef?.nativeElement.getContext("2d", { willReadFrequently: true });
			if (!context) return;

			// Always redraw the base oval mask first
			this._drawOvalCenterAndMask();

			if (detection.length > 0) {
				this.lastFace = detection[0];
				this.errorFace = null;

				// Set real dimensions for face positioning calculations
				this.camera.dimensions.real = {
					height: videoNgx.videoHeight,
					width: videoNgx.videoWidth,
					offsetX: 0,
					offsetY: 0,
				};
				this.face.real = this._getCenterAndRadius(videoNgx.videoHeight, videoNgx.videoWidth);

				// Check face positioning
				this._isFaceCentered(this.lastFace.landmarks.getNose()[3]);
				this._isFaceClose(this.lastFace.landmarks);

				// Draw status oval (green if no errors, red if errors)
				this._drawStatusOval(context, !this.errorFace);

				if (!this.errorFace) {
					++this.face.successPosition;
				} else {
					this.face.successPosition = 0;
				}

				// Update liveness detection if active
				if (this.livenessDetection.isActive) {
					this._updateLivenessProgress(this.lastFace);
				} else if (this.face.successPosition > 2) {
					// Capture after 3 successful frames (original behavior)
					this.face.successPosition = 0;
					this._takePicture.next(); // Trigger image capture
					clearInterval(this._intervals.detectFace); // Stop detection after capture
				}
			} else {
				this.face.successPosition = 0;
				this.errorFace = {
					title: "No face detected",
					subtitle: "Please look at the camera",
				};
				// Draw red oval if no face detected
				this._drawStatusOval(context, false);
			}

			this._changeDetectorRef.markForCheck();
		} catch (error: any) {
			console.error("Face detection error:", error);
			const context = this.maskResultCanvasRef?.nativeElement.getContext("2d");
			if (context) this._drawStatusOval(context, false);
		}
	}

	private _setImageOnCanvas(canvas: HTMLCanvasElement, img: HTMLImageElement, dimensions: any, resultDimensions: any): void {
		const context = canvas.getContext("2d");
		if (!context) return;

		canvas.width = resultDimensions.width;
		canvas.height = resultDimensions.height;

		context.drawImage(
			img,
			dimensions.offsetX,
			dimensions.offsetY,
			dimensions.width,
			dimensions.height,
			0,
			0,
			resultDimensions.width,
			resultDimensions.height
		);
	}

	private _takePictureLiveness(img: HTMLImageElement): void {
		const maskResultCanvas = this.maskResultCanvasRef?.nativeElement;
		const toSendCanvas = this.ToSendCanvasRef?.nativeElement;

		if (!maskResultCanvas || !toSendCanvas) return;

		if (!this.camera.dimensions.real || !this.camera.dimensions.result) {
			console.error("Camera dimensions not properly initialized");
			return;
		}

		this._setImageOnCanvas(maskResultCanvas, img, this.camera.dimensions.real, this.camera.dimensions.result);
		this._setImageOnCanvas(toSendCanvas, img, this.camera.dimensions.real, this.camera.dimensions.real);

		this.response.base64Image = toSendCanvas.toDataURL("image/jpeg");
		this.response.isLoading = true;

		this._emitBiometricCapture();
	}

	private async _emitBiometricCapture(): Promise<void> {
		try {
			const base64Data = this.response.base64Image.split(",")[1];

			// Emit biometric success with captured data
			this.onBiometricsSuccess(base64Data, this.masterPassword);
		} catch (error) {
			console.error("Error in biometric capture:", error);
			// Reset loading state
			this.response.isLoading = false;
			this.response.base64Image = "";
			this._changeDetectorRef.markForCheck();
		}
	}

	cameraError(error: WebcamInitError): void {
		console.error("Camera error:", error);

		if (!error.mediaStreamError || error.mediaStreamError.name !== "NotAllowedError") return;

		this.camera.hasPermissions = false;
	}

	processImage(webcamImage: WebcamImage): void {
		if (this.response.base64Image) {
			return;
		}

		const img = new Image();
		img.src = webcamImage.imageAsDataUrl;

		img.onload = async () => {
			if (img.height < this.face.minHeight) {
				this.camera.isLowQuality = true;
				return;
			}

			// This is for capturing the final image after successful liveness detection
			this._takePictureLiveness(img);
		};
	}
}
