(() => {
  "use strict";
  const film = document.getElementById("film");
  const start = document.getElementById("start");
  const status = document.getElementById("status");
  const source = "stream.m3u8";
  let hls = null;
  let initialized = false;
  let library = null;
  const say = (message) => { status.textContent = message; };
  const fail = () => {
    if (hls) { hls.destroy(); hls = null; }
    initialized = false;
    start.hidden = false;
    start.disabled = false;
    start.querySelector("span").textContent = "↻ 重试播放";
    say("视频加载失败，请检查网络后重试。");
  };
  const play = () => film.play().catch(() => {
    say("视频已准备好，请点击播放器的播放按钮。");
  });
  function loadLibrary() {
    if (!library) {
      library = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "vendor/hls.light.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      }).catch((error) => { library = null; throw error; });
    }
    return library;
  }
  start.addEventListener("click", async () => {
    start.disabled = true;
    start.querySelector("span").textContent = "正在加载…";
    say("正在读取视频…");
    try {
      if (film.canPlayType("application/vnd.apple.mpegurl")) {
        initialized = true;
        film.src = source;
        start.hidden = true;
        await play();
        return;
      }
      await loadLibrary();
      if (!window.Hls.isSupported()) {
        say("此浏览器不支持视频流播放，请使用新版 Safari、Chrome 或 Edge。");
        start.disabled = false;
        start.querySelector("span").textContent = "↻ 重试播放";
        return;
      }
      hls = new window.Hls({
        autoStartLoad: false,
        enableWorker: true,
        maxBufferLength: 8,
        maxMaxBufferLength: 12,
        maxBufferSize: 32 * 1024 * 1024,
        backBufferLength: 4,
        frontBufferFlushThreshold: 16,
        startFragPrefetch: false
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        initialized = true;
        start.hidden = true;
        hls.startLoad();
        play();
      });
      hls.loadSource(source);
      hls.attachMedia(film);
    } catch { fail(); }
  });
  film.addEventListener("playing", () => say(""));
  film.addEventListener("waiting", () => {
    if (initialized) say("正在缓冲…");
  });
  film.addEventListener("play", () => { if (hls) hls.startLoad(); });
  film.addEventListener("pause", () => {
    if (hls) hls.stopLoad();
    if (initialized) say("");
  });
  film.addEventListener("seeking", () => {
    if (hls && !film.paused) hls.startLoad(film.currentTime);
  });
  film.addEventListener("error", fail);
  window.addEventListener("pagehide", () => { if (hls) hls.destroy(); });
})();
