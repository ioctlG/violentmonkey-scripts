// ==UserScript==
// @name         ⚡ Allow Right-Click
// @namespace    https://violentmonkey.github.io/
// @version      5.1.0
// @description  The ultimate right-click, video, and copy unlocker. Unlocks native HTML5 video context menus (Picture-in-Picture, open in new tab, copy URL), image saving, CSS background images, and text selection across all difficult formats. Toggle with Alt+C. Disabled by default, resets on navigation/F5.
// @author       Antigravity
// @icon         https://lh3.googleusercontent.com/0fAGMSxhfuwv-vkXRDLE0ntBdluS-doMafSavRHuKL_LrUwBD65T9dRmZn_5o7U0MOpFPU45Msjh_BXTvn0SxuLA=s60
// @match        *://*/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @allFrames    true
// ==/UserScript==

(function () {
  'use strict';

  // --- STATE: DEFAULT OFF ---
  let isEnabled = false;
  let mainWorldInjected = false;

  // =========================================================================
  // 1. MAIN WORLD HOOKS (Injected on-demand to bypass page sandbox)
  // =========================================================================
  const MAIN_WORLD_SCRIPT = `
  try {
    const ogs = {
      pointers: {}
    };
    ogs.pointers.alert = window.alert;
    ogs.pointers.mp = MouseEvent.prototype.preventDefault;
    ogs.pointers.cp = ClipboardEvent.prototype.preventDefault;

    // Silence annoying alert() popups when active ("Right click is disabled!", etc.)
    Object.defineProperty(window, 'alert', {
      get() {
        return window.__arc_active__ ? (...args) => console.info('[alert suppressed]', ...args) : ogs.pointers.alert;
      },
      set(c) {
        ogs.pointers.alert = c;
      },
      configurable: true
    });

    // Unblock contextmenu, drag, click cancellation selectively without breaking site UI buttons/sliders
    Object.defineProperty(MouseEvent.prototype, 'preventDefault', {
      get() {
        if (!window.__arc_active__) return ogs.pointers.mp;
        return function(...args) {
          if (this && ['contextmenu', 'selectstart', 'dragstart'].includes(this.type)) {
            return;
          }
          return ogs.pointers.mp.apply(this, args);
        };
      },
      set(c) {
        ogs.pointers.mp = c;
      },
      configurable: true
    });

    Object.defineProperty(MouseEvent.prototype, 'returnValue', {
      get() {
        return window.__arc_active__ ? true : ('v' in this ? this.v : true);
      },
      set(c) {
        this.v = c;
      },
      configurable: true
    });

    // Unblock clipboard copy/cut/paste
    Object.defineProperty(ClipboardEvent.prototype, 'preventDefault', {
      get() {
        return window.__arc_active__ ? () => {} : ogs.pointers.cp;
      },
      set(c) {
        ogs.pointers.cp = c;
      },
      configurable: true
    });

    // Prevent sites from clearing text selection via removeAllRanges() (Naver, Daum, Zhihu)
    let sr = Selection.prototype.removeAllRanges;
    Object.defineProperty(Selection.prototype, 'removeAllRanges', {
      get() {
        return window.__arc_active__ ? () => {} : sr;
      },
      set(c) {
        sr = c;
      },
      configurable: true
    });

    // Neutralize inline blockers: window.oncontextmenu = () => false
    const PROPS = ['oncontextmenu', 'onselectstart', 'oncopy', 'oncut', 'ondragstart'];
    [Window.prototype, Document.prototype, HTMLElement.prototype].forEach(proto => {
      PROPS.forEach(p => {
        try {
          Object.defineProperty(proto, p, {
            get() { return null; },
            set(fn) {
              if (window.__arc_active__) return true;
              return fn;
            },
            configurable: true
          });
        } catch(e) {}
      });
    });

  } catch (e) {}
  `;

  function injectMainWorld() {
    if (mainWorldInjected) return;
    mainWorldInjected = true;
    try {
      const script = document.createElement('script');
      script.textContent = MAIN_WORLD_SCRIPT;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      if (typeof unsafeWindow !== 'undefined') {
        try {
          unsafeWindow.eval(MAIN_WORLD_SCRIPT);
        } catch (err) {}
      }
    }
  }

  function setMainWorldActive(active) {
    injectMainWorld();
    try {
      const script = document.createElement('script');
      script.textContent = `window.__arc_active__ = ${active};`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.__arc_active__ = active;
      }
    }
  }

  // =========================================================================
  // 2. DEEP MEDIA & OVERLAY PIERCER (Solves all tricky video/image formats)
  // =========================================================================
  const elements = new Map();
  const controllers = new Set();
  const tmps = new Set();

  const revert = () => {
    for (const [e, val] of elements) {
      e.style['pointer-events'] = val;
      delete e.dataset.igblock;
    }
    elements.clear();
    for (const controller of controllers) {
      controller.abort();
    }
    controllers.clear();
    for (const img of tmps) {
      img.remove();
    }
    tmps.clear();
  };

  // Traverses coordinates through both main DOM and Shadow DOM roots
  function getElementsAtPoint(x, y) {
    const list = document.elementsFromPoint(x, y) || [];
    const result = [...list];
    for (const el of list) {
      if (el.shadowRoot && typeof el.shadowRoot.elementsFromPoint === 'function') {
        try {
          const shadowList = el.shadowRoot.elementsFromPoint(x, y);
          if (shadowList && shadowList.length) {
            result.push(...shadowList);
          }
        } catch (err) {}
      }
    }
    return result;
  }

  const unblock = e => {
    // Look up to the broader video/media container only
    const playerContainer = e.target.closest?.('[class*="player"], [class*="video"], [id*="player"], [data-player], .html5-video-player');
    if (playerContainer) {
      for (const mv of playerContainer.querySelectorAll('video, canvas')) {
        elements.set(mv, mv.style['pointer-events']);
        mv.style.setProperty('pointer-events', 'auto', 'important');
      }
    }

    const es = getElementsAtPoint(e.clientX, e.clientY);

    const imgs = [];
    const vids = [];
    const npts = [];
    const bgs = [];

    for (const el of es) {
      // 1. Image & Canvas detection
      if ((el.src && el.tagName !== 'VIDEO') || el.tagName === 'CANVAS') {
        imgs.push(el);
      }

      // 2. Video detection (including elements wrapping or containing video)
      if (el.tagName === 'VIDEO' || el.querySelector?.('video')) {
        const v = el.tagName === 'VIDEO' ? el : el.querySelector('video');
        if (v && !vids.includes(v)) vids.push(v);
      }

      // 3. Text inputs (must be preserved)
      if (el.type && el.type.startsWith('text')) {
        npts.push(el);
      }

      // 4. CSS Background-Image detection
      if (!['INPUT', 'TEXTAREA'].includes(el.tagName)) {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\(["']?(.*?)["']?\)/);
          if (match && match[1] && !match[1].startsWith('data:image/svg')) {
            bgs.push({
              e: el,
              src: match[1]
            });
          }
        }
      }
    }

    // --- ENHANCED VIDEO UNBLOCKER ---
    // Unlocks Picture-in-Picture, Open video in new tab, and Copy video address
    if (vids.length) {
      vids.forEach(vid => {
        try {
          // A. Unlock Picture-in-Picture
          if (vid.hasAttribute('disablepictureinpicture')) {
            vid.removeAttribute('disablepictureinpicture');
          }
          vid.disablePictureInPicture = false;

          // B. Unlock download & playback rates
          if (vid.hasAttribute('controlslist')) {
            vid.removeAttribute('controlslist');
          }
          vid.controlsList?.remove?.('nodownload');
          vid.controlsList?.remove?.('nofullscreen');
          vid.controlsList?.remove?.('noremoteplayback');

          // C. Re-enable video address if src is blank
          if (!vid.getAttribute('src') && vid.currentSrc) {
            vid.setAttribute('src', vid.currentSrc);
          } else if (!vid.getAttribute('src')) {
            const srcTag = vid.querySelector('source[src]');
            if (srcTag && srcTag.src) {
              vid.setAttribute('src', srcTag.src);
            }
          }

          // D. Ensure clickable
          elements.set(vid, vid.style['pointer-events']);
          vid.style.setProperty('pointer-events', 'auto', 'important');
        } catch (err) {}
      });
    }

    const nlfy = el => {
      elements.set(el, el.style['pointer-events']);
      el.style['pointer-events'] = 'none';
      el.dataset.igblock = 'true';
    };

    if (vids.length) {
      // Prioritize video: disable overlay elements sitting above the video
      for (const el of es) {
        if (vids.includes(el) || npts.includes(el)) {
          el.focus();
          break;
        } else {
          nlfy(el);
        }
      }
    } else if (imgs.length || bgs.length) {
      const next = {
        imgs() {
          for (const el of es) {
            if (imgs.includes(el) || npts.includes(el)) {
              el.focus();
              break;
            } else {
              nlfy(el);
            }
          }
        },
        bgs() {
          // Inject a temporary 10x10 zero-opacity image so Chrome opens the native image context menu!
          const img = new Image();
          img.width = 10;
          img.height = 10;
          img.style = `
            position: fixed;
            left: ${e.clientX - 5}px;
            top: ${e.clientY - 5}px;
            opacity: 0;
            z-index: 2147483647;
            pointer-events: auto !important;
          `;
          img.src = bgs[0].src;
          document.body.append(img);
          tmps.add(img);
        }
      };

      if (imgs.length === 0) {
        next.bgs();
      } else if (bgs.length === 0) {
        next.imgs();
      } else {
        const ni = es.indexOf(imgs[0]);
        const nb = es.indexOf(bgs[0].e);
        if (nb < ni) {
          next.bgs();
        } else {
          next.imgs();
        }
      }
    } else if (npts.length) {
      for (const el of es) {
        if (npts.includes(el)) {
          el.focus();
          break;
        } else {
          nlfy(el);
        }
      }
    }
  };

  let activeUnblock = false;
  let revertTimer = null;

  function scheduleRevert(delay = 2500) {
    clearTimeout(revertTimer);
    revertTimer = setTimeout(() => {
      if (activeUnblock) {
        activeUnblock = false;
        revert();
      }
    }, delay);
  }

  const handlePointerOrMouse = e => {
    if (e.button !== 2) return; // Right-click only
    if (!isEnabled) return; // Strictly passive and 0% overhead when disabled

    unblock(e);
    activeUnblock = true;
    scheduleRevert(2500);
  };

  const handlePointerUpOrContext = e => {
    if (e.button === 2 || e.type === 'contextmenu') {
      if (!isEnabled) return;
      unblock(e);
      scheduleRevert(2500);
    }
  };

  // Revert on left-click, window blur, or navigation
  window.addEventListener('click', e => {
    if (activeUnblock && e.button === 0) {
      activeUnblock = false;
      clearTimeout(revertTimer);
      revert();
    }
  }, true);

  window.addEventListener('blur', () => {
    if (activeUnblock) {
      activeUnblock = false;
      clearTimeout(revertTimer);
      revert();
    }
  });

  window.addEventListener('pointerdown', handlePointerOrMouse, true);
  window.addEventListener('mousedown', handlePointerOrMouse, true);
  window.addEventListener('contextmenu', handlePointerUpOrContext, true);

  const touchstart = e => {
    if (!isEnabled) return;
    if (e.touches && e.touches[0]) {
      unblock({
        target: e.target,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      });
      activeUnblock = true;
    }
  };

  document.addEventListener('touchstart', touchstart, true);

  // =========================================================================
  // 3. CAPTURE EVENT SAFEGUARDS (Active only when isEnabled)
  // =========================================================================
  const skip = e => {
    if (!isEnabled) return;
    if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    e.stopPropagation();
  };

  const keydown = e => {
    // Global Alt + C hotkey to toggle Allow Right-Click ON / OFF
    const isAltC = e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyC' || e.key?.toLowerCase() === 'c' || e.key?.toLowerCase() === 'ç');
    if (isAltC) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggle();
      return;
    }

    if (!isEnabled) return;
    const meta = e.metaKey || e.ctrlKey;
    if (meta && ['KeyC', 'KeyV', 'KeyP', 'KeyA', 'KeyU', 'KeyS'].includes(e.code)) {
      e.stopPropagation();
    }
  };

  const paste = e => {
    if (!isEnabled) return;
    e.stopPropagation();
    e.target.addEventListener('input', skip, true);
    requestAnimationFrame(() => {
      e.target.removeEventListener('input', skip, true);
    });
  };

  document.addEventListener('dragstart', skip, true);
  document.addEventListener('selectstart', skip, true);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('copy', skip, true);
  document.addEventListener('cut', skip, true);
  document.addEventListener('paste', paste, true);
  document.addEventListener('contextmenu', skip, true);

  // =========================================================================
  // 4. CSS STYLES & SELECTION UNLOCK
  // =========================================================================
  const STYLE_ID = 'arc-port-styles';

  function applyStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .copy-protection-on #single-article-right,
      .copy-protection-on {
        pointer-events: initial !important;
      }
      *, *::before, *::after {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
      ::-moz-selection {
        color: #000 !important;
        background: #accef7 !important;
      }
      ::selection {
        color: #000 !important;
        background: #accef7 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  function removeStyles() {
    const s = document.getElementById(STYLE_ID);
    if (s) s.remove();
  }

  function cleanSheets() {
    try {
      for (const sheet of document.styleSheets) {
        for (const rule of sheet.rules || sheet.cssRules || []) {
          if (rule.style && rule.style['user-select'] === 'none') {
            rule.style['user-select'] = 'initial';
          }
        }
      }
    } catch (e) {}
  }

  // =========================================================================
  // 5. ON-DEMAND TOGGLE & AUTOMATIC RESET ON NAVIGATION / F5
  // =========================================================================
  function enable(silent) {
    if (isEnabled) return;
    isEnabled = true;
    setMainWorldActive(true);
    applyStyles();
    cleanSheets();
    if (!silent) {
      showToast('⚡ Allow Right-Click: Enabled (ON)', true);
      broadcastState(true);
    }
    renderMenu();
  }

  function disable(silent) {
    if (!isEnabled) return;
    isEnabled = false;
    setMainWorldActive(false);
    removeStyles();
    revert();
    if (!silent) {
      showToast('⚪ Allow Right-Click: Disabled (OFF)', false);
      broadcastState(false);
    }
    renderMenu();
  }

  function toggle() {
    if (isEnabled) {
      disable(false);
    } else {
      enable(false);
    }
  }

  // Cross-frame sync so embedded media & iframes toggle together without duplicate toasts
  function broadcastState(state) {
    try {
      window.postMessage({ type: '__ARC_STATE_CHANGE__', isEnabled: state }, '*');
    } catch (e) {}
  }

  window.addEventListener('message', e => {
    try {
      if (e.data && e.data.type === '__ARC_STATE_CHANGE__') {
        if (e.data.isEnabled !== isEnabled) {
          if (e.data.isEnabled) {
            enable(true);
          } else {
            disable(true);
          }
        }
      }
    } catch (e) {}
  });

  // Auto-reset when navigating within Single Page Apps (YouTube, Twitter, Reddit, Instagram)
  let lastUrl = window.location.href;

  function handleUrlChange() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (isEnabled) {
        disable(true); // Silent reset on route change
      }
    }
  }

  window.addEventListener('popstate', handleUrlChange);
  window.addEventListener('hashchange', handleUrlChange);

  const origPushState = history.pushState;
  if (origPushState) {
    history.pushState = function () {
      const res = origPushState.apply(this, arguments);
      handleUrlChange();
      return res;
    };
  }

  const origReplaceState = history.replaceState;
  if (origReplaceState) {
    history.replaceState = function () {
      const res = origReplaceState.apply(this, arguments);
      handleUrlChange();
      return res;
    };
  }

  // Toast Notification (Top-Right)
  function showToast(msg, isSuccess = true) {
    try {
      const existing = document.getElementById('arc-toast-notify');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'arc-toast-notify';
      toast.textContent = msg;
      Object.assign(toast.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(10px)',
        webkitBackdropFilter: 'blur(10px)',
        color: '#ffffff',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        border: '1px solid ' + (isSuccess ? 'rgba(74, 222, 128, 0.45)' : 'rgba(248, 113, 113, 0.45)'),
        zIndex: '2147483647',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-10px)',
        transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      });

      const parent = document.body || document.documentElement;
      if (!parent) return;
      parent.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 250);
      }, 1800);
    } catch (e) {}
  }

  // =========================================================================
  // 6. VIOLENTMONKEY MENU INTEGRATION
  // =========================================================================
  let currentMenuId = null;

  function renderMenu() {
    if (typeof GM_registerMenuCommand === 'undefined') return;

    if (currentMenuId && typeof GM_unregisterMenuCommand !== 'undefined') {
      try {
        GM_unregisterMenuCommand(currentMenuId);
      } catch (e) {}
    }

    const label = isEnabled
      ? '🟢 Allow Right-Click: Enabled (Alt+C)'
      : '⚪ Allow Right-Click: Disabled (Alt+C)';

    currentMenuId = GM_registerMenuCommand(label, toggle);
  }

  renderMenu();

})();
