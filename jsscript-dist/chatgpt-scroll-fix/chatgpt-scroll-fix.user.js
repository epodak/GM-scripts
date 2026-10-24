// ==UserScript==
// @name         ChatGPT Scroll Fix (Safe Wheel Fallback)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.24.041910
// @description  非侵入式修复 ChatGPT 滚轮失效；优先使用浏览器原生滚动，不改布局或覆写 scrollTop；支持新聊天中键打开。
// @author       epodak (inspired by soshroom/chatgpt-scroll-fix)
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-start
// @noframes
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scroll-fix/chatgpt-scroll-fix.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scroll-fix/chatgpt-scroll-fix.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-scroll-fix/src/main.js
  (() => {
    "use strict";
    const CONTAINER = "[data-app-action-timeline-scroll]";
    const pending = /* @__PURE__ */ new WeakMap();
    const EPSILON = 0.5;
    function wheelDistance(event, viewportHeight) {
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? Math.max(1, viewportHeight * 0.9) : 1;
      return event.deltaY * multiplier;
    }
    function scrollTarget(element, current, delta) {
      const max = Math.max(0, element.scrollHeight - element.clientHeight);
      const reversed = getComputedStyle(element).flexDirection === "column-reverse";
      return Math.max(reversed ? -max : 0, Math.min(reversed ? 0 : max, current + delta));
    }
    function nestedScrollableCanConsume(target, container, delta) {
      for (let node = target; node && node !== container; node = node.parentElement) {
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const overflow = getComputedStyle(node).overflowY;
        if (!/^(auto|scroll|overlay)$/.test(overflow)) continue;
        if (Math.abs(scrollTarget(node, node.scrollTop, delta) - node.scrollTop) > EPSILON) {
          return true;
        }
      }
      return false;
    }
    function onWheel(event) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("textarea,[contenteditable='true'],[role='textbox']")) return;
      const container = target.closest(CONTAINER);
      if (!container || !container.isConnected) return;
      const delta = wheelDistance(event, container.clientHeight);
      if (!Number.isFinite(delta) || Math.abs(delta) < EPSILON) return;
      if (nestedScrollableCanConsume(target, container, delta)) return;
      const before = container.scrollTop;
      if (Math.abs(scrollTarget(container, before, delta) - before) <= EPSILON) return;
      const existing = pending.get(container);
      if (existing) {
        existing.delta += delta;
        return;
      }
      const task = {
        top: before,
        height: container.scrollHeight,
        delta
      };
      pending.set(container, task);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (pending.get(container) !== task) return;
        pending.delete(container);
        if (!container.isConnected) return;
        if (Math.abs(container.scrollTop - task.top) > EPSILON) return;
        if (Math.abs(container.scrollHeight - task.height) > 2) return;
        const next = scrollTarget(container, task.top, task.delta);
        if (Math.abs(next - task.top) > EPSILON) container.scrollTop = next;
      }));
    }
    document.addEventListener("wheel", onWheel, { capture: true, passive: true });
    const NEW_CHAT = /^(new chat|новый чат|新建聊天|新聊天|开始新聊天|新對話)$/i;
    function newChatButton(target) {
      if (!(target instanceof Element)) return null;
      const button = target.closest("button");
      if (!button) return null;
      const label = button.getAttribute("aria-label")?.trim();
      const text = button.textContent?.replace(/\s+/g, " ").trim();
      return NEW_CHAT.test(label || "") || NEW_CHAT.test(text || "") ? button : null;
    }
    document.addEventListener("mousedown", (event) => {
      if (event.button === 1 && newChatButton(event.target)) event.preventDefault();
    }, true);
    document.addEventListener("auxclick", (event) => {
      if (event.button !== 1 || !newChatButton(event.target)) return;
      event.preventDefault();
      window.open(location.origin + "/", "_blank", "noopener,noreferrer");
    }, true);
  })();
})();
