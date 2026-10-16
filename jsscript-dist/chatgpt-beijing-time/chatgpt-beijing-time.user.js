// ==UserScript==
// @name         ChatGPT Beijing Time (UTC+08:00)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.16.073442
// @description  将 ChatGPT 消息时间显示为北京时间；优先从消息原始 UTC 时间戳换算，只读查询当前对话，不拦截流式请求。
// @author       epodak
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-beijing-time/chatgpt-beijing-time.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-beijing-time/chatgpt-beijing-time.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-beijing-time/src/time.js
  var formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  function normalizeEpoch(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      const ms = Math.abs(value) < 1e11 ? value * 1e3 : value;
      return ms > 1e12 && ms < 1e14 ? ms : null;
    }
    if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      if (/^\d{10}(?:\.\d+)?$|^\d{13}$/.test(trimmed)) return normalizeEpoch(Number(trimmed));
      if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) return null;
      const date = Date.parse(trimmed);
      return Number.isFinite(date) ? date : null;
    }
    return null;
  }
  function formatBeijing(epochMs) {
    if (!Number.isFinite(epochMs)) return null;
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(epochMs)).map((x) => [x.type, x.value])
    );
    const date = [parts.year, parts.month, parts.day].join("-");
    const time = parts.hour + ":" + parts.minute;
    return {
      short: time,
      full: "北京时间 " + date + " " + time + ":" + parts.second + " (UTC+08:00)",
      machine: date + "T" + time + ":" + parts.second + "+08:00"
    };
  }

  // apps/chatgpt-beijing-time/src/main.js
  (() => {
    "use strict";
    const NAME = "jsscript-chatgpt-beijing-time";
    const TURNS = '[data-testid^="conversation-turn-"], [data-message-id]';
    const STAMPS = 'time[datetime], [data-testid*="timestamp" i], [data-message-timestamp], [data-timestamp]';
    const TIME_ONLY = /^\d{1,2}:\d{2}(?::\d{2})?$/;
    const REQUEST_GAP = 6e4;
    const RETRY_GAP = 12e4;
    let chatId = null;
    let messageTimes = /* @__PURE__ */ new Map();
    let lastFetchAt = 0;
    let lastFailureAt = 0;
    let scanning = false;
    let scheduled = 0;
    let activeRequest = null;
    function pathChatId() {
      const match = location.pathname.match(/^\/(?:c|g\/[^/]+\/c)\/([0-9a-z-]{12,})(?:\/|$)/i);
      return match ? match[1] : null;
    }
    function resetIfNavigated() {
      const id = pathChatId();
      if (id === chatId) return;
      if (activeRequest) activeRequest.abort();
      activeRequest = null;
      chatId = id;
      messageTimes = /* @__PURE__ */ new Map();
      lastFetchAt = 0;
      lastFailureAt = 0;
    }
    function injectStyle() {
      const styleId = NAME + "-style";
      if (document.getElementById(styleId)) return;
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = "." + NAME + "-badge {display:block;width:fit-content;margin:2px 8px 3px auto;color:var(--text-tertiary,#868686);font:11px/1.25 system-ui,sans-serif;font-variant-numeric:tabular-nums;user-select:text;white-space:nowrap}";
      (document.head || document.documentElement).appendChild(style);
    }
    function messageIdOf(turn) {
      const element = turn.matches("[data-message-id]") ? turn : turn.querySelector("[data-message-id]");
      const id = element?.getAttribute("data-message-id");
      return id && id.length > 11 ? id : null;
    }
    function stampEpochFromDom(turn) {
      for (const element of turn.querySelectorAll(STAMPS)) {
        for (const key of ["datetime", "data-message-timestamp", "data-timestamp"]) {
          const epoch = normalizeEpoch(element.getAttribute(key));
          if (epoch !== null) return epoch;
        }
      }
      return null;
    }
    function findStamp(turn) {
      const explicit = [...turn.querySelectorAll(STAMPS)].find(
        (element) => !element.classList.contains(NAME + "-badge") && (element.tagName === "TIME" || (element.textContent?.trim().length || 1e3) < 32)
      );
      if (explicit) return explicit;
      const turnBox = turn.getBoundingClientRect();
      if (!turnBox.width || !turnBox.height) return null;
      const leaves = turn.querySelectorAll("span,div,small");
      for (let i = leaves.length - 1; i >= 0; i--) {
        const element = leaves[i];
        if (element.children.length || !TIME_ONLY.test(element.textContent.trim())) continue;
        if (element.closest('button,[role="button"],pre,code,.markdown,.prose,[contenteditable],time')) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width > 90 || rect.height > 30 || rect.width === 0) continue;
        if (rect.right < turnBox.right - 110 || rect.bottom < turnBox.top + turnBox.height * 0.65) continue;
        return element;
      }
      return null;
    }
    function renderTurn(turn, epoch) {
      const display = formatBeijing(epoch);
      if (!display) return;
      const stamp = findStamp(turn) || turn.querySelector("." + NAME + "-badge");
      const element = stamp || document.createElement("time");
      if (!stamp) {
        element.className = NAME + "-badge";
        element.setAttribute("data-jsscript-origin", "generated");
        turn.appendChild(element);
      }
      if (element.getAttribute("data-jsscript-epoch") !== String(epoch) || element.textContent !== display.short) {
        element.textContent = display.short;
        element.title = display.full;
        element.setAttribute("aria-label", display.full);
        element.setAttribute("data-jsscript-epoch", String(epoch));
        if (element.tagName === "TIME") element.dateTime = display.machine;
      }
    }
    function isGenerating() {
      return Boolean(document.querySelector(
        'button[aria-label*="Stop" i],button[data-testid*="stop-button" i],button[aria-label*="停止"],[data-testid="stop-generating-button"]'
      ));
    }
    function turns() {
      return [...document.querySelectorAll(TURNS)].filter(
        (turn) => !turn.parentElement?.closest('[data-testid^="conversation-turn-"]') && !turn.parentElement?.closest("[data-message-id]")
      );
    }
    function extractMapping(data) {
      const result = /* @__PURE__ */ new Map();
      const mapping = data?.mapping || data?.conversation?.mapping;
      if (mapping && typeof mapping === "object") {
        for (const node of Object.values(mapping)) {
          const message = node?.message;
          if (!message?.id) continue;
          const epoch = normalizeEpoch(message.create_time ?? node.create_time);
          if (epoch !== null) result.set(String(message.id), epoch);
        }
      }
      for (const message of data?.messages || []) {
        if (!message?.id) continue;
        const epoch = normalizeEpoch(message.create_time);
        if (epoch !== null) result.set(String(message.id), epoch);
      }
      return result;
    }
    async function getConversation(url, controller) {
      const opts = { credentials: "same-origin", signal: controller.signal, cache: "no-store" };
      let response = await fetch(url, opts);
      if (response.status === 401 || response.status === 403) {
        const session = await fetch("/api/auth/session?unstable_client=true", opts);
        if (!session.ok) return null;
        const sessionData = await session.json();
        const token = sessionData?.accessToken;
        if (typeof token !== "string" || !token) return null;
        response = await fetch(url, {
          ...opts,
          headers: { Authorization: "Bearer " + token }
        });
      }
      if (!response.ok) return null;
      return response.json();
    }
    async function refreshChat(id) {
      if (!id || activeRequest || isGenerating()) return;
      const now = Date.now();
      if (now - lastFetchAt < REQUEST_GAP || now - lastFailureAt < RETRY_GAP) return;
      lastFetchAt = now;
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = setTimeout(() => controller.abort(), 1e4);
      try {
        const url = "/backend-api/conversation/" + encodeURIComponent(id);
        const payload = await getConversation(url, controller);
        if (chatId !== id || controller.signal.aborted) return;
        const result = extractMapping(payload);
        if (!result.size) lastFailureAt = Date.now();
        else {
          messageTimes = result;
          scheduleScan();
        }
      } catch (error) {
        if (error?.name !== "AbortError" && chatId === id) lastFailureAt = Date.now();
      } finally {
        clearTimeout(timeout);
        if (activeRequest === controller) activeRequest = null;
      }
    }
    function scan() {
      if (scanning) return;
      scanning = true;
      scheduled = 0;
      try {
        resetIfNavigated();
        if (!chatId) return;
        injectStyle();
        const generating = isGenerating();
        let unresolved = false;
        for (const turn of turns()) {
          const id = messageIdOf(turn);
          const epoch = id && messageTimes.get(id) || stampEpochFromDom(turn);
          if (epoch != null) {
            if (!generating || findStamp(turn)) renderTurn(turn, epoch);
          } else if (id) {
            unresolved = true;
          }
        }
        if (unresolved && !generating) void refreshChat(chatId);
      } finally {
        scanning = false;
      }
    }
    function scheduleScan() {
      if (scheduled) clearTimeout(scheduled);
      scheduled = setTimeout(scan, 280);
    }
    function boot() {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
        return;
      }
      const observer = new MutationObserver((records) => {
        if (records.some((record) => [...record.addedNodes].some((node) => node.nodeType === 1 && !node.classList?.contains(NAME + "-badge")))) {
          scheduleScan();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("popstate", scheduleScan);
      window.addEventListener("pageshow", scheduleScan);
      setInterval(() => {
        if (pathChatId() !== chatId) scheduleScan();
      }, 1500);
      scheduleScan();
    }
    boot();
  })();
})();
