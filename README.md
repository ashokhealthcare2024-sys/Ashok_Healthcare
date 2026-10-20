# Ashok Home Healthcare Services — Web Portal

> **Bengaluru's Premier Home ICU, Nursing, Rehabilitation, and Medical Equipment Portal.**
> Supervised by former Apollo Hospitals clinical nurse leaders.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start (One-Command Startup)](#-quick-start-one-command-startup)
- [Available Scripts](#-available-scripts)
- [Cross-Platform Compatibility (Windows, macOS, Linux)](#-cross-platform-compatibility-windows-macos-linux)
- [Zero-Dependency Local Server Option](#-zero-dependency-local-server-option)
- [Project Directory Layout](#-project-directory-layout)
- [Environment Configuration](#-environment-configuration)
- [Production Build & Deployment](#-production-build--deployment)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🏥 Overview

Ashok Home Healthcare Services delivers hospital-grade clinical treatments, 24/7 bedside nursing, critical care home ICU installations, motorized hospital beds, and neuro/orthopedic rehabilitation directly to patients across Yeshwanthpur and all of Bengaluru.

This repository contains the complete responsive web application, photo/video clinical gallery, assessment booking systems, and equipment rental portals.

---

## 🛠 Technology Stack

- **Markup & Structure**: Semantic HTML5 (W3C validated, accessibility-ready)
- **Styling**: Bootstrap 5.3 + Custom BEM CSS Design System (`assets/css/`)
- **Interactive Logic**: Vanilla JavaScript ES6+ (`assets/js/`)
- **Architecture**: 100% Pure Static (Zero dependencies, No Node.js / npm, No backend server required)
- **Portability**: Standard relative paths, UTF-8 encoding, works offline or on any static hosting

---

## 🚀 Quick Start (Zero Setup Needed)

### 1. Direct Browser Opening
Simply double-click [index.html](file:///c:/Users/ratho/OneDrive/Documents/client%20projects/OCT%202026/ashok/Ashok_Healthcare-main%20%281%29/index.html) in your file manager to open it directly in Chrome, Edge, Safari, or Firefox.

### 2. VS Code Live Server (Optional)
Right click `index.html` in VS Code and select **"Open with Live Server"**.

### 3. Lightweight Local Server (Optional - Python)
If you prefer running a local HTTP server without any installations:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.

---

## 🌐 Hosting & Deployment

Because this is a pure static website:
- **cPanel / Apache / Nginx**: Upload files directly to your `public_html` directory (standard `.htaccess` is included).
- **GitHub Pages**: Push this repository and enable GitHub Pages on the `main` branch.
- **Vercel / Netlify / Cloudflare Pages**: Connect the repository with **Zero Build Command** and publish directory set to `/` (root).

---

## 📁 Project Directory Layout

```text
├── index.html              # Homepage with 24/7 emergency dispatch and clinical hero
├── about.html              # About Ashok Healthcare, clinical leadership and team
├── services.html           # Full clinical healthcare services directory
├── products.html           # Surgical equipment rental and sales catalog
├── gallery.html            # Photo & Video Gallery with separated filter and lightboxes
├── careers.html            # Nursing, physiotherapy, and medical caregiver hiring portal
├── blog.html               # Healthcare insights, clinical guides and patient advice
├── contact.html            # Yeshwanthpur clinical hub dispatch, map and contact form
├── privacy.html            # Privacy Policy
├── terms.html              # Terms of Service
├── 404.html                # Custom 404 error page
│
├── services/               # Clinical specialty detail pages
│   ├── home-nursing.html
│   ├── home-icu.html
│   ├── rehabilitation.html
│   ├── physiotherapy.html
│   ├── elder-care.html
│   ├── diagnostic-services.html
│   └── ambulance.html
│
├── blog/                   # Evidence-based clinical blog articles
│   ├── best-home-healthcare-services-in-bangalore.html
│   ├── home-nursing-services-in-bangalore-complete-guide.html
│   ├── bipap-machine-in-yeshwanthpur-expert-home-healthcare...html
│   ├── home-icu-setup-bangalore.html
│   ├── physiotherapy-at-home-after-surgery.html
│   └── elder-care-services-guide.html
│
├── Gallery/                # High-definition clinical photos and demo MP4 videos
│   ├── gallery_1/          # 81 photos + 13 clinical videos
│   ├── gallery_2/          # 22 photos + 1 clinical video
│   └── gallery_3/          # 5 photos
│
├── assets/
│   ├── css/                # Bootstrap 5 + custom production stylesheets
│   │   ├── style.css       # Core stylesheet & design tokens
│   │   └── components/     # Modular component CSS (header, cards, gallery, modals)
│   └── js/                 # Client-side scripts
│       ├── gallery.js      # Dynamic gallery data, filtering, and popup lightbox
│       ├── modals.js       # Global modal dialogs and form handlers
│       ├── navigation.js   # Desktop navbar and mobile drawer
│       ├── component-loader.js # In-memory and asynchronous component loader
│       └── forms.js        # Contact validation and WhatsApp dispatch
│
├── components/             # Reusable modular HTML snippets (header, footer, modals)
├── package.json            # Scripts, metadata, and dependencies
├── vite.config.js          # Cross-platform multi-page Vite build configuration
├── server.js               # Zero-dependency local Node.js HTTP server
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules for build and OS temporary files
└── test/
    └── check_compatibility.js # Automated verification test suite
```

---

## 🔒 Environment Configuration

To configure local ports or organizational parameters:

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Available variables:
   ```env
   PORT=8080
   HOST=0.0.0.0
   NODE_ENV=development
   SITE_URL=https://ashokhealthcare.in
   CONTACT_PHONE=+917829753538
   WHATSAPP_NUMBER=917829753538
   CONTACT_EMAIL=contact@ashokhealthcare.com
   ```

---

## 🚢 Production Build & Deployment

To generate an optimized production bundle:

```bash
npm run build
```

This compiles all HTML files, minifies stylesheets and assets, and packages all static directories (`Gallery/`, `images/`, `Bg_Banner/`, `components/`) into the `dist/` directory.

### Deploying the `dist/` Folder:
- **Vercel / Netlify / Cloudflare Pages**: Set build command to `npm run build` and publish directory to `dist`.
- **Apache / Nginx**: Copy the contents of `dist/` to your web root (`/var/www/html/`).
- **Static Hosting**: Upload `dist/` directly to AWS S3, Google Cloud Storage, or GitHub Pages.

### cPanel Git™ Version Control Deployment:
This repository includes a pre-configured [`.cpanel.yml`](.cpanel.yml) and [`.htaccess`](.htaccess) for automated deployment on cPanel:
1. In cPanel, navigate to **Git™ Version Control** and clone/link your repository.
2. In [`.cpanel.yml`](.cpanel.yml), ensure `DEPLOYPATH` matches your cPanel home directory (e.g., `/home/username/public_html`).
3. Click **"Deploy HEAD Commit"** under the **Manage** tab to automatically publish all web pages, assets, components, and media.

---

## 🧪 Testing & Quality Assurance

Run the automated test suite to verify project integrity:

```bash
npm test
```

This checks:
- Node engine version compatibility
- Presence and non-emptiness of all 24 HTML pages
- Integrity of all client-side JavaScript modules
- Integrity of all CSS component stylesheets
- Existence of all media files and folders
- Absence of broken relative links across 1,600+ page references

---

## 📞 Support & Dispatch Desk

- **24/7 Emergency Helpline**: [+91 78297 53538](tel:+917829753538)
- **WhatsApp Support**: [+91 78297 53538](https://wa.me/917829753538)
- **Address**: 28, Ground Floor, 4th Cross Rd, A. T. Street, Dr. Ambedkar Nagar, Yeshwanthpur, Bengaluru, Karnataka 560022
- **Website**: [https://ashokhealthcare.in/](https://ashokhealthcare.in/)
