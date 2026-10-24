// ==UserScript==
// @name         国家中小学智慧教育平台 · 电子课本 PDF 下载
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.24.041910
// @description  自动识别教材详情页 contentId 和真实 PDF 地址；一键下载并自动切换官方 CDN 镜像，支持 SPA。
// @author       epodak
// @match        https://basic.smartedu.cn/tchMaterial*
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
  var UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
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
  var IMG_ROUTE = /\/edu_product\/esp\/(?:assets|assets_document)\/([a-f0-9-]{36})\.t\/zh-CN\/(\d{8,})\/transcode\/image\/(\d+)\.jpe?g$/i;
  function parseImageCoordinate(raw) {
    try {
      const u = new URL(String(raw || ""), "https://basic.smartedu.cn/");
      if (u.protocol !== "https:" || !/(^|\.)ykt\.cbern\.com\.cn$/i.test(u.hostname)) return null;
      const m = u.pathname.match(IMG_ROUTE);
      if (!m || !UUID.test(m[1])) return null;
      return { id: m[1].toLowerCase(), ts: m[2], page: Number(m[3]), url: u.href };
    } catch {
      return null;
    }
  }
  function imageUrl(coordinate, page, host = "r1") {
    if (!coordinate || !UUID.test(coordinate.id) || !/^\d{8,}$/.test(String(coordinate.ts))) return "";
    if (!["r1", "r2", "r3"].includes(host) || !Number.isInteger(page) || page < 1 || page > 512) return "";
    return "https://" + host + "-ndr.ykt.cbern.com.cn/edu_product/esp/assets/" + coordinate.id + ".t/zh-CN/" + coordinate.ts + "/transcode/image/" + page + ".jpg";
  }
  function jpegSize(bytes) {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    if (b.length < 32 || b[0] !== 255 || b[1] !== 216 || b[b.length - 2] !== 255 || b[b.length - 1] !== 217) return null;
    let pos = 2;
    while (pos + 4 < b.length) {
      if (b[pos] !== 255) return null;
      while (pos < b.length && b[pos] === 255) pos++;
      const type = b[pos++];
      if (type === 217 || type === 218) break;
      if (type >= 208 && type <= 215) continue;
      const n = b[pos] << 8 | b[pos + 1];
      if (n < 2 || pos + n > b.length) return null;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(type) && n >= 8) {
        return { height: b[pos + 3] << 8 | b[pos + 4], width: b[pos + 5] << 8 | b[pos + 6], components: b[pos + 7] };
      }
      pos += n;
    }
    return null;
  }
  function buildPdfFromJpegs(images) {
    if (!Array.isArray(images) || !images.length) throw new Error("没有可用图片");
    const encode = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let offset = 0;
    const put = (value) => {
      const b = typeof value === "string" ? encode.encode(value) : value;
      chunks.push(b);
      offset += b.byteLength;
    };
    const object = (num, parts) => {
      offsets[num] = offset;
      put(num + " 0 obj\n");
      for (const part of parts) put(part);
      put("\nendobj\n");
    };
    const total = 2 + images.length * 3;
    put("%PDF-1.4\n%Ã¢Ã£\n");
    object(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
    const kids = images.map((_, i) => 3 + i * 3 + " 0 R").join(" ");
    object(2, ["<< /Type /Pages /Kids [" + kids + "] /Count " + images.length + " >>"]);
    images.forEach((bytes, i) => {
      const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      const info = jpegSize(data);
      if (!info || !info.width || !info.height || ![1, 3, 4].includes(info.components)) {
        throw new Error("第 " + (i + 1) + " 页图片不完整或格式不支持");
      }
      const page = 3 + 3 * i;
      const im = page + 1;
      const content = page + 2;
      const w = info.width, h = info.height;
      const colors = info.components === 1 ? "DeviceGray" : info.components === 4 ? "DeviceCMYK" : "DeviceRGB";
      object(page, ["<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + w + " " + h + "] /Resources << /XObject << /Im0 " + im + " 0 R >> >> /Contents " + content + " 0 R >>"]);
      object(im, ["<< /Type /XObject /Subtype /Image /Width " + w + " /Height " + h + " /ColorSpace /" + colors + " /BitsPerComponent 8 /Filter /DCTDecode /Length " + data.byteLength + " >>\nstream\n", data, "\nendstream"]);
      const command = "q " + w + " 0 0 " + h + " 0 0 cm /Im0 Do Q\n";
      object(content, ["<< /Length " + encode.encode(command).length + " >>\nstream\n", command, "endstream"]);
    });
    const xref = offset;
    put("xref\n0 " + (total + 1) + "\n0000000000 65535 f \n");
    for (let i = 1; i <= total; i++) put(String(offsets[i]).padStart(10, "0") + " 00000 n \n");
    put("trailer\n<< /Size " + (total + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
    return new Blob(chunks, { type: "application/pdf" });
  }

  // apps/smartedu-textbook-pdf/src/main.js
  (() => {
    "use strict";
    const TAG = "[smartedu-pdf]";
    const CATALOG_URL = "https://basic.smartedu.cn/tchMaterial";
    const PHOTO_RE = /\/transcode\/image\/\d+\.jpe?g/i;
    const JPEG_HOSTS = ["r1", "r2", "r3"];
    const MAX_PAGES = 512;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let root, action, original, status, titleNode, manualButton;
    let activeId = "", coordinate = null, selectedTitle = "", scanned = /* @__PURE__ */ new Set();
    let covers = /* @__PURE__ */ new Map(), choosing = false, downloading = false, generation = 0;
    let scanTimer = 0, scanning = false;
    function isTarget() {
      return location.hostname === "basic.smartedu.cn" && (location.pathname.startsWith("/tchMaterial") || location.pathname.includes("/pdfjs/") && location.pathname.endsWith("/viewer.html"));
    }
    function create(tag, className, label) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (label !== void 0) element.textContent = label;
      return element;
    }
    function report(message, error = false) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("error", error);
    }
    function getTitle(id) {
      if (selectedTitle) return selectedTitle;
      for (const selector of ["h1", "[class*='material-title']", "[class*='book-title']", "meta[property='og:title']"]) {
        const el = document.querySelector(selector);
        const t2 = (el?.getAttribute("content") || el?.textContent || "").trim();
        if (t2.length > 3 && t2.length < 105 && !/国家中小学智慧教育平台|智慧中小学|教材详情/.test(t2)) return t2;
      }
      const t = (document.title || "").split(/\s*[-|｜]\s*/)[0].trim();
      return t && t.length > 3 && !/国家中小学智慧教育平台|智慧中小学|教材详情/.test(t) ? t : id;
    }
    function ensureUi() {
      if (root || !document.documentElement) return;
      root = create("div");
      root.id = "ep-smartedu-pdf";
      const shadow = root.attachShadow({ mode: "open" });
      const css = create("style");
      css.textContent = [
        ":host{all:initial}",
        ".wrap{position:fixed;right:12px;bottom:12px;z-index:2147483600;width:176px;box-sizing:border-box;",
        "padding:9px 10px;border:1px solid #d9e1ea;border-radius:10px;",
        "background:#fff;color:#253047;box-shadow:0 4px 16px #0002;",
        "font:11.5px/1.42 system-ui,-apple-system,'Microsoft YaHei',sans-serif}",
        ".title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650;font-size:12px}",
        ".actions{display:flex;gap:7px;align-items:center;margin-top:7px;flex-wrap:wrap}",
        "button{background:#1967d2;color:#fff;border:0;border-radius:6px;padding:6px 9px;",
        "font:600 11.5px system-ui;cursor:pointer;white-space:nowrap}",
        "button:disabled{opacity:.6;cursor:wait}",
        ".sub{padding:1px 0;border:0;color:#37608d;background:transparent;font-weight:400}",
        "a{color:#37608d;text-decoration:none;font-size:11px;white-space:nowrap}",
        "a:hover,.sub:hover{text-decoration:underline}",
        ".status{color:#637083;font-size:10.5px;margin-top:6px;overflow-wrap:anywhere;line-height:1.4}",
        ".status.error{color:#a92e2e}",
        ".status.active{color:#1c7548}",
        "@media(max-width:500px){.wrap{right:8px;bottom:8px}}"
      ].join("");
      const panel = create("div", "wrap");
      titleNode = create("div", "title", "电子课本 PDF");
      const row = create("div", "actions");
      action = create("button", "", "选择教材");
      action.type = "button";
      original = create("a", "", "教材目录");
      original.target = "_blank";
      original.rel = "noopener noreferrer";
      original.href = CATALOG_URL;
      row.append(action, original);
      manualButton = create("button", "sub", "粘贴教材链接");
      manualButton.type = "button";
      status = create("div", "status", "点击“选择教材”，再点教材封面");
      panel.append(titleNode, row, manualButton, status);
      shadow.append(css, panel);
      document.documentElement.appendChild(root);
      action.addEventListener("click", onAction);
      manualButton.addEventListener("click", manualSelect);
    }
    function labelFromImage(el) {
      const node = el?.closest("li,article,[class*='card'],[class*='item'],a");
      const text = (node?.innerText || node?.textContent || "").replace(/\s+/g, " ").trim();
      return text.length > 2 && text.length < 100 ? text : "";
    }
    function imageFromElement(img) {
      if (!img) return null;
      for (const raw of [img.currentSrc, img.src, img.getAttribute?.("data-src"), img.getAttribute?.("srcset")?.split(",")[0]?.trim().split(/\s+/)[0]]) {
        const c = parseImageCoordinate(raw);
        if (c) return c;
      }
      return null;
    }
    function scanPage() {
      if (scanning) return;
      scanning = true;
      try {
        covers = /* @__PURE__ */ new Map();
        const foundPdf = /* @__PURE__ */ new Set();
        const resources = performance.getEntriesByType?.("resource") || [];
        for (const e of resources.slice(-1200)) {
          const p = findPdfUrl(e.name);
          if (p) foundPdf.add(p);
        }
        const elements = document.querySelectorAll("img, iframe[src], a[href], embed[src], object[data], [data-src]");
        for (const el of elements) {
          const img = el.tagName === "IMG" ? imageFromElement(el) : null;
          if (img && !covers.has(img.id)) covers.set(img.id, { ...img, title: labelFromImage(el) });
          for (const key of ["href", "src", "data", "data-src"]) {
            const raw = el.getAttribute?.(key);
            if (!raw) continue;
            const c = parseImageCoordinate(raw);
            if (c && !covers.has(c.id)) covers.set(c.id, { ...c, title: labelFromImage(el) });
            const p = findPdfUrl(raw);
            if (p) foundPdf.add(p);
          }
        }
        for (const raw of foundPdf) {
          if (activeId && extractContentId(raw) === activeId) scanned.add(raw);
        }
        if (activeId && !coordinate && covers.has(activeId)) coordinate = covers.get(activeId);
        if (!activeId && location.pathname.includes("/detail") && covers.size === 1) {
          const only = [...covers.values()][0];
          selectBook(only.id, only, only.title, false);
        }
      } finally {
        scanning = false;
      }
    }
    function selectBook(id, coord = null, title = "", notify = true) {
      if (!id) return false;
      if (id !== activeId) {
        activeId = id;
        scanned = /* @__PURE__ */ new Set();
        generation += 1;
      }
      coordinate = coord || covers.get(id) || null;
      selectedTitle = title || coordinate?.title || "";
      choosing = false;
      if (notify) report("已选教材，点击下载 PDF");
      updateUi();
      return true;
    }
    function updateUi() {
      if (!root) return;
      root.style.display = isTarget() ? "" : "none";
      if (!isTarget()) return;
      action.textContent = activeId ? "下载 PDF" : choosing ? "点击封面…" : "选择教材";
      action.disabled = downloading;
      titleNode.textContent = activeId ? getTitle(activeId) : "电子课本 PDF";
      const first = activeId ? makeCandidates(activeId, [...scanned])[0] : "";
      original.href = first || CATALOG_URL;
      original.textContent = first ? "打开原址" : "教材目录";
      original.title = first ? "在新标签页查看 PDF 原始资源" : "打开教材列表";
    }
    function refresh() {
      ensureUi();
      if (!isTarget()) {
        updateUi();
        return;
      }
      let id = extractContentId(location.href);
      const detail = /\/tchMaterial\/detail/.test(location.pathname);
      if (!id && detail) {
        for (const frame of document.querySelectorAll("iframe[src],embed[src]")) {
          id = extractContentId(frame.getAttribute("src"));
          if (id) break;
        }
      }
      if (id && id !== activeId) selectBook(id, null, "", false);
      if (detail && !id && !activeId && !choosing && status?.textContent === "正在识别教材…") {
        report("未找到教材 ID；可点“选择教材”或粘贴链接");
      }
      scanPage();
      if (!activeId && !choosing && !downloading) report("未选择教材：点击“选择教材”，再点击封面");
      if (!activeId && covers.size === 1 && detail) {
        const one = [...covers.values()][0];
        selectBook(one.id, one, one.title, false);
      }
      updateUi();
    }
    function handleBookClick(ev) {
      if (!choosing || !root || ev.target === root || root.contains(ev.target)) return;
      const target = ev.target?.nodeType === 1 ? ev.target : ev.target?.parentElement;
      if (!target) return;
      const nodes = [target, ...(ev.composedPath?.() || []).filter((x) => x?.nodeType === 1 && x !== document.documentElement && x !== document.body)];
      let coord = null, id = "";
      for (const node of nodes) {
        if (node.tagName === "IMG") coord = imageFromElement(node);
        if (!coord) {
          const imgs = node.matches?.("li,article,a,[class*='card'],[class*='item']") ? node.querySelectorAll?.("img") : [];
          for (const img of Array.from(imgs || []).slice(0, 12)) {
            coord = imageFromElement(img);
            if (coord) break;
          }
        }
        if (coord) {
          id = coord.id;
          break;
        }
        for (const attr of ["href", "src", "data-content-id", "data-contentid", "data-id"]) {
          id = extractContentId(node.getAttribute?.(attr));
          if (id) break;
        }
        if (id) break;
      }
      if (!id) {
        report("这不是已识别的教材封面；可粘贴详情链接", true);
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation?.();
      selectBook(id, coord, coord?.title || labelFromImage(target), true);
    }
    function manualSelect() {
      const raw = window.prompt("粘贴教材详情页链接、含时间戳的封面图片链接，或教材 ID：");
      if (raw === null) return;
      const c = parseImageCoordinate(raw);
      const id = c?.id || extractContentId(raw);
      if (!id) return report("没有找到有效的教材 ID。请粘贴教材详情页完整 URL。", true);
      selectBook(id, c, "", true);
      if (!c) report("已识别教材 ID。将尝试下载官方 PDF；图片合成需要封面图时间戳。");
    }
    function onAction() {
      if (downloading) return;
      if (activeId) {
        download();
        return;
      }
      choosing = true;
      updateUi();
      report(covers.size ? "已发现 " + covers.size + " 本教材，请点击目标教材的封面" : "请先打开教材列表，点击任意教材封面；或使用“粘贴教材链接”");
    }
    function request(url, opts = {}) {
      if (typeof GM_xmlhttpRequest !== "function") return Promise.reject(new Error("Tampermonkey 跨域请求权限不可用"));
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: opts.timeout || 18e3,
          responseType: "arraybuffer",
          headers: opts.range ? { "Range": "bytes=0-1023" } : {},
          onload: (r) => {
            const bytes = r.response instanceof ArrayBuffer ? new Uint8Array(r.response) : new Uint8Array();
            resolve({ status: r.status, bytes, type: (r.responseHeaders || "").match(/content-type:\s*([^\r\n]+)/i)?.[1] || "" });
          },
          onerror: () => reject(new Error("连接失败")),
          ontimeout: () => reject(new Error("请求超时"))
        });
      });
    }
    async function directDownload(id, version) {
      const urls = makeCandidates(id, [...scanned]);
      for (let i = 0; i < urls.length; i++) {
        if (version !== generation) throw new Error("教材已切换");
        report("检测原版 PDF 下载地址 (" + (i + 1) + "/" + urls.length + ")");
        try {
          const probe = await request(urls[i], { range: true, timeout: 9e3 });
          if (probe.status !== 200 && probe.status !== 206) continue;
          if (probe.bytes.length < 5 || String.fromCharCode(...probe.bytes.slice(0, 5)) !== "%PDF-") continue;
          if (typeof GM_download === "function") {
            await new Promise((resolve, reject) => {
              GM_download({
                url: urls[i],
                name: safeFileName(getTitle(id), id),
                saveAs: false,
                timeout: 9e4,
                onload: resolve,
                onerror: () => reject(new Error("PDF 下载失败")),
                ontimeout: () => reject(new Error("PDF 下载超时"))
              });
            });
          } else {
            window.open(urls[i], "_blank", "noopener");
          }
          return true;
        } catch (error) {
          console.warn(TAG, "PDF mirror", i + 1, String(error?.message || error));
        }
      }
      return false;
    }
    async function getJpeg(c, page, version, attempts = 3) {
      if (version !== generation) throw new Error("教材已切换");
      for (let i = 0; i < attempts; i++) {
        const url = imageUrl(c, page, JPEG_HOSTS[(page + i) % JPEG_HOSTS.length]);
        try {
          const r = await request(url, { timeout: 18e3 });
          if (r.status === 200 && jpegSize(r.bytes)) return r.bytes;
          if ([403, 404, 410].includes(r.status) && i === attempts - 1) return null;
        } catch {
        }
        if (i < attempts - 1) await delay(450 * (i + 1));
      }
      return null;
    }
    async function imagePdf(id, c, version) {
      const cached = /* @__PURE__ */ new Map();
      const probe = async (n2) => {
        if (cached.has(n2)) return true;
        const jpeg = await getJpeg(c, n2, version, 2);
        if (jpeg) cached.set(n2, jpeg);
        return Boolean(jpeg);
      };
      report("原版 PDF 不可用，正在检测图片页数…");
      if (!await probe(1)) throw new Error("图片第 1 页不可用，请先打开教材详情并登录");
      let good = 1, bad = MAX_PAGES + 1, n = 2;
      while (n <= MAX_PAGES) {
        if (await probe(n)) {
          good = n;
          n *= 2;
          continue;
        }
        await delay(1200);
        if (!await getJpeg(c, 1, version, 1)) throw new Error("资源限流或登录状态异常，暂不推断末页");
        if (await probe(n)) {
          good = n;
          n *= 2;
          continue;
        }
        bad = n;
        break;
      }
      if (bad === MAX_PAGES + 1) throw new Error("无法确认最后一页，已达到安全上限");
      while (bad - good > 1) {
        const mid = Math.floor((bad + good) / 2);
        if (await probe(mid)) good = mid;
        else {
          await delay(450);
          if (!await getJpeg(c, 1, version, 1)) throw new Error("探测期间出现限流，请稍后重试");
          if (await probe(mid)) good = mid;
          else bad = mid;
        }
      }
      const count = good;
      if (count < 8) throw new Error("识别页数过少，可能是资源限流；已取消不完整下载");
      report("已找到 " + count + " 页，准备下载高清图片");
      let next = 1, done = 0;
      let fatal = null;
      const workers = Array.from({ length: 4 }, async () => {
        while (!fatal && next <= count) {
          const page = next++;
          if (version !== generation) throw new Error("教材已切换");
          if (!cached.has(page)) {
            const bytes = await getJpeg(c, page, version, 3);
            if (!bytes) {
              fatal = new Error("第 " + page + " 页下载失败。为避免缺页，不生成 PDF。");
              return;
            }
            cached.set(page, bytes);
          }
          done++;
          if (done % 5 === 0 || done === count) report("正在下载图片 " + done + "/" + count + " 页…");
          await delay(85);
        }
      });
      await Promise.all(workers);
      if (fatal) throw fatal;
      if (version !== generation) throw new Error("教材已切换");
      report("全部 " + count + " 页下载完成，正在本地合成 PDF…");
      const list = Array.from({ length: count }, (_, i) => cached.get(i + 1));
      const blob = buildPdfFromJpegs(list);
      const fileUrl = URL.createObjectURL(blob);
      const a = create("a");
      a.href = fileUrl;
      a.download = safeFileName(getTitle(id), id);
      (document.body || document.documentElement).appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 6e4);
      return count;
    }
    async function download() {
      if (downloading || !activeId) return;
      const id = activeId, version = generation;
      downloading = true;
      updateUi();
      try {
        const direct = await directDownload(id, version);
        if (version !== generation) return;
        if (direct) {
          report("PDF 已提交到浏览器下载列表");
          return;
        }
        const c = coordinate || covers.get(id);
        if (!c) {
          report("原版 PDF 未开放下载。请返回教材页选择带预览封面的教材，或粘贴封面图地址。", true);
          return;
        }
        const count = await imagePdf(id, c, version);
        report("已合成 " + count + " 页 PDF。请检查版权页确认版次。");
      } catch (error) {
        if (version === generation) report(String(error?.message || error), true);
      } finally {
        downloading = false;
        updateUi();
      }
    }
    function scheduleScan() {
      if (scanTimer) return;
      scanTimer = setTimeout(() => {
        scanTimer = 0;
        refresh();
      }, 260);
    }
    function start() {
      refresh();
      document.addEventListener("click", handleBookClick, true);
      window.addEventListener("popstate", scheduleScan);
      window.setInterval(refresh, 1900);
      try {
        const observer = new MutationObserver(scheduleScan);
        observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "href", "data-src"] });
      } catch {
      }
      try {
        const observer = new PerformanceObserver(scheduleScan);
        observer.observe({ entryTypes: ["resource"] });
      } catch {
      }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  })();
})();
