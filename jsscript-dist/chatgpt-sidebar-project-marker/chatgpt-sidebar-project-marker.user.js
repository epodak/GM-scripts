// ==UserScript==
// @name         ChatGPT Sidebar Project Marker
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.17.055040
// @description  区分 ChatGPT 项目对话颜色，悬浮显示项目详情，并用同色细贝塞尔曲线连接当前可见的同项目对话。
// @author       epodak
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-sidebar-project-marker/chatgpt-sidebar-project-marker.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-sidebar-project-marker/chatgpt-sidebar-project-marker.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-sidebar-project-marker/src/main.js
  (() => {
    "use strict";
    const STYLE_ID = "jsscript-chatgpt-sidebar-project-marker";
    if (document.getElementById(STYLE_ID)) return;
    const LINK_SELECTOR = 'a[href*="/g/g-p-"][href*="/c/"]';
    const SCOPE = 'nav,aside,#sidebar,[data-testid*="sidebar" i],[data-testid*="history" i]';
    const CSS_TARGET = ":where(" + SCOPE + ') a:is([href^="/g/g-p-"],[href^="https://chatgpt.com/g/g-p-"])[href*="/c/"]';
    const css = [
      // Only decorate the actual text run: no full-row backgrounds or layout shifts.
      ":root{--jsp-surface:#fff;--jsp-text:#20242a;--jsp-muted:#68717d}",
      // Define dependent variables on each entry/card, not on :root:
      // inherited computed var() values would otherwise all use the fallback blue.
      ".jsp-project-tag,#jsp-project-card{",
      "--jsp-main:var(--jsp-accent,#2563eb);",
      "--jsp-tint:var(--jsp-light-tint,",
      "color-mix(in srgb,var(--jsp-accent,#2563eb) 13%,transparent))}",
      'html.dark,html[data-theme="dark"]{--jsp-surface:#25262a;',
      "--jsp-text:#f5f5f5;--jsp-muted:#a8afb9}",
      "html.dark .jsp-project-tag,html.dark #jsp-project-card,",
      'html[data-theme="dark"] .jsp-project-tag,',
      'html[data-theme="dark"] #jsp-project-card{',
      "--jsp-main:color-mix(in srgb,var(--jsp-accent,#2563eb) 68%,white);",
      "--jsp-tint:color-mix(in srgb,var(--jsp-accent,#2563eb) 24%,transparent)}",
      CSS_TARGET + ".jsp-project-tag{position:relative!important;isolation:isolate}",
      CSS_TARGET + '.jsp-project-tag::before{content:"";position:absolute;',
      "inset-inline-start:var(--jsp-bg-x);top:var(--jsp-bg-y);",
      "width:var(--jsp-bg-w);height:var(--jsp-bg-h);",
      "background:var(--jsp-tint);border-radius:5px;",
      "pointer-events:none;z-index:-1}",
      // Large product-style card with consistent per-project palette.
      "#jsp-project-card{position:fixed;z-index:2147483600;",
      "box-sizing:border-box;width:min(408px,calc(100vw - 24px));",
      "max-height:calc(100vh - 24px);overflow:auto;",
      "padding:16px 18px 14px;color:var(--jsp-text);",
      "background:color-mix(in srgb,var(--jsp-main) 4%,var(--jsp-surface));",
      "border:1px solid color-mix(in srgb,var(--jsp-main) 33%,#e5e7eb);",
      "border-radius:16px;box-shadow:0 12px 30px rgba(15,23,42,.12);",
      'font:12.5px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}',
      "#jsp-project-card[hidden]{display:none!important}",
      "#jsp-project-card .jsp-hero{display:flex;align-items:center;gap:16px}",
      "#jsp-project-card .jsp-folder{width:44px;height:44px;flex:0 0 44px;",
      "display:flex;align-items:center;justify-content:center;",
      "border-radius:16px;color:var(--jsp-main);",
      "background:color-mix(in srgb,var(--jsp-main) 13%,transparent)}",
      "#jsp-project-card .jsp-heading{min-width:0;flex:1}",
      "#jsp-project-card .jsp-eyebrow{color:var(--jsp-main);",
      "font-size:10.5px;font-weight:750;letter-spacing:.08em;",
      "text-transform:uppercase}",
      "#jsp-project-card .jsp-title{color:var(--jsp-text);",
      "font-size:18px;line-height:1.28;font-weight:720;",
      "overflow-wrap:anywhere;margin-top:6px}",
      "#jsp-project-card .jsp-desc{margin:12px 0 0;",
      "font-size:12.5px;line-height:1.5;color:var(--jsp-muted);",
      "white-space:pre-wrap;overflow-wrap:anywhere;max-height:7.5em;overflow-y:auto;scrollbar-width:thin}",
      "#jsp-project-card .jsp-desc-label{margin-top:12px;",
      "font-size:10px;font-weight:700;letter-spacing:.025em;color:var(--jsp-main)}",
      "#jsp-project-card .jsp-desc-label[hidden]{display:none!important}",
      "#jsp-project-card .jsp-desc-label:not([hidden])+.jsp-desc{margin-top:4px}",
      "#jsp-project-card .jsp-divider{height:1px;margin:14px 0 12px;",
      "background:color-mix(in srgb,var(--jsp-main) 19%,transparent)}",
      "#jsp-project-card .jsp-rows{display:grid;gap:11px}",
      "#jsp-project-card .jsp-row{display:flex;align-items:center;",
      "justify-content:space-between;gap:12px;min-width:0}",
      "#jsp-project-card .jsp-key{display:flex;align-items:center;",
      "gap:8px;min-width:0;color:var(--jsp-muted)}",
      "#jsp-project-card .jsp-key svg{width:16px;height:16px;",
      "flex:0 0 16px;color:var(--jsp-muted)}",
      "#jsp-project-card .jsp-value{min-width:0;text-align:right;",
      "color:var(--jsp-text);font-size:12px;font-weight:550;",
      "font-variant-numeric:tabular-nums}",
      "#jsp-project-card .jsp-id-wrap{display:flex;",
      "align-items:center;justify-content:flex-end;gap:10px;min-width:0}",
      "#jsp-project-card .jsp-id{display:block;min-width:0;",
      "max-width:140px;white-space:nowrap;overflow:hidden;",
      "text-overflow:ellipsis;direction:ltr;color:var(--jsp-muted)}",
      "#jsp-project-card .jsp-copy{display:inline-flex;",
      "align-items:center;justify-content:center;flex:0 0 26px;",
      "width:26px;height:26px;padding:3px;border:0;border-radius:6px;",
      "background:transparent;color:var(--jsp-main);cursor:pointer}",
      "#jsp-project-card .jsp-copy:hover{background:color-mix(in srgb,var(--jsp-main) 12%,transparent)}",
      "#jsp-project-card .jsp-copy:focus-visible{outline:2px solid var(--jsp-main);outline-offset:2px}",
      "#jsp-project-card .jsp-copy svg{width:18px;height:18px}",
      "#jsp-project-card .jsp-actions{display:flex;justify-content:flex-end;",
      "margin-top:14px}",
      "#jsp-project-card .jsp-open{color:var(--jsp-main);",
      "font-size:12px;text-decoration:none;font-weight:700}",
      "#jsp-project-card .jsp-open:hover{text-decoration:underline}",
      "#jsp-project-card .jsp-open:focus-visible{outline:2px solid var(--jsp-main);outline-offset:2px}",
      "#jsp-project-card .jsp-status{position:absolute;width:1px;height:1px;",
      "overflow:hidden;clip-path:inset(50%);white-space:nowrap}",
      'html.dark #jsp-project-card,html[data-theme="dark"] #jsp-project-card{',
      "background:color-mix(in srgb,var(--jsp-main) 8%,#25262a);",
      "border-color:color-mix(in srgb,var(--jsp-main) 50%,#575b67);",
      "box-shadow:0 18px 48px rgba(0,0,0,.35)}",
      "@media(max-width:520px){#jsp-project-card{padding:16px;",
      "border-radius:14px}#jsp-project-card .jsp-folder{width:44px;",
      "height:44px;flex-basis:44px;border-radius:12px}",
      "#jsp-project-card .jsp-hero{gap:12px}",
      "#jsp-project-card .jsp-title{font-size:19px}",
      "#jsp-project-card .jsp-id{max-width:115px}",
      "#jsp-project-card .jsp-row{gap:7px}}",
      // Separate, non-interactive layer below the hovercard; never changes text flow.
      "#jsp-project-links{position:fixed;inset:0;width:100vw;height:100vh;",
      "overflow:visible;pointer-events:none;z-index:2147483500}",
      "#jsp-project-links[hidden]{display:none!important}"
    ].join("\n");
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    function mix32(value) {
      value = Math.imul(value ^ value >>> 16, 2146121005);
      value = Math.imul(value ^ value >>> 15, 2221713035);
      return (value ^ value >>> 16) >>> 0;
    }
    function hashProjectId(id) {
      let hash = 2166136261;
      for (let i = 0; i < id.length; i++) {
        hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
      }
      return hash >>> 0;
    }
    function accentRGB(lightness, chroma, hue) {
      const angle = hue * Math.PI / 180;
      const a = chroma * Math.cos(angle), b = chroma * Math.sin(angle);
      const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
      const toByte = (value) => {
        const encoded = value <= 31308e-7 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
        return Math.round(Math.max(0, Math.min(1, encoded)) * 255);
      };
      return [
        toByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        toByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        toByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
      ];
    }
    function colorCandidate(id, attempt = 0) {
      const hash = hashProjectId(id);
      const hue = (mix32(hash ^ 2654435769) / 4294967296 * 360 + attempt * 137.507764) % 360;
      const lightness = 0.62 + mix32(hash ^ 2246822507) / 4294967296 * 0.12;
      const chroma = 0.13 + mix32(hash ^ 3266489909) / 4294967296 * 0.075;
      const channels = accentRGB(lightness, chroma, hue).map((channel) => Math.round(255 * 0.87 + channel * 0.13));
      return {
        accent: "oklch(" + (lightness * 100).toFixed(2) + "% " + chroma.toFixed(4) + " " + hue.toFixed(2) + ")",
        tint: "#" + channels.map((channel) => channel.toString(16).padStart(2, "0")).join(""),
        channels
      };
    }
    function tintDistance(left, right) {
      return Math.hypot(
        left.channels[0] - right.channels[0],
        left.channels[1] - right.channels[1],
        left.channels[2] - right.channels[2]
      );
    }
    const allocatedProjects = /* @__PURE__ */ new Map();
    const occupiedTints = /* @__PURE__ */ new Set();
    const MIN_NEARBY_DIFFERENCE = 13;
    function projectTheme(id, precedingIds = []) {
      if (allocatedProjects.has(id)) return allocatedProjects.get(id);
      const nearby = precedingIds.map((project) => allocatedProjects.get(project)).filter(Boolean);
      let chosen = null, bestGap = -1;
      for (let attempt = 0; attempt < 48; attempt++) {
        const candidate2 = colorCandidate(id, attempt);
        if (occupiedTints.has(candidate2.tint)) continue;
        const gap = nearby.length ? Math.min(...nearby.map((item) => tintDistance(candidate2, item))) : Infinity;
        if (gap > bestGap) {
          chosen = candidate2;
          bestGap = gap;
        }
        if (gap >= MIN_NEARBY_DIFFERENCE) {
          chosen = candidate2;
          break;
        }
      }
      if (!chosen) {
        for (let attempt = 48; attempt < 2e4; attempt++) {
          const candidate2 = colorCandidate(id, attempt);
          if (!occupiedTints.has(candidate2.tint)) {
            chosen = candidate2;
            break;
          }
        }
      }
      if (!chosen) return colorCandidate(id);
      allocatedProjects.set(id, chosen);
      occupiedTints.add(chosen.tint);
      return chosen;
    }
    function projectColor(id) {
      return projectTheme(id).accent;
    }
    function titleTextRectangle(link) {
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      let text;
      while (text = walker.nextNode()) {
        if (!text.nodeValue?.trim()) continue;
        if (text.parentElement?.closest('button,[role="button"],[aria-hidden="true"]')) {
          continue;
        }
        const range = document.createRange();
        range.selectNodeContents(text);
        const rect = range.getBoundingClientRect();
        if (rect.width > 2 && rect.height > 2) {
          let clipRight = link.getBoundingClientRect().right - 16;
          for (let parent = text.parentElement; parent && parent !== link; parent = parent.parentElement) {
            const overflow = getComputedStyle(parent).overflowX;
            if (overflow === "hidden" || overflow === "clip") {
              clipRight = Math.min(clipRight, parent.getBoundingClientRect().right);
              break;
            }
          }
          return { rect, clipRight };
        }
      }
      return null;
    }
    function labelGeometry(linkRect, textRect, clipRight) {
      const x = textRect.left - linkRect.left;
      const y = textRect.top - linkRect.top;
      const visibleWidth = Math.max(
        0,
        Math.min(textRect.width, clipRight - textRect.left)
      );
      return {
        backgroundX: Math.max(0, x - 5),
        backgroundY: y - 3,
        backgroundWidth: visibleWidth + 10,
        backgroundHeight: textRect.height + 6
      };
    }
    function decorateLink(link, precedingIds = []) {
      const id = projectIdFromHref(link.getAttribute("href"));
      if (!id) return;
      const found = titleTextRectangle(link);
      if (!found) {
        link.classList.remove("jsp-project-tag");
        return;
      }
      const geom = labelGeometry(
        link.getBoundingClientRect(),
        found.rect,
        found.clipRight
      );
      if (geom.backgroundWidth < 12) {
        link.classList.remove("jsp-project-tag");
        return;
      }
      const style2 = link.style;
      const theme = projectTheme(id, precedingIds);
      style2.setProperty("--jsp-accent", theme.accent);
      style2.setProperty("--jsp-light-tint", theme.tint);
      style2.setProperty("--jsp-bg-x", geom.backgroundX.toFixed(1) + "px");
      style2.setProperty("--jsp-bg-y", geom.backgroundY.toFixed(1) + "px");
      style2.setProperty("--jsp-bg-w", geom.backgroundWidth.toFixed(1) + "px");
      style2.setProperty("--jsp-bg-h", geom.backgroundHeight.toFixed(1) + "px");
      link.classList.add("jsp-project-tag");
    }
    let active = null, activeId = null, card = null;
    let decorationQueued = false;
    function decorateAll() {
      const precedingIds = [];
      for (const link of document.querySelectorAll(CSS_TARGET)) {
        const id = projectIdFromHref(link.getAttribute("href"));
        decorateLink(link, precedingIds);
        if (id && precedingIds[precedingIds.length - 1] !== id) {
          precedingIds.push(id);
          if (precedingIds.length > 3) precedingIds.shift();
        }
      }
    }
    function scheduleDecorate() {
      if (decorationQueued) return;
      decorationQueued = true;
      requestAnimationFrame(() => {
        decorationQueued = false;
        decorateAll();
        if (activeId) scheduleConnections();
      });
    }
    function relevantChange(mutation) {
      const target = mutation.target;
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        return target instanceof Element && target.matches(LINK_SELECTOR) && target.closest(SCOPE) && !target.classList.contains("jsp-project-tag");
      }
      const element = target instanceof Element ? target : target?.parentElement;
      if (element?.closest(SCOPE)) return true;
      for (const node of mutation.addedNodes || []) {
        if (node instanceof Element && (node.matches(SCOPE) || node.querySelector(SCOPE))) return true;
      }
      return false;
    }
    if (document.body) {
      const observer = new MutationObserver((changes) => {
        if (changes.some(relevantChange)) scheduleDecorate();
      });
      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "class"]
      });
    }
    scheduleDecorate();
    document.fonts?.ready?.then(scheduleDecorate);
    const SVG_NS = "http://www.w3.org/2000/svg";
    let connectionsLayer = null;
    let connectionPaths = null;
    let connectionClip = null;
    let connectionsQueued = false;
    function intersectRect(a, b) {
      return {
        left: Math.max(a.left, b.left),
        top: Math.max(a.top, b.top),
        right: Math.min(a.right, b.right),
        bottom: Math.min(a.bottom, b.bottom)
      };
    }
    function linkVisibleClip(link) {
      let clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (let parent = link.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const overflow = getComputedStyle(parent);
        if (/(auto|scroll|hidden|clip)/.test(
          overflow.overflowX + " " + overflow.overflowY
        )) {
          clip = intersectRect(clip, parent.getBoundingClientRect());
        }
      }
      return clip;
    }
    function visibleProjectNodes(id) {
      const nodes = [];
      for (const link of document.querySelectorAll(CSS_TARGET + ".jsp-project-tag")) {
        if (projectIdFromHref(link.getAttribute("href")) !== id) continue;
        const rect = link.getBoundingClientRect();
        const clip = linkVisibleClip(link);
        if (rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right) continue;
        const style2 = link.style;
        const bgX = parseFloat(style2.getPropertyValue("--jsp-bg-x"));
        const bgY = parseFloat(style2.getPropertyValue("--jsp-bg-y"));
        const bgW = parseFloat(style2.getPropertyValue("--jsp-bg-w"));
        const bgH = parseFloat(style2.getPropertyValue("--jsp-bg-h"));
        if (![bgX, bgY, bgW, bgH].every(Number.isFinite) || bgW < 4 || bgH < 4) continue;
        const y = rect.top + bgY + bgH / 2;
        if (y <= clip.top + 2 || y >= clip.bottom - 2) continue;
        const x = Math.min(rect.left + bgX + bgW + 6, clip.right - 6);
        if (x <= clip.left + 2) continue;
        nodes.push({ x, y, clip });
      }
      return nodes.sort((a, b) => a.y - b.y);
    }
    function connectionPath(a, b, clipRight) {
      const rail = Math.min(clipRight - 5, Math.max(a.x, b.x) + 22);
      const p = (value) => Number(value.toFixed(1));
      return "M " + p(a.x) + " " + p(a.y) + " C " + p(rail) + " " + p(a.y) + ", " + p(rail) + " " + p(b.y) + ", " + p(b.x) + " " + p(b.y);
    }
    function ensureConnectionsLayer() {
      if (connectionsLayer) return;
      connectionsLayer = document.createElementNS(SVG_NS, "svg");
      connectionsLayer.id = "jsp-project-links";
      connectionsLayer.hidden = true;
      connectionsLayer.setAttribute("aria-hidden", "true");
      connectionsLayer.setAttribute("focusable", "false");
      const defs = document.createElementNS(SVG_NS, "defs");
      const clipPath = document.createElementNS(SVG_NS, "clipPath");
      clipPath.id = "jsp-project-links-clip";
      connectionClip = document.createElementNS(SVG_NS, "rect");
      clipPath.appendChild(connectionClip);
      defs.appendChild(clipPath);
      connectionPaths = document.createElementNS(SVG_NS, "g");
      connectionPaths.setAttribute("clip-path", "url(#jsp-project-links-clip)");
      connectionsLayer.append(defs, connectionPaths);
      document.body.appendChild(connectionsLayer);
    }
    function clearConnections() {
      if (!connectionsLayer) return;
      connectionsLayer.hidden = true;
      connectionPaths.replaceChildren();
    }
    function drawConnections() {
      if (!activeId || !active?.isConnected) {
        clearConnections();
        return;
      }
      const nodes = visibleProjectNodes(activeId);
      if (nodes.length < 2) {
        clearConnections();
        return;
      }
      ensureConnectionsLayer();
      const clip = linkVisibleClip(active);
      connectionsLayer.setAttribute("viewBox", "0 0 " + innerWidth + " " + innerHeight);
      connectionClip.setAttribute("x", String(clip.left));
      connectionClip.setAttribute("y", String(clip.top));
      connectionClip.setAttribute("width", String(Math.max(0, clip.right - clip.left)));
      connectionClip.setAttribute("height", String(Math.max(0, clip.bottom - clip.top)));
      const fragment = document.createDocumentFragment();
      for (let i = 0; i + 1 < nodes.length; i++) {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", connectionPath(nodes[i], nodes[i + 1], clip.right));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", projectTheme(activeId).accent);
        path.setAttribute("stroke-opacity", "0.58");
        path.setAttribute("stroke-width", "1.05");
        path.setAttribute("stroke-linecap", "round");
        fragment.appendChild(path);
      }
      connectionPaths.replaceChildren(fragment);
      connectionsLayer.hidden = false;
    }
    function scheduleConnections() {
      if (connectionsQueued) return;
      connectionsQueued = true;
      requestAnimationFrame(() => {
        connectionsQueued = false;
        drawConnections();
      });
    }
    const projectCache = /* @__PURE__ */ new Map();
    let cursor = null, listComplete = false, inFlight = null, lastFailure = 0;
    let token = null;
    let closeTimer = null, fetchTimer = null;
    let titleEl, descEl, descLabelEl, countEl, updatedEl, idEl, openEl, copyEl, copyStatusEl;
    function projectIdFromHref(href) {
      const path = String(href || "").replace(/^https:\/\/chatgpt\.com/i, "");
      const match = path.match(/^\/g\/(g-p-[a-z0-9-]{8,})\/c\/[^/?#]+\/?(?:[?#].*)?$/i);
      return match ? match[1] : null;
    }
    function homeHref(id) {
      return /^g-p-[a-z0-9-]{8,}$/i.test(id) ? "/g/" + id + "/project" : "#";
    }
    function candidate(target) {
      const element = target instanceof Element ? target : target?.parentElement;
      const link = element?.closest(LINK_SELECTOR);
      return link?.closest(SCOPE) && projectIdFromHref(link.getAttribute("href")) ? link : null;
    }
    function cleanText(value, maxLength = 300) {
      return typeof value === "string" && value.trim() ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : null;
    }
    function normalize(item) {
      const gizmo = item?.gizmo?.gizmo || item?.gizmo || item;
      const display = gizmo?.display || item?.gizmo?.display || item?.display || {};
      const id = gizmo?.id || item?.gizmo?.id || item?.id;
      if (typeof id !== "string" || !/^g-p-[a-z0-9-]{8,}$/i.test(id)) return null;
      const count = [
        item?.conversation_count,
        item?.total_conversations,
        gizmo?.conversation_count
      ].find((x) => Number.isSafeInteger(x) && x >= 0);
      return {
        id,
        name: cleanText(display.name || gizmo?.name || item?.name, 150),
        description: cleanText(display.description || gizmo?.description || item?.description, 600),
        // Project instructions are separate from the often-empty display.description.
        instructions: cleanText(gizmo?.instructions || item?.instructions || item?.gizmo?.instructions, 900),
        updated: gizmo?.updated_at || gizmo?.updated_time || item?.updated_at || item?.updated_time || null,
        count: count === void 0 ? null : count
      };
    }
    function nameFromSidebar(id) {
      for (const link of document.querySelectorAll('a[href*="/g/g-p-"]')) {
        const href = String(link.getAttribute("href") || "").replace(/^https:\/\/chatgpt\.com/i, "").replace(/[?#].*$/, "");
        if (href === "/g/" + id || href === "/g/" + id + "/project") {
          const name = cleanText(link.textContent, 150);
          if (name) return name;
        }
      }
      return null;
    }
    function cookie(name) {
      const item = document.cookie.split("; ").find((x) => x.startsWith(name + "="));
      try {
        return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
      } catch {
        return null;
      }
    }
    async function fetchProjectPage(url) {
      const headers = { Accept: "application/json" };
      const device = cookie("oai-did"), account = cookie("_account");
      if (device) headers["oai-device-id"] = device;
      if (account) headers["ChatGPT-Account-Id"] = account;
      if (token) headers.Authorization = "Bearer " + token;
      let response = await fetch(url, {
        credentials: "same-origin",
        headers,
        signal: AbortSignal.timeout(1e4)
      });
      if ((response.status === 401 || response.status === 403) && !token) {
        const sessionResponse = await fetch("/api/auth/session?unstable_client=true", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(1e4)
        });
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (typeof session?.accessToken === "string" && session.accessToken) {
            token = session.accessToken;
            response = await fetch(url, {
              credentials: "same-origin",
              headers: { ...headers, Authorization: "Bearer " + token },
              signal: AbortSignal.timeout(1e4)
            });
          }
        }
      }
      if (!response.ok || !(response.headers.get("content-type") || "").includes("json")) {
        throw new Error("Project metadata unavailable");
      }
      return response.json();
    }
    async function loadProject(id) {
      if (projectCache.has(id) || listComplete || Date.now() - lastFailure < 12e4) return;
      if (inFlight) {
        await inFlight;
        if (projectCache.has(id) || listComplete || Date.now() - lastFailure < 12e4) return;
      }
      inFlight = (async () => {
        try {
          for (let page = 0; page < 6; page++) {
            const query = new URLSearchParams({ limit: "50" });
            if (cursor) query.set("cursor", cursor);
            const data = await fetchProjectPage("/backend-api/gizmos/snorlax/sidebar?" + query);
            for (const item of Array.isArray(data?.items) ? data.items : []) {
              const result = normalize(item);
              if (result) projectCache.set(result.id, result);
            }
            cursor = typeof data?.cursor === "string" && data.cursor ? data.cursor : null;
            listComplete = !cursor;
            if (projectCache.has(id) || listComplete) break;
          }
        } catch {
          lastFailure = Date.now();
        }
      })();
      try {
        await inFlight;
      } finally {
        inFlight = null;
      }
    }
    function cardIcon(kind) {
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", kind === "folder" ? "24" : "18");
      svg.setAttribute("height", kind === "folder" ? "24" : "18");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.75");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      const paths = {
        folder: ["M3 7a2 2 0 0 1 2-2h4.6l2.2 2.4H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"],
        chat: ["M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 9.2 9.2 0 0 1-3.9-.9L3 21l1.8-5.1a8.5 8.5 0 1 1 15.7-4.4Z"],
        clock: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z", "M12 7v5l3.5 2"],
        tag: ["M3 4h8l10 10-7 7L4 11V4Z", "M7.5 7.5h.01"],
        copy: [
          "M8 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8Z",
          "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
        ]
      };
      for (const d of paths[kind] || []) {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
      }
      return svg;
    }
    function cardElement(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== void 0) node.textContent = text;
      return node;
    }
    function cardRow(icon, label, value) {
      const row = cardElement("div", "jsp-row");
      const key = cardElement("div", "jsp-key");
      key.append(cardIcon(icon), cardElement("span", "jsp-key-text", label));
      row.append(key, value);
      return row;
    }
    function createCard() {
      if (card) return;
      card = cardElement("section");
      card.id = "jsp-project-card";
      card.hidden = true;
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "ChatGPT 项目详情");
      const hero = cardElement("div", "jsp-hero");
      const folder = cardElement("div", "jsp-folder");
      folder.appendChild(cardIcon("folder"));
      const heading = cardElement("div", "jsp-heading");
      heading.appendChild(cardElement("div", "jsp-eyebrow", "PROJECT DETAILS"));
      titleEl = cardElement("div", "jsp-title");
      heading.appendChild(titleEl);
      hero.append(folder, heading);
      descLabelEl = cardElement("div", "jsp-desc-label");
      descLabelEl.hidden = true;
      descEl = cardElement("p", "jsp-desc", "暂无项目描述");
      const divider = cardElement("div", "jsp-divider");
      const rows = cardElement("div", "jsp-rows");
      countEl = cardElement("span", "jsp-value", "—");
      updatedEl = cardElement("span", "jsp-value", "—");
      const idWrap = cardElement("div", "jsp-id-wrap jsp-value");
      idEl = cardElement("span", "jsp-id");
      copyEl = cardElement("button", "jsp-copy");
      copyEl.type = "button";
      copyEl.title = "复制完整项目 ID";
      copyEl.setAttribute("aria-label", "复制完整项目 ID");
      copyEl.appendChild(cardIcon("copy"));
      idWrap.append(idEl, copyEl);
      rows.append(
        cardRow("chat", "Chats in this project", countEl),
        cardRow("clock", "Last updated", updatedEl),
        cardRow("tag", "Project ID", idWrap)
      );
      const actions = cardElement("div", "jsp-actions");
      openEl = cardElement("a", "jsp-open", "打开项目 ↗");
      actions.appendChild(openEl);
      copyStatusEl = cardElement("span", "jsp-status");
      copyStatusEl.setAttribute("role", "status");
      copyStatusEl.setAttribute("aria-live", "polite");
      card.append(hero, descLabelEl, descEl, divider, rows, actions, copyStatusEl);
      document.body.appendChild(card);
      copyEl.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const id = card.dataset.projectId;
        if (!id) return;
        try {
          await navigator.clipboard.writeText(id);
          copyStatusEl.textContent = "项目 ID 已复制";
          copyEl.title = "已复制";
        } catch {
          copyStatusEl.textContent = "复制失败，请手动选择项目 ID";
          copyEl.title = "复制失败";
        }
      });
      card.addEventListener("pointerenter", cancelClose);
      card.addEventListener("pointerleave", scheduleClose);
      card.addEventListener("focusin", cancelClose);
      card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget)) scheduleClose();
      });
    }
    function formatDate(value) {
      if (!value) return null;
      const date = typeof value === "number" ? new Date(value < 1e12 ? value * 1e3 : value) : new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    }
    function render(id) {
      if (!card || id !== activeId) return;
      const info = projectCache.get(id);
      card.style.setProperty("--jsp-accent", projectColor(id));
      card.dataset.projectId = id;
      titleEl.textContent = info?.name || nameFromSidebar(id) || "项目名称暂不可用";
      const hasDescription = Boolean(info?.description);
      const hasInstructions = Boolean(info?.instructions);
      descLabelEl.hidden = !hasInstructions || hasDescription;
      descLabelEl.textContent = hasInstructions && !hasDescription ? "项目指令（节选）" : "";
      descEl.textContent = hasDescription ? info.description : hasInstructions ? info.instructions : !info && Date.now() - lastFailure >= 12e4 && !listComplete ? "正在读取项目资料…" : "暂无项目描述";
      countEl.textContent = info?.count === null || info?.count === void 0 ? "—" : String(info.count);
      updatedEl.textContent = formatDate(info?.updated) || "—";
      idEl.textContent = id;
      idEl.title = id;
      copyEl.title = "复制完整项目 ID";
      copyStatusEl.textContent = "";
      openEl.href = homeHref(id);
      position();
    }
    function position() {
      if (!active || !card || card.hidden) return;
      const rect = active.getBoundingClientRect();
      const width = card.offsetWidth || 408, height = card.offsetHeight || 220;
      const gap = 14;
      let x = rect.right + gap;
      if (x + width > innerWidth - 12) x = rect.left - width - gap;
      if (x < 12) x = Math.max(12, innerWidth - width - 12);
      card.style.left = Math.round(x) + "px";
      card.style.top = Math.round(Math.max(
        12,
        Math.min(rect.top - 8, innerHeight - height - 12)
      )) + "px";
    }
    function cancelClose() {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = null;
    }
    function hide() {
      cancelClose();
      if (fetchTimer) clearTimeout(fetchTimer);
      fetchTimer = null;
      if (card) card.hidden = true;
      clearConnections();
      if (active) active.removeAttribute("aria-describedby");
      active = null;
      activeId = null;
    }
    function scheduleClose() {
      cancelClose();
      closeTimer = setTimeout(hide, 160);
    }
    function activate(link) {
      const id = projectIdFromHref(link.getAttribute("href"));
      if (!id) return;
      decorateLink(link);
      cancelClose();
      if (active && active !== link) active.removeAttribute("aria-describedby");
      active = link;
      activeId = id;
      createCard();
      card.hidden = false;
      active.setAttribute("aria-describedby", card.id);
      render(id);
      scheduleConnections();
      if (fetchTimer) clearTimeout(fetchTimer);
      if (projectCache.has(id) || listComplete) return;
      fetchTimer = setTimeout(async () => {
        fetchTimer = null;
        await loadProject(id);
        if (activeId === id) render(id);
      }, 180);
    }
    document.addEventListener("pointerover", (e) => {
      if (card?.contains(e.target)) return;
      const link = candidate(e.target);
      if (link && !link.contains(e.relatedTarget)) activate(link);
    }, true);
    document.addEventListener("pointerout", (e) => {
      if (active?.contains(e.target) && !active.contains(e.relatedTarget) && !card?.contains(e.relatedTarget)) scheduleClose();
    }, true);
    document.addEventListener("focusin", (e) => {
      if (card?.contains(e.target)) return;
      const link = candidate(e.target);
      if (link) activate(link);
    });
    document.addEventListener("focusout", (e) => {
      if (active?.contains(e.target) && !active.contains(e.relatedTarget) && !card?.contains(e.relatedTarget)) scheduleClose();
    });
    document.addEventListener("pointerdown", (e) => {
      if (active && !active.contains(e.target) && !card?.contains(e.target)) hide();
    }, true);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
    window.addEventListener("scroll", () => {
      position();
      scheduleConnections();
    }, true);
    window.addEventListener("resize", () => {
      scheduleDecorate();
      position();
      scheduleConnections();
    });
  })();
})();
