# Portfolio Payment Images

## Current Status

The payment page has been created with **visual representations** for all sections:

✅ **Steps Section**: Already implemented with CSS/HTML visualizations:
- **Step 1**: Shows app icons grid (app visualization)
- **Step 2**: Shows search bar input field
- **Step 3**: Shows security/password fields with biometric icon
- **Step 4**: Shows domain name with cursor pointer

## Optional: Download Actual Images from Website

If you want to replace the visual representations with actual images from https://payment.zelf.world/, follow these steps:

### Option 1: Using Browser Developer Tools
1. Open https://payment.zelf.world/ in your browser
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to the "Network" tab
4. Refresh the page
5. Filter by "Img" to see all images
6. Look for images related to:
   - Mobile phone mockups (QR encryption screen)
   - Wallet app screens
   - Step-by-step visualizations
7. Right-click on each image and "Save image as..."
8. Save them to this directory: `src/assets/images/portfolio-payment/`

### Option 2: Using curl/wget
You can download images directly:
```bash
# Navigate to the images directory
cd src/assets/images/portfolio-payment/

# Download images (replace URLs with actual image URLs from the site)
curl -O [image-url-1]
curl -O [image-url-2]
# etc...
```

### Required Images
Based on the screenshot, you'll need:
1. QR Encryption phone mockup
2. Wallet app phone mockup
3. Step 1 visualization (app/extension icons)
4. Step 2 visualization (search bar)
5. Step 3 visualization (security/biometric)
6. Step 4 visualization (domain completion)

### Update Component
Once images are downloaded, update the component template to reference them:
```html
<img src="assets/images/portfolio-payment/qr-encryption.png" alt="QR Encryption">
<img src="assets/images/portfolio-payment/wallet-app.png" alt="Wallet App">
```

