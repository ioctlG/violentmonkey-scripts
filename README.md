<div align="center">

# 🚀 Violentmonkey Scripts
### Lightweight, Zero-RAM & Privacy-First Browser Extension Replacements

[![Violentmonkey](https://img.shields.io/badge/Userscript-Violentmonkey%20%7C%20Tampermonkey-purple?style=for-the-badge&logo=tampermonkey)](https://violentmonkey.github.io/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Privacy Friendly](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Zero%20Telemetry-green?style=for-the-badge)](https://github.com/ioctlG/violentmonkey-scripts)

A curated collection of modern, high-performance userscripts designed to **replace heavy browser extensions** with standalone, isolated **Shadow DOM** scripts that consume **0 MB background RAM** and respect your privacy.

[Features](#-why-replace-extensions-with-userscripts) • [Scripts](#-included-scripts) • [Installation](#-installation) • [Credits](#-acknowledgments--forks)

---

</div>

## 💡 Why Replace Extensions with Userscripts?

Modern WebExtensions often run continuous background worker pages that consume 50MB–200MB of RAM each, require broad invasive permissions, and can be silently bought out or compromised.

| Metric | Traditional Chrome / Firefox Extensions | Violentmonkey Scripts |
| :--- | :--- | :--- |
| **Idle Memory Consumption** | ❌ 100MB – 300MB+ per extension | ✅ **0 MB** (Lazy-loaded on demand) |
| **Background Processes** | ❌ Always active in the background | ✅ **Zero background activity** |
| **Privacy & Security** | ❌ Web store auto-updates / tracking risk | ✅ **100% open source & auditable** |
| **Styling Collisions** | ❌ Injected CSS can break website layouts | ✅ **100% Shadow DOM isolated** |
| **UI Aesthetics** | ⚠️ Generic default browser popups | ✅ **Draggable, pinned dark glassmorphism card** |

---

## 📦 Included Scripts

### 1. 🔍 Search by Image (`search_by_image.user.js`)
> *Powerful reverse image search tool with multi-engine lookup, canvas extraction, drag-to-crop area, and clipboard searching.*

[![Install Search by Image](https://img.shields.io/badge/⚡%20One--Click%20Install-Search%20by%20Image-blue?style=for-the-badge)](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/search_by_image.user.js)

* **Supported Search Engines:** Google Lens, Lenso.ai, Yandex.Images, Bing Images, Pinterest, TinEye, Baidu, SauceNAO, trace.moe.
* **Key Features:**
  - **Sürekli Görsel Arama (Continuous Mode):** When the panel is pinned open, hover highlights images and clicking searches them instantly in background tabs without closing the menu.
  - **Tab-Level Engine Memory:** Remembers your chosen engine (e.g., Lenso.ai) throughout your tab session without resetting to defaults.
  - **5 Flexible Search Modes:** Select URL, Select Image (element pixel extractor), Crop Area (Capture), File Upload, and Clipboard Paste.
  - **Zero 3rd-Party Upload Fallback:** Local canvas extraction with direct provider failover.
  - **Two-Column Settings Modal:** Drag-and-drop search engine reordering, custom shortcut choices, and dual-language support (**TR / EN**).
* **Inspiration:** Userscript architecture based on Armin Sebastian's famous [`dessant/search-by-image`](https://github.com/dessant/search-by-image).

---

### 2. 🏛️ Web Archives (`web_archives.user.js`)
> *Instant access to archived snapshots and search engine caches for current web pages and URLs.*

[![Install Web Archives](https://img.shields.io/badge/⚡%20One--Click%20Install-Web%20Archives-purple?style=for-the-badge)](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/web_archives.user.js)

* **Supported Archive Services:**
  - 🌐 **All Selected Archives** *(One-click parallel background lookup)*
  - 🏛️ **Wayback Machine** (`web.archive.org`)
  - 📷 **Archive.today** (`archive.today`, `archive.is`, `archive.ph`, `archive.li`, `archive.vn`)
  - 👻 **Ghostarchive**
  - 🦈 **Megalodon**
  - 🔒 **Perma.cc**
  - 🇵🇹 **Arquivo.pt**
  - 🇬🇧 **UK Web Archive**
  - 📚 **Library of Congress**
  - 📦 **Software Heritage**
  - 🔍 **Search Engine Caches:** Google Cache, Bing Cache, Yandex Cache, Yahoo & Baidu Search.
* **Key Features:**
  - **Zero Keyboard Shortcuts:** Clean, non-intrusive operation triggered exclusively via Violentmonkey's menu commands (`🏛️ Web Archives Panel`, `⚙️ Settings`).
  - **2 Intuitive Modes:** *Current Page* (archives `window.location.href`) and *Enter URL* (paste any custom URL).
  - **Dual Language & Custom Domains:** English & Turkish interface; configurable Wayback and Archive.today domain mirrors.
* **Inspiration:** Userscript rewrite inspired by Armin Sebastian's [`dessant/web-archives`](https://github.com/dessant/web-archives).

---

### 3. 🔓 Allow Right Click (`allow_right_click.user.js`)
> *Universal, intelligent right-click and context menu unlocker for copy-protected or restricted websites.*

[![Install Allow Right Click](https://img.shields.io/badge/⚡%20One--Click%20Install-Allow%20Right%20Click-orange?style=for-the-badge)](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/allow_right_click.user.js)

* **Key Features:**
  - **Surgical Unblocker:** Re-enables context menus, mouse right-clicks, text selection (`user-select`), dragging, and clipboard copy operations on restrictive websites.
  - **Non-Destructive Execution:** Unlike crude scripts that break interactive web apps (like Google Docs, web games, or custom context menus), this script uses a precise proxy trap to neutralise only blocking listeners while preserving genuine site functionality.
  - **Zero CPU Footprint:** Completely transparent with zero overhead.
* **Inspiration:** Inspired by Armin Sebastian's [`dessant/allow-right-click`](https://github.com/dessant/allow-right-click).

---

### 4. 🕶️ Startpage Anonymous View (`startpage_anonymous_view.user.js`)
> *One-click privacy proxy gateway to open any website directly through Startpage's Anonymous View proxy.*

[![Install Startpage Anonymous View](https://img.shields.io/badge/⚡%20One--Click%20Install-Startpage%20Anonymous%20View-blueviolet?style=for-the-badge)](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/startpage_anonymous_view.user.js)

* **Key Features:**
  - **Zero Search Engine Exposure:** Automatically masks the search engine behind a sleek, full-screen dark loading curtain while establishing the proxy tunnel in the background.
  - **Single-Click Execution:** Click `🕶️ Open in Startpage Anonymous View` from the Violentmonkey menu on any site.
  - **Auto-Trigger & Redirect:** High-frequency observer detects the Anonymous View button instantly and navigates directly into the EU proxy tunnel.
  - **Zero IP Leakage:** The destination website only sees Startpage's European/Netherlands proxy servers rather than your real home IP.
  - **🧭 Tünel İçi Arama Çubuğu (Omnibar) & Multi-Tab Container Entegrasyonu:** Sol kenara yapışık, modern cam efekti (glassmorphism) ve SVG ok butonu (`❯`) ile açılan tünel içi arama çekmecesi. Yapılan aramalar ve girilen URL'ler mevcut sayfayı bozmadan **Container mantığıyla yepyeni bir sekmede** Startpage proxy tüneli içinde açılır; açık olan mevcut sayfanız asla kaybolmaz. Violentmonkey `GM_setValue` / `GM_openInTab` çapraz çerçeve motoru sayesinde yazılan sorgular ("merhaba", "selam" vb.) kaybolmadan yeni sekmedeki DuckDuckGo'ya aktarılıp aratılır. Tıklanan tüm web siteleri tünelde kalır ve çekmece arkadaki sayfa elemanlarıyla asla etkileşime girmez (sıfır click-through).
  - **De-Branded Clean UI:** Automatically purges Startpage's `.av-banner-brand-link` header banner clutter.
  - **Forced English Localization:** Automatically enforces English interface and search language for Startpage (`&lui=english&language=english`) and DuckDuckGo (`kl=us-en`), with all curtain statuses and UI controls rendered cleanly in English.
---

## 🛠️ Installation

### Step 1: Install a Userscript Manager
If you don't already have one, install a userscript manager in your browser:
* [**Violentmonkey**](https://violentmonkey.github.io/) *(Highly Recommended — Lightweight & Open Source)*
* [**Tampermonkey**](https://www.tampermonkey.net/)

### Step 2: Install the Scripts
Click any of the **One-Click Install** buttons above, or click the direct links below. Your userscript manager will prompt you with an installation screen:

* 📥 [**Install `search_by_image.user.js`**](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/search_by_image.user.js)
* 📥 [**Install `web_archives.user.js`**](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/web_archives.user.js)
* 📥 [**Install `allow_right_click.user.js`**](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/allow_right_click.user.js)
* 📥 [**Install `startpage_anonymous_view.user.js`**](https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/startpage_anonymous_view.user.js)

### Step 3: Automatic Updates
All scripts include `@downloadURL` and `@updateURL` metadata headers pointing to this repository. Violentmonkey will automatically keep your scripts up to date with the latest features and bug fixes.

---

## 🎨 UI & Architecture Highlights

```
┌──────────────────────────────────────────────────────────────────┐
│  Shadow DOM Root (Zero CSS bleed-in or bleed-out)               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ☰ Mode Selector (URL / Crop / Image)       ⚙️  −  ✕       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ 🌐 All Search Engines / Archives                           │  │
│  │ 🔍 Primary Engine (Google Lens / Wayback Machine)       ✓  │  │
│  │ 📷 Alternative Engines (Lenso / Archive.today)             │  │
│  │ ☁️ Regional Mirrors (Yandex, Bing, Baidu)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

* **Shadow DOM Isolation:** All interface elements are mounted inside an isolated Shadow DOM container. Sites cannot alter the panels, and the panels never affect website layouts.
* **Draggable & Minimizable:** Panels can be pinned anywhere on your screen, moved freely with drag handles, or minimized to a thin bar.
* **Zero Lazy Penalty:** Inactive tabs incur **0 DOM nodes** and **0 idle CPU cycles**.

---

## 🤝 Acknowledgments & Forks

These userscripts are modern, lightweight userscript adaptations and enhancements inspired by the open-source extension portfolio of [**Armin Sebastian (dessant)**](https://github.com/dessant):
* [`dessant/search-by-image`](https://github.com/dessant/search-by-image)
* [`dessant/web-archives`](https://github.com/dessant/web-archives)
* [`dessant/allow-right-click`](https://github.com/dessant/allow-right-click)

Enhanced with modern Shadow DOM floating interfaces, continuous search workflow, tab session memory, and dual Turkish/English localization by [@ioctlG](https://github.com/ioctlG).

---

## 📄 License

This repository is licensed under the [MIT License](LICENSE).
