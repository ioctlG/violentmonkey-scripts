// ==UserScript==
// @name         Startpage Anonymous View
// @namespace    https://github.com/ioctlG/violentmonkey-scripts
// @version      1.8.5
// @description  Open any web page directly in Startpage Anonymous View proxy with zero search engine exposure.
// @author       ioctlG
// @match        *://*/*
// @icon         https://www.startpage.com/favicon.ico
// @downloadURL  https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/startpage_anonymous_view.user.js
// @updateURL    https://github.com/ioctlG/violentmonkey-scripts/raw/refs/heads/main/startpage_anonymous_view.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const HASH_TRIGGER = '#auto-av';
  const SP_LANG_PARAMS = '&lui=english';
  const hostname = window.location.hostname;
  const isStartpage = hostname.includes('startpage.com');
  const isTunnel = isStartpage && (window.location.pathname.startsWith('/__av/') || hostname.startsWith('av-'));
  const hasAutoAv = window.location.hash.startsWith(HASH_TRIGGER);
  const isDdg = hostname.includes('duckduckgo.com');

  // =========================================================================
  // 💾 CROSS-ORIGIN STORAGE (Violentmonkey GM Storage)
  // Guarantees search queries persist across tabs, iframes, and origins
  // =========================================================================
  function getPendingQuery() {
    try {
      if (typeof GM_getValue === 'function') {
        const q = GM_getValue('sp_ddg_pending_query', '');
        const ts = GM_getValue('sp_ddg_pending_ts', 0);
        if (q && (Date.now() - ts < 60000)) {
          return q;
        } else if (q) {
          GM_deleteValue('sp_ddg_pending_query');
          GM_deleteValue('sp_ddg_pending_ts');
        }
      }
    } catch (_) {}
    return '';
  }

  function setPendingQuery(q) {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue('sp_ddg_pending_query', q);
        GM_setValue('sp_ddg_pending_ts', Date.now());
      }
    } catch (_) {}
  }

  function clearPendingQuery() {
    try {
      if (typeof GM_deleteValue === 'function') {
        GM_deleteValue('sp_ddg_pending_query');
        GM_deleteValue('sp_ddg_pending_ts');
      }
    } catch (_) {}
  }

  // =========================================================================
  // ⚡ 1. STARTPAGE GATEWAY ENGINE (#auto-av trigger)
  // Runs on Startpage search results, displays dark curtain, triggers Anonymous View
  // =========================================================================
  if (isStartpage && hasAutoAv) {
    let isRedirecting = false;
    let checkInterval = null;
    let observer = null;
    let retryAttempted = false;

    function injectCurtain() {
      if (document.getElementById('sp-loading-curtain')) return;

      const style = document.createElement('style');
      style.id = 'sp-curtain-style';
      style.textContent = `
        #sp-loading-curtain {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: #111216 !important;
          z-index: 2147483647 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          color: #ffffff !important;
          user-select: none !important;
          transition: opacity 0.25s ease;
        }
        .sp-spinner {
          width: 44px;
          height: 44px;
          border: 3.5px solid rgba(168, 85, 247, 0.2);
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: sp-curtain-spin 0.8s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes sp-curtain-spin {
          to { transform: rotate(360deg); }
        }
      `;
      (document.head || document.documentElement).appendChild(style);

      const curtain = document.createElement('div');
      curtain.id = 'sp-loading-curtain';
      curtain.innerHTML = `
        <div id="sp-loading-body" style="display:flex; flex-direction:column; align-items:center;">
          <div class="sp-spinner"></div>
          <div style="font-size: 18px; font-weight: 600; letter-spacing: 0.3px; margin-bottom: 6px;">Opening Startpage Anonymous View...</div>
          <div id="sp-curtain-status" style="font-size: 13.5px; color: #94a3b8;">Establishing secure proxy tunnel, please wait...</div>
        </div>
      `;
      (document.body || document.documentElement).appendChild(curtain);
    }

    function updateCurtainStatus(text) {
      const statusEl = document.getElementById('sp-curtain-status');
      if (statusEl) statusEl.innerHTML = text;
    }

    function dismissCurtain() {
      const curtain = document.getElementById('sp-loading-curtain');
      if (curtain) {
        curtain.style.opacity = '0';
        setTimeout(() => {
          if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain);
        }, 250);
      }
    }

    injectCurtain();

    function findAndTriggerAnonymousView() {
      if (isRedirecting) return true;

      // 1. Known reliable selectors
      const selectors = [
        'a[data-qa="anonymous-view-link"]',
        'a[data-qa*="anonymous"]',
        'a[data-qa*="anonim"]',
        'button[data-qa*="anonymous"]',
        'button[data-qa*="anonim"]',
        'a.anonymous-view-btn',
        'a.anonymous-view',
        '.anonymous-view',
        'a[href*="/__av/"]',
        'a[href*="/sp/proxy"]',
        'a[href*="proxy"]',
        'a[href*="anonymous-view"]',
        'a[class*="anonymous"]',
        'button[class*="anonymous"]',
        'a[aria-label*="anonymous view" i]',
        'a[aria-label*="anonim görünüm" i]',
        'button[aria-label*="anonymous view" i]',
        'button[aria-label*="anonim görünüm" i]',
        'a[title*="anonymous view" i]',
        'a[title*="anonim görünüm" i]',
        'button[title*="anonymous view" i]',
        'button[title*="anonim görünüm" i]'
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && !el.closest('#sp-loading-curtain')) {
          return executeSingleNavigation(el);
        }
      }

      // 2. Links or buttons enclosing an SVG mask/privacy icon
      const svgEls = document.querySelectorAll('a svg, button svg');
      for (let s = 0; s < svgEls.length; s++) {
        const p = svgEls[s].closest('a, button');
        if (p && !p.closest('#sp-loading-curtain')) {
          const aria = (p.getAttribute('aria-label') || '').toLowerCase();
          const title = (p.getAttribute('title') || '').toLowerCase();
          const cls = (p.className || '').toString().toLowerCase();
          const href = (p.getAttribute('href') || '').toLowerCase();
          if (
            aria.includes('anonymous') || aria.includes('anonim') || aria.includes('proxy') ||
            title.includes('anonymous') || title.includes('anonim') || title.includes('proxy') ||
            cls.includes('anonymous') || cls.includes('anonim') || cls.includes('proxy') ||
            href.includes('__av') || href.includes('proxy')
          ) {
            return executeSingleNavigation(p);
          }
        }
      }

      // 3. Text content fallbacks
      const candidates = document.querySelectorAll('a, button, span, div, p');
      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (el.closest('#sp-loading-curtain')) continue;

        const text = (el.textContent || '').trim().toLowerCase();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        const title = (el.getAttribute('title') || '').toLowerCase();
        if (
          text.includes('anonymous view') ||
          text.includes('visit in anonymous') ||
          text.includes('anonim görünüm') ||
          aria.includes('anonymous view') ||
          aria.includes('anonim görünüm') ||
          title.includes('anonymous view') ||
          title.includes('anonim görünüm')
        ) {
          const clickable = el.closest('a, button') || el;
          if (clickable.closest('#sp-loading-curtain')) continue;
          return executeSingleNavigation(clickable);
        }
      }

      return false;
    }

    function executeSingleNavigation(targetEl) {
      if (isRedirecting) return true;
      isRedirecting = true;

      updateCurtainStatus('Connection captured! Routing into tunnel...');
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      const rawHref = targetEl.getAttribute('href') || targetEl.href || '';
      let resolvedUrl = '';
      if (rawHref && (rawHref.includes('__av') || rawHref.includes('proxy') || rawHref.includes('/sp/'))) {
        resolvedUrl = targetEl.href || (new URL(rawHref, window.location.origin)).href;
      } else {
        const parentLink = targetEl.closest('a');
        if (parentLink && parentLink.href) {
          resolvedUrl = parentLink.href;
        }
      }

      if (resolvedUrl) {
        window.location.replace(resolvedUrl);
        return true;
      }

      if (targetEl.target) targetEl.target = '_self';
      const form = targetEl.closest('form');
      if (form && form.target) form.target = '_self';

      targetEl.click();
      targetEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(dismissCurtain, 4500);
      return true;
    }

    function checkNoResultsAndCascade() {
      if (isRedirecting) return;
      const bodyText = document.body ? document.body.innerText : '';
      if (
        bodyText.includes('no results for this search') ||
        bodyText.includes('sonuç bulunamadı') ||
        bodyText.includes('Did you mean')
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('query') || '';

        if (!retryAttempted) {
          retryAttempted = true;
          try {
            const parsed = new URL(q.startsWith('http') ? q : ('https://' + q));
            const baseDomain = parsed.hostname;
            if (q !== baseDomain && q !== `https://${baseDomain}/`) {
              updateCurtainStatus(`Routing to domain tunnel (<b>${baseDomain}</b>)...`);
              setTimeout(() => {
                window.location.replace(`https://www.startpage.com/sp/search?query=${encodeURIComponent(baseDomain)}${SP_LANG_PARAMS}${HASH_TRIGGER}`);
              }, 250);
              return;
            }
          } catch (_) {}
        }

        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        updateCurtainStatus('No results found.');
        setTimeout(dismissCurtain, 500);
      }
    }

    function startDetection() {
      injectCurtain();
      if (findAndTriggerAnonymousView()) return;

      observer = new MutationObserver(() => {
        if (!findAndTriggerAnonymousView()) {
          checkNoResultsAndCascade();
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      checkInterval = setInterval(() => {
        if (!findAndTriggerAnonymousView()) {
          checkNoResultsAndCascade();
        }
      }, 100);

      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (!isRedirecting) {
          dismissCurtain();
        }
      }, 5000);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startDetection);
    } else {
      startDetection();
    }
    return; // Gateway execution stops here, never leaks into tunnel code
  }

  // Performance Guard: Skip 3rd party ad iframes on regular external sites
  if (window !== window.top && !isTunnel && !isDdg) return;

  // =========================================================================
  // 🕶️ 2. IN-TUNNEL EXPERIENCE (av-*.startpage.com or Proxied Iframes)
  // =========================================================================
  if (isTunnel || isDdg) {
    // 1. Suppress Startpage promotional brand header (##.av-banner-brand-link)
    if (isTunnel) {
      const bannerStyle = document.createElement('style');
      bannerStyle.id = 'sp-tunnel-enhancements';
      bannerStyle.textContent = `
        .av-banner-brand-link {
          display: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(bannerStyle);
    }

    // 2. DuckDuckGo Search Execution Engine
    function tryExecuteDdgSearch(forcedQuery) {
      let query = forcedQuery || getPendingQuery();
      if (!query) {
        let hash = window.location.hash || '';
        try {
          if (!hash && window.top && window.top.location.hash) {
            hash = window.top.location.hash;
          }
        } catch (_) {}
        const match = hash.match(/[#&]q=([^&]+)/);
        if (match) query = decodeURIComponent(match[1]).trim();
      }
      if (!query) return false;

      function getSearchInput(doc) {
        if (!doc) return null;
        return doc.querySelector('input[name="q"], #searchbox_input, input#search_form_input_homepage, input#search_form_input, textarea[name="q"], input[type="search"]');
      }

      let input = getSearchInput(document);
      if (!input) {
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
          try {
            const idoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            input = getSearchInput(idoc);
            if (input) break;
          } catch (_) {}
        }
      }

      if (input) {
        // Successful capture: clear pending query to avoid execution loops
        clearPendingQuery();
        try {
          if (window.top && window.top.location.hash.includes('q=')) {
            window.top.history.replaceState(null, '', window.top.location.href.replace(/[#&]q=[^&]+/, ''));
          }
        } catch (_) {}

        // Reactive input value assignment compatible with modern frameworks
        input.focus();
        try {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                               Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (nativeSetter) {
            nativeSetter.call(input, query);
          } else {
            input.value = query;
          }
        } catch (_) {
          input.value = query;
        }

        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        // Form submission or search button click
        const form = input.closest('form');
        if (form) {
          const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], #searchbox_button, button[aria-label*="Search" i], button[aria-label*="Ara" i]');
          if (submitBtn) {
            submitBtn.click();
            return true;
          }
          if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
            return true;
          }
          form.submit();
          return true;
        }

        const anyBtn = document.querySelector('button[type="submit"], #searchbox_button, button[aria-label*="Search" i], button[aria-label*="Ara" i]');
        if (anyBtn) {
          anyBtn.click();
          return true;
        }

        // Enter key fallback simulation
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        return true;
      }
      return false;
    }

    // postMessage listener: triggers DuckDuckGo inside cross-origin iframes instantly
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'SP_DDG_SEARCH' && e.data.query) {
        tryExecuteDdgSearch(e.data.query);
      }
    });

    // High frequency observation while page/iframe loads
    const pendingOnLoad = getPendingQuery();
    if (pendingOnLoad) {
      let checkCount = 0;
      const checkTimer = setInterval(() => {
        checkCount++;
        if (tryExecuteDdgSearch() || checkCount > 80) {
          clearInterval(checkTimer);
        }
      }, 50);

      const observer = new MutationObserver(() => {
        if (tryExecuteDdgSearch()) {
          clearInterval(checkTimer);
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => {
        clearInterval(checkTimer);
        observer.disconnect();
      }, 6000);
    }

    // =========================================================================
    // 🧭 MODERN SIDEBAR DRAWER OMNIBAR (window.top inside Tunnel ONLY)
    // Container-style: Launches new searches & URLs in a NEW TAB
    // =========================================================================
    if (window === window.top && isTunnel) {
      function injectOmnibar() {
        if (document.getElementById('sp-omnibar-host')) return;

        const host = document.createElement('div');
        host.id = 'sp-omnibar-host';
        host.style.all = 'initial';
        host.style.position = 'fixed';
        host.style.left = '0';
        host.style.bottom = '28px';
        host.style.zIndex = '2147483647';
        host.style.pointerEvents = 'none'; // Prevents any click bleed-through to underlying site
        (document.body || document.documentElement).appendChild(host);

        const shadow = host.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
          <style>
            :host { all: initial; }
            .sp-drawer {
              pointer-events: auto !important;
              display: flex;
              align-items: center;
              background: rgba(15, 17, 23, 0.94);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-left: none;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              box-sizing: border-box;
              user-select: none;
              transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
              overflow: hidden;
              height: 44px;
            }

            .sp-drawer.collapsed {
              width: 32px;
              border-radius: 0 12px 12px 0;
              cursor: pointer;
              padding: 0;
            }

            .sp-drawer.collapsed:hover {
              width: 36px;
              background: rgba(24, 27, 36, 0.98);
              border-color: rgba(168, 85, 247, 0.5);
              box-shadow: 2px 8px 24px rgba(168, 85, 247, 0.28);
            }

            .sp-drawer.collapsed:hover .chevron-icon {
              stroke: #c084fc;
            }

            .sp-drawer.expanded {
              width: 390px;
              border-radius: 0 14px 14px 0;
              border-color: rgba(168, 85, 247, 0.45);
              box-shadow: 0 14px 35px rgba(0, 0, 0, 0.75), 0 0 20px rgba(168, 85, 247, 0.2);
              padding: 0 8px 0 2px;
            }

            .sp-toggle-btn {
              background: transparent;
              border: none;
              padding: 0;
              margin: 0;
              width: 32px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              outline: none;
              flex-shrink: 0;
            }

            .chevron-icon {
              width: 16px;
              height: 16px;
              stroke: #94a3b8;
              transition: stroke 0.2s, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .sp-drawer.expanded .chevron-icon {
              transform: rotate(180deg);
              stroke: #a1a1aa;
            }

            .sp-drawer.expanded .sp-toggle-btn:hover .chevron-icon {
              stroke: #ffffff;
            }

            .sp-content-wrap {
              display: none;
              flex: 1;
              align-items: center;
              margin-left: 2px;
            }

            .sp-drawer.expanded .sp-content-wrap {
              display: flex;
            }

            .sp-input-box {
              flex: 1;
              display: flex;
              align-items: center;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              padding: 0 8px;
              height: 32px;
              margin-right: 6px;
              transition: border-color 0.2s, background 0.2s;
            }

            .sp-input-box:focus-within {
              background: rgba(255, 255, 255, 0.09);
              border-color: rgba(168, 85, 247, 0.6);
            }

            .sp-search-icon {
              width: 14px;
              height: 14px;
              stroke: #94a3b8;
              flex-shrink: 0;
              margin-right: 6px;
            }

            input {
              width: 100%;
              background: transparent;
              border: none;
              outline: none;
              color: #f8fafc;
              font-family: inherit;
              font-size: 13px;
              font-weight: 500;
              padding: 0;
            }

            input::placeholder {
              color: #64748b;
              font-size: 12px;
            }

            .sp-action-btn {
              background: transparent;
              border: none;
              color: #94a3b8;
              cursor: pointer;
              padding: 6px;
              margin-left: 2px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              outline: none;
              transition: color 0.15s, background 0.15s;
            }

            .sp-action-btn svg {
              width: 15px;
              height: 15px;
            }

            .sp-action-btn:hover {
              color: #ffffff;
              background: rgba(255, 255, 255, 0.1);
            }
          </style>

          <div class="sp-drawer collapsed" id="drawer">
            <button class="sp-toggle-btn" id="toggleBtn" title="In-Tunnel Search & Navigation (Alt+S)">
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div class="sp-content-wrap">
              <div class="sp-input-box">
                <svg class="sp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="omniInput" placeholder="Search DuckDuckGo in new tab or enter URL..." autocomplete="off" spellcheck="false" />
              </div>
              <button class="sp-action-btn" id="submitBtn" title="Open in New Tab (Enter)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <button class="sp-action-btn" id="closeBtn" title="Close (Esc)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        `;

        const drawer = shadow.getElementById('drawer');
        const toggleBtn = shadow.getElementById('toggleBtn');
        const input = shadow.getElementById('omniInput');
        const submitBtn = shadow.getElementById('submitBtn');
        const closeBtn = shadow.getElementById('closeBtn');

        // Complete click-through prevention: prevent events from bleeding through
        ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick'].forEach(evt => {
          drawer.addEventListener(evt, (e) => {
            e.stopPropagation();
          });
        });

        function expand() {
          drawer.classList.remove('collapsed');
          drawer.classList.add('expanded');
          setTimeout(() => input.focus(), 150);
        }

        function collapse() {
          drawer.classList.remove('expanded');
          drawer.classList.add('collapsed');
          input.value = '';
        }

        function openUrlInNewTab(url) {
          try {
            if (typeof GM_openInTab === 'function') {
              GM_openInTab(url, { active: true, insert: true });
              return;
            }
          } catch (_) {}
          window.open(url, '_blank', 'noopener,noreferrer');
        }

        function executeAction() {
          const val = (input.value || '').trim();
          if (!val) return;

          // 1. Direct URL detection (e.g. github.com, test.co.uk or https://...)
          const isUrlPattern = /^https?:\/\//i.test(val) || /^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(val);
          if (isUrlPattern) {
            let targetUrl = /^https?:\/\//i.test(val) ? val : ('https://' + val);
            try {
              const u = new URL(targetUrl);
              const paramsToRemove = [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid', 'twclid',
                'chatID', 'chat_id', 'session_id', 'token', 'auth', '_ga', '_gl'
              ];
              paramsToRemove.forEach(p => u.searchParams.delete(p));
              targetUrl = u.toString();
            } catch (_) {}

            const spUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent(targetUrl)}${SP_LANG_PARAMS}${HASH_TRIGGER}`;
            collapse();
            openUrlInNewTab(spUrl);
            return;
          }

          // 2. Search query (e.g. 'selamx', 'merhaba', 'privacy guide')
          // Save to GM storage: retrieved immediately by DuckDuckGo in the new tab
          setPendingQuery(val);

          // Launch DuckDuckGo in a NEW TAB through the proxy tunnel (preserving current page)
          const ddgThroughTunnelUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent('https://duckduckgo.com/')}${SP_LANG_PARAMS}${HASH_TRIGGER}`;
          collapse();
          openUrlInNewTab(ddgThroughTunnelUrl);
        }

        toggleBtn.onclick = (e) => {
          e.stopPropagation();
          if (drawer.classList.contains('collapsed')) {
            expand();
          } else {
            collapse();
          }
        };

        drawer.onclick = (e) => {
          if (drawer.classList.contains('collapsed')) {
            expand();
          }
        };

        submitBtn.onclick = (e) => {
          e.stopPropagation();
          executeAction();
        };

        closeBtn.onclick = (e) => {
          e.stopPropagation();
          collapse();
        };

        input.onkeydown = (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            executeAction();
          } else if (e.key === 'Escape') {
            collapse();
          }
        };

        // Keyboard Shortcut: Alt + S opens/focuses the in-tunnel omnibar
        window.addEventListener('keydown', (e) => {
          if (e.altKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
            e.preventDefault();
            if (drawer.classList.contains('collapsed')) {
              expand();
            } else {
              collapse();
            }
          }
        }, true);

        // Click-outside listener: smoothly collapses drawer when clicking on the page
        document.addEventListener('click', () => {
          if (drawer.classList.contains('expanded')) {
            collapse();
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectOmnibar);
      } else {
        injectOmnibar();
      }
    }
    return;
  }

  // =========================================================================
  // 🔘 3. VIOLENTMONKEY CONTEXT MENU (0 MB RAM / 0% CPU on Normal Sites)
  // =========================================================================
  if (!isStartpage && typeof GM_registerMenuCommand === 'function') {
    let isLaunching = false;

    GM_registerMenuCommand('Open in Startpage Anonymous View', () => {
      if (isLaunching) return;
      isLaunching = true;
      setTimeout(() => { isLaunching = false; }, 1500);

      const currentUrl = window.location.href;
      if (!currentUrl || !currentUrl.startsWith('http')) {
        alert('Please run this command on a valid web page.');
        return;
      }

      let targetQuery = currentUrl;
      try {
        const u = new URL(currentUrl);
        const paramsToRemove = [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
          'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid', 'twclid',
          'chatID', 'chat_id', 'session_id', 'token', 'auth', '_ga', '_gl'
        ];
        paramsToRemove.forEach(p => u.searchParams.delete(p));

        if (u.searchParams.toString() === '') {
          targetQuery = u.origin + u.pathname;
        } else {
          targetQuery = u.origin + u.pathname + '?' + u.searchParams.toString();
        }
      } catch (_) {}

      const spUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent(targetQuery)}${SP_LANG_PARAMS}${HASH_TRIGGER}`;

      try {
        if (typeof GM_openInTab === 'function') {
          GM_openInTab(spUrl, { active: true, insert: true });
          return;
        }
      } catch (_) {}

      window.open(spUrl, '_blank', 'noopener,noreferrer');
    });
  }
})();
