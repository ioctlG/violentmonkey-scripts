// ==UserScript==
// @name         ⚡ Search by Image
// @namespace    https://violentmonkey.github.io/
// @version      3.9.3
// @description  A sleek, pinned, draggable reverse image search panel featuring official options menu, engine toggling, reordering, all 46 service profile icons/SVGs, in-page element selection, raw image extraction, screen capture cropping, local file browsing with paste support, and direct URL input across Google Lens, Yandex, Lenso.ai, Pinterest, Bing, TinEye, trace.moe, SauceNAO, and 40+ engines. All tabs open in the background without stealing focus. Intelligent viewport boundary protection and full Pinterest visual search gallery feed.
// @author       Antigravity
// @icon         https://raw.githubusercontent.com/dessant/search-by-image/main/src/assets/icons/app/icon.svg
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      *
// @connect      api.pinterest.com
// @connect      api.imgur.com
// @connect      i.imgur.com
// @connect      litterbox.catbox.moe
// @connect      litter.catbox.moe
// @connect      catbox.moe
// @connect      files.catbox.moe
// @connect      lens.google.com
// @connect      www.google.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // --- AUTOMATIONS FOR TARGET SITES ---
  if (window.location.hostname.includes('lenso.ai') && window.location.hash.includes('sbi-search')) {
    handleLensoAutomation();
  }
  if (window.location.hostname.includes('google.') || window.location.hostname.includes('lens.google.com')) {
    const lensTime = GM_getValue('sbi_lens_time');
    if (lensTime && Date.now() - lensTime < 60000) {
      handleGoogleLensAutomation();
    }
  }
  if (window.location.hostname.includes('yandex.') || window.location.hostname.includes('ya.ru')) {
    const yTime = GM_getValue('sbi_yandex_time');
    if (yTime && Date.now() - yTime < 60000) {
      handleYandexAutomation();
    }
  }
  if (window.location.hostname.includes('bing.com')) {
    const bTime = GM_getValue('sbi_bing_time');
    if (bTime && Date.now() - bTime < 60000) {
      handleBingAutomation();
    }
  }

  // --- ALL 46 SUPPORTED ENGINES LIST ---
  const ALL_ENGINES = [{"id": "googleLens", "name": "Google Lens"}, {"id": "lenso", "name": "Lenso.ai"}, {"id": "bing", "name": "Bing Images"}, {"id": "yandex", "name": "Yandex.Images"}, {"id": "baidu", "name": "Baidu Image Search"}, {"id": "sogou", "name": "Sogou Images"}, {"id": "tineye", "name": "TinEye Reverse Image Search"}, {"id": "whatanime", "name": "trace.moe"}, {"id": "saucenao", "name": "SauceNAO"}, {"id": "iqdb", "name": "IQDB"}, {"id": "ascii2d", "name": "Ascii2d"}, {"id": "getty", "name": "Getty Images"}, {"id": "istock", "name": "iStock"}, {"id": "shutterstock", "name": "Shutterstock"}, {"id": "adobestock", "name": "Adobe Stock"}, {"id": "depositphotos", "name": "Depositphotos"}, {"id": "pinterest", "name": "Pinterest"}, {"id": "qihoo", "name": "360 Search"}, {"id": "taobao", "name": "Taobao"}, {"id": "alibabaChina", "name": "Alibaba China"}, {"id": "dreamstime", "name": "Dreamstime"}, {"id": "alamy", "name": "Alamy"}, {"id": "123rf", "name": "123RF"}, {"id": "esearch", "name": "eSearch plus"}, {"id": "tmview", "name": "TMview"}, {"id": "branddb", "name": "Global Brand Database"}, {"id": "madridMonitor", "name": "Madrid Monitor"}, {"id": "auTrademark", "name": "Australian Trade Mark Search"}, {"id": "auDesign", "name": "Australian Design Search"}, {"id": "nzTrademark", "name": "IPONZ Trade Mark Check"}, {"id": "jpDesign", "name": "Graphic Image Park"}, {"id": "pimeyes", "name": "PimEyes"}, {"id": "stocksy", "name": "Stocksy United"}, {"id": "pond5", "name": "Pond5"}, {"id": "pixta", "name": "PIXTA"}, {"id": "ikea", "name": "IKEA"}, {"id": "repostSleuth", "name": "Reddit Repost Sleuth"}, {"id": "shein", "name": "SHEIN"}, {"id": "lykdat", "name": "LykDat"}, {"id": "wildberries", "name": "Wildberries"}, {"id": "lexica", "name": "Lexica"}, {"id": "kagi", "name": "Kagi Search"}, {"id": "freepik", "name": "Freepik"}, {"id": "icons8", "name": "Icons8"}, {"id": "unsplash", "name": "Unsplash"}, {"id": "vcg", "name": "VCG"}];

  // --- ALL 46 OFFICIAL SERVICE ICONS (SVGs & PNG Base64 with Scoped IDs) ---
  const SVG_ICONS = {"all": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M96,8C47.424,8,8,47.424,8,96s39.424,88,88,88s88-39.424,88-88S144.576,8,96,8z M87.2,165.784 C52.44,161.472,25.6,131.904,25.6,96c0-5.456,0.704-10.648,1.848-15.752L69.6,122.4v8.8c0,9.68,7.92,17.6,17.6,17.6V165.784z M147.92,143.432c-2.288-7.128-8.8-12.232-16.72-12.232h-8.8v-26.4c0-4.84-3.96-8.8-8.8-8.8H60.8V78.4h17.6 c4.84,0,8.8-3.96,8.8-8.8V52h17.6c9.68,0,17.6-7.92,17.6-17.6v-3.608c25.784,10.472,44,35.728,44,65.208 C166.4,114.304,159.36,130.936,147.92,143.432z\" fill=\"#e74c3c\"/> </svg>", "app_icon": "<svg fill=\"#e74c3c\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M0 0h24v24H0V0z\" fill=\"none\"/>\n  <circle cx=\"12\" cy=\"12\" r=\"3\"/>\n  <path d=\"M20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/>\n</svg>\n", "default": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#94a3b8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg>", "googleLens": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"154.752\" cy=\"154.667\" r=\"19.556\" fill=\"#34a853\"/>\n  <circle cx=\"96.086\" cy=\"105.778\" r=\"29.333\" fill=\"#4285f4\"/>\n  <path fill=\"#ea4335\" d=\"M8,143.911C8,166.046,25.954,184,48.089,184H96v-19.556l-49.011-0.122 c-10.756,0-19.433-10.01-19.433-21.878v-22H8V143.911z\"/>\n  <path fill=\"#fbbc05\" d=\"M184,67.644c0-22.134-17.954-40.089-40.089-40.089h-23.467l24.444,19.556 c10.756,0,19.556,10.132,19.556,22v36.667H184V67.644z\"/>\n  <path fill=\"#4285f4\" d=\"M115.556,8H76.444L61.778,27.556H48.089C25.954,27.556,8,45.51,8,67.644v23.467h19.556v-22 c0-11.868,8.8-22,19.556-22h97.778L115.556,8z\"/>\n</svg>\n", "lenso": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <defs>\n    <filter id=\"sbi_e_lenso_a\" width=\"176\" height=\"156.218\" x=\"8\" y=\"17.891\" filterUnits=\"userSpaceOnUse\">\n      <feColorMatrix values=\"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0\"/>\n    </filter>\n  </defs>\n  <mask id=\"sbi_e_lenso_b\" width=\"176\" height=\"156.218\" x=\"8\" y=\"17.891\" maskUnits=\"userSpaceOnUse\">\n    <path fill=\"#fff\" d=\"M184.098,17.613H7.932v156.596h176.166V17.61V17.613z\" filter=\"url(#sbi_e_lenso_a)\"/>\n  </mask>\n  <g mask=\"url(#sbi_e_lenso_b)\">\n    <path fill=\"#140ea8\" d=\"M79.752,26.642c4.791-8.367,15.409-11.236,23.71-6.404s11.146,15.534,6.35,23.901L40.39,165.36 c-4.791,8.367-15.406,11.234-23.71,6.402c-8.299-4.832-11.146-15.534-6.35-23.901L79.752,26.642z\"/>\n    <path fill=\"#a1a6f3\" d=\"M142.178,77.943c-3.221-5.656-9.238-9.138-15.747-9.113c-6.505-0.021-12.517,3.461-15.736,9.113 l-39.4,68.792c-4.99,8.716-2.028,19.859,6.617,24.893c8.645,5.031,19.701,2.044,24.691-6.672 c3.026-5.307,8.662-8.587,14.771-8.596h18.121c6.109,0.009,11.745,3.289,14.771,8.596c4.993,8.716,16.047,11.702,24.691,6.672 c8.647-5.034,11.61-16.177,6.617-24.893L142.18,77.943H142.178z\"/>\n    <path fill=\"#5a66e9\" d=\"M110.757,77.834c4.99-8.716,16.047-11.7,24.691-6.669c8.645,5.031,11.61,16.177,6.617,24.893 l-39.462,68.898c-4.99,8.716-16.047,11.702-24.691,6.672c-8.645-5.034-11.61-16.177-6.617-24.893 C71.295,146.735,110.757,77.834,110.757,77.834z\"/>\n  </g>\n</svg>\n", "bing": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <linearGradient id=\"sbi_e_bing_a\" gradientUnits=\"userSpaceOnUse\" x1=\"55.7284\" y1=\"155.5388\" x2=\"70.7399\" y2=\"146.8719\" gradientTransform=\"matrix(5.5556 0 0 -5.5556 -210 958.6666)\">\n    <stop offset=\"0\" stop-color=\"#37BDFF\"/>\n    <stop offset=\"0.1832\" stop-color=\"#33BFFD\"/>\n    <stop offset=\"0.3576\" stop-color=\"#28C5F5\"/>\n    <stop offset=\"0.528\" stop-color=\"#15D0E9\"/>\n    <stop offset=\"0.5468\" stop-color=\"#12D1E7\"/>\n    <stop offset=\"0.5903\" stop-color=\"#1CD2E5\"/>\n    <stop offset=\"0.7679\" stop-color=\"#42D8DC\"/>\n    <stop offset=\"0.9107\" stop-color=\"#59DBD6\"/>\n    <stop offset=\"1\" stop-color=\"#62DCD4\"/>\n  </linearGradient>\n  <path d=\"M155.963,120.988c0,1.745-0.095,3.483-0.282,5.196 c-1.129,10.435-5.647,19.877-12.448,27.177c0.854-0.953,1.628-1.973,2.306-3.069c0.521-0.832,0.986-1.698,1.379-2.603 c0.143-0.297,0.271-0.605,0.378-0.913c0.132-0.297,0.238-0.609,0.334-0.917c0.106-0.282,0.202-0.583,0.286-0.88 c0.081-0.308,0.165-0.616,0.235-0.924c0.015-0.037,0.026-0.073,0.037-0.11c0.073-0.308,0.128-0.616,0.191-0.924 c0.059-0.323,0.121-0.645,0.165-0.964c0-0.011,0-0.011,0-0.022c0.048-0.297,0.084-0.594,0.11-0.906 c0.07-0.7,0.106-1.401,0.106-2.116c0-4.015-1.107-7.788-3.043-10.996c-0.44-0.748-0.928-1.459-1.463-2.138 c-0.627-0.81-1.305-1.569-2.042-2.27c-1.83-1.771-3.971-3.223-6.336-4.246c-1.023-0.451-2.09-0.818-3.186-1.093 c-0.011,0-0.033-0.015-0.048-0.015l-0.378-0.128l-5.54-1.903v-0.011l-14.491-4.983c-0.048-0.011-0.106-0.011-0.143-0.022 l-0.906-0.334c-2.911-1.14-5.324-3.278-6.835-6.002L99.06,91.38l-6.065-15.455l-1.166-2.985l-0.297-0.609 c-0.33-0.807-0.513-1.687-0.513-2.603c0-0.235,0-0.473,0.026-0.689c0.345-3.399,3.234-6.065,6.728-6.065 c0.928,0,1.819,0.191,2.629,0.535l27.005,13.849l5.324,2.721c2.82,1.679,5.445,3.652,7.847,5.874 c8.701,7.99,14.41,19.188,15.264,31.709C155.915,118.766,155.963,119.87,155.963,120.988L155.963,120.988z\" fill=\"url(#sbi_e_bing_a)\"/>\n  <linearGradient id=\"sbi_e_bing_b\" gradientUnits=\"userSpaceOnUse\" x1=\"46.4623\" y1=\"145.3685\" x2=\"68.3095\" y2=\"145.3685\" gradientTransform=\"matrix(5.5556 0 0 -5.5556 -210 958.6666)\">\n    <stop offset=\"0\" stop-color=\"#39D2FF\"/>\n    <stop offset=\"0.1501\" stop-color=\"#38CEFE\"/>\n    <stop offset=\"0.2931\" stop-color=\"#35C3FA\"/>\n    <stop offset=\"0.4327\" stop-color=\"#2FB0F3\"/>\n    <stop offset=\"0.5468\" stop-color=\"#299AEB\"/>\n    <stop offset=\"0.5827\" stop-color=\"#2692EC\"/>\n    <stop offset=\"0.7635\" stop-color=\"#1A6CF1\"/>\n    <stop offset=\"0.909\" stop-color=\"#1355F4\"/>\n    <stop offset=\"1\" stop-color=\"#104CF5\"/>\n  </linearGradient>\n  <path d=\"M148.747,139.014c0,1.379-0.128,2.71-0.37,4.008c-0.07,0.345-0.139,0.689-0.224,1.034 c-0.154,0.616-0.319,1.21-0.521,1.804c-0.11,0.312-0.216,0.62-0.334,0.917c-0.121,0.308-0.249,0.605-0.378,0.913 c-0.396,0.906-0.858,1.771-1.382,2.603c-0.675,1.096-1.452,2.116-2.306,3.069c-3.934,4.352-17.299,12.111-22.224,15.264 l-10.93,6.681c-8.012,4.939-15.587,8.43-25.135,8.668c-0.451,0.015-0.891,0.026-1.331,0.026c-0.616,0-1.225-0.011-1.83-0.033 c-16.17-0.62-30.268-9.299-38.401-22.125c-3.718-5.863-6.182-12.591-7.014-19.818c1.749,9.878,10.358,17.369,20.735,17.369 c3.641,0,7.051-0.917,10.036-2.534c0.022-0.015,0.048-0.026,0.073-0.037l1.067-0.642l4.352-2.567l5.54-3.282v-0.154l0.715-0.429 l49.566-29.363l3.813-2.259l0.381,0.128c0.011,0,0.033,0.015,0.048,0.015c1.093,0.271,2.163,0.642,3.183,1.093 c2.369,1.023,4.506,2.475,6.336,4.246c0.737,0.7,1.415,1.463,2.046,2.27c0.535,0.678,1.023,1.393,1.459,2.138 C147.639,131.226,148.747,134.995,148.747,139.014L148.747,139.014z\" fill=\"url(#sbi_e_bing_b)\"/>\n  <linearGradient id=\"sbi_e_bing_c\" gradientUnits=\"userSpaceOnUse\" x1=\"48.08\" y1=\"139.8044\" x2=\"48.08\" y2=\"169.0177\" gradientTransform=\"matrix(5.5556 0 0 -5.5556 -210 958.6666)\">\n    <stop offset=\"0\" stop-color=\"#1B48EF\"/>\n    <stop offset=\"0.1221\" stop-color=\"#1C51F0\"/>\n    <stop offset=\"0.3212\" stop-color=\"#1E69F5\"/>\n    <stop offset=\"0.5676\" stop-color=\"#2190FB\"/>\n    <stop offset=\"1\" stop-color=\"#26B8F4\"/>\n  </linearGradient>\n  <path d=\"M78.185,41.015l-0.018,109.314l-5.54,3.282l-4.356,2.567l-1.071,0.649 c-0.018,0-0.048,0.018-0.066,0.033c-2.988,1.61-6.398,2.534-10.039,2.534c-10.38,0-18.975-7.487-20.731-17.369 c-0.084-0.455-0.147-0.924-0.198-1.379c-0.062-0.865-0.11-1.709-0.128-2.57V15.051c0-3.883,3.153-7.051,7.051-7.051 c1.459,0,2.827,0.455,3.949,1.203l21.556,14.084c0.117,0.099,0.242,0.183,0.378,0.26C74.544,27.353,78.185,33.751,78.185,41.015 L78.185,41.015z\" fill=\"url(#sbi_e_bing_c)\"/>\n  <linearGradient id=\"sbi_e_bing_d\" gradientUnits=\"userSpaceOnUse\" x1=\"47.5642\" y1=\"139.5736\" x2=\"61.0465\" y2=\"153.0558\" gradientTransform=\"matrix(5.5556 0 0 -5.5556 -210 958.6666)\">\n    <stop offset=\"0\" stop-color=\"#FFFFFF\"/>\n    <stop offset=\"0.3726\" stop-color=\"#FDFDFD\"/>\n    <stop offset=\"0.5069\" stop-color=\"#F6F6F6\"/>\n    <stop offset=\"0.6026\" stop-color=\"#EBEBEB\"/>\n    <stop offset=\"0.68\" stop-color=\"#DADADA\"/>\n    <stop offset=\"0.7463\" stop-color=\"#C4C4C4\"/>\n    <stop offset=\"0.805\" stop-color=\"#A8A8A8\"/>\n    <stop offset=\"0.8581\" stop-color=\"#888888\"/>\n    <stop offset=\"0.9069\" stop-color=\"#626262\"/>\n    <stop offset=\"0.9523\" stop-color=\"#373737\"/>\n    <stop offset=\"0.9926\" stop-color=\"#090909\"/>\n    <stop offset=\"1\" stop-color=\"#000000\"/>\n  </linearGradient>\n  <path d=\"M148.747,139.014c0,1.379-0.128,2.71-0.37,4.008 c-0.07,0.345-0.139,0.689-0.224,1.034c-0.154,0.616-0.319,1.21-0.521,1.804c-0.11,0.312-0.216,0.62-0.334,0.917 c-0.121,0.308-0.249,0.605-0.378,0.913c-0.396,0.906-0.858,1.771-1.382,2.603c-0.675,1.096-1.448,2.116-2.306,3.069 c-3.934,4.352-17.299,12.111-22.224,15.264l-10.93,6.681c-8.012,4.939-15.587,8.43-25.135,8.668 c-0.451,0.015-0.891,0.026-1.331,0.026c-0.616,0-1.225-0.011-1.83-0.033c-16.17-0.62-30.268-9.299-38.401-22.125 c-3.718-5.863-6.182-12.591-7.014-19.818c1.749,9.878,10.358,17.369,20.735,17.369c3.641,0,7.051-0.917,10.036-2.534 c0.022-0.015,0.048-0.026,0.073-0.037l1.067-0.642l4.352-2.567l5.54-3.282v-0.154l0.715-0.429l49.566-29.363l3.813-2.259 l0.381,0.128c0.011,0,0.033,0.015,0.048,0.015c1.093,0.271,2.163,0.642,3.183,1.093c2.369,1.023,4.506,2.475,6.336,4.246 c0.737,0.7,1.415,1.463,2.046,2.27c0.535,0.678,1.023,1.393,1.459,2.138C147.639,131.226,148.747,134.995,148.747,139.014 L148.747,139.014z\" fill=\"url(#sbi_e_bing_d)\" fill-opacity=\"0.15\"/>\n  <linearGradient id=\"sbi_e_bing_e\" gradientUnits=\"userSpaceOnUse\" x1=\"48.08\" y1=\"169.536\" x2=\"48.08\" y2=\"140.1051\" gradientTransform=\"matrix(5.5556 0 0 -5.5556 -210 958.6666)\">\n    <stop offset=\"0\" stop-color=\"#FFFFFF\"/>\n    <stop offset=\"0.3726\" stop-color=\"#FDFDFD\"/>\n    <stop offset=\"0.5069\" stop-color=\"#F6F6F6\"/>\n    <stop offset=\"0.6026\" stop-color=\"#EBEBEB\"/>\n    <stop offset=\"0.68\" stop-color=\"#DADADA\"/>\n    <stop offset=\"0.7463\" stop-color=\"#C4C4C4\"/>\n    <stop offset=\"0.805\" stop-color=\"#A8A8A8\"/>\n    <stop offset=\"0.8581\" stop-color=\"#888888\"/>\n    <stop offset=\"0.9069\" stop-color=\"#626262\"/>\n    <stop offset=\"0.9523\" stop-color=\"#373737\"/>\n    <stop offset=\"0.9926\" stop-color=\"#090909\"/>\n    <stop offset=\"1\" stop-color=\"#000000\"/>\n  </linearGradient>\n  <path d=\"M78.185,41.015l-0.018,109.314l-5.54,3.282l-4.356,2.567l-1.071,0.649 c-0.018,0-0.048,0.018-0.066,0.033c-2.988,1.61-6.398,2.534-10.039,2.534c-10.38,0-18.975-7.487-20.731-17.369 c-0.084-0.455-0.147-0.924-0.198-1.379c-0.062-0.865-0.11-1.709-0.128-2.57V15.051c0-3.883,3.153-7.051,7.051-7.051 c1.459,0,2.827,0.455,3.949,1.203l21.556,14.084c0.117,0.099,0.242,0.183,0.378,0.26C74.544,27.353,78.185,33.751,78.185,41.015 L78.185,41.015z\" fill=\"url(#sbi_e_bing_e)\" fill-opacity=\"0.1\"/>\n</svg>\n", "yandex": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M8,96C8,47.399,47.399,8,96,8s88,39.399,88,88s-39.399,88-88,88S8,144.601,8,96z\" fill=\"#fc3f1d\"/>\n  <path d=\"M98.486,106.01c5.357,11.734,7.142,15.813,7.142,29.906V154.6H86.499v-31.498L50.405,44.603h19.96 L98.486,106.01z M122.081,44.602L98.678,97.785h19.448L141.595,44.6h-19.514L122.081,44.602z\" fill=\"#fff\"/>\n</svg>\n", "baidu": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g transform=\"translate(121.212121, 90.909091)\" fill=\"#3388FF\">\n    <path d=\"M-46.082-28.519c10.601,0,19.167-12.163,19.167-27.203 c0-15.027-8.566-27.187-19.167-27.187c-10.588,0-19.177,12.16-19.177,27.187C-65.259-40.682-56.67-28.519-46.082-28.519\"/>\n    <path d=\"M-0.426-26.72c14.175,1.831,23.286-13.244,25.097-24.67 c1.847-11.406-7.297-24.666-17.327-26.944c-10.056-2.297-22.608,13.755-23.75,24.223 C-17.772-41.317-14.566-28.539-0.426-26.72\"/>\n    <path d=\"M-81.714,9.834c19.193-4.113,16.583-26.98,16.009-31.983 c-0.945-7.708-10.036-21.172-22.384-20.11c-15.535,1.388-17.804,23.76-17.804,23.76 C-107.996-8.154-100.865,13.946-81.714,9.834\"/>\n    <path d=\"M55.749-7.536c0-5.462-4.551-21.926-21.446-21.926 c-16.927,0-19.187,15.535-19.187,26.517c0,10.484,0.886,25.116,21.907,24.65C58.051,21.246,55.749-2.039,55.749-7.536\"/>\n    <path d=\"M-61.332,49.611c-0.562,1.608-1.818,5.721-0.734,9.303 c2.149,8.031,9.147,8.394,9.147,8.394h10.049V42.81h-10.767C-58.472,44.25-60.809,48-61.332,49.611\"/>\n    <path d=\"M15.1,76.986h-28.713c-11.124-2.86-11.653-10.74-11.653-10.74V34.588 l11.653-0.188v28.456c0.711,3.029,4.492,3.579,4.492,3.579H2.713V34.588H15.1V76.986z M-31.375,77.158h-24.948 c-10.776-2.139-15.068-9.474-15.613-10.723c-0.536-1.268-3.583-7.161-1.967-17.182c4.658-15.024,17.94-16.105,17.94-16.105 h13.282V16.875l11.306,0.171V77.158z M34.302,40.448c0,0-21.926-16.91-34.728-35.186 C-17.772-21.686-42.421-10.72-50.663,2.983c-8.206,13.704-20.998,22.372-22.822,24.666 c-1.837,2.262-26.477,15.519-21.008,39.742c5.469,24.21,24.679,23.741,24.679,23.741s14.159,1.391,30.589-2.275 c16.424-3.631,30.577,0.906,30.577,0.906s38.38,12.814,48.877-11.856C50.723,53.242,34.302,40.448,34.302,40.448 L34.302,40.448z\"/>\n  </g>\n</svg>\n", "sogou": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#F63D13\">\n    <path d=\"M168.269,161.622l-8.79-8.153c-7.591,8.18-16.743,14.89-26.983,19.657L137.55,184 C149.208,178.573,159.627,170.935,168.269,161.622z\"/>\n    <path d=\"M127.443,162.251c-9.556,4.448-20.208,6.937-31.443,6.937c-41.2,0-74.599-33.399-74.599-74.599 S54.8,19.989,96,19.989s74.599,33.399,74.599,74.599c0,19.592-7.556,37.417-19.909,50.728l8.789,8.153 c14.338-15.451,23.109-36.14,23.109-58.88C182.589,46.767,143.822,8,96,8S9.411,46.767,9.411,94.589S48.178,181.177,96,181.177 c13.041,0,25.405-2.888,36.497-8.052L127.443,162.251z\"/>\n    <path d=\"M144.921,55.468l0,18.816c-16.901-7.937-62.609-18.222-64.747-6.05 c-2.886,16.43,73.858,15.615,67.994,52.508c-3.996,25.144-51.835,31.96-102.289,10.979l0-21.303 c18.067,12.405,63.11,22.469,66.655,9.325c4.367-16.19-70.936-17.901-68.605-50.455C45.967,40.829,98.962,37.484,144.921,55.468z\"/>\n  </g>\n</svg>\n", "tineye": "<img src=\"data:image/png;base64,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\" width=\"20\" height=\"20\" style=\"display:block;border-radius:3px;object-fit:contain;\"/>", "whatanime": "<img src=\"data:image/png;base64,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\" width=\"20\" height=\"20\" style=\"display:block;border-radius:3px;object-fit:contain;\"/>", "saucenao": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#2f3542\">\n    <path d=\"M45.564 165.735H25.222v-19.637l50.44-50.461-50.586-50.608v-20.33c.061-.068.119-.155.198-.212a.49.49 0 0 1 .26-.104c6.421-.005 12.842-.004 19.529-.004l50.616 50.638 50.524-50.546h20.104v20.38L116.21 94.969c0 .323-.012.427.004.527.014.092.034.204.094.264 16.644 16.659 33.293 33.314 50.001 50.029v19.841h-19.934l-50.048-50.072-.305-.001c-.102 0-.247-.042-.298.009-16.727 16.72-33.446 33.447-50.16 50.169z\"/>\n    <path d=\"M8 184v-42.634h11.985c-.04-.042.043.023.096.108a.536.536 0 0 1 .093.265c.004 9.975.004 19.95.004 30.02H171.65c-.035.03.053-.025.111-.103.054-.074.109-.171.109-.258.005-9.977.005-19.955.005-30.036h12.083V184H8z\"/>\n    <path d=\"M184 49.411h-12.037V20.24H20.282v28.836c-.17.159-.236.242-.321.294a.536.536 0 0 1-.265.093c-3.856.005-7.712.004-11.66.004V7.999L184 8v41.411z\"/>\n  </g>\n</svg>\n", "iqdb": "<img src=\"data:image/png;base64,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\" width=\"20\" height=\"20\" style=\"display:block;border-radius:3px;object-fit:contain;\"/>", "ascii2d": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#333\">\n    <path d=\"M8 165.728V145.17h176v20.558H8z\"/>\n    <path d=\"M24.758 46.512v-20.24h142.709v20.24H24.758z\"/>\n  </g>\n</svg>\n", "getty": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M157.824 28.567c-7.531 0-15.845 0-20.774 2.932 4.154 5.375 7.27 12.709 7.27 22.485 0 23.948-17.149 41.053-50.918 41.053-14.026 0-25.195.49-25.195 7.824 0 20.533 88.841-7.334 88.841 43.502 0 18.084-19.483 37.637-62.603 37.637-36.371 0-60.269-10.26-60.269-30.303 0-15.889 12.728-23.465 24.419-23.465v-.49c-6.24-3.664-20.005-6.844-20.005-20.526 0-12.219 15.069-21.506 21.042-23.217C48.463 77.45 39.634 67.667 39.634 52.28c0-22.244 18.179-44.239 53.253-44.239 11.43 0 24.941 4.402 33.248 11.246 6.234-7.824 16.366-11.736 31.69-11.246v20.526zM63.786 149.792c0 9.777 8.835 14.172 35.85 14.172 20.787 0 27.797-9.777 27.797-14.172 0-5.865-9.605-14.668-40.779-14.668-17.672-.007-22.868 9.286-22.868 14.668m28.84-119.266c-13.765 0-23.382 9.287-23.382 21.016 0 11.736 9.618 21.016 23.382 21.016 12.206 0 22.078-9.28 22.078-21.016 0-11.729-9.872-21.016-22.078-21.016\" fill=\"#2d2d2d\"/>\n</svg>\n", "istock": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M49.943 181.572H18.182V62.997h31.764v118.575h-.003zm30.493-45.717c9.791 10.749 24.693 18.816 40.331 18.816 14.666 0 24.935-9.048 24.935-21.515 0-21.986-31.761-24.673-54.752-38.122-13.433-7.821-24.208-19.555-24.208-38.888C66.742 25.595 94.874 8 123.222 8c17.35 0 33.485 4.159 49.628 16.139l-17.111 24.434c-6.859-6.351-18.345-11.224-29.591-11.224-12.454 0-26.394 5.36-26.394 18.557 0 27.635 78.964 19.068 78.964 76.778 0 30.295-27.147 51.316-57.949 51.316-22.975 0-44.238-9.522-61.846-25.678l21.513-22.467zM13.283 28.779C13.283 17.307 22.6 8 34.066 8c11.476 0 20.776 9.307 20.776 20.779 0 11.466-9.3 20.782-20.776 20.782-11.463 0-20.783-9.316-20.783-20.782\" fill=\"#2d2d2d\"/>\n</svg>\n", "shutterstock": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#f54335\">\n    <path d=\"M111.843 46.411H72.9c-6.193 0-11.223 5.03-11.223 11.197v42.247H23.279V57.608C23.279 30.197 45.482 8 72.907 8h38.943v38.411h-.007z\"/>\n    <path d=\"M80.15 145.589h38.956c6.167 0 11.21-5.024 11.21-11.21V92.145h38.405v42.233c0 27.398-22.217 49.621-49.615 49.621H80.15v-38.41z\"/>\n  </g>\n</svg>\n", "adobestock": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path fill=\"#2e000a\" d=\"M15.333 17.534h161.333v156.932H15.333z\"/>\n  <path d=\"M8 10.201V181.8h176V10.201H8zm7.333 7.333h161.334v156.932H15.333V17.534z\" fill=\"#ff4475\"/>\n  <path d=\"M52.726 126.655c-.484-.362-.726-.846-.726-1.573v-11.616c0-.364.484-.726.968-.364 5.445 3.751 11.81 5.446 17.86 5.446 8.833 0 12.463-4.598 12.463-9.801 0-4.598-2.299-8.349-10.769-13.31l-4.356-2.299C55.703 86.12 52.073 78.982 52.073 69.907c0-12.342 8.591-22.264 24.805-22.264 7.139 0 12.437 1.089 15.462 2.783.605.242.726.605.726 1.331v10.89c0 .484-.484.846-.968.484-3.751-2.421-9.291-3.63-14.978-3.63-9.317 0-12.342 5.324-12.342 9.559 0 4.598 2.299 7.986 10.648 12.583l3.872 2.058c13.794 7.624 17.303 15.003 17.303 24.078 0 13.43-9.801 22.748-25.773 22.748-7.139-.001-13.626-1.331-18.102-3.872zm83.973 1.089c0 .606-.242 1.09-.848 1.332-2.541.967-5.324 1.451-8.953 1.451-9.197 0-14.399-4.84-14.399-16.213v-32.98h-6.957c-.605 0-.743-.242-.743-.847v-9.735c0-.605.121-.968.847-.968h6.957c.122-4.235.606-11.616 1.089-13.915 0-.847.364-1.087.846-1.209l10.891-1.451c.484-.121.846-.002.846.603-.242 3.509-.362 9.438-.484 15.972H136.4c.606 0 .848.242.848.847v9.977c0 .605-.364.726-.848.726h-10.702v30.734c0 4.962 1.695 7.207 6.17 7.207 1.453 0 2.651-.122 4.104-.484.362-.122.726.12.726.726v8.227z\" fill=\"#ff4475\"/>\n</svg>\n", "depositphotos": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M95.999,184c37.533,0,66.442-28.906,66.442-66.441c0-37.531-28.908-66.44-66.442-66.44 c-37.531,0-66.44,28.909-66.44,66.44C29.559,155.094,58.468,184,95.999,184z M95.999,142.948 c-14.333,0-25.385-11.056-25.385-25.389c0-14.333,11.053-25.385,25.385-25.385s25.387,11.053,25.387,25.385 C121.386,131.891,110.332,142.948,95.999,142.948z M115.312,53.183h45.183V8h-45.183V53.183z\" fill=\"#231F20\"/>\n</svg>\n", "pinterest": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n  <defs>\n    <path id=\"sbi_e_pinterest_a\" d=\"M8 8h176v175.999H8z\"/>\n  </defs>\n  <clipPath id=\"sbi_e_pinterest_b\">\n    <use xlink:href=\"#sbi_e_pinterest_a\" overflow=\"visible\"/>\n  </clipPath>\n  <g clip-path=\"url(#sbi_e_pinterest_b)\">\n    <defs>\n      <path id=\"sbi_e_pinterest_c\" d=\"M8 8h176v175.999H8z\"/>\n    </defs>\n    <clipPath id=\"sbi_e_pinterest_d\">\n      <use xlink:href=\"#sbi_e_pinterest_c\" overflow=\"visible\"/>\n    </clipPath>\n    <path d=\"M183.999 96c0 48.601-39.399 88-88 88S8 144.601 8 96 47.399 8 96 8s87.999 39.399 87.999 88\" clip-path=\"url(#sbi_e_pinterest_d)\" fill=\"#fff\"/>\n    <path d=\"M96 8C47.399 8 8 47.399 8 96c0 37.28 23.195 69.151 55.93 81.973-.769-6.963-1.464-17.67.306-25.271 1.599-6.867 10.318-43.742 10.318-43.742s-2.632-5.272-2.632-13.065c0-12.236 7.092-21.372 15.923-21.372 7.508 0 11.134 5.637 11.134 12.396 0 7.55-4.807 18.838-7.288 29.299-2.073 8.759 4.392 15.902 13.031 15.902 15.64 0 27.663-16.492 27.663-40.298 0-21.069-15.14-35.802-36.758-35.802-25.038 0-39.736 18.781-39.736 38.19 0 7.563 2.914 15.674 6.549 20.082.719.871.825 1.635.611 2.524-.669 2.78-2.153 8.757-2.445 9.98-.384 1.611-1.275 1.952-2.943 1.177-10.991-5.117-17.862-21.185-17.862-34.092 0-27.759 20.169-53.252 58.145-53.252 30.527 0 54.25 21.752 54.25 50.824 0 30.329-19.122 54.736-45.664 54.736-8.917 0-17.3-4.633-20.17-10.105 0 0-4.413 16.802-5.482 20.919-1.987 7.644-7.35 17.225-10.937 23.07C78.178 182.625 86.928 184 96 184c48.601 0 88-39.399 88-88S144.601 8 96 8\" clip-path=\"url(#sbi_e_pinterest_d)\" fill=\"#bd081c\"/>\n  </g>\n</svg>\n", "qihoo": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M11.995,119.97c-3.418-9.406-4.467-19.164-3.809-29.064c1.21-18.202,7.817-34.279,20.176-47.738 c16.97-18.479,38.199-27.002,63.207-25.673c35.372,1.88,65.958,29.358,71.958,64.229c2.214,12.864,1.554,25.511-2.279,37.989 c-0.106,0.344-0.296,0.662-0.447,0.992c-0.766-0.697-0.538-1.638-0.596-2.5c-0.36-5.317-2.937-9.181-7.917-11.024 c-4.863-1.801-9.293-0.789-13,3.034c-0.751,0.775-2.188,3.762-3.662,3.603c0.55-2.278,0.846-3.39,1.056-4.233 c2.634-10.568,2.258-20.998-1.411-31.278c-4.177-11.702-11.719-20.699-22.282-27.098c-8.359-5.064-17.517-7.663-27.322-7.371 c-13.571,0.404-25.426,5.084-35.269,14.634c-8.15,7.908-13.187,17.414-15.159,28.571c-1.296,7.336-0.833,14.609,0.808,21.838 c0.177,0.779,0.327,1.751,0.536,2.777c-1.143,0.433-1.878-0.935-2.429-1.552c-3.489-3.908-8.639-5.392-13.262-3.796 c-5.104,1.763-7.983,5.769-8.235,11.427C12.622,118.526,12.786,119.396,11.995,119.97z\" fill=\"#19B855\"/>\n  <path d=\"M159.91,123.271c-2.427,7.645-6.42,14.473-11.318,20.731c-13.304,17-30.72,27.132-52.113,29.968 c-32.182,4.267-63.818-12.17-79.005-40.824c-1.79-3.377-3.059-7.03-4.569-10.555c-0.881-4.21,1.476-9.372,5.216-11.806 c6.364-4.142,15.049-2.634,19.231,3.18c1.999,3.543,3.523,7.332,5.821,10.734c7.742,11.459,18.283,19.059,31.729,22.018 c18.062,3.975,34.03-0.503,47.584-13.251c5.327-5.011,9.335-10.896,12.111-17.642c0.255-0.619,0.576-1.203,0.988-1.736 c3.568-4.315,8.061-6.443,13.672-5.328c5.259,1.046,8.796,4.254,10.62,9.32C160.501,119.81,160.454,121.537,159.91,123.271z\" fill=\"#F7B516\"/>\n  <path d=\"M184,155.971c-0.05,7.057-5.662,12.648-12.724,12.676c-7.003,0.027-12.818-5.852-12.773-12.913 c0.046-7.23,5.82-12.831,13.126-12.732C178.591,143.096,184.05,148.818,184,155.971z\" fill=\"#F7B516\"/>\n  <path d=\"M37.471,114.176c-5.91-7.567-16.32-6.329-21.063-1.121c-2.472,2.714-3.541,5.914-3.502,9.535 c-0.303-0.874-0.607-1.747-0.91-2.621c-0.131-4.344,0.633-8.308,4.012-11.501c5.274-4.983,15.343-3.941,19.633,1.911 c0.44,0.44,0.44,0.44,0.676,0.716C36.96,112.37,36.939,112.789,37.471,114.176z\" fill=\"#299249\"/>\n  <path d=\"M159.91,123.271c-0.119-6.726-2.893-11.145-8.339-13.281c-5.545-2.176-11.482-0.494-16.353,4.624 c0.416-0.895,0.768-1.405,1.438-2.411c2.164-2.181,4.005-4.693,7.149-5.738c8.702-2.894,17.14,3.64,16.981,12.24 c-0.012,0.667,0.009,1.334,0.015,2.001C160.504,121.56,160.207,122.415,159.91,123.271z\" fill=\"#299249\"/>\n</svg>\n", "taobao": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M178.798 54.997c-8.848-17.069-38.891-21.052-64.261-15.738-5.487 1.118-10.977 2.234-16.466 3.352-3.496.923-6.994 1.846-10.491 2.768h-.146c-.049-.194-.097-.389-.146-.583 1.627-2.843 4.673-6.628 5.101-10.2-7.237-1.991-14.475-3.983-21.712-5.975-1.651 4.323-3.303 8.647-4.955 12.968-3.578 8.298-8.247 15.869-13.406 22.586-1.648 2.146-3.478 4.861-5.829 6.265-.146.194-.291.389-.437.584 1.12 1.284 12.928 7.969 14.863 8.452 3.011-3.205 6.023-6.412 9.034-9.617.923-1.166 1.846-2.332 2.768-3.497 3.303-1.408 6.606-2.817 9.909-4.225.097.146.194.291.291.437-3.887 7.539-10.598 18.164-16.903 24.627v.291c2.914 2.622 5.829 5.246 8.743 7.868h.291c2.963-2.865 5.926-5.732 8.889-8.597 1.457-1.554 4.372-4.662 4.372-4.662l7.993-.023-.038 13.863s-20.323.004-30.686.004v10.615l30.724.02s-.015 23.119-.015 25.938c-1.824.477-4.182.044-5.645-.291-9.571-2.192-8.045-9.014-6.995-19.088H62.08c-2.495 7.722-1.256 18.966 1.603 23.606 2.359 3.828 3.991 6.481 9.034 8.743 3.877 1.738 8.782 1.895 14.426 1.894 16.224-.002 29.5-2.833 40.218-8.305 3.171-1.62 6.361-3.128 8.888-5.392h.584c.519 2.155 2.088 10.135 3.351 11.22 5.633-2.428 11.27-4.858 16.903-7.285-3.838-9.472-7.676-18.945-11.512-28.416-1.3-.227-13.472 3.662-14.135 4.518.826 3.205 1.651 6.412 2.477 9.617-3.389 2.41-7.563 4.998-12.094 6.12-.883-.942-.437-4.262-.437-5.975v-17.066l30.18.017-.016-10.634-30.077-.006-.004-13.733 30.081.016V71.319l-53.04.001s-.109.004-.291-.437c2.612-3.537 5.528-6.648 7.286-11.074-.049-.097-.098-.195-.147-.291-2.768-.729-5.538-1.458-8.305-2.186-.097-.243-.194-.485-.29-.729 5.051-1.603 10.103-3.205 15.154-4.808 14.603-4.526 38.351-7.474 45.026 6.12 2.649 5.393 1.895 14.653 1.894 22.586v40.363c.001 10.958 1.1 18.187-4.885 24.687-4.978 4.695-10.863 5.4-15.013 5.33-4.151-.07-9.703-1.692-15.219-2.915h-.146c-.772 2.237-2.813 9.867-3.034 12.387 4.317 1.013 9.218 1.686 13.962 2.477 4.484.747 10.594.673 14.845.137 17.525-2.211 25.532-7.986 30.619-20.537 6.26-20.004 4.741-76.824-1.168-87.433zM42.232 58.786c17.828-3.847 15.6-28.227-5.246-27.832-1.214.244-2.428.486-3.643.729-4.496 1.594-8.156 4.848-9.763 9.326-3.842 10.708 8.039 20.067 18.652 17.777zm3.774 23.145c-3.011-2.907-6.208-5.818-8.843-7.845-2.504-1.926-9.145-8.219-11.949-8.889-3.156 5.003-6.314 10.007-9.471 15.009 1.748 1.068 3.497 2.137 5.245 3.205 4.27 2.887 8.803 5.495 12.841 7.992 3.259 2.241 5.931 4.641 7.268 7.6 2.273 4.748-.291 10.448-2.331 13.551-5.548 8.443-13.09 15.422-20.109 22.44C12.974 140.68 8 145.051 8 145.051s3.031 1.748 4.391 2.623c8.54 5.277 18.671 12.32 19.672 12.094 6.273-15.004 14.239-27.998 19.526-44.153 2.009-6.136 4.715-15.29 2.478-22.878-1.333-4.513-4.555-7.424-8.061-10.806z\" fill=\"#ff4300\"/>\n</svg>\n", "alibabaChina": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M184 165.3c0 10.34-8.36 18.7-18.7 18.7H26.7C16.36 184 8 175.64 8 165.3V26.7C8 16.36 16.36 8 26.7 8h138.6c10.34 0 18.7 8.36 18.7 18.7v138.6z\" fill=\"#FF6600\"/>\n  <path d=\"M133.785 130.524c-7.625.34-6.671-5.006-2.212-11.084 10.457-13.882 30.248-33.248 30.935-46.959 1.205-17.909-16.965-23.739-35.647-23.566-13.026.172-26.481 3.861-35.644 7.109-31.622 11.056-51.503 28.798-64.014 48.418-13.28 19.452-8.911 38.046 19.109 38.648 21.509-.856 35.47-6.768 50.047-14.139.079 0-40.279 11.397-55.101 3-.772-.088-.772-.088 0 0-1.543-.861-3.258-2.061-3.686-5.399-.09-6.948 11.569-14.139 18.08-16.455V98.358c13.454 4.715 29.22 3.258 42.846-6.684.511 1.114.854 2.742.685 4.285h2.398c.598-4.712-2.739-9.253-7.879-9.597 1.453 1.283 2.657 2.228 3.168 3.085 0 .084-.348.344-.348.344-17.562 12.252-34.441 6.597-36.07 6.169l9.679-9.51-2.653-6.858c19.28-6.682 35.477-11.825 61.865-16.366l-5.91-4.886 3.084-1.883c15.898 4.442 26.339 7.697 25.794 16.047-.295 1.461-.818 3.068-1.63 4.86-4.629 9.086-18.422 24.253-23.992 30.593-3.685 4.196-7.282 8.313-9.858 12.254-2.656 3.941-4.283 7.623-4.365 11.141.964 19.724 43.77 1.454 59.534-9.257-16 5.103-27.007 7.919-38.215 8.429zm18.574-58.28\" fill=\"#FFFFFF\"/>\n</svg>\n", "dreamstime": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M165.892 45.791C132.309-3.758 60.188 5.05 28.256 41.937 12.29 60.105 6.234 85.43 8.437 108.553c2.202 18.168 8.809 34.684 18.168 45.695 24.774 30.28 67.717 33.583 95.795 14.314 39.639-27.527 36.886-72.121 15.415-96.896-38.538-44.043-104.603-.551-79.829 49.549 6.056 12.112 19.82 18.718 32.482 18.718 17.617 0 31.381-20.921 23.123-33.583-8.258-13.213-22.572 0-16.516 9.91 4.955 7.708-5.505 12.112-9.91 11.011-11.561-2.753-17.067-18.718-13.213-31.932 3.303-11.561 15.415-19.269 26.977-18.718 15.966 1.101 33.583 13.764 31.932 41.291-3.854 44.594-62.211 52.852-85.334 20.921-36.336-51.201 6.607-120.018 72.121-99.098 33.583 11.011 58.358 50.65 42.942 93.042-6.056 15.966-9.359 22.022-9.91 27.527-2.754 20.37 61.66-42.943 13.212-114.513z\" fill=\"#6ba843\"/>\n</svg>\n", "alamy": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#323248\">\n    <path d=\"M8 8h176v176H8V8zm114.529 70.646c-1.91.092-3.823.206-5.737.273-9.709.338-19.406.818-29.057 2.024-10.045 1.255-19.376 4.42-27.802 10.101-5.45 3.675-9.709 8.36-12.127 14.551-1.928 4.935-2.604 10.091-2.491 15.365.121 5.672 1.016 11.187 3.416 16.381 3.551 7.685 9.683 12.504 17.403 15.49 7.703 2.98 15.717 3.717 23.88 2.963 12.237-1.131 22.835-5.919 31.693-14.477.848-.819 1.68-1.656 2.612-2.575.175.694.336 1.301.48 1.912.669 2.851 1.261 5.723 2.034 8.546.332 1.214.934 2.39 1.597 3.47.817 1.332 2.074 2.141 3.688 2.262 3.234.242 6.318-.554 9.339-1.525 3.164-1.016 4.037-2.63 3.319-5.873-1.817-8.211-2.528-16.519-2.501-24.922.059-17.873.024-35.747.008-53.621-.002-1.769-.062-3.546-.231-5.305-1.073-11.129-6.349-19.671-15.941-25.444-7.298-4.393-15.388-6.08-23.775-6.606-6.826-.428-13.618.018-20.377.97-6.557.924-12.937 2.557-19.05 5.134-2.847 1.2-5.634 2.54-8.017 4.553-2.406 2.033-2.928 4.131-1.715 7.034 1.104 2.641 2.734 4.972 4.593 7.136.39.454.918.803 1.425 1.137.798.526 1.648.582 2.523.148.848-.42 1.726-.783 2.559-1.228 8.098-4.326 16.684-7.036 25.843-7.898 5.805-.547 11.587-.677 17.319.628 3.282.748 6.36 1.966 9.016 4.09 4.081 3.262 5.848 7.68 6.059 12.741.168 4.026.07 8.063.087 12.095.003.118-.034.237-.072.47z\"/>\n    <path d=\"M86.944 139.132c-3.233.016-6.414-.344-9.484-1.372-5.148-1.724-8.581-5.192-10.075-10.417-1.649-5.768-1.531-11.47 1.144-16.967 1.589-3.263 4.141-5.637 7.143-7.568 4.629-2.978 9.791-4.511 15.142-5.497 7.452-1.373 14.995-1.565 22.543-1.663 2.841-.037 5.683-.03 8.523-.088.706-.014.871.239.867.902-.06 8.523-.104 17.046-.122 25.569-.001.673-.192 1.121-.701 1.564-4.802 4.187-9.8 8.087-15.537 10.948-6.125 3.054-12.631 4.469-19.443 4.589z\"/>\n  </g>\n</svg>\n", "123rf": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#000000\">\n    <path d=\"M61.978 93.771c0-18.423 14.935-33.367 33.347-33.367 18.465 0 33.413 14.944 33.413 33.367 0 18.455-14.948 33.46-33.413 33.46-18.412 0-33.347-15.004-33.347-33.46\"/>\n    <path d=\"M164.721 56.069c-5.054-2.287-5.738-9.112-5.772-9.164l-.013-.272-.036-.249c-3.366-15.968-15.503-20.437-21.419-20.563H54.634c-6.04.127-18.127 4.595-21.553 20.565l-.025.208-.006.314s-.725 6.877-6.02 9.253C11.387 62.272 8 70.599 8 76.53v69.967c0 10.861 8.84 19.683 19.689 19.683h136.696c10.793 0 19.615-8.823 19.615-19.683V76.53c.002-5.931-3.385-14.258-19.279-20.461m10.169 90.428c0 5.882-4.733 10.638-10.505 10.638h-16.693c-4.204-8.753-16.502-19.785-23.608-19.785H67.605c-7.092 0-19.383 11.032-23.587 19.785H27.689c-5.87 0-10.59-4.756-10.59-10.638V76.53c0-5.621 7.283-9.623 13.465-12.009 9.435-4.259 11.18-14.204 11.454-16.344 2.695-12.519 11.758-13.28 12.729-13.348h82.618c.895.068 9.931.829 12.628 13.348.238 2.127 1.981 12.045 11.263 16.257 6.352 2.474 13.635 6.477 13.635 12.098v69.965z\"/>\n  </g>\n</svg>\n", "esearch": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M111.083,396.135 c0-0.056,0.619-1.947,1.376-4.203s1.376-4.25,1.376-4.432c0-0.182-1.659-1.563-3.686-3.07l-3.686-2.74l4.67-0.153l4.67-0.153 l1.368-4.28l1.368-4.28l1.368,4.356l1.368,4.356h4.741h4.741l-3.723,2.785c-2.048,1.532-3.723,2.955-3.723,3.162 s0.28,1.189,0.622,2.182c1.348,3.912,2.08,6.579,1.729,6.305c-0.2-0.157-1.74-1.287-3.422-2.512 c-1.681-1.225-3.209-2.345-3.395-2.489c-0.21-0.163-0.847,0.123-1.681,0.756C114.287,393.911,111.083,396.232,111.083,396.135 L111.083,396.135z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M73.786,384.042 c0-0.13,0.619-2.083,1.376-4.339c0.757-2.256,1.376-4.185,1.376-4.286c0-0.101-1.685-1.414-3.745-2.917l-3.745-2.733l4.681-0.153 l4.681-0.153l1.392-4.259l1.392-4.259l0.73,2.272c0.401,1.25,1.01,3.201,1.353,4.336l0.624,2.064h4.78h4.78l-3.723,2.785 c-2.179,1.63-3.723,2.999-3.723,3.299c0,0.283,0.611,2.334,1.357,4.559l1.357,4.045l-0.975-0.679 c-0.779-0.543-4.53-3.314-6.198-4.578c-0.202-0.153-1.782,0.818-4.051,2.49C75.46,383.045,73.786,384.173,73.786,384.042 L73.786,384.042z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M148.787,383.551 c0.455-1.187,2.646-8.233,2.577-8.289c-0.044-0.036-1.783-1.321-3.866-2.856l-3.787-2.791h4.763h4.763l1.292-4.127 c0.711-2.27,1.372-4.127,1.47-4.127c0.098,0,0.746,1.823,1.44,4.051l1.262,4.051l4.677,0.153l4.677,0.153l-3.646,2.721 c-2.005,1.497-3.678,2.745-3.718,2.773c-0.04,0.029,0.537,1.964,1.283,4.301c0.746,2.337,1.303,4.302,1.238,4.366 c-0.065,0.065-1.708-1.065-3.653-2.511l-3.535-2.629l-3.509,2.597c-1.93,1.428-3.596,2.597-3.701,2.597 S148.696,383.788,148.787,383.551L148.787,383.551z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M45.099,356.768 c0.816-2.174,2.798-8.555,2.688-8.654c-0.077-0.069-1.839-1.378-3.916-2.909l-3.776-2.783l4.835-0.085l4.835-0.085l1.244-3.883 c0.684-2.136,1.319-3.958,1.411-4.05c0.092-0.092,0.753,1.686,1.468,3.952l1.301,4.119l4.728,0.084l4.728,0.084l-3.685,2.74 c-2.027,1.507-3.685,2.957-3.685,3.223c0,0.266,0.61,2.303,1.356,4.527c0.746,2.224,1.193,3.948,0.994,3.83 c-0.2-0.118-1.826-1.29-3.615-2.605c-1.789-1.315-3.385-2.39-3.547-2.39c-0.162,0-1.175,0.659-2.251,1.464 C46.092,356.431,44.935,357.204,45.099,356.768L45.099,356.768z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M176.813,357.003 c0-0.056,0.619-1.947,1.376-4.203c0.757-2.256,1.376-4.255,1.376-4.443c0-0.187-1.681-1.569-3.735-3.07l-3.735-2.729l4.72-0.153 l4.72-0.153l1.357-4.28l1.357-4.28l1.376,4.349l1.376,4.349l4.675,0.084l4.675,0.084l-3.654,2.75 c-2.01,1.513-3.653,2.888-3.652,3.057c0.002,0.169,0.605,2.199,1.34,4.511l1.338,4.204l-1.57-1.135 c-0.863-0.624-2.529-1.853-3.702-2.731l-2.132-1.596l-1.536,1.104c-0.845,0.607-2.534,1.841-3.753,2.743 C177.81,356.367,176.813,357.059,176.813,357.003L176.813,357.003z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M101.218,266.902 c-10.708-0.01-20.724,0.079-20.843,0.271c-0.095,0.153-0.079,17.143,0.034,37.756l0.203,37.478h6.807h6.805l0.998-1.758 c1.306-2.301,3.95-4.875,6.283-6.115c1.028-0.547,1.993-0.993,2.146-0.993c0.153,0,2.403,1.993,5.001,4.428l4.725,4.426 l23.082-0.013c20.114-0.012,22.963-0.07,22.164-0.446c-0.504-0.237-2.362-1.069-4.127-1.847 c-5.284-2.33-11.493-6.689-15.344-10.772c-3.017-3.2-3.033-3.258-1.093-4.079c6.756-2.859,14.147-8.006,17.667-12.304 c3.916-4.781,5.785-10.862,5.396-17.549c-0.194-3.331-0.79-6.113-2.013-9.386c-4.347-11.624-14.751-17.566-32.891-18.786 C123.327,267.017,111.926,266.911,101.218,266.902L101.218,266.902z M113.024,277.295c1.982-0.023,3.96,0.131,5.396,0.468 c7.657,1.799,14.204,8.225,16.237,15.941c0.802,3.044,0.869,7.916,0.149,10.946c-1.768,7.442-7.592,13.62-15.163,16.083 c-2.883,0.938-8.799,1.089-11.89,0.304c-3.908-0.993-7.162-2.867-10.127-5.833c-4.329-4.331-6.323-8.701-6.637-14.541 c-0.574-10.667,6.341-20.144,16.614-22.772C109.056,277.52,111.042,277.318,113.024,277.295L113.024,277.295z\" fill=\"#0c4da2\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M110.457,317.024 c-6.878-1.059-13.003-6.737-14.639-13.57c-0.497-2.074-0.435-6.4,0.121-8.514c1.711-6.502,7.039-11.515,13.701-12.891 c2.88-0.595,4.351-0.6,7.1-0.022c3.369,0.707,6.353,2.346,8.853,4.861c2.5,2.515,3.903,4.966,4.759,8.313 c1.433,5.603,0.046,11.302-3.875,15.926C122.86,315.392,116.074,317.89,110.457,317.024L110.457,317.024z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M36.199,314.997 c0.828-2.472,1.473-4.518,1.433-4.547c-0.04-0.029-1.713-1.277-3.718-2.773l-3.645-2.721l4.577-0.084l4.577-0.084l1.348-4.12 c0.741-2.266,1.422-4.118,1.513-4.116c0.091,0.002,0.729,1.825,1.417,4.051l1.251,4.047l4.651,0.153l4.651,0.153l-3.677,2.733 c-3.363,2.5-3.661,2.8-3.484,3.516c0.106,0.43,0.72,2.354,1.364,4.276c0.644,1.921,1.115,3.549,1.047,3.617 c-0.068,0.068-1.729-1.065-3.692-2.517l-3.569-2.641l-2.802,2.094c-1.541,1.152-3.24,2.401-3.776,2.776l-0.974,0.682 L36.199,314.997z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M188.14,314.997 c0.828-2.472,1.473-4.518,1.433-4.547c-0.04-0.029-1.713-1.277-3.718-2.773l-3.645-2.721l4.577-0.084l4.577-0.084l1.348-4.12 c0.741-2.266,1.422-4.117,1.513-4.115c0.091,0.003,0.737,1.826,1.434,4.051l1.269,4.046l4.67,0.153l4.67,0.153l-3.646,2.721 c-2.005,1.497-3.678,2.745-3.718,2.773c-0.04,0.029,0.537,1.964,1.283,4.301c0.746,2.337,1.308,4.297,1.25,4.355 c-0.059,0.059-1.712-1.082-3.674-2.534l-3.568-2.64l-2.806,2.097c-1.543,1.153-3.244,2.404-3.78,2.779l-0.974,0.682 L188.14,314.997z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M56.666,279.564 c-1.429-1.077-3.101-2.314-3.715-2.749l-1.116-0.791l-3.573,2.644c-1.965,1.454-3.621,2.595-3.68,2.536 c-0.059-0.059,0.502-1.961,1.247-4.228c0.745-2.266,1.355-4.209,1.357-4.316c0.002-0.108-1.668-1.445-3.709-2.973l-3.712-2.777 l4.648-0.085l4.648-0.085l1.409-4.28l1.409-4.28l1.374,4.349l1.374,4.349l4.589,0.084l4.589,0.084l-3.569,2.68 c-1.963,1.474-3.569,2.858-3.569,3.076c0,0.218,0.417,1.626,0.926,3.129c0.984,2.903,1.832,5.652,1.733,5.614 C59.291,281.531,58.095,280.641,56.666,279.564L56.666,279.564z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M178.35,277.107 c0.832-2.483,1.479-4.537,1.439-4.566c-0.04-0.029-1.713-1.277-3.718-2.773l-3.645-2.721l4.577-0.084l4.577-0.084l1.347-4.118 c0.741-2.265,1.444-4.015,1.562-3.89c0.118,0.125,0.76,1.947,1.426,4.049l1.212,3.821l4.642,0.153l4.642,0.153l-3.686,2.74 c-2.027,1.507-3.686,2.819-3.686,2.917c0,0.097,0.618,2.019,1.373,4.27c0.755,2.251,1.319,4.146,1.253,4.212 c-0.066,0.066-1.721-1.066-3.679-2.515l-3.56-2.634l-2.814,2.055c-1.548,1.13-3.256,2.387-3.795,2.792l-0.981,0.737 L178.35,277.107z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M152.355,252.451 c0-0.057,0.619-1.95,1.376-4.206c0.757-2.256,1.376-4.208,1.376-4.339c0-0.13-1.606-1.443-3.569-2.917l-3.569-2.68l4.463-0.085 l4.463-0.085l1.459-4.348l1.459-4.348l1.376,4.349l1.376,4.349l4.54,0.084l4.54,0.084l-3.521,2.599 c-1.936,1.429-3.525,2.811-3.531,3.07c-0.006,0.259,0.599,2.288,1.344,4.509s1.296,4.038,1.225,4.038s-1.709-1.169-3.641-2.599 c-1.932-1.429-3.6-2.599-3.708-2.599c-0.108,0-1.649,1.066-3.424,2.369C153.02,252.171,152.355,252.625,152.355,252.451 L152.355,252.451z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M68.897,251.988 c0.002-0.125,0.612-2.081,1.356-4.347c0.834-2.538,1.248-4.246,1.08-4.449c-0.15-0.181-1.869-1.491-3.819-2.912l-3.546-2.583 l4.748-0.084l4.748-0.084l1.286-4.124c0.708-2.269,1.387-4.019,1.509-3.89c0.123,0.129,0.762,1.954,1.42,4.056l1.197,3.821 l4.828,0.085l4.828,0.085l-3.882,2.92c-2.135,1.606-3.823,3.081-3.751,3.279c0.779,2.124,2.706,8.216,2.623,8.294 c-0.059,0.056-1.656-1.053-3.549-2.465c-1.892-1.412-3.588-2.566-3.769-2.566c-0.181,0-1.9,1.169-3.82,2.597 C70.466,251.048,68.896,252.114,68.897,251.988L68.897,251.988z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n  <path d=\"M110.472,241.754 c0-0.059,0.619-1.953,1.376-4.209c0.757-2.256,1.372-4.245,1.367-4.42c-0.005-0.175-1.621-1.488-3.592-2.917l-3.584-2.599 l4.487-0.085l4.487-0.085l1.478-4.432l1.478-4.433l1.366,4.433l1.366,4.433l4.532,0.084l4.532,0.084l-3.521,2.599 c-1.936,1.429-3.525,2.758-3.531,2.954c-0.006,0.195,0.592,2.222,1.328,4.504c0.736,2.282,1.183,4.062,0.994,3.955 c-0.189-0.107-1.804-1.274-3.588-2.593c-1.784-1.32-3.348-2.399-3.475-2.399c-0.127,0-1.694,1.073-3.482,2.384 C111.055,241.529,110.472,241.927,110.472,241.754L110.472,241.754z\" fill=\"#ebc14a\" transform=\"translate(-22.268306,-211.35692)\"/>\n</svg>\n", "tmview": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M163.496,46.585l-27.625,71.468l-27.328-71.468 h-9.395h-12.23H8V61.98h29.339v83.434h17.076V61.947h32.471v83.434h17.076V84.166c0-1.978-0.297-3.989-0.297-5.967l25.647,67.216 h12.527l25.647-67.216c0,1.714-0.56,3.692-0.56,5.143v62.073H184V46.585H163.496z\" fill=\"#2f509a\"/>\n</svg>\n", "branddb": "<svg fill=\"#73899d\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M8.183 138.167V8.184h176v176h-17.417c-.512-5.723-3.098-10.532-6.669-14.922 8.872-11.234 9.13-22.46.011-33.658 8.886-11.268 9.095-22.492.064-33.571 1.123-1.71 2.264-3.266 3.215-4.931 3.646-6.384 4.61-13.059 1.945-20.064-1.648-4.331-4.326-7.985-7.543-11.264-5.625-5.734-12.289-10.03-19.329-13.772-13.218-7.027-27.261-11.965-41.553-16.257-.219-.066-.455-.074-.743-.119v7.147c.389.11.734.218 1.084.306 9.922 2.502 19.746 5.325 29.329 8.937 7.299 2.751 14.425 5.87 21.056 10.022 4.085 2.558 7.892 5.452 10.919 9.262 4.853 6.107 5.083 12.681.654 19.105-1.427 2.069-3.13 3.887-5.035 5.564-.226-.161-.405-.273-.566-.407-5.95-4.913-12.57-8.754-19.473-12.136-11.937-5.849-24.445-10.186-37.144-14.018-.245-.074-.51-.083-.815-.129v7.149c.488.138.921.272 1.361.382 10.755 2.705 21.387 5.806 31.714 9.883 7.402 2.922 14.592 6.264 21.149 10.837.315.22.609.47 1.01.782-8.353 6.292-17.636 10.52-27.181 14.3-9.162-3.767-18.487-6.964-28.059-9.781v7.276c6.545 1.666 13.032 3.363 19.395 5.527-.385.232-.754.37-1.128.495-17.628 5.919-35.671 10.228-53.912 13.718-9.021 1.726-18.084 3.241-27.15 4.719-6.174 1.006-12.385 1.78-18.58 2.658-2.201.312-4.405.628-6.609.943z\"/>\n  <path d=\"M96.023 136.401c.026 1.953.053 3.905.077 5.858.006.455.001.909.001 1.379 6.585 1.838 13.097 3.656 19.609 5.473-.004.082-.007.163-.011.245-1.233.415-2.462.841-3.699 1.244-12.927 4.207-26.083 7.547-39.361 10.43-13.214 2.869-26.516 5.266-39.883 7.286-8.175 1.236-16.38 2.274-24.572 3.4v-16.133c10.438-1.741 20.895-3.382 31.311-5.249 13.456-2.413 26.782-5.444 39.979-9.014 5.211-1.41 10.377-2.984 15.56-4.492.343-.1.663-.282.993-.426l-.004-.001z\"/>\n  <path d=\"M38.983 184.183c4.156-.84 8.319-1.649 12.468-2.525 19.4-4.097 38.574-9.018 57.247-15.758 7.99-2.884 15.83-6.122 23.42-9.948.51-.257.964-.416 1.552-.158 5.827 2.557 11.518 5.361 16.741 9.035.274.193.542.396.808.602.043.033.059.1.125.221-8.242 6.217-17.529 10.446-27.117 14.248-9.128-3.746-18.457-6.959-28.054-9.774v7.177c6.495 1.814 12.948 3.617 19.402 5.42-.004.085-.007.17-.011.255-1.021.402-2.043.804-3.064 1.206-24.506-.001-49.011-.001-73.517-.001z\"/>\n  <path d=\"M142.017 184.183c4.588-2.858 9.031-5.916 12.997-9.611.999-.93 1.878-1.988 2.881-3.06 1.537 1.721 2.601 3.44 3.389 5.33.983 2.359 1.318 4.806.9 7.341h-20.167z\"/>\n  <path d=\"M96.026 136.402c.444-.1.898-.165 1.33-.304 12.021-3.849 23.811-8.28 35.106-13.955.163-.082.335-.146.568-.247 6.371 2.73 12.598 5.792 18.413 10.032-8.348 6.295-17.613 10.524-27.213 14.319-9.196-3.796-18.645-6.986-28.208-9.847l.004.002z\"/>\n  <path d=\"M154.269 129.562c-2.705-1.928-5.211-3.833-7.838-5.555-2.623-1.721-5.366-3.259-8.16-4.939 7.168-4.1 13.975-8.646 19.745-14.727 1.688 1.955 2.966 4.041 3.713 6.427.844 2.696.867 5.418.036 8.12-1.349 4.39-4.262 7.677-7.496 10.674z\"/>\n  <path d=\"M154.141 163.311c-4.912-4.129-10.237-7.451-15.962-10.53 7.26-4.167 14.063-8.706 19.836-14.787.365.449.7.828.999 1.234 2.198 2.987 3.623 6.267 3.281 10.042-.149 1.646-.53 3.33-1.14 4.864-1.453 3.654-4.052 6.494-7.014 9.177z\"/>\n</svg>\n", "madridMonitor": "<svg fill=\"#73899d\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M8.183 138.167V8.184h176v176h-17.417c-.512-5.723-3.098-10.532-6.669-14.922 8.872-11.234 9.13-22.46.011-33.658 8.886-11.268 9.095-22.492.064-33.571 1.123-1.71 2.264-3.266 3.215-4.931 3.646-6.384 4.61-13.059 1.945-20.064-1.648-4.331-4.326-7.985-7.543-11.264-5.625-5.734-12.289-10.03-19.329-13.772-13.218-7.027-27.261-11.965-41.553-16.257-.219-.066-.455-.074-.743-.119v7.147c.389.11.734.218 1.084.306 9.922 2.502 19.746 5.325 29.329 8.937 7.299 2.751 14.425 5.87 21.056 10.022 4.085 2.558 7.892 5.452 10.919 9.262 4.853 6.107 5.083 12.681.654 19.105-1.427 2.069-3.13 3.887-5.035 5.564-.226-.161-.405-.273-.566-.407-5.95-4.913-12.57-8.754-19.473-12.136-11.937-5.849-24.445-10.186-37.144-14.018-.245-.074-.51-.083-.815-.129v7.149c.488.138.921.272 1.361.382 10.755 2.705 21.387 5.806 31.714 9.883 7.402 2.922 14.592 6.264 21.149 10.837.315.22.609.47 1.01.782-8.353 6.292-17.636 10.52-27.181 14.3-9.162-3.767-18.487-6.964-28.059-9.781v7.276c6.545 1.666 13.032 3.363 19.395 5.527-.385.232-.754.37-1.128.495-17.628 5.919-35.671 10.228-53.912 13.718-9.021 1.726-18.084 3.241-27.15 4.719-6.174 1.006-12.385 1.78-18.58 2.658-2.201.312-4.405.628-6.609.943z\"/>\n  <path d=\"M96.023 136.401c.026 1.953.053 3.905.077 5.858.006.455.001.909.001 1.379 6.585 1.838 13.097 3.656 19.609 5.473-.004.082-.007.163-.011.245-1.233.415-2.462.841-3.699 1.244-12.927 4.207-26.083 7.547-39.361 10.43-13.214 2.869-26.516 5.266-39.883 7.286-8.175 1.236-16.38 2.274-24.572 3.4v-16.133c10.438-1.741 20.895-3.382 31.311-5.249 13.456-2.413 26.782-5.444 39.979-9.014 5.211-1.41 10.377-2.984 15.56-4.492.343-.1.663-.282.993-.426l-.004-.001z\"/>\n  <path d=\"M38.983 184.183c4.156-.84 8.319-1.649 12.468-2.525 19.4-4.097 38.574-9.018 57.247-15.758 7.99-2.884 15.83-6.122 23.42-9.948.51-.257.964-.416 1.552-.158 5.827 2.557 11.518 5.361 16.741 9.035.274.193.542.396.808.602.043.033.059.1.125.221-8.242 6.217-17.529 10.446-27.117 14.248-9.128-3.746-18.457-6.959-28.054-9.774v7.177c6.495 1.814 12.948 3.617 19.402 5.42-.004.085-.007.17-.011.255-1.021.402-2.043.804-3.064 1.206-24.506-.001-49.011-.001-73.517-.001z\"/>\n  <path d=\"M142.017 184.183c4.588-2.858 9.031-5.916 12.997-9.611.999-.93 1.878-1.988 2.881-3.06 1.537 1.721 2.601 3.44 3.389 5.33.983 2.359 1.318 4.806.9 7.341h-20.167z\"/>\n  <path d=\"M96.026 136.402c.444-.1.898-.165 1.33-.304 12.021-3.849 23.811-8.28 35.106-13.955.163-.082.335-.146.568-.247 6.371 2.73 12.598 5.792 18.413 10.032-8.348 6.295-17.613 10.524-27.213 14.319-9.196-3.796-18.645-6.986-28.208-9.847l.004.002z\"/>\n  <path d=\"M154.269 129.562c-2.705-1.928-5.211-3.833-7.838-5.555-2.623-1.721-5.366-3.259-8.16-4.939 7.168-4.1 13.975-8.646 19.745-14.727 1.688 1.955 2.966 4.041 3.713 6.427.844 2.696.867 5.418.036 8.12-1.349 4.39-4.262 7.677-7.496 10.674z\"/>\n  <path d=\"M154.141 163.311c-4.912-4.129-10.237-7.451-15.962-10.53 7.26-4.167 14.063-8.706 19.836-14.787.365.449.7.828.999 1.234 2.198 2.987 3.623 6.267 3.281 10.042-.149 1.646-.53 3.33-1.14 4.864-1.453 3.654-4.052 6.494-7.014 9.177z\"/>\n</svg>\n", "auTrademark": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"96\" cy=\"96\" r=\"82.5\" fill=\"none\" stroke=\"#de4326\" stroke-width=\"11.7346\" stroke-miterlimit=\"10\"/>\n  <g fill=\"#de4326\">\n    <path d=\"M79.247,84.621v31.293h-9.799V84.621h-9.799V75.77h29.713v8.851H79.247z\"/>\n    <path d=\"M122.552,115.914V96.632l-5.69,9.799h-6.322l-5.69-9.483v19.282h-9.799V76.086h9.799 l8.851,17.701l8.851-17.701h9.799v40.144h-9.799V115.914z\"/>\n  </g>\n</svg>\n", "auDesign": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M178.5,96c0-45.564-36.936-82.5-82.5-82.5 S13.5,50.436,13.5,96s36.936,82.5,82.5,82.5S178.5,141.564,178.5,96z\" fill=\"none\" stroke=\"#80d07f\" stroke-width=\"11.3435\" stroke-miterlimit=\"10\"/>\n  <path d=\"M107.436,83.714c-1.473-2.087-3.689-3.48-7.746-3.48h-7.103v34.79h7.103 c4.057,0,6.273-1.393,7.746-3.478c1.293-1.74,1.754-3.392,1.754-13.918C109.19,87.192,108.729,85.454,107.436,83.714 L107.436,83.714z M122.106,118.154c-4.521,6.872-11.441,10.438-21.309,10.438H76.444V66.667h24.353 c9.868,0,16.788,3.566,21.309,10.436c3.227,4.956,3.227,9.827,3.227,20.525C125.333,108.327,125.333,113.196,122.106,118.154\" fill=\"#80d07f\"/>\n</svg>\n", "nzTrademark": "<svg fill=\"#000000\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M34.788,133.682c0.357-0.357,6.786,25.716,42.861,21.073c-7.143-17.144-28.931-28.217-34.289-28.574 c1.072-0.714,7.143-5.358,8.215-6.072c-1.429,4.643,19.287,23.931,35.36,18.573c-4.286-12.858-21.787-23.931-26.431-24.288 c1.786-1.072,3.929-2.5,5.715-3.572c-1.072,2.5,14.287,17.501,30.36,16.073c0-7.858-17.501-22.502-20.716-21.43 c1.786-0.714,3.929-2.143,5-2.857c2.143,5.358,17.144,16.787,27.502,14.644c-8.572-17.859-19.287-18.93-19.287-18.93l5-2.143 c0,4.643,14.644,15.716,25.002,13.215c-2.5-8.572-9.644-15.001-18.216-16.43l5.358-2.5c-0.714,1.429,11.429,11.787,23.573,11.072 c-5.715-13.93-13.573-14.287-16.43-14.644c1.429-0.714,3.215-1.786,5-2.5c0.714,1.786,7.143,10.715,22.502,8.572 c-3.215-6.429-9.286-10.715-16.43-11.43c2.143-1.429,3.929-1.786,5.358-2.857c1.072,1.429,5,9.644,20.716,6.429 c-2.5-5.358-7.501-9.286-13.573-10.358c1.429-0.714,2.857-1.786,3.929-2.143c4.643,4.643,11.43,6.786,17.859,5.358 c-1.786-5-7.858-7.858-13.215-7.858c2.5-1.429,4.643-3.215,4.643-3.215c0.714,1.786,5.358,6.429,16.43,3.215 c-3.572-6.786-12.501-6.072-12.501-6.072c2.143-1.786,2.857-2.143,4.643-3.572c3.572,4.286,9.644,5.358,14.287,2.143 c-2.143-3.929-6.429-6.072-10.715-5.358c1.072-1.072,2.143-2.143,3.215-3.215c-0.357,1.072,6.429,4.643,12.858,0 c-2.5-2.5-6.072-3.929-9.644-3.215c0.714-1.072,0.714-1.072,1.786-2.143c3.215,2.5,7.858,1.786,10.715-1.072 c-2.5-1.072-5.715-1.429-8.929-0.357l2.143-3.215c2.857,2.143,6.786,1.072,8.929-1.786l0,0c-2.5-1.072-5-1.429-7.501-0.714 c0.357-0.714,0.714-1.072,0.714-1.786c11.072,1.429,7.143-11.429,4.643-18.573C139.796,84.035,84.792,39.745,17.286,79.034 c-3.215,8.215-4.286,16.787-3.572,25.716c0,1.072,0.357,2.5,0.357,3.572c0.357,3.572,1.429,7.143,2.5,10.715 c1.429,3.929,2.857,6.429,4.286,10.358c1.072-0.714,2.143-1.429,2.857-2.143c-2.5-4.286-12.501-30.36,0-45.361 c11.787-0.357,13.215,33.931,11.429,37.503c0,0,5.715-3.572,7.858-5c-2.5-1.072-11.429-30.717,3.572-42.861 c0,0,13.573,5,7.858,36.432c2.143-1.429,5.358-2.857,8.572-4.286c-1.786-2.857-10.715-25.359,3.929-37.146 c7.858,3.215,7.501,27.859,4.286,33.217c2.5-1.072,5.358-2.5,7.858-3.572c-4.643-2.143-4.286-25.359,3.572-31.431 c8.572,8.215,6.429,21.787,4.286,27.859l6.429-2.857c-5.358-9.644-2.857-21.787,2.857-26.431 c4.286,2.857,5.358,10.715,3.572,23.573c1.786-0.714,2.857-1.429,4.643-1.786c-1.072-2.143-3.929-15.358,3.572-22.859 c6.786,3.215,4.286,18.216,3.929,19.644c0,0,3.929-1.429,3.929-1.786c-1.429-2.857-2.143-13.93,3.929-19.287 c2.5,1.786,5,6.786,2.857,16.43c1.429-0.714,2.857-1.429,4.643-2.143c-2.143-2.5-0.714-12.144,2.5-16.073 c3.572,1.429,5.358,10.001,3.929,12.858c1.072-0.357,2.143-1.072,3.929-2.143c-1.072-1.786-1.786-11.072,2.143-13.573 c3.572,2.5,3.215,8.929,3.215,10.715c1.072-0.714,4.286-2.143,4.286-2.143c-2.857-3.572-2.143-8.572,1.429-11.43 c3.929,0.714,3.929,7.858,3.572,8.572c1.429-1.072,3.929-2.857,5-3.572c-3.572-0.714-3.215-6.429-1.072-8.929 c2.5,0.357,3.929,1.786,4.643,6.072c0.714-0.714,2.857-2.5,3.572-3.215c-2.5-0.714-3.572-3.572-2.857-6.072 c0.357-0.714,0.714-1.429,1.429-1.786c2.143,0.714,3.929,2.5,4.286,5c1.072-1.072,1.786-1.786,2.5-2.857 c-2.143-1.786-2.5-4.643-1.429-6.786c1.786,0.357,3.572,1.786,3.929,3.572l1.786-2.857c-2.143-1.072-2.5-3.929-1.429-5.715l0,0 c1.786,0.357,3.215,1.786,3.572,3.572C153.012,82.963,61.219,90.821,13,144.754c0,0-5,5.358-5,7.858v18.216h1.072 C14.429,156.183,23.001,143.325,34.788,133.682\"/>\n</svg>\n", "jpDesign": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"87.65\" cy=\"83.819\" r=\"13.808\" fill=\"#fdc02f\"/>\n  <path d=\"M75.938,59.095c0.703,2.617,3.397,4.177,6.018,3.474c2.621-0.703,4.173-3.397,3.47-6.018 L80.59,15.965c-1.536-5.732-7.423-9.129-13.152-7.597c-5.736,1.536-9.129,7.427-7.597,13.156L75.938,59.095z\" fill=\"#fdc02f\"/>\n  <g fill=\"#284a51\">\n    <path d=\"M155.926,79.604c-1.22,4.327-2.887,8.519-4.933,12.542c0.942,2.274,1.791,4.601,2.447,7.049 c8.489,31.669-10.376,64.338-42.049,72.834c-31.673,8.481-64.346-10.384-72.834-42.057 c-7.338-27.388,5.81-55.494,29.982-68.102l-4.343-8.971C35.812,67.521,20.363,100.468,28.96,132.55 c9.901,36.961,48.036,58.98,85.002,49.079c36.969-9.901,58.984-48.036,49.079-85.013 C161.403,90.505,158.975,84.827,155.926,79.604z\"/>\n    <path d=\"M93.224,55.204c16.217-0.745,31.8,5.246,43.338,16.004c-1.988,6.466-5.022,12.461-8.925,17.78 c-1.861,2.54-3.914,4.918-6.142,7.118c-0.262,0.259-0.537,0.51-0.803,0.757c-0.884,0.842-1.791,1.66-2.721,2.436 c-0.297,0.251-0.594,0.506-0.896,0.753c-1.085,0.872-2.189,1.718-3.324,2.517c-0.131,0.081-0.247,0.17-0.371,0.262 c-1.32,0.907-2.675,1.76-4.065,2.559c-0.174,0.1-0.359,0.189-0.537,0.29c-1.166,0.652-2.351,1.274-3.555,1.849 c-0.386,0.181-0.772,0.355-1.162,0.529c-1.054,0.475-2.127,0.911-3.208,1.339c-0.417,0.151-0.822,0.317-1.235,0.467 c-1.343,0.483-2.71,0.907-4.092,1.293c-0.127,0.031-0.247,0.077-0.371,0.112c-0.046,0.008-0.089,0.023-0.131,0.031l0,0 c-13.117,3.49-27.164,2.366-39.552-3.181c-1.498-0.672-3.235-0.56-4.636,0.305c-1.401,0.865-2.281,2.355-2.359,3.999 c-0.224,4.868,0.305,9.739,1.575,14.48c6.786,25.331,32.924,40.416,58.258,33.63c13.21-3.54,23.374-11.573,29.407-23.231 c6.651-12.862,6.454-26.199,4.868-30.488c-0.649-1.753-2.227-2.984-4.088-3.2c-1.864-0.228-3.679,0.629-4.709,2.181 c-7.114,10.712-20.092,19.679-33.885,23.373c-2.652,0.71-4.223,3.439-3.513,6.08c0.71,2.656,3.436,4.223,6.088,3.517 c11.295-3.023,21.876-8.902,30.14-16.498c-0.741,3.443-2.003,7.288-4.053,11.083c-4.81,8.894-12.484,14.812-22.825,17.587 c-20.042,5.377-40.714-6.574-46.083-26.608c-0.386-1.428-0.683-2.884-0.896-4.339c12.468,3.941,25.917,4.308,38.633,0.957 c0.004,0,0.012,0,0.019,0c0.093-0.019,0.197-0.05,0.278-0.066c1.76-0.483,3.486-1.035,5.192-1.633 c0.475-0.166,0.934-0.363,1.405-0.537c1.278-0.483,2.54-1.008,3.779-1.563c0.452-0.205,0.911-0.413,1.363-0.625 c1.394-0.664,2.76-1.367,4.1-2.108c0.232-0.131,0.471-0.243,0.699-0.378c1.629-0.934,3.216-1.938,4.756-2.992 c0.124-0.081,0.247-0.189,0.371-0.274c1.355-0.942,2.664-1.93,3.945-2.976c0.359-0.286,0.706-0.575,1.058-0.884 c1.081-0.907,2.135-1.853,3.154-2.818c0.324-0.305,0.652-0.61,0.969-0.919c2.59-2.575,4.987-5.335,7.157-8.292 c0.081-0.116,0.189-0.228,0.274-0.347c0.054-0.077,0.085-0.151,0.135-0.232c3.227-4.497,5.96-9.361,8.06-14.561 c0.012,0.015,0.027,0.042,0.039,0.058c1.386-3.968,2.308-8.087,2.795-12.275c-0.328-0.359-0.641-0.73-0.973-1.077 c-0.131-0.151-0.274-0.286-0.425-0.417c-13.7-13.939-32.974-21.772-53.043-20.756L93.224,55.204z\"/>\n  </g>\n</svg>\n", "pimeyes": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <g fill=\"#2e3b80\">\n    <path d=\"M975.105,10048.468c-273.983-10.313-504.135-106.396-681.175-284.296 c-51.565-51.736-88.348-99.521-121.522-157.445c-75.973-133.038-105.193-290.999-87.317-470.102 c17.532-172.571,77.176-309.219,183.916-420.943c61.191-63.94,155.555-119.459,262.123-154.008 c177.728-57.581,438.991-67.55,642.845-24.751c199.213,41.939,368.519,138.71,481.102,275.186 c102.271,123.929,160.539,267.795,178.759,441.397c21.657,204.886-13.751,371.269-106.224,500.182 c-65.831,91.786-166.555,168.79-288.936,220.87C1310.106,10029.389,1149.051,10054.999,975.105,10048.468z M1188.584,9884.319 c114.818-8.938,212.792-35.408,294.781-80.098c103.474-56.206,169.305-130.116,200.932-225.684 c22.001-66.348,27.158-147.992,14.61-233.934c-21.314-147.305-98.318-269.857-221.558-352.705 c-96.255-64.629-210.386-102.271-354.08-116.709c-36.611-3.61-138.023-5.157-181.337-2.579 c-185.978,10.829-321.766,58.785-407.536,143.867c-74.598,74.082-116.537,168.274-126.335,283.952 c-2.578,31.11-1.203,99.521,2.578,122.896c4.641,28.876,9.625,49.158,18.22,75.457c30.252,91.958,89.551,169.821,182.197,238.746 c100.724,74.941,216.745,121.35,351.502,140.601C1030.451,9887.757,1112.784,9889.991,1188.584,9884.319z\" transform=\"translate(0.000000,1024.000000) scale(0.100000,-0.100000)\"/>\n    <path d=\"M1055.031,9754.547c-118.084-8.25-221.558-53.972-299.249-132.179 c-66.519-67.034-98.146-150.055-94.192-246.825c2.578-58.612,12.204-101.583,32.142-143.351 c46.409-97.458,132.694-151.086,268.826-167.071c50.018-5.844,127.194-4.984,174.978,1.892 c179.103,26.126,300.625,132.178,333.11,290.999c4.985,24.579,8.422,60.331,8.422,87.832v23.892l-5.5-1.031 c-3.094-0.688-14.954-3.094-26.298-5.5c-16.673-3.609-26.986-4.813-54.315-5.5c-127.366-3.61-201.62,38.674-232.73,132.351 c-14.782,44.689-16.845,102.099-5.328,147.647c2.063,8.423,3.094,15.642,2.406,16.157 C1154.551,9755.578,1076.516,9756.094,1055.031,9754.547z\" transform=\"translate(0.000000,1024.000000) scale(0.100000,-0.100000)\"/>\n  </g>\n</svg>\n", "stocksy": "<svg fill=\"#000000\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M132.402,113.571c-0.352,0-0.701,0.061-1.044,0.033c-0.35-0.028-0.695-0.089-1.036-0.145 c-0.345-0.056-0.68-0.159-1.014-0.245c-0.336-0.085-0.669-0.186-0.996-0.302c-0.332-0.117-0.664-0.222-0.975-0.371 c-0.317-0.148-0.599-0.358-0.892-0.538c-0.599-0.362-1.155-0.791-1.658-1.279c-0.247-0.252-0.478-0.52-0.692-0.801 c-0.222-0.286-0.478-0.54-0.656-0.838c-0.185-0.311-0.311-0.647-0.449-0.964c-0.148-0.336-0.315-0.655-0.41-0.985 c-0.211-0.683-0.29-1.4-0.232-2.112c0.02-0.313,0.102-0.59,0.176-0.831c0.184-0.616,0.391-0.742,0.673-0.261 c0.146,0.247,0.352,0.547,0.582,0.901c0.176,0.274,0.399,0.554,0.643,0.853c0.213,0.263,0.423,0.554,0.699,0.812 c0.248,0.234,0.545,0.434,0.853,0.649c0.278,0.198,0.553,0.436,0.884,0.604c0.304,0.158,0.645,0.273,0.999,0.397 c0.321,0.115,0.666,0.21,1.031,0.289c0.334,0.074,0.682,0.182,1.057,0.222c0.278,0.03,0.565-0.019,0.84-0.019 c0.371,0,0.723-0.037,1.061-0.089c0.367-0.056,0.732-0.067,1.057-0.174c0.352-0.115,0.679-0.278,0.979-0.443 c0.326-0.178,0.593-0.423,0.855-0.643c0.286-0.239,0.558-0.473,0.764-0.743c0.226-0.3,0.432-0.604,0.556-0.918 c0.12-0.316,0.212-0.642,0.274-0.973c0.074-0.349,0.07-0.686,0.067-1.005c0-0.347-0.019-0.679-0.096-0.999 c-0.069-0.331-0.173-0.654-0.308-0.964c-0.145-0.304-0.313-0.596-0.502-0.875c-0.185-0.274-0.417-0.519-0.634-0.784 c-0.208-0.256-0.4-0.536-0.63-0.788c-0.222-0.247-0.497-0.449-0.729-0.695c-0.213-0.23-0.421-0.465-0.632-0.699 c-0.213-0.232-0.413-0.477-0.614-0.716c-0.205-0.238-0.401-0.485-0.588-0.738c-0.186-0.253-0.359-0.516-0.519-0.786 c-0.159-0.271-0.323-0.545-0.443-0.834c-0.114-0.295-0.206-0.598-0.273-0.907c-0.094-0.356-0.154-0.721-0.18-1.088 c-0.007-0.368,0.022-0.737,0.085-1.099c0.052-0.362,0.126-0.723,0.247-1.074c0.116-0.35,0.262-0.689,0.436-1.014 c0.172-0.315,0.434-0.582,0.666-0.877c0.208-0.265,0.382-0.564,0.625-0.803c0.241-0.234,0.514-0.439,0.786-0.645 c0.267-0.204,0.551-0.389,0.844-0.562c0.289-0.171,0.582-0.347,0.89-0.486c0.308-0.139,0.636-0.234,0.959-0.339 c0.319-0.106,0.638-0.224,0.972-0.297c0.328-0.072,0.662-0.148,1.001-0.184c0.334-0.037,0.677-0.006,1.016-0.006 c0.089,0,0.18,0.032,0.271,0.033c0.334,0.009,0.656-0.032,0.96-0.004c0.336,0.03,0.649,0.115,0.946,0.163 c0.337,0.056,0.651,0.108,0.944,0.184c0.33,0.085,0.649,0.135,0.929,0.241c0.324,0.121,0.616,0.263,0.875,0.406 c0.308,0.167,0.547,0.386,0.775,0.566c0.282,0.222,0.549,0.408,0.729,0.621c0.228,0.273,0.4,0.584,0.543,0.89 c0.148,0.317,0.26,0.651,0.311,0.99c0.038,0.344,0.025,0.692-0.039,1.033c-0.048,0.323-0.106,0.617-0.247,0.849 c-0.163,0.251-0.394,0.45-0.666,0.575c-0.269,0.117-0.562,0.171-0.855,0.158c-0.399,0.009-0.796-0.063-1.166-0.211 c-0.269-0.117-0.512-0.286-0.714-0.499c-0.198-0.213-0.372-0.447-0.519-0.697c-0.204-0.323-0.408-0.66-0.753-0.949 c-0.32-0.25-0.686-0.436-1.077-0.547c-0.387-0.127-0.792-0.192-1.2-0.195c-0.297,0-0.58,0.033-0.844,0.106 c-0.277,0.067-0.542,0.18-0.782,0.334c-0.237,0.167-0.423,0.393-0.569,0.634c-0.193,0.326-0.284,0.701-0.263,1.079 c0.011,0.349,0.128,0.701,0.313,1.066c0.108,0.208,0.282,0.426,0.506,0.686c0.167,0.197,0.337,0.434,0.558,0.66 c0.189,0.195,0.367,0.426,0.586,0.645c0.224,0.224,0.493,0.436,0.74,0.69c0.224,0.232,0.471,0.464,0.706,0.719 c0.223,0.241,0.413,0.523,0.638,0.784c0.215,0.252,0.413,0.523,0.623,0.794c0.204,0.263,0.421,0.523,0.612,0.805 c0.189,0.276,0.389,0.549,0.56,0.844c0.169,0.289,0.308,0.597,0.454,0.905c0.145,0.302,0.319,0.597,0.436,0.916 c0.117,0.315,0.206,0.643,0.291,0.973c0.083,0.323,0.122,0.66,0.171,0.999c0.046,0.328,0.05,0.664,0.059,1.009 c0.009,0.33,0.063,0.669,0.033,1.012c-0.028,0.33-0.065,0.667-0.132,1.009c-0.063,0.323-0.182,0.645-0.284,0.977 c-0.099,0.314-0.217,0.621-0.352,0.921c-0.13,0.304-0.248,0.612-0.412,0.894c-0.51,0.845-1.156,1.601-1.912,2.236 c-0.247,0.215-0.482,0.451-0.747,0.642c-0.267,0.191-0.578,0.315-0.86,0.48c-0.284,0.167-0.569,0.319-0.864,0.462 c-0.297,0.141-0.59,0.286-0.894,0.404c-0.308,0.119-0.601,0.273-0.914,0.369c-0.315,0.096-0.645,0.13-0.964,0.202 c-0.321,0.074-0.634,0.189-0.955,0.237c-0.326,0.05-0.66,0.024-0.983,0.05C133.055,113.566,132.728,113.575,132.402,113.571 M47.849,115.945c-0.376,0-0.753,0.033-1.112-0.043c-0.363-0.086-0.716-0.211-1.051-0.375c-0.332-0.166-0.645-0.369-0.931-0.606 c-0.292-0.228-0.556-0.489-0.788-0.779c-0.227-0.27-0.427-0.562-0.597-0.871c-0.158-0.304-0.245-0.649-0.358-0.996 c-0.11-0.334-0.198-0.676-0.263-1.022c-0.066-0.346-0.115-0.696-0.145-1.048c-0.028-0.339-0.026-0.692-0.026-1.057 c0-0.341-0.052-0.697-0.026-1.061c0.024-0.343,0.098-0.69,0.145-1.049c0.044-0.343,0.046-0.703,0.111-1.061 c0.059-0.339,0.13-0.69,0.21-1.044c0.072-0.319,0.167-0.638,0.241-0.964c0.076-0.319,0.18-0.636,0.26-0.962 c0.078-0.317,0.148-0.642,0.234-0.964c0.082-0.319,0.193-0.63,0.278-0.953c0.087-0.315,0.13-0.649,0.221-0.97 c0.087-0.317,0.159-0.642,0.25-0.964c0.093-0.315,0.226-0.623,0.321-0.942c0.095-0.317,0.159-0.645,0.256-0.964 c0.098-0.315,0.252-0.616,0.352-0.931c0.098-0.315,0.172-0.642,0.274-0.957l0.308-0.947c0.106-0.315,0.26-0.612,0.365-0.927 c0.108-0.315,0.159-0.649,0.269-0.964c0.111-0.313,0.336-1.029,0.419-1.352c0.18-0.699,0.289-0.623-0.375-0.584 c-0.037,0.002-0.699,0.011-0.736,0.009c-0.341-0.021-0.68-0.073-1.012-0.156c-0.334-0.091-0.671-0.172-0.985-0.313 c-0.315-0.141-0.61-0.328-0.899-0.512c-0.297-0.185-0.553-0.417-0.812-0.634c-0.355-0.326-0.68-0.684-0.972-1.068 c-0.334-0.46-0.297-0.451,0-0.751c0.375-0.376,0.96-0.723,1.305-0.909c0.289-0.158,0.612-0.31,0.953-0.473 c0.304-0.145,0.63-0.278,0.975-0.428c0.311-0.135,0.636-0.278,0.977-0.413c0.319-0.13,0.649-0.26,0.992-0.389 c0.323-0.122,0.651-0.263,0.996-0.388c0.326-0.115,0.667-0.208,1.014-0.324c0.33-0.111,1.315-0.449,1.659-0.56 c0.316-0.096,0.574-0.325,0.708-0.627c0.148-0.315,0.445-1.098,0.591-1.402c0.148-0.313,0.321-0.612,0.469-0.914 c0.156-0.315,0.313-0.619,0.464-0.918c0.159-0.315,0.297-0.63,0.451-0.927c0.165-0.315,0.352-0.604,0.508-0.896 c0.171-0.317,0.308-0.632,0.467-0.916c0.178-0.319,0.33-0.629,0.493-0.901c0.195-0.326,0.417-0.591,0.582-0.842 c0.189-0.289,0.412-0.543,0.617-0.801c0.215-0.271,0.393-0.564,0.623-0.801c0.239-0.248,0.515-0.447,0.766-0.664 c0.261-0.222,0.519-0.439,0.792-0.63c0.28-0.198,0.54-0.421,0.829-0.586c0.295-0.166,0.597-0.319,0.905-0.458 c0.313-0.145,0.643-0.226,0.955-0.341c0.324-0.117,0.63-0.274,0.946-0.362c0.334-0.093,0.673-0.148,0.994-0.213 c0.343-0.069,0.677-0.133,0.999-0.174c0.352-0.044,0.692-0.033,1.01-0.056c0.362-0.02,0.951-0.108,1.409-0.024 c0.551,0.1,0.649,0.221,0.376,0.627c-0.165,0.247-0.491,0.807-0.708,1.138c-0.171,0.265-0.371,0.547-0.571,0.864 c-0.172,0.274-0.358,0.567-0.551,0.881c-0.174,0.278-0.365,0.567-0.554,0.879c-0.172,0.284-0.337,0.588-0.523,0.899l-0.527,0.892 c-0.171,0.291-0.352,0.588-0.53,0.896c-0.169,0.293-0.365,0.58-0.541,0.89c-0.167,0.295-0.319,0.608-0.491,0.916 c-0.167,0.297-0.569,1.131-0.753,1.437c-0.375,0.627-0.033,0.612,0.293,0.543s1.205-0.33,1.531-0.397 c0.326-0.065,0.649-0.146,0.977-0.21s0.662-0.08,0.99-0.141c0.328-0.059,0.658-0.102,0.985-0.159 c0.33-0.059,0.653-0.139,0.981-0.193c0.328-0.056,0.655-0.132,0.983-0.185c0.328-0.052,0.66-0.082,0.99-0.13 c0.33-0.052,0.653-0.145,0.983-0.191c0.332-0.048,0.664-0.082,0.994-0.126c0.33-0.045,0.666-0.059,0.996-0.1 c0.332-0.043,0.664-0.056,0.994-0.095c0.334-0.039,0.656-0.139,0.986-0.174c0.334-0.037,0.664-0.082,0.992-0.113 c0.334-0.033,0.667-0.026,0.999-0.056c0.332-0.032,0.666-0.046,0.994-0.074c0.334-0.026,0.664-0.085,0.996-0.109 c0.334-0.024,0.667-0.03,0.999-0.05c0.334-0.02,0.667-0.028,0.996-0.045c0.334-0.017,0.667-0.019,0.996-0.03 c0.336-0.013,0.667-0.063,0.998-0.072c0.334-0.009,0.666,0.05,0.994,0.046c0.334-0.006,0.664-0.007,0.992-0.007 c0.332,0,0.666-0.015,1.003-0.009c0.332,0.006,0.666-0.041,1.001-0.03c0.332,0.009,0.664,0.074,0.998,0.089 c0.334,0.013,0.669-0.026,1.005-0.006c0.334,0.022,0.664,0.108,0.996,0.135c0.334,0.026,0.669,0.026,1.003,0.059 c0.334,0.033,0.662,0.104,0.994,0.143c0.334,0.041,0.675,0.011,1.007,0.059c0.334,0.046,0.664,0.096,0.994,0.15 c0.332,0.056,0.66,0.124,0.986,0.189c0.332,0.065,0.649,0.176,0.975,0.25c0.328,0.074,0.656,0.145,0.977,0.23 c0.328,0.085,0.658,0.145,0.977,0.241c0.324,0.098,0.64,0.215,0.953,0.324c0.321,0.111,0.632,0.232,0.942,0.356 c0.315,0.124,0.603,0.3,0.905,0.438c0.609,0.276,1.2,0.59,1.771,0.938c0.287,0.18,0.575,0.352,0.84,0.549 c0.273,0.202,0.556,0.388,0.803,0.608c0.252,0.222,0.46,0.491,0.686,0.736c0.23,0.247,0.439,0.506,0.638,0.773 c0.202,0.267,0.404,0.538,0.543,0.842c0.271,0.599-0.07,0.495-0.371,0.323c-0.287-0.167-0.617-0.271-0.925-0.425 c-0.297-0.148-0.582-0.341-0.897-0.478c-0.311-0.137-0.625-0.267-0.942-0.389c-0.311-0.119-0.649-0.185-0.973-0.297 c-0.319-0.104-0.63-0.245-0.96-0.341c-0.321-0.093-0.649-0.184-0.983-0.267c-0.326-0.08-0.651-0.185-0.988-0.258 c-0.328-0.07-0.664-0.13-1.003-0.191c-0.33-0.059-0.669-0.085-1.01-0.137c-0.332-0.05-0.667-0.106-1.007-0.148 c-0.334-0.041-0.673-0.056-1.016-0.089c-0.334-0.033-0.673-0.048-1.016-0.074c-0.334-0.026-0.671-0.082-1.014-0.1 c-0.337-0.019-0.677-0.013-1.02-0.026c-0.337-0.013-0.679-0.009-1.023-0.015c-0.336-0.006-0.677-0.043-1.02-0.043 c-0.343,0-0.686,0.05-1.031,0.056c-0.343,0.006-0.686-0.054-1.031-0.043c-0.343,0.011-0.686,0.022-1.029,0.037 c-0.345,0.017-0.686,0.044-1.029,0.067c-0.686,0.041-1.37,0.094-2.054,0.158c-0.343,0.03-0.688,0.041-1.029,0.074 c-0.343,0.035-0.68,0.115-1.02,0.152c-0.345,0.037-0.682,0.104-1.02,0.146c-0.345,0.041-0.692,0.056-1.031,0.1 c-0.343,0.046-0.69,0.067-1.029,0.117c-0.341,0.048-0.679,0.13-1.016,0.18c-0.343,0.054-0.679,0.13-1.016,0.185 c-0.343,0.056-0.692,0.048-1.027,0.108c-0.343,0.059-0.673,0.159-1.009,0.221c-0.341,0.063-0.679,0.119-1.012,0.182 c-0.341,0.067-0.682,0.109-1.016,0.176l-1.009,0.204c-0.339,0.072-0.667,0.172-0.999,0.245c-0.341,0.074-0.686,0.111-1.012,0.185 c-0.341,0.076-0.667,0.185-0.996,0.263c-0.339,0.08-0.68,0.13-1.007,0.208c-0.339,0.083-0.658,0.226-0.981,0.306 c-0.321,0.082-0.662,0.141-1.01,0.234c-0.321,0.085-0.643,0.219-0.99,0.315c-0.321,0.089-0.662,0.15-1.007,0.248 c-0.321,0.093-0.662,0.159-1.005,0.26c-0.323,0.095-0.649,0.217-0.99,0.319c-0.323,0.096-0.655,0.193-0.996,0.297 c-0.323,0.098-1.311,0.389-1.645,0.519c-0.541,0.208-0.588,0.397-0.738,0.705c-0.126,0.254-0.226,0.541-0.352,0.797 c-0.148,0.302-0.311,0.567-0.404,0.766c-0.148,0.313-0.26,0.642-0.402,0.949c-0.146,0.315-0.315,0.617-0.456,0.925 c-0.145,0.315-0.263,0.64-0.4,0.951c-0.141,0.317-0.241,0.649-0.375,0.962c-0.137,0.317-0.31,0.617-0.443,0.933 c-0.133,0.319-0.241,0.649-0.371,0.964c-0.13,0.321-0.293,0.627-0.417,0.946c-0.126,0.321-0.235,0.647-0.356,0.966 c-0.122,0.323-0.213,0.654-0.33,0.975c-0.117,0.324-0.273,0.634-0.386,0.957c-0.111,0.324-0.2,0.658-0.31,0.983 c-0.109,0.326-0.208,0.655-0.313,0.983c-0.104,0.324-0.219,0.649-0.319,0.977c-0.098,0.328-0.226,0.647-0.323,0.977 c-0.096,0.328-0.145,0.671-0.237,1.003c-0.093,0.33-0.161,0.667-0.248,1.001c-0.093,0.345-0.247,0.662-0.326,0.988 c-0.087,0.349-0.133,0.695-0.208,1.023c-0.08,0.352-0.135,0.695-0.198,1.022c-0.07,0.356-0.145,0.693-0.197,1.02 c-0.059,0.362-0.098,0.705-0.137,1.031c-0.041,0.365-0.13,0.705-0.145,1.027c-0.019,0.376-0.006,0.725,0.013,1.042 c0.022,0.384,0.141,0.714,0.217,1.014c0.096,0.38,0.178,0.714,0.36,0.96c0.146,0.197,0.315,0.371,0.53,0.467 c0.482,0.211,0.454,0.441,0.271,0.538c-0.185,0.095-0.406,0.18-0.662,0.25c-0.411,0.102-0.834,0.149-1.257,0.139v-0.007 M69.19,93.132c-0.323,0-0.638,0.135-0.964,0.254c-0.297,0.106-0.597,0.241-0.89,0.438c-0.261,0.176-0.541,0.362-0.797,0.604 c-0.243,0.23-0.472,0.474-0.686,0.731c-0.208,0.247-0.389,0.528-0.588,0.814c-0.185,0.263-0.41,0.519-0.588,0.814 c-0.342,0.575-0.652,1.17-0.927,1.78c-0.135,0.297-0.282,0.599-0.412,0.916c-0.122,0.302-0.182,0.64-0.297,0.959 c-0.111,0.31-0.26,0.614-0.363,0.938c-0.1,0.313-0.145,0.649-0.237,0.975c-0.091,0.317-0.178,0.642-0.26,0.97 c-0.08,0.323-0.176,0.643-0.247,0.975c-0.076,0.354-0.167,0.693-0.222,1.023c-0.061,0.362-0.098,0.71-0.135,1.038 c-0.041,0.371-0.093,0.716-0.104,1.044c-0.011,0.376,0.043,0.723,0.07,1.046c0.035,0.384,0.115,0.716,0.206,1.02 c0.111,0.371,0.226,0.693,0.423,0.938c0.321,0.399,0.742,0.567,1.248,0.567c0.313,0,0.658-0.022,1.01-0.174 c0.312-0.151,0.607-0.334,0.881-0.547c0.26-0.189,0.523-0.413,0.788-0.669c0.237-0.226,0.512-0.445,0.749-0.719 c0.217-0.25,0.386-0.562,0.601-0.851c0.198-0.269,0.382-0.564,0.569-0.871c0.176-0.287,0.412-0.556,0.575-0.871 c0.159-0.302,0.295-0.627,0.439-0.949c0.141-0.315,0.23-0.655,0.36-0.983c0.126-0.321,0.282-0.636,0.397-0.966 c0.111-0.33,0.247-0.655,0.345-0.99c0.1-0.334,0.171-0.679,0.256-1.014c0.087-0.341,0.128-0.69,0.198-1.029 c0.074-0.345,0.161-0.686,0.217-1.022c0.057-0.354,0.141-0.697,0.176-1.038c0.038-0.348,0.065-0.696,0.08-1.046 c0.015-0.365-0.022-0.718-0.037-1.048c-0.019-0.371-0.019-0.727-0.076-1.044c-0.072-0.376-0.232-0.695-0.365-0.977 c-0.113-0.263-0.284-0.498-0.501-0.686c-0.221-0.186-0.496-0.293-0.784-0.306C69.24,93.165,69.245,93.132,69.19,93.132 M62.7,115.993c-0.362,0-0.721,0.052-1.07,0.004c-0.353-0.055-0.702-0.135-1.044-0.241c-0.341-0.1-0.664-0.252-0.988-0.402 c-0.324-0.148-0.637-0.318-0.936-0.51c-0.295-0.191-0.597-0.378-0.875-0.614c-0.254-0.213-0.458-0.475-0.682-0.708 c-0.455-0.47-0.858-0.988-1.201-1.544c-0.166-0.282-0.316-0.573-0.451-0.871c-0.139-0.293-0.324-0.571-0.434-0.883 c-0.108-0.308-0.161-0.634-0.239-0.957c-0.074-0.315-0.189-0.629-0.237-0.957c-0.046-0.326-0.079-0.654-0.096-0.983 c-0.019-0.324,0-0.655,0.007-0.986c0.007-0.324,0.054-0.649,0.087-0.981c0.029-0.327,0.07-0.653,0.122-0.977 c0.056-0.319,0.148-0.632,0.224-0.957c0.076-0.315,0.119-0.643,0.217-0.964c0.093-0.308,0.18-0.629,0.297-0.942 c0.117-0.321,0.278-0.619,0.399-0.925c0.128-0.317,0.226-0.642,0.356-0.944c0.137-0.313,0.33-0.593,0.471-0.89 c0.145-0.31,0.269-0.623,0.419-0.916c0.158-0.302,0.315-0.601,0.477-0.886c0.169-0.299,0.384-0.562,0.556-0.842 c0.182-0.291,0.313-0.606,0.499-0.877c0.195-0.284,0.38-0.566,0.578-0.827c0.206-0.274,0.473-0.489,0.684-0.742 c0.221-0.263,0.426-0.525,0.649-0.764c0.235-0.25,0.436-0.525,0.671-0.749c0.248-0.237,0.525-0.432,0.775-0.642 c0.263-0.222,0.541-0.406,0.805-0.599c0.278-0.204,0.538-0.41,0.814-0.584c0.291-0.185,0.562-0.386,0.849-0.538 c0.304-0.163,0.617-0.287,0.912-0.417c0.319-0.139,0.642-0.228,0.946-0.334c0.328-0.117,0.649-0.213,0.959-0.297 c0.339-0.087,0.656-0.195,0.968-0.25c0.352-0.061,0.686-0.065,0.996-0.093c0.369-0.035,0.699-0.111,0.992-0.111 c0.165,0,0.328,0.015,0.491,0.022c0.352,0.015,0.705,0.074,1.053,0.156c0.696,0.154,1.362,0.42,1.971,0.79 c0.3,0.182,0.606,0.371,0.886,0.597c0.273,0.222,0.519,0.484,0.764,0.747c0.241,0.256,0.486,0.519,0.695,0.812 c0.191,0.265,0.343,0.56,0.504,0.849c0.159,0.286,0.317,0.575,0.447,0.881c0.13,0.299,0.26,0.603,0.362,0.921 c0.098,0.31,0.113,0.645,0.185,0.972c0.07,0.317,0.197,0.629,0.241,0.96c0.043,0.321,0.05,0.653,0.069,0.986 c0.019,0.324,0.022,0.653,0.019,0.986c-0.004,0.324,0,0.654-0.024,0.988c-0.024,0.324-0.087,0.649-0.132,0.983 c-0.043,0.321-0.065,0.651-0.126,0.979c-0.059,0.319-0.108,0.649-0.185,0.975c-0.074,0.315-0.208,0.623-0.299,0.946 c-0.095,0.33-0.228,0.649-0.343,0.975c-0.115,0.326-0.182,0.669-0.315,0.99c-0.132,0.317-0.315,0.614-0.464,0.927 c-0.152,0.31-0.297,0.621-0.464,0.925c-0.167,0.302-0.299,0.627-0.48,0.92c-0.183,0.293-0.374,0.582-0.571,0.866 c-0.197,0.286-0.438,0.538-0.647,0.812c-0.208,0.274-0.38,0.582-0.601,0.845c-0.222,0.265-0.471,0.51-0.705,0.762 c-0.235,0.256-0.467,0.512-0.714,0.753c-0.248,0.241-0.53,0.445-0.788,0.673c-0.26,0.23-0.497,0.486-0.764,0.699 c-0.274,0.215-0.567,0.4-0.845,0.597c-0.286,0.202-0.588,0.369-0.879,0.549c-0.297,0.182-0.575,0.389-0.875,0.549 c-0.31,0.163-0.629,0.3-0.94,0.436c-0.63,0.279-1.286,0.496-1.958,0.649c-0.334,0.086-0.671,0.154-1.012,0.204 C63.385,116.017,63.042,115.993,62.7,115.993 M88.461,116.048c-0.36,0-0.719,0.056-1.07,0.011 c-0.354-0.051-0.704-0.123-1.049-0.217c-0.347-0.087-0.677-0.226-1.007-0.356c-0.331-0.13-0.654-0.281-0.966-0.452 c-0.313-0.172-0.627-0.339-0.916-0.551c-0.286-0.211-0.527-0.478-0.786-0.725c-0.49-0.471-0.924-0.997-1.294-1.567 c-0.17-0.276-0.324-0.562-0.464-0.855c-0.145-0.289-0.334-0.562-0.451-0.87c-0.111-0.3-0.174-0.625-0.26-0.942 c-0.085-0.31-0.208-0.617-0.267-0.942c-0.057-0.321-0.102-0.645-0.133-0.97c-0.033-0.319-0.032-0.649-0.043-0.979 c-0.007-0.319,0.019-0.645,0.032-0.977c0.013-0.321,0.024-0.645,0.056-0.973c0.033-0.321,0.102-0.64,0.154-0.968 c0.05-0.317,0.065-0.647,0.133-0.97c0.072-0.341,0.13-0.684,0.215-1.016c0.085-0.337,0.219-0.66,0.317-0.988 c0.1-0.334,0.174-0.675,0.287-0.999c0.111-0.328,0.289-0.632,0.415-0.951c0.128-0.324,0.235-0.653,0.376-0.966 c0.141-0.315,0.287-0.63,0.443-0.938c0.156-0.31,0.363-0.59,0.532-0.888c0.171-0.302,0.297-0.63,0.478-0.92 c0.185-0.293,0.371-0.588,0.567-0.868c0.2-0.284,0.465-0.515,0.679-0.784c0.215-0.274,0.421-0.549,0.649-0.807 c0.228-0.26,0.426-0.547,0.667-0.792c0.245-0.247,0.519-0.458,0.775-0.686c0.26-0.234,0.538-0.434,0.808-0.647 c0.271-0.215,0.53-0.439,0.812-0.634c0.286-0.198,0.554-0.417,0.849-0.593c0.297-0.178,0.612-0.321,0.918-0.477 c0.31-0.156,0.636-0.265,0.951-0.399c0.319-0.132,0.64-0.252,0.964-0.36c0.328-0.109,0.647-0.241,0.981-0.323 c0.334-0.082,0.679-0.111,1.018-0.167c0.339-0.056,0.673-0.161,1.016-0.189c0.344-0.024,0.689-0.035,1.035-0.032 c0.076,0,0.076,0.011,0.154,0.013c0.73-0.001,1.455,0.12,2.145,0.358c0.349,0.119,0.692,0.25,1.007,0.426 c0.319,0.178,0.61,0.408,0.89,0.638c0.282,0.23,0.558,0.471,0.797,0.751c0.234,0.273,0.423,0.588,0.612,0.907 c0.363,0.59,0.632,1.233,0.797,1.906c0.076,0.336,0.057,0.688,0.083,1.035c0.024,0.341,0.095,0.686,0.07,1.033 c-0.034,0.345-0.093,0.687-0.174,1.023c-0.072,0.334-0.172,0.664-0.293,0.992c-0.112,0.328-0.244,0.648-0.397,0.959 c-0.178,0.33-0.387,0.643-0.623,0.934c-0.256,0.33-0.499,0.625-0.788,0.794c-0.534,0.31-1.064,0.306-1.064,0.306 c-0.289-0.012-0.571-0.092-0.823-0.234c-0.248-0.122-0.517-0.248-0.731-0.469c-0.193-0.2-0.33-0.464-0.477-0.732 c-0.145-0.255-0.255-0.528-0.326-0.812c-0.069-0.3-0.137-0.597-0.106-0.877c0.034-0.298,0.136-0.585,0.297-0.838 c0.228-0.356,0.402-0.712,0.438-1.083c0.035-0.395-0.095-0.768-0.287-1.122c-0.195-0.373-0.499-0.677-0.871-0.871 c-0.378-0.187-0.796-0.279-1.218-0.271c-0.26,0-0.593-0.009-0.983,0.1c-0.278,0.08-0.567,0.239-0.899,0.415 c-0.263,0.141-0.556,0.293-0.847,0.515c-0.241,0.185-0.512,0.382-0.769,0.634c-0.219,0.215-0.413,0.488-0.642,0.76 c-0.2,0.241-0.415,0.493-0.621,0.779c-0.201,0.282-0.392,0.57-0.575,0.864c-0.185,0.295-0.369,0.588-0.536,0.89 c-0.167,0.306-0.308,0.623-0.456,0.934c-0.149,0.313-0.288,0.63-0.419,0.951c-0.132,0.321-0.26,0.643-0.373,0.97 c-0.115,0.328-0.245,0.653-0.339,0.983c-0.096,0.337-0.158,0.679-0.232,1.014c-0.076,0.343-0.122,0.686-0.176,1.023 c-0.054,0.349-0.074,0.695-0.102,1.035c-0.026,0.344-0.037,0.689-0.033,1.035c0,0.356-0.02,0.701,0.013,1.038 c0.037,0.352,0.056,0.705,0.13,1.029c0.078,0.349,0.217,0.671,0.339,0.983c0.133,0.334,0.306,0.63,0.486,0.909 c0.195,0.297,0.382,0.59,0.63,0.816c0.256,0.235,0.538,0.449,0.845,0.601c0.3,0.15,0.642,0.241,0.988,0.31 c0.33,0.065,0.667,0.074,0.994,0.074c0.349,0.006,0.698-0.023,1.042-0.087c0.345-0.074,0.664-0.222,0.983-0.352 c0.324-0.135,0.638-0.284,0.936-0.464c0.3-0.182,0.603-0.358,0.875-0.571c0.282-0.219,0.567-0.43,0.816-0.662 c0.267-0.247,0.471-0.541,0.701-0.784c0.26-0.273,0.488-0.541,0.699-0.775c0.951-1.053,1.201-1.094,1.144-0.117 c-0.015,0.25-0.056,0.551-0.145,0.888c-0.173,0.607-0.391,1.201-0.653,1.776c-0.124,0.278-0.282,0.571-0.451,0.884 c-0.152,0.276-0.286,0.586-0.477,0.877c-0.174,0.267-0.419,0.501-0.63,0.771c-0.203,0.261-0.417,0.513-0.643,0.755 c-0.222,0.246-0.457,0.481-0.703,0.705c-0.243,0.213-0.471,0.464-0.745,0.66c-0.265,0.189-0.571,0.326-0.866,0.495 c-0.282,0.163-0.551,0.363-0.862,0.502c-0.297,0.133-0.63,0.195-0.953,0.302c-0.306,0.102-0.617,0.219-0.949,0.297 c-0.343,0.078-0.692,0.102-1.038,0.143C89.156,116.033,88.809,116.051,88.461,116.048 M20.927,117.313 c-0.349,0-0.699,0.067-1.044,0.048c-0.349-0.019-0.695-0.067-1.038-0.106c-0.347-0.037-0.686-0.115-1.027-0.172 c-0.342-0.057-0.683-0.123-1.022-0.198c-0.343-0.078-0.686-0.139-1.014-0.235c-0.339-0.1-0.655-0.256-0.975-0.375 c-0.325-0.119-0.645-0.25-0.96-0.393c-0.315-0.143-0.623-0.299-0.923-0.469c-0.3-0.177-0.592-0.369-0.873-0.575 c-0.289-0.204-0.606-0.369-0.866-0.597c-0.267-0.232-0.489-0.504-0.725-0.76c-0.241-0.26-0.506-0.495-0.712-0.773 c-0.21-0.282-0.404-0.575-0.58-0.879c-0.178-0.306-0.319-0.63-0.458-0.949c-0.141-0.323-0.239-0.66-0.339-0.994 c-0.104-0.334-0.188-0.675-0.25-1.02c-0.059-0.345-0.069-0.695-0.083-1.046c-0.015-0.349-0.056-0.699-0.024-1.049 c0.03-0.349,0.061-0.701,0.135-1.046c0.074-0.339,0.208-0.667,0.326-1.001c0.121-0.345,0.232-0.686,0.391-0.986 c0.169-0.321,0.408-0.586,0.616-0.864c0.213-0.287,0.423-0.571,0.669-0.816c0.254-0.248,0.521-0.482,0.801-0.688 c0.286-0.213,0.608-0.36,0.912-0.532c0.31-0.174,0.599-0.384,0.92-0.519c0.324-0.14,0.654-0.265,0.99-0.373 c0.347-0.108,0.708-0.121,1.042-0.191c0.36-0.074,0.705-0.148,1.038-0.184c0.375-0.041,0.727-0.117,1.046-0.109 c1.092,0.024,0.927,0.36,0.384,0.606c-0.289,0.133-0.527,0.384-0.794,0.597c-0.248,0.2-0.467,0.449-0.705,0.695 c-0.221,0.23-0.454,0.464-0.653,0.738c-0.189,0.26-0.397,0.519-0.556,0.821c-0.157,0.294-0.294,0.597-0.412,0.909 c-0.111,0.297-0.174,0.625-0.258,0.959c-0.074,0.308-0.174,0.629-0.222,0.972c-0.048,0.371-0.009,0.742,0,1.103 c0.007,0.735,0.136,1.464,0.384,2.156c0.261,0.688,0.644,1.323,1.131,1.875c0.217,0.25,0.464,0.464,0.718,0.677 c0.252,0.213,0.504,0.423,0.784,0.595c0.28,0.172,0.582,0.304,0.886,0.434c0.3,0.13,0.601,0.267,0.921,0.354 c0.315,0.085,0.64,0.137,0.97,0.182c0.323,0.043,0.651,0.046,0.985,0.046c0.33,0,0.671,0.048,1.01,0.004 c0.326-0.041,0.643-0.176,0.975-0.26c0.319-0.083,0.645-0.165,0.964-0.289c0.314-0.121,0.621-0.259,0.92-0.413 c0.291-0.154,0.569-0.341,0.853-0.534c0.274-0.182,0.562-0.356,0.829-0.575c0.254-0.21,0.482-0.456,0.729-0.699 c0.234-0.23,0.445-0.488,0.671-0.749c0.213-0.248,0.462-0.482,0.666-0.76c0.195-0.263,0.412-0.525,0.597-0.816 c0.174-0.278,0.297-0.599,0.462-0.901c0.158-0.289,0.352-0.567,0.501-0.879c0.143-0.297,0.271-0.608,0.404-0.927 c0.126-0.302,0.204-0.634,0.321-0.957c0.111-0.31,0.23-0.625,0.334-0.953c0.1-0.315,0.241-0.625,0.334-0.957 c0.087-0.317,0.115-0.658,0.195-0.992c0.074-0.324,0.172-0.649,0.241-0.985c0.065-0.326,0.117-0.66,0.174-1.001 c0.059-0.341,0.152-0.686,0.191-1.042c0.039-0.347,0.026-0.705,0.048-1.061c0.02-0.35,0.061-0.703,0.067-1.061 c0.007-0.349,0.033-0.705,0.03-1.061c-0.006-0.352-0.059-0.705-0.074-1.061c-0.013-0.352-0.017-0.705-0.039-1.059 c-0.022-0.352-0.048-0.706-0.074-1.061c-0.028-0.352-0.048-0.706-0.08-1.059c-0.032-0.352-0.08-0.705-0.113-1.057l-0.104-1.057 c-0.033-0.334-0.061-0.669-0.093-1.001c-0.032-0.334-0.035-0.671-0.065-1.007c-0.03-0.334-0.082-0.667-0.111-1.001 c-0.026-0.334-0.067-0.667-0.089-1.001c-0.024-0.334-0.063-0.669-0.08-1.003c-0.017-0.337-0.039-0.673-0.046-1.007 c-0.011-0.337,0.024-0.673,0.024-1.007c0-0.339,0.041-0.673,0.05-1.005c0.011-0.339-0.011-0.675,0.013-1.007 c0.026-0.339,0.039-0.675,0.08-1.005c0.041-0.337,0.135-0.662,0.195-0.988c0.059-0.334,0.143-0.656,0.222-0.977 c0.083-0.328,0.152-0.656,0.256-0.972c0.108-0.321,0.204-0.642,0.337-0.946c0.132-0.31,0.3-0.601,0.464-0.894 c0.159-0.291,0.3-0.601,0.491-0.875c0.196-0.273,0.407-0.535,0.632-0.784c0.219-0.248,0.473-0.467,0.723-0.697 c0.247-0.222,0.515-0.413,0.779-0.614c0.261-0.202,0.499-0.441,0.779-0.617c0.278-0.178,0.562-0.352,0.855-0.506 c0.293-0.152,0.612-0.26,0.916-0.386c0.304-0.128,0.619-0.23,0.934-0.334c0.313-0.1,0.623-0.222,0.946-0.3 c0.319-0.074,0.649-0.124,0.977-0.176c0.324-0.05,0.655-0.078,0.985-0.102c0.328-0.024,0.658-0.024,0.992-0.024 c0.345,0,0.686-0.028,1.02-0.002c0.343,0.026,0.671,0.13,1.001,0.182c0.341,0.054,0.671,0.119,0.996,0.198 c0.336,0.082,0.664,0.161,0.979,0.271c0.326,0.111,0.66,0.191,0.962,0.332c0.315,0.145,0.591,0.352,0.871,0.525 c0.297,0.182,0.61,0.33,0.866,0.54c0.271,0.219,0.473,0.501,0.693,0.745c0.232,0.26,0.456,0.512,0.629,0.797 c0.176,0.297,0.289,0.612,0.397,0.931c0.108,0.323,0.248,0.64,0.278,0.981c0.026,0.289,0.015,0.586-0.039,0.864 c-0.056,0.278-0.158,0.556-0.289,0.814c-0.126,0.25-0.326,0.464-0.523,0.677c-0.222,0.247-0.477,0.462-0.76,0.63 c-0.28,0.18-0.584,0.32-0.903,0.417c-0.578,0.143-1.18,0.156-1.763,0.037c-0.25-0.052-0.486-0.171-0.731-0.269 c-0.488-0.195-0.697-0.399-0.777-0.667c-0.089-0.304-0.006-0.643,0.104-1.057c0.08-0.306,0.148-0.643,0.156-0.988 c-0.001-0.331-0.099-0.655-0.282-0.931c-0.164-0.291-0.388-0.542-0.658-0.738c-0.272-0.193-0.574-0.34-0.894-0.436 c-0.32-0.1-0.652-0.153-0.986-0.158c-0.321,0-0.649,0.056-0.964,0.135c-0.314,0.083-0.618,0.2-0.907,0.35 c-0.28,0.145-0.515,0.373-0.773,0.58c-0.247,0.198-0.514,0.384-0.731,0.634c-0.204,0.235-0.412,0.512-0.608,0.834 c-0.167,0.273-0.282,0.599-0.426,0.94c-0.13,0.297-0.286,0.604-0.389,0.957c-0.091,0.311-0.174,0.649-0.239,1.007 c-0.059,0.321-0.135,0.66-0.169,1.022c-0.03,0.345-0.046,0.69-0.05,1.036c-0.007,0.33,0.026,0.675,0.041,1.036 c0.015,0.33,0.032,0.675,0.067,1.033c0.033,0.334,0.098,0.673,0.148,1.027c0.048,0.324,0.113,0.651,0.167,0.985 c0.056,0.324,0.078,0.658,0.137,0.99c0.056,0.324,0.137,0.649,0.2,0.981c0.059,0.323,0.133,0.649,0.197,0.983 c0.061,0.321,0.087,0.653,0.148,0.979c0.061,0.323,0.167,0.64,0.226,0.968c0.057,0.323,0.05,0.66,0.104,0.986 c0.056,0.324,0.106,0.649,0.156,0.977c0.05,0.326,0.111,0.651,0.154,0.979c0.044,0.326,0.087,0.655,0.126,0.983 c0.037,0.328,0.078,0.658,0.108,0.988c0.03,0.328,0.037,0.66,0.056,0.99c0.022,0.33,0.082,0.66,0.093,0.992 c0.011,0.33,0.043,0.66,0.043,0.992c-0.002,0.33-0.039,0.662-0.052,0.994c-0.013,0.33-0.059,0.658-0.087,0.99 c-0.026,0.328-0.03,0.66-0.072,0.99c-0.041,0.328-0.067,0.66-0.124,0.986c-0.056,0.326-0.184,0.638-0.256,0.964 c-0.072,0.321-0.113,0.649-0.204,0.972c-0.089,0.326-0.193,0.645-0.293,0.962c-0.102,0.321-0.232,0.63-0.347,0.942 c-0.115,0.314-0.236,0.625-0.363,0.934c-0.13,0.313-0.237,0.63-0.378,0.931c-0.143,0.308-0.326,0.59-0.482,0.883 c-0.158,0.297-0.289,0.606-0.46,0.892c-0.171,0.289-0.375,0.556-0.56,0.834s-0.328,0.588-0.528,0.853 c-0.2,0.271-0.43,0.515-0.643,0.771c-0.215,0.258-0.402,0.538-0.63,0.784c-0.226,0.245-0.486,0.462-0.727,0.693 c-0.241,0.232-0.506,0.434-0.76,0.653c-0.252,0.219-0.493,0.449-0.758,0.656c-0.261,0.204-0.534,0.397-0.808,0.59 c-0.273,0.191-0.566,0.352-0.851,0.532c-0.28,0.176-0.562,0.356-0.855,0.523c-0.296,0.164-0.596,0.318-0.901,0.464 c-0.304,0.148-0.621,0.265-0.934,0.393c-0.311,0.13-0.614,0.28-0.934,0.389c-0.319,0.111-0.649,0.182-0.977,0.274 c-0.324,0.091-0.643,0.211-0.973,0.284c-0.33,0.074-0.667,0.108-1.001,0.161c-0.334,0.056-0.664,0.124-1.001,0.159 c-0.336,0.037-0.671,0.106-1.01,0.122c-0.336,0.019-0.677-0.015-1.016-0.015c-0.02-0.002,0-0.037,0-0.037 M127.403,121.824 c-0.367,0-0.734,0.063-1.098,0.037c-0.367-0.028-0.731-0.089-1.09-0.143c-0.363-0.056-0.718-0.154-1.072-0.235 c-0.356-0.081-0.71-0.176-1.059-0.284c-0.324-0.102-0.649-0.191-0.964-0.317c-0.311-0.13-0.595-0.315-0.896-0.467 c-0.603-0.302-1.182-0.649-1.732-1.038c-0.273-0.197-0.53-0.413-0.794-0.627c-0.26-0.213-0.558-0.384-0.807-0.614 c-0.245-0.23-0.458-0.497-0.692-0.742c-0.234-0.243-0.501-0.458-0.721-0.716c-0.221-0.257-0.434-0.519-0.642-0.786 c-0.204-0.267-0.389-0.553-0.586-0.829c-0.193-0.276-0.362-0.571-0.543-0.857c-0.18-0.286-0.367-0.567-0.538-0.86 c-0.169-0.291-0.308-0.601-0.467-0.899c-0.158-0.299-0.352-0.58-0.497-0.884c-0.148-0.304-0.306-0.604-0.443-0.914 c-0.135-0.311-0.226-0.64-0.35-0.955c-0.124-0.315-0.276-0.621-0.389-0.938c-0.111-0.321-0.163-0.662-0.263-0.983 c-0.104-0.323-0.226-0.64-0.315-0.964c-0.091-0.326-0.177-0.654-0.256-0.983c-0.078-0.334-0.122-1.239-0.271-1.539 c-0.167-0.334-0.21-0.417-0.584-0.041c-0.239,0.239-0.773,0.834-0.975,1.094c-0.21,0.265-0.445,0.504-0.643,0.768 c-0.204,0.267-0.425,0.519-0.617,0.786c-0.197,0.271-0.371,0.556-0.558,0.829c-0.189,0.276-0.345,0.575-0.527,0.849 c-0.184,0.278-0.384,0.545-0.56,0.827c-0.176,0.284-0.38,0.549-0.549,0.834c-0.167,0.287-0.334,0.577-0.495,0.87 c-0.159,0.287-0.286,0.599-0.441,0.894c-0.154,0.293-0.339,0.573-0.489,0.871c-0.148,0.297-0.237,0.623-0.382,0.927 c-0.141,0.297-0.393,0.929-0.553,1.227c-0.334,0.627-0.347,0.862-0.916,0.627c-0.271-0.111-0.784-0.564-0.973-0.832 c-0.18-0.281-0.316-0.587-0.404-0.909c-0.104-0.314-0.18-0.636-0.23-0.962c-0.043-0.308-0.037-0.642-0.048-0.99 c-0.007-0.315-0.019-0.649,0-0.992c0.017-0.317,0.026-0.649,0.065-0.988c0.037-0.319,0.154-0.636,0.21-0.972 c0.056-0.319,0.046-0.658,0.119-0.988c0.069-0.317,0.169-0.634,0.254-0.96c0.083-0.315,0.18-0.634,0.278-0.955 c0.096-0.313,0.18-0.636,0.291-0.951c0.113-0.324,0.26-0.636,0.373-0.959c0.115-0.324,0.202-0.656,0.317-0.979 c0.117-0.323,0.215-0.653,0.332-0.973c0.119-0.323,0.282-0.627,0.399-0.949c0.121-0.321,0.269-0.63,0.389-0.951 c0.119-0.323,0.184-0.666,0.304-0.985c0.121-0.321,0.286-0.625,0.408-0.944c0.122-0.321,0.234-0.645,0.358-0.964 c0.124-0.319,0.204-0.656,0.328-0.973c0.126-0.321,0.26-0.636,0.386-0.953c0.128-0.319,0.3-0.617,0.426-0.934 c0.13-0.319,0.206-0.658,0.334-0.972c0.13-0.319,0.284-0.627,0.413-0.94c0.132-0.319,0.254-0.638,0.386-0.951 c0.133-0.315,0.306-0.614,0.439-0.927c0.135-0.315,0.23-0.647,0.365-0.959c0.137-0.315,0.3-0.617,0.436-0.927 c0.139-0.317,0.3-0.619,0.439-0.927c0.141-0.315,0.243-0.645,0.384-0.953c0.143-0.315,0.299-0.621,0.441-0.927l0.434-0.929 c0.148-0.313,0.306-0.617,0.451-0.92c0.15-0.313,0.286-0.627,0.434-0.929c0.154-0.311,0.304-0.619,0.456-0.92 c0.156-0.31,0.315-0.612,0.469-0.909c0.161-0.31,0.345-0.599,0.501-0.894c0.165-0.308,0.308-0.617,0.467-0.909 c0.169-0.306,0.321-0.612,0.486-0.899c0.18-0.313,0.352-0.621,0.556-0.901c0.202-0.29,0.42-0.568,0.653-0.834 c0.237-0.267,0.514-0.491,0.769-0.725c0.263-0.241,0.556-0.438,0.834-0.645c0.286-0.213,0.554-0.443,0.849-0.623 c0.306-0.185,0.608-0.373,0.916-0.527c0.323-0.159,0.662-0.26,0.983-0.389c0.334-0.133,0.671-0.234,0.996-0.334 c0.349-0.111,0.68-0.226,1.007-0.304c0.363-0.087,0.705-0.178,1.027-0.234c0.386-0.065,0.74-0.109,1.046-0.119 c1.068-0.033,0.901,0.133,0.491,0.788c-0.156,0.247-0.371,0.515-0.582,0.851c-0.167,0.261-0.371,0.54-0.569,0.86 c-0.167,0.271-0.295,0.597-0.486,0.91c-0.167,0.278-0.337,0.577-0.523,0.888c-0.167,0.282-0.375,0.556-0.558,0.868 c-0.167,0.284-0.352,0.575-0.53,0.884c-0.167,0.286-0.306,0.601-0.482,0.909c-0.167,0.289-0.347,0.58-0.521,0.888 c-0.165,0.289-0.341,0.584-0.514,0.892c-0.163,0.293-0.343,0.586-0.514,0.894c-0.161,0.295-0.293,0.616-0.462,0.923 c-0.161,0.297-0.382,0.565-0.551,0.875l-0.489,0.909c-0.159,0.299-0.31,0.61-0.475,0.92c-0.159,0.299-0.274,0.629-0.439,0.938 c-0.158,0.299-0.363,0.58-0.527,0.89c-0.158,0.3-0.267,0.63-0.426,0.942c-0.158,0.3-0.371,0.577-0.532,0.888 c-0.156,0.3-0.289,0.619-0.447,0.931c-0.156,0.302-0.343,0.593-0.501,0.907c-0.156,0.304-0.247,0.643-0.404,0.957 c-0.154,0.304-0.321,0.608-0.464,0.927c-0.343,0.756-0.343,1.09-0.044,0.755c0.232-0.258,0.495-0.478,0.727-0.725 c0.235-0.252,0.467-0.502,0.705-0.743c0.241-0.247,0.478-0.495,0.721-0.729c0.248-0.241,0.484-0.486,0.734-0.712 c0.256-0.234,0.489-0.486,0.745-0.705c0.265-0.222,0.558-0.404,0.821-0.612c0.273-0.217,0.547-0.419,0.818-0.619 c0.278-0.204,0.567-0.389,0.845-0.578c0.287-0.193,0.567-0.388,0.853-0.564c0.29-0.179,0.585-0.35,0.884-0.514 c0.304-0.167,0.578-0.378,0.883-0.523c0.311-0.148,0.645-0.241,0.955-0.367c0.321-0.13,0.642-0.247,0.96-0.352 c0.326-0.111,0.64-0.254,0.964-0.337c0.336-0.085,0.679-0.115,1.009-0.174c0.341-0.059,0.677-0.1,1.012-0.13 c0.341-0.032,0.68-0.019,1.018-0.019c0.391,0,0.779-0.011,1.163,0.057c0.881,0.161,0.808,0.417,0.547,0.619 c-0.269,0.21-0.714,0.575-0.973,0.779c-0.269,0.211-0.523,0.432-0.782,0.638c-0.267,0.21-0.551,0.393-0.81,0.599 c-0.265,0.211-0.514,0.438-0.771,0.645c-0.265,0.211-0.519,0.43-0.775,0.638c-0.263,0.213-0.545,0.399-0.799,0.608 c-0.265,0.215-0.493,0.464-0.747,0.675c-0.263,0.215-0.564,0.378-0.816,0.59l-0.775,0.643c-0.258,0.219-0.506,0.445-0.756,0.658 l-0.76,0.656c-0.258,0.222-0.506,0.445-0.755,0.664c-0.254,0.224-0.519,0.432-0.764,0.653c-0.254,0.226-0.471,0.482-0.716,0.705 c-0.25,0.228-0.478,0.475-0.719,0.699c-0.25,0.232-0.514,0.438-0.753,0.664c-0.247,0.234-0.708,0.658-0.94,0.89 c-0.458,0.462-0.482,0.701-0.375,1.337c0.056,0.339,0.146,0.933,0.215,1.257c0.074,0.334,0.126,0.669,0.204,0.992 c0.082,0.334,0.165,0.662,0.252,0.983c0.089,0.33,0.211,0.647,0.308,0.964c0.1,0.328,0.167,0.662,0.274,0.973 c0.111,0.326,0.258,0.63,0.376,0.94c0.121,0.323,0.217,0.647,0.347,0.951c0.135,0.315,0.328,0.599,0.469,0.897 c0.148,0.31,0.271,0.625,0.426,0.916c0.159,0.306,0.363,0.577,0.53,0.862c0.174,0.297,0.324,0.599,0.506,0.875 c0.189,0.287,0.358,0.582,0.554,0.847c0.204,0.278,0.43,0.527,0.64,0.782c0.219,0.265,0.438,0.519,0.662,0.762 c0.234,0.25,0.452,0.508,0.692,0.736c0.25,0.235,0.508,0.452,0.762,0.664c0.263,0.219,0.525,0.432,0.79,0.627 c0.278,0.202,0.545,0.41,0.825,0.586c0.289,0.182,0.599,0.323,0.89,0.48c0.302,0.161,0.59,0.339,0.89,0.477 c0.311,0.141,0.638,0.234,0.946,0.35c0.321,0.121,0.63,0.256,0.946,0.352c0.328,0.1,0.662,0.163,0.983,0.241 c0.334,0.08,0.669,0.104,0.992,0.161c0.341,0.059,0.667,0.148,0.992,0.185c0.343,0.037,0.679,0.039,1.001,0.057 c0.349,0.019,0.682,0.067,1.003,0.067c0.334,0,0.656-0.024,0.966-0.039c0.337-0.019,0.658-0.074,0.962-0.104 c0.341-0.035,0.667-0.035,0.962-0.08c0.356-0.054,0.671-0.135,0.946-0.193c0.723-0.152,0.931-0.026,0.536,0.68 c-0.15,0.269-0.397,0.493-0.64,0.745c-0.217,0.224-0.428,0.478-0.701,0.693c-0.247,0.195-0.506,0.404-0.794,0.586 c-0.269,0.169-0.588,0.273-0.89,0.426c-0.282,0.148-0.566,0.317-0.875,0.449c-0.295,0.124-0.597,0.258-0.912,0.365 c-0.312,0.102-0.627,0.194-0.946,0.274c-0.317,0.088-0.637,0.166-0.959,0.234c-0.315,0.063-0.649,0.056-0.979,0.1 c-0.321,0.043-0.645,0.087-0.975,0.111c-0.326,0.02-0.653,0.02-0.983,0.02 M152.979,114.248c-0.388,0.07-0.74,0.211-1.087,0.274 c-0.393,0.074-0.762,0.122-1.096,0.185c-0.371,0.072-0.729,0.121-1.062,0.206c-0.369,0.093-0.716,0.197-1.038,0.304 c-0.365,0.121-0.692,0.276-1.001,0.412c-0.356,0.154-0.703,0.273-0.988,0.441c-0.313,0.183-0.609,0.394-0.884,0.63 c-0.278,0.236-0.518,0.513-0.71,0.823c-0.215,0.356-0.323,0.723-0.291,1.042c0.03,0.315,0.228,0.56,0.46,0.771 c0.204,0.182,0.452,0.354,0.781,0.443c0.265,0.07,0.573,0.056,0.907,0.056c0.287,0,0.595-0.006,0.921-0.063 c0.289-0.048,0.595-0.096,0.907-0.189c0.286-0.083,0.575-0.197,0.875-0.315c0.328-0.133,0.658-0.26,0.964-0.432 c0.308-0.169,0.578-0.399,0.866-0.608c0.278-0.206,0.534-0.445,0.794-0.688c0.252-0.237,0.523-0.46,0.756-0.734 c0.224-0.261,0.412-0.56,0.621-0.855c0.197-0.282,0.445-0.541,0.621-0.858c0.528-0.947,0.488-1.114-0.365-1.02 C153.448,114.126,153.453,114.161,152.979,114.248 M147.053,123.265c-0.475,0-0.957,0.05-1.43,0 c-0.319-0.038-0.634-0.097-0.946-0.176c-0.321-0.074-0.616-0.2-0.905-0.315c-0.296-0.118-0.581-0.26-0.853-0.426 c-0.278-0.159-0.54-0.345-0.781-0.556c-0.237-0.222-0.408-0.497-0.582-0.76c-0.359-0.528-0.581-1.136-0.647-1.771 c-0.029-0.344-0.016-0.69,0.039-1.031c0.048-0.328,0.067-0.679,0.193-1.022c0.113-0.31,0.299-0.608,0.482-0.925 c0.167-0.284,0.317-0.603,0.543-0.89c0.204-0.256,0.439-0.519,0.695-0.775c0.235-0.235,0.508-0.454,0.788-0.684 c0.256-0.211,0.547-0.4,0.845-0.606c0.274-0.191,0.558-0.389,0.87-0.575c0.287-0.169,0.603-0.315,0.921-0.478 c0.297-0.156,0.59-0.349,0.918-0.497c0.306-0.139,0.617-0.297,0.949-0.428c0.315-0.126,0.654-0.211,0.99-0.33 c0.319-0.115,0.638-0.26,0.979-0.367c0.308-0.096,0.634-0.137,0.946-0.235c0.308-0.093,0.608-0.217,0.923-0.313l0.931-0.284 c0.308-0.093,0.632-0.135,0.949-0.228c0.306-0.091,0.601-0.239,0.918-0.33c0.308-0.089,0.959-0.297,1.279-0.376 c0.556-0.139,0.488-0.158,0.751-0.753c0.135-0.304,0.315-0.76,0.4-1.064c0.093-0.323,0.213-0.629,0.306-0.927 c0.102-0.326,0.185-0.649,0.289-0.934c-0.022-0.111-0.091-0.132-0.202-0.1c-0.254,0.25-0.519,0.462-0.777,0.684 c-0.271,0.234-0.564,0.425-0.834,0.627c-0.277,0.209-0.563,0.407-0.857,0.593c-0.304,0.191-0.588,0.393-0.89,0.543 c-0.321,0.161-0.656,0.26-0.973,0.371c-0.339,0.117-0.656,0.267-0.986,0.33c-0.343,0.061-0.69,0.091-1.038,0.089 c-0.386,0-0.76-0.056-1.116-0.145c-0.734-0.173-1.412-0.533-1.967-1.044c-0.282-0.251-0.535-0.533-0.755-0.84 c-0.187-0.286-0.349-0.587-0.486-0.899c-0.15-0.306-0.278-0.623-0.382-0.947c-0.096-0.319-0.143-0.658-0.204-1.001 c-0.061-0.335-0.105-0.673-0.13-1.012c-0.02-0.334-0.045-0.675-0.037-1.023c0.011-0.334,0.102-0.667,0.139-1.012 c0.037-0.332,0.013-0.679,0.074-1.02c0.059-0.33,0.154-0.658,0.237-0.994c0.08-0.326,0.178-0.653,0.278-0.985 c0.102-0.321,0.195-0.649,0.315-0.975c0.121-0.319,0.278-0.63,0.413-0.949c0.133-0.315,0.248-0.643,0.399-0.957 c0.145-0.311,0.282-0.63,0.441-0.938c0.159-0.306,0.367-0.586,0.54-0.886c0.171-0.3,0.373-0.58,0.556-0.873 c0.182-0.297,0.317-0.617,0.51-0.903c0.193-0.289,0.43-0.545,0.632-0.823c0.206-0.28,0.406-0.562,0.619-0.829 c0.219-0.273,0.402-0.571,0.629-0.827c0.23-0.263,0.471-0.514,0.708-0.758c0.243-0.25,0.525-0.456,0.775-0.686 c0.26-0.239,0.484-0.508,0.747-0.719c0.276-0.221,0.569-0.408,0.847-0.597c0.284-0.197,0.578-0.38,0.881-0.547 c0.311-0.169,0.643-0.276,0.955-0.395c0.332-0.13,0.649-0.269,0.977-0.337c0.345-0.07,0.692-0.082,1.029-0.082 c0.15,0,0.445,0.072,0.228,0.486c-0.137,0.26-0.551,0.988-0.725,1.324l-0.462,0.899c-0.145,0.286-0.308,0.582-0.464,0.897 c-0.146,0.293-0.282,0.604-0.436,0.916c-0.145,0.297-0.289,0.603-0.438,0.914c-0.145,0.299-0.293,0.603-0.438,0.912 c-0.143,0.304-0.31,0.599-0.451,0.909c-0.139,0.308-0.256,0.627-0.393,0.936c-0.135,0.31-0.254,0.627-0.386,0.936 c-0.132,0.315-0.245,0.636-0.371,0.946c-0.126,0.319-0.241,0.636-0.36,0.947c-0.122,0.323-0.274,0.627-0.384,0.936 c-0.121,0.349-0.26,0.671-0.352,0.992c-0.1,0.358-0.145,0.708-0.208,1.029c-0.072,0.371-0.102,0.719-0.122,1.04 c-0.026,0.389-0.059,0.738-0.011,1.048c0.063,0.389,0.176,0.731,0.358,0.988c0.168,0.224,0.392,0.4,0.649,0.51 c0.235,0.106,0.51,0.139,0.808,0.139c0.332,0,0.697-0.046,1.077-0.174c0.324-0.108,0.64-0.299,0.979-0.488 c0.306-0.171,0.617-0.36,0.923-0.588c0.284-0.213,0.584-0.426,0.857-0.684c0.263-0.247,0.543-0.501,0.784-0.782 c0.113-0.319,0.172-0.66,0.286-0.966c0.119-0.319,0.228-0.634,0.347-0.94c0.124-0.315,0.284-0.612,0.408-0.914 c0.128-0.315,0.267-0.616,0.397-0.916c0.135-0.311,0.237-0.63,0.371-0.927c0.143-0.31,0.297-0.604,0.438-0.897 c0.148-0.308,0.306-0.601,0.452-0.89c0.156-0.304,0.323-0.593,0.478-0.877c0.165-0.3,0.293-0.612,0.456-0.89 c0.174-0.297,0.402-0.549,0.575-0.821c0.184-0.293,0.363-0.571,0.545-0.836c0.195-0.286,0.373-0.564,0.565-0.82 c0.206-0.278,0.371-0.571,0.575-0.816c0.219-0.269,0.477-0.486,0.693-0.719c0.235-0.256,0.426-0.532,0.656-0.751 c0.254-0.241,0.545-0.413,0.79-0.612c0.273-0.222,0.521-0.443,0.781-0.617c0.293-0.198,0.593-0.336,0.868-0.48 c0.317-0.167,0.591-0.367,0.877-0.473c0.313-0.116,0.635-0.208,0.962-0.274c0.376-0.074,0.716-0.072,0.99-0.093 c0.797-0.059,0.781,0.213,0.63,0.527c-0.15,0.315-0.508,1.187-0.654,1.502c-0.148,0.319-0.308,0.629-0.452,0.944 c-0.148,0.319-0.297,0.634-0.438,0.949c-0.145,0.319-0.33,0.619-0.469,0.934c-0.143,0.321-0.278,0.642-0.415,0.959 c-0.141,0.321-0.269,0.645-0.404,0.964c-0.137,0.321-0.256,0.649-0.389,0.968c-0.137,0.324-0.241,0.662-0.371,0.983 c-0.135,0.324-0.31,0.63-0.441,0.949c-0.13,0.326-0.267,0.649-0.397,0.97c-0.13,0.324-0.271,0.643-0.399,0.964 c-0.126,0.326-0.241,0.654-0.367,0.975l-0.371,0.975c-0.126,0.328-0.189,0.677-0.313,1.001c-0.122,0.328-0.293,0.634-0.413,0.959 c-0.122,0.326-0.247,0.651-0.365,0.975c-0.122,0.328-0.197,0.671-0.315,0.996c-0.121,0.328-0.28,0.638-0.399,0.96 c-0.119,0.328-0.241,0.651-0.36,0.973c-0.104,0.287-0.235,0.56-0.337,0.842c-0.106,0.287-0.204,0.575-0.306,0.857 c-0.106,0.286-0.278,0.877-0.371,1.163c-0.167,0.512-0.082,0.731,0.627,0.543c0.334-0.089,0.953-0.31,1.283-0.4 c0.334-0.093,0.664-0.2,0.992-0.293c0.336-0.096,0.677-0.159,1.005-0.254c0.334-0.098,0.651-0.241,0.979-0.339 c0.334-0.102,0.682-0.137,1.009-0.239c0.334-0.102,0.664-0.204,0.988-0.31c0.334-0.106,0.656-0.226,0.979-0.334 c0.653-0.222,1.302-0.457,1.947-0.703c0.326-0.124,0.656-0.232,0.97-0.358c0.324-0.13,0.627-0.306,0.938-0.441 c0.321-0.141,0.623-0.308,0.931-0.452c0.315-0.15,0.64-0.276,0.94-0.432c0.311-0.163,0.627-0.306,0.92-0.475 c0.304-0.176,0.584-0.38,0.868-0.565c0.295-0.189,0.564-0.404,0.836-0.604c0.282-0.208,0.593-0.371,0.851-0.591 c0.265-0.228,0.493-0.491,0.732-0.732c0.245-0.242,0.478-0.496,0.699-0.76c0.223-0.267,0.447-0.53,0.638-0.816 c0.191-0.286,0.371-0.582,0.532-0.888c0.158-0.302,0.402-0.269,0.395,0.067c-0.009,0.345,0,0.686-0.043,1.02 c-0.044,0.339-0.137,0.666-0.217,0.996c-0.078,0.33-0.117,0.673-0.232,0.996c-0.115,0.317-0.273,0.621-0.421,0.931 c-0.145,0.302-0.269,0.625-0.445,0.92c-0.174,0.287-0.391,0.554-0.597,0.834c-0.198,0.267-0.432,0.514-0.658,0.777 c-0.219,0.252-0.432,0.519-0.677,0.764c-0.241,0.24-0.49,0.472-0.745,0.695c-0.248,0.222-0.527,0.419-0.797,0.634 c-0.261,0.204-0.527,0.417-0.808,0.619c-0.271,0.193-0.556,0.376-0.845,0.566c-0.28,0.182-0.578,0.339-0.875,0.517 c-0.287,0.171-0.564,0.369-0.866,0.536c-0.291,0.159-0.604,0.289-0.912,0.447c-0.297,0.152-0.584,0.337-0.896,0.486 c-0.302,0.143-0.623,0.258-0.936,0.397c-0.308,0.135-0.608,0.293-0.927,0.425c-0.308,0.13-0.608,0.295-0.929,0.421 c-0.311,0.121-0.645,0.204-0.968,0.321c-0.315,0.117-0.627,0.256-0.951,0.371c-0.317,0.109-0.653,0.18-0.979,0.289 c-0.319,0.104-0.638,0.222-0.964,0.324c-0.323,0.1-0.638,0.23-0.968,0.328c-0.321,0.095-0.658,0.148-0.99,0.241 c-0.323,0.093-0.645,0.206-0.977,0.297c-0.324,0.087-0.653,0.18-0.986,0.267c-0.428,0.111-0.855,0.228-1.279,0.352 c-0.66,0.198-0.853,0.26-1.083,0.877c-0.146,0.395-0.545,1.17-0.716,1.52c-0.148,0.304-0.297,0.617-0.473,0.921 c-0.178,0.296-0.366,0.585-0.564,0.868c-0.193,0.278-0.389,0.564-0.606,0.838c-0.211,0.267-0.48,0.491-0.712,0.749 c-0.228,0.254-0.456,0.51-0.705,0.753c-0.245,0.237-0.452,0.523-0.716,0.749c-0.26,0.222-0.567,0.389-0.845,0.597 c-0.549,0.415-1.125,0.793-1.724,1.131c-0.3,0.167-0.616,0.302-0.931,0.449c-0.312,0.144-0.628,0.276-0.949,0.397 c-0.319,0.124-0.625,0.287-0.957,0.389c-0.328,0.098-0.658,0.204-0.998,0.278c-0.334,0.076-0.675,0.126-1.02,0.178 c-0.336,0.05-0.684,0.033-1.031,0.057C147.743,123.254,147.402,123.265,147.053,123.265\"/>\n</svg>\n", "pond5": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M163.014,12v83.103H73.211V12H163.014 M166.82,8.194h-3.806H73.211h-3.806V12v83.103v3.806h3.806 h89.803h3.806v-3.806V12V8.194L166.82,8.194z\" fill=\"#1687f9\"/>\n  <path d=\"M69.393,98.931v81.263h-40.6V98.931H69.393 M73.199,95.125H24.986V184h48.213V95.125 L73.199,95.125z\" fill=\"#1687f9\"/>\n</svg>\n", "pixta": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <polygon points=\"154.3,83.9 154.3,115.8 126.8,136.7 126.8,159.8 174.1,126.8 174.1,70.7\" fill=\"#000000\"/>\n  <polygon points=\"33.3,64.1 104.8,15.7 83.9,8 11.3,55.3 11.3,146.6 33.3,154.3\" fill=\"#9fc44f\"/>\n  <polygon points=\"70.7,78.4 142.2,30 119.1,21.2 47.6,70.7 47.6,159.8 70.7,169.7\" fill=\"#000000\"/>\n  <polygon points=\"156.5,34.4 86.1,85 86.1,175.2 109.2,184 109.2,93.8 180.7,43.2\" fill=\"#000000\"/>\n</svg>\n", "ikea": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M8,60.8v70.4h176V60.8H8z\" fill=\"#0058a3\"/>\n  <path d=\"M11.41,96.66c0,17.05,35.42,31.24,84.48,31.24s84.48-14.19,84.48-31.24S145.06,65.42,96,65.42 S11.41,79.61,11.41,96.66z\" fill=\"#ffdb00\"/>\n  <path d=\"M141.32,108.87h-13.09c0.55-0.66,0.99-1.43,1.21-2.2l7.81-21.34v-0.11 c0.33-0.66,0.44-1.43,0.44-2.2h22.11c-0.11,0.66,0,1.21,0.33,1.76c0,0.11,0.11,0.22,0.11,0.44c0.66,1.54,7.7,19.69,8.25,21.34 c0.22,0.77,0.66,1.54,1.21,2.2h-16.5c0-0.77-0.11-1.54-0.55-2.2c0,0-0.22-0.66-0.66-1.43l-0.11-0.33h-9.57l-0.11,0.44 c0,0-0.33,0.77-0.55,1.43l-0.11,0.22C141.43,107.44,141.32,108.21,141.32,108.87z M147.04,91.71c-0.11,0.55-0.22,1.1-0.44,1.65 c0,0.11-0.33,0.88-0.66,1.98c-0.44,1.1-0.88,2.53-1.43,4.07h5.5l-2.31-5.94C147.37,92.81,147.15,92.26,147.04,91.71z M67.51,108.87H51.67c0.33-0.66,0.44-1.43,0.33-2.2V85.33c0.11-0.77-0.11-1.54-0.33-2.2h15.84c-0.33,0.66-0.44,1.43-0.33,2.2v9.35 c0,0,5.06-6.49,6.27-8.03c0.44-0.55,1.98-2.64,1.98-3.52h16.5c-1.32,0.99-2.42,2.09-3.41,3.3c-0.88,1.1-6.05,7.26-6.05,7.26 s7.59,11.33,8.58,12.98c0.55,0.77,1.21,1.54,1.87,2.2H73.78c-0.22-1.21-0.77-2.42-1.54-3.41c-0.77-1.1-4.73-7.04-5.17-7.7v9.02 C67.07,107.33,67.18,108.1,67.51,108.87z M126.25,108.87H95.56c0.33-0.66,0.44-1.43,0.33-2.2V85.33c0.11-0.77-0.11-1.54-0.33-2.2 h30.58v7.15c-0.66-0.33-1.43-0.44-2.2-0.33h-12.87v3.41h12.43v5.5h-12.43v3.41h12.87c0.77,0.11,1.54-0.11,2.2-0.33L126.25,108.87z M44.08,108.87H26.92c0.33-0.66,0.44-1.43,0.33-2.2V85.33c0.11-0.77-0.11-1.54-0.33-2.2h17.27c-0.33,0.66-0.44,1.43-0.33,2.2 v21.34C43.64,107.33,43.86,108.1,44.08,108.87z M166.73,88.63c-0.99,0-1.87-0.44-2.53-1.1c-0.66-0.66-0.99-1.54-0.88-2.42 c0-0.11,0-0.11,0-0.22c0-1.76,1.54-3.19,3.3-3.19h0.11h0.11c1.87,0,3.3,1.54,3.3,3.41v0.22c0,0.88-0.44,1.76-0.99,2.31 C168.49,88.19,167.61,88.63,166.73,88.63z M166.51,82.36c-0.66,0-1.32,0.33-1.87,0.88c-0.44,0.55-0.77,1.21-0.66,1.87v0.22 c0,1.43,1.21,2.64,2.75,2.64h0.11c0.77,0,1.43-0.33,1.98-0.88c0.55-0.55,0.77-1.21,0.77-1.98V85c0-1.43-1.21-2.64-2.75-2.64 H166.51z M166.07,87.09h-0.66v-4.07h1.54c0.77,0,1.32,0.55,1.32,1.32c0,0.55-0.33,0.99-0.77,1.21l0.88,1.54h-0.66l-0.77-1.43 h-0.88V87.09z M166.07,83.68v1.43h0.88c0.33,0,0.66-0.33,0.66-0.66c0-0.44-0.33-0.77-0.66-0.77H166.07z\" fill=\"#0058a3\"/>\n</svg>\n", "repostSleuth": "<img src=\"data:image/png;base64,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\" width=\"20\" height=\"20\" style=\"display:block;border-radius:3px;object-fit:contain;\"/>", "shein": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M184,169.986c0,7.74-6.274,14.014-14.014,14.014H22.014C14.274,184,8,177.726,8,169.986V22.014C8,14.274,14.274,8,22.014,8 h147.971C177.726,8,184,14.274,184,22.014V169.986z\"/>\n  <path d=\"M58.017,136.712c1.919-1.777,3.625-3.366,5.342-4.944c1.475-1.356,2.975-2.684,4.435-4.054 c0.769-0.722,1.451-0.877,2.416-0.233c6.502,4.339,13.646,6.929,21.441,7.658c6.114,0.572,12.106,0.45,17.681-2.709 c5.988-3.393,8.615-9.332,6.744-15.661c-0.74-2.503-2.26-4.471-4.288-6.072c-4.675-3.691-10.255-5.487-15.714-7.556 c-6.791-2.573-13.66-4.985-20.293-7.923c-5.58-2.472-10.131-6.425-13.297-11.78c-5.083-8.599-3.716-20.384,3.043-27.809 c5.709-6.271,12.927-9.703,21.099-10.853c11.368-1.6,22.633-0.88,33.377,3.626c3.03,1.271,5.861,3.013,9.154,4.732 c-1.3,1.182-2.214,2.005-3.12,2.838c-2.191,2.015-4.384,4.027-6.562,6.055c-0.804,0.749-1.536,0.978-2.566,0.263 c-6.348-4.406-13.559-6.043-21.129-6.074c-6.289-0.026-11.95,1.835-16.319,6.71c-4.604,5.137-4.227,13.348,1.194,17.633 c2.794,2.209,5.94,4.168,9.222,5.524c6.552,2.707,13.329,4.866,19.974,7.355c5.545,2.077,10.82,4.687,15.428,8.49 c5.175,4.271,7.843,9.778,8.561,16.435c1.302,12.072-6.497,20.539-15.368,25.083c-7.06,3.616-14.579,4.719-22.447,4.534 c-8.008-0.189-15.875-0.975-23.471-3.646C67.452,142.54,62.758,139.971,58.017,136.712z\" fill=\"#FFFFFF\"/>\n</svg>\n", "lykdat": "<svg fill=\"#080808\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M33.512,127.338h-5.658C16.934,127.338,8,118.37,8,107.409V39.053 c14.096,0,25.512,11.459,25.512,25.609V127.338z\"/>\n  <path d=\"M164.147,152.947h-5.658V64.662H184v68.356C184,144.078,175.066,152.947,164.147,152.947z\"/>\n  <path d=\"M8,107.409v-5.58h50.774c14.096,0,25.248,11.459,25.248,25.609H27.853 C16.934,127.338,8,118.47,8,107.409z\"/>\n  <path d=\"M83.98,127.338h87.95v5.679c0,10.961-2.634,19.929-13.554,19.929h-48.985 C95.396,152.947,83.98,141.488,83.98,127.338z\"/>\n  <path d=\"M58.731,39.053h105.415c10.919,0,19.853,8.968,19.853,19.929v5.679H84.243 C70.147,64.662,58.731,53.203,58.731,39.053z\"/>\n</svg>\n", "wildberries": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\r\n  <linearGradient id=\"sbi_e_wildberries_a\" gradientUnits=\"userSpaceOnUse\" x1=\"1582.8986\" y1=\"-265.1014\" x2=\"865.1014\" y2=\"-982.8986\" gradientTransform=\"matrix(0.25 0 0 -0.25 -210 -60)\">\r\n    <stop offset=\"0\" style=\"stop-color:#57019B\"/>\r\n    <stop offset=\"1\" style=\"stop-color:#E700C0\"/>\r\n  </linearGradient>\r\n  <path style=\"fill:url(#sbi_e_wildberries_a)\" d=\"M184,146.897C184,167.388,167.388,184,146.897,184H45.103C24.612,184,8,167.388,8,146.897 V45.103C8,24.612,24.612,8,45.103,8h101.794C167.388,8,184,24.612,184,45.103V146.897z\"/>\r\n  <g>\r\n    <polygon style=\"fill:#FFFFFF\" points=\"47.823,125.504 32.019,66.475 42.392,66.475 54.529,111.809 67.547,66.475 77.212,66.475 90.277,112.061 102.476,66.491 112.849,66.475 97.03,125.504 85.003,125.488 72.379,81.398 59.755,125.504\"/>\r\n    <path style=\"fill:#FFFFFF\" d=\"M142.283,116.406c4.568-0.199,8.11-4.064,7.911-8.633c-0.187-4.289-3.622-7.724-7.911-7.911 H126.7v16.544H142.283z M126.7,75.574v15.505h13.742c4.282-0.193,7.596-3.82,7.403-8.102c-0.181-4.011-3.392-7.222-7.403-7.403 H126.7z M159.976,108.63c0.111,4.581-1.78,8.984-5.179,12.058c-3.399,3.205-7.923,4.941-12.593,4.832h-25.186V66.491h23.423 c4.54-0.074,8.931,1.619,12.247,4.722c3.303,2.952,5.144,7.204,5.037,11.633c0.159,4.765-2.089,9.29-5.982,12.042 c5.149,2.619,8.347,7.951,8.233,13.726V108.63z\"/>\r\n  </g>\r\n</svg>\r\n", "lexica": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path style=\"fill:#313F6D\" d=\"M8,45.103C8,24.612,24.612,8,45.103,8h101.794C167.388,8,184,24.612,184,45.103v101.794 C184,167.388,167.388,184,146.897,184H45.103C24.612,184,8,167.388,8,146.897V45.103z\"/>\n  <path style=\"fill:#FFFFFF;opacity:0.75\" d=\"M86.869,152H64.243V40h22.626V152z M78.95,152v-8.145h48.808V152H78.95z\"/>\n</svg>\n", "kagi": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path fill=\"#ffb319\" d=\"M8,45.103C8,24.612,24.612,8,45.103,8h101.794C167.388,8,184,24.612,184,45.103v101.794 C184,167.388,167.388,184,146.897,184H45.103C24.612,184,8,167.388,8,146.897V45.103z\"/>\n  <path fill=\"#191919\" d=\"M110.361,136.972H80.81c-7.997,0-9.388-8.72-7.997-12.208c0.696-1.744,2.434-4.185,3.825-5.929 c5.563,3.139,12.169,4.883,19.122,4.883c22.251,0,39.983-18.137,39.983-40.111c0-11.859-5.215-22.322-13.212-29.996l1.044-1.046 c2.085-2.093,5.215-3.488,8.344-3.139l4.867,0.349V30.591h-8.344c-9.734,0-17.732,5.929-21.208,14.3 c-3.477-1.046-7.3-1.744-11.125-1.744c-22.251,0-39.983,18.137-39.983,40.111c0,8.72,2.782,17.091,7.649,23.718 c-0.696,0.698-1.738,1.395-2.434,1.744c-0.348,0.349-0.695,0.698-1.042,1.046c-7.997,7.673-11.821,17.439-9.736,28.601 c1.044,5.929,6.259,12.208,11.474,15.695c3.477,2.442,7.996,3.488,12.515,3.488l33.377-1.396c3.825,0,7.301,1.744,9.386,5.232 l4.173,8.022L142,162.433l-3.477-7.674C133.308,143.947,122.53,136.972,110.361,136.972z M96.108,64.424 c10.43,0,19.122,8.72,19.122,19.183s-8.692,19.183-19.122,19.183c-10.43,0-19.122-8.72-19.122-19.183 C76.985,72.794,85.329,64.424,96.108,64.424z\"/>\n</svg>\n", "freepik": "<svg fill=\"#336aea\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M74,178.504c0,3.032-2.464,5.496-5.504,5.496H13.504C10.464,184,8,181.536,8,178.496v-15.4 c0-3.032,2.464-5.496,5.504-5.496h55c3.032,0,5.496,2.464,5.496,5.504v15.392V178.504z M178.504,47.6 c3.032,0,5.496-2.464,5.496-5.504V13.512c0.004-3.04-2.456-5.508-5.496-5.512c-0.003,0-0.005,0-0.008,0H13.504 C10.464,8,8,10.464,8,13.504c0,0,0,0,0,0v120.992c0,3.04,2.464,5.504,5.504,5.504h55c3.032,0,5.496-2.464,5.496-5.504v-15.4 c0-3.032,2.464-5.496,5.504-5.496h98.992c3.04,0,5.504-2.464,5.504-5.504V79.504c-0.004-3.037-2.467-5.496-5.504-5.496H79.504 c-3.037-0.004-5.496-2.467-5.496-5.504v-15.4c0-3.032,2.464-5.496,5.504-5.496h98.992V47.6z\"/>\n</svg>\n", "icons8": "<svg fill=\"#1FB141\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M96,8H8v176h88V8z\"/>\n  <path d=\"M140,96c24.301,0,44-19.699,44-44S164.301,8,140,8S96,27.699,96,52S115.699,96,140,96z M140,184 c24.301,0,44-19.699,44-44s-19.699-44-44-44s-44,19.699-44,44S115.699,184,140,184z\"/>\n</svg>\n", "unsplash": "<svg fill=\"#000000\" width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M63,57.5V8h66v49.5H63z M129,85h55v99H8V85h55v49.5h66V85z\"/>\n</svg>\n", "vcg": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 192 192\" xmlns=\"http://www.w3.org/2000/svg\">\r\n  <path d=\"M123.414,118.292h-20.659 c-5.394,0-9.186-1.531-11.381-4.606c-2.195-3.075-3.298-8.364-3.298-15.874c0-8.652,1.147-14.874,3.442-18.66 c2.287-3.791,6.039-5.677,11.238-5.677h14.086c3.585,0,6.493-3.289,6.573-7.368v-4.318h-20.898c-9.624,0-16.727,2.878-21.312,8.635 c-4.581,5.757-6.872,14.685-6.872,26.789c0,6.234,0.765,11.593,2.295,16.079c1.542,4.481,3.832,8.121,6.896,10.912 c2.362,2.176,4.88,3.719,7.569,4.636c2.681,0.916,6.366,1.372,11.054,1.372h14.691c3.633,0,6.577-3.376,6.577-7.539V118.292z M43.804,130.23c1.972,0,3.669-1.318,4.47-3.222L72.08,61.77h-9.537c-2.203,0-4.091,1.41-5.099,3.473l-17.181,47.52L23.536,65.326 c-0.996-2.104-2.912-3.556-5.151-3.556H8l26.081,68.461H43.804z M184,122.676V96.313c0-3.535-2.39-6.401-5.41-6.682l-24.316-0.008 v12.1h16.835v16.108h-14.15c-4.96,0-8.569-1.678-10.819-5.029s-3.378-8.765-3.378-16.246c0-8.008,1.135-13.84,3.406-17.501 c2.259-3.657,5.856-5.489,10.792-5.489h20.774c3.49-0.192,6.266-3.477,6.266-7.518v-4.259h-27.041 c-9.596,0-16.695,2.883-21.292,8.661c-4.589,5.77-6.892,14.69-6.892,26.76c0,6.234,0.765,11.598,2.303,16.083 c1.534,4.489,3.824,8.121,6.892,10.912c2.326,2.138,4.832,3.678,7.501,4.606c2.669,0.937,6.493,1.402,11.489,1.402h20.46 C181.056,130.211,184,126.835,184,122.676\" style=\"fill:#df2422\"/>\r\n</svg>\r\n"};

  const MODE_ICONS = {
    select_url: `<svg fill="currentColor" height="18" width="18" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"> <path d="M42.462,164c-4.041,0-7.462-1.4-10.262-4.2c-2.8-2.8-4.2-6.221-4.2-10.262V42.462C28,38.421,29.4,35,32.2,32.2 C35,29.4,38.421,28,42.462,28h107.076c4.041,0,7.462,1.4,10.262,4.2s4.2,6.221,4.2,10.262v107.076c0,4.041-1.4,7.462-4.2,10.262 s-6.221,4.2-10.262,4.2C149.538,164,42.462,164,42.462,164z M42.462,152h107.076c0.615,0,1.18-0.256,1.693-0.769 c0.513-0.513,0.769-1.077,0.769-1.693V42.462c0-0.615-0.256-1.18-0.769-1.693c-0.513-0.513-1.077-0.769-1.693-0.769H42.462 c-0.615,0-1.18,0.256-1.693,0.769C40.256,41.282,40,41.846,40,42.462v107.076c0,0.615,0.256,1.18,0.769,1.693 C41.282,151.744,41.846,152,42.462,152z M40,40v112V40z"/> <path d="M80,118.5c-6.25,0-11.563-2.189-15.938-6.568c-4.375-4.378-6.562-9.695-6.562-15.95c0-6.255,2.187-11.566,6.562-15.932 C68.437,75.683,73.75,73.5,80,73.5h4c1.589,0,2.903,0.521,3.942,1.562c1.039,1.041,1.558,2.358,1.558,3.95 c0,1.592-0.519,2.905-1.558,3.938C86.903,83.983,85.589,84.5,84,84.5h-4c-3.194,0-5.91,1.119-8.146,3.356 c-2.236,2.237-3.354,4.954-3.354,8.15c0,3.196,1.118,5.911,3.354,8.144c2.236,2.233,4.951,3.35,8.146,3.35h4 c1.589,0,2.903,0.521,3.942,1.562c1.039,1.041,1.558,2.358,1.558,3.95c0,1.592-0.519,2.905-1.558,3.938 c-1.039,1.033-2.353,1.55-3.942,1.55H80z"/> <path d="M112,118.5h-4c-1.589,0-2.903-0.521-3.942-1.562c-1.039-1.041-1.558-2.358-1.558-3.95c0-1.592,0.519-2.905,1.558-3.938 c1.039-1.033,2.353-1.55,3.942-1.55h4c3.194,0,5.91-1.119,8.146-3.356c2.236-2.237,3.354-4.954,3.354-8.15 c0-3.196-1.118-5.911-3.354-8.144c-2.236-2.233-4.951-3.35-8.146-3.35h-4c-1.589,0-2.903-0.521-3.942-1.562 c-1.039-1.041-1.558-2.358-1.558-3.95c0-1.592,0.519-2.905,1.558-3.938c1.039-1.033,2.353-1.55,3.942-1.55h4 c6.25,0,11.563,2.189,15.938,6.568c4.375,4.378,6.562,9.695,6.562,15.95c0,6.255-2.187,11.566-6.562,15.932 C123.563,116.317,118.25,118.5,112,118.5z"/> <path d="M106,101.5H86c-1.589,0-2.903-0.521-3.942-1.562c-1.039-1.041-1.558-2.358-1.558-3.95c0-1.592,0.519-2.905,1.558-3.938 c1.039-1.033,2.353-1.55,3.942-1.55h20c1.589,0,2.903,0.521,3.942,1.562c1.039,1.041,1.558,2.358,1.558,3.95 c0,1.592-0.519,2.905-1.558,3.938C108.903,100.983,107.589,101.5,106,101.5z"/> </svg>`,
    select_image: `<svg fill="currentColor" height="18" width="18" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg"> <path d="M306.925 765.999h349.227q11.615 0 16.846-10.23 5.231-10.231-2-19.462l-94.999-126.614q-5.615-7.23-14.653-7.23-9.039 0-14.654 7.23l-97.461 127.076-65.153-83.614q-5.616-7.231-14.654-7.038-9.039.192-14.654 7.423l-62.306 82.767q-7.231 9.231-2 19.462 5.23 10.23 16.461 10.23Zm-94.616 150q-30.308 0-51.308-21t-21-51.308V308.309q0-30.308 21-51.308t51.308-21h535.382q30.308 0 51.308 21t21 51.308v535.382q0 30.308-21 51.308t-51.308 21H212.309Zm0-59.999h535.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463V308.309q0-4.616-3.846-8.463-3.847-3.846-8.463-3.846H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846ZM200 296V856 296Z"/> </svg>`,
    capture: `<svg fill="currentColor" height="18" width="18" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg"> <path d="M170.001 456q-12.769 0-21.384-8.615-8.616-8.615-8.616-21.384V308.309q0-30.308 21-51.308t51.308-21h117.692q12.769 0 21.384 8.616Q360 253.232 360 266.001t-8.615 21.384Q342.77 296 330.001 296H212.309q-5.385 0-8.847 3.462-3.462 3.462-3.462 8.847v117.692q0 12.769-8.615 21.384T170.001 456Zm42.308 459.999q-30.308 0-51.308-21t-21-51.308V725.999q0-12.769 8.616-21.384Q157.232 696 170.001 696t21.384 8.615Q200 713.23 200 725.999v117.692q0 5.385 3.462 8.847 3.462 3.462 8.847 3.462h117.692q12.769 0 21.384 8.615T360 885.999q0 12.769-8.615 21.384-8.615 8.616-21.384 8.616H212.309Zm417.69 0q-12.769 0-21.384-8.616Q600 898.768 600 885.999t8.615-21.384Q617.23 856 629.999 856h117.692q5.385 0 8.847-3.462 3.462-3.462 3.462-8.847V725.999q0-12.769 8.615-21.384T789.999 696q12.769 0 21.384 8.615 8.616 8.615 8.616 21.384v117.692q0 30.308-21 51.308t-51.308 21H629.999Zm160-459.999q-12.769 0-21.384-8.615T760 426.001V308.309q0-5.385-3.462-8.847-3.462-3.462-8.847-3.462H629.999q-12.769 0-21.384-8.615T600 266.001q0-12.769 8.615-21.384 8.615-8.616 21.384-8.616h117.692q30.308 0 51.308 21t21 51.308v117.692q0 12.769-8.616 21.384Q802.768 456 789.999 456Z"/> </svg>`,
    browse: `<svg fill="currentColor" height="18" width="18" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg"> <path d="M480 720.614q-12.769 0-21.384-8.615t-8.615-21.384V384.614l-76.923 76.923q-8.923 8.923-20.885 9.115-11.961.192-21.884-9.731-9.307-9.307-8.999-21.384.307-12.076 8.999-20.768l124.384-124.384q5.615-5.615 11.846-7.923 6.23-2.307 13.461-2.307t13.461 2.307q6.231 2.308 11.846 7.923l124.384 124.384q8.923 8.922 8.807 21.191-.115 12.269-8.807 20.961-9.308 9.308-21.384 9.616-12.077.307-21.385-9l-76.923-76.923v306.001q0 12.769-8.615 21.384T480 720.614ZM252.309 875.999q-30.308 0-51.308-21t-21-51.308v-77.692q0-12.769 8.616-21.384Q197.232 696 210.001 696t21.384 8.615Q240 713.23 240 725.999v77.692q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846h455.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-77.692q0-12.769 8.615-21.384T749.999 696q12.769 0 21.384 8.615 8.616 8.615 8.616 21.384v77.692q0 30.308-21 51.308t-51.308 21H252.309Z"/> </svg>`,
    url: `<svg fill="currentColor" height="18" width="18" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg"> <path d="M280 757.537q-75.338 0-128.438-53.093-53.1-53.093-53.1-128.422t53.1-128.444q53.1-53.115 128.438-53.115h122.308q12.75 0 21.374 8.629 8.625 8.628 8.625 21.384 0 12.755-8.625 21.37-8.624 8.615-21.374 8.615H280q-50.385 0-85.962 35.577-35.577 35.577-35.577 85.962 0 50.385 35.577 85.962 35.577 35.577 85.962 35.577h122.308q12.75 0 21.374 8.628 8.625 8.629 8.625 21.384 0 12.756-8.625 21.371-8.624 8.615-21.374 8.615H280Zm80-151.538q-12.75 0-21.374-8.628-8.625-8.629-8.625-21.384 0-12.756 8.625-21.371 8.624-8.615 21.374-8.615h240q12.75 0 21.375 8.628 8.624 8.629 8.624 21.384 0 12.756-8.624 21.371-8.625 8.615-21.375 8.615H360Zm197.692 151.538q-12.75 0-21.374-8.629-8.625-8.628-8.625-21.384 0-12.755 8.625-21.37 8.624-8.615 21.374-8.615H680q50.385 0 85.962-35.577 35.577-35.577 35.577-85.962 0-50.385-35.577-85.962-35.577-35.577-85.962-35.577H557.692q-12.75 0-21.374-8.628-8.625-8.629-8.625-21.384 0-12.756 8.625-21.371 8.624-8.615 21.374-8.615H680q75.338 0 128.438 53.093 53.099 53.093 53.099 128.422t-53.099 128.444q-53.1 53.115-128.438 53.115H557.692Z"/> </svg>`
  };

  // --- INTERNATIONALIZATION (Dual Language: English & Turkish) ---
  const I18N = {
    en: {
      appTitle: "Search by Image",
      dragToMove: "Search by Image — Drag to move",
      optionsTitle: "Search by Image — Settings",
      optionsBtn: "Settings",
      minimizeBtn: "Minimize / Expand",
      closeBtn: "Close Panel",
      saved: "✓ Saved",
      resetConfirm: "Reset all options and engine ordering to defaults?",
      resetDefaults: "Reset to Defaults",
      closeEsc: "Close (ESC)",

      // Modes
      modeSelectUrl: "Select URL",
      modeSelectImage: "Select image",
      modeCapture: "Capture (Crop Area)",
      modeBrowse: "Browse (Upload File)",
      modeUrl: "Enter Image URL",

      // Mode banners & hints
      allSearchEngines: "All search engines",
      clickImageToSearch: "Click any image on page to search directly (ESC to cancel)",
      urlInputPlaceholder: "Paste image URL here & press Enter...",
      browseBtn: "📁 Choose Image",
      pasteBtn: "📋 Paste from Clipboard",
      cropAgainBtn: "✂️ Crop Again",
      dragToCropBtn: "✂️ Drag to Crop Area",
      searchingEngine: "Searching with {name}...",
      searchingAll: "Searching across {count} engines ({focus})...",
      foreground: "Foreground",
      background: "Background",
      croppedSearching: "Cropped! Searching...",
      croppingFallback: "Cropping fallback: Searching full image...",
      couldNotCrop: "Could not crop selected element.",
      captureCancelled: "Capture cancelled.",
      selectionCancelled: "Selection cancelled.",
      uploadingImage: "Uploading image (Auto-Failover)...",
      uploadSuccess: "Image uploaded successfully!",
      uploadFail: "Image upload failed across all backup providers.",
      noValidUrl: "No valid image URL found.",
      pleaseEnterUrl: "Please enter an Image URL first.",
      modeUrlStatus: "Mode: URL Search — Enter image URL or click an engine below",
      modeBrowseStatus: "Mode: File Browse — Click an engine below to pick an image file",
      modeCaptureStatus: "Mode: Capture — Drag any box across the screen to crop (ESC to cancel)",
      areaTooSmall: "Area too small, crop cancelled.",

      // Options Modal Sections
      secEngines: "Search Engines",
      secEnginesDesc: "Toggle search engines and drag & drop to customize order",
      secGeneral: "General Settings",
      secShortcuts: "Shortcuts & Default Engine",
      secMisc: "Advanced Settings",

      // General Settings
      optLanguage: "Interface Language",
      optTabFocus: "Tab Opening Behavior",
      tabFocusBackground: "Open in background",
      tabFocusForeground: "Focus new tab immediately",
      optUploadProvider: "Search & Upload Mode",
      uploadProviderClipboard: "📋 Clipboard / Local Search (Ctrl+V)",
      uploadProviderImgur: "☁️ Imgur CDN",
      uploadProviderLitterbox: "🔒 Litterbox",
      clipboardCopiedNotice: "Image copied to clipboard! Opening search...",

      // Shortcuts & Default Engine
      optDefaultEngine: "Default Search Engine",
      optMenuShortcut: "Menu Panel Shortcut",
      optSelectionShortcut: "Image Selection Shortcut",
      shortcutDisabled: "Disabled",

      // Miscellaneous
      optTabInBackground: "Open new tabs in the background",
      optDeepSearch: "Use deep search when selecting images",
      optAltDimensions: "Detect alternative image sizes",
      optConvertShared: "Convert shared images (WebP/SVG/Data)",
      optViewer: "Always open images in the viewer",
      optConfirmPaste: "Confirm images from clipboard before search",
      optBypassBlocking: "Bypass image host blocking (Hotlinking)",
      optShowIcons: "Show search engine profile icons",
      optLocalGoogle: "Use local Google site (e.g. google.com.tr)",
      optYandexDomain: "Yandex Domain Host"
    },
    tr: {
      appTitle: "Search by Image",
      dragToMove: "Search by Image — Taşımak için sürükle",
      optionsTitle: "Search by Image — Ayarlar",
      optionsBtn: "Ayarlar",
      minimizeBtn: "Küçült / Genişlet",
      closeBtn: "Paneli Kapat",
      saved: "✓ Kaydedildi",
      resetConfirm: "Tüm ayarlar ve arama motoru sıralaması varsayılanlara sıfırlansın mı?",
      resetDefaults: "Varsayılanlara Sıfırla",
      closeEsc: "Kapat (ESC)",

      // Modes
      modeSelectUrl: "URL Seç",
      modeSelectImage: "Görsel Seç",
      modeCapture: "Alan Kırp (Capture)",
      modeBrowse: "Dosya Yükle",
      modeUrl: "Görsel URL Gir",

      // Mode banners & hints
      allSearchEngines: "Tüm arama motorları",
      clickImageToSearch: "Aramak için sayfadaki herhangi bir görsele tıklayın (İptal için ESC)",
      urlInputPlaceholder: "Görsel URL adresini buraya yapıştırıp Enter'a basın...",
      browseBtn: "📁 Görsel Seç",
      pasteBtn: "📋 Panodan Yapıştır",
      cropAgainBtn: "✂️ Tekrar Kırp",
      dragToCropBtn: "✂️ Kırpma Alanı Seç",
      searchingEngine: "{name} ile aranıyor...",
      searchingAll: "{count} motor üzerinde aranıyor ({focus})...",
      foreground: "Ön Plan",
      background: "Arka Plan",
      croppedSearching: "Kırpıldı! Aranıyor...",
      croppingFallback: "Kırpma yedeği: Tam görsel aranıyor...",
      couldNotCrop: "Seçilen alan kırpılamadı.",
      captureCancelled: "Kırpma iptal edildi.",
      selectionCancelled: "Seçim iptal edildi.",
      uploadingImage: "Görsel yükleniyor...",
      uploadSuccess: "Görsel başarıyla yüklendi!",
      uploadFail: "Görsel yüklenemedi.",
      noValidUrl: "Geçerli bir görsel URL adresi bulunamadı.",
      pleaseEnterUrl: "Lütfen önce bir görsel URL adresi girin.",
      modeUrlStatus: "Mod: URL Arama — Görsel URL'si girin veya alttaki motora tıklayın",
      modeBrowseStatus: "Mod: Dosya Yükleme — Alttaki bir motora tıklayarak dosya seçin",
      modeCaptureStatus: "Mod: Kırpma — Kırpmak için ekranda bir kutu sürükleyin (İptal için ESC)",
      areaTooSmall: "Alan çok küçük, kırpma iptal edildi.",

      // Options Modal Sections
      secEngines: "Arama Motorları",
      secEnginesDesc: "Arama motorlarını açıp kapatın ve sıralamayı sürükleyerek özelleştirin",
      secGeneral: "Genel Ayarlar",
      secShortcuts: "Kısayollar ve Varsayılan Motor",
      secMisc: "Gelişmiş Ayarlar",

      // General Settings
      optLanguage: "Arayüz Dili",
      optTabFocus: "Sekme Açılma Davranışı",
      tabFocusBackground: "Arka planda aç",
      tabFocusForeground: "Yeni sekmeye hemen odaklan",
      optUploadProvider: "Arama & Yükleme Modu",
      uploadProviderClipboard: "📋 Panoya Kopyala / Yerel Arama (Ctrl+V)",
      uploadProviderImgur: "☁️ Imgur CDN",
      uploadProviderLitterbox: "🔒 Litterbox",
      clipboardCopiedNotice: "Görsel panoya kopyalandı! Arama başlatılıyor...",

      // Shortcuts & Default Engine
      optDefaultEngine: "Varsayılan Arama Motoru",
      optMenuShortcut: "Menü Paneli Kısayolu",
      optSelectionShortcut: "Görsel Seçme Kısayolu",
      shortcutDisabled: "Devre Dışı",

      // Miscellaneous
      optTabInBackground: "Yeni sekmeleri arka planda aç",
      optDeepSearch: "Görsel seçerken derin tarama (Deep search) yap",
      optAltDimensions: "Alternatif görsel boyutlarını algıla",
      optConvertShared: "Paylaşılan görselleri dönüştür (WebP/SVG/Data)",
      optViewer: "Görselleri her zaman dahili görüntüleyicide aç",
      optConfirmPaste: "Panodan yapıştırılan görselleri aramadan önce onayla",
      optBypassBlocking: "Görsel sunucu engellerini (hotlink koruması) atla",
      optShowIcons: "Arama motoru resmi logolarını göster",
      optLocalGoogle: "Yerel Google sitesini kullan (.com.tr)",
      optYandexDomain: "Yandex Alan Adı"
    }
  };

  function t(key, params = {}) {
    const lang = currentOptions.lang === 'tr' ? 'tr' : 'en';
    let str = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    for (const p in params) {
      str = str.replace(new RegExp(`\{${p}\}`, 'g'), params[p]);
    }
    return str;
  }

  function getModeTitle(modeId) {
    switch (modeId) {
      case 'selectUrl':
      case 'Select URL':
        return t('modeSelectUrl');
      case 'selectImage':
      case 'Select image':
        return t('modeSelectImage');
      case 'capture':
      case 'Capture':
        return t('modeCapture');
      case 'browse':
      case 'Browse':
        return t('modeBrowse');
      case 'url':
      case 'URL':
        return t('modeUrl');
      default:
        return modeId;
    }
  }

  // --- DEFAULT OPTIONS ---
  const DEFAULT_OPTIONS = {
    lang: 'en',
    tabFocus: 'background',
    uploadProvider: 'clipboard', // Default is Clipboard (Ctrl+C / Ctrl+V Zero Upload)
    defaultEngine: 'googleLens',
    menuShortcut: 'alt_e',
    selectionShortcut: 'alt_w',
    enabledEngines: ['googleLens', 'lenso', 'bing', 'yandex', 'pinterest', 'tineye'],
    engineOrder: ALL_ENGINES.map(e => e.id),
    tabInBackgound: true,
    imgFullParse: false,
    detectAltImageDimension: false,
    convertSharedImage: true,
    viewImageUseViewer: true,
    confirmPaste: true,
    bypassImageHostBlocking: true,
    showEngineIcons: true,
    showContribPage: false,
    localGoogle: false,
    yandexHost: 'yandex.com'
  };

  let currentOptions = { ...DEFAULT_OPTIONS };

  function loadUserOptions() {
    const VALID_MENU_SHORTCUTS = ['alt_e', 'alt_q', 'alt_z', 'tilde', 'f4', 'f8'];
    const VALID_SEL_SHORTCUTS = ['alt_w', 'alt_a', 'alt_s', 'alt_c', 'alt_q', 'alt_e', 'none'];

    try {
      const saved = GM_getValue('sbi_options');
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
      console.warn('[Search by Image] Load options error:', e);
    }

    // Language and Tab Focus defaults
    if (currentOptions.lang !== 'tr') {
      currentOptions.lang = 'en';
    }
    if (currentOptions.tabFocus !== 'foreground') {
      currentOptions.tabFocus = 'background';
    }
    if (!['clipboard', 'imgur', 'litterbox'].includes(currentOptions.uploadProvider)) {
      currentOptions.uploadProvider = 'clipboard';
    }

    // Auto-migrate & sanitize legacy or conflicting shortcuts
    if (!VALID_MENU_SHORTCUTS.includes(currentOptions.menuShortcut)) {
      currentOptions.menuShortcut = 'alt_e';
    }
    if (!VALID_SEL_SHORTCUTS.includes(currentOptions.selectionShortcut)) {
      currentOptions.selectionShortcut = 'alt_w';
    }
    if (!currentOptions.defaultEngine) {
      currentOptions.defaultEngine = 'googleLens';
    }
    try {
      GM_setValue('sbi_options', currentOptions);
    } catch (_) {}
  }

  function saveUserOptions(newOpts) {
    currentOptions = { ...currentOptions, ...newOpts };
    GM_setValue('sbi_options', currentOptions);
    refreshPanelEngineList();
    flashSaveIndicator();
  }

  // --- SEARCH ENGINE DEFINITIONS & ACTIONS ---
  function resolveImageUrlForSearch(url, fileData, onResolved) {
    const isDataOrBlob = (url && (url.startsWith('data:') || url.startsWith('blob:'))) || !!fileData;
    const isClipboardMode = currentOptions.uploadProvider === 'clipboard';

    if (isDataOrBlob) {
      try {
        const raw = fileData || url;
        const blob = raw.startsWith('data:') ? dataUrlToBlob(raw) : (raw instanceof Blob ? raw : null);
        
        // In Clipboard mode: No 3rd-party upload, resolve directly with blob and null public URL
        if (isClipboardMode) {
          onResolved(null, blob);
          return;
        }

        // In Imgur / Litterbox mode: Attempt upload
        if (blob) {
          uploadToTempHost(blob, (pubUrl) => {
            onResolved(pubUrl, blob);
          }, () => {
            // Upload failed across all hosts: fallback to clipboard mode with blob
            onResolved(null, blob);
          });
          return;
        }
      } catch (err) {
        console.warn('[Search by Image] resolveImageUrlForSearch blob error:', err);
      }
    }

    // Normal public HTTP(S) URL
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))) {
      onResolved(toAbsoluteUrl(url), null);
    } else {
      onResolved(null, null);
    }
  }

  function openEngineLandingPage(engineId, autoUpload = true) {
    if (engineId === 'all') {
      const enginesToSearch = currentOptions.enabledEngines || ['googleLens', 'lenso', 'bing', 'yandex', 'pinterest', 'tineye'];
      enginesToSearch.forEach((key, i) => {
        setTimeout(() => {
          openEngineLandingPage(key, autoUpload);
        }, i * 220);
      });
      return;
    }

    const host = currentOptions.yandexHost || 'yandex.com';
    const hash = autoUpload ? '#sbi-upload' : '';
    const landingMap = {
      googleLens: currentOptions.localGoogle
        ? `https://www.google.com/imghp?hl=tr${hash}`
        : `https://lens.google.com/${hash}`,
      yandex: (currentOptions.localGoogle || currentOptions.lang === 'tr')
        ? `https://yandex.com.tr/gorsel/${hash}`
        : `https://${host}/images/${hash}`,
      bing: `https://www.bing.com/visualsearch${hash}`,
      lenso: 'https://lenso.ai/#sbi-search',
      pinterest: 'https://www.pinterest.com/',
      tineye: 'https://tineye.com/',
      whatanime: 'https://trace.moe/',
      saucenao: 'https://saucenao.com/',
      baidu: 'https://graph.baidu.com/',
      sogou: 'https://pic.sogou.com/'
    };

    const targetUrl = landingMap[engineId] || OFFICIAL_TARGETS[engineId] || `https://www.google.com/search?q=${encodeURIComponent(engineId)}`;
    openTab(targetUrl);
  }

  async function copyBlobToClipboard(blob) {
    try {
      if (!blob) return false;
      if (navigator.clipboard && window.ClipboardItem) {
        let finalBlob = blob;
        if (blob.type !== 'image/png') {
          finalBlob = await convertBlobToPng(blob);
        }
        const item = new ClipboardItem({ 'image/png': finalBlob });
        await navigator.clipboard.write([item]);
        return true;
      }
    } catch (err) {
      console.warn('[Search by Image] Clipboard write failed:', err);
    }
    return false;
  }

  function convertBlobToPng(blob) {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => resolve(b || blob), 'image/png');
          } catch (_) {
            resolve(blob);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(blob);
        };
        img.src = url;
      } catch (_) {
        resolve(blob);
      }
    });
  }

  function uploadDirectToGoogleLens(blob, onDone, onError) {
    showTopStatus(`🔍 ${currentOptions.lang === 'tr' ? 'Google Lens ile doğrudan aranıyor...' : 'Searching with Google Lens directly...'}`, 3500);

    const formData = new FormData();
    const filename = (blob.type && blob.type.includes('png')) ? 'image.png' : 'image.jpg';
    formData.append('encoded_image', blob, filename);

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://lens.google.com/v3/upload',
      data: formData,
      timeout: 15000,
      onload: function (res) {
        try {
          let targetUrl = res.finalUrl;
          if (!targetUrl || targetUrl.includes('lens.google.com/v3/upload')) {
            const match = res.responseHeaders && res.responseHeaders.match(/location:\s*([^\r\n]+)/i);
            if (match && match[1]) {
              targetUrl = match[1].trim();
            }
          }

          if (targetUrl && (targetUrl.includes('google.com/search') || targetUrl.includes('lens.google.com'))) {
            if (currentOptions.localGoogle && !targetUrl.includes('hl=')) {
              targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'hl=tr';
            }
            onDone(targetUrl);
            return;
          }

          if (res.status >= 200 && res.status < 400 && targetUrl && !targetUrl.includes('/v3/upload')) {
            onDone(targetUrl);
            return;
          }

          onError(new Error('Google Lens direct upload returned no redirect URL (Status: ' + res.status + ')'));
        } catch (e) {
          onError(e);
        }
      },
      ontimeout: function () {
        onError(new Error('Google Lens direct upload timed out'));
      },
      onerror: function (err) {
        onError(err);
      }
    });
  }

  const ENGINE_ACTIONS = {
    googleLens: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        const target = currentOptions.localGoogle ? 'https://www.google.com/imghp?hl=tr' : 'https://lens.google.com/';
        openTab(target);
        return;
      }
      const target = currentOptions.localGoogle
        ? `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}&hl=tr`
        : `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
      openTab(target);
    },
    lenso: async (url, fileData) => {
      await GM_setValue('sbi_lenso_target', fileData || url);
      await GM_setValue('sbi_lenso_time', Date.now());
      openTab('https://lenso.ai/#sbi-search');
    },
    yandex: async (url, fileData) => {
      const host = currentOptions.yandexHost || 'yandex.com';
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab(`https://${host}/images/`);
        return;
      }
      openTab(`https://${host}/images/search?rpt=imageview&url=${encodeURIComponent(url)}`);
    },
    pinterest: async (url, fileData) => {
      showTopStatus('🔍 Searching Pinterest Visual Matches...', 3500);
      try {
        let blob = null;
        if (fileData) {
          blob = dataUrlToBlob(fileData);
        } else if (url && url.startsWith('data:')) {
          blob = dataUrlToBlob(url);
        } else if (currentTarget?.element) {
          const dataUrl = await extractElementPixelData(currentTarget.element, url);
          if (dataUrl) blob = dataUrlToBlob(dataUrl);
        }

        if (!blob && url) {
          blob = await fetchBlobViaGM(url);
        }

        if (blob) {
          const formData = new FormData();
          formData.append('x', '0');
          formData.append('y', '0');
          formData.append('w', '1');
          formData.append('h', '1');
          formData.append('base_scheme', 'https');
          const filename = (blob.type && blob.type.includes('png')) ? 'image.png' : 'image.jpg';
          formData.append('image', blob, filename);

          GM_xmlhttpRequest({
            method: 'PUT',
            url: 'https://api.pinterest.com/v3/visual_search/extension/image/',
            data: formData,
            onload: (res) => {
              try {
                const json = JSON.parse(res.responseText);
                if (json.status === 'success' && json.data && json.data.length > 0) {
                  const realPins = json.data.filter(p => p.id && (p.image_large_url || p.image_medium_url));
                  if (realPins.length > 0) {
                    const bestTitle = realPins.find(p => p.title && p.title.trim())?.title ||
                                      realPins.find(p => p.description && p.description.trim())?.description || '';
                    openPinterestResultsPage(url || fileData || '', realPins, bestTitle);
                    showTopStatus(`✅ Found ${realPins.length} Pinterest visual matches (Background Tab)!`, 2500);
                    return;
                  }
                }
              } catch (e) {}
              fallbackPinterestSearch(url);
            },
            onerror: () => fallbackPinterestSearch(url)
          });
          return;
        }
        fallbackPinterestSearch(url);
      } catch (err) {
        console.error('[Search by Image] Pinterest error:', err);
        fallbackPinterestSearch(url);
      }
    },
    bing: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://www.bing.com/visualsearch');
        return;
      }
      openTab(`https://www.bing.com/images/search?q=imgurl:${encodeURIComponent(url)}&view=detailv2&iss=sbi&FORM=IRSBIQ&redirecturl=https%3A%2F%2Fwww.bing.com%2Fimages%2Fdiscover%3Fform%3DHDRSC2#enterInsights`);
    },
    tineye: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://tineye.com/');
        return;
      }
      openTab(`https://www.tineye.com/search/?&url=${encodeURIComponent(url)}`);
    },
    whatanime: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://trace.moe/');
        return;
      }
      openTab(`https://trace.moe/?url=${encodeURIComponent(url)}`);
    },
    saucenao: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://saucenao.com/');
        return;
      }
      openTab(`https://saucenao.com/search.php?url=${encodeURIComponent(url)}`);
    },
    baidu: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://graph.baidu.com/');
        return;
      }
      openTab(`https://graph.baidu.com/details?isfromvs=1&url=${encodeURIComponent(url)}`);
    },
    sogou: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://pic.sogou.com/');
        return;
      }
      openTab(`https://pic.sogou.com/ris?query=${encodeURIComponent(url)}&flag=1&drag=0`);
    },
    iqdb: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://iqdb.org/');
        return;
      }
      openTab(`https://iqdb.org/?url=${encodeURIComponent(url)}`);
    },
    ascii2d: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://ascii2d.net/');
        return;
      }
      openTab(`https://ascii2d.net/search/url/${encodeURIComponent(url)}`);
    },
    kagi: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://kagi.com/');
        return;
      }
      openTab(`https://kagi.com/images?q=${encodeURIComponent(url)}`);
    },
    lexica: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://lexica.art/');
        return;
      }
      openTab(`https://lexica.art/?q=${encodeURIComponent(url)}`);
    },
    unsplash: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://unsplash.com/');
        return;
      }
      openTab(`https://unsplash.com/s/photos/${encodeURIComponent(url)}`);
    },
    repostSleuth: async (url, fileData) => {
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        openTab('https://repostsleuth.com/');
        return;
      }
      openTab(`https://repostsleuth.com/search?url=${encodeURIComponent(url)}`);
    }
  };

  const OFFICIAL_TARGETS = {
    googleLens: 'https://lens.google.com',
    lenso: 'https://lenso.ai',
    bing: 'https://www.bing.com/visualsearch',
    yandex: 'https://yandex.com/images/',
    baidu: 'https://graph.baidu.com/',
    sogou: 'https://pic.sogou.com/',
    tineye: 'https://tineye.com',
    whatanime: 'https://trace.moe',
    saucenao: 'https://saucenao.com',
    iqdb: 'https://iqdb.org',
    ascii2d: 'https://ascii2d.net',
    getty: 'https://www.gettyimages.com/',
    istock: 'https://www.istockphoto.com/',
    shutterstock: 'https://www.shutterstock.com/',
    adobestock: 'https://stock.adobe.com/',
    depositphotos: 'https://depositphotos.com/',
    pinterest: 'https://www.pinterest.com/',
    qihoo: 'https://image.so.com/',
    taobao: 'https://s.taobao.com/',
    alibabaChina: 'https://www.1688.com/',
    dreamstime: 'https://www.dreamstime.com/',
    alamy: 'https://www.alamy.com/',
    '123rf': 'https://www.123rf.com/',
    esearch: 'https://euipo.europa.eu/eSearch/',
    tmview: 'https://www.tmdn.org/tmview/',
    branddb: 'https://branddb.wipo.int/',
    madridMonitor: 'https://www3.wipo.int/madrid/monitor/en/',
    auTrademark: 'https://search.ipaustralia.gov.au/trademarks/search/quick',
    auDesign: 'https://search.ipaustralia.gov.au/designs/search/quick',
    nzTrademark: 'https://app.iponz.govt.nz/app/TradeMarkCheck',
    jpDesign: 'https://www.graphic-image.inpit.go.jp/',
    pimeyes: 'https://pimeyes.com/en',
    stocksy: 'https://www.stocksy.com/',
    pond5: 'https://www.pond5.com/stock-images/',
    pixta: 'https://www.pixtastock.com/',
    ikea: 'https://www.ikea.com/',
    shein: 'https://m.shein.com/presearch',
    lykdat: 'https://lykdat.com/',
    wildberries: 'https://www.wildberries.ru/',
    vcg: 'https://vcg.com/'
  };

  function openTab(url) {
    if (!url) return;
    const isForeground = currentOptions.tabFocus === 'foreground' || currentOptions.tabInBackgound === false;
    try {
      if (typeof GM_openInTab === 'function') {
        GM_openInTab(url, { active: isForeground, insert: true });
        return;
      }
    } catch (e) {
      console.warn('[Search by Image] GM_openInTab error, falling back to window.open:', e);
    }
    const win = window.open(url, '_blank');
    if (win && !isForeground) {
      try { win.blur(); window.focus(); } catch (_) {}
    }
  }

  function executeGenericEngine(engineId, url, fileData) {
    const engineInfo = ALL_ENGINES.find(e => e.id === engineId);
    const engineName = engineInfo?.name || engineId;
    showTopStatus(`🔍 Searching with ${engineName}...`, 2000);

    if (ENGINE_ACTIONS[engineId]) {
      ENGINE_ACTIONS[engineId](url, fileData);
      return;
    }

    if (OFFICIAL_TARGETS[engineId]) {
      openTab(OFFICIAL_TARGETS[engineId]);
      return;
    }

    // Fallback for other niche engines
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      openTab(`https://www.google.com/search?q=site:${engineId}.com+${encodeURIComponent(url)}`);
    } else {
      openTab(`https://www.google.com/search?q=${encodeURIComponent(engineName)}`);
    }
  }

  // --- PINTEREST RESULTS FEED ---
  function openPinterestResultsPage(queryUrl, pins, queryTitle = '') {
    const cleanQuery = queryTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const pinsHtml = pins.map((p, idx) => {
      const pinUrl = `https://www.pinterest.com/pin/${p.id}/`;
      const img = p.image_large_url || p.image_medium_url || '';
      const title = (p.title || p.description || 'Pinterest Image').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const pinner = p.pinner?.username ? `@${p.pinner.username}` : (p.domain || '');
      return `
        <div class="pin-card" style="break-inside: avoid; margin-bottom: 16px; background: #242526; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <a href="${pinUrl}" target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: block;">
            <div style="position: relative; overflow: hidden; background: #18191a;">
              <img src="${img}" alt="${title}" loading="lazy" style="width: 100%; height: auto; display: block; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" />
            </div>
            <div style="padding: 12px;">
              <div style="font-size: 13.5px; font-weight: 600; color: #e4e6eb; line-height: 1.35; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: #b0b3b8;">
                <span>${pinner}</span>
                <span style="color: #e60023; font-weight: 600;">Open Pin ↗</span>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    const searchHref = cleanQuery ? `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(cleanQuery)}` : 'https://www.pinterest.com/';

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pinterest Visual Search Results (${pins.length} Matches)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #121212;
      color: #e4e6eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px 32px;
      min-height: 100vh;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 18px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: #f5f6f7;
    }
    .search-btn {
      background: #e60023;
      color: #ffffff;
      text-decoration: none;
      padding: 9px 18px;
      border-radius: 24px;
      font-size: 13.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
    }
    .search-btn:hover { background: #ad081b; }
    .masonry {
      column-count: 5;
      column-gap: 16px;
    }
    @media (max-width: 1400px) { .masonry { column-count: 4; } }
    @media (max-width: 1000px) { .masonry { column-count: 3; } }
    @media (max-width: 700px) { .masonry { column-count: 2; } }
    @media (max-width: 480px) { .masonry { column-count: 1; } }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#e60023"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.427 7.627 11.174-.105-.95-.2-2.408.042-3.443.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.03-.655 2.569-.994 3.996-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.333 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/></svg>
      <div>
        <div class="brand-title">Pinterest Visual Matches (${pins.length} found)</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Extracted with Advanced Search by Image Userscript</div>
      </div>
    </div>
    <a href="${searchHref}" target="_blank" rel="noopener" class="search-btn">
      <span>Search "${cleanQuery ? (cleanQuery.slice(0, 30) + '...') : 'Pinterest'}" on Pinterest ↗</span>
    </a>
  </div>
  <div class="masonry">
    ${pinsHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    openTab(blobUrl);
  }

  function fallbackPinterestSearch(url) {
    const contextText = currentTarget?.element?.getAttribute('alt') ||
                        currentTarget?.element?.getAttribute('title') ||
                        currentTarget?.element?.getAttribute('aria-label') ||
                        currentTarget?.element?.closest('[title]')?.getAttribute('title') || '';

    if (contextText && contextText.trim().length > 2 && !contextText.startsWith('http')) {
      showTopStatus(`🔍 Searching Pinterest for "${contextText.slice(0, 25)}..."`, 2500);
      openTab(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(contextText.trim())}`);
      return;
    }

    if (url && !url.startsWith('data:')) {
      showTopStatus('🔍 Searching Pinterest Visual Matches via Bing...', 2500);
      openTab(`https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=site:pinterest.com&imgurl=${encodeURIComponent(url)}`);
      return;
    }

    openTab('https://www.pinterest.com/');
  }

  // --- STATE VARIABLES ---
  let isSelectionMode = false;
  let isCaptureMode = false;
  let isCapturing = false;
  let captureStartX = 0;
  let captureStartY = 0;
  let selectionTargetType = 'url';
  let currentTarget = null;
  let currentMode = 'Select URL';
  let isMenuVisible = false;
  let isMinimized = false;
  let pendingEngine = null; // Target engine for immediate search after picking
  let isOptionsModalOpen = false;

  let overlayContainer = null;
  let shadowRoot = null;
  let highlightBox = null;
  let highlightBadge = null;
  let captureBox = null;
  let captureBadge = null;
  let topBanner = null;
  let menuCard = null;
  let optionsOverlay = null;

  // --- VIOLENTMONKEY MENU COMMANDS ---
  GM_registerMenuCommand('🔍 Search by Image (Alt+E)', toggleMenu);
  GM_registerMenuCommand('🎯 Select Image (Alt+W)', () => {
    const defEng = currentOptions.defaultEngine || 'googleLens';
    startSelectionMode(defEng, 'image');
  });
  GM_registerMenuCommand('⚙️ Options', openOptionsMenu);

  // --- SHORTCUTS ENGINE (Alt+E / Alt+Q: Menu Panel, Alt+W: Image Selection Mode) ---
  const handleGlobalKeyDown = (e) => {
    const keyLower = (e.key || '').toLowerCase();
    const code = e.code || '';
    const hasAlt = e.altKey; // Works with both Left Alt and Right Alt (AltGr)

    // 1. Menu Panel Toggle Shortcut (Strictly respects chosen user option!)
    const activeMenuShortcut = currentOptions.menuShortcut || 'alt_e';
    let matchMenu = false;
    if (activeMenuShortcut === 'alt_e' && hasAlt && (keyLower === 'e' || code === 'KeyE')) matchMenu = true;
    else if (activeMenuShortcut === 'alt_q' && hasAlt && (keyLower === 'q' || code === 'KeyQ')) matchMenu = true;
    else if (activeMenuShortcut === 'alt_z' && hasAlt && (keyLower === 'z' || code === 'KeyZ')) matchMenu = true;
    else if (activeMenuShortcut === 'tilde' && (e.key === '`' || e.key === '~' || code === 'Backquote')) matchMenu = true;
    else if (activeMenuShortcut === 'f4' && (e.key === 'F4' || code === 'F4')) matchMenu = true;
    else if (activeMenuShortcut === 'f8' && (e.key === 'F8' || code === 'F8')) matchMenu = true;

    if (matchMenu) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      toggleMenu();
      return;
    }

    // 2. Image Selection Mode Shortcut (Strictly respects chosen user option; old shortcut is disabled!)
    const activeSelShortcut = currentOptions.selectionShortcut || 'alt_w';
    let matchSel = false;
    if (activeSelShortcut === 'alt_w' && hasAlt && (keyLower === 'w' || code === 'KeyW')) matchSel = true;
    else if (activeSelShortcut === 'alt_a' && hasAlt && (keyLower === 'a' || code === 'KeyA')) matchSel = true;
    else if (activeSelShortcut === 'alt_s' && hasAlt && (keyLower === 's' || code === 'KeyS')) matchSel = true;
    else if (activeSelShortcut === 'alt_c' && hasAlt && (keyLower === 'c' || code === 'KeyC')) matchSel = true;
    else if (activeSelShortcut === 'alt_q' && hasAlt && (keyLower === 'q' || code === 'KeyQ')) matchSel = true;
    else if (activeSelShortcut === 'alt_e' && hasAlt && (keyLower === 'e' || code === 'KeyE')) matchSel = true;
    else if (activeSelShortcut === 'none') matchSel = false;

    if (matchSel) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      if (isSelectionMode) {
        stopSelectionMode();
      } else {
        const defEng = currentOptions.defaultEngine || 'googleLens';
        startSelectionMode(defEng, 'image');
      }
      return;
    }

    // 3. ESC cancels any active modal, menu, selection mode, or capture mode
    if (e.key === 'Escape' || code === 'Escape') {
      if (isOptionsModalOpen) closeOptionsMenu();
      if (isMenuVisible) closeMenu();
      if (isSelectionMode) stopSelectionMode();
      if (isCaptureMode) stopCaptureMode();
    }
  };

  // Single capture-phase listener on window is sufficient for all frames/shadow roots
  window.addEventListener('keydown', handleGlobalKeyDown, true);

  // Viewport resize containment
  window.addEventListener('resize', () => {
    clampMenuToViewport();
  });

  function toggleMenu() {
    ensureUI();
    if (menuCard && menuCard.style.display === 'block') {
      closeMenu();
    } else {
      openMenuPinned();
    }
  }

  // --- VIEWPORT CLAMPING FUNCTION ---
  function clampMenuToViewport() {
    if (!menuCard || !isMenuVisible || !menuCard.dataset.userDragged) return;

    const margin = 10;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const rect = menuCard.getBoundingClientRect();
    const w = rect.width || menuCard.offsetWidth || 258;
    const h = rect.height || menuCard.offsetHeight || 100;

    let curLeft = rect.left;
    let curTop = rect.top;

    if (curLeft + w > vw - margin) {
      curLeft = Math.max(margin, vw - w - margin);
    }
    if (curLeft < margin) {
      curLeft = margin;
    }
    if (curTop + h > vh - margin) {
      curTop = Math.max(margin, vh - h - margin);
    }
    if (curTop < margin) {
      curTop = margin;
    }

    menuCard.style.right = 'auto';
    menuCard.style.bottom = 'auto';
    menuCard.style.left = `${Math.round(curLeft)}px`;
    menuCard.style.top = `${Math.round(curTop)}px`;
  }

  // --- EVENT SUPPRESSION & UI CHECKS ---
  let suppressPageEventsUntil = 0;

  function isOurUIEvent(e) {
    if (!overlayContainer) return false;
    try {
      const path = e.composedPath ? e.composedPath() : [];
      if (path && (path.includes(overlayContainer) || path.includes(shadowRoot))) return true;
      if (overlayContainer.contains && overlayContainer.contains(e.target)) return true;
    } catch (_) {}
    return false;
  }

  // Global safety trap to suppress trailing synthetic events after selection click
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'auxclick', 'dblclick'].forEach(evtType => {
    window.addEventListener(evtType, (e) => {
      if (Date.now() < suppressPageEventsUntil) {
        if (!isOurUIEvent(e)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }, true);
  });

  // --- SELECTION & CAPTURE EVENT SUPPRESSION ---
  function blockPointerEvent(e) {
    if (!isSelectionMode && !isCaptureMode && Date.now() >= suppressPageEventsUntil) return;
    if (isOurUIEvent(e)) return;

    // In selection mode, DO NOT preventDefault on pointerdown/mousedown so the browser can fire the click event!
    if (isSelectionMode && (e.type === 'pointerdown' || e.type === 'mousedown' || e.type === 'pointerup' || e.type === 'mouseup')) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function startSelectionMode(engineKey = null, targetType = 'url') {
    if (isCaptureMode) stopCaptureMode();

    const chosenEngine = engineKey || pendingEngine || currentOptions.defaultEngine || 'googleLens';
    pendingEngine = chosenEngine;
    selectionTargetType = targetType;

    ensureUI();
    updateMenuSelectionVisual(chosenEngine);

    const engName = chosenEngine === 'all' ? 'All search engines' : (ALL_ENGINES.find(e => e.id === chosenEngine)?.name || 'Search');
    showTopStatus(`🔍 <b>${engName}:</b> Click any image on page to search directly (ESC to cancel)`, 8000);
    document.body.style.cursor = 'crosshair';

    // If already in selection mode, listeners are already active! Just refresh hover & return
    if (isSelectionMode) {
      if (currentTarget && currentTarget.element) {
        updateHighlightBox(currentTarget.element, currentTarget.type);
      }
      return;
    }

    isSelectionMode = true;
    currentTarget = null;

    // Intercept and prevent all pointer/mouse events from triggering site menus/links/buttons
    window.addEventListener('pointerdown', blockPointerEvent, true);
    window.addEventListener('mousedown', blockPointerEvent, true);
    window.addEventListener('pointerup', blockPointerEvent, true);
    window.addEventListener('mouseup', blockPointerEvent, true);
    window.addEventListener('click', onSelectionClick, true);
    window.addEventListener('auxclick', blockPointerEvent, true);
    window.addEventListener('dblclick', blockPointerEvent, true);
    window.addEventListener('contextmenu', onCancelSelection, true);
    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function stopSelectionMode() {
    if (!isSelectionMode) return;
    isSelectionMode = false;
    currentTarget = null;
    pendingEngine = null;
    updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');

    if (highlightBox) highlightBox.style.display = 'none';
    if (topBanner) topBanner.style.display = 'none';
    document.body.style.cursor = '';

    window.removeEventListener('pointerdown', blockPointerEvent, true);
    window.removeEventListener('mousedown', blockPointerEvent, true);
    window.removeEventListener('pointerup', blockPointerEvent, true);
    window.removeEventListener('mouseup', blockPointerEvent, true);
    window.removeEventListener('click', onSelectionClick, true);
    window.removeEventListener('auxclick', blockPointerEvent, true);
    window.removeEventListener('dblclick', blockPointerEvent, true);
    window.removeEventListener('contextmenu', onCancelSelection, true);
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('scroll', onScroll, true);
  }

  function onCancelSelection(e) {
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      stopSelectionMode();
    }
  }

  function onScroll() {
    if (!isSelectionMode || !currentTarget || !currentTarget.element) return;
    updateHighlightBox(currentTarget.element, currentTarget.type);
  }

  function onMouseMove(e) {
    if (!isSelectionMode) return;
    if (isOurUIEvent(e)) {
      if (highlightBox) highlightBox.style.display = 'none';
      currentTarget = null;
      return;
    }
    const hit = findBestImageAtPoint(e.clientX, e.clientY, e);

    if (hit && hit.element) {
      // 60/120 FPS optimization: If cursor is still inside the currently highlighted element, skip layout recalculation
      if (currentTarget && currentTarget.element === hit.element) {
        return;
      }
      currentTarget = hit;
      updateHighlightBox(hit.element, hit.type);
    } else {
      if (currentTarget) {
        if (highlightBox) highlightBox.style.display = 'none';
        currentTarget = null;
      }
    }
  }

  function updateHighlightBox(el, typeDesc) {
    if (!highlightBox || !highlightBadge) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      highlightBox.style.display = 'none';
      return;
    }

    highlightBox.style.top = `${rect.top}px`;
    highlightBox.style.left = `${rect.left}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;
    highlightBox.style.display = 'block';

    let label = '🖼️ Image';
    if (typeDesc.includes('video')) label = '🎬 Video Frame';
    else if (typeDesc.includes('bg')) label = '🎨 Background Image';
    else if (typeDesc.includes('canvas')) label = '🖌️ Canvas';
    else if (typeDesc.includes('thumb')) label = '⭐ Cover Photo';

    const activeEng = pendingEngine || currentOptions.defaultEngine || 'googleLens';
    const engInfo = ALL_ENGINES.find(e => e.id === activeEng);
    const engName = activeEng === 'all' ? 'All search engines' : (engInfo?.name || activeEng);

    highlightBadge.textContent = `✓ ${engName} • ${label} (${Math.round(rect.width)} × ${Math.round(rect.height)})`;
  }

  // ONE-CLICK INSTANT SEARCH ON CLICK (Stateless - Never saved or held)
  async function onSelectionClick(e) {
    if (!isSelectionMode) return;
    if (isOurUIEvent(e)) return;

    // Block any site action completely (no dropdowns, no link clicks, no form submits)
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    let selected = currentTarget;
    if (!selected) {
      selected = findBestImageAtPoint(e.clientX, e.clientY, e);
    }
    const targetEngine = pendingEngine || currentOptions.defaultEngine || "all";

    // Suppress any trailing site events for 500ms
    suppressPageEventsUntil = Date.now() + 500;
    stopSelectionMode();

    if (!selected) {
      showTopStatus('⚠️ No valid image element under cursor.', 2000);
      return;
    }

    showTopStatus('⏳ Extracting image & searching...', 1800);

    let finalUrl = selected.url;
    let localDataUrl = null;

    const rect = selected.element?.getBoundingClientRect?.();
    const isTiny = rect && (rect.width < 100 || rect.height < 100);
    if (selectionTargetType === 'image' || isTiny || selected.type === 'canvas' || selected.type === 'video-frame' || !finalUrl || finalUrl.startsWith('data:') || finalUrl.startsWith('blob:')) {
      try {
        localDataUrl = await extractElementPixelData(selected.element, finalUrl);
        if (localDataUrl) finalUrl = localDataUrl;
      } catch (err) {
        console.warn('[Search by Image] Pixel extraction error:', err);
      }
    }

    if (!finalUrl && !localDataUrl) {
      showTopStatus('⚠️ Failed to extract image data.', 2000);
      return;
    }

    dispatchSearch(targetEngine || 'all', finalUrl, localDataUrl);
  }


  // --- CAPTURE / CROP MODE ---
  function startCaptureMode(engineKey = null) {
    if (isSelectionMode) stopSelectionMode();

    const chosenEngine = engineKey || pendingEngine || currentOptions.defaultEngine || 'googleLens';
    pendingEngine = chosenEngine;

    ensureUI();
    updateMenuSelectionVisual(chosenEngine);

    const engName = chosenEngine === 'all' ? 'All engines' : (ALL_ENGINES.find(e => e.id === chosenEngine)?.name || 'Search');
    showTopStatus(`✂️ <b>${engName} (Capture):</b> Drag a box across the screen to crop (ESC to cancel)`, 10000);
    document.body.style.cursor = 'crosshair';
    document.body.style.userSelect = 'none';

    if (isCaptureMode) return;
    isCaptureMode = true;
    isCapturing = false;

    // Block all site interactions and attach capture trackers
    window.addEventListener('pointerdown', onCaptureMouseDown, true);
    window.addEventListener('mousedown', onCaptureMouseDown, true);
    window.addEventListener('pointermove', onCaptureMouseMove, true);
    window.addEventListener('mousemove', onCaptureMouseMove, true);
    window.addEventListener('pointerup', onCaptureMouseUp, true);
    window.addEventListener('mouseup', onCaptureMouseUp, true);
    window.addEventListener('click', onCaptureClick, true);
    window.addEventListener('auxclick', blockPointerEvent, true);
    window.addEventListener('dblclick', blockPointerEvent, true);
    window.addEventListener('contextmenu', onCancelCapture, true);
    window.addEventListener('selectstart', blockPointerEvent, true);
    window.addEventListener('dragstart', blockPointerEvent, true);
  }

  function stopCaptureMode() {
    if (!isCaptureMode) return;
    isCaptureMode = false;
    isCapturing = false;
    pendingEngine = null;
    updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');

    if (captureBox) captureBox.style.display = 'none';
    if (topBanner) topBanner.style.display = 'none';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    window.removeEventListener('pointerdown', onCaptureMouseDown, true);
    window.removeEventListener('mousedown', onCaptureMouseDown, true);
    window.removeEventListener('pointermove', onCaptureMouseMove, true);
    window.removeEventListener('mousemove', onCaptureMouseMove, true);
    window.removeEventListener('pointerup', onCaptureMouseUp, true);
    window.removeEventListener('mouseup', onCaptureMouseUp, true);
    window.removeEventListener('click', onCaptureClick, true);
    window.removeEventListener('auxclick', blockPointerEvent, true);
    window.removeEventListener('dblclick', blockPointerEvent, true);
    window.removeEventListener('contextmenu', onCancelCapture, true);
    window.removeEventListener('selectstart', blockPointerEvent, true);
    window.removeEventListener('dragstart', blockPointerEvent, true);
  }

  function onCaptureMouseDown(e) {
    if (!isCaptureMode) return;
    if (isOurUIEvent(e)) return;

    // Completely block site button/link clicks on start of drag
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.button !== 0) return; // Left click starts crop box

    isCapturing = true;
    captureStartX = e.clientX;
    captureStartY = e.clientY;

    if (captureBox) {
      captureBox.style.left = `${captureStartX}px`;
      captureBox.style.top = `${captureStartY}px`;
      captureBox.style.width = '0px';
      captureBox.style.height = '0px';
      captureBox.style.display = 'block';
    }
  }

  function onCaptureMouseMove(e) {
    if (!isCaptureMode || !isCapturing || !captureBox) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const curX = e.clientX;
    const curY = e.clientY;

    const left = Math.min(curX, captureStartX);
    const top = Math.min(curY, captureStartY);
    const width = Math.abs(curX - captureStartX);
    const height = Math.abs(curY - captureStartY);

    captureBox.style.left = `${left}px`;
    captureBox.style.top = `${top}px`;
    captureBox.style.width = `${width}px`;
    captureBox.style.height = `${height}px`;

    if (captureBadge) {
      captureBadge.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
    }
  }

  async function onCaptureMouseUp(e) {
    if (!isCaptureMode) return;
    if (isOurUIEvent(e)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!isCapturing) return;
    isCapturing = false;

    // Suppress trailing click and pointer events on the page for 500ms
    suppressPageEventsUntil = Date.now() + 500;

    const curX = e.clientX;
    const curY = e.clientY;
    const left = Math.min(curX, captureStartX);
    const top = Math.min(curY, captureStartY);
    const width = Math.abs(curX - captureStartX);
    const height = Math.abs(curY - captureStartY);

    const targetEngine = pendingEngine || currentOptions.defaultEngine || "all";
    stopCaptureMode();

    if (width < 12 || height < 12) {
      showTopStatus('⚠️ Area too small, crop cancelled.', 1500);
      return;
    }

    showTopStatus('✂️ Cropping and searching...', 3000);
    const croppedDataUrl = await cropRegionUnderBox(left, top, width, height);

    if (croppedDataUrl) {
      dispatchSearch(targetEngine || 'all', croppedDataUrl, croppedDataUrl);
      const engName = targetEngine === 'all' ? 'All engines' : (ALL_ENGINES.find(e => e.id === targetEngine)?.name || 'Search');
      showTopStatus(`✂️ <b>${engName}:</b> Cropped! Searching... <button id="sbi-recrop-btn" style="margin-left: 10px; background: #38bdf8; color: #000; border: none; padding: 3px 12px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 12px;">✂️ Crop Again</button>`, 7000);
      setTimeout(() => {
        const btn = shadowRoot?.getElementById('sbi-recrop-btn');
        if (btn) {
          btn.onclick = (ev) => {
            ev.stopPropagation();
            startCaptureMode(targetEngine);
          };
        }
      }, 50);
    } else {
      // Fallback: If crop extraction failed on a difficult site element, but an image was under the box:
      const fallbackHit = findBestImageAtPoint(left + width / 2, top + height / 2);
      if (fallbackHit && fallbackHit.url) {
        showTopStatus('🔍 Cropping fallback: Searching full image...', 2500);
        dispatchSearch(targetEngine || 'all', fallbackHit.url, null);
      } else {
        showTopStatus('⚠️ Could not crop underlying element.', 2500);
      }
    }
  }

  function onCaptureClick(e) {
    if (isOurUIEvent(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function onCancelCapture(e) {
    if (isCaptureMode) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      stopCaptureMode();
      showTopStatus('✂️ Capture cancelled.', 1500);
    }
  }

  // --- HIGH RESOLUTION URL UPGRADERS ---
  function upgradeToHighResUrl(url) {
    if (!url || typeof url !== 'string') return url;
    let finalUrl = toAbsoluteUrl(url);

    // Pinterest: upgrade /236x/, /474x/, /736x/ to /originals/
    if (finalUrl.includes('i.pinimg.com/')) {
      finalUrl = finalUrl.replace(/\/([0-9]+x|originals)\//, '/originals/');
    }
    // Discord: upgrade media.discordapp.net to cdn.discordapp.com without resizing params
    else if (finalUrl.includes('media.discordapp.net/attachments/')) {
      finalUrl = finalUrl.replace('media.discordapp.net', 'cdn.discordapp.com').split('?')[0];
    }
    // Twitter / X: upgrade pbs.twimg.com/media/ to name=orig
    else if (finalUrl.includes('pbs.twimg.com/media/')) {
      if (finalUrl.includes('name=')) {
        finalUrl = finalUrl.replace(/name=[a-z0-9_]+/i, 'name=orig');
      } else if (finalUrl.includes('?')) {
        finalUrl += '&name=orig';
      } else {
        finalUrl += '?name=orig';
      }
    }
    return finalUrl;
  }

  const getHighResPinterestUrl = upgradeToHighResUrl;
  const getHighResDiscordUrl = upgradeToHighResUrl;
  const getHighResTwitterUrl = upgradeToHighResUrl;

  async function cropRegionUnderBox(boxLeft, boxTop, boxWidth, boxHeight) {
    let tempBlobUrl = null;
    try {
      const boxRight = boxLeft + boxWidth;
      const boxBottom = boxTop + boxHeight;
      const centerX = boxLeft + boxWidth / 2;
      const centerY = boxTop + boxHeight / 2;

      // 1. Temporarily hide our overlay so elementFromPoint sees real page content
      if (overlayContainer) overlayContainer.style.visibility = 'hidden';

      // Step A: First try center point with full element finder
      let candidate = findBestImageAtPoint(centerX, centerY);

      // Step B: If not found at center, check grid points inside the crop box
      if (!candidate || !candidate.element) {
        const testPoints = [
          [boxLeft + Math.min(15, boxWidth * 0.25), boxTop + Math.min(15, boxHeight * 0.25)],
          [boxRight - Math.min(15, boxWidth * 0.25), boxTop + Math.min(15, boxHeight * 0.25)],
          [boxLeft + Math.min(15, boxWidth * 0.25), boxBottom - Math.min(15, boxHeight * 0.25)],
          [boxRight - Math.min(15, boxWidth * 0.25), boxBottom - Math.min(15, boxHeight * 0.25)],
          [centerX, boxTop + Math.min(15, boxHeight * 0.25)],
          [centerX, boxBottom - Math.min(15, boxHeight * 0.25)]
        ];
        for (const [px, py] of testPoints) {
          const hit = findBestImageAtPoint(px, py);
          if (hit && hit.element && hit.url) {
            candidate = hit;
            break;
          }
        }
      }

      // Step C: If still not found, check all visual elements in DOM intersecting the crop box
      if (!candidate || !candidate.element) {
        const allMedia = Array.from(document.querySelectorAll('img, video, canvas, [style*="background-image"], picture'));
        let maxOverlap = 0;
        for (const el of allMedia) {
          if (!el || el.id === 'sbi-overlay-host' || el.closest('#sbi-overlay-host')) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;

          const xOverlap = Math.max(0, Math.min(boxRight, rect.right) - Math.max(boxLeft, rect.left));
          const yOverlap = Math.max(0, Math.min(boxBottom, rect.bottom) - Math.max(boxTop, rect.top));
          const overlapArea = xOverlap * yOverlap;

          if (overlapArea > maxOverlap) {
            let url = null;
            let type = 'img';
            if (el instanceof HTMLImageElement) {
              const info = extractFromImg(el);
              url = info?.url;
            } else if (el instanceof HTMLVideoElement) {
              const info = extractFromVideo(el, el.parentElement);
              url = info?.url;
              type = 'video';
            } else if (el instanceof HTMLCanvasElement) {
              try { url = el.toDataURL('image/png'); type = 'canvas'; } catch (_) {}
            } else if (el instanceof HTMLPictureElement) {
              const info = extractFromPicture(el);
              url = info?.url;
            } else {
              const bg = extractFromBackground(el);
              url = bg?.url;
              type = 'bg';
            }

            if (url) {
              maxOverlap = overlapArea;
              candidate = { url, element: el, type };
            }
          }
        }
      }

      if (overlayContainer) overlayContainer.style.visibility = 'visible';

      if (!candidate || !candidate.element) {
        return null;
      }

      const visualEl = candidate.element;
      const rect = visualEl.getBoundingClientRect();

      // Intersection calculation
      const iLeft = Math.max(boxLeft, rect.left);
      const iTop = Math.max(boxTop, rect.top);
      const iRight = Math.min(boxRight, rect.right);
      const iBottom = Math.min(boxBottom, rect.bottom);
      const iWidth = Math.max(1, iRight - iLeft);
      const iHeight = Math.max(1, iBottom - iTop);

      let sourceMedia = null;
      let sourceWidth = 0;
      let sourceHeight = 0;

      // Case 1: Video Element (draw current frame)
      if (visualEl instanceof HTMLVideoElement) {
        const vCanvas = document.createElement('canvas');
        vCanvas.width = visualEl.videoWidth || rect.width || 640;
        vCanvas.height = visualEl.videoHeight || rect.height || 360;
        const vCtx = vCanvas.getContext('2d');
        vCtx.drawImage(visualEl, 0, 0, vCanvas.width, vCanvas.height);
        sourceMedia = vCanvas;
        sourceWidth = vCanvas.width;
        sourceHeight = vCanvas.height;
      }
      // Case 2: Canvas Element
      else if (visualEl instanceof HTMLCanvasElement) {
        sourceMedia = visualEl;
        sourceWidth = visualEl.width;
        sourceHeight = visualEl.height;
      }
      // Case 3: Image / Picture / Background
      else {
        let fetchUrl = candidate.url;

        if (fetchUrl && (fetchUrl.startsWith('data:') || fetchUrl.startsWith('blob:'))) {
          const img = new Image();
          await new Promise((res) => {
            img.onload = () => res(true);
            img.onerror = () => res(false);
            img.src = fetchUrl;
          });
          if (img.naturalWidth > 0 || img.width > 0) {
            sourceMedia = img;
            sourceWidth = img.naturalWidth || img.width;
            sourceHeight = img.naturalHeight || img.height;
          }
        } else if (fetchUrl) {
          // Fetch binary via GM_xmlhttpRequest to bypass all CORS canvas tainting
          let blob = await fetchBlobViaGM(fetchUrl);
          if (!blob && fetchUrl !== candidate.url) {
            blob = await fetchBlobViaGM(candidate.url);
          }
          if (blob) {
            tempBlobUrl = URL.createObjectURL(blob);
            const img = new Image();
            await new Promise((res) => {
              img.onload = () => res(true);
              img.onerror = () => res(false);
              img.src = tempBlobUrl;
            });
            if (img.naturalWidth > 0 || img.width > 0) {
              sourceMedia = img;
              sourceWidth = img.naturalWidth || img.width;
              sourceHeight = img.naturalHeight || img.height;
            }
          }
        }

        // Fallback: direct element if already loaded
        if (!sourceMedia && visualEl instanceof HTMLImageElement && (visualEl.naturalWidth > 0 || visualEl.width > 0)) {
          try {
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = visualEl.naturalWidth || visualEl.width;
            fallbackCanvas.height = visualEl.naturalHeight || visualEl.height;
            const fbCtx = fallbackCanvas.getContext('2d');
            fbCtx.drawImage(visualEl, 0, 0);
            sourceMedia = fallbackCanvas;
            sourceWidth = fallbackCanvas.width;
            sourceHeight = fallbackCanvas.height;
          } catch (_) {}
        }

        // Child img fallback (e.g. Pinterest pin cards, Discord wrappers)
        if (!sourceMedia && visualEl.querySelector) {
          const innerImg = visualEl.querySelector('img');
          if (innerImg && (innerImg.naturalWidth > 0 || innerImg.width > 0)) {
            try {
              const fallbackCanvas = document.createElement('canvas');
              fallbackCanvas.width = innerImg.naturalWidth || innerImg.width;
              fallbackCanvas.height = innerImg.naturalHeight || innerImg.height;
              const fbCtx = fallbackCanvas.getContext('2d');
              fbCtx.drawImage(innerImg, 0, 0);
              sourceMedia = fallbackCanvas;
              sourceWidth = fallbackCanvas.width;
              sourceHeight = fallbackCanvas.height;
            } catch (_) {}
          }
        }

        // Direct candidate URL image fallback
        if (!sourceMedia && candidate.url) {
          try {
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'anonymous';
            await new Promise((res) => {
              fallbackImg.onload = () => res(true);
              fallbackImg.onerror = () => res(false);
              fallbackImg.src = candidate.url;
            });
            if (fallbackImg.width > 0) {
              sourceMedia = fallbackImg;
              sourceWidth = fallbackImg.naturalWidth || fallbackImg.width;
              sourceHeight = fallbackImg.naturalHeight || fallbackImg.height;
            }
          } catch (_) {}
        }
      }

      if (!sourceMedia || sourceWidth <= 0 || sourceHeight <= 0) {
        return null;
      }

      // Compute exact crop scale from DOM rect to original pixel dimensions
      const scaleX = sourceWidth / (rect.width || 1);
      const scaleY = sourceHeight / (rect.height || 1);

      let sx = Math.max(0, Math.round((iLeft - rect.left) * scaleX));
      let sy = Math.max(0, Math.round((iTop - rect.top) * scaleY));
      let sw = Math.min(sourceWidth - sx, Math.max(1, Math.round(iWidth * scaleX)));
      let sh = Math.min(sourceHeight - sy, Math.max(1, Math.round(iHeight * scaleY)));

      if (sw <= 0 || sh <= 0) {
        sx = 0;
        sy = 0;
        sw = sourceWidth;
        sh = sourceHeight;
      }

      const outCanvas = document.createElement('canvas');
      const destW = Math.max(sw, Math.round(boxWidth));
      const destH = Math.max(sh, Math.round(boxHeight));
      outCanvas.width = destW;
      outCanvas.height = destH;
      const ctx = outCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(sourceMedia, sx, sy, sw, sh, 0, 0, destW, destH);

      const finalCanvas = upscaleIfTooSmall(outCanvas, 320);
      return finalCanvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {
      console.warn('[Search by Image] Crop error:', err);
      return null;
    } finally {
      if (tempBlobUrl) {
        try { URL.revokeObjectURL(tempBlobUrl); } catch (_) {}
      }
      if (overlayContainer) overlayContainer.style.visibility = 'visible';
    }
  }

  // --- PIXEL EXTRACTION & UPSCALE ---
  function upscaleIfTooSmall(canvas, minDim = 320) {
    if (!canvas || !canvas.width || !canvas.height) return canvas;
    if (canvas.width >= minDim && canvas.height >= minDim) return canvas;
    const scale = Math.max(minDim / canvas.width, minDim / canvas.height);
    const targetW = Math.max(minDim, Math.round(canvas.width * scale));
    const targetH = Math.max(minDim, Math.round(canvas.height * scale));
    const upCanvas = document.createElement('canvas');
    upCanvas.width = targetW;
    upCanvas.height = targetH;
    const ctx = upCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetW, targetH);
    return upCanvas;
  }

  async function extractElementPixelData(el, fallbackUrl = null) {
    try {
      if (el instanceof HTMLCanvasElement) {
        return upscaleIfTooSmall(el).toDataURL('image/jpeg', 0.92);
      }
      if (el instanceof HTMLVideoElement) {
        return captureVideoFrame(el);
      }
      if (el instanceof HTMLImageElement) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = el.naturalWidth || el.width;
          canvas.height = el.naturalHeight || el.height;
          if (canvas.width > 0 && canvas.height > 0) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(el, 0, 0);
            return upscaleIfTooSmall(canvas).toDataURL('image/jpeg', 0.92);
          }
        } catch (corsErr) {
          // CORS canvas taint fallback
        }
      }
      if (fallbackUrl && fallbackUrl.startsWith('data:')) {
        return fallbackUrl;
      }
      if (fallbackUrl) {
        const blob = await fetchBlobViaGM(fallbackUrl);
        if (blob) {
          const img = new Image();
          const objUrl = URL.createObjectURL(blob);
          img.src = objUrl;
          await new Promise(res => { img.onload = res; img.onerror = res; });
          URL.revokeObjectURL(objUrl);
          if (img.width > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            return upscaleIfTooSmall(canvas).toDataURL('image/jpeg', 0.92);
          }
          return await blobToDataUrl(blob);
        }
      }
      return null;
    } catch (err) {
      console.warn('[Search by Image] extractElementPixelData error:', err);
      return null;
    }
  }

  // --- GEOMETRIC VALIDATION ---
  function isPointInside(el, x, y, margin = 6) {
    if (!el || !(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      x >= rect.left - margin &&
      x <= rect.right + margin &&
      y >= rect.top - margin &&
      y <= rect.bottom + margin
    );
  }

  function isRootOrHugeContainer(el) {
    if (!el || el === document.body || el === document.documentElement) return true;
    const tag = el.tagName;
    if (tag === 'HTML' || tag === 'BODY' || el.id === 'root' || el.id === '__next' || el.id === 'app') return true;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.width >= vw * 0.92 && rect.height >= vh * 0.92;
  }

  // --- COMPREHENSIVE ELEMENT DETECTION ---
  function findBestImageAtPoint(x, y, event = null) {
    const elements = document.elementsFromPoint(x, y);
    if (!elements || elements.length === 0) return null;

    for (const el of elements) {
      if (!el || el.id === 'sbi-overlay-host' || el.closest('#sbi-overlay-host')) continue;
      if (isRootOrHugeContainer(el)) continue;

      // 1. Direct HTMLImageElement
      if (el instanceof HTMLImageElement) {
        const info = extractFromImg(el);
        if (info && info.url) return { ...info, element: el };
      }

      // 2. Direct HTMLPictureElement
      if (el instanceof HTMLPictureElement) {
        const info = extractFromPicture(el);
        if (info && info.url) return { ...info, element: el };
      }

      // 3. SVG Image (<image>) support for Discord/Twitter/Reddit avatars
      if (el instanceof SVGImageElement || (el.tagName && el.tagName.toLowerCase() === 'image')) {
        const href = el.getAttribute('href') || el.getAttribute('xlink:href');
        if (href && isValidImageUrl(href)) {
          return { url: toAbsoluteUrl(href), element: el, type: 'svg-image' };
        }
      }

      // 4. Direct HTMLVideoElement
      if (el instanceof HTMLVideoElement) {
        const info = extractFromVideo(el, el.parentElement);
        if (info && info.url) return { ...info, element: el };
      }

      // 5. Direct HTMLCanvasElement
      if (el instanceof HTMLCanvasElement) {
        try {
          const url = el.toDataURL('image/png');
          return { url, element: el, type: 'canvas' };
        } catch (e) {}
      }

      // 6. Child img tag inside container (e.g. Pinterest pin wrappers, Discord wrappers)
      const imgInside = el.querySelector('img');
      if (imgInside && isPointInside(imgInside, x, y, 6)) {
        const info = extractFromImg(imgInside);
        if (info && info.url) return { ...info, element: imgInside };
      }

      // 7. Sibling img tag when hovering overlay action buttons (e.g. Pinterest 'Kaydet' / save button overlays)
      if (el.parentElement) {
        const siblingImg = el.parentElement.querySelector('img');
        if (siblingImg && isPointInside(siblingImg, x, y, 6)) {
          const info = extractFromImg(siblingImg);
          if (info && info.url) return { ...info, element: siblingImg };
        }
      }

      // 8. Child video tag
      const videoInside = el.querySelector('video');
      if (videoInside && isPointInside(videoInside, x, y, 6)) {
        const info = extractFromVideo(videoInside, el);
        if (info && info.url) return { ...info, element: videoInside };
      }

      // 9. Shadow DOM inside web components
      if (el.shadowRoot) {
        const shadowImg = el.shadowRoot.querySelector('img');
        if (shadowImg && isPointInside(shadowImg, x, y, 6)) {
          const info = extractFromImg(shadowImg);
          if (info && info.url) return { ...info, element: shadowImg };
        }
      }

      // 10. Background image on element or parent
      const bgInfo = extractFromBackground(el);
      if (bgInfo && bgInfo.url) return { ...bgInfo, element: el };
      if (el.parentElement) {
        const pBg = extractFromBackground(el.parentElement);
        if (pBg && pBg.url && isPointInside(el.parentElement, x, y, 6)) {
          return { ...pBg, element: el.parentElement };
        }
      }
    }

    return null;
  }

  function extractFromImg(img) {
    let rawUrl = '';
    let type = 'img';

    if (img.currentSrc && isValidImageUrl(img.currentSrc)) {
      rawUrl = img.currentSrc;
      type = 'img-current';
    } else if (img.src && isValidImageUrl(img.src)) {
      rawUrl = img.src;
      type = 'img-src';
    } else if (img.srcset) {
      const best = getLargestFromSrcset(img.srcset);
      if (best) {
        rawUrl = best;
        type = 'img-srcset';
      }
    }

    if (!rawUrl) {
      const lazyAttrs = ['data-src', 'data-original', 'data-lazy-src', 'data-url', 'data-hi-res-src'];
      for (const attr of lazyAttrs) {
        const val = img.getAttribute(attr);
        if (val && isValidImageUrl(val)) {
          rawUrl = val;
          type = 'img-lazy';
          break;
        }
      }
    }

    if (!rawUrl) return null;

    let finalUrl = toAbsoluteUrl(rawUrl);

    // Auto-upgrade Pinterest images to highest original resolution (/originals/)
    if (finalUrl.includes('i.pinimg.com/')) {
      finalUrl = finalUrl.replace(/\/([0-9]+x|originals)\//, '/originals/');
    }

    // Auto-upgrade Discord images to clean CDN uncompressed URLs
    if (finalUrl.includes('media.discordapp.net/attachments/')) {
      finalUrl = finalUrl.replace('media.discordapp.net', 'cdn.discordapp.com').split('?')[0];
    }

    // Auto-upgrade Twitter / X images to max resolution (name=orig)
    if (finalUrl.includes('pbs.twimg.com/media/')) {
      finalUrl = finalUrl.replace(/name=[a-zA-Z0-9_]+/, 'name=orig');
    }

    return { url: finalUrl, type };
  }

  function extractFromPicture(pic) {
    const imgInside = pic.querySelector('img');
    if (imgInside) {
      const res = extractFromImg(imgInside);
      if (res) return res;
    }
    const sources = pic.querySelectorAll('source');
    for (const s of sources) {
      const ss = s.getAttribute('srcset');
      if (ss) {
        const best = getLargestFromSrcset(ss);
        if (best) return { url: toAbsoluteUrl(best), type: 'picture-source' };
      }
    }
    return null;
  }

  function extractFromVideo(video, container = null) {
    if (video.poster && isValidImageUrl(video.poster)) {
      return { url: toAbsoluteUrl(video.poster), type: 'video-poster' };
    }
    const root = container || video.parentElement;
    if (root) {
      const thumb = root.querySelector('img[src*="thumb"], img[src*="vi/"], img[src*="poster"], .ytp-cued-thumbnail-overlay-image');
      if (thumb) {
        const res = extractFromImg(thumb) || extractFromBackground(thumb);
        if (res) return { ...res, type: 'video-thumb' };
      }
      const ytIdMatch = window.location.href.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytIdMatch && ytIdMatch[1]) {
        return { url: `https://i.ytimg.com/vi/${ytIdMatch[1]}/maxresdefault.jpg`, type: 'video-yt-thumb' };
      }
    }
    const frameData = captureVideoFrame(video);
    if (frameData) return { url: frameData, type: 'video-frame' };
    return null;
  }

  function captureVideoFrame(video) {
    try {
      const vw = video.videoWidth || video.clientWidth;
      const vh = video.videoHeight || video.clientHeight;
      if (!vw || !vh) return null;
      const canvas = document.createElement('canvas');
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, vw, vh);
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (e) {
      return null;
    }
  }

  function extractFromBackground(el) {
    if (!el || !(el instanceof Element)) return null;
    const tag = el.tagName;
    if (['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'BUTTON'].includes(tag)) return null;

    // Fast-path: check inline style before invoking costly getComputedStyle
    const inlineBg = el.style && el.style.backgroundImage;
    if (inlineBg && inlineBg !== 'none') {
      const m = inlineBg.match(/url\(['"]?(.*?)['"]?\)/i);
      if (m && m[1] && isValidImageUrl(m[1])) return { url: toAbsoluteUrl(m[1]), type: 'bg-style' };
    }

    const comp = window.getComputedStyle(el);
    const bg = comp.backgroundImage;
    if (!bg || bg === 'none') return null;
    const match = bg.match(/url\(['"]?(.*?)['"]?\)/i);
    if (match && match[1] && isValidImageUrl(match[1])) {
      return { url: toAbsoluteUrl(match[1]), type: 'bg-style' };
    }
    return null;
  }

  function getLargestFromSrcset(srcset) {
    if (!srcset) return null;
    const candidates = srcset.split(',').map((c) => {
      const parts = c.trim().split(/\s+/);
      const url = parts[0];
      const descriptor = parts[1] || '1x';
      let score = 1;
      if (descriptor.endsWith('w')) score = parseInt(descriptor, 10) || 1;
      else if (descriptor.endsWith('x')) score = (parseFloat(descriptor) || 1) * 1000;
      return { url, score };
    });
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] ? candidates[0].url : null;
  }

  function isValidImageUrl(url) {
    if (!url) return false;
    const clean = url.trim();
    if (clean.startsWith('data:image/')) return true;
    if (clean.startsWith('blob:')) return true;
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('//')) return true;
    return false;
  }

  function toAbsoluteUrl(url) {
    if (!url) return '';
    try {
      return new URL(url, window.location.href).href;
    } catch (e) {
      return url;
    }
  }

  function dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  function fetchBlobViaGM(url) {
    return new Promise((resolve) => {
      try {
        const headers = {
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        };
        try {
          if (window.location && window.location.href) {
            headers['Referer'] = window.location.origin + '/';
          }
        } catch (_) {}
        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          headers: headers,
          responseType: 'blob',
          timeout: 10000,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300 && res.response) {
              resolve(res.response);
            } else if (res.response instanceof ArrayBuffer) {
              resolve(new Blob([res.response], { type: 'image/jpeg' }));
            } else {
              resolve(null);
            }
          },
          ontimeout: () => resolve(null),
          onerror: () => resolve(null)
        });
      } catch (_) {
        resolve(null);
      }
    });
  }

  // --- DISPATCH SEARCH (Stateless - Never saved or held) ---
  async function dispatchSearch(engineKey, url, fileData) {
    resolveImageUrlForSearch(url, fileData, async (publicUrl, blob) => {
      // Local image blob (Cropped area, in-page selection, paste, or file upload):
      if (blob) {
        // 1. Copy image blob directly to user's clipboard as local backup
        await copyBlobToClipboard(blob);
        const dataUrl = await blobToDataUrl(blob);

        // A. Google Lens: Use direct v3/upload to open search results immediately (Zero 3rd party upload)!
        if (engineKey === 'googleLens') {
          uploadDirectToGoogleLens(blob, (resultsUrl) => {
            openTab(resultsUrl);
          }, async (err) => {
            console.warn('[Search by Image] Direct Google Lens upload fallback:', err);
            await GM_setValue('sbi_lens_target', dataUrl);
            await GM_setValue('sbi_lens_time', Date.now());
            openEngineLandingPage('googleLens', true);
          });
          return;
        }

        // B. Search ALL engines: Direct Google Lens upload + parallel background tabs
        if (engineKey === 'all') {
          uploadDirectToGoogleLens(blob, (resultsUrl) => {
            openTab(resultsUrl);
          }, () => {});

          const otherEngines = (currentOptions.enabledEngines || ['lenso', 'bing', 'yandex', 'pinterest', 'tineye'])
            .filter(k => k !== 'googleLens');

          await GM_setValue('sbi_lenso_target', dataUrl);
          await GM_setValue('sbi_lenso_time', Date.now());
          await GM_setValue('sbi_yandex_target', dataUrl);
          await GM_setValue('sbi_yandex_time', Date.now());
          await GM_setValue('sbi_bing_target', dataUrl);
          await GM_setValue('sbi_bing_time', Date.now());

          const isFg = currentOptions.tabFocus === 'foreground' || currentOptions.tabInBackgound === false;
          const focusStr = isFg ? t('foreground') : t('background');
          showTopStatus(`🚀 ${t('searchingAll', { count: otherEngines.length + 1, focus: focusStr })}`, 2500);

          otherEngines.forEach((key, i) => {
            setTimeout(() => {
              if (key === 'pinterest') {
                ENGINE_ACTIONS.pinterest(dataUrl, dataUrl);
              } else {
                openEngineLandingPage(key, true);
              }
            }, (i + 1) * 250);
          });
          return;
        }

        // C. Specific individual engines
        if (engineKey === 'lenso') {
          await GM_setValue('sbi_lenso_target', dataUrl);
          await GM_setValue('sbi_lenso_time', Date.now());
          openEngineLandingPage('lenso', true);
          return;
        }
        if (engineKey === 'yandex') {
          await GM_setValue('sbi_yandex_target', dataUrl);
          await GM_setValue('sbi_yandex_time', Date.now());
          openEngineLandingPage('yandex', true);
          return;
        }
        if (engineKey === 'bing') {
          await GM_setValue('sbi_bing_target', dataUrl);
          await GM_setValue('sbi_bing_time', Date.now());
          openEngineLandingPage('bing', true);
          return;
        }
        if (engineKey === 'pinterest') {
          ENGINE_ACTIONS.pinterest(dataUrl, dataUrl);
          return;
        }

        openEngineLandingPage(engineKey, true);
        return;
      }

      // Public URL available (Select URL mode, or URL input):
      if (publicUrl) {
        if (engineKey === 'all') {
          const enginesToSearch = currentOptions.enabledEngines || ['googleLens', 'lenso', 'bing', 'yandex', 'pinterest', 'tineye'];
          const isFg = currentOptions.tabFocus === 'foreground' || currentOptions.tabInBackgound === false;
          const focusStr = isFg ? t('foreground') : t('background');
          showTopStatus(`🚀 ${t('searchingAll', { count: enginesToSearch.length, focus: focusStr })}`, 2500);
          enginesToSearch.forEach((key, i) => {
            setTimeout(() => {
              executeGenericEngine(key, publicUrl, null);
            }, i * 220);
          });
        } else {
          executeGenericEngine(engineKey, publicUrl, null);
        }
      } else {
        showTopStatus(`⚠️ ${t('noValidUrl')}`, 2500);
      }
    });
  }

  // Trigger search based on current mode
  function onEngineItemClicked(engineKey) {
    if (!engineKey) return;
    pendingEngine = engineKey;
    updateMenuSelectionVisual(engineKey);

    const engName = engineKey === 'all' ? 'All search engines' : (ALL_ENGINES.find(e => e.id === engineKey)?.name || 'Search');
    if (currentMode === 'Capture') {
      startCaptureMode(engineKey);
    } else if (currentMode === 'Select URL') {
      showTopStatus(`🔍 <b>${engName}:</b> Click any image on page to search directly (ESC to cancel)`, 8000);
      startSelectionMode(engineKey, 'url');
    } else if (currentMode === 'Select image') {
      showTopStatus(`🔍 <b>${engName}:</b> Click any image on page to search directly (ESC to cancel)`, 8000);
      startSelectionMode(engineKey, 'image');
    } else if (currentMode === 'Browse') {
      triggerBrowseFile(engineKey);
    } else if (currentMode === 'URL') {
      const urlInput = shadowRoot?.getElementById('sbi-url-field');
      const val = urlInput ? urlInput.value.trim() : '';
      if (val) {
        dispatchSearch(engineKey, val, null);
        urlInput.value = '';
      } else {
        showTopStatus('⚠️ Please enter an Image URL first.', 2000);
        if (urlInput) urlInput.focus();
      }
    }
  }

  // --- FILE BROWSING & CLIPBOARD PASTE ---
  function triggerBrowseFile(engineKey = 'all') {
    ensureUI();
    let fileInput = shadowRoot.getElementById('sbi-file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.id = 'sbi-file-input';
      fileInput.style.display = 'none';
      shadowRoot.appendChild(fileInput);
    }

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        showTopStatus('⏳ Loading local file & searching...', 2000);
        const dataUrl = await blobToDataUrl(file);
        dispatchSearch(engineKey, dataUrl, dataUrl);
      }
      fileInput.value = '';
    };

    fileInput.click();
  }

  async function triggerClipboardPaste(engineKey = 'all') {
    ensureUI();
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const dataUrl = await blobToDataUrl(blob);
              showTopStatus('✅ Image pasted from clipboard! Searching...', 2000);
              dispatchSearch(engineKey, dataUrl, dataUrl);
              return;
            }
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && isValidImageUrl(text)) {
          showTopStatus('✅ Image URL pasted! Searching...', 2000);
          dispatchSearch(engineKey, text.trim(), null);
          return;
        }
      }
      showTopStatus('⚠️ No image or image link found in clipboard.', 2500);
    } catch (err) {
      console.warn('[Search by Image] Clipboard error:', err);
      showTopStatus('⚠️ Clipboard permission denied or not supported.', 2500);
    }
  }

  function uploadToTempHost(fileOrBlob, onDone, onError) {
    showTopStatus(`☁️ ${t('uploadingImage')}`, 4000);

    const provider = currentOptions.uploadProvider || 'imgur';

    if (provider === 'litterbox') {
      // 1. Primary: Litterbox (Temporary 1-hour auto-delete)
      uploadToLitterbox(fileOrBlob, (url) => {
        if (onDone) onDone(url);
      }, (litterErr) => {
        console.warn('[Search by Image] Litterbox failed, trying Imgur Fastly CDN...', litterErr);
        uploadToImgur(fileOrBlob, (url) => {
          if (onDone) onDone(url);
        }, (imgurErr) => {
          uploadToCatbox(fileOrBlob, onDone, onError);
        });
      });
      return;
    }

    // Default & Recommended: Imgur Primary (High-Speed Global Fastly CDN, Direct Googlebot Peering)
    uploadToImgur(fileOrBlob, (url) => {
      if (onDone) onDone(url);
    }, (imgurErr) => {
      console.warn('[Search by Image] Imgur CDN failed, falling back to Litterbox...', imgurErr);

      // 2. Secondary: Litterbox
      uploadToLitterbox(fileOrBlob, (url) => {
        if (onDone) onDone(url);
      }, (litterErr) => {
        console.warn('[Search by Image] Litterbox failed, trying Catbox...', litterErr);

        // 3. Tertiary: Catbox.moe
        uploadToCatbox(fileOrBlob, (url) => {
          if (onDone) onDone(url);
        }, (catboxErr) => {
          console.warn('[Search by Image] All backup upload hosts failed:', catboxErr);
          showTopStatus(`⚠️ ${t('uploadFail')}`, 3500);
          if (onError) onError(catboxErr);
        });
      });
    });
  }

  function uploadToImgur(fileOrBlob, onDone, onError) {
    const formData = new FormData();
    formData.append('image', fileOrBlob, 'search_image.jpg');

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://api.imgur.com/3/image',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7'
      },
      data: formData,
      timeout: 10000,
      onload: function (res) {
        try {
          const json = JSON.parse(res.responseText);
          if (json && json.success && json.data && json.data.link) {
            onDone(json.data.link);
          } else {
            onError(new Error(json?.data?.error?.message || json?.data?.error || 'Imgur upload failed'));
          }
        } catch (e) {
          onError(e);
        }
      },
      ontimeout: function () {
        onError(new Error('Imgur timeout'));
      },
      onerror: function (err) {
        onError(err);
      }
    });
  }

  function uploadToLitterbox(fileOrBlob, onDone, onError) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', '1h');
    formData.append('fileToUpload', fileOrBlob, 'search_image.jpg');

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://litterbox.catbox.moe/resources/internals/api.php',
      data: formData,
      timeout: 10000,
      onload: function (res) {
        const directUrl = res.responseText ? res.responseText.trim() : '';
        if (directUrl.startsWith('https://litter.catbox.moe/')) {
          onDone(directUrl);
        } else {
          onError(new Error(directUrl || 'Litterbox invalid response'));
        }
      },
      ontimeout: function () {
        onError(new Error('Litterbox timeout'));
      },
      onerror: function (err) {
        onError(err);
      }
    });
  }

  function uploadToCatbox(fileOrBlob, onDone, onError) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fileOrBlob, 'search_image.jpg');

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://catbox.moe/user/api.php',
      data: formData,
      timeout: 10000,
      onload: function (res) {
        const directUrl = res.responseText ? res.responseText.trim() : '';
        if (directUrl.startsWith('https://files.catbox.moe/')) {
          onDone(directUrl);
        } else {
          onError(new Error(directUrl || 'Catbox invalid response'));
        }
      },
      ontimeout: function () {
        onError(new Error('Catbox timeout'));
      },
      onerror: function (err) {
        onError(err);
      }
    });
  }

  // --- LENSO.AI AUTOMATION ---
  async function handleLensoAutomation() {
    const targetUrl = await GM_getValue('sbi_lenso_target');
    const reqTime = await GM_getValue('sbi_lenso_time');

    if (!targetUrl || (reqTime && Date.now() - reqTime > 120000)) return;

    window.location.hash = '';
    await GM_setValue('sbi_lenso_target', null);

    showPageBadge('⏳ Uploading image to Lenso.ai, please wait...');

    if (targetUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(targetUrl);
      injectFileToLenso(blob);
    } else {
      GM_xmlhttpRequest({
        method: 'GET',
        url: targetUrl,
        responseType: 'blob',
        onload: (res) => {
          if (res.status === 200 && res.response) {
            injectFileToLenso(res.response);
          }
        }
      });
    }
  }

  function injectFileToLenso(blob) {
    const checkInput = setInterval(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        clearInterval(checkInput);
        const file = new File([blob], 'search_image.jpg', { type: blob.type || 'image/jpeg' });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        removePageBadge();

        setTimeout(() => {
          const modal = document.querySelector('.manage-consents-modal');
          if (modal) {
            const label = modal.querySelector('label[for="privacy-policy"]');
            if (label) label.click();
            const btn = modal.querySelector('button.perfom-search-btn:not([disabled])');
            if (btn) btn.click();
          }
        }, 500);
      }
    }, 200);
    setTimeout(() => clearInterval(checkInput), 15000);
  }

  // --- GOOGLE LENS AUTOMATION (Handles in-page modal & drop zones) ---
  async function handleGoogleLensAutomation() {
    const fileData = GM_getValue('sbi_lens_target');
    const reqTime = GM_getValue('sbi_lens_time');

    if (!fileData || (reqTime && Date.now() - reqTime > 60000)) return;

    GM_setValue('sbi_lens_target', null);
    GM_setValue('sbi_lens_time', 0);

    showPageBadge('⏳ ' + (currentOptions.lang === 'tr' ? 'Google Lens ile görsel aranıyor...' : 'Searching with Google Lens...'));

    const blob = dataUrlToBlob(fileData);
    const file = new File([blob], 'lens_image.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);

    let attempts = 0;
    const checkLens = setInterval(() => {
      attempts++;

      // Method 1: Check all file inputs in document
      const fileInputs = document.querySelectorAll('input[type="file"]');
      for (const input of fileInputs) {
        try {
          input.files = dt.files;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          clearInterval(checkLens);
          removePageBadge();
          return;
        } catch (_) {}
      }

      // Method 2: Click the 'dosya yükleyin' button or camera button
      const clickables = document.querySelectorAll('span[role="button"], div[role="button"], a[role="button"], .Gv0vUc');
      for (const el of clickables) {
        if (el.textContent && (el.textContent.includes('dosya') || el.textContent.includes('upload') || el.textContent.includes('file'))) {
          try { el.click(); } catch (_) {}
        }
      }

      // Method 3: Dispatch drop and paste events onto the dialog
      try {
        const modal = document.querySelector('div[role="dialog"], div[role="region"], div[aria-modal="true"]') || document.body;
        modal.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
        modal.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
      } catch (_) {}

      if (attempts > 30) {
        clearInterval(checkLens);
        removePageBadge();
      }
    }, 250);
  }

  // --- YANDEX AUTOMATION ---
  async function handleYandexAutomation() {
    const fileData = await GM_getValue('sbi_yandex_target');
    const reqTime = await GM_getValue('sbi_yandex_time');
    if (!fileData || (reqTime && Date.now() - reqTime > 120000)) return;

    window.location.hash = '';
    await GM_setValue('sbi_yandex_target', null);
    showPageBadge('⏳ Yandex ile görsel aranıyor...');

    const blob = dataUrlToBlob(fileData);
    const file = new File([blob], 'search_image.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);

    let attempts = 0;
    const checkYandex = setInterval(() => {
      attempts++;
      const cameraBtn = document.querySelector('button[aria-label*="Поиск по картинке"], button[aria-label*="Görselle arama"], .input__cbir-button, button[class*="cbir"]');
      if (cameraBtn && attempts % 3 === 0) cameraBtn.click();

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        clearInterval(checkYandex);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        removePageBadge();
        return;
      }
      if (attempts > 30) {
        clearInterval(checkYandex);
        removePageBadge();
      }
    }, 250);
  }

  // --- BING AUTOMATION ---
  async function handleBingAutomation() {
    const fileData = await GM_getValue('sbi_bing_target');
    const reqTime = await GM_getValue('sbi_bing_time');
    if (!fileData || (reqTime && Date.now() - reqTime > 120000)) return;

    window.location.hash = '';
    await GM_setValue('sbi_bing_target', null);
    showPageBadge('⏳ Bing ile görsel aranıyor...');

    const blob = dataUrlToBlob(fileData);
    const file = new File([blob], 'search_image.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);

    let attempts = 0;
    const checkBing = setInterval(() => {
      attempts++;
      const fileInput = document.querySelector('input#sb_fileinput, input[type="file"]');
      if (fileInput) {
        clearInterval(checkBing);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        removePageBadge();
        return;
      }
      if (attempts > 30) {
        clearInterval(checkBing);
        removePageBadge();
      }
    }, 250);
  }

  function showPageBadge(text) {
    removePageBadge();
    const badge = document.createElement('div');
    badge.id = 'sbi-page-badge';
    badge.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: #fff;
      padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    badge.textContent = text;
    document.documentElement.appendChild(badge);
  }

  function removePageBadge() {
    const el = document.getElementById('sbi-page-badge');
    if (el) el.remove();
  }

  function showTopStatus(html, timeout = 3000) {
    ensureUI();
    if (!topBanner) return;
    topBanner.innerHTML = html;
    topBanner.style.display = 'flex';
    clearTimeout(topBanner._timer);
    topBanner._timer = setTimeout(() => {
      topBanner.style.display = 'none';
    }, timeout);
  }

  // --- VISUAL CHECKMARK SYNC (Instant DOM Toggle) ---
  function updateMenuSelectionVisual(selectedKey) {
    if (!shadowRoot) return;
    const menuList = shadowRoot.getElementById('sbi-menu-list');
    if (!menuList) return;
    menuList.querySelectorAll('.menu-item').forEach((el) => {
      const key = el.dataset.engine || el.dataset.action;
      const isSel = key === selectedKey;
      el.classList.toggle('selected', isSel);
      const chk = el.querySelector('.engine-check');
      if (chk) chk.style.display = isSel ? 'inline-block' : 'none';
    });
  }

  // --- REFRESH FLOATING PANEL ENGINES LIST ---
  function refreshPanelEngineList() {
    if (!shadowRoot) return;
    const menuList = shadowRoot.getElementById('sbi-menu-list');
    if (!menuList) return;

    // Filter and sort engines according to options
    const order = currentOptions.engineOrder || ALL_ENGINES.map(e => e.id);
    const enabled = currentOptions.enabledEngines || [];

    const sortedEngines = order
      .filter(id => enabled.includes(id))
      .map(id => ALL_ENGINES.find(e => e.id === id))
      .filter(Boolean);

    const activeKey = pendingEngine || currentOptions.defaultEngine || 'googleLens';

    let html = `
      <div class="menu-item ${activeKey === 'all' ? 'selected' : ''}" data-action="all" data-engine-id="all">
        ${currentOptions.showEngineIcons ? `<span class="icon">${SVG_ICONS.all}</span>` : ''}
        <span class="label">${t('allSearchEngines')}</span>
        <span class="engine-check" style="${activeKey === 'all' ? 'display:inline-block;' : 'display:none;'}">✓</span>
      </div>
    `;

    for (const eng of sortedEngines) {
      const isSelected = activeKey === eng.id;
      const iconSvg = SVG_ICONS[eng.id] || SVG_ICONS.default;
      html += `
        <div class="menu-item ${isSelected ? 'selected' : ''}" data-engine="${eng.id}" data-engine-id="${eng.id}">
          ${currentOptions.showEngineIcons ? `<span class="icon">${iconSvg}</span>` : ''}
          <span class="label">${eng.name}</span>
          <span class="engine-check" style="${isSelected ? 'display:inline-block;' : 'display:none;'}">✓</span>
        </div>
      `;
    }

    menuList.innerHTML = html;

    // Attach click listeners with instant checkmark and tap feedback
    menuList.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const engineKey = item.dataset.engine || action;

        // Visual click feedback: pulse animation & move checkmark
        menuList.querySelectorAll('.menu-item').forEach(el => {
          el.classList.remove('selected', 'pulse');
          const chk = el.querySelector('.engine-check');
          if (chk) chk.style.display = 'none';
        });

        item.classList.add('selected', 'pulse');
        const myCheck = item.querySelector('.engine-check');
        if (myCheck) myCheck.style.display = 'inline-block';

        if (action === 'all') {
          onEngineItemClicked('all');
        } else if (engineKey) {
          onEngineItemClicked(engineKey);
        }
      });
    });
  }

  // --- UI CREATION// --- UI CREATION (Shadow DOM Isolated) ---
  function ensureUI() {
    if (overlayContainer) {
      if (!overlayContainer.isConnected) {
        (document.documentElement || document.body).appendChild(overlayContainer);
      }
      return;
    }

    loadUserOptions();

    overlayContainer = document.createElement('div');
    overlayContainer.id = 'sbi-overlay-host';
    overlayContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 2147483647;';
    (document.documentElement || document.body).appendChild(overlayContainer);

    shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        user-select: none;
      }

      /* Visual element selection highlight */
      .highlight-box {
        position: fixed;
        display: none;
        pointer-events: none;
        border: 2px solid #2563eb;
        background: rgba(37, 99, 235, 0.16);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8), 0 4px 18px rgba(37, 99, 235, 0.45);
        z-index: 2147483640;
        transition: top 0.05s ease-out, left 0.05s ease-out, width 0.05s ease-out, height 0.05s ease-out;
      }
      
      .highlight-badge {
        position: absolute;
        top: -26px;
        left: -2px;
        background: #2563eb;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }

      /* Screen Area Crop Box (Capture Mode) */
      .capture-box {
        position: fixed;
        display: none;
        pointer-events: none;
        border: 2px dashed #38bdf8;
        background: rgba(56, 189, 248, 0.18);
        box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.45);
        z-index: 2147483644;
      }
      .capture-badge {
        position: absolute;
        bottom: -28px;
        left: 0;
        background: #0284c7;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }

      /* Notification Banner */
      .top-banner {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(24, 24, 27, 0.94);
        backdrop-filter: blur(12px);
        color: #ffffff;
        padding: 10px 22px;
        border-radius: 50px;
        font-size: 13.5px;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15);
        z-index: 2147483645;
        display: none;
        align-items: center;
        gap: 12px;
        pointer-events: auto;
      }

      /* Pinned & Draggable Panel - Modern Premium Wider Design */
        .menu-card {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(18, 19, 24, 0.97);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          color: #f4f4f5;
          width: 248px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08);
          z-index: 2147483647;
          pointer-events: auto;
          display: none;
          animation: menuFadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1);
          transition: width 0.15s ease, box-shadow 0.15s ease;
        }

      @keyframes menuFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Compact Draggable Header */
      .menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 7px 6px 8px;
        cursor: grab;
        position: relative;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        gap: 6px;
      }
      .menu-header:active {
        cursor: grabbing;
      }

      /* Mode Selector Pill - Compact, Sharp & Natural */
      .menu-title-wrap {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 500;
        color: #ececed;
        cursor: pointer;
        padding: 4px 7px;
        border-radius: 3px;
        background: #252630;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
        user-select: none;
      }
      .menu-title-wrap:hover {
        background: #2e303c;
        border-color: rgba(255, 255, 255, 0.22);
        color: #ffffff;
      }
      .menu-title-wrap:active {
        background: #1e1f27;
      }
      .menu-title-wrap .mode-trigger-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        color: #9ca3af;
        flex-shrink: 0;
        transition: color 0.12s ease;
      }
      .menu-title-wrap:hover .mode-trigger-icon {
        color: #d1d5db;
      }
      .menu-title-wrap .mode-trigger-icon svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .menu-title-wrap .mode-trigger-arrow {
        fill: #9ca3af;
        margin-top: 1px;
        transition: fill 0.12s ease;
      }
      .menu-title-wrap:hover .mode-trigger-arrow {
        fill: #e5e7eb;
      }

      .menu-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .menu-action-icon {
        background: transparent;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 3px;
        transition: color 0.12s, background 0.12s;
        padding: 0;
      }
      .menu-action-icon svg {
        width: 12px;
        height: 12px;
        fill: currentColor;
      }
      .menu-action-icon:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }
      .menu-action-icon:active {
        background: rgba(255, 255, 255, 0.16);
      }

      /* Mode Switcher Dropdown - Compact & Sharp */
      .mode-dropdown {
        position: absolute;
        top: 36px;
        left: 6px;
        background: #1e1e24;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        padding: 4px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.75);
        z-index: 2147483647;
        display: none;
        flex-direction: column;
        gap: 2px;
        width: 185px;
        max-height: 220px;
        overflow-y: auto;
      }
      .mode-dropdown::-webkit-scrollbar {
        width: 4px;
      }
      .mode-dropdown::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
      }
      .mode-option {
        padding: 5px 8px;
        border-radius: 3px;
        font-size: 12px;
        color: #d4d4d8;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.1s;
      }
      .mode-option:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }
      .mode-option .mode-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        color: #9ca3af;
        flex-shrink: 0;
      }
      .mode-option .mode-icon svg {
        width: 15px;
        height: 15px;
      }
      .mode-option:hover .mode-icon {
        color: #ffffff;
      }

      /* URL MODE */
      .url-settings {
        display: none;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .url-field-underlined {
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 1px solid #71717a;
        color: #f4f4f5;
        font-size: 12px;
        padding: 4px 0 5px 0;
        outline: none;
        transition: border-color 0.15s;
        caret-color: #ffffff;
      }
      .url-field-underlined::placeholder {
        color: #71717a;
      }
      .url-field-underlined:focus {
        border-bottom-color: #ffffff;
      }

      /* BROWSE MODE */
      .browse-settings {
        display: none;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .browse-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
      }
      .browse-pill-btn {
        flex: 1;
        background: #2b2c36;
        color: #ececed;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        font-size: 12px;
        font-weight: 500;
        padding: 5px 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s, border-color 0.12s;
      }
      .browse-pill-btn:hover {
        background: #363845;
        border-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }
      .browse-pill-btn:active {
        background: #202129;
      }

      /* Engines Menu List - Sleek & Compact */
      .menu-list {
        padding: 3px 4px 5px 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 380px;
        overflow-y: auto;
      }
      .menu-list::-webkit-scrollbar {
        width: 4px;
      }
      .menu-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
      }

      .menu-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 7px;
        border-radius: 3px;
        cursor: pointer;
        color: #d4d4d8;
        font-size: 12.5px;
        font-weight: 450;
        transition: background 0.12s ease, color 0.12s ease;
        user-select: none;
      }
      .menu-item:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
      }
      .menu-item:active {
        background: rgba(255, 255, 255, 0.12);
      }
      .menu-item.selected {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        font-weight: 500;
      }
      .menu-item.pulse {
        animation: itemSelectPulse 0.18s ease-out;
      }
      @keyframes itemSelectPulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.98); background: rgba(255, 255, 255, 0.18); }
        100% { transform: scale(1); }
      }
      .menu-item .engine-check {
        margin-left: auto;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        padding-left: 6px;
      }
      .menu-item .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      .menu-item .icon svg {
        width: 16px;
        height: 16px;
      }
      .menu-item .label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Minimized Compact View */
      .menu-card.minimized .menu-list,
      .menu-card.minimized .url-settings,
      .menu-card.minimized .browse-settings,
      .menu-card.minimized .capture-settings,
      .menu-card.minimized .mode-dropdown {
        display: none !important;
      }
      .menu-card.minimized {
        width: auto !important;
      }
      .menu-card.minimized .menu-header {
        border-bottom: none;
        padding: 5px 8px;
      }

      /* ========================================================
         OPTIONS MODAL (Sleek 2-Column Dark Theme with Service Icons)
         ======================================================== */
      .options-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.76);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2147483647;
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        animation: optFadeIn 0.15s ease-out;
      }

      @keyframes optFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .options-modal {
        position: relative;
        width: 820px;
        max-width: 95vw;
        height: 84vh;
        max-height: 820px;
        background: #18181f;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
      }

      .options-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 22px;
        background: #1e1e27;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .options-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .options-app-icon svg, .options-app-icon img {
        width: 24px;
        height: 24px;
        display: block;
      }
      .options-modal-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 0.2px;
      }

      .options-header-actions {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .options-save-pill {
        font-size: 12px;
        font-weight: 600;
        color: #a78bfa;
        background: rgba(167, 139, 250, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .options-save-pill.show {
        opacity: 1;
      }
      .options-close-btn {
        background: transparent;
        border: none;
        color: #a1a1aa;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 6px;
        transition: background 0.12s, color 0.12s;
      }
      .options-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      /* Options 2-Column Body */
      .options-body {
        display: grid;
        grid-template-columns: 340px 1fr;
        height: calc(100% - 63px);
        overflow: hidden;
      }

      .options-col {
        overflow-y: auto;
        padding: 24px 22px;
      }
      .options-col::-webkit-scrollbar {
        width: 6px;
      }
      .options-col::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.18);
        border-radius: 3px;
      }

      .options-col-engines {
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .options-sec-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4px;
      }
      .options-sec-desc {
        font-size: 12.5px;
        color: #9ca3af;
        margin-bottom: 16px;
        line-height: 1.4;
      }

      /* Checkbox List in Column 1 with Service Profile Photos */
      .options-engines-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sbi-checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.1s ease;
      }
      .sbi-checkbox-row:hover {
        background: rgba(255, 255, 255, 0.06);
      }
      .sbi-checkbox-box {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 2px solid #52525b;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.12s ease;
      }
      .sbi-checkbox-row.checked .sbi-checkbox-box {
        background: #9d70e4;
        border-color: #9d70e4;
      }
      .sbi-checkbox-row .sbi-check-svg {
        display: none;
        width: 12px;
        height: 12px;
        fill: #ffffff;
      }
      .sbi-checkbox-row.checked .sbi-check-svg {
        display: block;
      }
      .sbi-engine-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .sbi-engine-icon svg, .sbi-engine-icon img {
        width: 18px;
        height: 18px;
        display: block;
      }
      .sbi-checkbox-label {
        font-size: 13.5px;
        color: #e4e4e7;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sbi-reorder-group {
        display: flex;
        align-items: center;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.12s;
      }
      .sbi-checkbox-row:hover .sbi-reorder-group {
        opacity: 1;
      }
      .sbi-reorder-btn {
        background: transparent;
        border: none;
        color: #71717a;
        cursor: pointer;
        padding: 1px 4px;
        font-size: 10px;
        border-radius: 3px;
        line-height: 1;
      }
      .sbi-reorder-btn:hover {
        color: #ffffff;
        background: rgba(255,255,255,0.15);
      }

      /* Switch Row in Column 2 */
      .sbi-switch-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 8px 0;
        cursor: pointer;
      }
      .sbi-switch-track {
        width: 36px;
        height: 20px;
        border-radius: 10px;
        background: #3e3d4a;
        position: relative;
        flex-shrink: 0;
        transition: background 0.15s ease;
      }
      .sbi-switch-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ffffff;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .sbi-switch-row.checked .sbi-switch-track {
        background: #9d70e4;
      }
      .sbi-switch-row.checked .sbi-switch-thumb {
        transform: translateX(16px);
      }
      .sbi-switch-label {
        font-size: 13.5px;
        color: #ededf2;
        user-select: none;
      }

      /* Select Box with Floating Label in Column 2 */
      .sbi-select-box {
        position: relative;
        border: 1px solid #3f3f46;
        border-radius: 8px;
        background: #14141a;
        padding: 0;
        margin: 14px 0;
      }
      .sbi-select-label {
        position: absolute;
        top: -8px;
        left: 10px;
        background: #18181f;
        padding: 0 4px;
        font-size: 11px;
        color: #a1a1aa;
        pointer-events: none;
        z-index: 2;
      }
      .sbi-native-select {
        width: 100%;
        border: none;
        background: transparent;
        color: #ffffff;
        padding: 10px 14px;
        font-size: 13.5px;
        font-family: inherit;
        outline: none;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
      }
      .sbi-native-select option {
        background: #18181f;
        color: #ffffff;
      }
      .sbi-select-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        fill: #a1a1aa;
      }

      .reset-defaults-box {
        margin-top: 26px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .reset-defaults-btn {
        background: transparent;
        border: 1px solid #52525b;
        color: #d4d4d8;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 12.5px;
        cursor: pointer;
        transition: background 0.12s, color 0.12s;
      }
      .reset-defaults-btn:hover {
        background: rgba(255,255,255,0.08);
        color: #ffffff;
      }
    `;
    shadowRoot.appendChild(style);

    // Highlight box for Element Selection
    highlightBox = document.createElement('div');
    highlightBox.className = 'highlight-box';
    highlightBadge = document.createElement('div');
    highlightBadge.className = 'highlight-badge';
    highlightBadge.textContent = '🖼️ Image';
    highlightBox.appendChild(highlightBadge);
    shadowRoot.appendChild(highlightBox);

    // Capture box for Area Cropping
    captureBox = document.createElement('div');
    captureBox.className = 'capture-box';
    captureBadge = document.createElement('div');
    captureBadge.className = 'capture-badge';
    captureBadge.textContent = '0 × 0';
    captureBox.appendChild(captureBadge);
    shadowRoot.appendChild(captureBox);

    // Top notification banner
    topBanner = document.createElement('div');
    topBanner.className = 'top-banner';
    shadowRoot.appendChild(topBanner);

    // Floating Menu Card
    menuCard = document.createElement('div');
    menuCard.className = 'menu-card';
    menuCard.id = 'sbi-menu-card';
    menuCard.innerHTML = `
      <div class="menu-header" id="sbi-header">
        <div class="menu-title-wrap" id="sbi-mode-trigger" title="Switch Mode (Click)">
          <span class="mode-trigger-icon" id="sbi-mode-trigger-icon">${MODE_ICONS.select_url}</span>
          <span id="sbi-mode-label">Select URL</span>
          <svg class="mode-trigger-arrow" width="13" height="13" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="menu-actions">
          <button class="menu-action-icon" id="sbi-btn-options" title="Options">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
          <button class="menu-action-icon" id="sbi-btn-minimize" title="Minimize / Expand">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
          </button>
          <button class="menu-action-icon" id="sbi-btn-close" title="Close Panel">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <!-- Mode Switcher Dropdown (5 Official Modes) -->
        <div class="mode-dropdown" id="sbi-mode-dropdown">
          <div class="mode-option" data-mode="Select URL">
            <span class="mode-icon">${MODE_ICONS.select_url}</span>
            <span>Select URL</span>
          </div>
          <div class="mode-option" data-mode="Select image">
            <span class="mode-icon">${MODE_ICONS.select_image}</span>
            <span>Select image</span>
          </div>
          <div class="mode-option" data-mode="Capture">
            <span class="mode-icon">${MODE_ICONS.capture}</span>
            <span>Capture</span>
          </div>
          <div class="mode-option" data-mode="Browse">
            <span class="mode-icon">${MODE_ICONS.browse}</span>
            <span>Browse</span>
          </div>
          <div class="mode-option" data-mode="URL">
            <span class="mode-icon">${MODE_ICONS.url}</span>
            <span>URL</span>
          </div>
        </div>
      </div>

      <!-- URL Mode View: Underlined Input -->
      <div class="url-settings" id="sbi-url-settings">
        <input type="text" class="url-field-underlined" id="sbi-url-field" placeholder="Image URL (Press Enter or click engine)" autocomplete="off" spellcheck="false" />
      </div>

      <!-- Browse Mode View: Pill Buttons Browse & Paste -->
      <div class="browse-settings" id="sbi-browse-settings">
        <div class="browse-buttons">
          <button class="browse-pill-btn" id="sbi-btn-browse">Browse</button>
          <button class="browse-pill-btn" id="sbi-btn-paste">Paste</button>
        </div>
      </div>

      <!-- Capture Mode View: Drag to Crop Button -->
      <div class="capture-settings" id="sbi-capture-settings" style="display: none; padding: 8px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <button class="browse-pill-btn" id="sbi-btn-crop" style="width: 100%; background: #2563eb; color: #ffffff; gap: 6px; border-radius: 3px;">
          ✂️ Drag to Crop Area
        </button>
      </div>

      <!-- Dynamically Rendered Engines List -->
      <div class="menu-list" id="sbi-menu-list">
        <!-- Rendered by refreshPanelEngineList() -->
      </div>
    `;
    shadowRoot.appendChild(menuCard);

    // Initial render of panel engines list
    refreshPanelEngineList();

    // Draggable header
    const header = shadowRoot.getElementById('sbi-header');
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.menu-actions, .menu-title-wrap, .mode-dropdown')) return;
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
      header.style.cursor = 'grabbing';header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      let newX = initialLeft + dx;
      let newY = initialTop + dy;

      const w = menuCard.offsetWidth || 258;
      const h = menuCard.offsetHeight || 42;
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
        header.style.cursor = 'grab';
        clampMenuToViewport();
      }
    });

    // Header buttons
    shadowRoot.getElementById('sbi-btn-options').addEventListener('click', openOptionsMenu);
    shadowRoot.getElementById('sbi-btn-close').addEventListener('click', closeMenu);
    shadowRoot.getElementById('sbi-btn-minimize').addEventListener('click', () => {
      isMinimized = !isMinimized;
      menuCard.classList.toggle('minimized', isMinimized);
      const minBtn = shadowRoot.getElementById('sbi-btn-minimize');
      minBtn.innerHTML = isMinimized
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>`;

      setTimeout(clampMenuToViewport, 10);
      setTimeout(clampMenuToViewport, 120);
    });

    // Browse and Paste buttons
    shadowRoot.getElementById('sbi-btn-browse').addEventListener('click', () => {
      const activeEng = pendingEngine || currentOptions.defaultEngine || 'all';
      triggerBrowseFile(activeEng);
      pendingEngine = null;
      updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');
    });
    shadowRoot.getElementById('sbi-btn-paste').addEventListener('click', () => {
      const activeEng = pendingEngine || currentOptions.defaultEngine || 'all';
      triggerClipboardPaste(activeEng);
      pendingEngine = null;
      updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');
    });

    shadowRoot.getElementById('sbi-btn-crop')?.addEventListener('click', () => {
      const activeEng = pendingEngine || currentOptions.defaultEngine || 'googleLens';
      startCaptureMode(activeEng);
    });

    // Mode dropdown toggle
    const modeTrigger = shadowRoot.getElementById('sbi-mode-trigger');
    const modeDropdown = shadowRoot.getElementById('sbi-mode-dropdown');
    modeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      modeDropdown.style.display = modeDropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    shadowRoot.querySelectorAll('.mode-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        modeDropdown.style.display = 'none';
        const mode = opt.dataset.mode;
        setMode(mode);
        if (mode === 'Capture') {
          const activeEng = pendingEngine || currentOptions.defaultEngine || 'googleLens';
          startCaptureMode(activeEng);
        }
      });
    });

    // URL input Enter key
    const urlInput = shadowRoot.getElementById('sbi-url-field');
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = urlInput.value.trim();
        if (val) {
          const activeEng = pendingEngine || currentOptions.defaultEngine || 'all';
          dispatchSearch(activeEng, val, null);
          urlInput.value = '';
          pendingEngine = null;
          updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');
        }
      }
    });

    // Construct Options Modal (No sponsors, 2-column layout with service icons)
    setupOptionsModal();

    // Default startup mode is Select URL (with distinct active UI)
    setMode('Select URL', false);
  }

  // --- FULLY LOCALIZED OPTIONS MODAL BUILDER (100% Dual-Language TR & ENG) ---
  function buildOptionsModalContentHtml() {
    return `
      <div class="options-modal">
        <div class="options-header">
          <div class="options-title-group">
            <span class="options-app-icon">${SVG_ICONS.app_icon || SVG_ICONS.all}</span>
            <span class="options-modal-title">${t('optionsTitle')}</span>
          </div>
          <div class="options-header-actions">
            <span class="options-save-pill" id="sbi-save-pill">${t('saved')}</span>
            <button class="options-close-btn" id="sbi-opt-close" title="${t('closeEsc')}">✕</button>
          </div>
        </div>

        <div class="options-body">
          <!-- COLUMN 1: SEARCH ENGINES (with Service Profile Icons) -->
          <div class="options-col options-col-engines">
            <div class="options-sec-title">${t('secEngines')}</div>
            <div class="options-sec-desc">${t('secEnginesDesc')}</div>
            <div class="options-engines-list" id="sbi-opt-engines-list">
              <!-- Dynamically populated with icons -->
            </div>
          </div>

          <!-- COLUMN 2: SETTINGS (General, Shortcuts, Miscellaneous) -->
          <div class="options-col options-col-settings">
            <!-- General Settings (Language, Tab Behavior, Search/Upload Mode) -->
            <div class="options-sec-title">${t('secGeneral')}</div>
            
            <div class="sbi-select-box">
              <div class="sbi-select-label" id="sbi-lbl-lang">${t('optLanguage')}</div>
              <select class="sbi-native-select" data-key="lang" id="sbi-opt-lang">
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="sbi-select-box">
              <div class="sbi-select-label" id="sbi-lbl-tab-focus">${t('optTabFocus')}</div>
              <select class="sbi-native-select" data-key="tabFocus" id="sbi-opt-tab-focus">
                <option value="background">${t('tabFocusBackground')}</option>
                <option value="foreground">${t('tabFocusForeground')}</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="sbi-select-box">
              <div class="sbi-select-label" id="sbi-lbl-upload-provider">${t('optUploadProvider')}</div>
              <select class="sbi-native-select" data-key="uploadProvider" id="sbi-opt-upload-provider">
                <option value="clipboard">${t('uploadProviderClipboard')}</option>
                <option value="imgur">${t('uploadProviderImgur')}</option>
                <option value="litterbox">${t('uploadProviderLitterbox')}</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <!-- Shortcuts & Default Engine Section -->
            <div class="options-sec-title" style="margin-top: 24px;">${t('secShortcuts')}</div>
            
            <div class="sbi-select-box">
              <div class="sbi-select-label">${t('optDefaultEngine')}</div>
              <select class="sbi-native-select" data-key="defaultEngine" id="sbi-opt-default-engine">
                <option value="googleLens">Google Lens</option>
                <option value="all">${t('allSearchEngines')}</option>
                <option value="yandex">Yandex.Images</option>
                <option value="lenso">Lenso.ai</option>
                <option value="bing">Bing Images</option>
                <option value="pinterest">Pinterest</option>
                <option value="tineye">TinEye</option>
                <option value="whatanime">trace.moe</option>
                <option value="saucenao">SauceNAO</option>
                <option value="baidu">Baidu Image Search</option>
                <option value="sogou">Sogou Images</option>
                <option value="kagi">Kagi Search</option>
                <option value="lexica">Lexica</option>
                <option value="unsplash">Unsplash</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="sbi-select-box">
              <div class="sbi-select-label">${t('optMenuShortcut')}</div>
              <select class="sbi-native-select" data-key="menuShortcut" id="sbi-opt-menu-shortcut">
                <option value="alt_e">Alt + E</option>
                <option value="alt_q">Alt + Q</option>
                <option value="alt_z">Alt + Z</option>
                <option value="tilde">Tilde (~ / &#96;)</option>
                <option value="f4">F4</option>
                <option value="f8">F8</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="sbi-select-box">
              <div class="sbi-select-label">${t('optSelectionShortcut')}</div>
              <select class="sbi-native-select" data-key="selectionShortcut" id="sbi-opt-selection-shortcut">
                <option value="alt_w">Alt + W</option>
                <option value="alt_a">Alt + A</option>
                <option value="alt_s">Alt + S</option>
                <option value="alt_c">Alt + C</option>
                <option value="alt_q">Alt + Q</option>
                <option value="alt_e">Alt + E</option>
                <option value="none">${t('shortcutDisabled')}</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <!-- Miscellaneous Section -->
            <div class="options-sec-title" style="margin-top: 24px;">${t('secMisc')}</div>

            <div class="sbi-switch-row" data-key="tabInBackgound">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optTabInBackground')}</span>
            </div>

            <div class="sbi-switch-row" data-key="imgFullParse">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optDeepSearch')}</span>
            </div>

            <div class="sbi-switch-row" data-key="detectAltImageDimension">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optAltDimensions')}</span>
            </div>

            <div class="sbi-switch-row" data-key="convertSharedImage">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optConvertShared')}</span>
            </div>

            <div class="sbi-switch-row" data-key="viewImageUseViewer">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optViewer')}</span>
            </div>

            <div class="sbi-switch-row" data-key="confirmPaste">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optConfirmPaste')}</span>
            </div>

            <div class="sbi-switch-row" data-key="bypassImageHostBlocking">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optBypassBlocking')}</span>
            </div>

            <div class="sbi-switch-row" data-key="showEngineIcons">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optShowIcons')}</span>
            </div>

            <div class="sbi-switch-row" data-key="localGoogle">
              <div class="sbi-switch-track"><div class="sbi-switch-thumb"></div></div>
              <span class="sbi-switch-label">${t('optLocalGoogle')}</span>
            </div>

            <div class="sbi-select-box">
              <div class="sbi-select-label">${t('optYandexDomain')}</div>
              <select class="sbi-native-select" data-key="yandexHost">
                <option value="yandex.com">yandex.com</option>
                <option value="yandex.ru">yandex.ru</option>
              </select>
              <svg class="sbi-select-arrow" width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>

            <div class="reset-defaults-box">
              <button class="reset-defaults-btn" id="sbi-btn-reset-defaults">${t('resetDefaults')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setupOptionsModal() {
    if (!optionsOverlay) {
      optionsOverlay = document.createElement('div');
      optionsOverlay.className = 'options-overlay';
      optionsOverlay.id = 'sbi-options-overlay';
      shadowRoot.appendChild(optionsOverlay);
    }
    rebuildOptionsModalContent();
  }

  function rebuildOptionsModalContent() {
    if (!optionsOverlay) return;
    optionsOverlay.innerHTML = buildOptionsModalContentHtml();
    bindOptionsModalEvents();
    renderOptionsEnginesList();
    syncOptionsFormControls();
  }

  function bindOptionsModalEvents() {
    if (!optionsOverlay) return;

    // Close button & overlay click
    const closeBtn = shadowRoot.getElementById('sbi-opt-close');
    if (closeBtn) closeBtn.onclick = closeOptionsMenu;

    optionsOverlay.onclick = (e) => {
      if (e.target === optionsOverlay) closeOptionsMenu();
    };

    // Reset Defaults
    const resetBtn = shadowRoot.getElementById('sbi-btn-reset-defaults');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm(t('resetConfirm'))) {
          currentOptions = { ...DEFAULT_OPTIONS };
          GM_setValue('sbi_options', currentOptions);
          rebuildOptionsModalContent();
          updatePanelLanguageElements();
          flashSaveIndicator();
        }
      };
    }

    // Attach switch & select change listeners
    optionsOverlay.querySelectorAll('.sbi-switch-row').forEach((row) => {
      row.onclick = () => {
        const key = row.dataset.key;
        const isChecked = row.classList.toggle('checked');
        currentOptions[key] = isChecked;
        saveUserOptions({ [key]: isChecked });
        flashSaveIndicator();
      };
    });

    optionsOverlay.querySelectorAll('.sbi-native-select').forEach((sel) => {
      sel.onchange = () => {
        const key = sel.dataset.key;
        const val = sel.value;
        currentOptions[key] = val;
        saveUserOptions({ [key]: val });
        flashSaveIndicator();
        if (key === 'lang') {
          applyLanguageChange();
        }
        if (key === 'defaultEngine') {
          pendingEngine = null;
          updateMenuSelectionVisual(val);
        }
      };
    });
  }

  function applyLanguageChange() {
    rebuildOptionsModalContent();
    updatePanelLanguageElements();
  }

  function updatePanelLanguageElements() {
    const modeLabel = shadowRoot?.getElementById('sbi-mode-label');
    if (modeLabel) modeLabel.textContent = getModeTitle(currentMode);

    const modeDropdown = shadowRoot?.getElementById('sbi-mode-dropdown');
    if (modeDropdown) {
      modeDropdown.querySelectorAll('.mode-option').forEach(opt => {
        const mode = opt.dataset.mode;
        const nameSpan = opt.querySelector('span:not(.mode-icon)');
        if (nameSpan) nameSpan.textContent = getModeTitle(mode);
      });
    }

    const optBtn = shadowRoot?.getElementById('sbi-btn-options');
    if (optBtn) optBtn.title = t('optionsBtn');
    const minBtn = shadowRoot?.getElementById('sbi-btn-minimize');
    if (minBtn) minBtn.title = t('minimizeBtn');
    const clsBtn = shadowRoot?.getElementById('sbi-btn-close');
    if (clsBtn) clsBtn.title = t('closeBtn');

    const urlField = shadowRoot?.getElementById('sbi-url-field');
    if (urlField) urlField.placeholder = t('urlInputPlaceholder');
    const browseBtn = shadowRoot?.getElementById('sbi-btn-browse');
    if (browseBtn) browseBtn.textContent = t('browseBtn');
    const pasteBtn = shadowRoot?.getElementById('sbi-btn-paste');
    if (pasteBtn) pasteBtn.textContent = t('pasteBtn');
    const cropBtn = shadowRoot?.getElementById('sbi-btn-crop');
    if (cropBtn) cropBtn.innerHTML = t('dragToCropBtn');

    refreshPanelEngineList();
  }

  // Populate & Sync Options Controls (with Profile Icons)
  function renderOptionsEnginesList() {
    const listContainer = shadowRoot?.getElementById('sbi-opt-engines-list');
    if (!listContainer) return;

    const order = currentOptions.engineOrder || ALL_ENGINES.map(e => e.id);
    const enabled = currentOptions.enabledEngines || [];

    let html = '';
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const engine = ALL_ENGINES.find(e => e.id === id);
      if (!engine) continue;

      const isChecked = enabled.includes(id);
      const iconHtml = SVG_ICONS[id] || SVG_ICONS.default;

      html += `
        <div class="sbi-checkbox-row ${isChecked ? 'checked' : ''}" data-engine-id="${id}" data-index="${i}">
          <div class="sbi-checkbox-box">
            <svg class="sbi-check-svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <div class="sbi-engine-icon">${iconHtml}</div>
          <span class="sbi-checkbox-label">${engine.name}</span>
          <div class="sbi-reorder-group">
            <button class="sbi-reorder-btn sbi-reorder-up" title="Move Up">▲</button>
            <button class="sbi-reorder-btn sbi-reorder-down" title="Move Down">▼</button>
          </div>
        </div>
      `;
    }

    listContainer.innerHTML = html;

    // Attach checkbox toggle and reorder listeners
    listContainer.querySelectorAll('.sbi-checkbox-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.sbi-reorder-btn')) return;
        const id = row.dataset.engineId;
        const isChecked = row.classList.toggle('checked');
        let enabled = [...(currentOptions.enabledEngines || [])];
        if (isChecked) {
          if (!enabled.includes(id)) enabled.push(id);
        } else {
          enabled = enabled.filter(x => x !== id);
        }
        saveUserOptions({ enabledEngines: enabled });
      });
    });

    // Up / Down reordering
    listContainer.querySelectorAll('.sbi-reorder-up').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.sbi-checkbox-row');
        const idx = parseInt(row.dataset.index, 10);
        if (idx > 0) {
          const order = [...(currentOptions.engineOrder || ALL_ENGINES.map(e => e.id))];
          const temp = order[idx];
          order[idx] = order[idx - 1];
          order[idx - 1] = temp;
          saveUserOptions({ engineOrder: order });
          renderOptionsEnginesList();
        }
      });
    });

    listContainer.querySelectorAll('.sbi-reorder-down').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.sbi-checkbox-row');
        const idx = parseInt(row.dataset.index, 10);
        const order = [...(currentOptions.engineOrder || ALL_ENGINES.map(e => e.id))];
        if (idx < order.length - 1) {
          const temp = order[idx];
          order[idx] = order[idx + 1];
          order[idx + 1] = temp;
          saveUserOptions({ engineOrder: order });
          renderOptionsEnginesList();
        }
      });
    });
  }

  function syncOptionsFormControls() {
    if (!optionsOverlay) return;

    // Sync switches
    optionsOverlay.querySelectorAll('.sbi-switch-row').forEach((row) => {
      const key = row.dataset.key;
      const val = currentOptions[key];
      row.classList.toggle('checked', !!val);
    });

    // Sync selects
    optionsOverlay.querySelectorAll('.sbi-native-select').forEach((sel) => {
      const key = sel.dataset.key;
      if (currentOptions[key] !== undefined) {
        sel.value = currentOptions[key];
      }
    });
  }

  function flashSaveIndicator() {
    const pill = shadowRoot?.getElementById('sbi-save-pill');
    if (!pill) return;
    pill.classList.add('show');
    clearTimeout(pill._timer);
    pill._timer = setTimeout(() => pill.classList.remove('show'), 1500);
  }

  function openOptionsMenu() {
    ensureUI();
    isOptionsModalOpen = true;
    if (overlayContainer) {
      overlayContainer.style.width = '100vw';
      overlayContainer.style.height = '100vh';
    }
    rebuildOptionsModalContent();
    if (optionsOverlay) optionsOverlay.style.display = 'flex';
  }

  function closeOptionsMenu() {
    isOptionsModalOpen = false;
    if (optionsOverlay) optionsOverlay.style.display = 'none';
    if (overlayContainer) {
      overlayContainer.style.width = '0';
      overlayContainer.style.height = '0';
    }
  }

  function setMode(mode, startAction = true) {
    currentMode = mode;
    const label = shadowRoot?.getElementById('sbi-mode-label');
    if (label) label.textContent = getModeTitle(mode);

    const triggerIcon = shadowRoot?.getElementById('sbi-mode-trigger-icon');
    if (triggerIcon) {
      if (mode === 'Select URL' || mode === 'selectUrl') triggerIcon.innerHTML = MODE_ICONS.select_url;
      else if (mode === 'Select image' || mode === 'selectImage') triggerIcon.innerHTML = MODE_ICONS.select_image;
      else if (mode === 'Capture' || mode === 'capture') triggerIcon.innerHTML = MODE_ICONS.capture;
      else if (mode === 'Browse' || mode === 'browse') triggerIcon.innerHTML = MODE_ICONS.browse;
      else if (mode === 'URL' || mode === 'url') triggerIcon.innerHTML = MODE_ICONS.url;
    }

    const modeDropdown = shadowRoot?.getElementById('sbi-mode-dropdown');
    if (modeDropdown) {
      modeDropdown.querySelectorAll('.mode-option').forEach(opt => {
        if (opt.dataset.mode === mode) {
          opt.style.background = 'rgba(255, 255, 255, 0.12)';
          opt.style.color = '#ffffff';
          opt.style.fontWeight = '500';
        } else {
          opt.style.background = '';
          opt.style.color = '#e4e4e7';
          opt.style.fontWeight = 'normal';
        }
      });
    }

    const urlBox = shadowRoot?.getElementById('sbi-url-settings');
    const browseBox = shadowRoot?.getElementById('sbi-browse-settings');
    const captureBox = shadowRoot?.getElementById('sbi-capture-settings');

    if (urlBox) urlBox.style.display = mode === 'URL' ? 'block' : 'none';
    if (browseBox) browseBox.style.display = mode === 'Browse' ? 'block' : 'none';
    if (captureBox) captureBox.style.display = mode === 'Capture' ? 'block' : 'none';

    if (!startAction) return;

    const activeEng = pendingEngine || currentOptions.defaultEngine || 'googleLens';

    if (mode === 'URL') {
      stopSelectionMode();
      stopCaptureMode();
      const field = shadowRoot?.getElementById('sbi-url-field');
      if (field) setTimeout(() => field.focus(), 60);
      showTopStatus(`🔗 ${t('modeUrlStatus')}`, 2500);
    } else if (mode === 'Browse') {
      stopSelectionMode();
      stopCaptureMode();
      showTopStatus(`📁 ${t('modeBrowseStatus')}`, 2500);
    } else if (mode === 'Capture') {
      stopSelectionMode();
      startCaptureMode(activeEng);
    } else if (mode === 'Select URL') {
      stopCaptureMode();
      if (isSelectionMode) stopSelectionMode();
      startSelectionMode(activeEng, 'url');
    } else if (mode === 'Select image') {
      stopCaptureMode();
      if (isSelectionMode) stopSelectionMode();
      startSelectionMode(activeEng, 'image');
    }
    setTimeout(clampMenuToViewport, 15);
  }

  function openMenuPinned() {
    ensureUI();
    isMenuVisible = true;
    if (menuCard) {
      menuCard.style.display = 'block';

      if (!menuCard.dataset.userDragged) {
        menuCard.style.top = '20px';
        menuCard.style.right = '20px';
        menuCard.style.left = 'auto';
        menuCard.style.bottom = 'auto';
      } else {
        setTimeout(clampMenuToViewport, 15);
      }
    }
    updateMenuSelectionVisual(pendingEngine || currentOptions.defaultEngine || 'googleLens');
  }

  function closeMenu() {
    isMenuVisible = false;
    if (menuCard) menuCard.style.display = 'none';
    const modeDropdown = shadowRoot?.getElementById('sbi-mode-dropdown');
    if (modeDropdown) modeDropdown.style.display = 'none';
    stopSelectionMode();
    stopCaptureMode();
    pendingEngine = null;
    updateMenuSelectionVisual(currentOptions.defaultEngine || 'googleLens');
  }

  // Pre-load user options
  loadUserOptions();

  // Pure on-demand lazy initialization:
  // Inactive background tabs consume 0 DOM nodes, 0 shadow trees, and 0 idle CPU cycles.
  // ensureUI() is invoked instantly only when the user presses Alt+E / Alt+W or initiates a search.
})();
