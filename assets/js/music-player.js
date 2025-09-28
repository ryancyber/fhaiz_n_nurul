
(() => {
  // const AUDIO_SRC = "/assets/audio/wedding_song.wav";
  const AUDIO_SRC = "../../fhaiz_n_nurul/assets/audio/LAGU_BUGIS_ALOSI_RIPOLO_DUA _ INSTRUMEN_PIANO.mp3";
  const STORAGE_KEY = "music_player_state_v1";
  const ICON_PLAY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const ICON_PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`;
  const ICON_MUSIC = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`;

  const style = document.createElement("style");
  style.textContent = `
    .gp-music-btn{position:fixed;right:16px;bottom:16px;width:48px;height:48px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;border:none;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);color:#fff;cursor:pointer;z-index:99999;box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .2s ease,background .2s ease}
    .gp-music-btn:hover{transform:translateY(-2px);background:rgba(0,0,0,.8)}
    .gp-music-pulse{position:absolute;width:48px;height:48px;border-radius:9999px;box-shadow:0 0 0 0 rgba(16,185,129,.45);animation:gpPulse 2.5s infinite;pointer-events:none}
    @keyframes gpPulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.45)}70%{box-shadow:0 0 0 14px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
    .gp-music-panel{position:fixed;right:16px;bottom:72px;background:rgba(0,0,0,.72);color:#fff;border-radius:14px;padding:10px 12px;display:none;gap:10px;align-items:center;z-index:99999;backdrop-filter:blur(6px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
    .gp-music-panel.open{display:inline-flex}
    .gp-music-label{font-size:12px;opacity:.9;margin-right:8px}
    .gp-music-range{width:140px}
    .gp-music-tooltip{position:fixed;right:72px;bottom:24px;background:rgba(0,0,0,.72);color:#fff;font-size:12px;padding:6px 8px;border-radius:8px;transform:translateX(8px);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;z-index:99999}
    .gp-music-tooltip.show{opacity:1;transform:translateX(0)}
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "gp-music-btn";
  btn.setAttribute("aria-label","Music player toggle");
  btn.innerHTML = ICON_MUSIC;

  const pulse = document.createElement("span");
  pulse.className = "gp-music-pulse";
  btn.appendChild(pulse);

  const panel = document.createElement("div");
  panel.className = "gp-music-panel";
  panel.innerHTML = `
    <span class="gp-music-label">Music</span>
    <button class="gp-music-play" title="Play/Pause" aria-label="Play/Pause">${ICON_PLAY}</button>
    <input class="gp-music-range" type="range" min="0" max="100" value="60" aria-label="Volume">
  `;

  const tooltip = document.createElement("div");
  tooltip.className = "gp-music-tooltip";
  tooltip.textContent = "Scroll ke bawah untuk mulai musik";

  document.body.appendChild(btn);
  document.body.appendChild(panel);
  document.body.appendChild(tooltip);

  const playBtn = panel.querySelector(".gp-music-play");
  const range = panel.querySelector(".gp-music-range");

  const audio = new Audio(AUDIO_SRC);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.6;

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (typeof saved.volume === "number") {
      audio.volume = Math.min(1, Math.max(0, saved.volume));
      range.value = String(Math.round(audio.volume*100));
    }
  } catch {}

  const saveState = () => {
    const state = { playing: !audio.paused, volume: audio.volume };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };
  const setIcon = () => {
    playBtn.innerHTML = audio.paused ? ICON_PLAY : ICON_PAUSE;
    pulse.style.display = audio.paused ? "none" : "block";
  };

  let panelOpen = false;
  const togglePanel = () => {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
    if (panelOpen) tooltip.classList.remove("show");
  };

  btn.addEventListener("click", () => {
    if (!panelOpen) { togglePanel(); return; }
    if (audio.paused) {
      audio.play().then(()=>{ setIcon(); saveState(); })
      .catch(()=>{ tooltip.textContent="Klik ▶ untuk mulai"; tooltip.classList.add("show"); setTimeout(()=>tooltip.classList.remove("show"),1500);});
    } else {
      audio.pause(); setIcon(); saveState();
    }
  });

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().then(()=>{ setIcon(); saveState(); })
      .catch(()=>{ tooltip.textContent="Izin audio diblokir"; tooltip.classList.add("show"); setTimeout(()=>tooltip.classList.remove("show"),1500);});
    } else {
      audio.pause(); setIcon(); saveState();
    }
  });

  range.addEventListener("input", () => {
    const v = Math.min(100, Math.max(0, Number(range.value)));
    audio.volume = v/100; saveState();
  });

  // Hint
  setTimeout(()=>{ tooltip.classList.add("show"); setTimeout(()=>tooltip.classList.remove("show"),2200); }, 900);

  // --- Autoplay on first downward scroll (policy-friendly) ---
  let gpScrollAutoTried = false;
  let gpLastScrollY = window.scrollY || 0;
  const fadeTo = (from, to, ms) => {
    const steps = Math.max(1, Math.floor(ms / 25));
    let i = 0; audio.volume = from;
    const id = setInterval(() => {
      i++; const t = i/steps; audio.volume = from + (to-from)*t;
      if (i>=steps){ audio.volume = to; clearInterval(id); saveState(); }
    }, 25);
  };
  const tryPlayOnScroll = () => {
    if (gpScrollAutoTried) return;
    const y = window.scrollY || 0;
    const goingDown = y > gpLastScrollY + 10;
    gpLastScrollY = y;
    if (!goingDown || y < 40) return;

    gpScrollAutoTried = true;
    const target = audio.volume;
    audio.muted = true; audio.volume = 0.0;
    audio.play().then(()=>{
      audio.muted = false;
      fadeTo(0.0, target, 1200);
      setIcon(); saveState();
    }).catch(()=>{
      tooltip.textContent = "Klik ▶ untuk mulai musik";
      tooltip.classList.add("show");
      setTimeout(()=>tooltip.classList.remove("show"),1800);
    });
    window.removeEventListener("scroll", tryPlayOnScroll, { passive: true });
  };
  window.addEventListener("scroll", tryPlayOnScroll, { passive: true });

  // First pointer gesture also resumes if needed (backup)
  const gestureOnce = () => {
    if (audio.paused) {
      audio.play().then(()=>{ setIcon(); saveState(); }).catch(()=>{});
    }
    window.removeEventListener("pointerdown", gestureOnce, { passive: true });
  };
  window.addEventListener("pointerdown", gestureOnce, { passive: true });

  setIcon();
})();
