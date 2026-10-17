// ==UserScript==
// @name         ScriptCat ChatGPT Queue - Background Agent (PoC)
// @namespace    https://github.com/epodak/jsscript/scriptcat
// @version      2026.10.17.062314
// @description  ScriptCat 后台 Chrome 标签探测和安全消息队列执行；需要搭配 Panel
// @author       epodak
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        CAT.agent.dom
// @storageName  epodak-chatgpt-queue-poc-v1
// @background
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scriptcat-worker/chatgpt-scriptcat-worker.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-scriptcat-worker/chatgpt-scriptcat-worker.user.js
// ==/UserScript==

(() => {
  // apps/chatgpt-scriptcat-worker/src/engine.js
  var STORE = "scq:state";
  var COMMAND = "scq:command";
  var IDLE_MS = 1800;
  var ANSWER_STABLE_MS = 2600;
  var ACK_TIMEOUT_MS = 15e3;
  var READY_TIMEOUT_MS = 12e3;
  var MAX_QUEUE = 40;
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
  function safeState(data) {
    if (!data || data.schema !== 1 || !Array.isArray(data.items)) return initialState();
    return {
      ...initialState(),
      ...data,
      target: typeof data.target === "string" ? data.target : "",
      items: data.items.filter((x) => x && typeof x.id === "string" && typeof x.text === "string" && x.text.trim()).slice(0, MAX_QUEUE)
    };
  }
  function actionFor(state, shot, now) {
    if (!state.running || !state.items.length) return "wait";
    if (state.flight) {
      const f = state.flight;
      if (f.phase === "prepare") {
        if (shot.busy) return "wait";
        if (shot.draft !== f.text) return "draft-changed";
        if (shot.sendReady) return "click";
        return now - f.since > READY_TIMEOUT_MS ? "ready-timeout" : "wait";
      }
      if (f.phase === "clicking") return "uncertain";
      if (f.phase === "ack") {
        if (shot.users > f.users || shot.busy) return "ack";
        return now - f.since > ACK_TIMEOUT_MS ? "ack-timeout" : "wait";
      }
      if (f.phase === "answer") {
        const assistantNew = shot.assistants > f.assistants;
        if (!assistantNew || shot.busy) return "wait";
        if (f.lastFingerprint !== shot.fingerprint || !f.stableSince) return "stabilize";
        return now - f.stableSince >= ANSWER_STABLE_MS ? "complete" : "wait";
      }
      return "uncertain";
    }
    if (shot.busy || shot.draft || !shot.editorFound) return "wait";
    if (!state.idleSince || now - state.idleSince < IDLE_MS) return "wait";
    return "prepare";
  }
  function applyCommand(state, cmd) {
    const next = { ...state, items: [...state.items], error: "" };
    if (!cmd || typeof cmd.id !== "string" || cmd.id === state.lastCommandId) return state;
    next.lastCommandId = cmd.id;
    if (cmd.type === "bind") {
      const path = conversationPath(cmd.url);
      if (!path) next.error = "只支持已创建的 ChatGPT 对话（/c/…），请先打开已有对话。";
      else if (state.items.length && state.target !== path)
        next.error = "当前还有待执行队列，请先处理或清空，再切换绑定。";
      else {
        next.target = path;
        next.running = false;
        next.probe = null;
        next.idleSince = 0;
        next.status = "已绑定，点击探测后台";
      }
    } else if (cmd.type === "add") {
      if (!next.target || conversationPath(cmd.url) !== next.target)
        next.error = "当前页面不是已绑定的对话。";
      else if (next.items.length >= MAX_QUEUE) next.error = "队列上限 40 条。";
      else if (typeof cmd.text !== "string" || !cmd.text.trim() || cmd.text.length > 12e3)
        next.error = "消息不能为空，且不能超过 12000 字符。";
      else {
        const entry = { id: cmd.id, text: cmd.text.trim(), kind: cmd.kind === "steer" ? "steer" : "queue" };
        const offset = next.flight ? 1 : 0;
        const index = cmd.kind === "steer" ? offset : next.items.length;
        next.items.splice(index, 0, entry);
        next.status = "已入队（需点击开始）";
      }
    } else if (cmd.type === "start") {
      if (!next.target || !next.items.length) next.error = "请先绑定对话并添加消息。";
      else if (!next.probe?.ok || next.probe.path !== next.target || typeof next.probe.instance !== "string")
        next.error = "请先点击“探测后台”，确认后台能读取当前对话。";
      else if (next.flight) next.error = "存在未确认的发送记录，禁止自动恢复，请人工核查。";
      else {
        next.running = true;
        next.status = "后台运行中";
        next.idleSince = 0;
      }
    } else if (cmd.type === "pause") {
      next.running = false;
      next.status = "已暂停";
    } else if (cmd.type === "clear") {
      if (next.flight) next.error = "有未确认的发送记录；请先核对，不能直接清空。";
      else {
        next.running = false;
        next.items = [];
        next.status = "已清空";
      }
    } else if (cmd.type === "remove") {
      if (next.flight?.id === cmd.itemId) next.error = "正在发送的消息不能删除。";
      else next.items = next.items.filter((x) => x.id !== cmd.itemId);
    } else if (cmd.type === "move") {
      const pos = next.items.findIndex((x) => x.id === cmd.itemId);
      const dest = pos + Number(cmd.delta);
      if (pos >= (next.flight ? 1 : 0) && dest >= (next.flight ? 1 : 0) && dest >= 0 && dest < next.items.length && [1, -1].includes(Number(cmd.delta))) {
        const [item] = next.items.splice(pos, 1);
        next.items.splice(dest, 0, item);
      }
    } else if (cmd.type !== "probe") next.error = "未知命令";
    return next;
  }

  // apps/chatgpt-scriptcat-worker/src/bridge.js
  var PAGE_REQUEST = "scq:page:request";
  var PAGE_RESPONSE = "scq:page:response";
  var PAGE_PROTOCOL = 1;
  var PAGE_TIMEOUT_MS = 6e3;
  function createPageClient(api) {
    const waiting = /* @__PURE__ */ new Map();
    api.listen(PAGE_RESPONSE, (_key, _old, response) => {
      const pending = waiting.get(response?.id);
      if (!pending || response.protocol !== PAGE_PROTOCOL || response.path !== pending.path) return;
      waiting.delete(response.id);
      api.clearTimeout(pending.timer);
      if (response.ok === true) pending.resolve(response);
      else pending.reject(Error(response.error || "网页执行端拒绝操作"));
    });
    return (op, path, extra = {}) => new Promise((resolve, reject) => {
      const id = api.id();
      const timer = api.setTimeout(() => {
        waiting.delete(id);
        reject(Error("网页执行端响应超时：请更新 Panel 并刷新目标页；冻结/休眠页面不能继续执行。未自动重试。"));
      }, PAGE_TIMEOUT_MS);
      waiting.set(id, { resolve, reject, timer, path });
      Promise.resolve(api.write(PAGE_REQUEST, {
        ...extra,
        id,
        protocol: PAGE_PROTOCOL,
        op,
        path,
        expires: api.now() + PAGE_TIMEOUT_MS
      })).catch((error) => {
        if (!waiting.delete(id)) return;
        api.clearTimeout(timer);
        reject(error);
      });
    });
  }

  // apps/chatgpt-scriptcat-worker/src/main.js
  (() => {
    "use strict";
    const alive = typeof CAT !== "undefined" && CAT.agent?.dom;
    let state = safeState(GM_getValue(STORE, initialState()));
    let locked = false;
    const pageRequest = createPageClient({
      listen: (key, callback) => GM_addValueChangeListener(key, callback),
      write: (key, value) => GM.setValue(key, value),
      now: () => Date.now(),
      id: () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
      // 保持浏览器计时器原有接收者，不能把裸方法挂在 api 对象后以错误 this 调用。
      setTimeout: (callback, ms) => setTimeout(callback, ms),
      clearTimeout: (id) => clearTimeout(id)
    });
    async function save() {
      state.heartbeat = Date.now();
      await GM.setValue(STORE, { ...state });
    }
    function stop(reason) {
      state.running = false;
      state.error = reason;
      state.status = "安全暂停";
    }
    async function onlyTab(path) {
      if (!alive || typeof CAT.agent.dom.listTabs !== "function") {
        throw Error("此 ScriptCat 版本没有 CAT.agent.dom；请检查 v1.4+ 或 Agent 权限。");
      }
      const tabs = await CAT.agent.dom.listTabs();
      if (!Array.isArray(tabs)) throw Error("listTabs 未返回标签页数组");
      const matches = tabs.filter((tab2) => conversationPath(tab2.url || "") === path);
      if (matches.length !== 1)
        throw Error(matches.length === 0 ? "没有找到已绑定对话的 Chrome 标签页" : "有多个标签打开相同对话；请只保留一个以防误发");
      const tab = matches[0];
      if (tab.discarded) throw Error("目标标签页已被 Chrome 丢弃；请激活并重新探测");
      return tab;
    }
    function checkedShot(response) {
      const shot = response?.shot;
      if (!shot || typeof shot !== "object" || typeof shot.path !== "string" || typeof shot.busy !== "boolean" || typeof shot.users !== "number" || typeof shot.assistants !== "number" || typeof shot.draft !== "string" || typeof shot.editorFound !== "boolean" || typeof shot.sendReady !== "boolean" || typeof shot.fingerprint !== "string") {
        const keys = response && typeof response === "object" ? Object.keys(response).slice(0, 12).join(",") : String(response);
        throw Error("网页执行端快照格式异常（返回字段：" + keys.slice(0, 120) + "）。请同步更新 Worker 和 Panel。");
      }
      return shot;
    }
    async function page(op, extra = {}, probing = false) {
      const response = await pageRequest(op, state.target, {
        instance: probing ? void 0 : state.probe?.instance,
        ...extra
      });
      return { response, shot: checkedShot(response) };
    }
    async function probe() {
      const tab = await onlyTab(state.target);
      const { shot, response } = await page("snapshot", {}, true);
      if (shot.path !== state.target) throw Error("网页已导航离开绑定对话");
      if (!shot.editorFound) throw Error("网页执行端已连接，但未找到原生输入框");
      state.probe = {
        ok: true,
        path: state.target,
        tabId: tab.tabId,
        instance: response.instance,
        inactive: !tab.active,
        editorFound: shot.editorFound,
        sendReady: shot.sendReady,
        busy: shot.busy,
        checkedAt: Date.now()
      };
      state.status = tab.active ? "后台已连接：当前标签可读" : "后台已连接：隐藏标签可读";
      state.error = "";
      await save();
      return { tab, shot };
    }
    async function fill(text) {
      const { shot } = await page("fill", { text, flightId: state.flight?.id });
      if (shot.draft !== text) throw Error("浏览器代理无法写入原生输入框；未点击发送");
      return shot;
    }
    async function dispatch() {
      const f = state.flight;
      if (!f || f.phase !== "prepare") return;
      f.phase = "clicking";
      f.since = Date.now();
      await save();
      await page("click", { text: f.text, flightId: f.id });
      f.phase = "ack";
      f.since = Date.now();
      state.status = "后台已点击发送，等待 ChatGPT 确认";
      await save();
    }
    async function processCommand(cmd) {
      if (!cmd || cmd.id === state.lastCommandId) return;
      state = applyCommand(state, cmd);
      if (cmd.type === "probe") {
        state.running = false;
        if (!state.target) state.error = "先绑定当前对话";
        else {
          try {
            await probe();
          } catch (error) {
            state.probe = { ok: false, checkedAt: Date.now() };
            state.error = String(error?.message || error).slice(0, 250);
            state.status = "后台探测失败";
          }
        }
      } else if (cmd.type === "resolve") {
        state.running = false;
        if (state.flight && cmd.confirm === "discard-sent") {
          state.items = state.items.filter((x) => x.id !== state.flight.id);
          state.flight = null;
          state.status = "人工确认已发送：已移除这条，队列保持暂停";
          state.error = "";
        } else state.error = "没有可人工确认的待定消息";
      }
      await save();
    }
    async function advance() {
      if (!state.running || !state.items.length) return;
      if (state.flight?.phase === "clicking") {
        stop("后台执行中断于点击阶段，发送结果不确定，禁止重试");
        await save();
        return;
      }
      if (!state.target) {
        stop("未绑定会话");
        await save();
        return;
      }
      const tab = await onlyTab(state.target);
      if (tab.tabId !== state.probe?.tabId) throw Error("目标标签页已变更，请重新探测");
      const { shot } = await page("snapshot");
      if (shot.path !== state.target) throw Error("对话路径改变，停止跨会话派发");
      if (!shot.editorFound) throw Error("目标编辑器不可用");
      const now = Date.now();
      if (!state.flight) {
        if (shot.busy || shot.draft) state.idleSince = 0;
        else if (!state.idleSince) state.idleSince = now;
      }
      const action = actionFor(state, shot, now);
      if (action === "prepare") {
        const item = state.items[0];
        state.flight = {
          id: item.id,
          text: item.text,
          phase: "prepare",
          since: now,
          users: shot.users,
          assistants: shot.assistants,
          lastFingerprint: "",
          stableSince: 0
        };
        state.status = "后台填写消息，未发送";
        await save();
        await fill(item.text);
        state.status = "消息已填写，等待原生发送按钮激活";
        await save();
      } else if (action === "click") await dispatch();
      else if (action === "ack") {
        state.flight.phase = "answer";
        state.flight.since = now;
        state.status = "ChatGPT 已接受消息，等待回复完成";
        await save();
      } else if (action === "stabilize") {
        state.flight.stableSince = now;
        state.flight.lastFingerprint = shot.fingerprint;
        state.status = "正在确认回复稳定完成";
        await save();
      } else if (action === "complete") {
        state.items = state.items.filter((x) => x.id !== state.flight.id);
        state.completed += 1;
        state.flight = null;
        state.idleSince = 0;
        state.status = state.items.length ? "一条已完成，准备下一条" : "全部队列完成";
        if (!state.items.length) state.running = false;
        await save();
      } else if (action === "ready-timeout") {
        stop("发送按钮等待超时；原生草稿可能已填写，请核对");
        await save();
      } else if (action === "ack-timeout") {
        stop("已点击发送但未确认 ChatGPT 接收，禁止再次点击");
        await save();
      } else if (action === "draft-changed" || action === "uncertain") {
        stop("原生草稿变更或点击状态不确定，已安全暂停");
        await save();
      }
    }
    async function spin() {
      if (locked) return;
      locked = true;
      try {
        const cmd = GM_getValue(COMMAND, null);
        if (cmd && cmd.id !== state.lastCommandId) await processCommand(cmd);
        await advance();
        if (Date.now() - state.heartbeat > 4500) await save();
      } catch (error) {
        stop("后台代理失败：" + String(error?.message || error).slice(0, 240));
        await save();
      } finally {
        locked = false;
      }
    }
    async function boot() {
      if (state.running || state.flight) {
        state.running = false;
        state.status = "后台重启后安全暂停";
        state.error = "上次任务可能中断；若有未确认消息，请核查聊天记录。";
      }
      if (!alive) {
        state.status = "Agent 能力不可用";
        state.error = "当前 ScriptCat 没有 CAT.agent.dom，请检查安装版本和权限。";
      } else if (state.status === "未绑定对话") state.status = "后台工作器已启动";
      await save();
      GM_addValueChangeListener(COMMAND, () => {
        void spin();
      });
      setInterval(() => {
        void spin();
      }, 1500);
      void spin();
    }
    void boot();
  })();
})();
