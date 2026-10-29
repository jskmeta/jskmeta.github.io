# JSK Meta — Official Studio Website & Developer Portal

[![CI](https://github.com/jskmeta/jskmeta.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/jskmeta/jskmeta.github.io/actions/workflows/ci.yml)
[![Website](https://img.shields.io/badge/website-jskmeta.com-2563eb)](https://www.jskmeta.com)
[![Entity](<https://img.shields.io/badge/entity-JSK%20META%20LLC%20(Virginia)-10b981>)](https://www.jskmeta.com/#about)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Official website, application showcase, and legal verification hub for **JSK META LLC**, an independent mobile software engineering studio based in Virginia, USA.

---

## 🎯 Studio Manifesto

JSK Meta builds focused, high-fidelity mobile tools designed to do one thing exceptionally well:

1. **Zero Surveillance**: No analytics SDKs, no behavioral trackers, no advertising frameworks. What you calculate, inspect, or examine stays exclusively in device memory.
2. **Offline-First Resilience**: All tools operate 100% offline without remote server dependencies. They work seamlessly underground, on airplanes, or in low-connectivity areas.
3. **Native Speed & Precision**: Engineered using native mobile toolkits (SwiftUI on iOS, Jetpack Compose on Android, modern web components on Web) for instant launches and minimal battery consumption.

---

## 📱 Application Portfolio

### Featured Release: Squint — Magnifier & Light

| Platform    | Target SDK / Runtime                                | Package Identifier           | Status            |
| :---------- | :-------------------------------------------------- | :--------------------------- | :---------------- |
| **iOS**     | iOS 17.0+ (SwiftUI + AVFoundation)                  | `com.jskmeta.squint`         | Release Candidate |
| **Android** | Android 7.0+ (API 24–35, Jetpack Compose + CameraX) | `com.jskmeta.squint`         | Release Candidate |
| **Web PWA** | Modern Web (Vite + TypeScript + Web Components)     | `https://squint.jskmeta.com` | Production Ready  |

#### Key Capabilities

- **Continuous 0.5x – 10x Optical Zoom**: Smooth scaling curve with tap-to-focus and exposure lock.
- **Precision Torch Controls**: Multi-step LED flashlight adjustment to eliminate reflection and glare.
- **Freeze & 24-Hour Retention**: Stable examination with automated local cleanup of unpinned captures after 24 hours.
- **Real-Time Visual Filters**: High-contrast accessibility modes (monochrome, inverted, high contrast).

---

## 🏛️ Verified Entity & Compliance

| Requirement                      | Value                                                  | Verification                                  |
| :------------------------------- | :----------------------------------------------------- | :-------------------------------------------- |
| **Legal Entity**                 | JSK META LLC                                           | Commonwealth of Virginia SCC                  |
| **Developer Organization**       | D-U-N-S Verified                                       | Dun & Bradstreet / Apple / Google Play        |
| **Support Email**                | `support@jskmeta.com`                                  | Verified Domain MX                            |
| **Store Listing Privacy Policy** | [`privacy.html`](https://www.jskmeta.com/privacy.html) | Apple Guideline 5.1.1 & Google Play User Data |
| **Terms of Service**             | [`terms.html`](https://www.jskmeta.com/terms.html)     | Standard software utility license             |

---

## 🛠️ Local Development & Quality Assurance

This repository uses modern web standards (semantic HTML5, modern CSS with `light-dark()`, and pure SVG assets) with zero runtime dependencies.

### Prerequisites

- Node.js 22+
- pnpm 10.33+

### Setup

```bash
# Clone the repository
git clone git@github.com:jskmeta/jskmeta.github.io.git
cd jskmeta.github.io

# Install development & CI dependencies
pnpm install
```

### Local Preview

```bash
# Serve locally via Python
pnpm run serve
# Open http://localhost:8000
```

### Code Quality & Link Verification

```bash
# Run Prettier format check and asset/anchor verification
pnpm run lint

# Automatically format HTML, CSS, and Markdown
pnpm run format
```

---

## 📐 Conventional Commits & CI Enforcement

All commits and Pull Request titles must conform to [Conventional Commits](https://www.conventionalcommits.org/) and adhere to a strict **92-character title limit** (to satisfy squash-merge headers):

```bash
<type>(<scope>): <short description>
```

### Allowed Scopes

- `web`: Landing page and web structure (`index.html`)
- `content`: Marketing copy, manifesto, and application listings
- `style`: CSS tokens, color schemes, and responsive typography (`css/style.css`)
- `legal`: Privacy policy, terms of service, and regulatory declarations
- `assets`: Logos, mockups, and screenshots
- `ci`: GitHub Actions workflows and automation
- `docs`: Repository README and documentation
- `deps`: Dependencies and tooling upgrades
- `release`: Production tagging and deployment notes

### CI Pipeline

Every Pull Request triggers [`.github/workflows/ci.yml`](.github/workflows/ci.yml) which executes:

1. **Hygiene Scan**: Verifies no sensitive keystores, credentials, or private keys are tracked in git.
2. **Formatting & Integrity Check**: Verifies Prettier compliance and runs `scripts/check-links.js` to ensure all relative links and anchor hashes resolve.
3. **Commit & PR Title Linting**: Enforces Conventional Commits with scope validation across all branch commits and the squashed PR header.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
