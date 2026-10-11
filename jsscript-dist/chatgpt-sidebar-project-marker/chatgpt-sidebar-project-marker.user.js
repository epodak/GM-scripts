// ==UserScript==
// @name         ChatGPT Sidebar Project Marker
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.11.225601
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

// Project metadata strategy based on huhusmang/ChatGPT-Exporter.
// No conversation-body downloads or global fetch interception.
(() => {
  "use strict";
  const STYLE_ID = "jsscript-chatgpt-sidebar-project-marker";
  if (document.getElementById(STYLE_ID)) return;

  const LINK_SELECTOR = 'a[href*="/g/g-p-"][href*="/c/"]';
  const SCOPE = 'nav,aside,#sidebar,[data-testid*="sidebar" i],[data-testid*="history" i]';
  const CSS_TARGET = ':where(' + SCOPE + ') a:is([href^="/g/g-p-"],' +
    '[href^="https://chatgpt.com/g/g-p-"])[href*="/c/"]';
  const css = [
    // Only decorate the actual text run: no full-row backgrounds or layout shifts.
    ':root{--jsp-surface:#fff;--jsp-text:#20242a;--jsp-muted:#68717d}',
    // Define dependent variables on each entry/card, not on :root:
    // inherited computed var() values would otherwise all use the fallback blue.
    '.jsp-project-tag,#jsp-project-card{',
    '--jsp-main:var(--jsp-accent,#2563eb);',
    '--jsp-tint:var(--jsp-light-tint,',
    'color-mix(in srgb,var(--jsp-accent,#2563eb) 13%,transparent))}',
    'html.dark,html[data-theme="dark"]{--jsp-surface:#25262a;',
    '--jsp-text:#f5f5f5;--jsp-muted:#a8afb9}',
    'html.dark .jsp-project-tag,html.dark #jsp-project-card,',
    'html[data-theme="dark"] .jsp-project-tag,',
    'html[data-theme="dark"] #jsp-project-card{',
    '--jsp-main:color-mix(in srgb,var(--jsp-accent,#2563eb) 68%,white);',
    '--jsp-tint:color-mix(in srgb,var(--jsp-accent,#2563eb) 24%,transparent)}',
    CSS_TARGET+'.jsp-project-tag{position:relative!important;isolation:isolate}',
    CSS_TARGET+'.jsp-project-tag::before{content:"";position:absolute;',
    'inset-inline-start:var(--jsp-bg-x);top:var(--jsp-bg-y);',
    'width:var(--jsp-bg-w);height:var(--jsp-bg-h);',
    'background:var(--jsp-tint);border-radius:5px;',
    'pointer-events:none;z-index:-1}',
    '#jsp-project-card{position:fixed;z-index:2147483600;',
    'box-sizing:border-box;width:min(330px,calc(100vw - 16px));',
    'padding:14px 15px;color:var(--jsp-text);',
    'background:linear-gradient(165deg,',
    'color-mix(in srgb,var(--jsp-main) 11%,var(--jsp-surface)),',
    'var(--jsp-surface) 76%);',
    'border:1px solid color-mix(in srgb,var(--jsp-main) 38%,transparent);',
    'border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.16);',
    'font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}',
    '#jsp-project-card[hidden]{display:none!important}',
    '#jsp-project-card .jsp-label{font-size:11px;color:var(--jsp-main);font-weight:700}',
    '#jsp-project-card .jsp-title{font-size:15px;font-weight:650;',
    'line-height:1.4;overflow-wrap:anywhere;margin-top:4px}',
    '#jsp-project-card .jsp-desc{margin:8px 0 0;color:var(--jsp-muted);',
    'white-space:normal;overflow-wrap:anywhere;max-height:5.7em;overflow:hidden}',
    '#jsp-project-card .jsp-meta{margin:8px 0;color:var(--jsp-muted);font-size:11px}',
    '#jsp-project-card .jsp-foot{display:flex;align-items:center;',
    'justify-content:space-between;gap:8px;margin-top:9px;',
    'border-top:1px solid color-mix(in srgb,var(--jsp-main) 27%,transparent);',
    'padding-top:10px;font-size:11px}',
    '#jsp-project-card .jsp-id{overflow:hidden;white-space:nowrap;',
    'text-overflow:ellipsis;color:var(--jsp-muted)}',
    '#jsp-project-card a{color:var(--jsp-main);text-decoration:none;',
    'font-weight:650;white-space:nowrap}',
    '#jsp-project-card a:hover{text-decoration:underline}',
    '#jsp-project-card a:focus-visible{outline:2px solid var(--jsp-main)}',
    // Separate, non-interactive layer below the hovercard; never changes text flow.
    '#jsp-project-links{position:fixed;inset:0;width:100vw;height:100vh;',
    'overflow:visible;pointer-events:none;z-index:2147483500}',
    '#jsp-project-links[hidden]{display:none!important}'
  ].join("\n");
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // Assign colors using their final 8-bit appearance on a white sidebar.
  // Different OKLCH strings can collapse to the same RGB after 13% blending.
  // The in-memory registry avoids exact collisions for distinct observed IDs.
  // The nearby-ID check additionally separates visibly adjacent projects.
  function mix32(value) {
    value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
    value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
    return (value ^ (value >>> 16)) >>> 0;
  }

  function hashProjectId(id) {
    let hash = 2166136261;
    for (let i = 0; i < id.length; i++) {
      hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
    }
    return hash >>> 0;
  }

  // OKLCH -> sRGB (8-bit). Once reduced to RGB, the intended
  // translucent tint is flattened over white into an exact hex color.
  // This avoids compositor-level collisions from separate CSS color-mix calls.
  function accentRGB(lightness, chroma, hue) {
    const angle = hue * Math.PI / 180;
    const a = chroma * Math.cos(angle), b = chroma * Math.sin(angle);
    const l = (lightness + 0.3963377774*a + 0.2158037573*b) ** 3;
    const m = (lightness - 0.1055613458*a - 0.0638541728*b) ** 3;
    const s = (lightness - 0.0894841775*a - 1.2914855480*b) ** 3;
    const toByte = value => {
      const encoded = value <= 0.0031308
        ? 12.92 * value
        : 1.055 * value ** (1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(1, encoded)) * 255);
    };
    return [
      toByte(4.0767416621*l - 3.3077115913*m + 0.2309699292*s),
      toByte(-1.2684380046*l + 2.6097574011*m - 0.3413193965*s),
      toByte(-0.0041960863*l - 0.7034186147*m + 1.7076147010*s)
    ];
  }

  function colorCandidate(id, attempt = 0) {
    const hash = hashProjectId(id);
    // The first candidate is compatible with the previous OKLCH mapping.
    // Only collisions/very similar neighbors trigger a golden-angle shift.
    const hue = ((mix32(hash ^ 0x9e3779b9) / 0x100000000) * 360 +
      attempt * 137.507764) % 360;
    const lightness = 0.62 +
      (mix32(hash ^ 0x85ebca6b) / 0x100000000) * 0.12;
    const chroma = 0.13 +
      (mix32(hash ^ 0xc2b2ae35) / 0x100000000) * 0.075;
    const channels = accentRGB(lightness, chroma, hue)
      .map(channel => Math.round(255 * 0.87 + channel * 0.13));
    return {
      accent: "oklch(" + (lightness * 100).toFixed(2) + "% " +
        chroma.toFixed(4) + " " + hue.toFixed(2) + ")",
      tint: "#" + channels.map(channel => channel.toString(16)
        .padStart(2, "0")).join(""),
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

  const allocatedProjects = new Map();
  const occupiedTints = new Set();
  const MIN_NEARBY_DIFFERENCE = 13;

  function projectTheme(id, precedingIds = []) {
    if (allocatedProjects.has(id)) return allocatedProjects.get(id);
    const nearby = precedingIds.map(project => allocatedProjects.get(project))
      .filter(Boolean);
    let chosen = null, bestGap = -1;
    for (let attempt = 0; attempt < 48; attempt++) {
      const candidate = colorCandidate(id, attempt);
      if (occupiedTints.has(candidate.tint)) continue;
      const gap = nearby.length
        ? Math.min(...nearby.map(item => tintDistance(candidate, item)))
        : Infinity;
      if (gap > bestGap) {
        chosen = candidate;
        bestGap = gap;
      }
      if (gap >= MIN_NEARBY_DIFFERENCE) {
        chosen = candidate;
        break;
      }
    }
    if (!chosen) {
      // Extremely large sets can exhaust a candidate sequence; extend
      // deterministically rather than reuse another project's displayed RGB.
      for (let attempt = 48; attempt < 20000; attempt++) {
        const candidate = colorCandidate(id, attempt);
        if (!occupiedTints.has(candidate.tint)) {
          chosen = candidate;
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

  // Measure the visible title glyphs to position the background only.
  // The decoration never participates in flex layout or obscures text.
  function titleTextRectangle(link) {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    let text;
    while ((text = walker.nextNode())) {
      if (!text.nodeValue?.trim()) continue;
      if (text.parentElement?.closest('button,[role="button"],[aria-hidden="true"]')) {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(text);
      const rect = range.getBoundingClientRect();
      if (rect.width > 2 && rect.height > 2) {
        let clipRight = link.getBoundingClientRect().right - 16;
        for (let parent = text.parentElement; parent && parent !== link;
          parent = parent.parentElement) {
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
    const visibleWidth = Math.max(0,
      Math.min(textRect.width, clipRight - textRect.left));
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
      // If DOM layout changes, avoid painting the wrong text.
      link.classList.remove("jsp-project-tag");
      return;
    }
    const geom = labelGeometry(link.getBoundingClientRect(),
      found.rect, found.clipRight);
    if (geom.backgroundWidth < 12) {
      link.classList.remove("jsp-project-tag");
      return;
    }
    const style = link.style;
    const theme = projectTheme(id, precedingIds);
    style.setProperty("--jsp-accent", theme.accent);
    style.setProperty("--jsp-light-tint", theme.tint);
    style.setProperty("--jsp-bg-x", geom.backgroundX.toFixed(1) + "px");
    style.setProperty("--jsp-bg-y", geom.backgroundY.toFixed(1) + "px");
    style.setProperty("--jsp-bg-w", geom.backgroundWidth.toFixed(1) + "px");
    style.setProperty("--jsp-bg-h", geom.backgroundHeight.toFixed(1) + "px");
    link.classList.add("jsp-project-tag");
  }

  // Initialized before the first decoration frame (including synchronous test RAF).
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

  // React's sidebar is virtual/dynamic. Observe only structural/href changes;
  // styling class/variables does not trigger this observer.
  function relevantChange(mutation) {
    const target = mutation.target;
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      // React may replace classes on a reused link; repair only if ours vanished.
      return target instanceof Element && target.matches(LINK_SELECTOR) &&
        target.closest(SCOPE) && !target.classList.contains("jsp-project-tag");
    }
    const element = target instanceof Element ? target : target?.parentElement;
    if (element?.closest(SCOPE)) return true;
    for (const node of mutation.addedNodes || []) {
      if (node instanceof Element &&
          (node.matches(SCOPE) || node.querySelector(SCOPE))) return true;
    }
    return false;
  }
  if (document.body) {
    const observer = new MutationObserver(changes => {
      if (changes.some(relevantChange)) scheduleDecorate();
    });
    observer.observe(document.body, {
      childList: true, characterData: true, subtree: true,
      attributes: true, attributeFilter: ["href", "class"]
    });
  }
  scheduleDecorate();
  document.fonts?.ready?.then(scheduleDecorate);

  // Visible relationship overlay: only while a project chat is hovered/focused.
  // Paths are viewport-aligned and clipped to the sidebar's scroll viewport.
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
    for (let parent = link.parentElement; parent && parent !== document.body;
      parent = parent.parentElement) {
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
      if (rect.bottom <= clip.top || rect.top >= clip.bottom ||
          rect.right <= clip.left || rect.left >= clip.right) continue;
      const style = link.style;
      const bgX = parseFloat(style.getPropertyValue("--jsp-bg-x"));
      const bgY = parseFloat(style.getPropertyValue("--jsp-bg-y"));
      const bgW = parseFloat(style.getPropertyValue("--jsp-bg-w"));
      const bgH = parseFloat(style.getPropertyValue("--jsp-bg-h"));
      if (![bgX, bgY, bgW, bgH].every(Number.isFinite) ||
          bgW < 4 || bgH < 4) continue;
      const y = rect.top + bgY + bgH / 2;
      if (y <= clip.top + 2 || y >= clip.bottom - 2) continue;
      const x = Math.min(rect.left + bgX + bgW + 6, clip.right - 6);
      if (x <= clip.left + 2) continue;
      nodes.push({ x, y, clip });
    }
    return nodes.sort((a, b) => a.y - b.y);
  }

  function connectionPath(a, b, clipRight) {
    // Right-side, soft cubic "spine": no straight line through title text.
    const rail = Math.min(clipRight - 5, Math.max(a.x, b.x) + 22);
    const p = value => Number(value.toFixed(1));
    return "M " + p(a.x) + " " + p(a.y) +
      " C " + p(rail) + " " + p(a.y) +
      ", " + p(rail) + " " + p(b.y) +
      ", " + p(b.x) + " " + p(b.y);
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
    // Limit the drawing to the current hovered item's sidebar scroll region.
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

  const projectCache = new Map();
  let cursor = null, listComplete = false, inFlight = null, lastFailure = 0;
  let token = null; // Memory-only: no storage, logging or external transmission.
  let closeTimer = null, fetchTimer = null;
  let titleEl, descEl, metaEl, idEl, openEl;

  // The URL format is a strong identity invariant; a /c/ link alone is not.
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
    return typeof value === "string" && value.trim()
      ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : null;
  }
  function normalize(item) {
    // Exporter handles gizmo.gizmo, gizmo, and flat records.
    const gizmo = item?.gizmo?.gizmo || item?.gizmo || item;
    const display = gizmo?.display || item?.gizmo?.display || item?.display || {};
    const id = gizmo?.id || item?.gizmo?.id || item?.id;
    if (typeof id !== "string" || !/^g-p-[a-z0-9-]{8,}$/i.test(id)) return null;
    const count = [item?.conversation_count, item?.total_conversations,
      gizmo?.conversation_count].find(x => Number.isSafeInteger(x) && x >= 0);
    return {
      id,
      name: cleanText(display.name || gizmo?.name || item?.name, 150),
      description: cleanText(display.description || gizmo?.description ||
        item?.description, 400),
      updated: gizmo?.updated_at || gizmo?.updated_time ||
        item?.updated_at || item?.updated_time || null,
      count: count === undefined ? null : count
    };
  }
  function nameFromSidebar(id) {
    for (const link of document.querySelectorAll('a[href*="/g/g-p-"]')) {
      const href = String(link.getAttribute("href") || "")
        .replace(/^https:\/\/chatgpt\.com/i, "").replace(/[?#].*$/, "");
      if (href === "/g/" + id || href === "/g/" + id + "/project") {
        const name = cleanText(link.textContent, 150);
        if (name) return name;
      }
    }
    return null;
  }
  function cookie(name) {
    const item = document.cookie.split("; ").find(x => x.startsWith(name + "="));
    try { return item ? decodeURIComponent(item.slice(name.length + 1)) : null; }
    catch { return null; }
  }
  async function fetchProjectPage(url) {
    const headers = { Accept: "application/json" };
    const device = cookie("oai-did"), account = cookie("_account");
    if (device) headers["oai-device-id"] = device;
    if (account) headers["ChatGPT-Account-Id"] = account;
    if (token) headers.Authorization = "Bearer " + token;

    let response = await fetch(url, {
      credentials: "same-origin", headers, signal: AbortSignal.timeout(10000)
    });
    if ((response.status === 401 || response.status === 403) && !token) {
      // Exporter's session-based auth, used only after a failed cookie request.
      const sessionResponse = await fetch("/api/auth/session?unstable_client=true", {
        credentials: "same-origin", headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000)
      });
      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        if (typeof session?.accessToken === "string" && session.accessToken) {
          token = session.accessToken;
          response = await fetch(url, {
            credentials: "same-origin",
            headers: { ...headers, Authorization: "Bearer " + token },
            signal: AbortSignal.timeout(10000)
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
    if (projectCache.has(id) || listComplete || Date.now() - lastFailure < 120000) return;
    if (inFlight) {
      await inFlight;
      if (projectCache.has(id) || listComplete || Date.now() - lastFailure < 120000) return;
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
    try { await inFlight; } finally { inFlight = null; }
  }
  function createCard() {
    if (card) return;
    card = document.createElement("section");
    card.id = "jsp-project-card";
    card.hidden = true;
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "项目详情");
    const label = document.createElement("div");
    label.className = "jsp-label";
    label.textContent = "ChatGPT 项目";
    titleEl = document.createElement("div");
    titleEl.className = "jsp-title";
    descEl = document.createElement("p");
    descEl.className = "jsp-desc";
    metaEl = document.createElement("div");
    metaEl.className = "jsp-meta";
    const footer = document.createElement("div");
    footer.className = "jsp-foot";
    idEl = document.createElement("span");
    idEl.className = "jsp-id";
    openEl = document.createElement("a");
    openEl.textContent = "打开项目 ↗";
    footer.append(idEl, openEl);
    card.append(label, titleEl, descEl, metaEl, footer);
    document.body.appendChild(card);
    card.addEventListener("pointerenter", cancelClose);
    card.addEventListener("pointerleave", scheduleClose);
    card.addEventListener("focusin", cancelClose);
    card.addEventListener("focusout", e => {
      if (!card.contains(e.relatedTarget)) scheduleClose();
    });
  }
  function formatDate(value) {
    if (!value) return null;
    const date = typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
  }
  function render(id) {
    if (!card || id !== activeId) return;
    const info = projectCache.get(id);
    card.style.setProperty("--jsp-accent", projectColor(id));
    titleEl.textContent = info?.name || nameFromSidebar(id) || "项目名称暂不可用";
    descEl.textContent = info?.description || "";
    descEl.hidden = !info?.description;
    const details = [];
    const date = formatDate(info?.updated);
    if (date) details.push("更新：" + date);
    if (info?.count !== null && info?.count !== undefined) {
      details.push("对话数：" + info.count);
    }
    if (!info && !listComplete) {
      details.push(Date.now() - lastFailure < 120000 ?
        "项目详情暂不可用" : "正在读取项目详情…");
    }
    metaEl.textContent = details.join(" · ");
    metaEl.hidden = !details.length;
    idEl.textContent = id;
    idEl.title = id;
    openEl.href = homeHref(id);
    position();
  }
  function position() {
    if (!active || !card || card.hidden) return;
    const rect = active.getBoundingClientRect();
    const width = card.offsetWidth || 330, height = card.offsetHeight || 180;
    let x = rect.right + 12;
    if (x + width > innerWidth - 8) x = rect.left - width - 12;
    if (x < 8) x = Math.max(8, innerWidth - width - 8);
    card.style.left = Math.round(x) + "px";
    card.style.top = Math.round(Math.max(8,
      Math.min(rect.top - 6, innerHeight - height - 8))) + "px";
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
  document.addEventListener("pointerover", e => {
    if (card?.contains(e.target)) return;
    const link = candidate(e.target);
    if (link && !link.contains(e.relatedTarget)) activate(link);
  }, true);
  document.addEventListener("pointerout", e => {
    if (active?.contains(e.target) && !active.contains(e.relatedTarget) &&
        !card?.contains(e.relatedTarget)) scheduleClose();
  }, true);
  document.addEventListener("focusin", e => {
    if (card?.contains(e.target)) return;
    const link = candidate(e.target);
    if (link) activate(link);
  });
  document.addEventListener("focusout", e => {
    if (active?.contains(e.target) && !active.contains(e.relatedTarget) &&
        !card?.contains(e.relatedTarget)) scheduleClose();
  });
  document.addEventListener("pointerdown", e => {
    if (active && !active.contains(e.target) && !card?.contains(e.target)) hide();
  }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
  window.addEventListener("scroll", () => { position(); scheduleConnections(); }, true);
  window.addEventListener("resize", () => { scheduleDecorate(); position(); scheduleConnections(); });
})();
