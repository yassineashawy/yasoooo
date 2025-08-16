import React, { useEffect, useRef, useState } from "react";
import "./Birthday.css";

// Drop this file in src/ as BirthdayPage.jsx, then import and render it in App.jsx
// Make sure your images are: public/photo1.png ... public/photo10.png
// Optional: put a music file at public/music.mp3 (autoplays if browser allows; fallback Unmute button shows otherwise)

export default function BirthdayPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showUnmute, setShowUnmute] = useState(false);

  const bgCanvasRef = useRef(null);
  const fwCanvasRef = useRef(null);
  const audioRef = useRef(null);
  const msgRef = useRef(null);

  // ---------- Intro timing ----------
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 6000); // 6s cutscene
    return () => clearTimeout(t);
  }, []);

  // ---------- Music (autoplay with graceful fallback) ----------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const tryPlay = async () => {
      try {
        await audio.play();
        setShowUnmute(false);
      } catch (e) {
        setShowUnmute(true); // Show Unmute button if autoplay blocked
      }
    };
    tryPlay();
  }, []);

  const handleUnmute = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.muted = false;
        await audioRef.current.play();
        setShowUnmute(false);
      }
    } catch (_) {}
  };

  // ---------- Starry background (canvas) ----------
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const stars = Array.from({ length: 220 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.2,
      o: Math.random() * 0.9 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        ctx.globalAlpha = s.o;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  // ---------- Carousel (10 photos) ----------
  useEffect(() => {
    const id = setInterval(() => setCarouselIndex((i) => (i + 1) % 10), 3000);
    return () => clearInterval(id);
  }, []);

  // ---------- Fireworks (canvas) ----------
  const fireworksRef = useRef([]);
  useEffect(() => {
    const canvas = fwCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const rnd = (min, max) => Math.random() * (max - min) + min;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arr = fireworksRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        ctx.fillStyle = `hsl(${rnd(0, 360)},100%,50%)`;
        ctx.fillRect(p.x, p.y, 2, 2);
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) arr.splice(i, 1);
      }
      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener("resize", setSize);
  }, []);

  const createFirework = (x, y) => {
    const arr = fireworksRef.current;
    for (let i = 0; i < 110; i++) {
      arr.push({ x, y, dx: Math.random() * 6 - 3, dy: Math.random() * 6 - 3, life: 100 });
    }
  };

  // ---------- Floating hearts (DOM elements) ----------
  useEffect(() => {
    const spawn = () => {
      const h = document.createElement("div");
      h.textContent = "💜";
      h.style.position = "fixed";
      h.style.left = Math.random() * 100 + "vw";
      h.style.top = "100vh";
      h.style.fontSize = Math.random() * 20 + 20 + "px";
      h.style.animation = "floatUp 5s linear forwards";
      h.style.pointerEvents = "none";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 5100);
    };
    const id = setInterval(spawn, 480);
    return () => clearInterval(id);
  }, []);

  // ---------- Surprise message + fireworks ----------
  const onSurpriseClick = () => {
    if (msgRef.current) {
      msgRef.current.style.animation = "slideUpMessage 3s forwards";
    }
    setTimeout(() => createFirework(window.innerWidth / 2, window.innerHeight / 2), 1400);
  };

  return (
    <div style={{ background: "black", color: "white", textAlign: "center", minHeight: "100vh" }}>
      {/* Extra styles used by the cutscene & misc effects */}
      <style>{`
        /* Cutscene */
        .cutscene {
          position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; flex-direction: column;
          background: radial-gradient(circle at center, #06000a, #140018, #000);
          animation: introFadeOut 1s ease-in-out 5s forwards;
          overflow: hidden;
        }
        .cut-title { font-size: 3rem; color: #d8b4fe; text-shadow: 0 0 25px #8b5cf6, 0 0 60px #7e22ce; animation: titlePop 1.5s ease-out; margin: 0; }
        .cut-sub { color: #ffffff; margin-top: .5rem; font-size: 1.25rem; letter-spacing: .5px; opacity: .9; animation: subFade 2.2s ease-in; }
        .cut-photos { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(5, 1fr); grid-auto-rows: 1fr; gap: 8px; opacity: .15; filter: blur(1px); }
        .cut-photos div { background-size: cover; background-position: center; animation: photoDrift 6s ease-in-out infinite alternate; }

        @keyframes introFadeOut { to { opacity: 0; visibility: hidden; } }
        @keyframes titlePop { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes subFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes photoDrift { from { transform: scale(1) translateY(0); } to { transform: scale(1.06) translateY(-6px); } }
      `}</style>

      {/* Audio (autoplay, loop). Place /public/music.mp3 for a custom track */}
      <audio ref={audioRef} src="/music.mp3" loop autoPlay muted={false} />

      {/* Background canvases */}
      <canvas id="backgroundCanvas" ref={bgCanvasRef} />
      <canvas id="fireworksCanvas" ref={fwCanvasRef} />

      {/* Intro Cutscene */}
      {showIntro && (
        <div className="cutscene">
          {/* subtle photo mosaic using your first 10 images */}
          <div className="cut-photos">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ backgroundImage: `url(/photo${i + 1}.png)` }} />
            ))}
          </div>
          <h1 className="cut-title">💜 Yassine Presents 💜</h1>
          <h2 className="cut-sub">A Magical Birthday Surprise for Laila</h2>
        </div>
      )}

      {/* Main Content */}
      {!showIntro && (
        <>
          <h1>Laila ✨💜</h1>

          <div className="carousel">
            {Array.from({ length: 10 }).map((_, i) => (
              <img
                key={i}
                src={`/photo${i + 1}.png`}
                className={carouselIndex === i ? "active" : ""}
                alt={`Laila ${i + 1}`}
              />
            ))}
          </div>

          <div className="letter">
            <h2>Happy Birthday Laila 💜</h2>
            <p>
              Laila, my love, my light, my everything... Every single day with you feels like a dream I never want to wake up from.
              Your smile melts away every worry, your laugh makes my heart dance, and your presence turns the ordinary into pure magic.
              I cherish every moment we’ve shared — from our sweetest memories to the quiet, simple times — because they are ours, and they are priceless.
              You’ve shown me what love truly means: patience, kindness, and devotion. You’ve made me a better man in every way.
              Today, on your special day, I want you to feel the depth of my love for you in every heartbeat. You are the cutest, the most beautiful,
              and the most precious soul I have ever known. I promise to always protect your heart, to make you smile when you’re sad, to hold you close
              when you need comfort, and to celebrate you every single day. Happy birthday, my love. Here’s to many more years of laughter, love,
              and endless adventures together. 💜
            </p>
          </div>

          <button id="surpriseBtn" onClick={onSurpriseClick}>🎁 Click for Surprise 🎁</button>

          <div id="birthdayMsg" ref={msgRef}>Happy Birthday ML 💜</div>
        </>
      )}

      {/* Unmute overlay if needed */}
      {showUnmute && (
        <button
          onClick={handleUnmute}
          style={{ position: "fixed", right: 16, bottom: 16, padding: "10px 14px", borderRadius: 999, border: "2px solid #000",
                   background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", boxShadow: "0 0 18px #a855f7" }}
        >
          🔊 Unmute Music
        </button>
      )}
    </div>
  );
}
