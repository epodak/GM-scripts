// ==UserScript==
// @name         ChatGPT Universal Exporter (epodak Fork)
// @namespace    https://github.com/epodak/jsscript
// @version      2026.11.09.045828
// @description  导出 ChatGPT 对话为 JSON+Markdown ZIP；稳定悬浮按钮、SPA 自动恢复、内置 JSZip（基于 huhu v1.6.0）。
// @author       huhu; epodak (fork fixes)
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// @license      MIT
// @homepageURL  https://github.com/epodak/GM-scripts
// @updateURL    https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-universal-exporter/chatgpt-universal-exporter.meta.js
// @downloadURL  https://raw.githubusercontent.com/epodak/GM-scripts/master/jsscript-dist/chatgpt-universal-exporter/chatgpt-universal-exporter.user.js
// ==/UserScript==

// Original project: ChatGPT Universal Exporter (Markdown Support) by huhu (MIT)
// https://greasyfork.org/zh-CN/scripts/556233-chatgpt-universal-exporter-markdown-support
// Fork modifications: epodak/jsscript (MIT)
// 
// Third party dependency: JSZip v3.10.1 (MIT option of its dual MIT/GPLv3 license)
// https://github.com/Stuk/jszip
// JSZip is dual licensed. At your choice you may use it under the MIT license *or* the GPLv3
// license.
// 
// The MIT License
// ===============
// 
// Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// 
// Third party dependency: pako v1.0.11 (MIT)
// https://github.com/nodeca/pako
// (The MIT License)
// 
// Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js
  var require_jszip_min = __commonJS({
    "node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js"(exports, module) {
      !(function(e) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
        else if ("function" == typeof define && define.amd) define([], e);
        else {
          ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
        }
      })(function() {
        return (function s(a, o, h) {
          function u(r, e2) {
            if (!o[r]) {
              if (!a[r]) {
                var t = "function" == typeof __require && __require;
                if (!e2 && t) return t(r, true);
                if (l) return l(r, true);
                var n = new Error("Cannot find module '" + r + "'");
                throw n.code = "MODULE_NOT_FOUND", n;
              }
              var i = o[r] = { exports: {} };
              a[r][0].call(i.exports, function(e3) {
                var t2 = a[r][1][e3];
                return u(t2 || e3);
              }, i, i.exports, s, a, o, h);
            }
            return o[r].exports;
          }
          for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
          return u;
        })({ 1: [function(e, t, r) {
          "use strict";
          var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
          r.encode = function(e2) {
            for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
            return h.join("");
          }, r.decode = function(e2) {
            var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
            if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
            var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
            if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
            for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
            return l;
          };
        }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
          "use strict";
          var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
          function o(e2, t2, r2, n2, i2) {
            this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
          }
          o.prototype = { getContentWorker: function() {
            var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
            return e2.on("end", function() {
              if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
            }), e2;
          }, getCompressedWorker: function() {
            return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
          } }, o.createWorkerFrom = function(e2, t2, r2) {
            return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
          }, t.exports = o;
        }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
          "use strict";
          var n = e("./stream/GenericWorker");
          r.STORE = { magic: "\0\0", compressWorker: function() {
            return new n("STORE compression");
          }, uncompressWorker: function() {
            return new n("STORE decompression");
          } }, r.DEFLATE = e("./flate");
        }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
          "use strict";
          var n = e("./utils");
          var o = (function() {
            for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
              e2 = r2;
              for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
              t2[r2] = e2;
            }
            return t2;
          })();
          t.exports = function(e2, t2) {
            return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
              var i = o, s = n2 + r2;
              e3 ^= -1;
              for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
              return -1 ^ e3;
            })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
              var i = o, s = n2 + r2;
              e3 ^= -1;
              for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
              return -1 ^ e3;
            })(0 | t2, e2, e2.length, 0) : 0;
          };
        }, { "./utils": 32 }], 5: [function(e, t, r) {
          "use strict";
          r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
        }, {}], 6: [function(e, t, r) {
          "use strict";
          var n = null;
          n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
        }, { lie: 37 }], 7: [function(e, t, r) {
          "use strict";
          var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
          function h(e2, t2) {
            a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
          }
          r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
            this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
          }, h.prototype.flush = function() {
            a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
          }, h.prototype.cleanUp = function() {
            a.prototype.cleanUp.call(this), this._pako = null;
          }, h.prototype._createPako = function() {
            this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
            var t2 = this;
            this._pako.onData = function(e2) {
              t2.push({ data: e2, meta: t2.meta });
            };
          }, r.compressWorker = function(e2) {
            return new h("Deflate", e2);
          }, r.uncompressWorker = function() {
            return new h("Inflate", {});
          };
        }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
          "use strict";
          function A(e2, t2) {
            var r2, n2 = "";
            for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
            return n2;
          }
          function n(e2, t2, r2, n2, i2, s2) {
            var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
            t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
            var S = 0;
            t2 && (S |= 8), l || !_ && !g || (S |= 2048);
            var z = 0, C = 0;
            w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t3) {
              var r3 = e3;
              return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
            })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
              return 63 & (e3 || 0);
            })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
            var E = "";
            return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
          }
          var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
          function s(e2, t2, r2, n2) {
            i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
          }
          I.inherits(s, i), s.prototype.push = function(e2) {
            var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
            this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
          }, s.prototype.openedSource = function(e2) {
            this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
            var t2 = this.streamFiles && !e2.file.dir;
            if (t2) {
              var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
              this.push({ data: r2.fileRecord, meta: { percent: 0 } });
            } else this.accumulate = true;
          }, s.prototype.closedSource = function(e2) {
            this.accumulate = false;
            var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
              return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
            })(e2), meta: { percent: 100 } });
            else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
            this.currentFile = null;
          }, s.prototype.flush = function() {
            for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
            var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
              var s2 = I.transformTo("string", i2(n3));
              return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
            })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
            this.push({ data: n2, meta: { percent: 100 } });
          }, s.prototype.prepareNextSource = function() {
            this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
          }, s.prototype.registerPrevious = function(e2) {
            this._sources.push(e2);
            var t2 = this;
            return e2.on("data", function(e3) {
              t2.processChunk(e3);
            }), e2.on("end", function() {
              t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
            }), e2.on("error", function(e3) {
              t2.error(e3);
            }), this;
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
          }, s.prototype.error = function(e2) {
            var t2 = this._sources;
            if (!i.prototype.error.call(this, e2)) return false;
            for (var r2 = 0; r2 < t2.length; r2++) try {
              t2[r2].error(e2);
            } catch (e3) {
            }
            return true;
          }, s.prototype.lock = function() {
            i.prototype.lock.call(this);
            for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
          }, t.exports = s;
        }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
          "use strict";
          var u = e("../compressions"), n = e("./ZipFileWorker");
          r.generateWorker = function(e2, a, t2) {
            var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
            try {
              e2.forEach(function(e3, t3) {
                h++;
                var r2 = (function(e4, t4) {
                  var r3 = e4 || t4, n3 = u[r3];
                  if (!n3) throw new Error(r3 + " is not a valid compression method !");
                  return n3;
                })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
                t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
              }), o.entriesCount = h;
            } catch (e3) {
              o.error(e3);
            }
            return o;
          };
        }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
          "use strict";
          function n() {
            if (!(this instanceof n)) return new n();
            if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
            this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
              var e2 = new n();
              for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
              return e2;
            };
          }
          (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
            return new n().loadAsync(e2, t2);
          }, n.external = e("./external"), t.exports = n;
        }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
          "use strict";
          var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
          function f(n2) {
            return new i.Promise(function(e2, t2) {
              var r2 = n2.decompressed.getContentWorker().pipe(new a());
              r2.on("error", function(e3) {
                t2(e3);
              }).on("end", function() {
                r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
              }).resume();
            });
          }
          t.exports = function(e2, o) {
            var h = this;
            return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
              var t2 = new s(o);
              return t2.load(e3), t2;
            }).then(function(e3) {
              var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
              if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
              return i.Promise.all(t2);
            }).then(function(e3) {
              for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
                var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
                h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
              }
              return t2.zipComment.length && (h.comment = t2.zipComment), h;
            });
          };
        }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("../stream/GenericWorker");
          function s(e2, t2) {
            i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
          }
          n.inherits(s, i), s.prototype._bindStream = function(e2) {
            var t2 = this;
            (this._stream = e2).pause(), e2.on("data", function(e3) {
              t2.push({ data: e3, meta: { percent: 0 } });
            }).on("error", function(e3) {
              t2.isPaused ? this.generatedError = e3 : t2.error(e3);
            }).on("end", function() {
              t2.isPaused ? t2._upstreamEnded = true : t2.end();
            });
          }, s.prototype.pause = function() {
            return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
          }, t.exports = s;
        }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
          "use strict";
          var i = e("readable-stream").Readable;
          function n(e2, t2, r2) {
            i.call(this, t2), this._helper = e2;
            var n2 = this;
            e2.on("data", function(e3, t3) {
              n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
            }).on("error", function(e3) {
              n2.emit("error", e3);
            }).on("end", function() {
              n2.push(null);
            });
          }
          e("../utils").inherits(n, i), n.prototype._read = function() {
            this._helper.resume();
          }, t.exports = n;
        }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
          "use strict";
          t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
            if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
            if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
            return new Buffer(e2, t2);
          }, allocBuffer: function(e2) {
            if (Buffer.alloc) return Buffer.alloc(e2);
            var t2 = new Buffer(e2);
            return t2.fill(0), t2;
          }, isBuffer: function(e2) {
            return Buffer.isBuffer(e2);
          }, isStream: function(e2) {
            return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
          } };
        }, {}], 15: [function(e, t, r) {
          "use strict";
          function s(e2, t2, r2) {
            var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
            s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
            var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
            r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
            var o2 = null;
            o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
            var h2 = new d(e2, o2, s2);
            this.files[e2] = h2;
          }
          var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
            "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
            var t2 = e2.lastIndexOf("/");
            return 0 < t2 ? e2.substring(0, t2) : "";
          }, g = function(e2) {
            return "/" !== e2.slice(-1) && (e2 += "/"), e2;
          }, b = function(e2, t2) {
            return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
          };
          function h(e2) {
            return "[object RegExp]" === Object.prototype.toString.call(e2);
          }
          var n = { load: function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, forEach: function(e2) {
            var t2, r2, n2;
            for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
          }, filter: function(r2) {
            var n2 = [];
            return this.forEach(function(e2, t2) {
              r2(e2, t2) && n2.push(t2);
            }), n2;
          }, file: function(e2, t2, r2) {
            if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
            if (h(e2)) {
              var n2 = e2;
              return this.filter(function(e3, t3) {
                return !t3.dir && n2.test(e3);
              });
            }
            var i2 = this.files[this.root + e2];
            return i2 && !i2.dir ? i2 : null;
          }, folder: function(r2) {
            if (!r2) return this;
            if (h(r2)) return this.filter(function(e3, t3) {
              return t3.dir && r2.test(e3);
            });
            var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
            return n2.root = t2.name, n2;
          }, remove: function(r2) {
            r2 = this.root + r2;
            var e2 = this.files[r2];
            if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
            else for (var t2 = this.filter(function(e3, t3) {
              return t3.name.slice(0, r2.length) === r2;
            }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
            return this;
          }, generate: function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, generateInternalStream: function(e2) {
            var t2, r2 = {};
            try {
              if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
              u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
              var n2 = r2.comment || this.comment || "";
              t2 = o.generateWorker(this, r2, n2);
            } catch (e3) {
              (t2 = new l("error")).error(e3);
            }
            return new a(t2, r2.type || "string", r2.mimeType);
          }, generateAsync: function(e2, t2) {
            return this.generateInternalStream(e2).accumulate(t2);
          }, generateNodeStream: function(e2, t2) {
            return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
          } };
          t.exports = n;
        }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
          "use strict";
          t.exports = e("stream");
        }, { stream: void 0 }], 17: [function(e, t, r) {
          "use strict";
          var n = e("./DataReader");
          function i(e2) {
            n.call(this, e2);
            for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
          }
          e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
            return this.data[this.zero + e2];
          }, i.prototype.lastIndexOfSignature = function(e2) {
            for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
            return -1;
          }, i.prototype.readAndCheckSignature = function(e2) {
            var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
            return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
          }, i.prototype.readData = function(e2) {
            if (this.checkOffset(e2), 0 === e2) return [];
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
          "use strict";
          var n = e("../utils");
          function i(e2) {
            this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
          }
          i.prototype = { checkOffset: function(e2) {
            this.checkIndex(this.index + e2);
          }, checkIndex: function(e2) {
            if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
          }, setIndex: function(e2) {
            this.checkIndex(e2), this.index = e2;
          }, skip: function(e2) {
            this.setIndex(this.index + e2);
          }, byteAt: function() {
          }, readInt: function(e2) {
            var t2, r2 = 0;
            for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
            return this.index += e2, r2;
          }, readString: function(e2) {
            return n.transformTo("string", this.readData(e2));
          }, readData: function() {
          }, lastIndexOfSignature: function() {
          }, readAndCheckSignature: function() {
          }, readDate: function() {
            var e2 = this.readInt(4);
            return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
          } }, t.exports = i;
        }, { "../utils": 32 }], 19: [function(e, t, r) {
          "use strict";
          var n = e("./Uint8ArrayReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
            this.checkOffset(e2);
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
          "use strict";
          var n = e("./DataReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
            return this.data.charCodeAt(this.zero + e2);
          }, i.prototype.lastIndexOfSignature = function(e2) {
            return this.data.lastIndexOf(e2) - this.zero;
          }, i.prototype.readAndCheckSignature = function(e2) {
            return e2 === this.readData(4);
          }, i.prototype.readData = function(e2) {
            this.checkOffset(e2);
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
          "use strict";
          var n = e("./ArrayReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
            if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
            var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
          t.exports = function(e2) {
            var t2 = n.getTypeOf(e2);
            return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
          };
        }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
          "use strict";
          r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
        }, {}], 24: [function(e, t, r) {
          "use strict";
          var n = e("./GenericWorker"), i = e("../utils");
          function s(e2) {
            n.call(this, "ConvertWorker to " + e2), this.destType = e2;
          }
          i.inherits(s, n), s.prototype.processChunk = function(e2) {
            this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
          "use strict";
          var n = e("./GenericWorker"), i = e("../crc32");
          function s() {
            n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
          }
          e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
            this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
          }, t.exports = s;
        }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("./GenericWorker");
          function s(e2) {
            i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
          }
          n.inherits(s, i), s.prototype.processChunk = function(e2) {
            if (e2) {
              var t2 = this.streamInfo[this.propName] || 0;
              this.streamInfo[this.propName] = t2 + e2.data.length;
            }
            i.prototype.processChunk.call(this, e2);
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("./GenericWorker");
          function s(e2) {
            i.call(this, "DataWorker");
            var t2 = this;
            this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
              t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
            }, function(e3) {
              t2.error(e3);
            });
          }
          n.inherits(s, i), s.prototype.cleanUp = function() {
            i.prototype.cleanUp.call(this), this.data = null;
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
          }, s.prototype._tickAndRepeat = function() {
            this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
          }, s.prototype._tick = function() {
            if (this.isPaused || this.isFinished) return false;
            var e2 = null, t2 = Math.min(this.max, this.index + 16384);
            if (this.index >= this.max) return this.end();
            switch (this.type) {
              case "string":
                e2 = this.data.substring(this.index, t2);
                break;
              case "uint8array":
                e2 = this.data.subarray(this.index, t2);
                break;
              case "array":
              case "nodebuffer":
                e2 = this.data.slice(this.index, t2);
            }
            return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
          "use strict";
          function n(e2) {
            this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
          }
          n.prototype = { push: function(e2) {
            this.emit("data", e2);
          }, end: function() {
            if (this.isFinished) return false;
            this.flush();
            try {
              this.emit("end"), this.cleanUp(), this.isFinished = true;
            } catch (e2) {
              this.emit("error", e2);
            }
            return true;
          }, error: function(e2) {
            return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
          }, on: function(e2, t2) {
            return this._listeners[e2].push(t2), this;
          }, cleanUp: function() {
            this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
          }, emit: function(e2, t2) {
            if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
          }, pipe: function(e2) {
            return e2.registerPrevious(this);
          }, registerPrevious: function(e2) {
            if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
            this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
            var t2 = this;
            return e2.on("data", function(e3) {
              t2.processChunk(e3);
            }), e2.on("end", function() {
              t2.end();
            }), e2.on("error", function(e3) {
              t2.error(e3);
            }), this;
          }, pause: function() {
            return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
          }, resume: function() {
            if (!this.isPaused || this.isFinished) return false;
            var e2 = this.isPaused = false;
            return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
          }, flush: function() {
          }, processChunk: function(e2) {
            this.push(e2);
          }, withStreamInfo: function(e2, t2) {
            return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
          }, mergeStreamInfo: function() {
            for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
          }, lock: function() {
            if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
            this.isLocked = true, this.previous && this.previous.lock();
          }, toString: function() {
            var e2 = "Worker " + this.name;
            return this.previous ? this.previous + " -> " + e2 : e2;
          } }, t.exports = n;
        }, {}], 29: [function(e, t, r) {
          "use strict";
          var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
          if (n.nodestream) try {
            o = e("../nodejs/NodejsStreamOutputAdapter");
          } catch (e2) {
          }
          function l(e2, o2) {
            return new a.Promise(function(t2, r2) {
              var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
              e2.on("data", function(e3, t3) {
                n2.push(e3), o2 && o2(t3);
              }).on("error", function(e3) {
                n2 = [], r2(e3);
              }).on("end", function() {
                try {
                  var e3 = (function(e4, t3, r3) {
                    switch (e4) {
                      case "blob":
                        return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                      case "base64":
                        return u.encode(t3);
                      default:
                        return h.transformTo(e4, t3);
                    }
                  })(s2, (function(e4, t3) {
                    var r3, n3 = 0, i3 = null, s3 = 0;
                    for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                    switch (e4) {
                      case "string":
                        return t3.join("");
                      case "array":
                        return Array.prototype.concat.apply([], t3);
                      case "uint8array":
                        for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                        return i3;
                      case "nodebuffer":
                        return Buffer.concat(t3);
                      default:
                        throw new Error("concat : unsupported type '" + e4 + "'");
                    }
                  })(i2, n2), a2);
                  t2(e3);
                } catch (e4) {
                  r2(e4);
                }
                n2 = [];
              }).resume();
            });
          }
          function f(e2, t2, r2) {
            var n2 = t2;
            switch (t2) {
              case "blob":
              case "arraybuffer":
                n2 = "uint8array";
                break;
              case "base64":
                n2 = "string";
            }
            try {
              this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
            } catch (e3) {
              this._worker = new s("error"), this._worker.error(e3);
            }
          }
          f.prototype = { accumulate: function(e2) {
            return l(this, e2);
          }, on: function(e2, t2) {
            var r2 = this;
            return "data" === e2 ? this._worker.on(e2, function(e3) {
              t2.call(r2, e3.data, e3.meta);
            }) : this._worker.on(e2, function() {
              h.delay(t2, arguments, r2);
            }), this;
          }, resume: function() {
            return h.delay(this._worker.resume, [], this._worker), this;
          }, pause: function() {
            return this._worker.pause(), this;
          }, toNodejsStream: function(e2) {
            if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
            return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
          } }, t.exports = f;
        }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
          "use strict";
          if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
          else {
            var n = new ArrayBuffer(0);
            try {
              r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
            } catch (e2) {
              try {
                var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
              } catch (e3) {
                r.blob = false;
              }
            }
          }
          try {
            r.nodestream = !!e("readable-stream").Readable;
          } catch (e2) {
            r.nodestream = false;
          }
        }, { "readable-stream": 16 }], 31: [function(e, t, s) {
          "use strict";
          for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
          u[254] = u[254] = 1;
          function a() {
            n.call(this, "utf-8 decode"), this.leftOver = null;
          }
          function l() {
            n.call(this, "utf-8 encode");
          }
          s.utf8encode = function(e2) {
            return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
              var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
              for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
              for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
              return t2;
            })(e2);
          }, s.utf8decode = function(e2) {
            return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
              var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
              for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
              else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
              else {
                for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
                1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
              }
              return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
            })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
          }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
            var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
            if (this.leftOver && this.leftOver.length) {
              if (h.uint8array) {
                var r2 = t2;
                (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
              } else t2 = this.leftOver.concat(t2);
              this.leftOver = null;
            }
            var n2 = (function(e3, t3) {
              var r3;
              for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
              return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
            })(t2), i2 = t2;
            n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
          }, a.prototype.flush = function() {
            this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
          }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
            this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
          }, s.Utf8EncodeWorker = l;
        }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
          "use strict";
          var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
          function n(e2) {
            return e2;
          }
          function l(e2, t2) {
            for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
            return t2;
          }
          e("setimmediate"), a.newBlob = function(t2, r2) {
            a.checkSupport("blob");
            try {
              return new Blob([t2], { type: r2 });
            } catch (e2) {
              try {
                var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                return n2.append(t2), n2.getBlob(r2);
              } catch (e3) {
                throw new Error("Bug : can't construct the Blob.");
              }
            }
          };
          var i = { stringifyByChunk: function(e2, t2, r2) {
            var n2 = [], i2 = 0, s2 = e2.length;
            if (s2 <= r2) return String.fromCharCode.apply(null, e2);
            for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
            return n2.join("");
          }, stringifyByChar: function(e2) {
            for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
            return t2;
          }, applyCanBeUsed: { uint8array: (function() {
            try {
              return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
            } catch (e2) {
              return false;
            }
          })(), nodebuffer: (function() {
            try {
              return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
            } catch (e2) {
              return false;
            }
          })() } };
          function s(e2) {
            var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
            if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
              return i.stringifyByChunk(e2, r2, t2);
            } catch (e3) {
              t2 = Math.floor(t2 / 2);
            }
            return i.stringifyByChar(e2);
          }
          function f(e2, t2) {
            for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
            return t2;
          }
          a.applyFromCharCode = s;
          var c = {};
          c.string = { string: n, array: function(e2) {
            return l(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return c.string.uint8array(e2).buffer;
          }, uint8array: function(e2) {
            return l(e2, new Uint8Array(e2.length));
          }, nodebuffer: function(e2) {
            return l(e2, r.allocBuffer(e2.length));
          } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
            return new Uint8Array(e2).buffer;
          }, uint8array: function(e2) {
            return new Uint8Array(e2);
          }, nodebuffer: function(e2) {
            return r.newBufferFrom(e2);
          } }, c.arraybuffer = { string: function(e2) {
            return s(new Uint8Array(e2));
          }, array: function(e2) {
            return f(new Uint8Array(e2), new Array(e2.byteLength));
          }, arraybuffer: n, uint8array: function(e2) {
            return new Uint8Array(e2);
          }, nodebuffer: function(e2) {
            return r.newBufferFrom(new Uint8Array(e2));
          } }, c.uint8array = { string: s, array: function(e2) {
            return f(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return e2.buffer;
          }, uint8array: n, nodebuffer: function(e2) {
            return r.newBufferFrom(e2);
          } }, c.nodebuffer = { string: s, array: function(e2) {
            return f(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return c.nodebuffer.uint8array(e2).buffer;
          }, uint8array: function(e2) {
            return f(e2, new Uint8Array(e2.length));
          }, nodebuffer: n }, a.transformTo = function(e2, t2) {
            if (t2 = t2 || "", !e2) return t2;
            a.checkSupport(e2);
            var r2 = a.getTypeOf(t2);
            return c[r2][e2](t2);
          }, a.resolve = function(e2) {
            for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
              var i2 = t2[n2];
              "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
            }
            return r2.join("/");
          }, a.getTypeOf = function(e2) {
            return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
          }, a.checkSupport = function(e2) {
            if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
          }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
            var t2, r2, n2 = "";
            for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
            return n2;
          }, a.delay = function(e2, t2, r2) {
            setImmediate(function() {
              e2.apply(r2 || null, t2 || []);
            });
          }, a.inherits = function(e2, t2) {
            function r2() {
            }
            r2.prototype = t2.prototype, e2.prototype = new r2();
          }, a.extend = function() {
            var e2, t2, r2 = {};
            for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
            return r2;
          }, a.prepareContent = function(r2, e2, n2, i2, s2) {
            return u.Promise.resolve(e2).then(function(n3) {
              return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
                var e3 = new FileReader();
                e3.onload = function(e4) {
                  t2(e4.target.result);
                }, e3.onerror = function(e4) {
                  r3(e4.target.error);
                }, e3.readAsArrayBuffer(n3);
              }) : n3;
            }).then(function(e3) {
              var t2 = a.getTypeOf(e3);
              return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
                return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
              })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
            });
          };
        }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
          "use strict";
          var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
          function h(e2) {
            this.files = [], this.loadOptions = e2;
          }
          h.prototype = { checkSignature: function(e2) {
            if (!this.reader.readAndCheckSignature(e2)) {
              this.reader.index -= 4;
              var t2 = this.reader.readString(4);
              throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
            }
          }, isSignature: function(e2, t2) {
            var r2 = this.reader.index;
            this.reader.setIndex(e2);
            var n2 = this.reader.readString(4) === t2;
            return this.reader.setIndex(r2), n2;
          }, readBlockEndOfCentral: function() {
            this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
            var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
            this.zipComment = this.loadOptions.decodeFileName(r2);
          }, readBlockZip64EndOfCentral: function() {
            this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
            for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
          }, readBlockZip64EndOfCentralLocator: function() {
            if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
          }, readLocalFiles: function() {
            var e2, t2;
            for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
          }, readCentralDir: function() {
            var e2;
            for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
            if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
          }, readEndOfCentral: function() {
            var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
            if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
            this.reader.setIndex(e2);
            var t2 = e2;
            if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
              if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
              if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
              this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
            }
            var r2 = this.centralDirOffset + this.centralDirSize;
            this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
            var n2 = t2 - r2;
            if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
            else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
          }, prepareReader: function(e2) {
            this.reader = n(e2);
          }, load: function(e2) {
            this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
          } }, t.exports = h;
        }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
          "use strict";
          var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
          function l(e2, t2) {
            this.options = e2, this.loadOptions = t2;
          }
          l.prototype = { isEncrypted: function() {
            return 1 == (1 & this.bitFlag);
          }, useUTF8: function() {
            return 2048 == (2048 & this.bitFlag);
          }, readLocalPart: function(e2) {
            var t2, r2;
            if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
            if (null === (t2 = (function(e3) {
              for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
              return null;
            })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
            this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
          }, readCentralPart: function(e2) {
            this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
            var t2 = e2.readInt(2);
            if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
            e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
          }, processAttributes: function() {
            this.unixPermissions = null, this.dosPermissions = null;
            var e2 = this.versionMadeBy >> 8;
            this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
          }, parseZIP64ExtraField: function() {
            if (this.extraFields[1]) {
              var e2 = n(this.extraFields[1].value);
              this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
            }
          }, readExtraFields: function(e2) {
            var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
            for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
            e2.setIndex(i2);
          }, handleUTF8: function() {
            var e2 = u.uint8array ? "uint8array" : "array";
            if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
            else {
              var t2 = this.findExtraFieldUnicodePath();
              if (null !== t2) this.fileNameStr = t2;
              else {
                var r2 = s.transformTo(e2, this.fileName);
                this.fileNameStr = this.loadOptions.decodeFileName(r2);
              }
              var n2 = this.findExtraFieldUnicodeComment();
              if (null !== n2) this.fileCommentStr = n2;
              else {
                var i2 = s.transformTo(e2, this.fileComment);
                this.fileCommentStr = this.loadOptions.decodeFileName(i2);
              }
            }
          }, findExtraFieldUnicodePath: function() {
            var e2 = this.extraFields[28789];
            if (e2) {
              var t2 = n(e2.value);
              return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
            }
            return null;
          }, findExtraFieldUnicodeComment: function() {
            var e2 = this.extraFields[25461];
            if (e2) {
              var t2 = n(e2.value);
              return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
            }
            return null;
          } }, t.exports = l;
        }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
          "use strict";
          function n(e2, t2, r2) {
            this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
          }
          var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
          n.prototype = { internalStream: function(e2) {
            var t2 = null, r2 = "string";
            try {
              if (!e2) throw new Error("No output type specified.");
              var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
              "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
              var i2 = !this._dataBinary;
              i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
            } catch (e3) {
              (t2 = new h("error")).error(e3);
            }
            return new s(t2, r2, "");
          }, async: function(e2, t2) {
            return this.internalStream(e2).accumulate(t2);
          }, nodeStream: function(e2, t2) {
            return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
          }, _compressWorker: function(e2, t2) {
            if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
            var r2 = this._decompressWorker();
            return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
          }, _decompressWorker: function() {
            return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
          } };
          for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
          t.exports = n;
        }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
          (function(t2) {
            "use strict";
            var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
            if (e2) {
              var i = 0, s = new e2(u), a = t2.document.createTextNode("");
              s.observe(a, { characterData: true }), r = function() {
                a.data = i = ++i % 2;
              };
            } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
              var e3 = t2.document.createElement("script");
              e3.onreadystatechange = function() {
                u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
              }, t2.document.documentElement.appendChild(e3);
            } : function() {
              setTimeout(u, 0);
            };
            else {
              var o = new t2.MessageChannel();
              o.port1.onmessage = u, r = function() {
                o.port2.postMessage(0);
              };
            }
            var h = [];
            function u() {
              var e3, t3;
              n = true;
              for (var r2 = h.length; r2; ) {
                for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
                r2 = h.length;
              }
              n = false;
            }
            l.exports = function(e3) {
              1 !== h.push(e3) || n || r();
            };
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {}], 37: [function(e, t, r) {
          "use strict";
          var i = e("immediate");
          function u() {
          }
          var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
          function o(e2) {
            if ("function" != typeof e2) throw new TypeError("resolver must be a function");
            this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
          }
          function h(e2, t2, r2) {
            this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
          }
          function f(t2, r2, n2) {
            i(function() {
              var e2;
              try {
                e2 = r2(n2);
              } catch (e3) {
                return l.reject(t2, e3);
              }
              e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
            });
          }
          function c(e2) {
            var t2 = e2 && e2.then;
            if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
              t2.apply(e2, arguments);
            };
          }
          function d(t2, e2) {
            var r2 = false;
            function n2(e3) {
              r2 || (r2 = true, l.reject(t2, e3));
            }
            function i2(e3) {
              r2 || (r2 = true, l.resolve(t2, e3));
            }
            var s2 = p(function() {
              e2(i2, n2);
            });
            "error" === s2.status && n2(s2.value);
          }
          function p(e2, t2) {
            var r2 = {};
            try {
              r2.value = e2(t2), r2.status = "success";
            } catch (e3) {
              r2.status = "error", r2.value = e3;
            }
            return r2;
          }
          (t.exports = o).prototype.finally = function(t2) {
            if ("function" != typeof t2) return this;
            var r2 = this.constructor;
            return this.then(function(e2) {
              return r2.resolve(t2()).then(function() {
                return e2;
              });
            }, function(e2) {
              return r2.resolve(t2()).then(function() {
                throw e2;
              });
            });
          }, o.prototype.catch = function(e2) {
            return this.then(null, e2);
          }, o.prototype.then = function(e2, t2) {
            if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
            var r2 = new this.constructor(u);
            this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
            return r2;
          }, h.prototype.callFulfilled = function(e2) {
            l.resolve(this.promise, e2);
          }, h.prototype.otherCallFulfilled = function(e2) {
            f(this.promise, this.onFulfilled, e2);
          }, h.prototype.callRejected = function(e2) {
            l.reject(this.promise, e2);
          }, h.prototype.otherCallRejected = function(e2) {
            f(this.promise, this.onRejected, e2);
          }, l.resolve = function(e2, t2) {
            var r2 = p(c, t2);
            if ("error" === r2.status) return l.reject(e2, r2.value);
            var n2 = r2.value;
            if (n2) d(e2, n2);
            else {
              e2.state = a, e2.outcome = t2;
              for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
            }
            return e2;
          }, l.reject = function(e2, t2) {
            e2.state = s, e2.outcome = t2;
            for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
            return e2;
          }, o.resolve = function(e2) {
            if (e2 instanceof this) return e2;
            return l.resolve(new this(u), e2);
          }, o.reject = function(e2) {
            var t2 = new this(u);
            return l.reject(t2, e2);
          }, o.all = function(e2) {
            var r2 = this;
            if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
            var n2 = e2.length, i2 = false;
            if (!n2) return this.resolve([]);
            var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
            for (; ++t2 < n2; ) h2(e2[t2], t2);
            return o2;
            function h2(e3, t3) {
              r2.resolve(e3).then(function(e4) {
                s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
              }, function(e4) {
                i2 || (i2 = true, l.reject(o2, e4));
              });
            }
          }, o.race = function(e2) {
            var t2 = this;
            if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
            var r2 = e2.length, n2 = false;
            if (!r2) return this.resolve([]);
            var i2 = -1, s2 = new this(u);
            for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
              n2 || (n2 = true, l.resolve(s2, e3));
            }, function(e3) {
              n2 || (n2 = true, l.reject(s2, e3));
            });
            var a2;
            return s2;
          };
        }, { immediate: 36 }], 38: [function(e, t, r) {
          "use strict";
          var n = {};
          (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
        }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
          "use strict";
          var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
          function p(e2) {
            if (!(this instanceof p)) return new p(e2);
            this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
            var t2 = this.options;
            t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
            var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
            if (r2 !== l) throw new Error(i[r2]);
            if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
              var n2;
              if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
              this._dict_set = true;
            }
          }
          function n(e2, t2) {
            var r2 = new p(t2);
            if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
            return r2.result;
          }
          p.prototype.push = function(e2, t2) {
            var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
            if (this.ended) return false;
            n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
            do {
              if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
              0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
            } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
            return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
          }, p.prototype.onData = function(e2) {
            this.chunks.push(e2);
          }, p.prototype.onEnd = function(e2) {
            e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
          }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
            return (t2 = t2 || {}).raw = true, n(e2, t2);
          }, r.gzip = function(e2, t2) {
            return (t2 = t2 || {}).gzip = true, n(e2, t2);
          };
        }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
          "use strict";
          var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
          function a(e2) {
            if (!(this instanceof a)) return new a(e2);
            this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
            var t2 = this.options;
            t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
            var r2 = c.inflateInit2(this.strm, t2.windowBits);
            if (r2 !== m.Z_OK) throw new Error(n[r2]);
            this.header = new s(), c.inflateGetHeader(this.strm, this.header);
          }
          function o(e2, t2) {
            var r2 = new a(t2);
            if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
            return r2.result;
          }
          a.prototype.push = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
            if (this.ended) return false;
            n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
            do {
              if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
              h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
            } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
            return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
          }, a.prototype.onData = function(e2) {
            this.chunks.push(e2);
          }, a.prototype.onEnd = function(e2) {
            e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
          }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
            return (t2 = t2 || {}).raw = true, o(e2, t2);
          }, r.ungzip = o;
        }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
          "use strict";
          var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
          r.assign = function(e2) {
            for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
              var r2 = t2.shift();
              if (r2) {
                if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
                for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
              }
            }
            return e2;
          }, r.shrinkBuf = function(e2, t2) {
            return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
          };
          var i = { arraySet: function(e2, t2, r2, n2, i2) {
            if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
            else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
          }, flattenChunks: function(e2) {
            var t2, r2, n2, i2, s2, a;
            for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
            for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
            return a;
          } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
            for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
          }, flattenChunks: function(e2) {
            return [].concat.apply([], e2);
          } };
          r.setTyped = function(e2) {
            e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
          }, r.setTyped(n);
        }, {}], 42: [function(e, t, r) {
          "use strict";
          var h = e("./common"), i = true, s = true;
          try {
            String.fromCharCode.apply(null, [0]);
          } catch (e2) {
            i = false;
          }
          try {
            String.fromCharCode.apply(null, new Uint8Array(1));
          } catch (e2) {
            s = false;
          }
          for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
          function l(e2, t2) {
            if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
            for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
            return r2;
          }
          u[254] = u[254] = 1, r.string2buf = function(e2) {
            var t2, r2, n2, i2, s2, a = e2.length, o = 0;
            for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          }, r.buf2binstring = function(e2) {
            return l(e2, e2.length);
          }, r.binstring2buf = function(e2) {
            for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
            return t2;
          }, r.buf2string = function(e2, t2) {
            var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
            for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
            else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
            else {
              for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
              1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
            }
            return l(o, n2);
          }, r.utf8border = function(e2, t2) {
            var r2;
            for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
            return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
          };
        }, { "./common": 41 }], 43: [function(e, t, r) {
          "use strict";
          t.exports = function(e2, t2, r2, n) {
            for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
              for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
              i %= 65521, s %= 65521;
            }
            return i | s << 16 | 0;
          };
        }, {}], 44: [function(e, t, r) {
          "use strict";
          t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
        }, {}], 45: [function(e, t, r) {
          "use strict";
          var o = (function() {
            for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
              e2 = r2;
              for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
              t2[r2] = e2;
            }
            return t2;
          })();
          t.exports = function(e2, t2, r2, n) {
            var i = o, s = n + r2;
            e2 ^= -1;
            for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
            return -1 ^ e2;
          };
        }, {}], 46: [function(e, t, r) {
          "use strict";
          var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
          function R(e2, t2) {
            return e2.msg = n[t2], t2;
          }
          function T(e2) {
            return (e2 << 1) - (4 < e2 ? 9 : 0);
          }
          function D(e2) {
            for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
          }
          function F(e2) {
            var t2 = e2.state, r2 = t2.pending;
            r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
          }
          function N(e2, t2) {
            u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
          }
          function U(e2, t2) {
            e2.pending_buf[e2.pending++] = t2;
          }
          function P(e2, t2) {
            e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
          }
          function L(e2, t2) {
            var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
            e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
            do {
              if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
                s2 += 2, r2++;
                do {
                } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
                if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                  if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                  d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
                }
              }
            } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
            return a2 <= e2.lookahead ? a2 : e2.lookahead;
          }
          function j(e2) {
            var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
            do {
              if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
                for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                i2 += f2;
              }
              if (0 === e2.strm.avail_in) break;
              if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
            } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
          }
          function Z(e2, t2) {
            for (var r2, n2; ; ) {
              if (e2.lookahead < z) {
                if (j(e2), e2.lookahead < z && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
                for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
                e2.strstart++;
              } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
              else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
              if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            }
            return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
          }
          function W(e2, t2) {
            for (var r2, n2, i2; ; ) {
              if (e2.lookahead < z) {
                if (j(e2), e2.lookahead < z && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
                for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
                if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
              } else if (e2.match_available) {
                if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
              } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
            }
            return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
          }
          function M(e2, t2, r2, n2, i2) {
            this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
          }
          function H() {
            this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
          }
          function G(e2) {
            var t2;
            return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
          }
          function K(e2) {
            var t2 = G(e2);
            return t2 === m && (function(e3) {
              e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
            })(e2.state), t2;
          }
          function Y(e2, t2, r2, n2, i2, s2) {
            if (!e2) return _;
            var a2 = 1;
            if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
            8 === n2 && (n2 = 9);
            var o2 = new H();
            return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
          }
          h = [new M(0, 0, 0, 0, function(e2, t2) {
            var r2 = 65535;
            for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
              if (e2.lookahead <= 1) {
                if (j(e2), 0 === e2.lookahead && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              e2.strstart += e2.lookahead, e2.lookahead = 0;
              var n2 = e2.block_start + r2;
              if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
              if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            }
            return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
          }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
            return Y(e2, t2, v, 15, 8, 0);
          }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
            return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
          }, r.deflate = function(e2, t2) {
            var r2, n2, i2, s2;
            if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
            if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
            if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
            else {
              var a2 = v + (n2.w_bits - 8 << 4) << 8;
              a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
            }
            if (69 === n2.status) if (n2.gzhead.extra) {
              for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
            } else n2.status = 73;
            if (73 === n2.status) if (n2.gzhead.name) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
            } else n2.status = 91;
            if (91 === n2.status) if (n2.gzhead.comment) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
            } else n2.status = 103;
            if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
              if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
            } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
            if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
            if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
              var o2 = 2 === n2.strategy ? (function(e3, t3) {
                for (var r3; ; ) {
                  if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                    if (t3 === l) return A;
                    break;
                  }
                  if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                }
                return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
              })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
                for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                  if (e3.lookahead <= S) {
                    if (j(e3), e3.lookahead <= S && t3 === l) return A;
                    if (0 === e3.lookahead) break;
                  }
                  if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                    s3 = e3.strstart + S;
                    do {
                    } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                    e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                  }
                  if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                }
                return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
              })(n2, t2) : h[n2.level].func(n2, t2);
              if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
              if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
            }
            return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
          }, r.deflateEnd = function(e2) {
            var t2;
            return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
          }, r.deflateSetDictionary = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
            if (!e2 || !e2.state) return _;
            if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
            for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
              for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
              r2.strstart = n2, r2.lookahead = x - 1, j(r2);
            }
            return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
          }, r.deflateInfo = "pako deflate (from Nodeca project)";
        }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
          "use strict";
          t.exports = function() {
            this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
          };
        }, {}], 48: [function(e, t, r) {
          "use strict";
          t.exports = function(e2, t2) {
            var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
            r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
            e: do {
              p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
              t: for (; ; ) {
                if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
                else {
                  if (!(16 & y)) {
                    if (0 == (64 & y)) {
                      v = m[(65535 & v) + (d & (1 << y) - 1)];
                      continue t;
                    }
                    if (32 & y) {
                      r2.mode = 12;
                      break e;
                    }
                    e2.msg = "invalid literal/length code", r2.mode = 30;
                    break e;
                  }
                  w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                  r: for (; ; ) {
                    if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                      if (0 == (64 & y)) {
                        v = _[(65535 & v) + (d & (1 << y) - 1)];
                        continue r;
                      }
                      e2.msg = "invalid distance code", r2.mode = 30;
                      break e;
                    }
                    if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (d >>>= y, p -= y, (y = s - a) < k) {
                      if (l < (y = k - y) && r2.sane) {
                        e2.msg = "invalid distance too far back", r2.mode = 30;
                        break e;
                      }
                      if (S = c, (x = 0) === f) {
                        if (x += u - y, y < w) {
                          for (w -= y; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      } else if (f < y) {
                        if (x += u + f - y, (y -= f) < w) {
                          for (w -= y; C[s++] = c[x++], --y; ) ;
                          if (x = 0, f < w) {
                            for (w -= y = f; C[s++] = c[x++], --y; ) ;
                            x = s - k, S = C;
                          }
                        }
                      } else if (x += f - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                      for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                      w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                    } else {
                      for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                      w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                    }
                    break;
                  }
                }
                break;
              }
            } while (n < i && s < o);
            n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
          };
        }, {}], 49: [function(e, t, r) {
          "use strict";
          var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
          function L(e2) {
            return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
          }
          function s() {
            this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
          }
          function a(e2) {
            var t2;
            return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
          }
          function o(e2) {
            var t2;
            return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
          }
          function h(e2, t2) {
            var r2, n2;
            return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
          }
          function u(e2, t2) {
            var r2, n2;
            return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
          }
          var l, f, c = true;
          function j(e2) {
            if (c) {
              var t2;
              for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
              for (; t2 < 256; ) e2.lens[t2++] = 9;
              for (; t2 < 280; ) e2.lens[t2++] = 7;
              for (; t2 < 288; ) e2.lens[t2++] = 8;
              for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
              T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
            }
            e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
          }
          function Z(e2, t2, r2, n2) {
            var i2, s2 = e2.state;
            return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
          }
          r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
            return u(e2, 15);
          }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
            if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
            12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
            e: for (; ; ) switch (r2.mode) {
              case P:
                if (0 === r2.wrap) {
                  r2.mode = 13;
                  break;
                }
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (2 & r2.wrap && 35615 === u2) {
                  E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                  break;
                }
                if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                  e2.msg = "incorrect header check", r2.mode = 30;
                  break;
                }
                if (8 != (15 & u2)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
                else if (k > r2.wbits) {
                  e2.msg = "invalid window size", r2.mode = 30;
                  break;
                }
                r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                break;
              case 2:
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.flags = u2, 8 != (255 & r2.flags)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (57344 & r2.flags) {
                  e2.msg = "unknown header flags set", r2.mode = 30;
                  break;
                }
                r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
              case 3:
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
              case 4:
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
              case 5:
                if (1024 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                } else r2.head && (r2.head.extra = null);
                r2.mode = 6;
              case 6:
                if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
                r2.length = 0, r2.mode = 7;
              case 7:
                if (2048 & r2.flags) {
                  if (0 === o2) break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                } else r2.head && (r2.head.name = null);
                r2.length = 0, r2.mode = 8;
              case 8:
                if (4096 & r2.flags) {
                  if (0 === o2) break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                } else r2.head && (r2.head.comment = null);
                r2.mode = 9;
              case 9:
                if (512 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (65535 & r2.check)) {
                    e2.msg = "header crc mismatch", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
                break;
              case 10:
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
              case 11:
                if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                e2.adler = r2.check = 1, r2.mode = 12;
              case 12:
                if (5 === t2 || 6 === t2) break e;
              case 13:
                if (r2.last) {
                  u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                  break;
                }
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                  case 0:
                    r2.mode = 14;
                    break;
                  case 1:
                    if (j(r2), r2.mode = 20, 6 !== t2) break;
                    u2 >>>= 2, l2 -= 2;
                    break e;
                  case 2:
                    r2.mode = 17;
                    break;
                  case 3:
                    e2.msg = "invalid block type", r2.mode = 30;
                }
                u2 >>>= 2, l2 -= 2;
                break;
              case 14:
                for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                  e2.msg = "invalid stored block lengths", r2.mode = 30;
                  break;
                }
                if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
              case 15:
                r2.mode = 16;
              case 16:
                if (d = r2.length) {
                  if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                  I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                  break;
                }
                r2.mode = 12;
                break;
              case 17:
                for (; l2 < 14; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                  e2.msg = "too many length or distance symbols", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 18;
              case 18:
                for (; r2.have < r2.ncode; ) {
                  for (; l2 < 3; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                }
                for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
                if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid code lengths set", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 19;
              case 19:
                for (; r2.have < r2.nlen + r2.ndist; ) {
                  for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                  else {
                    if (16 === b) {
                      for (z = _ + 2; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                        e2.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                    } else if (17 === b) {
                      for (z = _ + 3; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                    } else {
                      for (z = _ + 7; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                    }
                    if (r2.have + d > r2.nlen + r2.ndist) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    for (; d--; ) r2.lens[r2.have++] = k;
                  }
                }
                if (30 === r2.mode) break;
                if (0 === r2.lens[256]) {
                  e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                  break;
                }
                if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid literal/lengths set", r2.mode = 30;
                  break;
                }
                if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                  e2.msg = "invalid distances set", r2.mode = 30;
                  break;
                }
                if (r2.mode = 20, 6 === t2) break e;
              case 20:
                r2.mode = 21;
              case 21:
                if (6 <= o2 && 258 <= h2) {
                  e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                  break;
                }
                for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (g && 0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                  r2.mode = 26;
                  break;
                }
                if (32 & g) {
                  r2.back = -1, r2.mode = 12;
                  break;
                }
                if (64 & g) {
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break;
                }
                r2.extra = 15 & g, r2.mode = 22;
              case 22:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                r2.was = r2.length, r2.mode = 23;
              case 23:
                for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                  e2.msg = "invalid distance code", r2.mode = 30;
                  break;
                }
                r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
              case 24:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                if (r2.offset > r2.dmax) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                r2.mode = 25;
              case 25:
                if (0 === h2) break e;
                if (d = c2 - h2, r2.offset > d) {
                  if ((d = r2.offset - d) > r2.whave && r2.sane) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
                } else m = i2, p = a2 - r2.offset, d = r2.length;
                for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
                0 === r2.length && (r2.mode = 21);
                break;
              case 26:
                if (0 === h2) break e;
                i2[a2++] = r2.length, h2--, r2.mode = 21;
                break;
              case 27:
                if (r2.wrap) {
                  for (; l2 < 32; ) {
                    if (0 === o2) break e;
                    o2--, u2 |= n2[s2++] << l2, l2 += 8;
                  }
                  if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                    e2.msg = "incorrect data check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 28;
              case 28:
                if (r2.wrap && r2.flags) {
                  for (; l2 < 32; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (4294967295 & r2.total)) {
                    e2.msg = "incorrect length check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 29;
              case 29:
                x = 1;
                break e;
              case 30:
                x = -3;
                break e;
              case 31:
                return -4;
              case 32:
              default:
                return U;
            }
            return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
          }, r.inflateEnd = function(e2) {
            if (!e2 || !e2.state) return U;
            var t2 = e2.state;
            return t2.window && (t2.window = null), e2.state = null, N;
          }, r.inflateGetHeader = function(e2, t2) {
            var r2;
            return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
          }, r.inflateSetDictionary = function(e2, t2) {
            var r2, n2 = t2.length;
            return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
          }, r.inflateInfo = "pako inflate (from Nodeca project)";
        }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
          "use strict";
          var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
          t.exports = function(e2, t2, r2, n, i, s, a, o) {
            var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
            for (b = 0; b <= 15; b++) O[b] = 0;
            for (v = 0; v < n; v++) O[t2[r2 + v]]++;
            for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
            if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
            for (y = 1; y < w && 0 === O[y]; y++) ;
            for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
            if (0 < z && (0 === e2 || 1 !== w)) return -1;
            for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
            for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
            if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
            for (; ; ) {
              for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
              for (h = 1 << b - 1; E & h; ) h >>= 1;
              if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
                if (b === w) break;
                b = t2[r2 + a[v]];
              }
              if (k < b && (E & f) !== l) {
                for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
                if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
                i[l = E & f] = k << 24 | x << 16 | c - s | 0;
              }
            }
            return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
          };
        }, { "../utils/common": 41 }], 51: [function(e, t, r) {
          "use strict";
          t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
        }, {}], 52: [function(e, t, r) {
          "use strict";
          var i = e("../utils/common"), o = 0, h = 1;
          function n(e2) {
            for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
          }
          var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
          n(z);
          var C = new Array(2 * f);
          n(C);
          var E = new Array(512);
          n(E);
          var A = new Array(256);
          n(A);
          var I = new Array(a);
          n(I);
          var O, B, R, T = new Array(f);
          function D(e2, t2, r2, n2, i2) {
            this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
          }
          function F(e2, t2) {
            this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
          }
          function N(e2) {
            return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
          }
          function U(e2, t2) {
            e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
          }
          function P(e2, t2, r2) {
            e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
          }
          function L(e2, t2, r2) {
            P(e2, r2[2 * t2], r2[2 * t2 + 1]);
          }
          function j(e2, t2) {
            for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
            return r2 >>> 1;
          }
          function Z(e2, t2, r2) {
            var n2, i2, s2 = new Array(g + 1), a2 = 0;
            for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
            for (i2 = 0; i2 <= t2; i2++) {
              var o2 = e2[2 * i2 + 1];
              0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
            }
          }
          function W(e2) {
            var t2;
            for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
            for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
            for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
            e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
          }
          function M(e2) {
            8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
          }
          function H(e2, t2, r2, n2) {
            var i2 = 2 * t2, s2 = 2 * r2;
            return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
          }
          function G(e2, t2, r2) {
            for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
            e2.heap[r2] = n2;
          }
          function K(e2, t2, r2) {
            var n2, i2, s2, a2, o2 = 0;
            if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
            L(e2, m, t2);
          }
          function Y(e2, t2) {
            var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
            for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
            for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
            for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
            for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
            e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
              var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
              for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
              for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
              if (0 !== m2) {
                do {
                  for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                  e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
                } while (0 < m2);
                for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
              }
            })(e2, t2), Z(s2, u2, e2.bl_count);
          }
          function X(e2, t2, r2) {
            var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
            for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
          }
          function V(e2, t2, r2) {
            var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
            for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
              if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
              else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
              s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
            }
          }
          n(T);
          var q = false;
          function J(e2, t2, r2, n2) {
            P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
              M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
            })(e2, t2, r2, true);
          }
          r._tr_init = function(e2) {
            q || ((function() {
              var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
              for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
              for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
              for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
              for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
              for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
              for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
              for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
              for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
              for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
              O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
            })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
          }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
            var i2, s2, a2 = 0;
            0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
              var t3, r3 = 4093624447;
              for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
              if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
              for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
              return o;
            })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
              var t3;
              for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
              return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
            })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
              var i3;
              for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
              V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
            })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
          }, r._tr_tally = function(e2, t2, r2) {
            return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
          }, r._tr_align = function(e2) {
            P(e2, 2, 3), L(e2, m, z), (function(e3) {
              16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
            })(e2);
          };
        }, { "../utils/common": 41 }], 53: [function(e, t, r) {
          "use strict";
          t.exports = function() {
            this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
          };
        }, {}], 54: [function(e, t, r) {
          (function(e2) {
            !(function(r2, n) {
              "use strict";
              if (!r2.setImmediate) {
                var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
                e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                  process.nextTick(function() {
                    c(e4);
                  });
                } : (function() {
                  if (r2.postMessage && !r2.importScripts) {
                    var e4 = true, t3 = r2.onmessage;
                    return r2.onmessage = function() {
                      e4 = false;
                    }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                  }
                })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                  r2.postMessage(a + e4, "*");
                }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                  c(e4.data);
                }, function(e4) {
                  t2.port2.postMessage(e4);
                }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                  var t3 = l.createElement("script");
                  t3.onreadystatechange = function() {
                    c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                  }, s.appendChild(t3);
                }) : function(e4) {
                  setTimeout(c, 0, e4);
                }, e3.setImmediate = function(e4) {
                  "function" != typeof e4 && (e4 = new Function("" + e4));
                  for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                  var n2 = { callback: e4, args: t3 };
                  return h[o] = n2, i(o), o++;
                }, e3.clearImmediate = f;
              }
              function f(e4) {
                delete h[e4];
              }
              function c(e4) {
                if (u) setTimeout(c, 0, e4);
                else {
                  var t3 = h[e4];
                  if (t3) {
                    u = true;
                    try {
                      !(function(e5) {
                        var t4 = e5.callback, r3 = e5.args;
                        switch (r3.length) {
                          case 0:
                            t4();
                            break;
                          case 1:
                            t4(r3[0]);
                            break;
                          case 2:
                            t4(r3[0], r3[1]);
                            break;
                          case 3:
                            t4(r3[0], r3[1], r3[2]);
                            break;
                          default:
                            t4.apply(n, r3);
                        }
                      })(t3);
                    } finally {
                      f(e4), u = false;
                    }
                  }
                }
              }
              function d(e4) {
                e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
              }
            })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {}] }, {}, [10])(10);
      });
    }
  });

  // apps/chatgpt-universal-exporter/src/main.js
  var import_jszip = __toESM(require_jszip_min(), 1);
  (function() {
    "use strict";
    const BASE_DELAY = 600;
    const JITTER = 400;
    const PAGE_LIMIT = 100;
    const PROJECT_SIDEBAR_PREVIEW = 5;
    const PROJECT_SIDEBAR_LIMIT = 50;
    let accessToken = null;
    let capturedWorkspaceIds = /* @__PURE__ */ new Set();
    function readHeader(headers, name) {
      if (!headers) return null;
      if (typeof headers.get === "function") return headers.get(name);
      const lowerName = name.toLowerCase();
      if (Array.isArray(headers)) {
        const pair = headers.find(([key2]) => String(key2).toLowerCase() === lowerName);
        return pair ? pair[1] : null;
      }
      const key = Object.keys(headers).find((k) => k.toLowerCase() === lowerName);
      return key ? headers[key] : null;
    }
    (function interceptNetwork() {
      const rawFetch = window.fetch;
      window.fetch = function(resource, options) {
        try {
          const isRequest = typeof Request !== "undefined" && resource instanceof Request;
          const headers = options?.headers || (isRequest ? resource.headers : null);
          tryCaptureToken(readHeader(headers, "Authorization"));
          const id = readHeader(headers, "ChatGPT-Account-Id");
          if (id && !capturedWorkspaceIds.has(id)) {
            console.log("🎯 [Fetch] 捕获到 Workspace ID:", id);
            capturedWorkspaceIds.add(id);
          }
        } catch (_) {
        }
        return rawFetch.apply(this, arguments);
      };
    })();
    function tryCaptureToken(value) {
      if (typeof value !== "string" || !value.startsWith("Bearer ")) return;
      const token = value.slice(7);
      if (token && token.toLowerCase() !== "dummy") {
        accessToken = token;
      }
    }
    const ACCESS_TOKEN_HINT = "无法获取 Access Token。请刷新页面或打开任意一个对话后再试。";
    async function ensureAccessToken({ forceRefresh = false } = {}) {
      if (accessToken && !forceRefresh) return accessToken;
      try {
        const session = await (await fetch("/api/auth/session?unstable_client=true")).json();
        if (session?.accessToken) {
          accessToken = session.accessToken;
          return accessToken;
        }
      } catch (_) {
      }
      return null;
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const jitter = () => BASE_DELAY + Math.random() * JITTER;
    const sanitizeFilename = (name) => name.replace(/[\/\\?%*:|"<>]/g, "-").trim();
    const normalizeEpochSeconds = (value) => {
      if (!value) return 0;
      if (typeof value === "number" && Number.isFinite(value)) {
        return value > 1e12 ? Math.floor(value / 1e3) : value;
      }
      if (typeof value === "string") {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
          return Math.floor(parsed / 1e3);
        }
      }
      return 0;
    };
    const formatTimestamp = (value) => {
      const seconds = normalizeEpochSeconds(value);
      if (!seconds) return "";
      const date = new Date(seconds * 1e3);
      return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
    };
    const parseDateInputToEpoch = (value, isEnd = false) => {
      if (!value) return null;
      const parts = value.split("-").map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
      const [year, month, day] = parts;
      const date = isEnd ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day, 0, 0, 0, 0);
      const epochMs = date.getTime();
      return Number.isNaN(epochMs) ? null : Math.floor(epochMs / 1e3);
    };
    function getOaiDeviceId() {
      const cookieString = document.cookie;
      const match = cookieString.match(/oai-did=([^;]+)/);
      return match ? match[1] : null;
    }
    function generateUniqueFilename(convData) {
      const convId = convData.conversation_id || "";
      const shortId = convId.includes("-") ? convId.split("-").pop() : convId || Date.now().toString(36);
      let baseName = convData.title;
      if (!baseName || baseName.trim().toLowerCase() === "new chat") {
        baseName = "Untitled Conversation";
      }
      return `${sanitizeFilename(baseName)}_${shortId}.json`;
    }
    function generateMarkdownFilename(convData) {
      const jsonName = generateUniqueFilename(convData);
      return jsonName.endsWith(".json") ? `${jsonName.slice(0, -5)}.md` : `${jsonName}.md`;
    }
    const EXPORTER_VERSION = "1.6.1";
    const EXPORT_BUTTON_LABEL = `Export Conversations v${EXPORTER_VERSION}`;
    const MIME_EXTENSIONS = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
      "application/zip": ".zip",
      "application/json": ".json",
      "text/plain": ".txt",
      "text/csv": ".csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx"
    };
    function safeAttachmentName(value) {
      let name = String(value || "attachment");
      try {
        name = decodeURIComponent(name);
      } catch (_) {
      }
      name = name.split(/[\\/]/).pop() || "attachment";
      return name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[\\/:*?"<>|]/g, "-").replace(/^[. ]+|[. ]+$/g, "").slice(0, 180) || "attachment";
    }
    function addMimeExtension(filename, mimeType) {
      if (/\.[a-z0-9]{1,10}$/i.test(filename)) return filename;
      const mime = String(mimeType || "").split(";")[0].trim().toLowerCase();
      return filename + (MIME_EXTENSIONS[mime] || "");
    }
    function uniqueAttachmentName(filename, usedNames) {
      const safe = safeAttachmentName(filename);
      if (!usedNames.has(safe)) {
        usedNames.add(safe);
        return safe;
      }
      const dot = safe.lastIndexOf(".");
      const base = dot > 0 ? safe.slice(0, dot) : safe;
      const extension = dot > 0 ? safe.slice(dot) : "";
      let index = 2;
      while (usedNames.has(`${base}_${index}${extension}`)) index++;
      const result = `${base}_${index}${extension}`;
      usedNames.add(result);
      return result;
    }
    function extractFileId(pointer) {
      if (typeof pointer !== "string") return null;
      const match = pointer.match(/file[-_][a-z0-9]+/i);
      return match ? match[0] : null;
    }
    function getActiveConversationNodes(convData) {
      const mapping = convData?.mapping;
      if (!mapping || typeof mapping !== "object") return [];
      const entries = Object.entries(mapping);
      if (entries.length === 0) return [];
      let currentNodeId = convData?.current_node;
      if (!currentNodeId || !mapping[currentNodeId]) {
        const leaves = entries.filter(([, node]) => !Array.isArray(node?.children) || node.children.length === 0).sort(([, a], [, b]) => {
          const aTime = Number(a?.message?.create_time) || 0;
          const bTime = Number(b?.message?.create_time) || 0;
          return bTime - aTime;
        });
        currentNodeId = leaves[0]?.[0] || entries[entries.length - 1][0];
        console.warn("Conversation current_node is unavailable; exporting the latest leaf path instead.");
      }
      const path = [];
      const visited = /* @__PURE__ */ new Set();
      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const node = mapping[currentNodeId];
        if (!node) break;
        path.push(node);
        currentNodeId = node.parent || null;
      }
      return path.reverse();
    }
    function collectVisibleAttachments(convData) {
      const references = /* @__PURE__ */ new Map();
      const add = (reference) => {
        const key = reference.kind === "sandbox" ? `sandbox:${reference.messageId}:${reference.sandboxPath}` : `file:${reference.fileId}`;
        if (!references.has(key)) references.set(key, reference);
      };
      getActiveConversationNodes(convData).forEach((node) => {
        const message = node?.message;
        if (!message) return;
        const role = message.author?.role;
        if (role !== "user" && role !== "assistant" && role !== "tool") return;
        if (message.metadata?.is_visually_hidden_from_conversation) return;
        if (role === "user") {
          (message.metadata?.attachments || []).forEach((attachment) => {
            const fileId = attachment?.id || attachment?.file_id;
            if (!fileId) return;
            add({
              kind: "file",
              fileId,
              messageId: message.id,
              ownerRole: role,
              name: attachment.name || fileId,
              mimeType: attachment.mime_type || "",
              isImage: /^image\//i.test(attachment.mime_type || "")
            });
          });
        }
        (message.content?.parts || []).forEach((part) => {
          if (part && typeof part === "object" && part.asset_pointer && /image|canvas|audio|video/i.test(part.content_type || "")) {
            const isGeneratedToolImage = role === "tool" && Boolean(part.metadata?.dalle || part.metadata?.generation);
            if (role === "tool" && !isGeneratedToolImage) return;
            const fileId = extractFileId(part.asset_pointer);
            if (fileId) {
              add({
                kind: "file",
                fileId,
                messageId: message.id,
                ownerRole: role,
                name: isGeneratedToolImage ? "generated_image" : /image/i.test(part.content_type || "") ? "image" : fileId,
                mimeType: "",
                isImage: /image/i.test(part.content_type || "")
              });
            }
          }
          const text = typeof part === "string" ? part : part?.text;
          if (role !== "assistant" || typeof text !== "string") return;
          for (const match of text.matchAll(/\]\((sandbox:[^)]+)\)/gi)) {
            const sandboxPath = match[1];
            add({
              kind: "sandbox",
              sandboxPath,
              messageId: message.id,
              ownerRole: role,
              name: sandboxPath.split("/").pop() || "generated_file",
              mimeType: "",
              isImage: /\.(?:png|jpe?g|gif|webp|svg)$/i.test(sandboxPath)
            });
          }
        });
      });
      return Array.from(references.values());
    }
    function attachmentHeaders(accountId) {
      const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "oai-device-id": getOaiDeviceId()
      };
      if (accountId) headers["ChatGPT-Account-Id"] = accountId;
      return headers;
    }
    async function fetchAttachmentBinary(reference, convData, accountId, session) {
      let metadataUrl;
      if (reference.kind === "sandbox") {
        const conversationId = convData?.conversation_id || convData?.id;
        if (!conversationId || !reference.messageId) throw new Error("missing conversation/message id");
        const query = new URLSearchParams({
          message_id: reference.messageId,
          sandbox_path: reference.sandboxPath.replace(/^sandbox:/i, "")
        });
        metadataUrl = `/backend-api/conversation/${encodeURIComponent(conversationId)}/interpreter/download?${query}`;
      } else {
        metadataUrl = `/backend-api/files/download/${encodeURIComponent(reference.fileId)}?inline=false`;
      }
      const metadataResponse = await apiFetch(metadataUrl, {
        accountId,
        session,
        label: "metadata HTTP",
        init: { credentials: "include" }
      });
      const contentType = metadataResponse.headers.get("content-type") || "";
      if (!contentType.includes("json")) {
        const directName = addMimeExtension(reference.name, contentType);
        return { data: new Uint8Array(await metadataResponse.arrayBuffer()), filename: directName };
      }
      const metadata = await metadataResponse.json();
      const downloadUrl = metadata.download_url || metadata.url;
      if (!downloadUrl) throw new Error("download_url missing or expired");
      const parsedUrl = new URL(downloadUrl, location.origin);
      const sameOrigin = parsedUrl.origin === location.origin;
      const response = await fetch(parsedUrl.href, sameOrigin ? { credentials: "include", headers: attachmentHeaders(accountId) } : {});
      if (!response.ok) throw new Error(`binary HTTP ${response.status}`);
      const mimeType = response.headers.get("content-type") || reference.mimeType || "";
      const filename = addMimeExtension(
        safeAttachmentName(metadata.file_name || metadata.filename || reference.name),
        mimeType
      );
      return { data: new Uint8Array(await response.arrayBuffer()), filename };
    }
    function encodeRelativePath(path) {
      return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
    }
    const PRECOMPRESSED_FILE = /\.(?:png|jpe?g|gif|webp|avif|heic|mp3|m4a|aac|ogg|mp4|mov|webm|zip|gz|7z|rar|pdf|docx|xlsx|pptx)$/i;
    async function appendAttachmentsToZip(target, convData, accountId, session = null) {
      const references = collectVisibleAttachments(convData);
      const failures = [];
      const files = [];
      const sandboxPaths = /* @__PURE__ */ new Map();
      const usedNames = /* @__PURE__ */ new Set();
      const folderName = generateUniqueFilename(convData).replace(/\.json$/i, "") + "_files";
      for (const reference of references) {
        if (session?.cancelled) break;
        try {
          const downloaded = await fetchAttachmentBinary(reference, convData, accountId, session);
          const filename = uniqueAttachmentName(downloaded.filename, usedNames);
          target.folder(folderName).file(filename, downloaded.data, {
            compression: PRECOMPRESSED_FILE.test(filename) ? "STORE" : "DEFLATE"
          });
          const relativePath = encodeRelativePath(`${folderName}/${filename}`);
          files.push({
            name: filename,
            path: relativePath,
            kind: reference.kind,
            isImage: reference.isImage,
            messageId: reference.messageId,
            ownerRole: reference.ownerRole
          });
          if (reference.kind === "sandbox") {
            sandboxPaths.set(`${reference.messageId}|${reference.sandboxPath}`, relativePath);
          }
        } catch (error) {
          failures.push({
            kind: reference.kind,
            file_id: reference.fileId || null,
            sandbox_path: reference.sandboxPath || null,
            message_id: reference.messageId || null,
            name: reference.name,
            error: error?.message || String(error)
          });
        }
        await sleep(150);
      }
      return { detected: references.length, files, failures, sandboxPaths };
    }
    function replaceDownloadedSandboxLinks(text, sandboxPaths, messageId) {
      if (!text || !sandboxPaths) return text;
      return text.replace(/\]\((sandbox:[^)]+)\)/gi, (match, sandboxPath) => {
        const localPath = sandboxPaths.get(`${messageId}|${sandboxPath}`);
        return localPath ? `](${localPath})` : match;
      });
    }
    function cleanMessageContent(text) {
      if (!text) return "";
      return text.replace(/\uE200cite(?:\uE202turn\d+(?:search|view)\d+)+\uE201/gi, "").replace(/cite(?:turn\d+(?:search|view)\d+)+/gi, "").trim();
    }
    function processContentReferences(text, contentReferences, referenceStartIndex = 1) {
      if (!text || !Array.isArray(contentReferences) || contentReferences.length === 0) {
        return { text, footnotes: [], nextReferenceIndex: referenceStartIndex };
      }
      const references = contentReferences.filter((ref) => ref && typeof ref.matched_text === "string" && ref.matched_text.length > 0);
      if (references.length === 0) {
        return { text, footnotes: [], nextReferenceIndex: referenceStartIndex };
      }
      const getReferenceInfo = (ref) => {
        const item = Array.isArray(ref.items) ? ref.items[0] : null;
        const url = item?.url || (Array.isArray(ref.safe_urls) ? ref.safe_urls[0] : "") || "";
        const title = item?.title || "";
        let label = item?.attribution || "";
        if (!label && typeof ref.alt === "string") {
          const match = ref.alt.match(/\[([^\]]+)\]\([^)]+\)/);
          if (match) label = match[1];
        }
        if (!label) label = title || url;
        return { url, title, label };
      };
      const footnotes = [];
      const footnoteIndexByKey = /* @__PURE__ */ new Map();
      const citationRefs = references.filter((ref) => ref.type === "grouped_webpages").sort((a, b) => {
        const aIdx = Number.isFinite(a.start_idx) ? a.start_idx : Number.MAX_SAFE_INTEGER;
        const bIdx = Number.isFinite(b.start_idx) ? b.start_idx : Number.MAX_SAFE_INTEGER;
        return aIdx - bIdx;
      });
      citationRefs.forEach((ref) => {
        const info = getReferenceInfo(ref);
        if (!info.url) return;
        const key = `${info.url}|${info.title}`;
        if (footnoteIndexByKey.has(key)) return;
        const index = referenceStartIndex + footnotes.length;
        footnoteIndexByKey.set(key, index);
        footnotes.push({ index, url: info.url, title: info.title, label: info.label });
      });
      const sortedByReplacement = references.slice().sort((a, b) => {
        const aIdx = Number.isFinite(a.start_idx) ? a.start_idx : -1;
        const bIdx = Number.isFinite(b.start_idx) ? b.start_idx : -1;
        if (aIdx !== -1 || bIdx !== -1) {
          return bIdx - aIdx;
        }
        return (b.matched_text?.length || 0) - (a.matched_text?.length || 0);
      });
      let output = text;
      sortedByReplacement.forEach((ref) => {
        if (!ref?.matched_text || ref.type === "sources_footnote") return;
        let replacement = "";
        if (ref.type === "grouped_webpages") {
          const info = getReferenceInfo(ref);
          if (info.url) {
            const key = `${info.url}|${info.title}`;
            const index = footnoteIndexByKey.get(key);
            replacement = index ? `([${info.label}][${index}])` : ref.alt || "";
          } else {
            replacement = ref.alt || "";
          }
        } else {
          replacement = ref.alt || "";
        }
        if (Number.isFinite(ref.start_idx) && Number.isFinite(ref.end_idx)) {
          if (output.slice(ref.start_idx, ref.end_idx) === ref.matched_text) {
            output = output.slice(0, ref.start_idx) + replacement + output.slice(ref.end_idx);
            return;
          }
        }
        output = output.split(ref.matched_text).join(replacement);
      });
      return {
        text: output,
        footnotes,
        nextReferenceIndex: referenceStartIndex + footnotes.length
      };
    }
    function extractConversationMessages(convData, attachmentResult = null) {
      const messages = [];
      const nodes = getActiveConversationNodes(convData);
      let nextReferenceIndex = 1;
      nodes.forEach((node) => {
        const msg = node?.message;
        if (!msg) return;
        const author = msg.author?.role;
        const isHidden = msg.metadata?.is_visually_hidden_from_conversation || msg.metadata?.is_contextual_answers_system_message;
        if (author !== "user" && author !== "assistant" || isHidden) return;
        const content = msg.content;
        if (content?.content_type !== "text" && content?.content_type !== "multimodal_text" || !Array.isArray(content.parts)) return;
        const rawText = content.parts.map((part) => typeof part === "string" ? part : part?.text ?? "").filter(Boolean).join("\n");
        const contentReferences = msg.metadata?.content_references || [];
        let processedText = rawText;
        let footnotes = [];
        if (Array.isArray(contentReferences) && contentReferences.length > 0) {
          const processed = processContentReferences(rawText, contentReferences, nextReferenceIndex);
          processedText = processed.text;
          footnotes = processed.footnotes;
          nextReferenceIndex = processed.nextReferenceIndex;
        }
        const cleaned = cleanMessageContent(
          replaceDownloadedSandboxLinks(processedText, attachmentResult?.sandboxPaths, msg.id)
        );
        const attachmentLines = (attachmentResult?.files || []).filter((file) => file.messageId === msg.id && file.kind !== "sandbox").map((file) => {
          const label = file.name.replace(/[\[\]]/g, "\\$&");
          return file.isImage ? `![${label}](${file.path})` : `📎 [${label}](${file.path})`;
        });
        const renderedContent = [cleaned, ...attachmentLines].filter(Boolean).join("\n\n");
        if (!renderedContent) return;
        messages.push({
          role: author,
          content: renderedContent,
          messageId: msg.id,
          create_time: msg.create_time || null,
          footnotes
        });
      });
      return messages;
    }
    function toIsoTime(value) {
      const seconds = normalizeEpochSeconds(value);
      return seconds ? new Date(seconds * 1e3).toISOString() : null;
    }
    function buildMarkdownFrontMatter(convData) {
      const id = convData?.conversation_id || convData?.id || null;
      const fields = [
        ["title", convData?.title || "Untitled Conversation"],
        ["conversation_id", id],
        ["created", toIsoTime(convData?.create_time)],
        ["updated", toIsoTime(convData?.update_time)],
        ["url", id ? `https://chatgpt.com/c/${id}` : null],
        ["exported_by", `ChatGPT Exporter v${EXPORTER_VERSION}`]
      ].filter(([, value]) => value);
      return ["---", ...fields.map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`), "---", ""];
    }
    function convertConversationToMarkdown(convData, attachmentResult = null) {
      const messages = extractConversationMessages(convData, attachmentResult);
      const mdLines = buildMarkdownFrontMatter(convData);
      if (messages.length === 0) {
        mdLines.push("# Conversation", "No visible user or assistant messages were exported.", "");
      }
      messages.forEach((msg) => {
        const roleLabel = msg.role === "user" ? "# User" : "# Assistant";
        mdLines.push(roleLabel);
        mdLines.push(msg.content);
        if (Array.isArray(msg.footnotes) && msg.footnotes.length > 0) {
          mdLines.push("");
          msg.footnotes.slice().sort((a, b) => a.index - b.index).forEach((note) => {
            if (!note.url) return;
            const title = note.title ? ` "${note.title}"` : "";
            mdLines.push(`[${note.index}]: ${note.url}${title}`);
          });
        }
        mdLines.push("");
      });
      const additionalFiles = (attachmentResult?.files || []).filter((file) => file.kind !== "sandbox" && file.ownerRole !== "user" && file.ownerRole !== "assistant");
      if (additionalFiles.length > 0) {
        mdLines.push("# Attachments", "");
        additionalFiles.forEach((file) => {
          const label = file.name.replace(/[\[\]]/g, "\\$&");
          mdLines.push(file.isImage ? `![${label}](${file.path})` : `- [${label}](${file.path})`);
        });
        mdLines.push("");
      }
      return mdLines.join("\n").trim() + "\n";
    }
    function downloadFile(blob, filename) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 6e4);
    }
    const FAB_SIZE = 44;
    const FAB_AUTO_COLLAPSE = false;
    const FAB_DRAG_THRESHOLD = 6;
    const FAB_EDGE_SNAP = 36;
    const FAB_STORAGE_KEY = "chatgpt-exporter-fab-v1";
    const FAB_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    const fabState = { x: null, y: null, docked: null, collapsed: false };
    let fabDragInfo = null;
    let fabSuppressClick = false;
    let fabCollapseTimer = null;
    function fabDefaultPosition() {
      return { x: window.innerWidth - FAB_SIZE / 2 - 14, y: Math.round(window.innerHeight * 0.45) };
    }
    function fabClamp(pos) {
      const half = FAB_SIZE / 2;
      return {
        x: Math.min(Math.max(pos.x, half + 2), Math.max(half + 2, window.innerWidth - half - 2)),
        y: Math.min(Math.max(pos.y, half + 2), Math.max(half + 2, window.innerHeight - half - 2))
      };
    }
    function fabSnap(pos) {
      const half = FAB_SIZE / 2;
      const snapped = { ...pos };
      fabState.docked = null;
      if (pos.x <= half + FAB_EDGE_SNAP) {
        snapped.x = half + 2;
        fabState.docked = "left";
      } else if (pos.x >= window.innerWidth - half - FAB_EDGE_SNAP) {
        snapped.x = window.innerWidth - half - 2;
        fabState.docked = "right";
      }
      return snapped;
    }
    function loadFabState() {
      try {
        const saved = JSON.parse(localStorage.getItem(FAB_STORAGE_KEY));
        if (saved && typeof saved.x === "number" && typeof saved.y === "number") return saved;
      } catch (_) {
      }
      return null;
    }
    function saveFabState() {
      try {
        localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify({
          x: fabState.x,
          y: fabState.y,
          docked: fabState.docked,
          collapsed: fabState.collapsed
        }));
      } catch (_) {
      }
    }
    function fabStatusEl() {
      let el = document.getElementById("gre-fab-status");
      if (!el) {
        el = document.createElement("div");
        el.id = "gre-fab-status";
        document.body.appendChild(el);
      }
      return el;
    }
    function fabPositionStatus(btn) {
      const pill = document.getElementById("gre-fab-status");
      if (!pill) return;
      const rect = btn.getBoundingClientRect();
      const left = fabState.x > window.innerWidth / 2 ? rect.left - pill.offsetWidth - 10 : rect.right + 10;
      pill.style.left = `${Math.max(6, Math.min(left, window.innerWidth - pill.offsetWidth - 6))}px`;
      pill.style.top = `${Math.round(rect.top + rect.height / 2 - pill.offsetHeight / 2)}px`;
    }
    function fabApply(btn, pos, persist = false) {
      fabState.x = pos.x;
      fabState.y = pos.y;
      btn.style.left = `${Math.round(pos.x - FAB_SIZE / 2)}px`;
      btn.style.top = `${Math.round(pos.y - FAB_SIZE / 2)}px`;
      fabPositionStatus(btn);
      if (persist) saveFabState();
    }
    function fabIsCollapsed(btn) {
      return btn.classList.contains("gre-collapsed-left") || btn.classList.contains("gre-collapsed-right");
    }
    function fabExpand(btn) {
      btn.classList.remove("gre-collapsed-left", "gre-collapsed-right");
      fabState.collapsed = false;
    }
    function fabCollapse(btn) {
      fabExpand(btn);
      if (!fabState.docked) return;
      btn.classList.add(`gre-collapsed-${fabState.docked}`);
      fabState.collapsed = true;
      saveFabState();
    }
    function fabScheduleCollapse(btn) {
      clearTimeout(fabCollapseTimer);
      if (!FAB_AUTO_COLLAPSE) {
        fabExpand(btn);
        return;
      }
      if (!fabState.docked) return;
      fabCollapseTimer = setTimeout(() => {
        if (!btn.classList.contains("gre-busy") && !btn.classList.contains("gre-progress") && !btn.matches(":hover")) {
          fabCollapse(btn);
        }
      }, 2500);
    }
    function parseProgress(text) {
      const match = /\s*\((\d+)\s*\/\s*(\d+)\)\s*$/.exec(text);
      if (!match || Number(match[2]) <= 0) return null;
      const current = Number(match[1]);
      const total = Number(match[2]);
      const packing = text.startsWith("正在打包");
      const finished = packing ? current : Math.max(0, current - 1);
      return { current, total, packing, label: text.slice(0, match.index), pct: Math.min(100, Math.round(finished / total * 100)) };
    }
    function setFabStatus(btn, text, tone = null) {
      btn.classList.remove("gre-busy", "gre-progress", "gre-done", "gre-error");
      const ring = btn.querySelector(".gre-fab-ring");
      const badge = btn.querySelector(".gre-fab-badge");
      document.getElementById("gre-fab-status")?.classList.remove("gre-visible");
      if (text === EXPORT_BUTTON_LABEL) {
        if (badge) badge.textContent = "";
        btn.title = `ChatGPT Exporter v${EXPORTER_VERSION} · 点击导出 · 拖动移动 · 右键重置位置`;
        fabScheduleCollapse(btn);
        return;
      }
      const progress = tone ? null : parseProgress(text);
      if (progress) {
        const { pct } = progress;
        btn.classList.add("gre-progress");
        if (ring) ring.style.setProperty("--gre-pct", String(pct));
        if (badge) badge.textContent = `${pct}%`;
      } else if (tone === "done") {
        btn.classList.add("gre-done");
        if (badge) badge.textContent = "✓";
      } else if (tone === "error") {
        btn.classList.add("gre-error");
        if (badge) badge.textContent = "!";
      } else {
        btn.classList.add("gre-busy");
        if (badge) badge.textContent = "";
      }
      btn.title = `${text} · ChatGPT Exporter v${EXPORTER_VERSION}`;
      fabExpand(btn);
    }
    function ensureFabStyle() {
      if (document.getElementById("gre-fab-style")) return;
      const style = document.createElement("style");
      style.id = "gre-fab-style";
      style.textContent = `
#gpt-rescue-btn {
    position: fixed !important;
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    box-sizing: border-box !important;
    width: ${FAB_SIZE}px;
    height: ${FAB_SIZE}px;
    padding: 0;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, .08);
    background: rgba(255, 255, 255, .88);
    color: #0d0d0d;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, .16);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 2147483000 !important;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    transition: transform .25s ease, box-shadow .2s ease;
}
#gpt-rescue-btn .gre-fab-icon svg { display: block; }
#gpt-rescue-btn:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, .24); }
#gpt-rescue-btn.gre-dragging { transition: none; cursor: grabbing; }
#gpt-rescue-btn:focus-visible { outline: 2px solid #10a37f; outline-offset: 2px; }

