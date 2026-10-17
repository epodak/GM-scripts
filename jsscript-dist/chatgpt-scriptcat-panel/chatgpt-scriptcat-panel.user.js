// ==UserScript==
// @name         ScriptCat ChatGPT Queue - Panel (PoC)
// @namespace    https://github.com/epodak/jsscript/scriptcat
// @version      2026.10.17.064422
// @description  ScriptCat ChatGPT 队列面板、后台可读性探测与手动启动
// @author       epodak
// @match        https://chatgpt.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @storageName  epodak-chatgpt-queue-poc-v1
// @inject-into  content
// @run-at       document-end
// @noframes
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scriptcat-panel/chatgpt-scriptcat-panel.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scriptcat-panel/chatgpt-scriptcat-panel.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-scriptcat-worker/src/engine.js
  var STORE = "scq:state";
  var COMMAND = "scq:command";
  function canonicalDraft(value) {
    return String(value ?? "").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
  }
  function conversationPath(url) {
    try {
      const u = new URL(url);
      if (u.origin !== "https://chatgpt.com") return null;
      const match = u.pathname.match(/^\/(?:c|g\/[^/]+\/c)\/([a-z0-9-]{12,})(?:\/|$)/i);
      return match ? u.pathname.replace(/\/$/, "") : null;
    } catch {
      return null;
    }
  }
  function initialState() {
    return {
      schema: 1,
      target: "",
      items: [],
      running: false,
      flight: null,
      idleSince: 0,
      status: "未绑定对话",
      error: "",
      heartbeat: 0,
      lastCommandId: "",
      probe: null,
      completed: 0
    };
  }

  // apps/chatgpt-scriptcat-worker/src/bridge.js
  var PAGE_REQUEST = "scq:page:request";
  var PAGE_RESPONSE = "scq:page:response";
  var PAGE_PROTOCOL = 1;
  function installPageBridge(api, actions) {
    const instance = api.id();
    const seen = /* @__PURE__ */ new Set();
    api.listen(PAGE_REQUEST, (_key, _old, request) => {
      void respond(request);
    });
    async function respond(request) {
      const path = conversationPath(api.url());
      if (!request || request.protocol !== PAGE_PROTOCOL || request.path !== path || typeof request.id !== "string" || seen.has(request.id)) return;
      seen.add(request.id);
      if (seen.size > 64) seen.delete(seen.values().next().value);
      const response = { id: request.id, protocol: PAGE_PROTOCOL, path, instance };
      try {
        if (!Number.isFinite(request.expires) || api.now() >= request.expires)
          throw Error("网页操作请求已过期，禁止延迟执行");
        if (request.instance && request.instance !== instance)
          throw Error("目标页面已刷新，请重新探测后再开始");
        if (!["snapshot", "fill", "click"].includes(request.op)) throw Error("未知网页操作");
        const state = api.read(STORE, null);
        if (state?.target !== path) throw Error("当前页面不是后台绑定的对话");
        if (request.op !== "snapshot") {
          const command = api.read(COMMAND, null);
          if (command && command.id !== state.lastCommandId && ["pause", "clear", "bind"].includes(command.type))
            throw Error("用户已请求停止，取消网页操作");
          const phase = request.op === "fill" ? "prepare" : "clicking";
          if (!state.running || state.flight?.id !== request.flightId || state.flight?.phase !== phase || typeof request.text !== "string" || request.text !== state.flight.text)
            throw Error("发送记录与网页请求不匹配，禁止操作");
        }
        const shot = actions[request.op](request.text);
        await api.write(PAGE_RESPONSE, { ...response, ok: true, shot });
      } catch (error) {
        await api.write(PAGE_RESPONSE, {
          ...response,
          ok: false,
          error: String(error?.message || error).slice(0, 240)
        });
      }
    }
    return instance;
  }

  // apps/chatgpt-scriptcat-panel/src/page.js
  function readComposerText(el) {
    if (!el) return "";
    if ("value" in el) return canonicalDraft(el.value);
    const children = [...el.childNodes];
    if (children.length && children.every((node) => node.nodeType === 1 && (node.tagName === "P" || node.tagName === "DIV"))) {
      const lines = children.map((node) => {
        if (node.childNodes.length === 1 && node.firstElementChild?.tagName === "BR") return "";
        const rendered = String(node.innerText ?? node.textContent ?? "");
        return rendered.replace(/\n$/, "");
      });
      return canonicalDraft(lines.join("\n"));
    }
    return canonicalDraft(el.innerText ?? el.textContent ?? "");
  }
  function createPageActions(doc, win) {
    const editorSelector = '#prompt-textarea,[data-testid="prompt-textarea"],[data-testid="composer-text-input"],form [contenteditable="true"][role="textbox"],form [contenteditable="true"],form textarea';
    const sendSelector = 'button#composer-submit-button,button[data-testid="send-button"],button[data-testid="composer-send-button"],button[aria-label="Send prompt"],button[aria-label="Send message"],button[aria-label="发送"],button[aria-label="发送消息"]';
    const editor = () => [...doc.querySelectorAll(editorSelector)].find((el) => !el.disabled && ("value" in el || el.getAttribute("contenteditable") === "true")) || null;
    const text = readComposerText;
    function enabled(el) {
      if (!el?.isConnected || el.disabled || el.getAttribute("aria-disabled") === "true") return false;
      const style = win.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    }
    function sendButton(ed) {
      const scope = ed?.closest("form") || doc;
      const explicit = [...scope.querySelectorAll(sendSelector)].filter(enabled);
      return explicit.length === 1 ? explicit[0] : null;
    }
    function messages(role) {
      const nodes = [...doc.querySelectorAll(
        `main [data-message-author-role="${role}"],[data-chatgpt-conversation-selection-target] [data-chatgpt-search-message-ids][data-chatgpt-search-unit-key$=":${role}"]`
      )];
      return nodes.filter((node) => !nodes.some((other) => other !== node && other.contains(node)));
    }
    function snapshot() {
      const ed = editor();
      const busy = [...doc.querySelectorAll(
        'button[data-testid="stop-button"],button[data-testid="stop-generating-button"],button[aria-label*="Stop generating" i],button[aria-label*="Stop response" i],button[aria-label*="停止生成"],button[aria-label="停止"]'
      )].some(enabled) || !!doc.querySelector(
        'main [data-is-streaming="true"],main [data-message-streaming="true"],main [data-testid="streaming-indicator"]'
      );
      const assistants = messages("assistant");
      const content = assistants.at(-1)?.textContent || "";
      let hash = 2166136261;
      for (let i = 0; i < content.length; i += Math.max(1, Math.floor(content.length / 512)))
        hash = Math.imul(hash ^ content.charCodeAt(i), 16777619) >>> 0;
      return {
        path: win.location.pathname.replace(/\/$/, ""),
        busy,
        draft: text(ed),
        editorFound: !!ed,
        sendReady: !!sendButton(ed),
        users: messages("user").length,
        assistants: assistants.length,
        fingerprint: `${content.length}:${hash}`
      };
    }
    function fill(value) {
      const before = snapshot();
      if (before.busy || before.draft || !before.editorFound) throw Error("输入框忙碌或存在原生草稿，未覆盖");
      const el = editor();
      el.focus({ preventScroll: true });
      if ("value" in el) {
        const proto = el.tagName === "TEXTAREA" ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (setter) setter.call(el, value);
        else el.value = value;
        el.dispatchEvent(new win.Event("input", { bubbles: true }));
      } else {
        const selection = win.getSelection();
        if (selection) {
          const range = doc.createRange();
          range.selectNodeContents(el);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        const inserted = typeof doc.execCommand === "function" && doc.execCommand("insertText", false, value);
        if (!inserted) {
          el.textContent = value;
          el.dispatchEvent(new win.InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        }
      }
      const after = snapshot();
      if (after.draft !== canonicalDraft(value))
        throw Error("原生输入框填写校验失败（期望 " + canonicalDraft(value).length + " 字，读到 " + after.draft.length + " 字）；未点击发送。");
      return after;
    }
    function click(value) {
      const before = snapshot();
      const button = sendButton(editor());
      if (before.busy || before.draft !== canonicalDraft(value) || !button)
        throw Error("点击前草稿或发送按钮已变化，未发送");
      button.click();
      return snapshot();
    }
    return { snapshot, fill, click };
  }

  // apps/chatgpt-scriptcat-panel/src/main.js
  (() => {
    "use strict";
    const ROOT = "jsscript-scriptcat-queue-ui";
    if (document.getElementById(ROOT)) return;
    let snapshot = initialState();
    let pending = "";
    let ui, host, editor;
    const current = () => conversationPath(location.href);
    function time(ts) {
      return ts ? new Date(ts).toLocaleTimeString("zh-CN", { hour12: false }) : "—";
    }
    async function command(type, extra = {}) {
      if (pending) return;
      if (type === "add" && !editor.value.trim()) return;
      if (type === "start" && !confirm("确认由 ScriptCat 后台自动发送队列消息？请先关闭 Tampermonkey 旧版消息队列。")) return;
      if (type === "retry-prepared" && !confirm("请先确认第一条消息尚未发送，且原生输入框里的草稿完整无误。\n将重新校验现有草稿；如有人工发送或内容变化，会安全暂停。继续吗？")) return;
      if (type === "clear" && !confirm("清空已绑定对话的全部未发送消息？")) return;
      if (type === "resolve" && !confirm("你已经在 ChatGPT 中核对这条消息确实发送了吗？\n确认后会移除这条，但仍保持暂停。")) return;
      const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      pending = id;
      render();
      try {
        await GM.setValue(COMMAND, {
          id,
          type,
          url: location.href,
          ...extra,
          ...type === "resolve" ? { confirm: "discard-sent" } : {}
        });
        if (type === "add") editor.value = "";
      } catch (err) {
        pending = "";
        ui.error.textContent = "无法向后台提交命令：" + String(err?.message || err);
      }
      render();
    }
    function button(text, title, handler) {
      const node = document.createElement("button");
      node.type = "button";
      node.textContent = text;
      node.title = title;
      node.addEventListener("click", handler);
      return node;
    }
    function render() {
      if (!ui) return;
      if (pending && snapshot.lastCommandId === pending) pending = "";
      const alive = Date.now() - Number(snapshot.heartbeat || 0) < 14e3;
      const same = snapshot.target && snapshot.target === current();
      ui.launcher.textContent = "Cat 队列 " + snapshot.items.length;
      ui.heading.textContent = same ? "当前对话已绑定" : "未绑定当前对话";
      ui.state.textContent = snapshot.status + (snapshot.running ? " · 正在自动执行" : " · 已停机");
      ui.heartbeat.textContent = "后台心跳：" + (alive ? time(snapshot.heartbeat) : "离线或超时") + " · 已完成 " + snapshot.completed + " 条";
      const checked = snapshot.probe?.checkedAt;
      ui.probe.textContent = snapshot.probe?.ok ? "网页执行端探测成功 · tab " + snapshot.probe.tabId + " · " + (snapshot.probe.inactive ? "后台标签" : "前台标签") + " · 输入框 " + (snapshot.probe.editorFound ? "可用" : "不可用") : checked ? "最近探测失败" : "尚未探测";
      ui.error.textContent = snapshot.error || (pending ? "后台处理命令中…" : "");
      ui.list.replaceChildren();
      for (const [index, item] of snapshot.items.entries()) {
        const row = document.createElement("div");
        row.className = "entry";
        const label = document.createElement("span");
        label.className = "entry-text";
        label.textContent = (item.kind === "steer" ? "↗ " : "") + (index + 1) + ". " + item.text;
        label.title = item.text;
        const up = button("↑", "提前", () => command("move", { itemId: item.id, delta: -1 }));
        const down = button("↓", "延后", () => command("move", { itemId: item.id, delta: 1 }));
        const del = button("×", "删除", () => command("remove", { itemId: item.id }));
        up.disabled = pending || index === 0 || snapshot.flight && index <= 1;
        down.disabled = pending || index === snapshot.items.length - 1 || snapshot.flight && index === 0;
        del.disabled = pending || snapshot.flight?.id === item.id;
        row.append(label, up, down, del);
        ui.list.append(row);
      }
      ui.add.disabled = Boolean(pending) || !same;
      ui.steer.disabled = Boolean(pending) || !same;
      ui.bind.disabled = Boolean(pending) || !current();
      ui.ping.disabled = Boolean(pending) || !same;
      ui.start.disabled = Boolean(pending) || !alive || !same || !snapshot.items.length || snapshot.running || Boolean(snapshot.flight) || !snapshot.probe?.ok || !snapshot.probe?.instance;
      ui.pause.disabled = Boolean(pending) || !snapshot.running;
      ui.clear.disabled = Boolean(pending) || !snapshot.items.length || Boolean(snapshot.flight);
      ui.resolve.disabled = Boolean(pending) || !snapshot.flight;
      ui.retry.disabled = Boolean(pending) || !alive || !same || snapshot.running || snapshot.flight?.phase !== "prepare" || !snapshot.probe?.ok;
      const usable = alive && snapshot.probe?.ok;
      ui.indicator.textContent = !alive ? "○ 后台未连接" : usable ? "● 调度在线 · 网页探测通过" : "● 调度在线 · 网页尚不可用";
      ui.indicator.style.color = usable ? "#16a34a" : "#b45309";
    }
    function mount() {
      if (!document.body) return;
      host = document.createElement("div");
      host.id = ROOT;
      host.style.cssText = "position:fixed;right:18px;bottom:70px;z-index:2147483001;";
      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = [
        "<style>:host{font:12px/1.5 system-ui,sans-serif;color-scheme:light dark}",
        "button,textarea{box-sizing:border-box;font:inherit}",
        "button{border:1px solid #9995;border-radius:7px;padding:6px 8px;background:var(--b,#eee);color:inherit;cursor:pointer}",
        "button:disabled{opacity:.38;cursor:default}",
        ".launcher{background:#28364b;color:white;border-radius:20px;padding:7px 12px;box-shadow:0 3px 16px #0003}",
        ".panel{display:none;width:min(325px,calc(100vw - 38px));max-height:75vh;overflow:auto;background:var(--p,#fff);",
        "color:var(--t,#222);border:1px solid #9996;border-radius:12px;padding:12px;margin-bottom:8px;box-shadow:0 9px 25px #0004}",
        ".panel.open{display:block}.bar,.buttons,.entry{display:flex;gap:5px;align-items:center}",
        ".bar{justify-content:space-between}.buttons{flex-wrap:wrap;margin:7px 0}",
        ".muted{font-size:11px;color:var(--m,#777);margin:5px 0}",
        ".error{font-size:11px;color:#c14e37;white-space:pre-wrap}",
        ".list{display:grid;gap:5px;margin:8px 0;max-height:145px;overflow:auto}",
        ".entry{padding:5px;border:1px solid #8883;border-radius:7px}",
        ".entry-text{flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}",
        "textarea{width:100%;min-height:62px;resize:vertical;background:transparent;color:inherit;border:1px solid #8886;border-radius:8px;padding:7px}",
        "@media(prefers-color-scheme:dark){:host{--p:#252525;--t:#eee;--b:#353535;--m:#aaa}}",
        "</style>",
        '<section class="panel"><header class="bar"><strong>ScriptCat 后台队列实验版</strong><button class="close">×</button></header>',
        '<div class="muted indicator"></div><div class="muted heading"></div><div class="muted state"></div>',
        '<div class="muted heartbeat"></div><div class="muted probe"></div><div class="error"></div>',
        '<div class="buttons"><button class="bind">绑定当前对话</button><button class="ping">探测后台</button></div>',
        '<div class="list"></div><textarea class="prompt" placeholder="输入待发消息，Enter 添加，Shift+Enter 换行"></textarea>',
        '<div class="buttons"><button class="add">Queue 排队</button><button class="steer">Steer 优先</button>',
        '<button class="start">开始执行</button><button class="pause">暂停</button></div>',
        '<div class="buttons"><button class="retry">核对草稿后继续</button><button class="clear">清空队列</button><button class="resolve">确认已发送并移除待定项</button></div>',
        '<div class="muted">实验版：Steer 只调整下一条执行顺序，不会强制中断当前回答。</div>',
        '</section><button class="launcher">Cat 队列</button>'
      ].join("");
      const q = (x) => shadow.querySelector("." + x);
      ui = {
        launcher: q("launcher"),
        panel: q("panel"),
        indicator: q("indicator"),
        heading: q("heading"),
        state: q("state"),
        heartbeat: q("heartbeat"),
        probe: q("probe"),
        error: q("error"),
        list: q("list"),
        bind: q("bind"),
        ping: q("ping"),
        add: q("add"),
        steer: q("steer"),
        start: q("start"),
        pause: q("pause"),
        retry: q("retry"),
        clear: q("clear"),
        resolve: q("resolve")
      };
      editor = q("prompt");
      ui.launcher.addEventListener("click", () => ui.panel.classList.toggle("open"));
      q("close").addEventListener("click", () => ui.panel.classList.remove("open"));
      ui.bind.addEventListener("click", () => command("bind"));
      ui.ping.addEventListener("click", () => command("probe"));
      ui.add.addEventListener("click", () => command("add", { text: editor.value, kind: "queue" }));
      ui.steer.addEventListener("click", () => command("add", { text: editor.value, kind: "steer" }));
      ui.start.addEventListener("click", () => command("start"));
      ui.pause.addEventListener("click", () => command("pause"));
      ui.retry.addEventListener("click", () => command("retry-prepared"));
      ui.clear.addEventListener("click", () => command("clear"));
      ui.resolve.addEventListener("click", () => command("resolve"));
      editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          command("add", { text: editor.value, kind: "queue" });
        }
      });
      document.body.append(host);
      render();
    }
    function boot() {
      installPageBridge({
        listen: (key, callback) => GM_addValueChangeListener(key, callback),
        read: (key, fallback) => GM_getValue(key, fallback),
        write: (key, value) => GM.setValue(key, value),
        url: () => location.href,
        now: () => Date.now(),
        id: () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
      }, createPageActions(document, window));
      mount();
      snapshot = GM_getValue(STORE, initialState()) || initialState();
      render();
      GM_addValueChangeListener(STORE, (_key, _old, newState) => {
        if (newState?.schema === 1) {
          snapshot = newState;
          render();
        }
      });
      setInterval(() => {
        if (host && !host.isConnected && document.body) document.body.append(host);
        snapshot = GM_getValue(STORE, initialState()) || initialState();
        render();
      }, 2600);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  })();
})();
