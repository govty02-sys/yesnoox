window.WORKER_BASE = "https://reel-hub.govty02.workers.dev"; // बिना स्लैश
let reelCount = 0;
let currentPlaying = null; // currently visible video

async function loadVideos() {
  const container = document.getElementById("reelContainer");
  container.innerHTML = "<div class='loading'>⏳ Loading reels...</div>";

  try {
    const res = await fetch(window.WORKER_BASE + "/videos");
    const data = await res.json();
    container.innerHTML = "";

    if (!data.videos || data.videos.length === 0) {
      container.innerHTML = "<p>कोई वीडियो नहीं मिला।</p>";
      return;
    }

    // सभी videos append करो
    data.videos.forEach(video => {
      reelCount++;
      const reel = document.createElement("div");
      reel.className = "reel";

      reel.innerHTML = `
        <video class="reel-video" src="${video.url}" autoplay loop muted playsinline preload="auto"></video>
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

      // Autoplay ensure
      vidEl.addEventListener("canplay", () => {
        if (vidEl.paused) {
          vidEl.play().catch(() => {});
        }
      });

      // Play / Pause
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

      // Audio toggle
      audioBtn.addEventListener("click", () => {
        vidEl.muted = !vidEl.muted;
        vidEl.dataset.userUnmuted = !vidEl.muted ? "true" : "false";
        audioImg.src = vidEl.muted ? "assets/icons/speaker-off.png" : "assets/icons/speaker-on.png";
      });

      // Like / Comment / Share (demo only)
      reel.querySelector(".like-btn").addEventListener("click", () => alert("Liked!"));
      reel.querySelector(".comment-btn").addEventListener("click", () => alert("Open comments!"));
      reel.querySelector(".share-btn").addEventListener("click", () => alert("Share link copied!"));

      container.appendChild(reel);
    });

    // -----------------------------
    // Scroll / Auto-Pause Handler
    // -----------------------------
    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
    }

    function handleScrollPause() {
      const reels = document.querySelectorAll(".reel");
      reels.forEach(reel => {
        const video = reel.querySelector(".reel-video");
        const playBtn = reel.querySelector(".play-pause-btn");
        const audioBtnImg = reel.querySelector(".audio-btn img");

        if (isInViewport(video)) {
          if (currentPlaying && currentPlaying !== video) {
            currentPlaying.pause();
            const prevPlayBtn = currentPlaying.closest(".reel").querySelector(".play-pause-btn");
            prevPlayBtn.textContent = "▶";
            currentPlaying.muted = true;
            currentPlaying.closest(".reel").querySelector(".audio-btn img").src = "assets/icons/speaker-off.png";
          }
          video.play().catch(() => {});
          if (!video.dataset.userUnmuted) video.muted = true;
          currentPlaying = video;
          playBtn.textContent = video.paused ? "▶" : "⏸";
        } else {
          video.pause();
          video.muted = true;
          playBtn.textContent = "▶";
          audioBtnImg.src = "assets/icons/speaker-off.png";
        }
      });
    }

    window.addEventListener("scroll", handleScrollPause, { passive: true });
    setInterval(handleScrollPause, 800); // safety check
    handleScrollPause(); // initial run
  } catch (err) {
    console.error("Error loading videos:", err);
    container.innerHTML = "<p>⚠️ Error loading videos.</p>";
  }
}

// Bottom nav actions
document.addEventListener("DOMContentLoaded", () => {
  loadVideos();

  const btns = document.querySelectorAll(".bottom-nav button");
  if (btns.length === 4) {
    btns[0].onclick = () => (window.location.href = "/");
    btns[1].onclick = () => alert("Search feature coming soon.");
    btns[2].onclick = () => alert("Bookmark feature coming soon.");
    btns[3].onclick = () => alert("Login feature coming soon.");
  }
});
//app install
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // ✅ Custom Popup Create
  const popup = document.createElement("div");
  popup.id = "installPopup";
  popup.innerHTML = `
    <div style="
      position:fixed;
      bottom:65px;
      left:0;
      right:0;
      background:#000;
      color:#fff;
      padding:12px;
      text-align:center;
      font-family:Arial, sans-serif;
      font-size:14px;
      z-index:9999;
      box-shadow:0 -2px 8px rgba(0,0,0,0.4);
    ">
      Install DesiSukh App?
      <button id="installBtn" style="
        margin-left:10px;
        padding:6px 12px;
        background:#ff2d55;
        color:#fff;
        border:none;
        border-radius:4px;
        cursor:pointer;
      ">Install</button>
      <button id="closeBtn" style="
        margin-left:8px;
        padding:6px 10px;
        background:#444;
        color:#fff;
        border:none;
        border-radius:4px;
        cursor:pointer;
      ">Close</button>
    </div>
  `;
  document.body.appendChild(popup);

  // ✅ Install Button Click
  document.getElementById("installBtn").addEventListener("click", () => {
    popup.remove();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("✅ User installed DesiSukh App");
      } else {
        console.log("❌ User dismissed install");
      }
      deferredPrompt = null;
    });
  });

  // ❌ Close Button
  document.getElementById("closeBtn").addEventListener("click", () => {
    popup.remove();
  });
});
//service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch(err => console.error("❌ SW registration failed:", err));
}
