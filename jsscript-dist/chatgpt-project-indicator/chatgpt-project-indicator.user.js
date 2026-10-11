// ==UserScript==
// @name         ChatGPT 所属项目指示器
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.11.054013
// @description  在项目聊天顶部显示所属项目名称，普通聊天不显示；支持 SPA 切换。
// @author       epodak
// @match        https://chatgpt.com/*
// @match        https://www.chatgpt.com/*
// @grant        none
// @run-at       document-end
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-project-indicator/chatgpt-project-indicator.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-project-indicator/chatgpt-project-indicator.user.js
// @noframes
// ==/UserScript==

(() => {
// Keep ChatGPT's private endpoints and DOM markup outside the inference rules.
const PROJECT_ID_RE = /g-p-[a-f\d]{32}(?![a-f\d])/i;
const CHAT_ID_RE = /\/c\/([a-z\d-]{8,})(?:\/|$)/i;

function projectIdFrom(value) {
  const match = String(value || "").match(PROJECT_ID_RE);
  return match ? match[0] : null;
}

function chatIdFromPath(pathname) {
  return String(pathname || "").match(CHAT_ID_RE)?.[1] || null;
}

function projectIdFromConversation(data) {
  if (!data || typeof data !== "object") return null;
  const sources = [
    data.gizmo_id,
    data.conversation_template_id,
    data.conversation?.gizmo_id,
    data.conversation?.conversation_template_id,
    data.conversation?.project_id,
    data.project_id,
  ];
  for (const candidate of sources) {
    const id = projectIdFrom(candidate);
    if (id) return id;
  }
  return null;
}

function projectNameFromDetail(data) {
  const candidates = [
    data?.gizmo?.display?.name,
    data?.gizmo?.name,
    data?.display?.name,
    data?.name,
  ];
  return candidates.map(normalizeName).find(Boolean) || null;
}

function normalizeName(value) {
  if (typeof value !== "string") return null;
  const name = value.replace(/\s+/g, " ").trim();
  if (!name || name.length > 150 || /^(?:projects?|项目|项目列表)$/i.test(name)) return null;
  return name;
}

// Reads only the signed-in user's current page. No cross-origin requests, tokens, or tracking.
(() => {
  "use strict";

  const ID = "jsscript-chatgpt-project-indicator";
  const STYLE_ID = `${ID}-style`;
  const projectNames = new Map();
  const conversationProjects = new Map();
  const detailRequests = new Map();
  const conversationRequests = new Map();
  let currentRoute = "";
  let generation = 0;
  let scheduled = false;
  let latest = null;

  function elementText(node) {
    return normalizeName(node.getAttribute("title")) ||
      normalizeName(node.getAttribute("aria-label")) ||
      normalizeName(node.textContent);
  }

  function discoverProjectLinks() {
    const map = new Map();
    for (const link of document.querySelectorAll('a[href*="g-p-"]')) {
      const id = projectIdFrom(link.getAttribute("href"));
      if (!id) continue;
      const name = elementText(link);
      if (name) map.set(id, { name, href: link.href });
    }
    return map;
  }

  function rememberNames() {
    for (const [id, entry] of discoverProjectLinks()) projectNames.set(id, entry);
  }

  // A project link in the header is authoritative. A random sidebar project is not.
  function headerProject() {
    for (const link of document.querySelectorAll(
      'main header a[href*="g-p-"], header a[href*="g-p-"], [aria-label="Breadcrumb"] a[href*="g-p-"]'
    )) {
      const id = projectIdFrom(link.getAttribute("href"));
      if (id) return id;
    }
    return null;
  }

  function projectForChatLink(chatId) {
    // Only accept a project label within the *small* ancestor group of the active chat.
    for (const link of document.querySelectorAll('nav a[href*="/c/"], aside a[href*="/c/"]')) {
      if (chatIdFromPath(new URL(link.href).pathname) !== chatId) continue;
      let node = link.parentElement;
      for (let level = 0; node && level < 3; level++, node = node.parentElement) {
        if (node.querySelectorAll('a[href*="/c/"]').length > 18) break;
        const projectLink = node.querySelector('a[href*="g-p-"]');
        const id = projectIdFrom(projectLink?.getAttribute("href"));
        if (id) return id;
      }
    }
    return null;
  }

  function css() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ID} { position: fixed; top: 12px; left: 285px; z-index: 120;
        max-width: min(300px, 31vw); display: inline-flex; align-items: center;
        gap: 7px; box-sizing: border-box; padding: 7px 11px;
        border: 1px solid #de604b; border-radius: 8px;
        background: var(--main-surface-primary, #fff); color: #c9422e;
        font: 600 12px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif;
        text-decoration: none; box-shadow: 0 2px 12px rgba(0,0,0,.06);
        white-space: nowrap; overflow: hidden; cursor: pointer;
      }
      #${ID}:hover { background: var(--main-surface-secondary, #fff3ed); }
      #${ID} .project-label { opacity: .77; font-weight: 500; flex: none; }
      #${ID} .project-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; }
      #${ID}:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
      @media (prefers-color-scheme: dark) {
        #${ID} { color: #ffad91; border-color: #b85843; }
      }
      @media (max-width: 920px) {
        #${ID} { top: 61px; left: 14px !important; max-width: calc(100vw - 28px); }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function positionBadge(badge) {
    if (window.innerWidth <= 920) return;
    const sidebar = document.querySelector(
      '[data-testid="sidebar"], [data-testid="history-and-training-sidebar"], #sidebar, aside[aria-label]'
    );
    let offset = 72;
    if (sidebar) {
      const rect = sidebar.getBoundingClientRect();
      if (rect.left < 8 && rect.width > 150 && rect.width < 480 && rect.height > innerHeight * .55) {
        offset = rect.right + 18;
      }
    }
    badge.style.left = `${Math.min(Math.max(72, offset), Math.max(72, innerWidth - 320))}px`;
  }

  function ensureBadge() {
    css();
    let badge = document.getElementById(ID);
    if (badge) return badge;
    badge = document.createElement("a");
    badge.id = ID;
    badge.setAttribute("data-jsscript", "chatgpt-project-indicator");
    badge.setAttribute("aria-label", "所属项目");
    const prefix = document.createElement("span");
    prefix.className = "project-label";
    prefix.textContent = "所属项目";
    const name = document.createElement("span");
    name.className = "project-name";
    badge.append(prefix, name);
    (document.body || document.documentElement).appendChild(badge);
    return badge;
  }

  function clearBadge() {
    latest = null;
    document.getElementById(ID)?.remove();
  }

  function showProject(projectId, preferredName) {
    if (!projectId) { clearBadge(); return; }
    const known = projectNames.get(projectId);
    const name = preferredName || known?.name || "项目";
    const href = known?.href || `${location.origin}/g/${projectId}/project`;
    const current = `${projectId}:${name}:${href}`;
    const badge = ensureBadge();
    positionBadge(badge);
    if (latest === current) return;
    latest = current;
    badge.querySelector(".project-name").textContent = name;
    badge.href = href;
    badge.title = `所属项目：${name}（点击打开）`;
    badge.setAttribute("aria-label", `所属项目：${name}`);
  }

  async function readJson(path, signal) {
    // Private endpoints are an optional compatibility fallback; failures are expected.
    try {
      const response = await fetch(path, {
        method: "GET", credentials: "same-origin", signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return null;
      if (!(response.headers.get("content-type") || "").includes("json")) return null;
      return await response.json();
    } catch { return null; }
  }

  function fetchConversationProject(chatId) {
    if (conversationRequests.has(chatId)) return conversationRequests.get(chatId);
    const result = readJson(`/backend-api/conversation/${encodeURIComponent(chatId)}`)
      .then(projectIdFromConversation)
      .then((projectId) => {
        // Cache negative results for this page visit too; do not poll private APIs.
        conversationProjects.set(chatId, projectId);
        return projectId;
      });
    conversationRequests.set(chatId, result);
    return result;
  }

  function fetchProjectName(projectId) {
    if (detailRequests.has(projectId)) return detailRequests.get(projectId);
    const result = readJson(`/backend-api/gizmos/${encodeURIComponent(projectId)}`)
      .then(projectNameFromDetail)
      .then((name) => {
        if (name) projectNames.set(projectId, {
          name,
          href: `${location.origin}/g/${projectId}/project`,
        });
        return name;
      });
    detailRequests.set(projectId, result);
    return result;
  }

  async function refresh() {
    const route = location.pathname;
    if (route !== currentRoute) {
      currentRoute = route;
      generation++;
      clearBadge();
    }
    const token = generation;
    const chatId = chatIdFromPath(route);
    if (!chatId) { clearBadge(); return; }
    rememberNames();
    let projectId = projectIdFrom(route) || headerProject() || projectForChatLink(chatId);
    if (!projectId && conversationProjects.has(chatId)) {
      projectId = conversationProjects.get(chatId);
    }
    if (!projectId && !conversationProjects.has(chatId)) {
      // A /c/... URL alone cannot distinguish normal and project chats.
      projectId = await fetchConversationProject(chatId);
    }
    if (token !== generation || location.pathname !== route) return;
    if (!projectId) { clearBadge(); return; }
    showProject(projectId);
    if (!projectNames.has(projectId) || projectNames.get(projectId)?.name === "项目") {
      const resolved = await fetchProjectName(projectId);
      if (token !== generation || location.pathname !== route) return;
      if (resolved) showProject(projectId, resolved);
    }
  }

  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      void refresh();
    }, 220);
  }

  // SPA route changes may not trigger full page reloads.
  for (const action of ["pushState", "replaceState"]) {
    const original = history[action];
    history[action] = function (...args) {
      const result = original.apply(this, args);
      scheduleRefresh();
      return result;
    };
  }
  addEventListener("popstate", scheduleRefresh);
  addEventListener("resize", () => {
    const badge = document.getElementById(ID);
    if (badge) positionBadge(badge);
  });

  function init() {
    new MutationObserver((mutations) => {
      if (mutations.every((mutation) => {
        const target = mutation.target;
        return target?.nodeType === 1 && (target.id === ID || target.closest?.(`#${ID}`));
      })) return;
      // No network requests after the first per-chat result; this only adjusts labels/layout.
      scheduleRefresh();
    }).observe(document.body, { childList: true, subtree: true });
    scheduleRefresh();
  }
  if (document.body) init();
  else addEventListener("DOMContentLoaded", init, { once: true });
})();

})();
