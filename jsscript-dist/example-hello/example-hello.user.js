// ==UserScript==
// @name         JSScript Example Hello
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.11.230952
// @description  jsscript 供应链的最小可运行示例。
// @author       epodak
// @match        https://example.com/*
// @grant        none
// @run-at       document-end
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/example-hello/example-hello.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/example-hello/example-hello.user.js
// ==/UserScript==

(() => {
  // packages/runtime/src/index.js
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  // apps/example-hello/src/main.js
  onReady(() => {
    console.info("[jsscript/example-hello] userscript pipeline is working");
  });
})();
