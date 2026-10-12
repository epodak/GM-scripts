// ==UserScript==
// @name         国家中小学智慧教育平台 · 电子课本 PDF 下载
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.12.123348
// @description  自动识别教材详情页 contentId 和真实 PDF 地址；一键下载并自动切换官方 CDN 镜像，支持 SPA。
// @author       epodak
// @match        https://basic.smartedu.cn/tchMaterial/detail*
// @match        https://basic.smartedu.cn/pdfjs/*/web/viewer.html*
// @connect      *.ykt.cbern.com.cn
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/smartedu-textbook-pdf/smartedu-textbook-pdf.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/smartedu-textbook-pdf/smartedu-textbook-pdf.user.js
// ==/UserScript==

(() => {
  // apps/smartedu-textbook-pdf/src/core.js
  var UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  var PDF_PATH = /\/edu_product\/esp\/(?:assets|assets_document)\/([a-f0-9-]{36})\.pkg\/pdf\.pdf$/i;
  var HOSTS = ["r3-ndr", "r2-ndr", "r1-ndr", "c1"];
  var TYPES = ["assets", "assets_document"];
  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  function normalizePdfUrl(raw) {
    if (typeof raw !== "string" || !raw.trim()) return "";
    try {
      const u = new URL(raw.trim(), "https://basic.smartedu.cn/");
      if (u.protocol !== "https:" || !/(^|\.)ykt\.cbern\.com\.cn$/i.test(u.hostname)) return "";
      if (!/\.pdf$/i.test(u.pathname)) return "";
      return u.href;
    } catch {
      return "";
    }
  }
  function findPdfUrl(raw) {
    let value = String(raw || "").trim();
    for (let depth = 0; depth < 3; depth += 1) {
      const direct = normalizePdfUrl(value);
      if (direct) return direct;
      try {
        const u = new URL(value, "https://basic.smartedu.cn/");
        for (const param of ["file", "url", "src", "pdf", "pdfUrl"]) {
          const nested = u.searchParams.get(param);
          if (nested) {
            const found = normalizePdfUrl(safeDecode(nested));
            if (found) return found;
          }
        }
      } catch {
      }
      const decoded = safeDecode(value);
      if (decoded === value) break;
      value = decoded;
    }
    return "";
  }
  function extractContentId(raw) {
    const value = String(raw || "");
    if (UUID.test(value)) return value.toLowerCase();
    try {
      const u = new URL(value, "https://basic.smartedu.cn/");
      for (const [key, item] of u.searchParams.entries()) {
        if (key.toLowerCase() === "contentid" && UUID.test(item)) return item.toLowerCase();
      }
      const path = u.pathname.match(PDF_PATH);
      if (path && UUID.test(path[1])) return path[1].toLowerCase();
      for (const key of ["file", "url", "src", "pdf", "pdfUrl"]) {
        const nested = u.searchParams.get(key);
        if (nested && nested !== value) {
          const id = extractContentId(safeDecode(nested));
          if (id) return id;
        }
      }
    } catch {
    }
    return "";
  }
  function makeCandidates(id, sniffed = []) {
    if (!UUID.test(String(id))) return [];
    const cleanId = id.toLowerCase();
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    function add(raw) {
      const pdf = normalizePdfUrl(raw);
      if (!pdf || extractContentId(pdf) !== cleanId || seen.has(pdf)) return;
      seen.add(pdf);
      items.push(pdf);
    }
    for (const url of sniffed) add(url);
    for (const type of TYPES) {
      for (const host of HOSTS) {
        add("https://" + host + ".ykt.cbern.com.cn/edu_product/esp/" + type + "/" + cleanId + ".pkg/pdf.pdf");
      }
    }
    return items;
  }
  function safeFileName(raw, id) {
    const fallback = id || "教材";
    let value = String(raw || "").replace(/[\u0000-\u001f<>:"/\\|?*]/g, " ").replace(/\s+/g, " ").trim();
    if (!value || /^国家中小学智慧教育平台|^教材详情|^智慧中小学$/i.test(value)) value = fallback;
    value = value.replace(/[. ]+$/g, "").slice(0, 90).trim();
    return (value || fallback).replace(/\.pdf$/i, "") + ".pdf";
  }

  // apps/smartedu-textbook-pdf/src/main.js
  (() => {
    "use strict";
    const TAG = "[smartedu-pdf]";
    let root;
    let action;
    let original;
    let status;
    let titleNode;
    let activeId = "";
    let scanned = /* @__PURE__ */ new Set();
    let downloading = false;
    let routeGeneration = 0;
    let scanTimer = 0;
    function isTarget() {
      return location.hostname === "basic.smartedu.cn" && (location.pathname.startsWith("/tchMaterial/detail") || location.pathname.includes("/pdfjs/") && location.pathname.endsWith("/viewer.html"));
    }
    function titleFor(id) {
      const selectors = ["h1", "[class*='material-title']", "[class*='book-title']", "meta[property='og:title']"];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        const text = (element?.getAttribute("content") || element?.textContent || "").trim();
        if (text.length > 3 && text.length < 110 && !/^(教材详情|国家中小学智慧教育平台|智慧中小学)$/.test(text)) {
          return text;
        }
      }
      const pageTitle = (document.title || "").split(/\s*[-|｜]\s*/)[0].trim();
      return pageTitle && pageTitle.length > 3 && !/^(国家中小学智慧教育平台|智慧中小学|教材详情)$/.test(pageTitle) ? pageTitle : id;
    }
    function discover() {
      const candidates = [];
      try {
        for (const entry of performance.getEntriesByType("resource")) candidates.push(entry.name);
      } catch {
      }
      const nodes = document.querySelectorAll("iframe[src], embed[src], object[data], a[href$='.pdf'], a[href*='pdf.pdf'], [data-src*='.pdf']");
      for (const node of nodes) {
        for (const key of ["src", "href", "data", "data-src"]) {
          const value = node.getAttribute(key);
          if (value) candidates.push(value);
        }
      }
      for (const raw of candidates) {
        const url = findPdfUrl(raw);
        if (url && extractContentId(url) === activeId) scanned.add(url);
      }
    }
    function create(tag, className, label) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (label !== void 0) element.textContent = label;
      return element;
    }
    function ensureUi() {
      if (root || !document.documentElement) return;
      const host = create("div");
      host.id = "ep-smartedu-pdf";
      const shadow = host.attachShadow({ mode: "open" });
      const style = create("style");
      style.textContent = [
        ":host{all:initial}",
        ".wrap{position:fixed;right:16px;bottom:18px;z-index:2147483600;width:178px;",
        "padding:10px 11px;border:1px solid #dbe1ea;border-radius:11px;",
        "background:#fff;color:#1e293b;box-shadow:0 6px 22px #0002;",
        "font:12px/1.4 system-ui,-apple-system,'Microsoft YaHei',sans-serif}",
        ".title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650;font-size:12px}",
        ".actions{display:flex;align-items:center;gap:7px;margin-top:8px}",
        "button{border:0;border-radius:7px;padding:7px 9px;background:#1967d2;",
        "color:white;font:600 12px system-ui;cursor:pointer;white-space:nowrap}",
        "button:disabled{opacity:.55;cursor:wait}",
        "a{color:#446084;font-size:11px;text-decoration:none;white-space:nowrap}",
        "a:hover{text-decoration:underline}",
        ".status{font-size:10.5px;color:#64748b;margin-top:7px;line-height:1.35;overflow-wrap:anywhere}",
        ".status.error{color:#ad3535}",
        "@media(max-width:500px){.wrap{right:10px;bottom:10px}}"
      ].join("");
      const panel = create("div", "wrap");
      titleNode = create("div", "title", "电子课本 PDF");
      const bar = create("div", "actions");
      action = create("button", "", "下载 PDF");
      action.type = "button";
      original = create("a", "", "打开原址");
      original.target = "_blank";
      original.rel = "noopener noreferrer";
      original.href = "#";
      status = create("div", "status", "正在识别教材…");
      bar.append(action, original);
      panel.append(titleNode, bar, status);
      shadow.append(style, panel);
      document.documentElement.appendChild(host);
      root = host;
      action.addEventListener("click", download);
    }
    function report(message, error = false) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("error", error);
    }
    function refresh() {
      ensureUi();
      if (!root) return;
      if (!isTarget()) {
        root.style.display = "none";
        return;
      }
      root.style.display = "";
      let id = extractContentId(location.href);
      if (!id) {
        for (const node of document.querySelectorAll("iframe[src], embed[src]")) {
          id = extractContentId(node.getAttribute("src"));
          if (id) break;
        }
      }
      if (id !== activeId) {
        activeId = id;
        scanned = /* @__PURE__ */ new Set();
        routeGeneration += 1;
        downloading = false;
        action.disabled = !id;
        report(id ? "已识别教材，点击下载" : "等待教材详情页加载…");
      }
      if (!id) {
        original.removeAttribute("href");
        titleNode.textContent = "电子课本 PDF";
        return;
      }
      discover();
      const urls = makeCandidates(id, [...scanned]);
      original.href = urls[0] || "#";
      original.title = "在新标签页打开平台 PDF 源地址";
      titleNode.textContent = titleFor(id) || "电子课本 PDF";
    }
    function preflight(url) {
      if (typeof GM_xmlhttpRequest !== "function") return Promise.resolve(true);
      return new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: "HEAD",
          url,
          timeout: 9e3,
          onload: (res) => {
            const kind = (/^content-type:\s*([^\r\n]+)/im.exec(res.responseHeaders || "") || [, ""])[1].toLowerCase();
            if ([401, 403, 404, 410].includes(res.status)) return resolve(false);
            if (res.status >= 200 && res.status < 400 && /text\/html|application\/json/.test(kind)) return resolve(false);
            resolve(res.status >= 200 && res.status < 400 || [405, 501].includes(res.status));
          },
          onerror: () => resolve(true),
          ontimeout: () => resolve(true)
        });
      });
    }
    function save(url, fileName) {
      if (typeof GM_download !== "function") {
        window.open(url, "_blank", "noopener");
        return Promise.resolve("opened");
      }
      return new Promise((resolve, reject) => {
        try {
          GM_download({
            url,
            name: fileName,
            saveAs: false,
            timeout: 9e4,
            onload: () => resolve("saved"),
            onerror: (error) => reject(new Error(error?.error || "下载失败")),
            ontimeout: () => reject(new Error("下载超时"))
          });
        } catch (error) {
          reject(error);
        }
      });
    }
    async function download() {
      if (downloading || !activeId) return;
      const id = activeId;
      const generation = routeGeneration;
      const links = makeCandidates(id, [...scanned]);
      const name = safeFileName(titleFor(id), id);
      downloading = true;
      action.disabled = true;
      let failure = "未知错误";
      try {
        for (let index = 0; index < links.length; index += 1) {
          if (generation !== routeGeneration) return;
          const url = links[index];
          report("正在尝试下载源 " + (index + 1) + "/" + links.length + "…");
          try {
            if (!await preflight(url)) {
              failure = "HTTP 拒绝访问或不是 PDF";
              continue;
            }
            const result = await save(url, name);
            if (generation !== routeGeneration) return;
            report(result === "saved" ? "下载完成：" + name : "已在新标签页打开 PDF");
            return;
          } catch (error) {
            failure = String(error?.message || error);
            console.warn(TAG, "source failed:", new URL(url).hostname, failure);
          }
        }
        if (generation === routeGeneration) {
          report("全部下载源不可用（" + failure + "）。请确认平台登录状态，或点“打开原址”。", true);
        }
      } finally {
        if (generation === routeGeneration) {
          downloading = false;
          action.disabled = false;
        }
      }
    }
    function scheduleScan() {
      if (scanTimer) return;
      scanTimer = window.setTimeout(() => {
        scanTimer = 0;
        refresh();
      }, 220);
    }
    function start() {
      refresh();
      window.setInterval(refresh, 1500);
      window.addEventListener("popstate", scheduleScan);
      try {
        const observer = new MutationObserver(scheduleScan);
        observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "href"] });
      } catch {
      }
      if (typeof PerformanceObserver !== "undefined") {
        try {
          const observer = new PerformanceObserver(scheduleScan);
          observer.observe({ entryTypes: ["resource"] });
        } catch {
        }
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  })();
})();
