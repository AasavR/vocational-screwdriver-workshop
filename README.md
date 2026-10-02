# Vocational VR Screwdriver Workshop — Client Portal & WebGL Simulator

Interactive client presentation portal and 3D WebGL simulator for the **Meta Quest Vocational VR Screwdriver Training Module**, built with **Unity 6 (6000.6.0f1)** and **Three.js**.

---

## 🌟 Live Client Portal & Simulator

- **Interactive 3D WebGL Simulator**: Test tool translation, engagement snapping, mechanical ratchet rotation, and thread release directly in your web browser.
- **Direct Meta Quest APK Download**: Sideloadable standalone Android build (`ScrewdriverWorkshop.apk`, 17.5 MB).
- **Comprehensive VR Specs & Mappings**: Full controller breakdown for Meta Quest 2, Quest 3, and Quest Pro.

---

## 🕹️ Controls Guide (Simulator & Unity)

| Action | Web Simulator Key | VR Controller (Meta Quest) |
|---|---|---|
| **Translate Screwdriver** | `W`, `A`, `S`, `D` or `Arrow Keys` | Primary Thumbstick (Tilt) |
| **Lower & Lock into Fastener** | `E` Key or On-screen Button | Index Trigger (Pull) |
| **Spin & Unscrew Fastener** | `Space` or Click & Hold | `A` Button (Hold) |
| **Raise & Disengage Tool** | `Q`, `Shift`, or `Escape` | Hand Grip (Squeeze) |
| **Toggle Mode (Unscrew / Fasten)** | `R` Key | `B` Button (Press) |
| **Snap to Next Fastener** | Center `◎` Button | Auto-assist indicator |

---

## 📦 Deliverables & Repository Structure

- `index.html`: Modern high-tech industrial client portal UI with glassmorphism HUD.
- `app.js`: High-performance Three.js WebGL simulation engine with procedural & OBJ model loading, realistic physics kinematics, and Web Audio API ratcheting synthesizer.
- `styles.css`: Dark industrial theme with real-time responsive HUD and controls.
- `ScrewdriverWorkshop.apk`: Standalone Meta Quest OpenXR Android package (17.5 MB).
- `models/`: High-detail 3D screwdriver and titanium fastener models.

---

## 🚀 Meta Quest Sideloading Instructions

1. Connect your Meta Quest 2 / 3 / Pro to your PC via USB-C with Developer Mode enabled.
2. Open a terminal and run:
   ```bash
   adb install -r ScrewdriverWorkshop.apk
   ```
3. Put on the headset, navigate to **App Library > Unknown Sources**, and launch **ScrewdriverWorkshop**.
