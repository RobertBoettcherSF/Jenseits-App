/* Splash + shell only. No network, no analytics, no questionnaire. */
(function () {
  "use strict";

  var APP_VERSION = "v0.1.2-tunnel b20261031-1752 f7b4abc";
  var CACHE_V = "3";
  var STORAGE_KEY = "jenseits.v1";
  var LANGS = ["de", "en", "fr"];
  var TABS = ["experience", "share", "near", "info"];

  var storageMode = "localStorage";
  var state = { v: 1, settings: { lang: null, lastTab: "experience" } };

  function $(id) { return document.getElementById(id); }

  function t(key) {
    var lang = state.settings.lang || "de";
    var pack = (window.JENSEITS_I18N && window.JENSEITS_I18N[lang]) || {};
    var de = (window.JENSEITS_I18N && window.JENSEITS_I18N.de) || {};
    if (pack[key] != null) return pack[key];
    if (de[key] != null) return de[key];
    return key;
  }

  function reducedYes() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function load() {
    var raw = null;
    try {
      localStorage.setItem(STORAGE_KEY + ".t", "1");
      localStorage.removeItem(STORAGE_KEY + ".t");
      raw = localStorage.getItem(STORAGE_KEY);
      storageMode = "localStorage";
    } catch (e) {
      storageMode = "memory";
      raw = null;
    }
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      var settings = data && data.settings;
      if (!settings || typeof settings !== "object") return;
      if (LANGS.indexOf(settings.lang) >= 0) state.settings.lang = settings.lang;
      if (TABS.indexOf(settings.lastTab) >= 0) state.settings.lastTab = settings.lastTab;
    } catch (e2) {}
  }

  /* Writes only language and last tab. Never persists experience text. */
  function persist() {
    var data = {
      v: 1,
      settings: {
        lang: state.settings.lang,
        lastTab: state.settings.lastTab
      }
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      storageMode = "localStorage";
    } catch (e) {
      storageMode = "memory";
      showStorageWarn();
    }
  }

  function showStorageWarn() {
    var el = $("storage-warn");
    if (!el) return;
    el.hidden = false;
    el.textContent = t("backup.storageWarn");
  }

  function setStatus(message) {
    var el = $("status");
    if (!el) return;
    el.textContent = message || "";
  }

  function applyI18n() {
    var lang = state.settings.lang || "de";
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    var nodes = document.querySelectorAll("[data-i18n]");
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
    var arias = document.querySelectorAll("[data-i18n-aria]");
    for (i = 0; i < arias.length; i++) {
      arias[i].setAttribute("aria-label", t(arias[i].getAttribute("data-i18n-aria")));
    }
    var toggle = $("dbg-toggle");
    if (toggle) toggle.textContent = t("debug.open") + " · " + t("debug.f9");
    var skip = $("skip");
    if (skip) {
      skip.textContent = t("skip");
      skip.setAttribute("href", splashOpen() ? "#splash-langs" : "#main");
    }
    var buttons = document.querySelectorAll("[data-set-lang]");
    for (i = 0; i < buttons.length; i++) {
      var code = buttons[i].getAttribute("data-set-lang");
      buttons[i].setAttribute("aria-pressed", code === state.settings.lang ? "true" : "false");
    }
    refreshDebugLine();
  }

  function selectTab(id) {
    if (TABS.indexOf(id) < 0) id = "experience";
    state.settings.lastTab = id;
    if (state.settings.lang) persist();
    var n;
    for (n = 0; n < TABS.length; n++) {
      var tab = TABS[n];
      var on = tab === id;
      var btn = $("tab-" + tab);
      var panel = $("panel-" + tab);
      if (btn) {
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
      }
      if (panel) panel.hidden = !on;
    }
    refreshDebugLine();
  }

  function splashOpen() {
    return document.documentElement.getAttribute("data-skip-splash") !== "1";
  }

  function showShell() {
    stopSplash();
    document.documentElement.setAttribute("data-skip-splash", "1");
    applyI18n();
    selectTab(state.settings.lastTab || "experience");
  }

  function chooseLang(code) {
    if (LANGS.indexOf(code) < 0) return;
    state.settings.lang = code;
    if (TABS.indexOf(state.settings.lastTab) < 0) state.settings.lastTab = "experience";
    var entering = splashOpen();
    persist();
    showShell();
    if (entering) {
      var tab = $("tab-" + (state.settings.lastTab || "experience"));
      if (tab) tab.focus();
    }
  }

  /* Upper half of a dipole field: tunnel arches, cream on black. Not the Ada WASM viz. */
  var ringRaf = 0;
  var ringOn = false;
  var ringPhase = 0.2;
  var ringLast = 0;
  var ringDpr = 1;
  var ringSolid = [];
  var ringDash = [3, 6];
  var FIELD_N = 20;

  function ringMotion() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function fitRings() {
    var canvas = $("rings");
    if (!canvas) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    var bw = Math.max(1, Math.round(w * dpr));
    var bh = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ringDpr = dpr;
    return { canvas: canvas, ctx: canvas.getContext("2d"), w: w, h: h };
  }

  function paintRings(stillPhase) {
    var fit = fitRings();
    if (!fit || !fit.ctx) return;
    var ctx = fit.ctx;
    var w = fit.w;
    var h = fit.h;
    var phase = stillPhase == null ? ringPhase : stillPhase;
    var panel = document.querySelector(".splash-bottom");
    var panelTop = panel ? panel.getBoundingClientRect().top : h * 0.62;
    var top = Math.max(4, h * 0.015);
    var cy = panelTop - Math.max(16, h * 0.02);
    if (cy < top + 48) cy = top + 48;
    if (cy > h * 0.78) cy = h * 0.78;
    var openH = cy - top;
    var cx = w * 0.5;
    var scale = Math.min((w * 0.52) / 1, openH / 0.4);
    ctx.setTransform(ringDpr, 0, 0, ringDpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    var glowR = Math.min(w, openH) * 0.55;
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glow.addColorStop(0, "rgba(255, 252, 246, 0.95)");
    glow.addColorStop(0.08, "rgba(246, 236, 214, 0.5)");
    glow.addColorStop(0.28, "rgba(220, 210, 190, 0.12)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var li;
    var steps = 64;
    for (li = 0; li < FIELD_N; li++) {
      var t = ((li + phase) % FIELD_N) / FIELD_N;
      var A = 0.045 + Math.pow(t, 0.92);
      ctx.beginPath();
      ctx.strokeStyle = li % 3 === 0 ? "#f4e7c8" : "#f7f6f2";
      ctx.globalAlpha = 0.42 + 0.5 * (1 - t);
      ctx.lineWidth = t < 0.25 ? 1.5 : 1.05;
      ctx.setLineDash(li % 2 ? ringDash : ringSolid);
      ctx.lineDashOffset = stillPhase == null ? -phase * 18 : 0;
      var s;
      for (s = 0; s <= steps; s++) {
        var alpha = Math.PI * (0.5 - s / steps);
        var sn = Math.sin(alpha);
        var r = A * sn * sn;
        var x = r * sn;
        var y = r * Math.cos(alpha);
        var sx = cx + x * scale;
        var sy = cy - y * scale;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.setLineDash(ringSolid);
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#f7f4ea";
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 0.4 * scale);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fffaf3";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  function ringFrame(now) {
    if (!ringOn) return;
    if (!ringLast) ringLast = now;
    var dt = Math.min(0.05, (now - ringLast) / 1000);
    ringLast = now;
    ringPhase = (ringPhase + dt * 0.07) % 1;
    paintRings(null);
    ringRaf = window.requestAnimationFrame(ringFrame);
  }

  function startRings() {
    var canvas = $("rings");
    if (!canvas) return;
    if (ringRaf) window.cancelAnimationFrame(ringRaf);
    ringRaf = 0;
    ringLast = 0;
    if (!ringMotion() || document.hidden) {
      ringOn = false;
      canvas.setAttribute("data-rings", "still");
      paintRings(0.42);
      return;
    }
    ringOn = true;
    canvas.setAttribute("data-rings", "run");
    ringRaf = window.requestAnimationFrame(ringFrame);
  }

  function stopSplash() {
    ringOn = false;
    if (ringRaf) window.cancelAnimationFrame(ringRaf);
    ringRaf = 0;
  }

  function enterFromSplash() {
    if (!splashOpen()) return;
    if (!state.settings.lang) state.settings.lang = "de";
    persist();
    showShell();
  }

  function onSplashPointer(ev) {
    if (!splashOpen()) return;
    var node = ev.target;
    if (node && node.closest && node.closest("button, a, input, select, textarea")) return;
    enterFromSplash();
  }

  function refreshDebugLine() {
    var el = $("dbg-summary");
    if (!el) return;
    var lang = state.settings.lang || "-";
    var motion = reducedYes() ? "yes" : "no";
    el.textContent = lang + " · " + window.innerWidth + "px · reduced-motion: " + motion;
  }

  /* Technical fields only. Do not read tab panels or backup bodies. */
  function buildDebugReport() {
    var screenObj = window.screen || {};
    var domStamp = ($("ver") && $("ver").textContent || "").replace(/^\s+|\s+$/g, "");
    return {
      appVersion: APP_VERSION,
      lang: state.settings.lang,
      ua: navigator.userAgent,
      screen: {
        width: screenObj.width || null,
        height: screenObj.height || null,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      reducedMotion: reducedYes() ? "yes" : "no",
      standalone: window.matchMedia("(display-mode: standalone)").matches ? "yes" : "no",
      storage: storageMode,
      lastTab: state.settings.lastTab,
      cacheV: CACHE_V,
      stampMatchesDom: domStamp === APP_VERSION ? "yes" : "no"
    };
  }

  function reportText(report) {
    var s = report.screen || {};
    return [
      "appVersion: " + report.appVersion,
      "lang: " + report.lang,
      "ua: " + report.ua,
      "screen: " + s.width + "x" + s.height,
      "viewport: " + s.viewportWidth + "x" + s.viewportHeight,
      "devicePixelRatio: " + s.devicePixelRatio,
      "reducedMotion: " + report.reducedMotion,
      "standalone: " + report.standalone,
      "storage: " + report.storage,
      "lastTab: " + report.lastTab,
      "cacheV: " + report.cacheV,
      "stampMatchesDom: " + report.stampMatchesDom
    ].join("\n");
  }

  function saveFile(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function exportDebug() {
    var report = buildDebugReport();
    var json = JSON.stringify(report, null, 2);
    var text = reportText(report) + "\n\n" + json + "\n";
    var pre = $("debugtext");
    if (pre) pre.textContent = reportText(report);
    saveFile("jenseits-debug.txt", text, "text/plain");
  }

  function toggleDebug(forceOpen) {
    var panel = $("debugpanel");
    var toggle = $("dbg-toggle");
    if (!panel) return;
    var open = forceOpen === true ? true : forceOpen === false ? false : panel.hidden;
    panel.hidden = !open;
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var report = buildDebugReport();
      var pre = $("debugtext");
      if (pre) pre.textContent = reportText(report);
      var exportBtn = $("dbg-export-panel");
      if (exportBtn) exportBtn.focus();
    }
  }

  function buildBackup() {
    return {
      schema: { name: "jenseits-backup", version: 1 },
      exportedAt: new Date().toISOString(),
      app: { version: APP_VERSION, uiLang: state.settings.lang },
      settings: {
        lang: state.settings.lang,
        lastTab: state.settings.lastTab
      }
    };
  }

  function exportBackup() {
    var payload = JSON.stringify(buildBackup(), null, 2) + "\n";
    saveFile("jenseits-backup.json", payload, "application/json");
    setStatus(t("backup.saved"));
  }

  function importBackup(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("bad");
    var settings = obj.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("bad");
    var lang = settings.lang;
    var tab = settings.lastTab;
    var changed = false;
    if (LANGS.indexOf(lang) >= 0) {
      state.settings.lang = lang;
      changed = true;
    }
    if (TABS.indexOf(tab) >= 0) {
      state.settings.lastTab = tab;
      changed = true;
    }
    if (!changed) throw new Error("bad");
    persist();
    showShell();
    setStatus(t("backup.imported"));
  }

  function onImportFile(file) {
    if (!file) return;
    if (file.size > 100000) {
      setStatus(t("backup.bad"));
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        importBackup(JSON.parse(String(reader.result || "")));
      } catch (e) {
        setStatus(t("backup.bad"));
      }
    };
    reader.onerror = function () { setStatus(t("backup.bad")); };
    reader.readAsText(file);
  }

  function bind() {
    document.body.addEventListener("click", function (ev) {
      var node = ev.target;
      if (!node || !node.closest) return;
      var langBtn = node.closest("[data-set-lang]");
      if (langBtn) {
        chooseLang(langBtn.getAttribute("data-set-lang"));
        return;
      }
      var tabBtn = node.closest("[data-tab]");
      if (tabBtn && tabBtn.closest("#tabs")) {
        selectTab(tabBtn.getAttribute("data-tab"));
      }
    });

    var tabs = $("tabs");
    if (tabs) {
      tabs.addEventListener("keydown", function (ev) {
        var key = ev.key;
        if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
        ev.preventDefault();
        var i = TABS.indexOf(state.settings.lastTab);
        if (i < 0) i = 0;
        if (key === "Home") i = 0;
        else if (key === "End") i = TABS.length - 1;
        else if (key === "ArrowDown" || key === "ArrowRight") i = (i + 1) % TABS.length;
        else i = (i + TABS.length - 1) % TABS.length;
        selectTab(TABS[i]);
        var btn = $("tab-" + TABS[i]);
        if (btn) btn.focus();
      });
    }

    var toggle = $("dbg-toggle");
    if (toggle) toggle.addEventListener("click", function () { toggleDebug(); });
    var exportBar = $("dbg-export");
    if (exportBar) exportBar.addEventListener("click", exportDebug);
    var exportPanel = $("dbg-export-panel");
    if (exportPanel) exportPanel.addEventListener("click", exportDebug);

    var backupBtn = $("backup-export");
    if (backupBtn) backupBtn.addEventListener("click", exportBackup);
    var importInput = $("import-file");
    if (importInput) {
      importInput.addEventListener("change", function () {
        var file = importInput.files && importInput.files[0];
        importInput.value = "";
        onImportFile(file);
      });
    }

    var splash = $("splash");
    if (splash) splash.addEventListener("click", onSplashPointer);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        var panel = $("debugpanel");
        if (panel && !panel.hidden) {
          toggleDebug(false);
          if (toggle) toggle.focus();
          return;
        }
        if (splashOpen()) {
          ev.preventDefault();
          enterFromSplash();
        }
        return;
      }
      if (ev.key === "F9") {
        var ftag = ev.target && ev.target.tagName;
        if (ftag === "INPUT" || ftag === "TEXTAREA" || ftag === "SELECT") return;
        ev.preventDefault();
        toggleDebug();
        return;
      }
      if (!splashOpen()) return;
      var tag = ev.target && ev.target.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      var key = ev.key;
      var letter = key && key.length === 1 && !ev.metaKey && !ev.ctrlKey && !ev.altKey;
      if (key !== " " && key !== "Enter" && !letter) return;
      ev.preventDefault();
      enterFromSplash();
    });

    window.addEventListener("resize", function () {
      refreshDebugLine();
      if (splashOpen()) {
        if (ringOn) return;
        paintRings(0.42);
      }
    });
    document.addEventListener("visibilitychange", function () {
      if (!splashOpen()) return;
      if (document.hidden) {
        ringOn = false;
        if (ringRaf) window.cancelAnimationFrame(ringRaf);
        ringRaf = 0;
        return;
      }
      startRings();
    });
    var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onMotion() {
      refreshDebugLine();
      if (splashOpen()) startRings();
    }
    if (motion.addEventListener) motion.addEventListener("change", onMotion);
    else if (motion.addListener) motion.addListener(onMotion);
  }

  function boot() {
    var stamp = $("ver");
    if (stamp) stamp.textContent = APP_VERSION;
    load();
    bind();
    if (!state.settings.lang) state.settings.lang = "de";
    applyI18n();
    selectTab(state.settings.lastTab || "experience");
    startRings();
    if (storageMode === "memory") showStorageWarn();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
