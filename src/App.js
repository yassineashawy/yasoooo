import React, { useEffect, useRef, useState } from "react";
import "./Birthday.css";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showUnmute, setShowUnmute] = useState(false);

  const [showSurpriseCutscene, setShowSurpriseCutscene] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  const bgCanvasRef = useRef(null);
  const fwCanvasRef = useRef(null);
  const streaksCanvasRef = useRef(null);
  const audioRef = useRef(null);
  const msgRef = useRef(null);

  const fireworksRef = useRef([]);
  const PUBLIC = process.env.PUBLIC_URL || "";
  const exts = ["png", "jpg", "jpeg", "PNG", "JPG", "JPEG"];

  // Intro timing
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Music autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const tryPlay = async () => {
      try {
        await audio.play();
        setShowUnmute(false);
      } catch {
        setShowUnmute(true);
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
    } catch {}
  };

  // Starry background
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

  // Carousel
  useEffect(() => {
    const id = setInterval(() => setCarouselIndex((i) => (i + 1) % 10), 3000);
    return () => clearInterval(id);
  }, []);

  // Fireworks
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

  // Hearts
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

  // Surprise click -> run cutscene
  const onSurpriseClick = () => {
    setShowSurpriseCutscene(true);
    setTimeout(() => {
      createFirework(window.innerWidth / 2, window.innerHeight / 2);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);
    }, 1200);
    setTimeout(() => {
      setShowFinalText(true);
    }, 2200);
  };

  // Fast glowing lines animation
  useEffect(() => {
    if (!showSurpriseCutscene) return;
    const canvas = streaksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const streaks = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: Math.random() * 25 + 20,
      length: Math.random() * 60 + 40,
      hue: Math.random() * 360
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let s of streaks) {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.length, s.y);
        grad.addColorStop(0, `hsla(${s.hue},100%,70%,1)`);
        grad.addColorStop(1, `hsla(${s.hue},100%,50%,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length, s.y);
        ctx.stroke();

        s.x -= s.speed;
        if (s.x + s.length < 0) {
          s.x = window.innerWidth + Math.random() * 100;
          s.y = Math.random() * window.innerHeight;
          s.speed = Math.random() * 25 + 20;
          s.length = Math.random() * 60 + 40;
          s.hue = Math.random() * 360;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    setTimeout(() => cancelAnimationFrame(raf), 1500);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, [showSurpriseCutscene]);

  // Image error fallback
  const onImgError = (i) => (e) => {
    const el = e.currentTarget;
    const tried = parseInt(el.dataset.try || "0", 10);
    if (tried < exts.length - 1) {
      el.dataset.try = String(tried + 1);
      el.src = `${PUBLIC}/photo${i + 1}.${exts[tried + 1]}`;
    } else {
      el.style.display = "none";
    }
  };

  return (
    <div style={{ background: "black", color: "white", textAlign: "center", minHeight: "100vh" }}
      className={shakeScreen ? "shake" : ""}
    >
      <style>{`
        .cutscene {
          position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; flex-direction: column;
          background: radial-gradient(circle at center, #06000a, #140018, #000);
          animation: introFadeOut 1s ease-in-out 5s forwards;
          overflow: hidden;
        }
        .cut-title { font-size: 3rem; color: #d8b4fe; text-shadow: 0 0 25px #8b5cf6, 0 0 60px #7e22ce; animation: titlePop 1.5s ease-out; margin: 0; }
        .cut-sub { color: #ffffff; margin-top: .5rem; font-size: 1.25rem; letter-spacing: .5px; opacity: .9; animation: subFade 2.2s ease-in; }
        .cut-photos { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(5, 1fr); grid-auto-rows: 1fr; gap: 8px; opacity: .15; filter: blur(1px); }
        .cut-photos img { width: 100%; height: 100%; object-fit: cover; animation: photoDrift 6s ease-in-out infinite alternate; }
        @keyframes introFadeOut { to { opacity: 0; visibility: hidden; } }
        @keyframes titlePop { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes subFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes photoDrift { from { transform: scale(1) translateY(0); } to { transform: scale(1.06) translateY(-6px); } }
        @keyframes floatUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100vh); opacity: 0; } }
        @keyframes slideInText { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .shake {
          animation: shakeAnim 0.5s ease;
        }
        @keyframes shakeAnim {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(-10px, 5px); }
          50% { transform: translate(8px, -8px); }
          75% { transform: translate(-5px, 6px); }
        }
      `}</style>

      <audio ref={audioRef} src={`${PUBLIC}/music.mp3`} loop autoPlay muted={false} />

      <canvas id="backgroundCanvas" ref={bgCanvasRef} />
      <canvas id="fireworksCanvas" ref={fwCanvasRef} />

      {showIntro && (
        <div className="cutscene">
          <div className="cut-photos">
            {Array.from({ length: 10 }).map((_, i) => (
              <img key={i} src={`${PUBLIC}/photo${i + 1}.png`} data-try={0} onError={onImgError(i)} alt={`Laila ${i + 1}`} />
            ))}
          </div>
          <h1 className="cut-title">💜 Yassine Presents 💜</h1>
          <h2 className="cut-sub">A Magical Birthday Surprise for Laila</h2>
        </div>
      )}

      {!showIntro && (
        <>
          <h1>Laila ✨💜</h1>
          <div className="carousel">
            {Array.from({ length: 10 }).map((_, i) => (
              <img key={i} src={`${PUBLIC}/photo${i + 1}.png`} data-try={0} onError={onImgError(i)}
                className={carouselIndex === i ? "active" : ""} alt={`Laila ${i + 1}`} />
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

      {showUnmute && (
        <button onClick={handleUnmute} style={{
          position: "fixed", right: 16, bottom: 16, padding: "10px 14px",
          borderRadius: 999, border: "2px solid #000",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff", boxShadow: "0 0 18px #a855f7"
        }}>
          🔊 Unmute Music
        </button>
      )}

      {/* Surprise Cutscene Layer */}
      {showSurpriseCutscene && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "black" }}>
          <canvas ref={streaksCanvasRef} style={{ position: "absolute", inset: 0 }} />
          {showFinalText && (
            <div style={{
              position: "absolute", inset: 0, background: "black",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "slideInText 2s ease forwards"
            }}>
              <h1 style={{
                fontSize: "4rem",
                color: "#ff66ff",
                textShadow: "0 0 20px #ff00ff, 0 0 50px #ff66ff, 0 0 100px #ff00ff"
              }}>
                Happy birthday my queen
              </h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
