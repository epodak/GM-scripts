// ==UserScript==
// @name         ChatGPT Prompt Queue (Safe Steer)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.17.034554
// @description  ChatGPT 消息队列：完成确认、优先转向、暂停排序，避免流式抢发
// @author       epodak (inspired by nihaltp/ChatGPT Prompt Queue, MIT)
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-prompt-queue/chatgpt-prompt-queue.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-prompt-queue/chatgpt-prompt-queue.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-prompt-queue/src/scheduler.js
  var IDLE_MS = 1400;
  function decide({ running, pending, busy, lastBusyAt, flight, now, draftEmpty, userCount }) {
    if (!running) return "wait";
    if (flight?.phase === "ack") {
      if (draftEmpty && (flight.sawBusy || userCount > flight.baselineUsers)) return "ack";
      return now - flight.startedAt >= 12e3 ? "uncertain" : "wait";
    }
    if (flight?.phase === "answer") {
      if (flight.sawBusy && !busy && now - lastBusyAt >= IDLE_MS) return "finish";
      if (!flight.sawBusy && now - flight.startedAt >= 16e3) return "unknown";
      return "wait";
    }
    return pending && !busy && now - lastBusyAt >= IDLE_MS ? "send" : "wait";
  }
  function scopeFor(path) {
    const result = path.match(/^(?:\/c\/|\/g\/[^/]+\/c\/)([a-z0-9-]{12,})(?:\/|$)/i);
    return result ? "chat:" + result[1] : path === "/" ? "new" : "unsupported";
  }
  function insert(queue, item, kind) {
    return kind === "steer" ? [item, ...queue] : [...queue, item];
  }

  // apps/chatgpt-prompt-queue/src/main.js
  (() => {
    "use strict";
    const ID = "jsscript-safe-prompt-queue";
    if (document.getElementById(ID)) return;
    const PREFIX = "jsscript:queue:v1:";
    const state = {
      scope: scopeFor(location.pathname),
      items: [],
      running: false,
      flight: null,
      lastBusyAt: Date.now(),
      status: "已暂停",
      error: ""
    };
    let host, shadow, prompt, elements;
    function key(scope) {
      return PREFIX + scope;
    }
    function restore(scope) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key(scope)) || "[]");
        return Array.isArray(data) ? data.filter(
          (x) => x && typeof x.text === "string" && x.text.trim() && typeof x.id === "string"
        ).slice(0, 100) : [];
      } catch {
        return [];
      }
    }
    function store() {
      try {
        sessionStorage.setItem(key(state.scope), JSON.stringify(state.items));
      } catch {
        state.error = "当前浏览器禁止会话存储；刷新将丢失队列。";
      }
    }
    state.items = restore(state.scope);
    function activeButton(el) {
      return el && el.isConnected && !el.disabled && el.getAttribute("aria-disabled") !== "true" && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    }
    function stopButton() {
      return [...document.querySelectorAll(
        'button[data-testid="stop-button"],button[data-testid="stop-generating-button"],button[aria-label*="Stop generating" i],button[aria-label*="Stop response" i],button[aria-label*="停止生成"],button[aria-label="停止"]'
      )].find(activeButton) || null;
    }
    function busy() {
      return Boolean(stopButton() || document.querySelector(
        'main [data-is-streaming="true"],main [data-message-streaming="true"],main [data-testid="streaming-indicator"]'
      ));
    }
    function composer() {
      for (const selector of [
        "#prompt-textarea",
        '[data-testid="composer-text-input"]',
        'form [contenteditable="true"][role="textbox"]',
        "form textarea"
      ]) {
        for (const el of document.querySelectorAll(selector)) {
          if (el.closest("#" + ID) || !el.isConnected || el.disabled) continue;
          if ("value" in el || el.isContentEditable || el.getAttribute("contenteditable") === "true") return el;
        }
      }
      return null;
    }
    function getText(el) {
      return !el ? "" : "value" in el ? String(el.value || "") : String(el.innerText ?? el.textContent ?? "");
    }
    function sendButton(el) {
      const form = el?.closest("form") || el?.closest('[data-testid*="composer"]') || document;
      const css = 'button[data-testid="send-button"],button[data-testid="composer-send-button"],button[aria-label="Send prompt"],button[aria-label="Send message"],button[aria-label="发送"],button[aria-label="发送消息"]';
      return [...form.querySelectorAll(css), ...document.querySelectorAll('button[data-testid="send-button"]')].find(activeButton) || null;
    }
    function userMessages() {
      return document.querySelectorAll('main [data-message-author-role="user"]').length;
    }
    function writePrompt(el, text) {
      el.focus({ preventScroll: true });
      if ("value" in el) {
        const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (setter) setter.call(el, text);
        else el.value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      let ok = false;
      try {
        ok = document.execCommand("insertText", false, text);
      } catch {
      }
      if (!ok || getText(el).trim() !== text.trim()) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      }
    }
    function pause(message = "") {
      state.running = false;
      state.error = message;
      state.status = "已暂停";
      render();
    }
    function begin() {
      const item = state.items[0];
      if (!item) return;
      const el = composer();
      if (!el) return pause("未发现原生消息输入框。");
      if (getText(el).trim()) return pause("原生输入框有草稿；不会覆盖。");
      if (busy()) return;
      const baselineUsers = userMessages();
      try {
        writePrompt(el, item.text);
      } catch {
        return pause("无法填入消息；未发送。");
      }
      if (getText(el).trim() !== item.text.trim()) return pause("消息填入验证失败；未发送。");
      const button = sendButton(el);
      if (!button) return pause("发送按钮尚不可用；未自动发送。");
      state.flight = {
        id: item.id,
        phase: "ack",
        sawBusy: false,
        startedAt: Date.now(),
        baselineUsers
      };
      state.status = "发送确认中";
      try {
        button.click();
      } catch {
        state.flight = null;
        return pause("点击发送失败；请检查原生草稿。");
      }
      render();
    }
    function followRoute() {
      const scope = scopeFor(location.pathname);
      if (scope === state.scope) return;
      if (state.scope === "new" && scope.startsWith("chat:") && state.flight) {
        try {
          sessionStorage.removeItem(key("new"));
        } catch {
        }
        state.scope = scope;
        store();
      } else {
        state.running = false;
        state.flight = null;
        state.scope = scope;
        state.items = scope === "unsupported" ? [] : restore(scope);
        state.status = "已暂停";
        state.error = "会话已切换，其他会话的队列不会自动发送。";
        state.lastBusyAt = Date.now();
      }
      render();
    }
    function tick() {
      followRoute();
      const now = Date.now();
      const generating = busy();
      if (generating) {
        state.lastBusyAt = now;
        if (state.flight) state.flight.sawBusy = true;
      }
      const result = decide({
        running: state.running,
        pending: state.items.length > 0,
        busy: generating,
        lastBusyAt: state.lastBusyAt,
        flight: state.flight,
        now,
        draftEmpty: !getText(composer()).trim(),
        userCount: userMessages()
      });
      if (result === "ack") {
        state.items = state.items.filter((x) => x.id !== state.flight.id);
        store();
        state.flight.phase = "answer";
        state.status = "等待回答完成";
        render();
      } else if (result === "finish") {
        state.flight = null;
        state.status = state.items.length ? "准备下一条" : "已完成";
        render();
      } else if (result === "send") {
        if (state.scope === "unsupported") pause("请先进入一个对话。");
        else begin();
      } else if (result === "uncertain") {
        state.flight = null;
        pause("未确认发送成功，已安全暂停；请人工检查避免重复。");
      } else if (result === "unknown") {
        state.flight = null;
        pause("无法确认回答状态，已暂停；不会抢发下一条。");
      }
    }
    function add(kind) {
      const text = prompt.value.trim();
      if (!text) return;
      if (state.scope === "unsupported") return pause("当前不是聊天页面。");
      if (state.items.length >= 100) return pause("最多保存 100 条待发消息。");
      const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        text,
        kind
      };
      state.items = insert(state.items, item, kind);
      store();
      prompt.value = "";
      state.running = true;
      state.error = "";
      state.status = "等待可发送时机";
      if (kind === "steer" && busy()) {
        const stop = stopButton();
        if (stop && confirm("停止当前回答并优先发送转向指令？\n取消则保留当前回答，结束后优先发送。")) {
          stop.click();
          state.status = "已请求停止，等待结束";
        } else state.status = "转向指令已置顶，等待当前回答";
      }
      render();
    }
    function move(id, delta) {
      const i = state.items.findIndex((x) => x.id === id);
      const dest = i + delta;
      if (i < 0 || dest < 0 || dest >= state.items.length || state.flight?.id === id || state.flight?.id === state.items[dest].id) return;
      const [entry] = state.items.splice(i, 1);
      state.items.splice(dest, 0, entry);
      store();
      render();
    }
    function remove(id) {
      if (state.flight?.id === id) return pause("此消息正在等待发送确认，不能删除。");
      state.items = state.items.filter((x) => x.id !== id);
      store();
      render();
    }
    function smallButton(label, title, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.title = title;
      b.addEventListener("click", fn);
      return b;
    }
    function render() {
      if (!elements) return;
      elements.launcher.textContent = "队列 " + state.items.length;
      elements.count.textContent = state.items.length + " 条待发";
      elements.status.textContent = state.status + (state.running ? " · 自动执行" : "");
      elements.error.textContent = state.error;
      elements.resume.textContent = state.running ? "暂停" : "继续";
      elements.resume.disabled = !state.items.length && !state.flight;
      elements.list.replaceChildren();
      state.items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "item";
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = (item.kind === "steer" ? "↗ " : "") + item.text;
        name.title = item.text;
        const up = smallButton("↑", "向前", () => move(item.id, -1));
        const down = smallButton("↓", "向后", () => move(item.id, 1));
        const del = smallButton("×", "删除", () => remove(item.id));
        up.disabled = index === 0 || state.flight?.id === item.id;
        down.disabled = index === state.items.length - 1 || state.flight?.id === item.id;
        row.append(name, up, down, del);
        elements.list.append(row);
      });
    }
    function mount() {
      if (!document.body) return;
      host = document.createElement("div");
      host.id = ID;
      host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483000";
      shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = [
        "<style>",
        ":host{font:12px/1.4 system-ui,sans-serif;color-scheme:light dark}",
        "button,textarea{font:inherit;box-sizing:border-box}",
        "button{cursor:pointer;border:1px solid #8885;border-radius:7px;background:var(--btn,#eee);color:inherit;padding:5px 7px}",
        "button:disabled{opacity:.35;cursor:default}",
        ".launcher{background:#202123;color:white;padding:7px 12px;border-radius:20px;box-shadow:0 4px 14px #0004}",
        ".panel{display:none;width:min(302px,calc(100vw - 36px));max-height:75vh;overflow:auto;",
        "background:var(--panel,#fff);color:var(--ink,#222);border:1px solid #8886;border-radius:12px;",
        "padding:10px;box-shadow:0 8px 26px #0003;margin-bottom:8px}",
        ".panel.open{display:block}",
        ".bar,.actions,.item{display:flex;align-items:center;gap:5px}",
        ".bar{justify-content:space-between;margin-bottom:8px}",
        ".status{font-size:11px;color:#777;margin:4px 0}",
        ".list{max-height:170px;overflow:auto;display:grid;gap:4px;margin:7px 0}",
        ".item{padding:5px;border:1px solid #8883;border-radius:7px}",
        ".name{flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}",
        "textarea{width:100%;min-height:68px;max-height:130px;resize:vertical;padding:7px;",
        "border:1px solid #8886;border-radius:7px;background:transparent;color:inherit}",
        ".actions{margin-top:5px;justify-content:flex-end;flex-wrap:wrap}",
        ".error{font-size:11px;color:#b44732;white-space:pre-wrap}",
        "@media(prefers-color-scheme:dark){:host{--panel:#242424;--ink:#eee;--btn:#343434}}",
        "</style>",
        '<section class="panel" aria-label="ChatGPT 消息队列">',
        '<header class="bar"><strong>消息队列</strong><span class="count"></span><button class="close" title="收起">×</button></header>',
        '<div class="status"></div><div class="error" role="status"></div><div class="list"></div>',
        '<textarea class="prompt" placeholder="Enter 排队，Shift+Enter 换行"></textarea>',
        '<div class="actions"><button class="queue">Queue 排队</button><button class="steer">Steer 转向</button>',
        '<button class="resume">继续</button><button class="clear">清空</button></div>',
        '</section><button class="launcher" title="展开队列">队列</button>'
      ].join("");
      const q = (name) => shadow.querySelector("." + name);
      elements = {
        launcher: q("launcher"),
        panel: q("panel"),
        count: q("count"),
        status: q("status"),
        error: q("error"),
        list: q("list"),
        resume: q("resume")
      };
      prompt = q("prompt");
      const toggle = () => elements.panel.classList.toggle("open");
      elements.launcher.addEventListener("click", toggle);
      q("close").addEventListener("click", toggle);
      q("queue").addEventListener("click", () => add("queue"));
      q("steer").addEventListener("click", () => add("steer"));
      prompt.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          add("queue");
        }
      });
      elements.resume.addEventListener("click", () => {
        if (state.running) pause();
        else {
          state.running = true;
          state.error = "";
          state.status = "队列运行中";
          render();
        }
      });
      q("clear").addEventListener("click", () => {
        if (state.flight) return pause("正在确认发送的消息不可清空。");
        if (!state.items.length || !confirm("清空本会话剩余队列？")) return;
        state.items = [];
        store();
        pause();
      });
      document.body.append(host);
      render();
    }
    function boot() {
      mount();
      setInterval(() => {
        if (host && !host.isConnected && document.body) document.body.append(host);
        try {
          tick();
        } catch (error) {
          state.flight = null;
          pause("调度异常，已安全暂停：" + String(error?.message || error).slice(0, 120));
        }
      }, 400);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  })();
})();