html.dark #gpt-rescue-btn {
    background: rgba(52, 53, 65, .92);
    border-color: rgba(255, 255, 255, .14);
    color: #ececec;
}

.gre-fab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity .2s;
}
.gre-fab-ring {
    position: absolute;
    inset: 2px;
    border-radius: 999px;
    opacity: 0;
    background: conic-gradient(#10a37f calc(var(--gre-pct, 0) * 1%), rgba(0, 0, 0, .12) 0);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));
    transition: opacity .2s;
}
html.dark .gre-fab-ring {
    background: conic-gradient(#19c37d calc(var(--gre-pct, 0) * 1%), rgba(255, 255, 255, .16) 0);
}
.gre-fab-badge {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: -.2px;
    opacity: 0;
    transition: opacity .2s;
}
#gpt-rescue-btn.gre-progress .gre-fab-ring,
#gpt-rescue-btn.gre-progress .gre-fab-badge { opacity: 1; }
#gpt-rescue-btn.gre-progress .gre-fab-icon { opacity: 0; }
#gpt-rescue-btn.gre-busy .gre-fab-icon { opacity: 0; animation: gre-pulse 1.1s ease-in-out infinite; }
#gpt-rescue-btn.gre-done { color: #10a37f; }
#gpt-rescue-btn.gre-error { color: #ef4444; }
#gpt-rescue-btn.gre-done .gre-fab-icon,
#gpt-rescue-btn.gre-error .gre-fab-icon { opacity: 0; }
#gpt-rescue-btn.gre-done .gre-fab-badge,
#gpt-rescue-btn.gre-error .gre-fab-badge { opacity: 1; }

#gpt-rescue-btn.gre-collapsed-right { transform: translateX(58%); }
#gpt-rescue-btn.gre-collapsed-left { transform: translateX(-58%); }
#gpt-rescue-btn.gre-collapsed-right:hover,
#gpt-rescue-btn.gre-collapsed-left:hover,
#gpt-rescue-btn.gre-collapsed-right:focus-visible,
#gpt-rescue-btn.gre-collapsed-left:focus-visible,
#gpt-rescue-btn.gre-busy,
#gpt-rescue-btn.gre-progress,
#gpt-rescue-btn.gre-dragging { transform: none; }

@keyframes gre-pulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

#gre-fab-status {
    position: fixed;
    z-index: 2147483000;
    max-width: 220px;
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, .08);
    background: rgba(255, 255, 255, .92);
    color: #0d0d0d;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, .14);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s;
}
#gre-fab-status.gre-visible { opacity: 1; }
html.dark #gre-fab-status {
    background: rgba(52, 53, 65, .94);
    border-color: rgba(255, 255, 255, .14);
    color: #ececec;
}
`;
      document.head.appendChild(style);
    }
    function createFabButton() {
      let btn = document.getElementById("gpt-rescue-btn");
      if (!btn) {
        btn = document.createElement("button");
        btn.id = "gpt-rescue-btn";
        btn.type = "button";
        document.body.appendChild(btn);
      }
      if (!btn.querySelector(".gre-fab-ring")) {
        btn.textContent = "";
        btn.removeAttribute("style");
        btn.setAttribute("aria-label", "ChatGPT Exporter：导出对话");
        btn.innerHTML = `<span class="gre-fab-ring"></span><span class="gre-fab-icon">${FAB_ICON_SVG}</span><span class="gre-fab-badge"></span>`;
      }
      return btn;
    }
    function bindFabEvents(btn) {
      if (btn.dataset.fabBound === "1") return;
      btn.dataset.fabBound = "1";
      btn.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        fabDragInfo = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          originX: fabState.x,
          originY: fabState.y,
          moved: false
        };
        try {
          btn.setPointerCapture(e.pointerId);
        } catch (_) {
        }
      });
      btn.addEventListener("pointermove", (e) => {
        if (!fabDragInfo || e.pointerId !== fabDragInfo.id) return;
        const dx = e.clientX - fabDragInfo.startX;
        const dy = e.clientY - fabDragInfo.startY;
        if (!fabDragInfo.moved) {
          if (Math.hypot(dx, dy) < FAB_DRAG_THRESHOLD) return;
          fabDragInfo.moved = true;
          btn.classList.add("gre-dragging");
          fabExpand(btn);
          document.getElementById("gre-fab-status")?.classList.remove("gre-visible");
        }
        fabApply(btn, fabClamp({ x: fabDragInfo.originX + dx, y: fabDragInfo.originY + dy }));
      });
      const endDrag = (e) => {
        if (!fabDragInfo || e && e.pointerId !== fabDragInfo.id) return;
        const wasMoved = fabDragInfo.moved;
        fabDragInfo = null;
        btn.classList.remove("gre-dragging");
        if (!wasMoved) return;
        fabSuppressClick = true;
        setTimeout(() => {
          fabSuppressClick = false;
        }, 100);
        fabApply(btn, fabSnap(fabClamp({ x: fabState.x, y: fabState.y })), true);
        fabScheduleCollapse(btn);
      };
      btn.addEventListener("pointerup", endDrag);
      btn.addEventListener("pointercancel", endDrag);
      btn.addEventListener("pointerenter", () => {
        clearTimeout(fabCollapseTimer);
        if (fabIsCollapsed(btn)) fabExpand(btn);
      });
      btn.addEventListener("pointerleave", () => fabScheduleCollapse(btn));
      btn.addEventListener("click", (e) => {
        if (fabSuppressClick) {
          fabSuppressClick = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (fabIsCollapsed(btn)) {
          fabExpand(btn);
          fabScheduleCollapse(btn);
          return;
        }
        if (activeExport) {
          highlightTaskPanel();
          return;
        }
        showExportDialog();
      });
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        fabExpand(btn);
        fabApply(btn, fabSnap(fabClamp(fabDefaultPosition())), true);
        const pill = fabStatusEl();
        pill.textContent = "已重置位置";
        pill.classList.add("gre-visible");
        fabPositionStatus(btn);
        setTimeout(() => {
          if (pill.textContent === "已重置位置") pill.classList.remove("gre-visible");
        }, 1500);
      });
      window.addEventListener("resize", () => {
        if (!document.body.contains(btn)) return;
        fabApply(btn, fabSnap(fabClamp({ x: fabState.x, y: fabState.y })), true);
      });
    }
    function getExportButton() {
      ensureFabStyle();
      const btn = createFabButton();
      bindFabEvents(btn);
      if (fabState.x == null || !btn.style.left || !btn.style.top) {
        const saved = fabState.x != null ? { ...fabState } : loadFabState();
        const candidate = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? { x: saved.x, y: saved.y } : fabDefaultPosition();
        fabApply(btn, fabSnap(fabClamp(candidate)));
        if (FAB_AUTO_COLLAPSE && saved?.collapsed && fabState.docked) fabCollapse(btn);
      }
      if (!activeExport) setFabStatus(btn, EXPORT_BUTTON_LABEL);
      btn.dataset.exporterVersion = EXPORTER_VERSION;
      return btn;
    }
    function initFab() {
      if (!document.body) {
        setTimeout(initFab, 200);
        return;
      }
      getExportButton();
    }
    let fabRecoveryTimer = null;
    function scheduleFabRecovery() {
      if (fabRecoveryTimer != null) return;
      fabRecoveryTimer = setTimeout(() => {
        fabRecoveryTimer = null;
        if (!document.body) return;
        if (!document.getElementById("gpt-rescue-btn") || !document.getElementById("gre-fab-style")) {
          try {
            initFab();
          } catch (error) {
            console.error("[ChatGPT Exporter] FAB recovery failed:", error);
          }
        }
      }, 100);
    }
    const fabObserver = new MutationObserver(() => {
      if (!document.body || document.getElementById("gpt-rescue-btn") && document.getElementById("gre-fab-style")) return;
      scheduleFabRecovery();
    });
    fabObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("pageshow", scheduleFabRecovery);
    let activeExport = null;
    function createCancelError() {
      const error = new Error("已取消导出");
      error.cancelled = true;
      error.stopsBatch = true;
      return error;
    }
    function createTaskSession(onProgress) {
      return {
        cancelled: false,
        progress(text) {
          onProgress?.(text);
        },
        throwIfCancelled() {
          if (this.cancelled) throw createCancelError();
        },
        async wait(ms, describe) {
          const until = Date.now() + ms;
          while (Date.now() < until) {
            this.throwIfCancelled();
            if (describe) this.progress(describe(Math.ceil((until - Date.now()) / 1e3)));
            await sleep(Math.min(1e3, until - Date.now()));
          }
          this.throwIfCancelled();
        }
      };
    }
    function cancelActiveExport() {
      if (!activeExport || activeExport.cancelled) return;
      activeExport.cancelled = true;
      activeExport.progress("正在停止…");
    }
    async function addConversationToZip(target, convData, context) {
      const { accountId, attachmentReport, session } = context;
      target.file(generateUniqueFilename(convData), JSON.stringify(convData, null, 2));
      const stageErrors = [];
      let attachmentResult = null;
      if (attachmentReport) {
        try {
          attachmentResult = await appendAttachmentsToZip(target, convData, accountId, session);
          attachmentReport.detected += attachmentResult.detected;
          attachmentReport.downloaded += attachmentResult.files.length;
          attachmentReport.failed += attachmentResult.failures.length;
          attachmentReport.conversations.push({
            conversation_id: convData?.conversation_id || null,
            title: convData?.title || "Untitled Conversation",
            detected: attachmentResult.detected,
            downloaded: attachmentResult.files,
            failures: attachmentResult.failures
          });
        } catch (error) {
          attachmentResult = null;
          stageErrors.push({ stage: "attachments", error });
        }
      }
      try {
        target.file(generateMarkdownFilename(convData), convertConversationToMarkdown(convData, attachmentResult));
      } catch (error) {
        stageErrors.push({ stage: "markdown", error });
      }
      return stageErrors;
    }
    function createExportErrorReport() {
      return {
        exporter_version: EXPORTER_VERSION,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        succeeded: 0,
        partial: 0,
        failed: 0,
        stopped_reason: null,
        issues: []
      };
    }
    function recordExportIssue(errorReport, entry, stage, error) {
      const message = error?.message || String(error);
      errorReport.issues.push({
        conversation_id: entry?.id || null,
        title: entry?.title || null,
        folder: entry?.folder || null,
        stage,
        error: message
      });
      console.error(`[ChatGPT Exporter] ${stage} 阶段失败 (${entry?.id || entry?.folder || "unknown"}):`, error);
    }
    async function exportConversationSafely(target, entry, context) {
      const { errorReport, session, accountId } = context;
      let convData;
      try {
        convData = await getConversation(entry.id, accountId, session);
      } catch (error) {
        if (error?.cancelled) {
          errorReport.stopped_reason = error.message;
          return { outcome: "stopped" };
        }
        errorReport.failed += 1;
        recordExportIssue(errorReport, entry, "fetch", error);
        if (error?.stopsBatch) {
          errorReport.stopped_reason = error.message;
          return { outcome: "stopped" };
        }
        return { outcome: "failed" };
      }
      const issueEntry = { ...entry, title: convData?.title || entry.title };
      const updateTime = normalizeEpochSeconds(convData?.update_time);
      let stageErrors;
      try {
        stageErrors = await addConversationToZip(target, convData, context);
      } catch (error) {
        errorReport.failed += 1;
        recordExportIssue(errorReport, issueEntry, "json", error);
        return { outcome: "failed" };
      }
      if (stageErrors.length === 0) {
        errorReport.succeeded += 1;
        return { outcome: "ok", updateTime };
      }
      errorReport.partial += 1;
      stageErrors.forEach(({ stage, error }) => recordExportIssue(errorReport, issueEntry, stage, error));
      return { outcome: "partial", updateTime };
    }
    function buildExportSummary(errorReport, { skippedUnchanged = 0, zipCreated = true } = {}) {
      const clean = errorReport.issues.length === 0 && !errorReport.stopped_reason;
      const lines = [];
      if (clean) {
        lines.push(`共导出 ${errorReport.succeeded} 个对话。`);
      } else {
        if (errorReport.stopped_reason) {
          lines.push(`导出已提前停止${zipCreated ? "，ZIP 中只包含停止前导出的对话" : ""}。原因：${errorReport.stopped_reason}`);
        }
        lines.push(`成功 ${errorReport.succeeded}，部分成功（已存 JSON，缺 Markdown 或附件）${errorReport.partial}，失败 ${errorReport.failed}。`);
        const listFailures = errorReport.issues.filter((issue) => issue.stage === "list").length;
        if (listFailures > 0) lines.push(`另有 ${listFailures} 处对话列表获取失败，可能漏掉了部分项目对话。`);
      }
      if (skippedUnchanged > 0) {
        lines.push(`增量导出：跳过了 ${skippedUnchanged} 个自上次导出后没有变化的对话。`);
      }
      if (!clean) {
        lines.push(zipCreated ? "详情见 ZIP 内的 export-error-report.json。" : "没有导出任何对话，因此没有生成 ZIP。详情请查看控制台。");
      }
      let title = "导出完成";
      if (!zipCreated) title = "导出失败";
      else if (errorReport.stopped_reason) title = "导出已停止";
      else if (!clean) title = "导出完成，部分内容失败";
      return { tone: clean ? "ok" : zipCreated ? "warn" : "error", title, message: lines.join("\n") };
    }
    const EXPORT_HISTORY_KEY = "chatgpt-exporter-history-v1";
    function exportHistoryStorageKey(accountId) {
      return `${EXPORT_HISTORY_KEY}:${accountId || "default"}`;
    }
    function loadExportHistory(accountId) {
      try {
        const saved = JSON.parse(localStorage.getItem(exportHistoryStorageKey(accountId)));
        if (saved && typeof saved.items === "object" && saved.items) {
          return { items: saved.items, lastExportAt: Number(saved.lastExportAt) || null };
        }
        if (saved && typeof saved === "object") return { items: saved, lastExportAt: null };
      } catch (_) {
      }
      return { items: {}, lastExportAt: null };
    }
    function saveExportHistory(accountId, history, exported) {
      exported.forEach(({ id, updateTime }) => {
        if (id && updateTime) history.items[id] = Math.max(updateTime, Number(history.items[id]) || 0);
      });
      history.lastExportAt = Date.now();
      try {
        localStorage.setItem(exportHistoryStorageKey(accountId), JSON.stringify(history));
      } catch (error) {
        console.warn("[ChatGPT Exporter] 保存增量导出记录失败:", error);
      }
    }
    function clearExportHistory(accountId) {
      try {
        localStorage.removeItem(exportHistoryStorageKey(accountId));
      } catch (_) {
      }
    }
    function exportStatusOf(entry, items) {
      const exportedAt = Number(items[entry.id]) || 0;
      if (!exportedAt) return "new";
      const updatedAt = normalizeEpochSeconds(entry.update_time) || 0;
      return updatedAt > exportedAt ? "updated" : "exported";
    }
    function isUnchangedSinceLastExport(entry, history) {
      return exportStatusOf(entry, history.items) === "exported" && Boolean(normalizeEpochSeconds(entry.update_time));
    }
    function formatShortDateTime(ms) {
      const date = new Date(ms);
      const pad = (value) => String(value).padStart(2, "0");
      const sameYear = date.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear();
      const day = sameYear ? `${date.getMonth() + 1}/${date.getDate()}` : `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    function describeExportHistory(history) {
      const count = Object.keys(history.items).length;
      if (count === 0) return "还没有导出记录，这次会导出全部对话";
      const last = history.lastExportAt ? ` · 上次导出 ${formatShortDateTime(history.lastExportAt)}` : "";
      return `已记录 ${count.toLocaleString()} 个对话${last}`;
    }
    function localDateStamp(date = /* @__PURE__ */ new Date()) {
      const pad = (value) => String(value).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    function buildZipFilename({ mode, workspaceId, selected, incremental }) {
      const kind = selected ? "selected" : incremental ? "incremental" : "backup";
      const space = mode === "team" ? "team" : mode === "project" ? "project" : "personal";
      const workspacePart = mode === "team" && workspaceId ? `_${workspaceId}` : "";
      return `chatgpt_${space}_${kind}${workspacePart}_${localDateStamp()}.zip`;
    }
    let resultSeq = 0;
    function showExportResult({ tone = "info", title, message }) {
      const panel = taskPanelEl();
      resultSeq += 1;
      panel.dataset.state = "result";
      panel.dataset.tone = tone;
      panel.dataset.resultSeq = String(resultSeq);
      panel.querySelector(".gre-task-title").textContent = title;
      panel.querySelector(".gre-task-body").textContent = message;
      panel.querySelector(".gre-task-count").textContent = "";
      panel.querySelector(".gre-progress-bar").hidden = true;
      panel.querySelector(".gre-task-actions").hidden = true;
      panel.querySelector(".gre-task-close").hidden = false;
    }
    async function exportConversations(options = {}) {
      const {
        mode = "personal",
        workspaceId = null,
        conversationEntries = null,
        includeAttachments = false,
        incremental = false
      } = options;
      if (activeExport) {
        showNotice("已有导出任务正在进行，可以在右下角的面板中停止。");
        return;
      }
      const btn = getExportButton();
      if (!await ensureAccessToken()) {
        showExportResult({ tone: "error", title: "无法开始导出", message: ACCESS_TOKEN_HINT });
        return;
      }
      const session = createTaskSession((text) => {
        setFabStatus(btn, text);
        showTaskProgress(text);
      });
      activeExport = session;
      const accountId = resolveWorkspaceId(workspaceId);
      const selected = Array.isArray(conversationEntries) && conversationEntries.length > 0;
      const errorReport = createExportErrorReport();
      const attachmentReport = includeAttachments ? {
        exporter_version: EXPORTER_VERSION,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        detected: 0,
        downloaded: 0,
        failed: 0,
        conversations: []
      } : null;
      let finalStatus = ["出错", "error"];
      try {
        let entries = conversationEntries;
        if (!selected) {
          session.progress("正在读取对话列表…");
          const listing = await collectConversationEntries({ mode, accountId, session });
          listing.problems.forEach(({ folder, error }) => recordExportIssue(errorReport, { folder }, "list", error));
          entries = listing.entries;
        }
        const history = loadExportHistory(accountId);
        let skippedUnchanged = 0;
        if (incremental && !selected) {
          const changed = entries.filter((entry) => !isUnchangedSinceLastExport(entry, history));
          skippedUnchanged = entries.length - changed.length;
          entries = changed;
        }
        if (entries.length === 0) {
          finalStatus = ["完成", "done"];
          const listProblems = errorReport.issues.length > 0 ? `
另有 ${errorReport.issues.length} 处对话列表获取失败，详情请查看控制台。` : "";
          showExportResult(skippedUnchanged > 0 ? { tone: "ok", title: "没有需要导出的对话", message: `${skippedUnchanged} 个对话自上次导出后都没有变化，没有生成 ZIP。${listProblems}` } : { tone: "info", title: "没有找到对话", message: `没有找到可以导出的对话。${listProblems}` });
          return;
        }
        const zip = new import_jszip.default();
        const exported = [];
        const context = { accountId, attachmentReport, errorReport, session };
        for (let i = 0; i < entries.length; i++) {
          if (session.cancelled) {
            errorReport.stopped_reason = "已取消导出";
            break;
          }
          const entry = entries[i];
          const label = entry?.title ? entry.title.slice(0, 40) : "对话";
          session.progress(`${label} (${i + 1}/${entries.length})`);
          const target = entry?.projectTitle ? zip.folder(sanitizeFilename(entry.projectTitle)) : zip;
          const { outcome, updateTime } = await exportConversationSafely(target, {
            id: entry.id,
            title: entry?.title || null,
            folder: entry?.projectTitle || null
          }, context);
          if (outcome === "ok" || outcome === "partial") {
            exported.push({ id: entry.id, updateTime: Math.max(Number(entry.update_time) || 0, updateTime || 0) });
          }
          if (outcome === "stopped") break;
          if (i < entries.length - 1) await sleep(jitter());
        }
        if (exported.length === 0) {
          showExportResult(buildExportSummary(errorReport, { skippedUnchanged, zipCreated: false }));
          return;
        }
        if (attachmentReport) {
          zip.file("attachment-export-report.json", JSON.stringify(attachmentReport, null, 2));
        }
        const hasIssues = errorReport.issues.length > 0 || Boolean(errorReport.stopped_reason);
        if (hasIssues) {
          zip.file("export-error-report.json", JSON.stringify(errorReport, null, 2));
        }
        let lastPercent = -1;
        const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" }, (meta) => {
          const percent = Math.floor(meta.percent);
          if (percent === lastPercent) return;
          lastPercent = percent;
          session.progress(`正在打包 ZIP (${percent}/100)`);
        });
        downloadFile(blob, buildZipFilename({ mode, workspaceId, selected, incremental: incremental && !selected }));
        saveExportHistory(accountId, history, exported);
        const summary = buildExportSummary(errorReport, { skippedUnchanged });
        if (attachmentReport) {
          summary.message += `
附件：检测 ${attachmentReport.detected}，成功 ${attachmentReport.downloaded}，失败 ${attachmentReport.failed}。`;
        }
        finalStatus = hasIssues ? ["部分完成", "error"] : ["完成", "done"];
        showExportResult(summary);
      } catch (error) {
        if (error?.cancelled) {
          finalStatus = ["已取消", "error"];
          showExportResult({ tone: "info", title: "已取消导出", message: "还没有导出任何对话，因此没有生成 ZIP。" });
        } else {
          console.error("导出过程中发生严重错误:", error);
          showExportResult({ tone: "error", title: "导出失败", message: `${error.message}
详情请查看控制台（F12 → Console）。` });
        }
      } finally {
        activeExport = null;
        setFabStatus(btn, ...finalStatus);
        setTimeout(() => {
          if (!activeExport) setFabStatus(btn, EXPORT_BUTTON_LABEL);
        }, 3e3);
      }
    }
    function startExportProcess(mode, workspaceId, options = {}) {
      return exportConversations({ mode, workspaceId, ...options });
    }
    function startSelectiveExportProcess(mode, workspaceId, conversationEntries, includeAttachments = false) {
      return exportConversations({ mode, workspaceId, conversationEntries, includeAttachments });
    }
    const RATE_LIMIT_RETRY_DELAYS = [15e3, 3e4, 6e4];
    const MAX_RETRY_AFTER_MS = 12e4;
    function createHttpError(message, status) {
      const error = new Error(message);
      error.status = status;
      error.stopsBatch = status === 401 || status === 429;
      return error;
    }
    function describeHttpFailure(label, status) {
      if (status === 429) {
        return `${label}：官方接口限流 (429)，重试后仍未恢复。请等待几分钟后再试，或减少单次导出的对话数量。`;
      }
      if (status === 401) {
        return `${label}：登录状态已失效 (401)，请刷新页面后重试。`;
      }
      return `${label} (${status})`;
    }
    function retryAfterMs(response) {
      const header = response.headers?.get?.("retry-after");
      if (header == null || header === "") return null;
      const seconds = Number(header);
      const ms = Number.isFinite(seconds) ? seconds * 1e3 : Date.parse(header) - Date.now();
      return Number.isFinite(ms) ? Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS) : null;
    }
    async function apiFetch(path, { accountId = null, session = null, label = "请求失败", init = {} } = {}) {
      const deviceId = getOaiDeviceId();
      if (!deviceId) {
        const error = new Error("无法获取 oai-device-id，请确保已登录并刷新页面。");
        error.stopsBatch = true;
        throw error;
      }
      let tokenRefreshed = false;
      let rateLimitRetries = 0;
      for (; ; ) {
        session?.throwIfCancelled();
        const headers = {
          ...init.headers || {},
          "Authorization": `Bearer ${accessToken}`,
          "oai-device-id": deviceId
        };
        if (accountId) headers["ChatGPT-Account-Id"] = accountId;
        const response = await fetch(path, { ...init, headers });
        if (response.ok) return response;
        if (response.status === 401 && !tokenRefreshed) {
          tokenRefreshed = true;
          if (await ensureAccessToken({ forceRefresh: true })) continue;
        }
        if (response.status === 429 && rateLimitRetries < RATE_LIMIT_RETRY_DELAYS.length) {
          const delay = retryAfterMs(response) ?? RATE_LIMIT_RETRY_DELAYS[rateLimitRetries];
          rateLimitRetries++;
          if (session) {
            await session.wait(delay, (seconds) => `接口限流，${seconds} 秒后重试…`);
          } else {
            await sleep(delay);
          }
          continue;
        }
        throw createHttpError(describeHttpFailure(label, response.status), response.status);
      }
    }
    function normalizeProjectSpaceItem(item) {
      const rawGizmo = item?.gizmo?.gizmo || item?.gizmo || item;
      const display = rawGizmo?.display || item?.gizmo?.display || item?.display;
      const id = rawGizmo?.id || item?.gizmo?.id || item?.id;
      const title = display?.name || rawGizmo?.name || "Untitled Project";
      if (!id) return null;
      return {
        id,
        title,
        conversations: item?.conversations?.items || []
      };
    }
    function resolveWorkspaceId(workspaceId) {
      if (workspaceId) return workspaceId;
      const match = document.cookie.match(/(?:^|; )_account=([^;]+)/);
      if (match?.[1]) return match[1];
      const detectedIds = detectAllWorkspaceIds();
      return detectedIds.length > 0 ? detectedIds[0] : null;
    }
    function upsertConversationEntry(map, item, extra = {}) {
      if (!item?.id) return;
      const create_time = normalizeEpochSeconds(item.create_time || 0);
      const update_time = normalizeEpochSeconds(item.update_time || item.create_time || 0);
      const entry = {
        id: item.id,
        title: item.title || "Untitled Conversation",
        create_time,
        update_time,
        is_archived: item.is_archived ?? extra.is_archived ?? false,
        projectId: extra.projectId || null,
        projectTitle: extra.projectTitle || null
      };
      const existing = map.get(entry.id);
      if (!existing) {
        map.set(entry.id, entry);
        return;
      }
      if (!existing.projectTitle && entry.projectTitle) {
        existing.projectTitle = entry.projectTitle;
        existing.projectId = entry.projectId;
      }
      if (!existing.create_time && entry.create_time) {
        existing.create_time = entry.create_time;
      }
      existing.is_archived = existing.is_archived || entry.is_archived;
      if ((entry.update_time || 0) > (existing.update_time || 0)) {
        existing.update_time = entry.update_time;
      }
      if (existing.title === "Untitled Conversation" && entry.title) {
        existing.title = entry.title;
      }
    }
    async function listProjects(accountId, session, query = {}) {
      const projects = /* @__PURE__ */ new Map();
      let cursor = null;
      do {
        const params = new URLSearchParams({ limit: String(PROJECT_SIDEBAR_LIMIT) });
        if (query.conversationsPerGizmo !== void 0) {
          params.set("conversations_per_gizmo", String(query.conversationsPerGizmo));
        }
        if (query.ownedOnly !== void 0) {
          params.set("owned_only", query.ownedOnly ? "true" : "false");
        }
        if (cursor) params.set("cursor", cursor);
        const response = await apiFetch(`/backend-api/gizmos/snorlax/sidebar?${params}`, {
          accountId,
          session,
          label: "获取项目列表失败"
        });
        const data = await response.json();
        (data.items || []).forEach((item) => {
          const project = normalizeProjectSpaceItem(item);
          if (project) projects.set(project.id, project);
        });
        cursor = data.cursor || null;
        if (cursor) await sleep(jitter());
      } while (cursor);
      return Array.from(projects.values());
    }
    async function listRootConversations(map, accountId, session) {
      for (const isArchived of [false, true]) {
        let offset = 0;
        for (; ; ) {
          const query = `offset=${offset}&limit=${PAGE_LIMIT}&order=updated${isArchived ? "&is_archived=true" : ""}`;
          const response = await apiFetch(`/backend-api/conversations?${query}`, {
            accountId,
            session,
            label: "获取对话列表失败"
          });
          const data = await response.json();
          const items = Array.isArray(data.items) ? data.items : [];
          const sizeBefore = map.size;
          items.forEach((item) => upsertConversationEntry(map, item, { is_archived: isArchived }));
          offset += items.length;
          session?.progress(`正在读取对话列表，已找到 ${map.size} 个`);
          const reachedEnd = items.length === 0 || map.size === sizeBefore || Number.isFinite(data.total) && offset >= data.total;
          if (reachedEnd) break;
          await sleep(jitter());
        }
      }
    }
    async function listProjectConversations(map, project, accountId, session) {
      const extra = { projectId: project.id, projectTitle: project.title };
      let cursor = "0";
      let fetchedAny = false;
      do {
        let response;
        try {
          response = await apiFetch(`/backend-api/gizmos/${project.id}/conversations?cursor=${cursor}`, {
            accountId,
            session,
            label: `获取项目「${project.title}」的对话列表失败`
          });
        } catch (error) {
          if (fetchedAny || error?.stopsBatch || !project.conversations?.length) throw error;
          project.conversations.forEach((item) => upsertConversationEntry(map, item, extra));
          return new Error(`${error.message}，已改用侧边栏中的 ${project.conversations.length} 个预览对话`);
        }
        const data = await response.json();
        (data.items || []).forEach((item) => upsertConversationEntry(map, item, extra));
        fetchedAny = true;
        cursor = data.cursor || null;
        if (cursor) await sleep(jitter());
      } while (cursor);
      return null;
    }
    async function collectConversationEntries({ mode, accountId, session = null }) {
      const map = /* @__PURE__ */ new Map();
      const problems = [];
      if (mode !== "project") {
        await listRootConversations(map, accountId, session);
      }
      let projects = [];
      try {
        session?.progress("正在读取项目列表…");
        const query = mode === "team" ? {} : { conversationsPerGizmo: PROJECT_SIDEBAR_PREVIEW, ownedOnly: true };
        projects = await listProjects(accountId, session, query);
      } catch (error) {
        if (mode === "project" || error?.stopsBatch) throw error;
        problems.push({ folder: null, error });
      }
      for (const project of projects) {
        session?.progress(`正在读取项目「${project.title}」，已找到 ${map.size} 个`);
        try {
          const warning = await listProjectConversations(map, project, accountId, session);
          if (warning) problems.push({ folder: project.title, error: warning });
        } catch (error) {
          if (error?.stopsBatch) throw error;
          problems.push({ folder: project.title, error });
        }
      }
      const entries = Array.from(map.values()).sort((a, b) => (b.update_time || 0) - (a.update_time || 0));
      return { entries, problems };
    }
    async function getConversation(id, accountId, session = null) {
      const response = await apiFetch(`/backend-api/conversation/${id}`, {
        accountId,
        session,
        label: `获取对话详情失败 conv ${id}`
      });
      const data = await response.json();
      data.__fetched_at = (/* @__PURE__ */ new Date()).toISOString();
      return data;
    }
    function detectAllWorkspaceIds() {
      const foundIds = new Set(capturedWorkspaceIds);
      try {
        const data = JSON.parse(document.getElementById("__NEXT_DATA__").textContent);
        const accounts = data?.props?.pageProps?.user?.accounts;
        if (accounts) {
          Object.values(accounts).forEach((acc) => {
            if (acc?.account?.id) {
              foundIds.add(acc.account.id);
            }
          });
        }
      } catch (e) {
      }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes("account") || key.includes("workspace"))) {
            const value = localStorage.getItem(key);
            if (value && /^[a-z0-9]{2,}-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.replace(/"/g, ""))) {
              const extractedId = value.match(/ws-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
              if (extractedId) foundIds.add(extractedId[0]);
            } else if (value && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.replace(/"/g, ""))) {
              foundIds.add(value.replace(/"/g, ""));
            }
          }
        }
      } catch (e) {
      }
      console.log("🔍 检测到以下 Workspace IDs:", Array.from(foundIds));
      return Array.from(foundIds);
    }
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
    const ICONS = {
      close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
      check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
      search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
    };
    function ensureUiStyle() {
      if (document.getElementById("gre-ui-style")) return;
      const style = document.createElement("style");
      style.id = "gre-ui-style";
      style.textContent = `
.gre-theme {
    --gre-bg: #fff; --gre-elev: #fff; --gre-fg: #0d0d0d; --gre-muted: #5d5d5d; --gre-faint: #8f8f8f;
    --gre-line: rgba(13, 13, 13, .1); --gre-line-strong: rgba(13, 13, 13, .2); --gre-hover: rgba(13, 13, 13, .05);
    --gre-ink: #0d0d0d; --gre-ink-fg: #fff; --gre-danger: #d93025;
    --gre-shadow: 0 1px 2px rgba(0, 0, 0, .06), 0 10px 30px rgba(0, 0, 0, .12);
    font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 14px; line-height: 1.5; color: var(--gre-fg); color-scheme: light;
    -webkit-font-smoothing: antialiased;
}
html.dark .gre-theme {
    --gre-bg: #2f2f2f; --gre-elev: #383838; --gre-fg: #ececec; --gre-muted: #b4b4b4; --gre-faint: #8e8e8e;
    --gre-line: rgba(255, 255, 255, .1); --gre-line-strong: rgba(255, 255, 255, .22); --gre-hover: rgba(255, 255, 255, .07);
    --gre-ink: #ececec; --gre-ink-fg: #0d0d0d; --gre-danger: #ff7b72;
    --gre-shadow: 0 1px 2px rgba(0, 0, 0, .3), 0 12px 32px rgba(0, 0, 0, .45);
    color-scheme: dark;
}
.gre-theme *, .gre-theme *::before, .gre-theme *::after { box-sizing: border-box; }
.gre-theme [hidden] { display: none !important; }
/* :where() 不增加优先级，组件自己的 class 规则才能覆盖这些基础样式 */
:where(.gre-theme) button { margin: 0; font: inherit; color: inherit; }
:where(.gre-theme) svg { display: block; flex: none; }
.gre-theme :focus-visible { outline: 2px solid var(--gre-ink); outline-offset: 2px; }
.gre-theme .gre-input:focus-visible { outline: none; }

.gre-overlay {
    position: fixed; inset: 0; z-index: 2147483010; padding: 16px;
    display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .4);
}
html.dark .gre-overlay { background: rgba(0, 0, 0, .6); }
.gre-dialog {
    position: relative; display: flex; flex-direction: column; width: 100%; max-width: 400px;
    max-height: calc(100vh - 32px); background: var(--gre-bg); border-radius: 16px; box-shadow: var(--gre-shadow);
}
html.dark .gre-dialog { box-shadow: var(--gre-shadow), inset 0 0 0 1px var(--gre-line); }
.gre-dialog.gre-wide { max-width: 680px; height: min(760px, calc(100vh - 32px)); }
.gre-head { display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px; }
.gre-head h2 { margin: 0; font-size: 17px; font-weight: 600; line-height: 1.3; color: var(--gre-fg); }
.gre-sub { color: var(--gre-faint); font-size: 13px; }
.gre-icon-btn {
    display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin: -6px -8px -6px auto;
    padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--gre-muted); cursor: pointer;
}
.gre-icon-btn:hover { background: var(--gre-hover); color: var(--gre-fg); }
.gre-body { padding: 0 20px 4px; }
.gre-foot { display: flex; align-items: center; gap: 8px; padding: 16px 20px 18px; }
.gre-foot.gre-divided { border-top: 1px solid var(--gre-line); padding-top: 14px; }
.gre-spacer { flex: 1; }

.gre-seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 2px; padding: 3px; border-radius: 10px; background: var(--gre-hover); }
.gre-seg button {
    height: 32px; padding: 0; border: 0; border-radius: 7px; background: transparent;
    color: var(--gre-muted); font-size: 14px; cursor: pointer; transition: background-color .15s, color .15s;
}
.gre-seg button:hover { color: var(--gre-fg); }
.gre-seg button[aria-checked="true"] { background: var(--gre-bg); color: var(--gre-fg); font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, .1); }
html.dark .gre-seg button[aria-checked="true"] { background: var(--gre-elev); }

.gre-rows { margin-top: 10px; }
.gre-rows > * + * { border-top: 1px solid var(--gre-line); }
.gre-toggle {
    display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 0;
    border: 0; background: transparent; text-align: left; cursor: pointer;
}
.gre-toggle-text { flex: 1; }
.gre-switch { position: relative; flex: none; width: 32px; height: 20px; border-radius: 999px; background: var(--gre-line-strong); transition: background-color .15s; }
.gre-switch::after {
    content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, .25); transition: transform .15s;
}
[aria-checked="true"] > .gre-switch { background: var(--gre-ink); }
[aria-checked="true"] > .gre-switch::after { transform: translateX(12px); background: var(--gre-ink-fg); }
.gre-foot .gre-toggle { width: auto; padding: 0; flex-direction: row-reverse; gap: 8px; color: var(--gre-muted); font-size: 13px; }
.gre-field { display: flex; align-items: center; gap: 12px; padding: 12px 0 0; }
.gre-field-label { color: var(--gre-muted); flex: none; }
.gre-field .gre-dd, .gre-field .gre-input { flex: 1; min-width: 0; }
.gre-field .gre-chip { width: 100%; min-width: 0; justify-content: space-between; }
.gre-field .gre-chip > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.gre-dialog:focus { outline: none; }
.gre-history { display: flex; align-items: baseline; gap: 10px; margin-top: -4px; padding: 0 0 8px; }

.gre-btn {
    display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 16px;
    border: 1px solid var(--gre-line-strong); border-radius: 999px; background: transparent;
    color: var(--gre-fg); font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer;
    transition: background-color .15s, opacity .15s;
}
.gre-btn:hover:not(:disabled) { background: var(--gre-hover); }
.gre-btn:disabled { opacity: .35; cursor: default; }
.gre-btn-primary { border-color: transparent; background: var(--gre-ink); color: var(--gre-ink-fg); }
.gre-btn-primary:hover:not(:disabled) { background: var(--gre-ink); opacity: .85; }
.gre-btn-ghost { border-color: transparent; }
.gre-link {
    padding: 0; border: 0; background: transparent; color: var(--gre-muted); font-size: 13px; cursor: pointer;
    text-decoration: underline; text-decoration-color: var(--gre-line-strong); text-underline-offset: 3px;
}
.gre-link:hover:not(:disabled) { color: var(--gre-fg); }
.gre-link:disabled { text-decoration: none; cursor: default; }

.gre-input {
    height: 36px; padding: 0 12px; border: 1px solid var(--gre-line-strong); border-radius: 10px; outline: none;
    background: transparent; color: var(--gre-fg); font: inherit; font-size: 14px; min-width: 0;
}
.gre-input:focus { border-color: var(--gre-ink); }
.gre-input::placeholder { color: var(--gre-faint); }
.gre-search { position: relative; display: flex; align-items: center; margin: 0; }
.gre-search svg { position: absolute; left: 12px; color: var(--gre-faint); pointer-events: none; }
.gre-search .gre-input { width: 100%; padding-left: 36px; }

.gre-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.gre-dd { position: relative; }
.gre-chip {
    display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 8px 0 12px;
    border: 1px solid var(--gre-line-strong); border-radius: 999px; background: transparent;
    color: var(--gre-fg); font-size: 13px; white-space: nowrap; cursor: pointer; transition: background-color .15s, border-color .15s;
}
.gre-chip-k { color: var(--gre-muted); }
.gre-chip svg { color: var(--gre-faint); }
.gre-chip:hover, .gre-chip[aria-expanded="true"] { background: var(--gre-hover); }
.gre-chip[data-active="true"] { border-color: var(--gre-ink); }
.gre-menu {
    position: absolute; top: calc(100% + 4px); left: 0; z-index: 5; min-width: 100%; padding: 4px;
    border: 1px solid var(--gre-line); border-radius: 12px; background: var(--gre-elev); box-shadow: var(--gre-shadow);
}
.gre-menu button {
    display: flex; align-items: center; gap: 16px; width: 100%; height: 32px; padding: 0 10px;
    border: 0; border-radius: 8px; background: transparent; font-size: 13px; text-align: left; white-space: nowrap; cursor: pointer;
}
.gre-menu button:hover, .gre-menu button:focus-visible { background: var(--gre-hover); outline: none; }
.gre-menu button svg { margin-left: auto; visibility: hidden; }
.gre-menu button[aria-checked="true"] svg { visibility: visible; }
.gre-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.gre-range { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.gre-range .gre-input { height: 32px; font-size: 13px; }

.gre-listhead { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 10px 20px; border-top: 1px solid var(--gre-line); border-bottom: 1px solid var(--gre-line); }
.gre-selectall { display: inline-flex; align-items: center; gap: 12px; padding: 0; border: 0; background: transparent; font-size: 13px; font-weight: 500; cursor: pointer; }
.gre-selectall:disabled { opacity: .4; cursor: default; }
.gre-count { color: var(--gre-muted); font-size: 13px; }
.gre-count.gre-error { color: var(--gre-danger); }
.gre-listhead .gre-link { margin-left: auto; }
.gre-list { flex: 1; min-height: 120px; overflow: auto; padding: 4px 8px; }
.gre-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 10px; cursor: pointer; user-select: none; -webkit-user-select: none; }
.gre-item:hover { background: var(--gre-hover); }
.gre-item:focus-visible { outline-offset: -2px; }
.gre-item-main { flex: 1; min-width: 0; }
.gre-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gre-item-meta { margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--gre-faint); font-size: 12px; }
.gre-item-date { flex: none; color: var(--gre-faint); font-size: 12px; font-variant-numeric: tabular-nums; }
.gre-box {
    display: inline-flex; align-items: center; justify-content: center; flex: none; width: 18px; height: 18px;
    border: 1.5px solid var(--gre-faint); border-radius: 5px; color: var(--gre-ink-fg);
    transition: background-color .12s, border-color .12s;
}
[aria-checked="true"] > .gre-box, [aria-checked="mixed"] > .gre-box { background: var(--gre-ink); border-color: var(--gre-ink); }
.gre-box svg, .gre-box i { display: none; }
[aria-checked="true"] > .gre-box svg { display: block; }
[aria-checked="mixed"] > .gre-box i { display: block; width: 8px; height: 2px; border-radius: 1px; background: currentColor; }
.gre-empty { padding: 48px 12px; text-align: center; color: var(--gre-faint); }
.gre-more { display: flex; margin: 8px auto; height: 30px; font-size: 13px; }
.gre-error { color: var(--gre-danger); font-size: 13px; }

#gre-task-panel {
    position: fixed; right: 16px; bottom: 16px; z-index: 2147483020; width: min(340px, calc(100vw - 32px));
    padding: 14px 16px; border: 1px solid var(--gre-line); border-radius: 14px; background: var(--gre-bg); box-shadow: var(--gre-shadow);
}
#gre-task-panel.gre-attention { animation: gre-attention .45s ease 2; }
@keyframes gre-attention { 50% { box-shadow: 0 0 0 3px var(--gre-ink), var(--gre-shadow); } }
.gre-task-head { display: flex; align-items: center; gap: 8px; min-height: 22px; }
.gre-task-title { font-weight: 600; }
#gre-task-panel[data-tone="error"] .gre-task-title { color: var(--gre-danger); }
.gre-task-count { margin-left: auto; color: var(--gre-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.gre-task-close { width: 28px; height: 28px; }
.gre-task-body { margin-top: 2px; max-height: 40vh; overflow: auto; color: var(--gre-muted); font-size: 13px; white-space: pre-wrap; word-break: break-word; }
.gre-progress-bar { height: 4px; margin-top: 12px; overflow: hidden; border-radius: 999px; background: var(--gre-hover); }
.gre-progress-bar > span { display: block; width: 0; height: 100%; border-radius: inherit; background: var(--gre-ink); transition: width .2s; }
.gre-task-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.gre-task-actions .gre-btn { height: 30px; padding: 0 14px; font-size: 13px; }
#gre-toast {
    position: fixed; left: 50%; bottom: 24px; z-index: 2147483030; max-width: calc(100vw - 32px); transform: translateX(-50%);
    padding: 10px 16px; border-radius: 12px; background: var(--gre-ink); color: var(--gre-ink-fg); font-size: 13px; box-shadow: var(--gre-shadow);
}
@media (max-width: 560px) {
    .gre-dialog.gre-wide { height: calc(100vh - 32px); }
    .gre-item-date { display: none; }
}
`;
      document.head.appendChild(style);
    }
    let activeMenu = null;
    function closeActiveMenu() {
      if (!activeMenu) return false;
      activeMenu.close();
      return true;
    }
    function openModal({ wide = false, labelledBy = null, onRequestClose }) {
      ensureUiStyle();
      const existing = document.getElementById("export-dialog-overlay");
      if (existing) existing.__greClose ? existing.__greClose() : existing.remove();
      const overlay = document.createElement("div");
      overlay.id = "export-dialog-overlay";
      overlay.className = "gre-theme gre-overlay";
      const dialog = document.createElement("div");
      dialog.id = "export-dialog";
      dialog.className = wide ? "gre-dialog gre-wide" : "gre-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      if (labelledBy) dialog.setAttribute("aria-labelledby", labelledBy);
      overlay.appendChild(dialog);
      let pressedOnOverlay = false;
      overlay.addEventListener("mousedown", (e) => {
        pressedOnOverlay = e.target === overlay;
      });
      overlay.addEventListener("click", (e) => {
        if (pressedOnOverlay && e.target === overlay) onRequestClose();
        pressedOnOverlay = false;
      });
      const onKeydown = (e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        if (!closeActiveMenu()) onRequestClose();
      };
      document.addEventListener("keydown", onKeydown, true);
      const close = () => {
        closeActiveMenu();
        document.removeEventListener("keydown", onKeydown, true);
        overlay.remove();
      };
      overlay.__greClose = close;
      document.body.appendChild(overlay);
      return { overlay, dialog, close };
    }
    function createDropdown({ id, label, options, value, onChange, renderValue = null }) {
      const wrap = document.createElement("div");
      wrap.className = "gre-dd";
      const chip = document.createElement("button");
      chip.type = "button";
      chip.id = id;
      chip.className = "gre-chip";
      chip.setAttribute("aria-haspopup", "menu");
      chip.setAttribute("aria-expanded", "false");
      const menu = document.createElement("div");
      menu.className = "gre-menu";
      menu.setAttribute("role", "menu");
      wrap.appendChild(chip);
      let current = value;
      const labelText = () => typeof label === "function" ? label() : label;
      const render = () => {
        const option = options.find((item) => item.value === current) || options[0];
        const valueHtml = renderValue ? renderValue(option) : escapeHtml(option.label);
        const key = labelText();
        chip.innerHTML = `${key ? `<span class="gre-chip-k">${escapeHtml(key)}</span>` : ""}<span>${valueHtml}</span>${ICONS.chevron}`;
        chip.dataset.active = String(Boolean(key) && current !== options[0].value);
      };
      const onOutside = (e) => {
        if (!wrap.contains(e.target)) api.close();
      };
      const api = {
        el: wrap,
        get value() {
          return current;
        },
        refresh: render,
        close() {
          menu.remove();
          chip.setAttribute("aria-expanded", "false");
          document.removeEventListener("mousedown", onOutside, true);
          if (activeMenu === api) activeMenu = null;
        }
      };
      const open = () => {
        closeActiveMenu();
        menu.innerHTML = "";
        options.forEach((option) => {
          const item = document.createElement("button");
          item.type = "button";
          item.setAttribute("role", "menuitemradio");
          item.setAttribute("aria-checked", String(option.value === current));
          item.dataset.value = option.value;
          item.innerHTML = `<span>${renderValue ? renderValue(option) : escapeHtml(option.label)}</span>${ICONS.check}`;
          item.onclick = () => {
            api.close();
            chip.focus();
            if (option.value === current) return;
            current = option.value;
            render();
            onChange(current);
          };
          menu.appendChild(item);
        });
        menu.onkeydown = (e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          const items = [...menu.children];
          const index = items.indexOf(document.activeElement);
          items[(index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
        };
        wrap.appendChild(menu);
        chip.setAttribute("aria-expanded", "true");
        document.addEventListener("mousedown", onOutside, true);
        activeMenu = api;
        (menu.querySelector('[aria-checked="true"]') || menu.firstElementChild)?.focus();
      };
      chip.onclick = () => activeMenu === api ? api.close() : open();
      render();
      return api;
    }
    const toggleHtml = (id, text, on) => `
        <button type="button" id="${id}" class="gre-toggle" role="switch" aria-checked="${on ? "true" : "false"}">
            <span class="gre-toggle-text">${text}</span><span class="gre-switch"></span>
        </button>`;
    function bindToggle(el, onChange) {
      el.onclick = () => {
        const next = el.getAttribute("aria-checked") !== "true";
        el.setAttribute("aria-checked", String(next));
        onChange(next);
      };
    }
    function taskPanelEl() {
      ensureUiStyle();
      let panel = document.getElementById("gre-task-panel");
      if (panel) return panel;
      panel = document.createElement("div");
      panel.id = "gre-task-panel";
      panel.className = "gre-theme";
      panel.setAttribute("role", "status");
      panel.setAttribute("aria-live", "polite");
      panel.innerHTML = `
            <div class="gre-task-head">
                <span class="gre-task-title"></span>
                <span class="gre-task-count"></span>
                <button type="button" class="gre-icon-btn gre-task-close" aria-label="关闭" hidden>${ICONS.close}</button>
            </div>
            <div class="gre-task-body"></div>
            <div class="gre-progress-bar" hidden><span></span></div>
            <div class="gre-task-actions" hidden><button type="button" class="gre-btn gre-task-stop">停止</button></div>`;
      panel.querySelector(".gre-task-close").onclick = () => panel.remove();
      panel.querySelector(".gre-task-stop").onclick = cancelActiveExport;
      document.body.appendChild(panel);
      return panel;
    }
    function highlightTaskPanel() {
      const panel = document.getElementById("gre-task-panel");
      if (!panel) return;
      panel.classList.remove("gre-attention");
      void panel.offsetWidth;
      panel.classList.add("gre-attention");
      panel.addEventListener("animationend", () => panel.classList.remove("gre-attention"), { once: true });
    }
    function showTaskProgress(text) {
      const panel = taskPanelEl();
      panel.dataset.state = "progress";
      panel.dataset.tone = "info";
      const progress = parseProgress(text);
      const packing = text.startsWith("正在打包");
      panel.querySelector(".gre-task-title").textContent = packing ? "正在打包" : "正在导出";
      panel.querySelector(".gre-task-count").textContent = !progress ? "" : packing ? `${progress.current}%` : `${progress.current} / ${progress.total}`;
      panel.querySelector(".gre-task-body").textContent = progress ? progress.label : text;
      const bar = panel.querySelector(".gre-progress-bar");
      bar.hidden = !progress;
      if (progress) bar.firstElementChild.style.width = `${progress.pct}%`;
      panel.querySelector(".gre-task-actions").hidden = false;
      const stop = panel.querySelector(".gre-task-stop");
      stop.disabled = Boolean(activeExport?.cancelled);
      stop.textContent = activeExport?.cancelled ? "正在停止…" : "停止";
      panel.querySelector(".gre-task-close").hidden = true;
    }
    let toastTimer = null;
    function showNotice(message) {
      ensureUiStyle();
      let toast = document.getElementById("gre-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "gre-toast";
        toast.className = "gre-theme";
        toast.setAttribute("role", "alert");
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.remove(), 6e3);
    }
    const SPACE_LABELS = { personal: "个人空间", project: "项目空间", team: "团队空间" };
    const formatDate = (value) => {
      const seconds = normalizeEpochSeconds(value);
      return seconds ? new Date(seconds * 1e3).toLocaleDateString() : "";
    };
    function showConversationPicker(options = {}) {
      const { mode = "personal", workspaceId = null, includeAttachments = false, incremental = false } = options;
      const state = {
        loading: true,
        loadError: null,
        listWarning: null,
        list: [],
        filtered: [],
        selected: /* @__PURE__ */ new Set(),
        anchorIndex: null,
        query: "",
        sort: "update-desc",
        scope: "all",
        archived: "all",
        timeRange: "all",
        exportStatus: "all",
        startDate: "",
        endDate: "",
        pageSize: 100,
        visibleCount: 100,
        includeAttachments: Boolean(includeAttachments)
      };
      const timeField = () => state.sort.startsWith("create") ? "create_time" : "update_time";
      const history = loadExportHistory(resolveWorkspaceId(workspaceId));
      const hasHistory = Object.keys(history.items).length > 0;
      const STATUS_LABELS = { new: "未导出", updated: "有更新" };
      const listSession = createTaskSession((text) => {
        if (state.loading) statusEl.textContent = text;
      });
      const closeDialog = () => {
        listSession.cancelled = true;
        modal.close();
      };
      const requestClose = () => {
        if (state.selected.size > 0 && !confirm(`关闭后会丢失已选的 ${state.selected.size} 个对话，确定关闭吗？`)) return;
        closeDialog();
      };
      const modal = openModal({ wide: true, labelledBy: "gre-picker-title", onRequestClose: requestClose });
      const { dialog } = modal;
      dialog.innerHTML = `
            <div class="gre-head">
                <h2 id="gre-picker-title">选择对话</h2>
                <span class="gre-sub">${SPACE_LABELS[mode] || SPACE_LABELS.personal}</span>
                <button type="button" id="gre-close-btn" class="gre-icon-btn" aria-label="关闭">${ICONS.close}</button>
            </div>
            <div class="gre-body">
                <label class="gre-search">${ICONS.search}
                    <input id="conv-search" class="gre-input" type="search" placeholder="搜索标题、项目或 ID" aria-label="搜索对话" autocomplete="off">
                </label>
                <div id="gre-filters" class="gre-filters"></div>
                <div id="gre-range" class="gre-range" hidden>
                    <input id="filter-start-date" class="gre-input" type="date" aria-label="开始日期">
                    <span class="gre-count">至</span>
                    <input id="filter-end-date" class="gre-input" type="date" aria-label="结束日期">
                </div>
            </div>
            <div class="gre-listhead">
                <button type="button" id="select-all-btn" class="gre-selectall" role="checkbox" aria-checked="false" disabled>
                    <span class="gre-box">${ICONS.check}<i></i></span>全选
                </button>
                <span id="conv-status" class="gre-count" role="status">正在加载…</span>
                <button type="button" id="clear-all-btn" class="gre-link" hidden>清除选择</button>
            </div>
            <div id="conv-list" class="gre-list" role="group" aria-labelledby="gre-picker-title"></div>
            <div class="gre-foot gre-divided">
                ${toggleHtml("include-attachments-picker", "包含附件", state.includeAttachments)}
                <span class="gre-spacer"></span>
                <button type="button" id="back-btn" class="gre-btn gre-btn-ghost">返回</button>
                <button type="button" id="export-selected-btn" class="gre-btn gre-btn-primary" disabled>导出</button>
            </div>
        `;
      const $ = (selector) => dialog.querySelector(selector);
      const statusEl = $("#conv-status");
      const listEl = $("#conv-list");
      const selectAllBtn = $("#select-all-btn");
      const clearAllBtn = $("#clear-all-btn");
      const exportBtn = $("#export-selected-btn");
      const rangeEl = $("#gre-range");
      const refilter = () => {
        applyFilters();
        renderList();
      };
      const filtersEl = $("#gre-filters");
      const timeDropdown = createDropdown({
        id: "filter-time",
        label: () => timeField() === "create_time" ? "创建于" : "更新于",
        value: "all",
        options: [
          { value: "all", label: "不限" },
          { value: "7", label: "最近 7 天" },
          { value: "30", label: "最近 30 天" },
          { value: "90", label: "最近 90 天" },
          { value: "year", label: "今年" },
          { value: "custom", label: "自定义" }
        ],
        onChange: (value) => {
          state.timeRange = value;
          rangeEl.hidden = value !== "custom";
          refilter();
        }
      });
      const sortDropdown = createDropdown({
        id: "filter-sort",
        label: "排序",
        value: state.sort,
        options: [
          { value: "update-desc", label: "最近更新" },
          { value: "create-desc", label: "最近创建" },
          { value: "create-asc", label: "最早创建" }
        ],
        onChange: (value) => {
          state.sort = value;
          timeDropdown.refresh();
          refilter();
        }
      });
      filtersEl.appendChild(sortDropdown.el);
      if (mode !== "project") {
        filtersEl.appendChild(createDropdown({
          id: "filter-scope",
          label: "范围",
          value: "all",
          options: [
            { value: "all", label: "全部" },
            { value: "project", label: "项目内" },
            { value: "root", label: "项目外" }
          ],
          onChange: (value) => {
            state.scope = value;
            refilter();
          }
        }).el);
      }
      filtersEl.appendChild(createDropdown({
        id: "filter-archived",
        label: "状态",
        value: "all",
        options: [
          { value: "all", label: "全部" },
          { value: "active", label: "未归档" },
          { value: "archived", label: "已归档" }
        ],
        onChange: (value) => {
          state.archived = value;
          refilter();
        }
      }).el);
      filtersEl.appendChild(timeDropdown.el);
      if (hasHistory) {
        filtersEl.appendChild(createDropdown({
          id: "filter-export-status",
          label: "导出状态",
          value: "all",
          options: [
            { value: "all", label: "全部" },
            { value: "changed", label: "有变化" },
            { value: "exported", label: "已导出" }
          ],
          onChange: (value) => {
            state.exportStatus = value;
            refilter();
          }
        }).el);
      }
      $("#gre-close-btn").onclick = requestClose;
      $("#conv-search").oninput = (e) => {
        state.query = e.target.value || "";
        refilter();
      };
      $("#filter-start-date").onchange = (e) => {
        state.startDate = e.target.value || "";
        refilter();
      };
      $("#filter-end-date").onchange = (e) => {
        state.endDate = e.target.value || "";
        refilter();
      };
      bindToggle($("#include-attachments-picker"), (value) => {
        state.includeAttachments = value;
      });
      selectAllBtn.onclick = () => {
        const allSelected = state.filtered.length > 0 && state.filtered.every((item) => state.selected.has(item.id));
        state.filtered.forEach((item) => allSelected ? state.selected.delete(item.id) : state.selected.add(item.id));
        refreshSelection();
      };
      clearAllBtn.onclick = () => {
        state.selected.clear();
        state.anchorIndex = null;
        refreshSelection();
      };
      $("#back-btn").onclick = () => {
        closeDialog();
        showExportDialog({ space: mode, includeAttachments: state.includeAttachments, incremental });
      };
      exportBtn.onclick = async () => {
        if (state.selected.size === 0) return;
        const selectedList = state.list.filter((item) => state.selected.has(item.id));
        closeDialog();
        await startSelectiveExportProcess(mode, workspaceId, selectedList, state.includeAttachments);
      };
      const timeBounds = () => {
        const now = Date.now() / 1e3;
        switch (state.timeRange) {
          case "7":
          case "30":
          case "90":
            return [now - Number(state.timeRange) * 86400, null];
          case "year":
            return [new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1).getTime() / 1e3, null];
          case "custom":
            return [parseDateInputToEpoch(state.startDate, false), parseDateInputToEpoch(state.endDate, true)];
          default:
            return [null, null];
        }
      };
      const applyFilters = () => {
        const query = state.query.trim().toLowerCase();
        const [startBound, endBound] = timeBounds();
        const field = timeField();
        const direction = state.sort.endsWith("asc") ? 1 : -1;
        state.filtered = state.list.filter((item) => {
          const text = `${item.title || ""} ${item.projectTitle || ""} ${item.id || ""}`.toLowerCase();
          if (query && !text.includes(query)) return false;
          if (state.scope === "project" && !item.projectTitle) return false;
          if (state.scope === "root" && item.projectTitle) return false;
          if (state.archived === "active" && item.is_archived) return false;
          if (state.archived === "archived" && !item.is_archived) return false;
          if (state.exportStatus !== "all") {
            const exported = exportStatusOf(item, history.items) === "exported";
            if (state.exportStatus === "exported" !== exported) return false;
          }
          if (startBound || endBound) {
            const ts = normalizeEpochSeconds(item[field] || 0);
            if (!ts) return false;
            if (startBound && ts < startBound) return false;
            if (endBound && ts > endBound) return false;
          }
          return true;
        }).sort((a, b) => direction * ((normalizeEpochSeconds(a[field]) || 0) - (normalizeEpochSeconds(b[field]) || 0)));
        state.visibleCount = state.pageSize;
        state.anchorIndex = null;
      };
      const refreshSelection = () => {
        listEl.querySelectorAll(".gre-item").forEach((row) => {
          row.setAttribute("aria-checked", String(state.selected.has(row.dataset.id)));
        });
        const ready = !state.loading && !state.loadError;
        const selectedInView = state.filtered.filter((item) => state.selected.has(item.id)).length;
        selectAllBtn.disabled = !ready || state.filtered.length === 0;
        selectAllBtn.setAttribute("aria-checked", selectedInView === 0 ? "false" : selectedInView === state.filtered.length ? "true" : "mixed");
        clearAllBtn.hidden = state.selected.size === 0;
        exportBtn.disabled = !ready || state.selected.size === 0;
        exportBtn.textContent = state.selected.size > 0 ? `导出 ${state.selected.size} 个` : "导出";
        statusEl.classList.remove("gre-error");
        statusEl.removeAttribute("title");
        if (state.loading) return;
        if (state.loadError) {
          statusEl.textContent = `加载失败：${state.loadError}`;
          statusEl.classList.add("gre-error");
          return;
        }
        const total = state.filtered.length === state.list.length ? `${state.list.length} 个对话` : `${state.filtered.length} / ${state.list.length} 个对话`;
        const selected = state.selected.size > 0 ? ` · 已选 ${state.selected.size}` : "";
        statusEl.textContent = total + selected + (state.listWarning ? " · 部分项目未能读取" : "");
        if (state.listWarning) statusEl.title = state.listWarning;
      };
      const toggleItem = (index, extendRange) => {
        const checked = !state.selected.has(state.filtered[index].id);
        const anchor = state.anchorIndex;
        const useRange = extendRange && anchor !== null && anchor < state.filtered.length;
        const from = useRange ? Math.min(anchor, index) : index;
        const to = useRange ? Math.max(anchor, index) : index;
        for (let i = from; i <= to; i++) {
          const id = state.filtered[i].id;
          if (checked) state.selected.add(id);
          else state.selected.delete(id);
        }
        state.anchorIndex = index;
        refreshSelection();
      };
      const renderRow = (item, index) => {
        const row = document.createElement("div");
        row.className = "gre-item";
        row.dataset.id = item.id;
        row.tabIndex = 0;
        row.setAttribute("role", "checkbox");
        row.setAttribute("aria-checked", String(state.selected.has(item.id)));
        row.addEventListener("click", (e) => toggleItem(index, e.shiftKey));
        row.addEventListener("keydown", (e) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          toggleItem(index, e.shiftKey);
        });
        const status = hasHistory ? STATUS_LABELS[exportStatusOf(item, history.items)] : null;
        const meta = [status, item.projectTitle, item.is_archived ? "已归档" : null].filter(Boolean).join(" · ");
        const timeValue = item[timeField()];
        row.innerHTML = `
                <span class="gre-box">${ICONS.check}<i></i></span>
                <div class="gre-item-main">
                    <div class="gre-item-title"></div>
                    ${meta ? '<div class="gre-item-meta"></div>' : ""}
                </div>
                <span class="gre-item-date"></span>`;
        row.querySelector(".gre-item-title").textContent = item.title || "Untitled Conversation";
        if (meta) row.querySelector(".gre-item-meta").textContent = meta;
        const date = row.querySelector(".gre-item-date");
        date.textContent = formatDate(timeValue);
        date.title = `${timeField() === "create_time" ? "创建" : "更新"}于 ${formatTimestamp(timeValue) || "未知"}`;
        return row;
      };
      const renderList = () => {
        const scrollTop = listEl.scrollTop;
        listEl.innerHTML = "";
        if (state.loading || state.loadError) {
          const note = document.createElement("div");
          note.className = "gre-empty";
          note.textContent = state.loading ? "正在加载…" : "对话列表加载失败。";
          listEl.appendChild(note);
        } else if (state.filtered.length === 0) {
          const empty = document.createElement("div");
          empty.className = "gre-empty";
          empty.textContent = state.list.length === 0 ? "这里还没有对话" : "没有匹配的对话";
          listEl.appendChild(empty);
        } else {
          state.filtered.slice(0, state.visibleCount).forEach((item, index) => listEl.appendChild(renderRow(item, index)));
          if (state.filtered.length > state.visibleCount) {
            const more = document.createElement("button");
            more.type = "button";
            more.className = "gre-btn gre-more";
            more.textContent = `再显示 ${Math.min(state.pageSize, state.filtered.length - state.visibleCount)} 个`;
            more.onclick = () => {
              state.visibleCount = Math.min(state.visibleCount + state.pageSize, state.filtered.length);
              renderList();
            };
            listEl.appendChild(more);
          }
        }
        listEl.scrollTop = scrollTop;
        refreshSelection();
      };
      renderList();
      (async () => {
        if (!await ensureAccessToken()) throw new Error(ACCESS_TOKEN_HINT);
        return collectConversationEntries({ mode, accountId: resolveWorkspaceId(workspaceId), session: listSession });
      })().then(({ entries, problems }) => {
        state.list = entries;
        if (problems.length > 0) {
          const names = problems.map(({ folder }) => folder ? `「${folder}」` : "项目列表").join("、");
          state.listWarning = `${names}读取失败或不完整，列表可能缺少部分项目对话（详情见控制台）`;
          problems.forEach(({ folder, error }) => console.warn(`[ChatGPT Exporter] 读取 ${folder || "项目列表"} 失败:`, error));
        }
      }).catch((err) => {
        if (err?.cancelled) return;
        console.error("[ChatGPT Exporter] 加载对话列表失败:", err);
        state.loadError = err?.message || String(err);
        state.list = [];
      }).finally(() => {
        if (listSession.cancelled) return;
        state.loading = false;
        applyFilters();
        renderList();
      });
      $("#conv-search").focus();
    }
    function showExportDialog(options = {}) {
      if (document.getElementById("export-dialog-overlay")) return;
      let space = SPACE_LABELS[options.space] ? options.space : "personal";
      let includeAttachments = Boolean(options.includeAttachments);
      let incremental = Boolean(options.incremental);
      let teamDropdown = null;
      const { dialog, close: closeDialog } = openModal({ labelledBy: "gre-dialog-title", onRequestClose: () => closeDialog() });
      dialog.innerHTML = `
            <div class="gre-head">
                <h2 id="gre-dialog-title">导出对话</h2>
                <button type="button" id="gre-close-btn" class="gre-icon-btn" aria-label="关闭">${ICONS.close}</button>
            </div>
            <div class="gre-body">
                <div class="gre-seg" role="radiogroup" aria-label="导出范围">
                    <button type="button" role="radio" data-space="personal">个人</button>
                    <button type="button" role="radio" data-space="project">项目</button>
                    <button type="button" role="radio" data-space="team">团队</button>
                </div>
                <div id="gre-team-field" hidden></div>
                <div class="gre-rows">
                    ${toggleHtml("include-attachments", "包含附件", includeAttachments)}
                    ${toggleHtml("incremental-export", "仅导出有变化的对话", incremental)}
                </div>
                <div id="gre-history-row" class="gre-history" hidden>
                    <span id="gre-history-text" class="gre-count"></span>
                    <button type="button" id="clear-history-btn" class="gre-link">清除</button>
                </div>
            </div>
            <div class="gre-foot">
                <span class="gre-spacer"></span>
                <button type="button" id="open-picker-btn" class="gre-btn">选择对话</button>
                <button type="button" id="export-all-btn" class="gre-btn gre-btn-primary">导出全部</button>
            </div>`;
      const $ = (selector) => dialog.querySelector(selector);
      const teamField = $("#gre-team-field");
      const historyRow = $("#gre-history-row");
      const renderTeamField = () => {
        teamDropdown = null;
        teamField.hidden = space !== "team";
        if (space !== "team") return;
        const detectedIds = detectAllWorkspaceIds();
        teamField.innerHTML = `
                <div class="gre-field"><span class="gre-field-label">工作区</span></div>
                <div id="team-id-error" class="gre-error" role="alert" style="margin-top: 6px;" hidden></div>`;
        const row = teamField.querySelector(".gre-field");
        if (detectedIds.length > 0) {
          teamDropdown = createDropdown({
            id: "team-id-select",
            label: "",
            value: detectedIds[0],
            options: detectedIds.map((id) => ({ value: id, label: id })),
            renderValue: (option) => `<span class="gre-mono">${escapeHtml(option.label)}</span>`,
            onChange: renderHistory
          });
          row.appendChild(teamDropdown.el);
        } else {
          const input = document.createElement("input");
          input.id = "team-id-input";
          input.className = "gre-input";
          input.placeholder = "没有检测到，请粘贴工作区 ID";
          input.autocomplete = "off";
          row.appendChild(input);
        }
      };
      const currentAccountId = () => space === "team" ? teamDropdown ? teamDropdown.value : null : resolveWorkspaceId(null);
      function renderHistory() {
        historyRow.hidden = !incremental;
        if (!incremental) return;
        const canResolve = space !== "team" || teamDropdown;
        const history = canResolve ? loadExportHistory(currentAccountId()) : { items: {}, lastExportAt: null };
        $("#gre-history-text").textContent = canResolve ? describeExportHistory(history) : "填写工作区 ID 后按该工作区的记录判断";
        const clearBtn = $("#clear-history-btn");
        clearBtn.hidden = Object.keys(history.items).length === 0;
        clearBtn.disabled = false;
        clearBtn.textContent = "清除";
      }
      const selectSpace = (value) => {
        space = value;
        dialog.querySelectorAll("[data-space]").forEach((button) => {
          button.setAttribute("aria-checked", String(button.dataset.space === space));
        });
        renderTeamField();
        renderHistory();
      };
      const readWorkspaceId = () => {
        if (space !== "team") return null;
        const value = teamDropdown ? teamDropdown.value : $("#team-id-input")?.value.trim();
        if (value) return value;
        const errorEl = $("#team-id-error");
        errorEl.textContent = "请填写工作区 ID";
        errorEl.hidden = false;
        $("#team-id-input")?.focus();
        return void 0;
      };
      dialog.querySelectorAll("[data-space]").forEach((button) => {
        button.onclick = () => selectSpace(button.dataset.space);
      });
      bindToggle($("#include-attachments"), (value) => {
        includeAttachments = value;
      });
      bindToggle($("#incremental-export"), (value) => {
        incremental = value;
        renderHistory();
      });
      $("#clear-history-btn").onclick = () => {
        if (!confirm("清除后，下一次增量导出会重新导出这个空间的全部对话。确定清除吗？")) return;
        clearExportHistory(currentAccountId());
        renderHistory();
      };
      $("#gre-close-btn").onclick = closeDialog;
      $("#export-all-btn").onclick = () => {
        const workspaceId = readWorkspaceId();
        if (workspaceId === void 0) return;
        closeDialog();
        startExportProcess(space, workspaceId, { includeAttachments, incremental });
      };
      $("#open-picker-btn").onclick = () => {
        const workspaceId = readWorkspaceId();
        if (workspaceId === void 0) return;
        closeDialog();
        showConversationPicker({ mode: space, workspaceId, includeAttachments, incremental });
      };
      selectSpace(space);
      dialog.tabIndex = -1;
      dialog.focus();
    }
    if (document.body) {
      initFab();
    } else {
      document.addEventListener("DOMContentLoaded", initFab);
    }
    const previousRuntimeVersion = document.documentElement.getAttribute("data-chatgpt-exporter-version");
    if (previousRuntimeVersion !== EXPORTER_VERSION) {
      document.getElementById("export-dialog-overlay")?.remove();
    }
    window.ChatGPTExporter = {
      version: EXPORTER_VERSION,
      showDialog: showExportDialog
    };
    document.documentElement.setAttribute("data-chatgpt-exporter-ready", "1");
    document.documentElement.setAttribute("data-chatgpt-exporter-version", EXPORTER_VERSION);
    console.info(`[ChatGPT Exporter] runtime v${EXPORTER_VERSION} ready`);
    window.dispatchEvent(new CustomEvent("CHATGPT_EXPORTER_READY"));
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      const data = event.data || {};
      if (data?.type !== "CHATGPT_EXPORTER_COMMAND") return;
      const api = window.ChatGPTExporter;
      if (!api) return;
      try {
        if (data.action === "OPEN_DIALOG") {
          api.showDialog();
        } else {
          console.warn("[ChatGPT Exporter] 未知命令:", data.action);
        }
      } catch (err) {
        console.error("[ChatGPT Exporter] 处理命令失败:", err);
      }
    });
  })();
})();
