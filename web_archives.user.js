// ==UserScript==
// @name         Web Archives
// @namespace    https://github.com/ioctlG/violentmonkey-scripts
// @version      1.0.2
// @description  Web Archives tool for Violentmonkey — Wayback Machine, Archive.today, Ghostarchive, Megalodon and search engine caches with Shadow DOM floating panel.
// @author       ioctlG
// @match        *://*/*
// @icon         https://lh3.googleusercontent.com/KYBzL2C9gdO9Mb2EJoCEOJSoFvO0lsEWSacuDQqJOxtlQdkYxvUwV3DfF7fYtZfdmwHDhZHVzgo3_Aj4rqi5XHg=s60
// @downloadURL  https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/web_archives.user.js
// @updateURL    https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/web_archives.user.js
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  // --- SVG ICONS (Crisp, High-Resolution Vector Assets) ---
  const SVG_ICONS = {
    app_icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7V9H22V7L12 2Z" fill="#a855f7"/>
      <path d="M4 10H6V18H4V10ZM9 10H11V18H9V10ZM14 10H16V18H14V10ZM19 10H21V18H19V10Z" fill="#c084fc"/>
      <path d="M2 19V22H22V19H2Z" fill="#a855f7"/>
      <circle cx="12" cy="14" r="2.5" fill="#e9d5ff"/>
    </svg>`,
    all: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="#a855f7" stroke-width="1.8"/>
      <path d="M2.5 12H21.5M12 2.5C14.5 5.5 16 8.5 16 12C16 15.5 14.5 18.5 12 21.5C9.5 18.5 8 15.5 8 12C8 8.5 9.5 5.5 12 2.5Z" stroke="#c084fc" stroke-width="1.6"/>
    </svg>`,
    wayback: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L3 7.5V9H21V7.5L12 3Z" fill="#71717a"/>
      <path d="M5 10H7V17H5V10ZM11 10H13V17H11V10ZM17 10H19V17H17V10Z" fill="#a1a1aa"/>
      <path d="M3 18H21V21H3V18Z" fill="#71717a"/>
    </svg>`,
    archiveToday: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="#22c55e" stroke-width="1.8" fill="#14532d" fill-opacity="0.3"/>
      <circle cx="12" cy="12" r="4.5" stroke="#4ade80" stroke-width="1.8"/>
      <path d="M7 8H9" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    ghostarchive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C7.58 3 4 6.58 4 11V20L7 18L9.5 20L12 18L14.5 20L17 18L20 20V11C20 6.58 16.42 3 12 3Z" fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.8"/>
      <circle cx="9" cy="10" r="1.5" fill="#38bdf8"/>
      <circle cx="15" cy="10" r="1.5" fill="#38bdf8"/>
    </svg>`,
    megalodon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 18H20L12 3Z" fill="#fb923c" fill-opacity="0.25" stroke="#fb923c" stroke-width="1.8"/>
      <path d="M9 13L12 17L15 13" stroke="#fed7aa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    arquivo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#ef4444" stroke-width="1.8" fill="#7f1d1d" fill-opacity="0.2"/>
      <path d="M12 6V12L16 15" stroke="#fca5a5" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    perma: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#60a5fa" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    ukwebarchive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
      <path d="M3 4L21 20M21 4L3 20" stroke="#ef4444" stroke-width="1.8"/>
      <path d="M12 4V20M3 12H21" stroke="#ffffff" stroke-width="2.2"/>
    </svg>`,
    loc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#facc15" stroke-width="1.8"/>
    </svg>`,
    softwareHeritage: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill="#6366f1" fill-opacity="0.25" stroke="#818cf8" stroke-width="1.8"/>
      <path d="M12 22V12M12 12L21 7M12 12L3 7" stroke="#a5b4fc" stroke-width="1.6"/>
    </svg>`,
    googleCache: `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>`,
    bingCache: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3v18l5-2.8 7-4.1-3.5-1.9L9 15.5V6.7l5.5 3 2.5-3.2L5 3z" fill="#008373"/>
      <path d="M5 3l12 3.5-2.5 3.2L9 6.7v8.8l4.5-3.3 3.5 1.9L10 18.2 5 21V3z" fill="#00a88f"/>
    </svg>`,
    yandexCache: `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FC3F1D"/>
      <path d="M13.84 7.2h-1.56c-1.44 0-2.28.84-2.28 2.16 0 1.28.6 1.96 1.8 2.8l1.32.92-3.16 4.92H8.16l2.84-4.4c-.92-.68-1.64-1.6-1.64-2.96 0-2.12 1.4-3.44 3.76-3.44h2.52v10.8h-1.8V7.2z" fill="#FFFFFF"/>
    </svg>`,
    yahoo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#6001d2"/>
      <path d="M6 6l4.5 7.5V18h3v-4.5L18 6h-3.2l-2.8 5.2L9.2 6H6z" fill="#ffffff"/>
    </svg>`,
    baidu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="6.5" cy="8.5" rx="2" ry="3" fill="#2932e1"/>
      <ellipse cx="17.5" cy="8.5" rx="2" ry="3" fill="#2932e1"/>
      <ellipse cx="10" cy="5.5" rx="1.8" ry="2.5" fill="#2932e1"/>
      <ellipse cx="14" cy="5.5" rx="1.8" ry="2.5" fill="#2932e1"/>
      <path d="M12 10c-3.5 0-6 2.5-6 6.5 0 2.8 2.2 4.5 6 4.5s6-1.7 6-4.5c0-4-2.5-6.5-6-6.5z" fill="#2932e1"/>
      <circle cx="12" cy="15.5" r="2" fill="#ffffff"/>
    </svg>`
  };

  // --- ALL ARCHIVE ENGINES CONFIGURATION ---
  const ALL_ENGINES = [
    {
      id: 'all',
      name: 'All Selected Archives',
      icon: SVG_ICONS.all,
      buildUrl: null
    },
    {
      id: 'wayback',
      name: 'Wayback Machine',
      icon: SVG_ICONS.wayback,
      buildUrl: (url, opts) => `https://${opts.waybackHost || 'web.archive.org'}/web/*/${encodeURI(url)}`
    },
    {
      id: 'archiveToday',
      name: 'Archive.today',
      icon: SVG_ICONS.archiveToday,
      buildUrl: (url, opts) => `https://${opts.archiveTodayHost || 'archive.today'}/newest/${encodeURI(url)}`
    },
    {
      id: 'ghostarchive',
      name: 'Ghostarchive',
      icon: SVG_ICONS.ghostarchive,
      buildUrl: (url) => `https://ghostarchive.org/search?term=${encodeURIComponent(url)}`
    },
    {
      id: 'megalodon',
      name: 'Megalodon',
      icon: SVG_ICONS.megalodon,
      buildUrl: (url) => `https://megalodon.jp/?url=${encodeURIComponent(url)}`
    },
    {
      id: 'perma',
      name: 'Perma.cc',
      icon: SVG_ICONS.perma,
      buildUrl: (url) => `https://perma.cc/search?q=${encodeURIComponent(url)}`
    },
    {
      id: 'arquivo',
      name: 'Arquivo.pt',
      icon: SVG_ICONS.arquivo,
      buildUrl: (url) => `https://arquivo.pt/wayback/*/${encodeURI(url)}`
    },
    {
      id: 'ukwebarchive',
      name: 'UK Web Archive',
      icon: SVG_ICONS.ukwebarchive,
      buildUrl: (url) => `https://www.webarchive.org.uk/wayback/archive/*/${encodeURI(url)}`
    },
    {
      id: 'loc',
      name: 'Library of Congress',
      icon: SVG_ICONS.loc,
      buildUrl: (url) => `https://webarchive.loc.gov/all/*/${encodeURI(url)}`
    },
    {
      id: 'softwareHeritage',
      name: 'Software Heritage',
      icon: SVG_ICONS.softwareHeritage,
      buildUrl: (url) => `https://archive.softwareheritage.org/browse/origin/directory/?origin_url=${encodeURIComponent(url)}`
    },
    {
      id: 'googleCache',
      name: 'Google Cache',
      icon: SVG_ICONS.googleCache,
      buildUrl: (url) => `https://www.google.com/search?q=cache:${encodeURIComponent(url)}`
    },
    {
      id: 'bingCache',
      name: 'Bing Cache',
      icon: SVG_ICONS.bingCache,
      buildUrl: (url) => `https://www.bing.com/search?q=url:${encodeURIComponent(url)}`
    },
    {
      id: 'yandexCache',
      name: 'Yandex Cache',
      icon: SVG_ICONS.yandexCache,
      buildUrl: (url) => `https://yandex.com/search/?text=url%3A${encodeURIComponent(url)}`
    },
    {
      id: 'yahoo',
      name: 'Yahoo Search',
      icon: SVG_ICONS.yahoo,
      buildUrl: (url) => `https://search.yahoo.com/search?p=${encodeURIComponent(url)}`
    },
    {
      id: 'baidu',
      name: 'Baidu Search',
      icon: SVG_ICONS.baidu,
      buildUrl: (url) => `https://www.baidu.com/s?wd=${encodeURIComponent(url)}`
    }
  ];

  // --- I18N LOCALIZATION DICTIONARY (Dual Language: EN & TR) ---
  const I18N = {
    en: {
      appTitle: "Web Archives",
      dragToMove: "Web Archives — Drag to move",
      optionsTitle: "Web Archives — Settings",
      optionsBtn: "Settings",
      minimizeBtn: "Minimize / Expand",
      closeBtn: "Close Panel",
      saved: "✓ Saved",
      resetConfirm: "Reset all options and engine ordering to defaults?",
      resetDefaults: "Reset to Defaults",
      closeEsc: "Close",

      // Modes
      modeCurrentPage: "Current Page",
      modeEnterUrl: "Enter URL",

      // Banners & Hints
      allArchives: "All Selected Archives",
      urlInputPlaceholder: "Paste web address here & press Enter...",
      openingEngine: "Opening {name} archive...",
      openingAll: "Opening across {count} archives ({focus})...",
      foreground: "Foreground",
      background: "Background",
      pleaseEnterUrl: "Please enter a valid URL first.",
      switchModeTitle: "Switch Mode (Click)",

      // Options Modal Sections
      secEngines: "Archive Services",
      secEnginesDesc: "Toggle archive services and drag or reorder to customize order",
      secGeneral: "General Settings",
      secHosts: "Archive Host Domains",
      secMisc: "Preferences",

      // General Settings
      optLanguage: "Interface Language",
      optTabFocus: "Tab Opening Behavior",
      tabFocusBackground: "Open in background",
      tabFocusForeground: "Focus new tab immediately",
      optDefaultEngine: "Default Archive Service",
      optShowIcons: "Show archive service icons",

      // Host Domains
      optWaybackHost: "Wayback Machine Host",
      optArchiveTodayHost: "Archive.today Host"
    },
    tr: {
      appTitle: "Web Archives",
      dragToMove: "Web Archives — Taşımak için sürükle",
      optionsTitle: "Web Archives — Ayarlar",
      optionsBtn: "Ayarlar",
      minimizeBtn: "Küçült / Genişlet",
      closeBtn: "Paneli Kapat",
      saved: "✓ Kaydedildi",
      resetConfirm: "Tüm ayarlar ve arşiv motoru sıralaması varsayılanlara sıfırlansın mı?",
      resetDefaults: "Varsayılanlara Sıfırla",
      closeEsc: "Kapat",

      // Modes
      modeCurrentPage: "Mevcut Sayfa",
      modeEnterUrl: "URL Gir",

      // Banners & Hints
      allArchives: "Tüm Seçili Arşivler",
      urlInputPlaceholder: "Web adresi yapıştırıp Enter'a basın...",
      openingEngine: "{name} ile arşiv açılıyor...",
      openingAll: "{count} arşiv servisinde açılıyor ({focus})...",
      foreground: "Ön Plan",
      background: "Arka Plan",
      pleaseEnterUrl: "Lütfen geçerli bir web adresi girin.",
      switchModeTitle: "Mod Değiştir (Tıkla)",

      // Options Modal Sections
      secEngines: "Arşiv Servisleri",
      secEnginesDesc: "Arşiv servislerini açıp kapatın ve sıralamayı özelleştirin",
      secGeneral: "Genel Ayarlar",
      secHosts: "Arşiv Alan Adları (Host)",
      secMisc: "Tercihler",

      // General Settings
      optLanguage: "Arayüz Dili",
      optTabFocus: "Sekme Açılma Davranışı",
      tabFocusBackground: "Arka planda aç",
      tabFocusForeground: "Yeni sekmeye hemen odaklan",
      optDefaultEngine: "Varsayılan Arşiv Motoru",
      optShowIcons: "Arşiv servisi resmi logolarını göster",

      // Host Domains
      optWaybackHost: "Wayback Machine Alan Adı",
      optArchiveTodayHost: "Archive.today Alan Adı"
    }
  };

  // --- DEFAULT OPTIONS ---
  const DEFAULT_OPTIONS = {
    lang: 'en', // Default English
    tabFocus: 'background',
    defaultEngine: 'wayback',
    enabledEngines: ['wayback', 'archiveToday', 'ghostarchive', 'megalodon', 'perma', 'arquivo', 'googleCache', 'yandexCache'],
    engineOrder: ALL_ENGINES.map(e => e.id),
    waybackHost: 'web.archive.org',
    archiveTodayHost: 'archive.today',
    showEngineIcons: true
  };

  let currentOptions = { ...DEFAULT_OPTIONS };

  function t(key, params = {}) {
    const lang = currentOptions.lang === 'tr' ? 'tr' : 'en';
    let str = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || I18N.tr[key] || key;
    for (const p in params) {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    }
    return str;
  }

  function loadUserOptions() {
    try {
      const saved = GM_getValue('wa_options');
      if (saved && typeof saved === 'object') {
        currentOptions = { ...DEFAULT_OPTIONS, ...saved };
        if (!Array.isArray(currentOptions.enabledEngines)) {
          currentOptions.enabledEngines = [...DEFAULT_OPTIONS.enabledEngines];
        }
        if (!Array.isArray(currentOptions.engineOrder)) {
          currentOptions.engineOrder = ALL_ENGINES.map(e => e.id);
        }
      }
    } catch (e) {
      console.warn('[Web Archives] Load options error:', e);
    }

    if (currentOptions.lang !== 'tr') {
      currentOptions.lang = 'en';
    }
    if (currentOptions.tabFocus !== 'foreground') {
      currentOptions.tabFocus = 'background';
    }
    if (!currentOptions.waybackHost) currentOptions.waybackHost = 'web.archive.org';
    if (!currentOptions.archiveTodayHost) currentOptions.archiveTodayHost = 'archive.today';
  }

  function saveUserOptions(patch = {}) {
    currentOptions = { ...currentOptions, ...patch };
    try {
      GM_setValue('wa_options', currentOptions);
    } catch (e) {
      console.warn('[Web Archives] Save options error:', e);
    }
  }

  // --- TAB OPENER HELPER ---
  function openTab(url) {
    if (!url) return;
    const isFg = currentOptions.tabFocus === 'foreground';
    try {
      if (typeof GM_openInTab === 'function') {
        GM_openInTab(url, { active: isFg, insert: true });
        return;
      }
    } catch (_) {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // --- STATE VARIABLES ---
  let isUIInitialized = false;
  let overlayContainer = null;
  let shadowRoot = null;
  let menuCard = null;
  let topBanner = null;
  let isMenuVisible = false;
  let isOptionsModalOpen = false;
  let isMinimized = false;
  let currentMode = 'currentPage'; // 'currentPage' | 'enterUrl'
  let pendingEngine = null; // Session-level active engine memory

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  // --- LAZY INITIALIZATION ---
  function ensureUI() {
    if (isUIInitialized) return;
    isUIInitialized = true;

    overlayContainer = document.createElement('div');
    overlayContainer.id = 'web-archives-overlay-root';
    overlayContainer.style.all = 'initial';
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.zIndex = '2147483647';
    overlayContainer.style.pointerEvents = 'none';

    shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

    const fontStyle = document.createElement('style');
    fontStyle.textContent = getPanelStyles();
    shadowRoot.appendChild(fontStyle);

    // 1. Top floating status banner
    topBanner = document.createElement('div');
    topBanner.id = 'wa-top-status-banner';
    topBanner.style.display = 'none';
    shadowRoot.appendChild(topBanner);

    // 2. Floating panel menu card
    menuCard = document.createElement('div');
    menuCard.id = 'wa-floating-menu';
    menuCard.style.display = 'none';
    menuCard.innerHTML = buildMenuCardHtml();
    shadowRoot.appendChild(menuCard);

    (document.body || document.documentElement).appendChild(overlayContainer);

    bindMenuEvents();
    refreshEngineList();
  }

  // --- CSS STYLES (Modern Sharp Dark Glassmorphism, 100% Shadow DOM isolated) ---
  function getPanelStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      #wa-floating-menu {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: rgba(18, 19, 24, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.4);
        color: #f4f4f5;
        z-index: 2147483647;
        pointer-events: auto;
        user-select: none;
        overflow: hidden;
      }

      #wa-floating-menu.minimized .wa-content-area,
      #wa-floating-menu.minimized #wa-engine-list {
        display: none !important;
      }

      .wa-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        cursor: grab;
      }

      .wa-header:active {
        cursor: grabbing;
      }

      .wa-mode-selector-wrapper {
        position: relative;
      }

      .wa-mode-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #ffffff;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .wa-mode-button:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.22);
      }

      .wa-mode-dropdown {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        width: 165px;
        background: #181920;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        padding: 4px;
        z-index: 20;
      }

      .wa-mode-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        font-size: 13px;
        color: #d4d4d8;
        border-radius: 3px;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .wa-mode-option:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .wa-mode-option.active {
        background: rgba(168, 85, 247, 0.22);
        color: #c084fc;
        font-weight: 600;
      }

      .wa-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .wa-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 3px;
        background: transparent;
        border: none;
        color: #a1a1aa;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .wa-action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .wa-action-btn.close:hover {
        background: rgba(239, 68, 68, 0.25);
        color: #f87171;
      }

      .wa-content-area {
        padding: 8px 12px;
      }

      .wa-url-box {
        display: none;
        margin-bottom: 6px;
      }

      .wa-url-input {
        width: 100%;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 3px;
        padding: 7px 10px;
        font-size: 13px;
        color: #ffffff;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .wa-url-input:focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
      }

      .wa-engine-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 6px 8px 6px;
        max-height: 380px;
        overflow-y: auto;
      }

      .wa-engine-list::-webkit-scrollbar {
        width: 5px;
      }

      .wa-engine-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 3px;
      }

      .wa-engine-item {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 8px 11px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 13.5px;
        color: #e4e4e7;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .wa-engine-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .wa-engine-item.selected {
        background: rgba(168, 85, 247, 0.16);
        color: #ffffff;
        border-left: 2.5px solid #a855f7;
      }

      .wa-engine-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .wa-engine-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wa-engine-check {
        color: #a855f7;
        font-size: 14px;
        font-weight: bold;
        display: none;
      }

      /* Floating top status toast */
      #wa-top-status-banner {
        position: fixed;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(18, 19, 24, 0.94);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(168, 85, 247, 0.4);
        color: #ffffff;
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 13.5px;
        font-weight: 500;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
        z-index: 2147483647;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* --- 2-COLUMN OPTIONS MODAL STYLES --- */
      .wa-options-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }

      .wa-options-modal {
        width: 720px;
        max-width: 95vw;
        max-height: 85vh;
        background: #14151a;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .wa-options-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .wa-options-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }

      .wa-options-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .wa-options-col {
        flex: 1;
        padding: 18px 20px;
        overflow-y: auto;
      }

      .wa-options-col.left-col {
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .wa-options-section-title {
        font-size: 13px;
        font-weight: 700;
        color: #a855f7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .wa-options-section-desc {
        font-size: 12px;
        color: #a1a1aa;
        margin-bottom: 14px;
      }

      .wa-opt-row {
        margin-bottom: 14px;
      }

      .wa-opt-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #e4e4e7;
        margin-bottom: 5px;
      }

      .wa-opt-select, .wa-opt-input {
        width: 100%;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 4px;
        padding: 7px 10px;
        font-size: 13px;
        color: #ffffff;
        outline: none;
      }

      .wa-opt-select:focus, .wa-opt-input:focus {
        border-color: #a855f7;
      }

      .wa-opt-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .wa-opt-toggle-row span {
        font-size: 13px;
        color: #d4d4d8;
      }

      .wa-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
      }

      .wa-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .wa-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(255, 255, 255, 0.16);
        transition: .2s;
        border-radius: 20px;
      }

      .wa-slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .2s;
        border-radius: 50%;
      }

      .wa-switch input:checked + .wa-slider {
        background-color: #a855f7;
      }

      .wa-switch input:checked + .wa-slider:before {
        transform: translateX(16px);
      }

      /* Reorderable list */
      .wa-sort-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 4px;
        margin-bottom: 6px;
        font-size: 13px;
        color: #e4e4e7;
      }

      .wa-sort-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .wa-sort-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }

      .wa-sort-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .wa-options-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.02);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .wa-footer-btn {
        padding: 6px 14px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.15s ease;
      }

      .wa-footer-btn.reset {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .wa-footer-btn.reset:hover {
        background: rgba(239, 68, 68, 0.25);
      }

      .wa-footer-btn.primary {
        background: #a855f7;
        color: #ffffff;
      }

      .wa-footer-btn.primary:hover {
        background: #9333ea;
      }
    `;
  }

  // --- HTML BUILDERS ---
  function buildMenuCardHtml() {
    return `
      <div class="wa-header" id="wa-drag-header" title="${t('dragToMove')}">
        <div class="wa-mode-selector-wrapper">
          <button class="wa-mode-button" id="wa-mode-trigger" type="button" title="${t('switchModeTitle')}">
            <span id="wa-mode-trigger-icon">${SVG_ICONS.app_icon}</span>
            <span id="wa-mode-label">${getModeTitle(currentMode)}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" style="opacity: 0.75"><path d="M1 1l4 4 4-4"/></svg>
          </button>
          <div class="wa-mode-dropdown" id="wa-mode-dropdown">
            <div class="wa-mode-option ${currentMode === 'currentPage' ? 'active' : ''}" data-mode="currentPage">
              <span>📄</span>
              <span>${t('modeCurrentPage')}</span>
            </div>
            <div class="wa-mode-option ${currentMode === 'enterUrl' ? 'active' : ''}" data-mode="enterUrl">
              <span>🔗</span>
              <span>${t('modeEnterUrl')}</span>
            </div>
          </div>
        </div>

        <div class="wa-header-actions">
          <button class="wa-action-btn" id="wa-btn-options" type="button" title="${t('optionsBtn')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button class="wa-action-btn" id="wa-btn-minimize" type="button" title="${t('minimizeBtn')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
          </button>
          <button class="wa-action-btn close" id="wa-btn-close" type="button" title="${t('closeBtn')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="wa-content-area">
        <div class="wa-url-box" id="wa-url-box">
          <input type="text" class="wa-url-input" id="wa-url-input" placeholder="${t('urlInputPlaceholder')}" autocomplete="off" />
        </div>
      </div>

      <div class="wa-engine-list" id="wa-engine-list"></div>
    `;
  }

  function getModeTitle(mode) {
    if (mode === 'currentPage') return t('modeCurrentPage');
    if (mode === 'enterUrl') return t('modeEnterUrl');
    return mode;
  }

  // --- REFRESH ENGINE LIST ---
  function refreshEngineList() {
    if (!shadowRoot) return;
    const listEl = shadowRoot.getElementById('wa-engine-list');
    if (!listEl) return;

    const order = currentOptions.engineOrder || ALL_ENGINES.map(e => e.id);
    const enabled = currentOptions.enabledEngines || [];
    const activeKey = pendingEngine || currentOptions.defaultEngine || 'wayback';

    let html = '';

    // 1. All selected archives item at the top
    const isAllSel = activeKey === 'all';
    html += `
      <div class="wa-engine-item ${isAllSel ? 'selected' : ''}" data-engine="all">
        <span class="wa-engine-icon">${SVG_ICONS.all}</span>
        <span class="wa-engine-name">${t('allArchives')}</span>
        <span class="wa-engine-check" style="${isAllSel ? 'display: inline-block;' : ''}">✓</span>
      </div>
    `;

    // 2. Ordered & filtered individual archive services
    for (const engId of order) {
      if (engId === 'all') continue;
      if (!enabled.includes(engId)) continue;
      const eng = ALL_ENGINES.find(e => e.id === engId);
      if (!eng) continue;

      const isSel = activeKey === engId;
      html += `
        <div class="wa-engine-item ${isSel ? 'selected' : ''}" data-engine="${eng.id}">
          <span class="wa-engine-icon">${currentOptions.showEngineIcons ? eng.icon : ''}</span>
          <span class="wa-engine-name">${eng.name}</span>
          <span class="wa-engine-check" style="${isSel ? 'display: inline-block;' : ''}">✓</span>
        </div>
      `;
    }

    listEl.innerHTML = html;

    // Item click listener
    listEl.querySelectorAll('.wa-engine-item').forEach(el => {
      el.addEventListener('click', () => {
        const engId = el.dataset.engine;
        onEngineClicked(engId);
      });
    });
  }

  function updateMenuSelectionVisual(selectedKey) {
    if (!shadowRoot) return;
    const listEl = shadowRoot.getElementById('wa-engine-list');
    if (!listEl) return;
    listEl.querySelectorAll('.wa-engine-item').forEach(el => {
      const isMatch = el.dataset.engine === selectedKey;
      el.classList.toggle('selected', isMatch);
      const chk = el.querySelector('.wa-engine-check');
      if (chk) chk.style.display = isMatch ? 'inline-block' : 'none';
    });
  }

  // --- ACTIONS & DISPATCH ---
  function onEngineClicked(engineKey) {
    if (!engineKey) return;
    pendingEngine = engineKey;
    updateMenuSelectionVisual(engineKey);

    if (currentMode === 'currentPage') {
      dispatchArchiveSearch(engineKey, window.location.href);
    } else if (currentMode === 'enterUrl') {
      const input = shadowRoot.getElementById('wa-url-input');
      const val = input ? input.value.trim() : '';
      if (val) {
        dispatchArchiveSearch(engineKey, val);
      } else {
        showStatusBanner(`⚠️ ${t('pleaseEnterUrl')}`, 2500);
        if (input) input.focus();
      }
    }
  }

  function dispatchArchiveSearch(engineKey, targetUrl) {
    if (!targetUrl) return;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const enabled = currentOptions.enabledEngines || [];

    if (engineKey === 'all') {
      const activeEngines = enabled.filter(k => k !== 'all');
      const isFg = currentOptions.tabFocus === 'foreground';
      const focusStr = isFg ? t('foreground') : t('background');
      showStatusBanner(`🚀 ${t('openingAll', { count: activeEngines.length, focus: focusStr })}`, 2500);

      activeEngines.forEach((id, idx) => {
        const eng = ALL_ENGINES.find(e => e.id === id);
        if (eng && eng.buildUrl) {
          setTimeout(() => {
            const url = eng.buildUrl(targetUrl, currentOptions);
            openTab(url);
          }, idx * 220);
        }
      });
      return;
    }

    const eng = ALL_ENGINES.find(e => e.id === engineKey);
    if (eng && eng.buildUrl) {
      showStatusBanner(`🏛️ ${t('openingEngine', { name: eng.name })}`, 2000);
      const destUrl = eng.buildUrl(targetUrl, currentOptions);
      openTab(destUrl);
    }
  }

  // --- MODE SWITCHER ---
  function setMode(mode) {
    currentMode = mode;
    const modeLabel = shadowRoot?.getElementById('wa-mode-label');
    if (modeLabel) modeLabel.textContent = getModeTitle(mode);

    const modeDropdown = shadowRoot?.getElementById('wa-mode-dropdown');
    if (modeDropdown) {
      modeDropdown.querySelectorAll('.wa-mode-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.mode === mode);
      });
    }

    const urlBox = shadowRoot?.getElementById('wa-url-box');
    if (urlBox) {
      urlBox.style.display = mode === 'enterUrl' ? 'block' : 'none';
      if (mode === 'enterUrl') {
        const input = shadowRoot.getElementById('wa-url-input');
        if (input && !input.value) {
          input.value = window.location.href;
          setTimeout(() => input.select(), 50);
        }
      }
    }
  }

  function isOurUIEvent(e) {
    if (!overlayContainer) return false;
    try {
      const path = e.composedPath ? e.composedPath() : [];
      if (path && (path.includes(overlayContainer) || path.includes(shadowRoot))) return true;
      if (overlayContainer.contains && overlayContainer.contains(e.target)) return true;
    } catch (_) {}
    return false;
  }

  // --- FLOATING TOAST STATUS BANNER ---
  let statusBannerTimer = null;
  function showStatusBanner(html, duration = 3000) {
    ensureUI();
    if (!topBanner) return;
    topBanner.innerHTML = html;
    topBanner.style.display = 'flex';
    clearTimeout(statusBannerTimer);
    statusBannerTimer = setTimeout(() => {
      if (topBanner) topBanner.style.display = 'none';
    }, duration);
  }

  // --- MENU INTERACTIONS & DRAG ---
  function bindMenuEvents() {
    const dragHeader = shadowRoot.getElementById('wa-drag-header');

    // Dragging
    dragHeader.addEventListener('mousedown', (e) => {
      if (isOurActionBtn(e)) return;
      isDragging = true;
      menuCard.dataset.userDragged = 'true';
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = menuCard.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      menuCard.style.right = 'auto';
      menuCard.style.bottom = 'auto';
      menuCard.style.left = `${initialLeft}px`;
      menuCard.style.top = `${initialTop}px`;
      dragHeader.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      let newX = initialLeft + dx;
      let newY = initialTop + dy;

      const w = menuCard.offsetWidth || 320;
      const h = menuCard.offsetHeight || 120;
      const maxLeft = Math.max(8, window.innerWidth - w - 8);
      const maxTop = Math.max(8, window.innerHeight - h - 8);

      newX = Math.max(8, Math.min(maxLeft, newX));
      newY = Math.max(8, Math.min(maxTop, newY));

      menuCard.style.left = `${newX}px`;
      menuCard.style.top = `${newY}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dragHeader.style.cursor = 'grab';
      }
    });

    // Header buttons
    shadowRoot.getElementById('wa-btn-options').addEventListener('click', openOptionsMenu);
    shadowRoot.getElementById('wa-btn-close').addEventListener('click', closeMenu);
    shadowRoot.getElementById('wa-btn-minimize').addEventListener('click', () => {
      isMinimized = !isMinimized;
      menuCard.classList.toggle('minimized', isMinimized);
      const minBtn = shadowRoot.getElementById('wa-btn-minimize');
      minBtn.innerHTML = isMinimized
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>`;
    });

    // Mode dropdown toggle
    const modeTrigger = shadowRoot.getElementById('wa-mode-trigger');
    const modeDropdown = shadowRoot.getElementById('wa-mode-dropdown');
    modeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      modeDropdown.style.display = modeDropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    shadowRoot.querySelectorAll('.wa-mode-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        modeDropdown.style.display = 'none';
        setMode(opt.dataset.mode);
      });
    });

    // URL input Enter key
    const urlInput = shadowRoot.getElementById('wa-url-input');
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = urlInput.value.trim();
        if (val) {
          const activeEng = pendingEngine || currentOptions.defaultEngine || 'wayback';
          dispatchArchiveSearch(activeEng, val);
        }
      }
    });

    // Close dropdown on outside click
    window.addEventListener('click', (e) => {
      if (!isOurUIEvent(e) && modeDropdown) {
        modeDropdown.style.display = 'none';
      }
    });
  }

  function isOurActionBtn(e) {
    const path = e.composedPath ? e.composedPath() : [];
    return path.some(el => el.classList && (el.classList.contains('wa-action-btn') || el.classList.contains('wa-mode-button')));
  }

  function openMenu() {
    ensureUI();
    isMenuVisible = true;
    if (menuCard) {
      menuCard.style.display = 'block';
      if (!menuCard.dataset.userDragged) {
        menuCard.style.top = '20px';
        menuCard.style.right = '20px';
        menuCard.style.left = 'auto';
        menuCard.style.bottom = 'auto';
      }
    }
    const activeEng = pendingEngine || currentOptions.defaultEngine || 'wayback';
    updateMenuSelectionVisual(activeEng);
  }

  function closeMenu() {
    isMenuVisible = false;
    if (menuCard) menuCard.style.display = 'none';
    const modeDropdown = shadowRoot?.getElementById('wa-mode-dropdown');
    if (modeDropdown) modeDropdown.style.display = 'none';
  }

  // --- 2-COLUMN OPTIONS MODAL ---
  let optionsOverlay = null;

  function openOptionsMenu() {
    ensureUI();
    if (isOptionsModalOpen) return;
    isOptionsModalOpen = true;

    optionsOverlay = document.createElement('div');
    optionsOverlay.className = 'wa-options-backdrop';
    optionsOverlay.innerHTML = buildOptionsModalHtml();
    shadowRoot.appendChild(optionsOverlay);

    bindOptionsModalEvents();
  }

  function closeOptionsMenu() {
    if (!isOptionsModalOpen) return;
    isOptionsModalOpen = false;
    if (optionsOverlay) {
      optionsOverlay.remove();
      optionsOverlay = null;
    }
    refreshEngineList();
  }

  function buildOptionsModalHtml() {
    const order = currentOptions.engineOrder || ALL_ENGINES.map(e => e.id);
    const enabled = currentOptions.enabledEngines || [];

    let enginesHtml = '';
    for (let i = 0; i < order.length; i++) {
      const engId = order[i];
      if (engId === 'all') continue;
      const eng = ALL_ENGINES.find(e => e.id === engId);
      if (!eng) continue;

      const isChecked = enabled.includes(engId);
      enginesHtml += `
        <div class="wa-sort-item" data-id="${eng.id}">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label class="wa-switch">
              <input type="checkbox" class="wa-engine-toggle" data-id="${eng.id}" ${isChecked ? 'checked' : ''}/>
              <span class="wa-slider"></span>
            </label>
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex-shrink: 0;">${eng.icon}</span>
            <span style="font-weight: 500;">${eng.name}</span>
          </div>
          <div class="wa-sort-actions">
            <button type="button" class="wa-sort-btn move-up" data-id="${eng.id}">▲</button>
            <button type="button" class="wa-sort-btn move-down" data-id="${eng.id}">▼</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="wa-options-modal">
        <div class="wa-options-header">
          <div class="wa-options-title-group">
            ${SVG_ICONS.app_icon}
            <span>${t('optionsTitle')}</span>
          </div>
          <button class="wa-action-btn close" id="wa-modal-close-btn" type="button" title="${t('closeEsc')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="wa-options-body">
          <!-- Left Column: Archive Services Reordering & Toggles -->
          <div class="wa-options-col left-col">
            <div class="wa-options-section-title">${t('secEngines')}</div>
            <div class="wa-options-section-desc">${t('secEnginesDesc')}</div>
            <div id="wa-opt-engines-list">
              ${enginesHtml}
            </div>
          </div>

          <!-- Right Column: General Settings & Hosts -->
          <div class="wa-options-col">
            <div class="wa-options-section-title">${t('secGeneral')}</div>

            <div class="wa-opt-row">
              <label class="wa-opt-label">${t('optLanguage')}</label>
              <select class="wa-opt-select" id="wa-opt-lang">
                <option value="en" ${currentOptions.lang === 'en' ? 'selected' : ''}>English</option>
                <option value="tr" ${currentOptions.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
              </select>
            </div>

            <div class="wa-opt-row">
              <label class="wa-opt-label">${t('optTabFocus')}</label>
              <select class="wa-opt-select" id="wa-opt-tab-focus">
                <option value="background" ${currentOptions.tabFocus === 'background' ? 'selected' : ''}>${t('tabFocusBackground')}</option>
                <option value="foreground" ${currentOptions.tabFocus === 'foreground' ? 'selected' : ''}>${t('tabFocusForeground')}</option>
              </select>
            </div>

            <div class="wa-opt-row">
              <label class="wa-opt-label">${t('optDefaultEngine')}</label>
              <select class="wa-opt-select" id="wa-opt-default-engine">
                <option value="all" ${currentOptions.defaultEngine === 'all' ? 'selected' : ''}>${t('allArchives')}</option>
                ${ALL_ENGINES.filter(e => e.id !== 'all').map(e => `
                  <option value="${e.id}" ${currentOptions.defaultEngine === e.id ? 'selected' : ''}>${e.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="wa-options-section-title" style="margin-top: 22px;">${t('secHosts')}</div>

            <div class="wa-opt-row">
              <label class="wa-opt-label">${t('optWaybackHost')}</label>
              <select class="wa-opt-select" id="wa-opt-wayback-host">
                <option value="web.archive.org" ${currentOptions.waybackHost === 'web.archive.org' ? 'selected' : ''}>web.archive.org (Official)</option>
              </select>
            </div>

            <div class="wa-opt-row">
              <label class="wa-opt-label">${t('optArchiveTodayHost')}</label>
              <select class="wa-opt-select" id="wa-opt-archive-today-host">
                <option value="archive.today" ${currentOptions.archiveTodayHost === 'archive.today' ? 'selected' : ''}>archive.today</option>
                <option value="archive.is" ${currentOptions.archiveTodayHost === 'archive.is' ? 'selected' : ''}>archive.is</option>
                <option value="archive.ph" ${currentOptions.archiveTodayHost === 'archive.ph' ? 'selected' : ''}>archive.ph</option>
                <option value="archive.li" ${currentOptions.archiveTodayHost === 'archive.li' ? 'selected' : ''}>archive.li</option>
                <option value="archive.vn" ${currentOptions.archiveTodayHost === 'archive.vn' ? 'selected' : ''}>archive.vn</option>
              </select>
            </div>

            <div class="wa-opt-toggle-row" style="margin-top: 14px;">
              <span>${t('optShowIcons')}</span>
              <label class="wa-switch">
                <input type="checkbox" id="wa-opt-show-icons" ${currentOptions.showEngineIcons ? 'checked' : ''}/>
                <span class="wa-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="wa-options-footer">
          <button type="button" class="wa-footer-btn reset" id="wa-opt-reset-btn">${t('resetDefaults')}</button>
          <button type="button" class="wa-footer-btn primary" id="wa-opt-save-btn">${t('closeEsc')}</button>
        </div>
      </div>
    `;
  }

  function bindOptionsModalEvents() {
    if (!optionsOverlay) return;

    // Close button
    optionsOverlay.querySelector('#wa-modal-close-btn').onclick = closeOptionsMenu;
    optionsOverlay.querySelector('#wa-opt-save-btn').onclick = closeOptionsMenu;

    // Reset button
    optionsOverlay.querySelector('#wa-opt-reset-btn').onclick = () => {
      if (confirm(t('resetConfirm'))) {
        currentOptions = { ...DEFAULT_OPTIONS };
        saveUserOptions(currentOptions);
        closeOptionsMenu();
        openOptionsMenu();
      }
    };

    // Engine toggle checkboxes
    optionsOverlay.querySelectorAll('.wa-engine-toggle').forEach(input => {
      input.onchange = () => {
        const id = input.dataset.id;
        let enabled = [...(currentOptions.enabledEngines || [])];
        if (input.checked) {
          if (!enabled.includes(id)) enabled.push(id);
        } else {
          enabled = enabled.filter(k => k !== id);
        }
        saveUserOptions({ enabledEngines: enabled });
      };
    });

    // Move up / down buttons
    optionsOverlay.querySelectorAll('.move-up').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const order = [...(currentOptions.engineOrder || ALL_ENGINES.map(e => e.id))];
        const idx = order.indexOf(id);
        if (idx > 0) {
          const tmp = order[idx - 1];
          order[idx - 1] = order[idx];
          order[idx] = tmp;
          saveUserOptions({ engineOrder: order });
          closeOptionsMenu();
          openOptionsMenu();
        }
      };
    });

    optionsOverlay.querySelectorAll('.move-down').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const order = [...(currentOptions.engineOrder || ALL_ENGINES.map(e => e.id))];
        const idx = order.indexOf(id);
        if (idx >= 0 && idx < order.length - 1) {
          const tmp = order[idx + 1];
          order[idx + 1] = order[idx];
          order[idx] = tmp;
          saveUserOptions({ engineOrder: order });
          closeOptionsMenu();
          openOptionsMenu();
        }
      };
    });

    // General inputs
    const langSelect = optionsOverlay.querySelector('#wa-opt-lang');
    langSelect.onchange = () => {
      saveUserOptions({ lang: langSelect.value });
      closeOptionsMenu();
      openOptionsMenu();
      refreshEngineList();
      const modeLabel = shadowRoot?.getElementById('wa-mode-label');
      if (modeLabel) modeLabel.textContent = getModeTitle(currentMode);
    };

    const tabFocusSelect = optionsOverlay.querySelector('#wa-opt-tab-focus');
    tabFocusSelect.onchange = () => {
      saveUserOptions({ tabFocus: tabFocusSelect.value });
    };

    const defaultEngSelect = optionsOverlay.querySelector('#wa-opt-default-engine');
    defaultEngSelect.onchange = () => {
      saveUserOptions({ defaultEngine: defaultEngSelect.value });
      pendingEngine = defaultEngSelect.value;
      updateMenuSelectionVisual(defaultEngSelect.value);
    };

    const archiveTodaySelect = optionsOverlay.querySelector('#wa-opt-archive-today-host');
    archiveTodaySelect.onchange = () => {
      saveUserOptions({ archiveTodayHost: archiveTodaySelect.value });
    };

    const showIconsToggle = optionsOverlay.querySelector('#wa-opt-show-icons');
    showIconsToggle.onchange = () => {
      saveUserOptions({ showEngineIcons: showIconsToggle.checked });
      refreshEngineList();
    };
  }

  // --- VIOLENTMONKEY MENU COMMANDS REGISTRATION (Zero Keyboard Shortcuts) ---
  loadUserOptions();

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('🏛️ Web Archives Panel', () => {
      ensureUI();
      if (!isMenuVisible) {
        setMode('currentPage');
        openMenu();
      } else {
        closeMenu();
      }
    });

    GM_registerMenuCommand('⚙️ Settings', () => {
      ensureUI();
      openOptionsMenu();
    });
  }
})();
