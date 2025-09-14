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

      reel.innerHTML = `
        <video class="reel-video"
          src="${video.url}"
          data-fallback-url="${video.url}"
          autoplay loop muted playsinline preload="metadata"></video>
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

      // Auto-play
      vidEl.addEventListener("canplay", () => vidEl.play().catch(() => {}));

      // Play/pause toggle
      const toggleVideo = () => {
        if (vidEl.paused) { vidEl.play().catch(() => {}); playBtn.textContent = "⏸"; }
        else { vidEl.pause(); playBtn.textContent = "▶"; }
      };
      vidEl.addEventListener("click", toggleVideo);
      playBtn.addEventListener("click", toggleVideo);

      // Mute/unmute
      audioBtn.addEventListener("click", () => {
        vidEl.muted = !vidEl.muted;
        vidEl.dataset.userUnmuted = !vidEl.muted ? "true" : "false";
        audioImg.src = vidEl.muted ? "assets/icons/speaker-off.png" : "assets/icons/speaker-on.png";
      });

      // Handle error & fallback
      vidEl.addEventListener("error", () => {
        const fallbackUrl = vidEl.dataset.fallbackUrl;
        if (fallbackUrl && vidEl.src !== fallbackUrl) {
          console.warn("Video failed, using fallback:", vidEl.src);
          vidEl.src = fallbackUrl;
          vidEl.load();
          vidEl.play().catch(() => {});
        } else {
          console.warn("Video completely unavailable, removing:", vidEl.src);
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

// Check if element is visible
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

// Play all visible videos
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

document.addEventListener
