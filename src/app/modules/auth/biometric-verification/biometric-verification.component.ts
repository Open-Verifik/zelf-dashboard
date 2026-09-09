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

import { fadeIn } from "@fuse/animations";

import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { translocoKeyForApiErrorCode } from "app/core/i18n/api-error-codes";

@Component({
    selector: "app-data-biometrics",
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, WebcamModule, RouterModule, TranslocoModule],
    templateUrl: "./biometric-verification.component.html",
    styleUrls: ["./biometric-verification.component.scss"],
    animations: [fadeIn],
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
    private _resizeObserver?: ResizeObserver;
    private _onWindowResize = () => this._handleResize();
    /** Guards against queueing detections when one run takes longer than the interval. */
    private _detecting = false;

    // Camera and face detection properties
    camera = {
        isLoading: true,
        hasPermissions: true,
        isLowQuality: false,
        dimensions: {
            video: { width: 0, height: 0, max: { width: 800, height: 600 } },
            real: { width: 0, height: 0, offsetX: 0, offsetY: 0 },
        } as { [key: string]: { width: number; height: number; offsetX?: number; offsetY?: number; max?: { width: number; height: number } } },
        configuration: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
        },
    };

    face = {
        /** Oval as drawn, in CSS pixels of the camera view. */
        video: { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 }, margin: { x: 0, y: 0 } },
        /** Same oval mapped into raw stream pixels, where face-api reports boxes. */
        real: { center: { x: 0, y: 0 }, radius: { x: 0, y: 0 }, margin: { x: 0, y: 0 } },
        minHeight: 224,
        /** Floor on the detected face height so the upload is not upscaled beyond recognition. */
        minFacePixels: 120,
        successPosition: 0,
        /** Consecutive good frames (~100ms each) before auto-capture. */
        successHoldFrames: 12,
        /** Face box must fill this fraction of the oval height before capture. */
        threshold: 0.45,
        /** How far the face center may sit from the oval center, as a fraction of its radii. */
        centerTolerance: 0.25,
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
        private _biometricService: BiometricService,
        private _transloco: TranslocoService,
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

        this._teardownResizeListener();

        // Stop camera stream
        this._stopCamera();

        // Complete observables
        this.unsubscriber$.next();
        this.unsubscriber$.complete();
    }

    private _setupResizeListener(): void {
        this._teardownResizeListener();

        const maskResultCanvas: HTMLCanvasElement | undefined = this.maskResultCanvasRef?.nativeElement;

        if (typeof ResizeObserver !== "undefined" && maskResultCanvas) {
            this._resizeObserver = new ResizeObserver(() => this._handleResize());
            this._resizeObserver.observe(maskResultCanvas);
        }

        window.addEventListener("resize", this._onWindowResize, { passive: true });
        window.addEventListener("orientationchange", this._onWindowResize, { passive: true });
    }

    private _teardownResizeListener(): void {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = undefined;
        }
        window.removeEventListener("resize", this._onWindowResize);
        window.removeEventListener("orientationchange", this._onWindowResize);
    }

    private _handleResize(): void {
        this._drawOvalCenterAndMask();
    }

    get takePicture$(): Observable<void> {
        return this._takePicture.asObservable();
    }

    /**
     * Handle successful biometrics verification
     */
    onBiometricsSuccess(faceBase64: string, password?: string): void {
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
     * Read API error body from Angular HttpErrorResponse (message lives in error.error, not error.message).
     */
    private _apiErrorTextAndCode(error: any): { text: string; code?: string } {
        const body = error?.error;
        if (body && typeof body === "object" && !Array.isArray(body)) {
            return {
                text: typeof body.message === "string" ? body.message : "",
                code: typeof body.code === "string" ? body.code : undefined,
            };
        }
        if (typeof body === "string") {
            try {
                const parsed = JSON.parse(body);
                if (parsed && typeof parsed === "object") {
                    return {
                        text: typeof parsed.message === "string" ? parsed.message : "",
                        code: typeof parsed.code === "string" ? parsed.code : undefined,
                    };
                }
            } catch {
                return { text: body };
            }
        }
        return {
            text: typeof error?.message === "string" ? error.message : "",
            code: typeof error?.code === "string" ? error.code : undefined,
        };
    }

    /**
     * Handle API errors from parent component
     */
    handleApiError(error: any): void {
        console.error("API Error in biometric verification:", error);

        const { text: msg, code } = this._apiErrorTextAndCode(error);
        const lower = msg.toLowerCase();

        const apiKey = translocoKeyForApiErrorCode(code);
        if (apiKey) {
            this.apiError = this._transloco.translate(apiKey);
        } else if (lower.includes("liveness")) {
            this.apiError = this._transloco.translate("errors.api.ERR_LIVENESS_FAILED");
        } else if (lower.includes("multiple face")) {
            this.apiError = this._transloco.translate("biometricVerification.multipleFacesDetected");
        } else if (lower.includes("no face detected")) {
            this.apiError = this._transloco.translate("biometricVerification.noFaceDetectedMessage");
        } else if (lower.includes("face not recognized")) {
            this.apiError = this._transloco.translate("biometricVerification.faceNotRecognized");
        } else if (lower.includes("face is not central") || lower.includes("not central") || lower.includes("close to border")) {
            this.apiError = this._transloco.translate("biometricVerification.faceNotCentral");
        } else if (lower.includes("biometric") || lower.includes("face quality") || lower.includes("face too small") || lower.includes("face too large")) {
            this.apiError = this._transloco.translate("biometricVerification.biometricVerificationFailed");
        } else if (msg && !msg.startsWith("Http failure response")) {
            this.apiError = msg;
        } else {
            this.apiError = this._transloco.translate("biometricVerification.biometricVerificationFailed");
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
     * Surface a liveness failure in a user-friendly way and allow retry
     */
    private _handleLivenessFailure(reason: string): void {
        this.hasApiError = true;
        this.apiError = reason || this._transloco.translate("biometricVerification.livenessCheckFailedReason");
        this.response.isLoading = false;
        this.response.base64Image = "";
        // Ensure detection loop restarts so user can try again without reloading
        this._startFaceDetectionInterval();
        this._changeDetectorRef.markForCheck();
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

    /**
     * Seed the view with a portrait guess. The real numbers come from the first
     * measurement of the camera view once it is laid out.
     */
    private async _setMaxVideoDimensions(): Promise<void> {
        const initialWidth = 440;
        const initialHeight = 587;

        this.camera.dimensions.video.width = initialWidth;
        this.camera.dimensions.video.height = initialHeight;

        this.face.video = this._getCenterAndRadius(initialHeight, initialWidth);

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

                this._drawOvalCenterAndMask();
                this._setupResizeListener();
            },
            { once: true },
        );

        this._drawOvalCenterAndMask();
    };

    /**
     * The mask canvas is stretched to the whole camera view, so its box is the
     * display area by definition. Measuring it avoids depending on the <video>
     * element, which ngx-webcam letterboxes to the stream aspect ratio.
     */
    private _getDisplayBox(): { width: number; height: number } | null {
        const maskResultCanvas: HTMLCanvasElement | undefined = this.maskResultCanvasRef?.nativeElement;

        if (!maskResultCanvas) return null;

        const rect = maskResultCanvas.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        if (!width || !height) return null;

        return { width, height };
    }

    /**
     * Refresh the on-screen oval whenever the display box changes, so a resize,
     * a re-render after an error, or the initial layout all converge.
     */
    private _syncDisplayDimensions(): boolean {
        const box = this._getDisplayBox();

        if (!box) return false;

        const current = this.camera.dimensions.video;

        if (current.width === box.width && current.height === box.height) return true;

        current.width = box.width;
        current.height = box.height;

        this.face.video = this._getCenterAndRadius(box.height, box.width);

        this._changeDetectorRef.markForCheck();

        return true;
    }

    private _getCenterAndRadius(
        height: number,
        width: number,
    ): { center: { x: number; y: number }; radius: { x: number; y: number }; margin: { x: number; y: number } } {
        const center = {
            x: width / 2,
            y: height / 2,
        };

        const margin = {
            y: height * 0.08,
            x: 0,
        };

        margin.x = margin.y;

        const radius = {
            y: height * 0.4,
            x: 0,
        };

        radius.x = radius.y * this.aspectRatio;

        if (radius.x * 2 >= width) {
            radius.x = width * 0.48;
            radius.y = radius.x / this.aspectRatio;
        }

        return { center, radius, margin };
    }

    /**
     * Prepare the mask canvas so drawing happens in CSS pixels at native device
     * resolution. Sizing the backing store to the CSS box is what keeps the oval
     * from being stretched by the browser.
     */
    private _getMaskContext(): CanvasRenderingContext2D | null {
        const maskResultCanvas: HTMLCanvasElement | undefined = this.maskResultCanvasRef?.nativeElement;

        if (!maskResultCanvas) return null;

        const ctx = maskResultCanvas.getContext("2d");

        if (!ctx) return null;

        if (!this._syncDisplayDimensions()) return null;

        const { width, height } = this.camera.dimensions.video;
        const ratio = window.devicePixelRatio || 1;
        const backingWidth = Math.round(width * ratio);
        const backingHeight = Math.round(height * ratio);

        if (maskResultCanvas.width !== backingWidth || maskResultCanvas.height !== backingHeight) {
            maskResultCanvas.width = backingWidth;
            maskResultCanvas.height = backingHeight;
        }

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        return ctx;
    }

    private _drawOvalCenterAndMask(): void {
        const ctx = this._getMaskContext();

        if (!ctx) return;

        const { width, height } = this.camera.dimensions.video;
        const { center, radius } = this.face.video;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "destination-out";

        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.globalCompositeOperation = "source-over";
    }

    private _drawStatusOval(isOk: boolean): void {
        const ctx = this._getMaskContext();

        if (!ctx) return;

        const { center, radius } = this.face.video;

        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = isOk ? "green" : "red";
        ctx.stroke();
        ctx.closePath();
    }

    private _pickPrimaryFace(detection: Array<{ detection?: { box?: { width: number; height: number } } }>): {
        primary: any;
        hasExtraFace: boolean;
    } {
        const ranked = [...detection].sort((a, b) => {
            const areaA = (a.detection?.box?.width || 0) * (a.detection?.box?.height || 0);
            const areaB = (b.detection?.box?.width || 0) * (b.detection?.box?.height || 0);
            return areaB - areaA;
        });
        const primary = ranked[0];
        const primaryHeight = primary?.detection?.box?.height || 0;
        const hasExtraFace = ranked.slice(1).some((face) => (face.detection?.box?.height || 0) >= Math.max(80, primaryHeight * 0.45));

        return { primary, hasExtraFace };
    }

    /**
     * Map the oval the user sees into raw stream pixels, which is the space
     * face-api reports detections in. This is the inverse of `object-fit: cover`:
     * the video is scaled up until it covers the box, then center-cropped.
     */
    private _mapDisplayOvalToVideo(streamWidth: number, streamHeight: number): void {
        const { width, height } = this.camera.dimensions.video;

        if (!width || !height || !streamWidth || !streamHeight) return;

        const scale = Math.max(width / streamWidth, height / streamHeight);
        const offsetX = (width - streamWidth * scale) / 2;
        const offsetY = (height - streamHeight * scale) / 2;

        this.face.real = {
            center: {
                x: (this.face.video.center.x - offsetX) / scale,
                y: (this.face.video.center.y - offsetY) / scale,
            },
            radius: {
                x: this.face.video.radius.x / scale,
                y: this.face.video.radius.y / scale,
            },
            margin: {
                x: this.face.video.margin.x / scale,
                y: this.face.video.margin.y / scale,
            },
        };
    }

    /**
     * The preview is mirrored by CSS while detections come back in unmirrored
     * stream coordinates. Flipping the box puts it in the same orientation the
     * user sees, which is what the guidance arrows have to be based on. The oval
     * is horizontally centered, so this does not change the containment result.
     */
    private _mirrorBox(
        box: { x: number; y: number; width: number; height: number },
        streamWidth: number,
    ): { x: number; y: number; width: number; height: number } {
        return { x: streamWidth - box.x - box.width, y: box.y, width: box.width, height: box.height };
    }

    private _isFaceInsideOval(box: { x: number; y: number; width: number; height: number } | undefined): boolean {
        if (!box) return false;

        const { center, radius } = this.face.real;
        if (!radius.x || !radius.y) return false;

        const dx = (box.x + box.width / 2 - center.x) / radius.x;
        const dy = (box.y + box.height / 2 - center.y) / radius.y;

        if (Math.hypot(dx, dy) > this.face.centerTolerance) return false;

        // Only the extent is checked, not the corners: a rectangle large enough to
        // fill the oval always pokes its corners outside of it.
        return box.width <= radius.x * 2 * 0.95 && box.height <= radius.y * 2 * 0.95;
    }

    private _setCenterFaceError(box: { x: number; y: number; width: number; height: number } | undefined): void {
        const { center } = this.face.real;
        const faceCenterX = box ? box.x + box.width / 2 : 0;
        const faceCenterY = box ? box.y + box.height / 2 : 0;
        let direction = "";

        if (faceCenterX < center.x) direction += "→";
        if (faceCenterX > center.x) direction += "←";
        if (faceCenterY < center.y) direction += "↓";
        if (faceCenterY > center.y) direction += "↑";

        this.errorFace = {
            canvas: direction,
            subtitle: this._transloco.translate("biometricVerification.centerFaceSubtitle"),
            title: this._transloco.translate("biometricVerification.centerFace"),
        };
    }

    /**
     * Judged against the oval rather than an absolute pixel size: the API's 224px
     * face box requirement applies to the uploaded crop, which `_computeOutputSize`
     * guarantees independently of the webcam resolution.
     */
    private _isFaceCloseEnough(box: { width?: number; height?: number } | undefined): boolean {
        const ovalHeight = this.face.real.radius.y * 2;
        const faceHeight = box?.height || 0;

        if (ovalHeight <= 0) return false;

        return faceHeight >= ovalHeight * this.face.threshold && faceHeight >= this.face.minFacePixels;
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
        if (!videoNgx || this.response.base64Image || this._detecting) {
            return;
        }

        if (!videoNgx.videoWidth || !videoNgx.videoHeight) return;

        this._detecting = true;

        try {
            const detection = await faceapi.detectAllFaces(videoNgx, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceLandmarks();

            // Always redraw the base oval mask first
            this._drawOvalCenterAndMask();

            if (detection.length > 0) {
                this.camera.dimensions.real = {
                    height: videoNgx.videoHeight,
                    width: videoNgx.videoWidth,
                    offsetX: 0,
                    offsetY: 0,
                };
                this._mapDisplayOvalToVideo(videoNgx.videoWidth, videoNgx.videoHeight);

                const { primary, hasExtraFace } = this._pickPrimaryFace(detection);
                this.lastFace = primary;
                this.errorFace = null;

                const detectedBox = primary.detection?.box;
                const box = detectedBox ? this._mirrorBox(detectedBox, videoNgx.videoWidth) : undefined;

                if (hasExtraFace) {
                    this.errorFace = {
                        title: this._transloco.translate("biometricVerification.multipleFacesDetected"),
                        subtitle: this._transloco.translate("biometricVerification.noFaceDetectedSubtitle"),
                    };
                } else if (!this._isFaceCloseEnough(box)) {
                    this.errorFace = {
                        title: this._transloco.translate("biometricVerification.getCloser"),
                        subtitle: this._transloco.translate("biometricVerification.getCloserSubtitle"),
                    };
                } else if (!this._isFaceInsideOval(box)) {
                    this._setCenterFaceError(box);
                }

                this._drawStatusOval(!this.errorFace);

                if (!this.errorFace) {
                    ++this.face.successPosition;
                } else {
                    this.face.successPosition = 0;
                }

                if (this.livenessDetection.isActive) {
                    this._updateLivenessProgress(this.lastFace);
                } else if (this.face.successPosition >= this.face.successHoldFrames) {
                    this.face.successPosition = 0;
                    this._takePicture.next();
                    clearInterval(this._intervals.detectFace);
                }
            } else {
                this.face.successPosition = 0;
                this.errorFace = {
                    title: this._transloco.translate("biometricVerification.noFaceDetected"),
                    subtitle: this._transloco.translate("biometricVerification.noFaceDetectedSubtitle"),
                };
                // Draw red oval if no face detected
                this._drawStatusOval(false);
            }

            this._changeDetectorRef.markForCheck();
        } catch (error: any) {
            console.error("Face detection error:", error);
            this._drawStatusOval(false);
        } finally {
            this._detecting = false;
        }
    }

    private _drawCrop(
        canvas: HTMLCanvasElement,
        img: HTMLImageElement,
        src: { x: number; y: number; width: number; height: number },
        dst: { width: number; height: number },
    ): void {
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = dst.width;
        canvas.height = dst.height;
        context.drawImage(img, src.x, src.y, src.width, src.height, 0, 0, dst.width, dst.height);
    }

    /**
     * Crop around the detected face with ≥25px / ~40% padding so the uploaded
     * still is centered and not flush against the image border.
     * See FACE-CAPTURE.md.
     *
     * Detection boxes and the snapshot share the same unmirrored stream space:
     * `mirrorImage` is a CSS transform on the preview, and ngx-webcam's
     * `takeSnapshot()` draws the raw video frame. So no flip belongs here.
     */
    private _computeFaceCrop(imgWidth: number, imgHeight: number): { x: number; y: number; width: number; height: number } | null {
        const box = this.lastFace?.detection?.box;
        if (!box?.width || !box?.height) return null;
        if (box.height < this.face.minFacePixels) return null;

        const padX = Math.max(25, box.width * 0.4);
        const padY = Math.max(25, box.height * 0.4);

        let x = box.x - padX;
        let y = box.y - padY;
        let width = box.width + padX * 2;
        let height = box.height + padY * 2;

        if (x < 0) {
            width += x;
            x = 0;
        }
        if (y < 0) {
            height += y;
            y = 0;
        }
        if (x + width > imgWidth) width = imgWidth - x;
        if (y + height > imgHeight) height = imgHeight - y;

        if (width <= 0 || height <= 0) return null;

        return { x, y, width, height };
    }

    /**
     * Size the upload so the face box lands near 360px tall. Uploading the crop at
     * its source size leaves the face box hovering around the API's 224px minimum
     * on lower-resolution webcams. See FACE-CAPTURE.md.
     */
    private _computeOutputSize(crop: { width: number; height: number }, faceHeight: number): { width: number; height: number } {
        const targetFaceHeight = 360;
        const maxEdge = 1280;

        let scale = faceHeight > 0 ? targetFaceHeight / faceHeight : 1;
        const longest = Math.max(crop.width, crop.height);

        if (longest * scale > maxEdge) scale = maxEdge / longest;

        return {
            width: Math.round(crop.width * scale),
            height: Math.round(crop.height * scale),
        };
    }

    private _takePictureLiveness(img: HTMLImageElement): void {
        const toSendCanvas = this.ToSendCanvasRef?.nativeElement;

        if (!toSendCanvas) return;

        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;
        const crop = this._computeFaceCrop(imgWidth, imgHeight);

        if (!crop) {
            console.error("Face crop is not ready");
            this.response.base64Image = "";
            this.response.isLoading = false;
            this._startFaceDetectionInterval();
            return;
        }

        const sendDst = this._computeOutputSize(crop, this.lastFace?.detection?.box?.height || 0);
        this._drawCrop(toSendCanvas, img, crop, sendDst);

        this.response.base64Image = toSendCanvas.toDataURL("image/jpeg", 0.92);
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
