window.WORKER_BASE = "https://reel-hub.govty02.workers.dev";
let reelCount = 0;
let currentPage = 1;
let isLoading = false;
let totalPages = 1;

async function loadVideos(page = 1) {
  if (isLoading || page > totalPages) return;
  isLoading = true;

  const container = document.getElementById("reelContainer");
  if (page === 1) container.innerHTML = "<div class='loading'>⏳ Loading reels...</div>";

  try {
    const res = await fetch(`${window.WORKER_BASE}/videos?page=${page}`);
    const data = await res.json();
    console.log("Videos received from API:", data.videos);

    totalPages = data.pagination?.totalPages || 1;
    if (page === 1) container.innerHTML = "";

    if (!data.videos || data.videos.length === 0) {
      if (page === 1) container.innerHTML = "<p>कोई वीडियो नहीं मिला।</p>";
      return;
    }

    data.videos.forEach(video => {
      reelCount++;
      const reel = document.createElement("div");
      reel.className = "reel";

      // Worker endpoint used for src
      const videoSrc = `${window.WORKER_BASE}/video/${video.file_id}`;

      reel.innerHTML = `
        <video class="reel-video" src="${videoSrc}" autoplay loop muted playsinline preload="metadata"></video>
        <div class="footer-tags">#hot #desi #bhabhi</div>
        <div class="play-pause-btn">⏸</div>
        <div class="right-icons">
          <div class="icon-btn like-btn"><img src="assets/icons/like.png"><span>120</span></div>
          <div class="icon-btn comment-btn"><img src="assets/icons/comment.png"><span>15</span></div>
          <div class="icon-btn share-btn"><img src="assets/icons/share.png"><span>Share</span></div>
          <button class="icon-btn audio-btn">
            <img src="assets/icons/speaker-off.png" alt="Mute/Unmute">
          </button>
        </div>
      `;

      const vidEl = reel.querySelector(".reel-video");
const playBtn = reel.querySelector(".play-pause-btn");
const audioBtn = reel.querySelector(".audio-btn");
const audioImg = audioBtn.querySelector("img");

vidEl.addEventListener("canplay", () => vidEl.play().catch(() => {}));

// Block touch/hold / right-click
vidEl.addEventListener('contextmenu', e => e.preventDefault()); // Right click
vidEl.addEventListener('mousedown', e => e.preventDefault());    // Desktop long click
vidEl.addEventListener('touchstart', e => {
  if (e.touches.length > 1) e.preventDefault(); // Multi-touch prevent
  setTimeout(() => e.preventDefault(), 500);    // Long press prevent
});


      // Play/pause toggle
      const toggleVideo = () => {
        if (vidEl.paused) {
          vidEl.play().catch(() => {});
          playBtn.textContent = "⏸";
        } else {
          vidEl.pause();
          playBtn.textContent = "▶";
        }
      };
      vidEl.addEventListener("click", toggleVideo);
      playBtn.addEventListener("click", toggleVideo);

      // Mute/unmute toggle
      audioBtn.addEventListener("click", () => {
        vidEl.muted = !vidEl.muted;
        vidEl.dataset.userUnmuted = !vidEl.muted ? "true" : "false";
        audioImg.src = vidEl.muted
          ? "assets/icons/speaker-off.png"
          : "assets/icons/speaker-on.png";
      });

      // Error fallback: Worker URL will always be used first
      vidEl.addEventListener("error", () => {
        console.warn("Video failed, trying fallback:", vidEl.src);
        // If already fallback, remove
        if (!vidEl.src.includes("/video/")) {
          vidEl.src = `${window.WORKER_BASE}/video/${video.file_id}`;
          vidEl.load();
          vidEl.play().catch(() => {});
        } else {
          console.error("Video unavailable, removing:", vidEl.src);
          reel.remove();
        }
      });

      container.appendChild(reel);
    });

    handleScrollPlayMultiple();
  } catch (err) {
    console.error("Error loading videos:", err);
    if (page === 1) container.innerHTML = "<p>⚠️ Error loading videos.</p>";
  } finally {
    isLoading = false;
  }
}

// Play all visible videos in viewport
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

function handleScrollPlayMultiple() {
  document.querySelectorAll(".reel").forEach(reel => {
    const video = reel.querySelector(".reel-video");
    const playBtn = reel.querySelector(".play-pause-btn");
    const audioImg = reel.querySelector(".audio-btn img");

    if (isInViewport(video)) {
      video.play().catch(() => {});
      if (!video.dataset.userUnmuted) video.muted = true;
      playBtn.textContent = video.paused ? "▶" : "⏸";
      audioImg.src = video.muted ? "assets/icons/speaker-off.png" : "assets/icons/speaker-on.png";
    } else {
      video.pause();
      video.muted = true;
      playBtn.textContent = "▶";
      audioImg.src = "assets/icons/speaker-off.png";
    }
  });
}

// Infinite scroll
window.addEventListener("scroll", () => {
  handleScrollPlayMultiple();

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadVideos(++currentPage);
  }
}, { passive: true });

document.addEventListener("DOMContentLoaded", () => loadVideos());
