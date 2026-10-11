// ==UserScript==
// @name         ChatGPT Sidebar Project Marker
// @namespace    https://github.com/epodak/jsscript
// @version      2026.10.11.055729
// @description  以蓝绿色细条和低饱和背景区分 ChatGPT 侧边栏里的项目对话；普通对话保持原样。
// @author       epodak
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-sidebar-project-marker/chatgpt-sidebar-project-marker.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-sidebar-project-marker/chatgpt-sidebar-project-marker.user.js
// ==/UserScript==

// ChatGPT project conversations have a distinct /g/g-p-.../c/... href.
// Use CSS attribute matching so SPA re-renders need no observers or private APIs.
(() => {
  "use strict";

  const STYLE_ID = "jsscript-chatgpt-sidebar-project-marker";
  if (document.getElementById(STYLE_ID)) return;

  // Keep detection inside navigation/sidebar: pasted links in chat content stay untouched.
  // Requiring /c/ excludes project folders, which already have their own icon.
  const selector = [
    ':where(nav, aside, #sidebar, [data-testid*="sidebar" i],',
    ' [data-testid*="history" i])',
    ' a:is([href^="/g/g-p-"],',
    ' [href^="https://chatgpt.com/g/g-p-"])',
    '[href*="/c/"]'
  ].join("");

  const css = [
    ':root {',
    '  --jsscript-project-rail: #0e7490;',
    '  --jsscript-project-bg: rgba(8, 145, 178, 0.09);',
    '  --jsscript-project-hover: rgba(8, 145, 178, 0.16);',
    '  --jsscript-project-outline: rgba(8, 145, 178, 0.11);',
    '}',
    'html.dark, html[data-theme="dark"] {',
    '  --jsscript-project-rail: #67e8f9;',
    '  --jsscript-project-bg: rgba(34, 211, 238, 0.10);',
    '  --jsscript-project-hover: rgba(34, 211, 238, 0.18);',
    '  --jsscript-project-outline: rgba(34, 211, 238, 0.14);',
    '}',
    selector + ' {',
    '  background-color: var(--jsscript-project-bg) !important;',
    '  box-shadow: inset 3px 0 0 var(--jsscript-project-rail),',
    '    inset 0 0 0 1px var(--jsscript-project-outline) !important;',
    '  border-radius: 8px;',
    '}',
    selector + ':hover {',
    '  background-color: var(--jsscript-project-hover) !important;',
    '}'
  ].join("\n");

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();
