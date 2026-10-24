// ==UserScript==
// @name         Sketchfab Video Recorder (WebM/MP4)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.24.041910
// @description  为 Sketchfab Ripper 添加真正的画面视频录制与下载；与骨骼动画录制互不影响，并提供手动下载保底。
// @author       epodak
// @match        https://sketchfab.com/*
// @match        https://www.sketchfab.com/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/epodak/jsscript
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/sketchfab-video-recorder/sketchfab-video-recorder.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/sketchfab-video-recorder/sketchfab-video-recorder.user.js
// ==/UserScript==

(() => {
  // apps/sketchfab-video-recorder/src/main.js
  (() => {
    "use strict";
    const BOX_ID = "rp-video-recorder";
    const FPS = 30;
    const MAX_DURATION_MS = 12e4;
    const FORMATS = [
      ["video/webm;codecs=vp9", "webm"],
      ["video/webm;codecs=vp8", "webm"],
      ["video/webm", "webm"],
      ["video/mp4", "mp4"]
    ];
    let recorder = null;
    let capture = null;
    let chunks = [];
    let outputURL = null;
    let stopTimer = null;
    let state = "idle";
    function getControls() {
      const box = document.getElementById(BOX_ID);
      return box ? {
        box,
        button: box.querySelector("[data-video-control]"),
        status: box.querySelector("[data-video-status]"),
        link: box.querySelector("[data-video-link]")
      } : null;
    }
    function render(message) {
      const ui = getControls();
      if (!ui) return;
      ui.button.textContent = state === "recording" ? "停止并保存视频" : state === "stopping" ? "视频封装中…" : "录制视频（WebM/MP4）";
      ui.button.disabled = state === "stopping";
      ui.button.classList.toggle("rp-on", state === "recording");
      if (message) ui.status.textContent = message;
    }
    function releaseCapture() {
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = null;
      if (capture) capture.getTracks().forEach((track) => track.stop());
      capture = null;
      recorder = null;
    }
    function chooseFormat() {
      if (!window.MediaRecorder) throw new Error("当前浏览器不支持 MediaRecorder");
      const selected = FORMATS.find(([mime]) => MediaRecorder.isTypeSupported(mime));
      if (!selected) throw new Error("当前浏览器不支持 WebM/MP4 视频编码");
      return selected;
    }
    function captureCanvas() {
      const canvases = [...document.querySelectorAll("canvas")].filter((canvas) => canvas.width > 0 && canvas.height > 0 && typeof canvas.captureStream === "function").sort((a, b) => b.width * b.height - a.width * a.height);
      if (!canvases.length) throw new Error("未找到可录制的 Sketchfab 画布");
      return canvases[0].captureStream(FPS);
    }
    function fileName(ext) {
      const token = location.pathname.match(/[a-f\d]{32}/i)?.[0] || "model";
      const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      return `sketchfab-${token.slice(0, 12)}-${stamp}.${ext}`;
    }
    function downloadFile(url, name) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.style.display = "none";
      document.body.appendChild(a);
      try {
        a.click();
      } finally {
        a.remove();
      }
    }
    function makeDownload(blob, ext) {
      if (!blob.size) {
        render("录制结束，但编码器没有产生数据；检查标签页是否可见");
        return;
      }
      if (outputURL) URL.revokeObjectURL(outputURL);
      outputURL = URL.createObjectURL(blob);
      const name = fileName(ext);
      const ui = getControls();
      if (ui) {
        ui.link.href = outputURL;
        ui.link.download = name;
        ui.link.hidden = false;
        ui.link.textContent = `再次下载 ${ext.toUpperCase()} (${(blob.size / 1048576).toFixed(1)} MB)`;
      }
      try {
        downloadFile(outputURL, name);
        render(`已生成 ${ext.toUpperCase()} 视频；若未自动下载，请点“再次下载”`);
      } catch (error) {
        console.warn("[Sketchfab Video]", "自动下载被拦截", error);
        render("视频已生成；自动下载失败，请点击“再次下载”");
      }
    }
    function stop() {
      if (state !== "recording" || !recorder) return;
      state = "stopping";
      render("等待 MediaRecorder 写入最后一个数据块…");
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = null;
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch (error) {
        state = "idle";
        releaseCapture();
        render(`录制停止失败：${error.message}`);
      }
    }
    function start() {
      if (state !== "idle") return;
      let stream;
      try {
        const [mime, ext] = chooseFormat();
        stream = captureCanvas();
        if (!stream.getVideoTracks().length) throw new Error("无法取得视频轨道");
        const next = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6e6 });
        chunks = [];
        capture = stream;
        recorder = next;
        state = "recording";
        const ui = getControls();
        if (ui) {
          ui.link.hidden = true;
          ui.link.removeAttribute("href");
        }
        next.addEventListener("dataavailable", (event) => {
          if (event.data && event.data.size > 0) chunks.push(event.data);
        });
        next.addEventListener("error", (event) => {
          console.error("[Sketchfab Video]", "编码失败", event.error || event);
          render("编码器错误；请重新录制");
          if (state === "recording") stop();
        });
        next.addEventListener("stop", () => {
          const blob = new Blob(chunks, { type: next.mimeType || mime });
          chunks = [];
          releaseCapture();
          state = "idle";
          makeDownload(blob, ext);
        }, { once: true });
        next.start(1e3);
        stopTimer = setTimeout(stop, MAX_DURATION_MS);
        render("录制中，请保持页面可见并播放模型动画（最长 120 秒）");
      } catch (error) {
        if (stream) stream.getTracks().forEach((track) => track.stop());
        state = "idle";
        releaseCapture();
        console.warn("[Sketchfab Video]", error);
        render(`无法开始录制：${error.message}`);
      }
    }
    function install() {
      const original = document.getElementById("recAllBtn");
      if (!original || !original.closest("#ripper-panel")) return;
      if (document.getElementById(BOX_ID)) return;
      const box = document.createElement("div");
      box.id = BOX_ID;
      box.style.cssText = "display:flex;flex-direction:column;gap:5px;padding-top:8px";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rp-btn rp-rec";
      button.dataset.videoControl = "";
      button.addEventListener("click", () => state === "recording" ? stop() : start());
      const status = document.createElement("div");
      status.dataset.videoStatus = "";
      status.style.cssText = "font-size:10px;color:#bdc1c6;overflow-wrap:anywhere;text-align:center";
      const link = document.createElement("a");
      link.dataset.videoLink = "";
      link.hidden = true;
      link.textContent = "再次下载视频";
      link.style.cssText = "font-size:11px;color:#8ab4f8;text-align:center";
      box.append(button, status, link);
      original.insertAdjacentElement("afterend", box);
      render("画面视频录制，与骨骼动画录制相互独立");
    }
    install();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && (n.id === "ripper-panel" || n.querySelector?.("#ripper-panel"))))) {
        install();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("pagehide", () => {
      if (state === "recording") stop();
      if (outputURL) URL.revokeObjectURL(outputURL);
    }, { once: true });
  })();
})();
