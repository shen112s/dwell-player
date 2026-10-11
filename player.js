(() => {
  "use strict";
  const film = document.getElementById("film");
  const start = document.getElementById("start");
  const status = document.getElementById("status");
  const source = "stream.m3u8";
  let hls = null;
  let initialized = false;
  let loading = false;
  let library = null;
  const say = (message) => { status.textContent = message; };
  const startLoading = (position = -1) => {
    if (hls && !loading) { loading = true; hls.startLoad(position); }
  };
  const stopLoading = () => {
    if (hls && loading) { loading = false; hls.stopLoad(); }
  };
  const fail = () => {
    loading = false;
    if (hls) { hls.destroy(); hls = null; }
    initialized = false;
    film.removeAttribute("src");
    film.load();
    start.hidden = false;
    start.disabled = false;
    start.querySelector("span").textContent = "↻";
    start.setAttribute("aria-label", "视频加载失败，重试播放");
    start.title = "视频加载失败，请检查网络后重试";
    say("视频加载失败，请检查网络后重试。");
  };
  const play = () => film.play().catch((error) => {
    if (initialized && error.name === "NotAllowedError") say("视频已准备好，请点击播放器的播放按钮。");
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
    start.title = "";
    start.setAttribute("aria-label", "正在加载视频");
    start.querySelector("span").textContent = "…";
    say("正在读取视频…");
    try {
      await loadLibrary();
      if (!window.Hls.isSupported()) {
        if (film.canPlayType("application/vnd.apple.mpegurl")) {
          initialized = true;
          film.src = source;
          start.hidden = true;
          await play();
          return;
        }
        say("此浏览器不支持视频流播放，请使用新版 Safari、Chrome 或 Edge。");
        start.disabled = false;
        start.querySelector("span").textContent = "↻";
        return;
      }
      film.disableRemotePlayback = true;
      hls = new window.Hls({
        autoStartLoad: false,
        enableWorker: true,
        preferManagedMediaSource: true,
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
        startLoading();
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
  film.addEventListener("play", () => startLoading());
  film.addEventListener("pause", () => {
    stopLoading();
    if (initialized) say("");
  });
  film.addEventListener("seeking", () => {
    if (hls) { stopLoading(); startLoading(film.currentTime); }
  });
  film.addEventListener("seeked", () => {
    if (film.paused) { stopLoading(); say(""); }
  });
  film.addEventListener("ended", stopLoading);
  film.addEventListener("error", fail);
  window.addEventListener("pagehide", () => { if (hls) hls.destroy(); });
})();
