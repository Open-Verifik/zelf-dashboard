# Face-API Models

This directory should contain the face-api.js models for biometric verification.

## Required Models

Download the following models from the face-api.js repository and place them in this directory:

1. **ssd_mobilenetv1_model-weights_manifest.json** and **ssd_mobilenetv1_model-weights.bin**
2. **face_landmark_68_model-weights_manifest.json** and **face_landmark_68_model-weights.bin**  
3. **face_recognition_model-weights_manifest.json** and **face_recognition_model-weights.bin**

## Download Instructions

You can download these models from:
- https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Or use the following commands:

```bash
# Create the models directory
mkdir -p public/assets/models

# Download the models (replace with actual URLs)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights.bin
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights.bin
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights.bin
```

## Fallback Behavior

If the models are not available, the biometric verification will use a fallback detection method for development purposes. In production, ensure the models are properly loaded for accurate face detection.
