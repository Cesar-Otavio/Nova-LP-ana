/* ─────────────────────────────────────────
   LIBERDADE SISTÊMICA — script.js
   Inclui: header scroll, reveal animations,
   carrossel de depoimentos, FAQ accordion
───────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  /* ── HEADER SCROLL ── */
  const header = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );

  /* ── REVEAL ON SCROLL ── */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings in the same section
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll(".reveal"),
          );
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, idx * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── CUSTOM VIDEO PLAYER ── */
  const video = document.getElementById("presentationVideo");
  const overlay = document.getElementById("videoOverlay");
  const playBtn = document.getElementById("playBtn");
  const vcPlay = document.getElementById("vcPlay");
  const vcPlayIcon = document.getElementById("vcPlayIcon");
  const vcProgressW = document.getElementById("vcProgressWrap");
  const vcProgressB = document.getElementById("vcProgressBar");
  const vcTime = document.getElementById("vcTime");
  const vcMute = document.getElementById("vcMute");
  const vcFull = document.getElementById("vcFull");
  const videoPlayer = document.getElementById("videoPlayer");

  if (video) {
    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${sec}`;
    }

    function startPlay() {
      overlay.classList.add("hidden");
      video.play();
    }

    overlay.addEventListener("click", startPlay);
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startPlay();
    });

    vcPlay.addEventListener("click", () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", () => {
      vcPlayIcon.textContent = "⏸";
    });
    video.addEventListener("pause", () => {
      vcPlayIcon.textContent = "▶";
      if (video.currentTime === 0) overlay.classList.remove("hidden");
    });
    video.addEventListener("ended", () => {
      overlay.classList.remove("hidden");
      vcPlayIcon.textContent = "▶";
    });

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      vcProgressB.style.width = pct + "%";
      vcTime.textContent = formatTime(video.currentTime);
    });

    vcProgressW.addEventListener("click", (e) => {
      const rect = vcProgressW.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * video.duration;
    });

    vcMute.addEventListener("click", () => {
      video.muted = !video.muted;
      vcMute.textContent = video.muted ? "🔇" : "🔊";
    });

    vcFull.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoPlayer.requestFullscreen().catch(() => {});
      }
    });
  }

  /* ── CAROUSEL ── */
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("carouselDots");

  if (!track) return;

  const cards = Array.from(track.children);
  let currentIndex = 0;
  let autoplayTimer = null;

  // Calculate how many cards visible at once
  function visibleCount() {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = "";
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === currentIndex ? " active" : "");
      dot.setAttribute("aria-label", `Depoimento ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll(".dot").forEach((d, i) => {
      d.classList.toggle("active", i === currentIndex);
    });
  }

  function getCardWidth() {
    const gap = 24; // 1.5rem gap
    const n = visibleCount();
    const totalGap = gap * (n - 1);
    return (track.parentElement.offsetWidth - totalGap) / n;
  }

  function goTo(idx) {
    currentIndex = Math.max(0, Math.min(idx, maxIndex()));
    const cw = getCardWidth();
    const gap = 24;
    const offset = currentIndex * (cw + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    resetAutoplay();
  }

  function next() {
    goTo(currentIndex < maxIndex() ? currentIndex + 1 : 0);
  }
  function prev() {
    goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex());
  }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(next, 5000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    },
    { passive: true },
  );

  // Init
  buildDots();
  startAutoplay();

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(currentIndex, maxIndex()));
    }, 150);
  });

  /* ── FAQ ACCORDION ── */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const body = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close all
      faqItems.forEach((fi) => {
        fi.classList.remove("open");
        fi.querySelector(".faq-a").style.maxHeight = "0";
      });
      // Open current if was closed
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ── SMOOTH CTA PULSE ── */
  const ctaBtn = document.getElementById("checkoutBtn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", (e) => {
      // Replace '#' with real checkout URL when ready
      // e.preventDefault();
      ctaBtn.style.transform = "scale(.97)";
      setTimeout(() => {
        ctaBtn.style.transform = "";
      }, 200);
    });
  }
});
