// ==UserScript==
// @name         ChatGPT Sidebar Project Marker
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.11.061027
// @description  只在 ChatGPT 侧边栏项目对话标题前显示紫色小竖条；悬停显示项目名称及详情，不改变行背景。
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
    // A marker must use layout space, not an inset overlay on the first glyph.
    // One consistent color communicates "project"; no arbitrary color collisions.
    ':root{--jsp-rail:#7c3aed;--jsp-border:rgba(124,58,237,.19);',
    '--jsp-surface:#fff;--jsp-text:#20242a;--jsp-muted:#68717d}',
    'html.dark,html[data-theme="dark"]{--jsp-rail:#c084fc;',
    '--jsp-border:rgba(192,132,252,.27);--jsp-surface:#25262a;',
    '--jsp-text:#f5f5f5;--jsp-muted:#a8afb9}',
    CSS_TARGET+'::before{content:"";display:inline-block;',
    'inline-size:3px;block-size:15px;min-inline-size:3px;',
    'margin-inline-end:8px;flex:0 0 3px;vertical-align:-2px;',
    'border-radius:3px;background-color:var(--jsp-rail);',
    'pointer-events:none;}',
    '#jsp-project-card{position:fixed;z-index:2147483600;',
    'box-sizing:border-box;width:min(330px,calc(100vw - 16px));',
    'padding:14px 15px;background:var(--jsp-surface);color:var(--jsp-text);',
    'border:1px solid var(--jsp-border);border-radius:12px;',
    'box-shadow:0 12px 36px rgba(0,0,0,.16);',
    'font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}',
    '#jsp-project-card[hidden]{display:none!important}',
    '#jsp-project-card .jsp-label{font-size:11px;color:var(--jsp-rail);font-weight:700}',
    '#jsp-project-card .jsp-title{font-size:15px;font-weight:650;',
    'line-height:1.4;overflow-wrap:anywhere;margin-top:4px}',
    '#jsp-project-card .jsp-desc{margin:8px 0 0;color:var(--jsp-muted);',
    'white-space:normal;overflow-wrap:anywhere;max-height:5.7em;overflow:hidden}',
    '#jsp-project-card .jsp-meta{margin:8px 0;color:var(--jsp-muted);font-size:11px}',
    '#jsp-project-card .jsp-foot{display:flex;align-items:center;',
    'justify-content:space-between;gap:8px;margin-top:9px;',
    'border-top:1px solid var(--jsp-border);padding-top:10px;font-size:11px}',
    '#jsp-project-card .jsp-id{overflow:hidden;white-space:nowrap;',
    'text-overflow:ellipsis;color:var(--jsp-muted)}',
    '#jsp-project-card a{color:var(--jsp-rail);text-decoration:none;',
    'font-weight:650;white-space:nowrap}',
    '#jsp-project-card a:hover{text-decoration:underline}',
    '#jsp-project-card a:focus-visible{outline:2px solid var(--jsp-rail)}'
  ].join("\n");
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  const projectCache = new Map();
  let cursor = null, listComplete = false, inFlight = null, lastFailure = 0;
  let token = null; // Memory-only: no storage, logging or external transmission.
  let active = null, activeId = null, card = null;
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
    cancelClose();
    if (active && active !== link) active.removeAttribute("aria-describedby");
    active = link;
    activeId = id;
    createCard();
    card.hidden = false;
    active.setAttribute("aria-describedby", card.id);
    render(id);
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
  window.addEventListener("scroll", position, true);
  window.addEventListener("resize", position);
})();
