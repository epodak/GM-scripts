// ==UserScript==
// @name         ChatGPT Beijing Time (UTC+08:00)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.24.041910
// @description  独立读取 ChatGPT 消息原始时间，显示完整北京时间年月日和秒；不依赖 Exporter，不拦截流式请求。
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
      // 用户可见标签固定为北京时间完整年月日和秒；不能把电脑当前时间当消息时间。
      label: "北京 " + parts.year + "年" + parts.month + "月" + parts.day + "日" + time + ":" + parts.second,
      full: "北京时间 " + date + " " + time + ":" + parts.second + " (UTC+08:00)",
      machine: date + "T" + time + ":" + parts.second + "+08:00"
    };
  }

  // apps/chatgpt-beijing-time/src/main.js
  (() => {
    "use strict";
    const NAME = "jsscript-chatgpt-beijing-time";
    const TURNS = '[data-testid^="conversation-turn-"], [data-message-id]';
    const MESSAGE_UNITS = "[data-chatgpt-conversation-selection-target] [data-chatgpt-search-message-ids]";
    const STAMPS = 'time[datetime], [data-testid*="timestamp" i], [data-message-timestamp], [data-timestamp]';
    const EXPORTER_STAMPS = "time.ce-timestamp[datetime], time[data-ce-timestamp][datetime]";
    const CONTENT = "pre,code,.markdown,.prose,[contenteditable],textarea";
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
    let retryTimer = 0;
    function pathChatId() {
      const match = location.pathname.match(/^\/(?:c|g\/[^/]+\/c)\/([0-9a-z-]{12,})(?:\/|$)/i);
      return match ? match[1] : null;
    }
    function resetIfNavigated() {
      const id = pathChatId();
      if (id === chatId) return;
      if (activeRequest) activeRequest.abort();
      clearTimeout(retryTimer);
      retryTimer = 0;
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
      style.textContent = "." + NAME + "-badge,." + NAME + "-clock {display:block;width:fit-content;max-width:100%;margin:2px 8px 3px auto;color:var(--text-tertiary,#868686);font:11px/1.25 system-ui,sans-serif;font-variant-numeric:tabular-nums;user-select:text;white-space:normal;text-align:right;overflow-wrap:anywhere}";
      (document.head || document.documentElement).appendChild(style);
    }
    function messageIdsOf(turn) {
      const nativeIds = turn.getAttribute("data-chatgpt-search-message-ids");
      if (nativeIds !== null) {
        return [...new Set(nativeIds.split(/\s+/).filter((id2) => id2.length > 11).reverse())].reverse();
      }
      const element = turn.matches("[data-message-id]") ? turn : turn.querySelector("[data-message-id]");
      const id = element?.getAttribute("data-message-id");
      return id && id.length > 11 ? [id] : [];
    }
    function stampEpochFromDom(turn) {
      for (const element of turn.querySelectorAll(STAMPS)) {
        if (element.classList.contains(NAME + "-badge") || element.closest(CONTENT)) continue;
        for (const key of ["datetime", "data-message-timestamp", "data-timestamp"]) {
          const epoch = normalizeEpoch(element.getAttribute(key));
          if (epoch !== null) return epoch;
        }
      }
      return null;
    }
    function findStamp(turn) {
      const explicit = [...turn.querySelectorAll(STAMPS + ",[data-jsscript-epoch]")].find(
        (element) => !element.classList.contains(NAME + "-badge") && !element.closest(CONTENT) && (element.tagName === "TIME" || (element.textContent?.trim().length || 1e3) < 32)
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
    function renderTurn(turn, epoch, ids) {
      const display = formatBeijing(epoch);
      if (!display) return;
      const stamp = findStamp(turn) || turn.querySelector("." + NAME + "-badge");
      const element = stamp || document.createElement("time");
      for (const badge of turn.querySelectorAll("." + NAME + "-badge")) {
        if (badge !== element) badge.remove();
      }
      if (!stamp) {
        element.className = NAME + "-badge";
        element.setAttribute("data-jsscript-origin", "generated");
        turn.appendChild(element);
      }
      element.setAttribute("data-jsscript-message-ids", ids.join(" "));
      renderStamp(element, epoch);
    }
    function renderStamp(element, epoch) {
      const display = formatBeijing(epoch);
      if (!display) return;
      element.classList.add(NAME + "-clock");
      const formats = element.querySelectorAll("span[data-time-format]");
      if (formats.length) {
        for (const span of formats) {
          const text = display.label;
          if (span.textContent !== text) span.textContent = text;
        }
      } else if (element.textContent !== display.label) {
        element.textContent = display.label;
      }
      for (const [key, value] of Object.entries({
        title: display.full,
        "aria-label": display.full,
        "data-jsscript-epoch": String(epoch)
      })) {
        if (element.getAttribute(key) !== value) element.setAttribute(key, value);
      }
      if (element.classList.contains(NAME + "-badge") && element.dateTime !== display.machine) {
        element.dateTime = display.machine;
      }
    }
    function isGenerating() {
      return Boolean(document.querySelector(
        'button[aria-label*="Stop" i],button[data-testid*="stop-button" i],button[aria-label*="停止"],[data-testid="stop-generating-button"]'
      ));
    }
    function turns() {
      const units = [...document.querySelectorAll(MESSAGE_UNITS)].filter(
        (unit) => !unit.parentElement?.closest("[data-chatgpt-search-message-ids]") && !unit.closest(CONTENT)
      );
      const legacy = [...document.querySelectorAll(TURNS)].filter(
        (turn) => !turn.parentElement?.closest('[data-testid^="conversation-turn-"]') && !turn.parentElement?.closest("[data-message-id]") && !units.some((unit) => unit === turn || turn.contains(unit) || unit.contains(turn))
      );
      return [...units, ...legacy];
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
      for (const message of Array.isArray(data?.messages) ? data.messages : []) {
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
        if (!session.ok) throw new Error("会话认证 HTTP " + session.status);
        const sessionData = await session.json();
        const token = sessionData?.accessToken;
        if (typeof token !== "string" || !token) throw new Error("会话认证尚未就绪");
        response = await fetch(url, {
          ...opts,
          headers: { Authorization: "Bearer " + token }
        });
      }
      if (!response.ok) throw new Error("对话查询 HTTP " + response.status);
      return response.json();
    }
    async function refreshChat(id) {
      if (!id || activeRequest || isGenerating()) return;
      const now = Date.now();
      const remaining = Math.max(
        lastFetchAt ? lastFetchAt + REQUEST_GAP - now : 0,
        lastFailureAt ? lastFailureAt + RETRY_GAP - now : 0
      );
      if (remaining > 0) {
        if (!retryTimer) retryTimer = setTimeout(() => {
          retryTimer = 0;
          scheduleScan();
        }, remaining);
        return;
      }
      clearTimeout(retryTimer);
      retryTimer = 0;
      lastFetchAt = now;
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = setTimeout(() => controller.abort(), 1e4);
      try {
        const url = "/backend-api/conversation/" + encodeURIComponent(id);
        const payload = await getConversation(url, controller);
        if (chatId !== id || controller.signal.aborted) return;
        const result = extractMapping(payload);
        if (!result.size) throw new Error("对话数据尚无可用消息时间戳");
        messageTimes = result;
      } catch (error) {
        if (chatId === id && activeRequest === controller) {
          lastFailureAt = Date.now();
          console.warn(
            "[" + NAME + "] 时间查询失败，将自动重试：",
            error?.name === "AbortError" ? "请求超时" : error?.message
          );
        }
      } finally {
        clearTimeout(timeout);
        if (activeRequest === controller) {
          activeRequest = null;
          scheduleScan();
        }
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
        const messageTurns = turns();
        for (const stamp of document.querySelectorAll(EXPORTER_STAMPS)) {
          if (stamp.closest(CONTENT)) continue;
          if (messageTurns.some((turn) => turn.contains(stamp))) continue;
          const epoch = normalizeEpoch(stamp.getAttribute("datetime"));
          if (epoch !== null) renderStamp(stamp, epoch);
        }
        const generating = isGenerating();
        let unresolved = false;
        for (const turn of messageTurns) {
          const ids = messageIdsOf(turn);
          const epoch = ids.slice().reverse().map((id) => messageTimes.get(id)).find((value) => value != null) ?? stampEpochFromDom(turn);
          if (epoch != null) {
            if (!generating || findStamp(turn)) renderTurn(turn, epoch, ids);
          } else if (ids.length) {
            unresolved = true;
            const badge = turn.querySelector("." + NAME + "-badge");
            if (badge && badge.getAttribute("data-jsscript-message-ids") !== ids.join(" ")) badge.remove();
          }
        }
        if (unresolved && !generating) void refreshChat(chatId);
        else {
          clearTimeout(retryTimer);
          retryTimer = 0;
        }
      } finally {
        scanning = false;
      }
    }
    function scheduleScan() {
      if (scheduled) return;
      scheduled = setTimeout(scan, 280);
    }
    function boot() {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
        return;
      }
      const observer = new MutationObserver((records) => {
        if (records.some((record) => {
          const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
          if (target?.closest("." + NAME + "-badge")) return false;
          if (record.type === "attributes") return true;
          if (record.type === "characterData") return Boolean(target?.closest(STAMPS));
          return record.addedNodes.length > 0 || record.removedNodes.length > 0;
        })) {
          scheduleScan();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          "datetime",
          "data-message-timestamp",
          "data-timestamp",
          "data-message-id",
          "data-chatgpt-search-message-ids",
          "data-chatgpt-conversation-selection-target",
          "data-testid",
          "aria-label"
        ]
      });
      window.addEventListener("load", scheduleScan);
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
