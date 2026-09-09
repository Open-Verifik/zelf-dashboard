# Face capture requirements

The encrypt / decrypt / payment APIs run a live-face check on the still JPEG we upload. Most `422` failures (`FACE IS NOT CENTRAL`, `ERR_LIVENESS_FACE_CLOSE_TO_BORDER`, `ERR_LIVENESS_FAILED`, `FACE TOO SMALL`) mean the **image** did not meet these rules — not that payment failed.

The camera in `biometric-verification.component.ts` must satisfy this contract before it emits `faceBase64`.

## Image

- Prefer a portrait (or square) crop. Minimum useful size is about **600×800**.
- High quality, well lit, no heavy backlight. No fisheye. Sunglasses are not supported.
- Do not cut through the face (chin, forehead, or ears missing).
- The face should take **at least about 1/4 of the image area**, and stay **clear of the edges**.

## Face

- **One main face.** Extra small faces in the far background are ignored; a second nearby face (another person in frame) fails.
- The face must be **fully visible** and unobstructed (no hand, mask, or heavy crop).
- Face box at least **224×224 pixels** in the uploaded image.
- At least **25 pixels** of padding between the face box and every image border. Less than that returns `ERR_LIVENESS_FACE_CLOSE_TO_BORDER`.
- Distance between the pupils at least **80 pixels** (get closer; a distant head in a wide room shot will fail).
- Head turn (pitch / yaw) within about **±30 degrees**. Look at the camera; do not profile.
- Face must be **centered** in the uploaded image. A person sitting to one side of a wide frame returns `FACE IS NOT CENTRAL`.

## What the camera should do

1. Wait until the largest face sits **inside the oval**, fills most of it, and stays there for about **one second**. Do not snap on the first green frame.
2. If more than one sizable face is visible, block capture.
3. Upload a crop **around that face** with ≥25px (about 40%) padding — not the full webcam room, and not a tight oval that kisses the cheeks.
4. Keep the modal open on these 422s so the user can retry in place.

## Typical API codes

| Code / message | Usual cause |
| --- | --- |
| `FACE IS NOT CENTRAL` | Full-frame room shot, or face in the top/side of the crop |
| `ERR_LIVENESS_FACE_CLOSE_TO_BORDER` | Crop too tight; cheeks/forehead near the JPEG edge |
| `FACE TOO SMALL` | User too far; face box under ~224px |
| `ERR_LIVENESS_FAILED` | Spoof, motion, occlusion, glasses, or a poor still |
| `MULTIPLE FACE` | Two people close to the camera |
