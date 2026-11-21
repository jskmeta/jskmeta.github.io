# JSK Meta & Squint: Studio Handoff Document

**Date:** November 2026  
**Repositories:**

- Studio Website: [`jskmeta.github.io`](https://github.com/jskmeta/jskmeta.github.io) (`https://jskmeta.com`)
- Squint Monorepo: [`../squint`](file:///Users/shailesh/sp-code/jskmeta/squint) (`com.jskmeta.squint`)

---

## 1. Executive Summary & Key Milestones

1. **Squint is Live on Google Play:**
   - Package ID: `com.jskmeta.squint`
   - Store Listing: [https://play.google.com/store/apps/details?id=com.jskmeta.squint](https://play.google.com/store/apps/details?id=com.jskmeta.squint)
   - Release Version: Code 3 / Version 1.0.0
2. **Apple App Store Strategy:**
   - Apple requires a recurring **$99/year** developer membership, compared to Google Play's **$25 one-time** fee.
   - Decision: Focus on Android user feedback, stabilization, and traction first before incurring Apple's recurring annual fee. iOS app codebase (`apps/ios`) is prepared and builds cleanly with SwiftUI & AVFoundation.
3. **Studio Web Presence (`jskmeta.com`):**
   - Brand identity redesigned with the modern Studio Squircle monogram.
   - D-U-N-S verification badge removed from the consumer-facing front page.
   - Authentic production screenshots framed in an iPhone chassis with an interactive **Live Viewfinder** vs. **Freeze Inspection** switcher.
   - Store CTA links directly to the live Google Play listing.

---

## 2. Android App Enhancements & Fixes (`apps/android`)

All modifications were implemented in [`apps/android/app/src/main/java/com/jskmeta/squint/ui/MagnifierScreen.kt`](file:///Users/shailesh/sp-code/jskmeta/squint/apps/android/app/src/main/java/com/jskmeta/squint/ui/MagnifierScreen.kt) and verified with `./gradlew compileDebugKotlin`, `./gradlew compileReleaseKotlin`, and `./gradlew test`.

### A. Zoom Scrollbar Jitter & Narrowing Fix

- **Issue:** When dragging the vertical zoom slider, the drag tooltip (`Box` with `offset(x = -78.dp)`) was added inside a flexible parent `Box` with `Alignment.CenterEnd`. This caused the parent layout pass to expand left and squeeze the rail column, jumping back on release.
- **Resolution:**
  - Locked the outer container to a fixed width of `52.dp`.
  - Moved the floating tooltip to draw-time translation: `.graphicsLayer { translationX = -64.dp.toPx() }`.
  - The rail's measured geometry remains 100% stable while dragging.

### B. Scrollbar Clearance & Padding

- **Issue:** On tall flagship displays like the Pixel 11 Pro XL, the vertical scrollbar was too close to the top `Controls` button and bumped into the bottom `Freeze` button.
- **Resolution:**
  - Updated padding to `.padding(top = 76.dp, bottom = 144.dp, end = 12.dp)`.
  - Provides comfortable clearance above the bottom bar and below the status bar HUD.

### C. Full-Screen Gestures (Zoom & Brightness Anywhere)

- **Feature:** Users can now control magnification and exposure without needing to target small slider handles:
  - **Vertical Swipe (Up/Down):** 1-finger vertical dragging anywhere across the screen smoothly adjusts zoom (`0.5x` to `15.0x`).
  - **Horizontal Swipe (Left/Right):** 1-finger horizontal dragging anywhere across the screen smoothly adjusts brightness (`0.5x` to `10.0x`).
  - Both the right vertical rail and the bottom brightness slider update their fill and thumbs in real time.
  - Multi-touch pinch-to-zoom and tap-to-meter/focus remain fully active.
  - In frozen mode, dragging continues to pan the frozen frame.

### D. True Hardware Exposure Compensation vs. White Overlay Haze

- **Issue:** Increasing brightness was previously drawing a semi-transparent `Color.White.copy(alpha = boostAlpha)` overlay box over the camera preview, washing out black levels and creating a foggy white haze.
- **Resolution:**
  - Removed the fake white box overlay completely.
  - Integrated native CameraX hardware exposure compensation:
    ```kotlin
    val exposureState = cam.cameraInfo.exposureState
    if (exposureState.isExposureCompensationSupported) {
        val range = exposureState.exposureCompensationRange
        val targetIndex = if (uiState.lightIntensity >= 1.0f) {
            val frac = ((uiState.lightIntensity - 1.0f) / 9.0f).coerceIn(0f, 1f)
            (frac * range.upper).roundToInt()
        } else {
            val frac = ((1.0f - uiState.lightIntensity) / 0.5f).coerceIn(0f, 1f)
            (range.lower * frac).roundToInt()
        }.coerceIn(range.lower, range.upper)

        cam.cameraControl.setExposureCompensationIndex(targetIndex)
    }
    ```
  - Directly commands the phone's Image Signal Processor (ISP) and sensor analog gain (ISO), delivering crisp optical illumination with true contrast.

### E. Immersive Auto-Hide on Idle

- **Feature:** Gives users an unobstructed, edge-to-edge view of the camera feed during prolonged inspection:
  - After **3.5 seconds** of inactivity, top HUD buttons (`Rear/Front`, `Flash`, `History`, `Controls`), status badges, and the vertical zoom scrollbar smoothly fade and slide out of view.
  - Any tap, swipe, or touch anywhere on the screen immediately wakes and reveals the UI (`wakeHud()`).
  - While dragging or when modal menus (Controls, History, Settings) are open, the auto-hide timer is held.

---

## 3. Studio Website Updates (`jskmeta.github.io`)

1. **Direct Google Play Integration:**
   - [`index.html`](file:///Users/shailesh/sp-code/jskmeta/jskmeta.github.io/index.html): Store badge now links directly to `https://play.google.com/store/apps/details?id=com.jskmeta.squint` (`target="_blank" rel="noopener noreferrer"`).
2. **Authentic App Visuals & Interactive Switcher:**
   - Framed native high-res screenshots from `../squint/docs/assets/screenshots/` in an iPhone titanium frame with transparent corners.
   - Embedded interactive tabs allowing visitors to switch between the **Live Viewfinder** and **Freeze Inspection** (prescription label magnification).
3. **Code Quality & CI:**
   - Automated Prettier formatting and link checking (`scripts/check-links.js`) pass on every push.
   - Deployed live via GitHub Pages.

---

## 4. Operational Runbook & Next Steps

### Publishing the Next Android Update (e.g. v1.0.1 / VersionCode 4)

1. **Bump Version in [`apps/android/app/build.gradle.kts`](file:///Users/shailesh/sp-code/jskmeta/squint/apps/android/app/build.gradle.kts):**
   ```kotlin
   val resolvedVersionCode = 4
   val resolvedVersionName = "1.0.1"
   ```
2. **Add Release Changelog:**
   - Create `apps/android/fastlane/metadata/android/en-US/changelogs/4.txt` with notes:
     ```
     - Full-screen swipe gestures: swipe vertically anywhere to zoom, horizontally to brighten
     - Real hardware exposure control replacing screen haze
     - Auto-hide controls on idle for clear, unobstructed inspection
     - Stabilized zoom scrollbar and improved button clearance
     ```
3. **Build Signed Release Bundle:**
   ```bash
   cd apps/android
   ./gradlew :app:bundleRelease
   ```
   - Output bundle: `apps/android/app/build/outputs/bundle/release/app-release.aab`
4. **Upload to Google Play Console:**
   - Upload `app-release.aab` to the **Production** or **Internal Testing** track.
