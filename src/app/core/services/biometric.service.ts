import * as faceapi from "@vladmandic/face-api";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class BiometricService {
	private _faceapi: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor() {
		this.loadModels();
	}

	get faceapi$(): Observable<boolean> {
		return this._faceapi.asObservable();
	}

	async loadModels(): Promise<void> {
		const promises = [];

		promises.push(faceapi.nets.ssdMobilenetv1.loadFromUri("assets/models"));
		promises.push(faceapi.nets.faceLandmark68Net.loadFromUri("assets/models"));

		await Promise.allSettled(promises);

		this._faceapi.next(true);
	}
}
