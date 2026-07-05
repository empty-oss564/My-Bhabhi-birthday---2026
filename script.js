/* =================================================================
   BHABHI'S BIRTHDAY — SCRIPT
   Organized into small independent modules so nothing here can
   throw and freeze the page. Every section is wrapped defensively.
   ================================================================= */

(function () {
  'use strict';

  const fxLayer = document.getElementById('fx-layer');

  /* ------------------------------------------------------------- */
  /* 1. PERSISTENT STARFIELD + FIREFLIES + MAGIC DUST (canvas)      */
  /* ------------------------------------------------------------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [], fireflies = [], dust = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initField() {
    const w = window.innerWidth, h = window.innerHeight;
    const starCount = w < 700 ? 70 : 140;
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.85,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01
    }));

    const fireflyCount = w < 700 ? 8 : 16;
    fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * w,
      y: h * 0.5 + Math.random() * h * 0.5,
      baseY: 0,
      angle: Math.random() * Math.PI * 2,
      radius: 30 + Math.random() * 60,
      speed: 0.005 + Math.random() * 0.01,
      glow: Math.random()
    }));
    fireflies.forEach(f => (f.baseY = f.y));

    const dustCount = w < 700 ? 20 : 40;
    dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.15 + 0.05),
      vx: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.5 + 0.2
    }));
  }

  let t = 0;
  function drawField() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // twinkling stars
    stars.forEach(s => {
      const tw = 0.55 + 0.45 * Math.sin(t * s.speed * 10 + s.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,244,214,${tw})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // fireflies drifting in slow circles with soft glow
    fireflies.forEach(f => {
      f.angle += f.speed;
      const x = f.x + Math.cos(f.angle) * f.radius;
      const y = f.baseY + Math.sin(f.angle * 1.3) * f.radius * 0.6;
      const glow = 0.4 + 0.6 * Math.sin(t * 0.05 + f.glow * 10);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grad.addColorStop(0, `rgba(240,200,102,${0.8 * glow})`);
      grad.addColorStop(1, 'rgba(240,200,102,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 8, y - 8, 16, 16);
    });

    // rising magic dust
    dust.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,233,176,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    t += 1;
    requestAnimationFrame(drawField);
  }

  try {
    resizeCanvas();
    initField();
    requestAnimationFrame(drawField);
    window.addEventListener('resize', () => { resizeCanvas(); initField(); });
  } catch (e) { /* canvas is purely decorative — safe to skip on failure */ }

  /* floating clouds (DOM, simple + cheap) */
  try {
    const cloudsWrap = document.getElementById('clouds');
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('span');
      const top = 5 + Math.random() * 30;
      c.style.top = top + '%';
      c.style.left = '-300px';
      c.style.animationDuration = (40 + Math.random() * 30) + 's';
      c.style.animationDelay = (-Math.random() * 40) + 's';
      c.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
      cloudsWrap.appendChild(c);
    }
  } catch (e) {}

  /* ------------------------------------------------------------- */
  /* 2. FX HELPERS — confetti, petals, hearts, sparkles, fireworks  */
  /* ------------------------------------------------------------- */
  const PALETTE = ['#f0c866', '#ffe9b0', '#ff8fab', '#e94f7a', '#fdf3e2', '#7be0d1'];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function spawnAndClean(el, life) {
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), life);
  }

  function confettiBurst(count = 60) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const size = rand(6, 12);
      el.style.width = size + 'px';
      el.style.height = size * rand(0.4, 1) + 'px';
      el.style.left = rand(0, 100) + 'vw';
      el.style.background = pick(PALETTE);
      const dur = rand(2.4, 4.2);
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = rand(0, 0.6) + 's';
      spawnAndClean(el, (dur + 1) * 1000);
    }
  }

  function petalFall(count = 18) {
    const petals = ['🌸', '🌺', '🌹'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'petal';
      el.textContent = pick(petals);
      el.style.left = rand(0, 100) + 'vw';
      el.style.setProperty('--sway', rand(-60, 60) + 'px');
      const dur = rand(4, 7);
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = rand(0, 1) + 's';
      spawnAndClean(el, (dur + 1.2) * 1000);
    }
  }

  function heartsFloat(count = 14) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'heart-float';
      el.textContent = '💖';
      el.style.left = rand(0, 100) + 'vw';
      el.style.setProperty('--sway', rand(-50, 50) + 'px');
      const dur = rand(3.5, 6);
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = rand(0, 0.8) + 's';
      spawnAndClean(el, (dur + 1) * 1000);
    }
  }

  function sparkleBurstAt(x, y, count = 14) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'sparkle';
      const angle = rand(0, Math.PI * 2);
      const dist = rand(10, 60);
      el.style.left = (x + Math.cos(angle) * dist) + 'px';
      el.style.top = (y + Math.sin(angle) * dist) + 'px';
      el.style.animationDelay = rand(0, 0.2) + 's';
      spawnAndClean(el, 1200);
    }
  }

  function fireworkAt(x, y, count = 26) {
    const color = pick(PALETTE);
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'firework';
      const angle = (Math.PI * 2 * i) / count;
      const dist = rand(60, 140);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.background = color;
      el.style.boxShadow = `0 0 8px 2px ${color}`;
      spawnAndClean(el, 1300);
    }
  }

  function fireworksShow(bursts = 5) {
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        fireworkAt(rand(window.innerWidth * 0.15, window.innerWidth * 0.85), rand(window.innerHeight * 0.15, window.innerHeight * 0.55));
      }, i * 420);
    }
  }

  function celebrationBurst() {
    confettiBurst(70);
    petalFall(16);
    heartsFloat(12);
    fireworksShow(5);
  }

  // gentle continuous ambience: an occasional petal or heart drifting by
  setInterval(() => { if (Math.random() < 0.6) petalFall(2); }, 4200);
  setInterval(() => { if (Math.random() < 0.5) heartsFloat(1); }, 5200);

  /* ------------------------------------------------------------- */
  /* 3. OPENING SCENE — gift box → reveal                           */
  /* ------------------------------------------------------------- */
  const sceneOpening = document.getElementById('scene-opening');
  const giftBox = document.getElementById('gift-box');
  const heroTitle = document.getElementById('hero-title');

  function buildHeroLetters() {
    const text = '🎉 Happy Birthday, Bhabhi! 🎂';
    heroTitle.innerHTML = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = (i * 0.06) + 's';
      heroTitle.appendChild(span);
    });
  }
  buildHeroLetters();

  function openGift() {
    if (giftBox.classList.contains('opened')) return;
    giftBox.classList.add('opened');
    celebrationBurst();
    beginMusic(); // start the music right on this tap — the browser allows audio here because it's a direct user gesture
    const rect = giftBox.getBoundingClientRect();
    sparkleBurstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);

    // camera zoom-ish transition then reveal main content
    document.body.style.transition = 'filter .8s ease';
    document.body.style.filter = 'brightness(1.4)';

    setTimeout(() => {
      sceneOpening.classList.add('fading-out');
      document.body.style.filter = '';
      document.body.style.overflow = 'auto';
      // re-trigger hero letter animation now that it's visible
      buildHeroLetters();
      startWishes();
    }, 550);

    setTimeout(() => { sceneOpening.style.display = 'none'; }, 1700);
  }

  giftBox.addEventListener('click', openGift);
  giftBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openGift(); });

  // lock scroll until the gift is opened, so the intro is experienced fully
  document.body.style.overflow = 'hidden';

  /* ------------------------------------------------------------- */
  /* 4. WISHES TYPEWRITER                                           */
  /* ------------------------------------------------------------- */
  const wishes = [
    '✨ Wishing you endless happiness.',
    '✨ May God bless you with good health.',
    '✨ May all your dreams come true.',
    '✨ May success always follow you.',
    '✨ May your beautiful smile never fade.',
    '✨ May your life always be filled with love.',
    '✨ May peace, prosperity and happiness stay with you forever.',
    '✨ Thank you for being such a wonderful and caring Bhabhi.',
    '✨ You deserve all the happiness in the world.',
    '✨ Wishing you a fantastic birthday and an amazing year ahead.'
  ];
  const wishLine = document.getElementById('wish-line');
  const wishDots = document.getElementById('wish-dots');
  let wishesStarted = false;

  wishes.forEach(() => {
    const d = document.createElement('span');
    wishDots.appendChild(d);
  });

  function typeLine(text, done) {
    wishLine.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    let i = 0;
    const textNode = document.createTextNode('');
    wishLine.appendChild(textNode);
    wishLine.appendChild(cursor);
    const interval = setInterval(() => {
      textNode.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(done, 1600);
      }
    }, 35);
  }

  function runWishSequence(index) {
    if (index >= wishes.length) index = 0; // loop gently, keeps the page alive
    [...wishDots.children].forEach((d, i) => d.classList.toggle('active', i === index));
    typeLine(wishes[index], () => runWishSequence(index + 1));
  }

  function startWishes() {
    if (wishesStarted) return;
    wishesStarted = true;
    runWishSequence(0);
  }

  /* ------------------------------------------------------------- */
  /* 5. SCROLL REVEAL for every scene (keeps content permanent)     */
  /* ------------------------------------------------------------- */
  const scenes = document.querySelectorAll('.scene');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.25 });
  scenes.forEach(s => io.observe(s));

  /* ------------------------------------------------------------- */
  /* 6. HUB NAVIGATION                                              */
  /* ------------------------------------------------------------- */
  document.querySelectorAll('.hub-btn[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.goto);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------- */
  /* 7. CAKE — blow candles                                         */
  /* ------------------------------------------------------------- */
  const blowBtn = document.getElementById('blow-btn');
  const makeWish = document.getElementById('make-wish');
  const cake = document.getElementById('cake');

  blowBtn.addEventListener('click', () => {
    const candles = cake.querySelectorAll('.candle');
    let alreadyBlown = candles[0].classList.contains('blown');
    if (alreadyBlown) {
      candles.forEach(c => c.classList.remove('blown'));
      makeWish.classList.remove('show');
      return;
    }
    candles.forEach((c, i) => setTimeout(() => c.classList.add('blown'), i * 180));
    setTimeout(() => {
      celebrationBurst();
      const rect = cake.getBoundingClientRect();
      sparkleBurstAt(rect.left + rect.width / 2, rect.top, 20);
      makeWish.classList.add('show');
    }, 650);
  });

  /* ------------------------------------------------------------- */
  /* 8. PHOTO GALLERY — auto-load images, graceful fallback         */
  /* ------------------------------------------------------------- */
  document.querySelectorAll('.photo-frame[data-src]').forEach(frame => {
    const img = new Image();
    img.src = frame.dataset.src;
    img.alt = 'A cherished memory';
    img.onload = () => { frame.innerHTML = ''; frame.appendChild(img); };
    // onerror: do nothing — the pre-rendered .photo-fallback glyph stays visible
  });

  /* ------------------------------------------------------------- */
  /* 9. MEMORY BOX — reveal photos one by one                       */
  /* ------------------------------------------------------------- */
  const memoryOpenBtn = document.getElementById('memory-open-btn');
  const memoryStrip = document.getElementById('memory-strip');
  const memoryPhotos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg', 'photo6.jpg'];
  let memoryOpened = false;

  memoryOpenBtn.addEventListener('click', () => {
    if (memoryOpened) return;
    memoryOpened = true;
    celebrationBurst();
    memoryPhotos.forEach((src, i) => {
      setTimeout(() => {
        const item = document.createElement('div');
        item.className = 'memory-item';
        const fallback = document.createElement('div');
        fallback.className = 'photo-fallback';
        fallback.textContent = pick(['💞', '🌸', '✨', '📷', '💖']);
        item.appendChild(fallback);

        const img = new Image();
        img.src = src;
        img.onload = () => { item.innerHTML = ''; item.appendChild(img); };

        memoryStrip.appendChild(item);

        // little hearts + sparkles around the newly revealed photo
        const rect = item.getBoundingClientRect();
        sparkleBurstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
        for (let h = 0; h < 3; h++) {
          const heart = document.createElement('span');
          heart.className = 'memory-heart';
          heart.textContent = '💗';
          heart.style.left = (rect.left + rand(10, rect.width - 10)) + 'px';
          heart.style.top = (rect.top + rand(10, rect.height - 10)) + 'px';
          heart.style.position = 'fixed';
          document.body.appendChild(heart);
          setTimeout(() => heart.remove(), 1500);
        }
      }, i * 450);
    });
  });

  /* ------------------------------------------------------------- */
  /* 10. BALLOONS                                                   */
  /* ------------------------------------------------------------- */
  const balloonField = document.getElementById('balloon-field');
  const releaseBtn = document.getElementById('release-btn');
  const balloonColors = ['#ff8fab', '#f0c866', '#7be0d1', '#e94f7a', '#ffe9b0'];

  function buildBalloons(count = 16) {
    balloonField.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'balloon';
      b.style.left = (i * (100 / count)) + '%';
      b.style.background = pick(balloonColors);
      b.style.setProperty('--drift', rand(-80, 80) + 'px');
      b.style.setProperty('--spin', rand(-15, 15) + 'deg');
      balloonField.appendChild(b);
    }
  }
  buildBalloons();

  releaseBtn.addEventListener('click', () => {
    const balloons = balloonField.querySelectorAll('.balloon');
    balloons.forEach((b, i) => {
      setTimeout(() => b.classList.add('released'), i * 90);
    });
    celebrationBurst();
    setTimeout(buildBalloons, 4200);
  });

  /* ------------------------------------------------------------- */
  /* 11. MUSIC — real <audio> if available, gentle generative tone  */
  /*     as a graceful fallback so the button always works          */
  /* ------------------------------------------------------------- */
  const musicBtn = document.getElementById('music-toggle-btn');
  const musicLabel = document.getElementById('music-toggle-label');
  const audioEl = document.getElementById('bg-music');
  let musicPlaying = false;
  let audioCtx, ambienceNodes = [];

  function startAmbientTone() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.0, 523.25]; // soft C major arpeggio
      const master = audioCtx.createGain();
      master.gain.value = 0.05;
      master.connect(audioCtx.destination);
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = audioCtx.createGain();
        gain.gain.value = 0;
        osc.connect(gain).connect(master);
        osc.start();
        const now = audioCtx.currentTime;
        // gentle looping swell per note, staggered
        const lfo = audioCtx.createOscillator();
        lfo.frequency.value = 0.08 + i * 0.01;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.6;
        lfo.connect(lfoGain).connect(gain.gain);
        lfo.start();
        ambienceNodes.push(osc, lfo, gain, lfoGain);
      });
      ambienceNodes.push(master);
    } catch (e) { /* Web Audio unsupported — music simply stays off */ }
  }

  function stopAmbientTone() {
    ambienceNodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
    ambienceNodes = [];
  }

  function beginMusic() {
    if (musicPlaying) return;
    musicPlaying = true;
    musicLabel.textContent = 'Pause Birthday Music';
    audioEl.volume = 0.55;
    audioEl.play().catch(() => startAmbientTone());
  }

  function pauseMusic() {
    musicPlaying = false;
    musicLabel.textContent = 'Play Birthday Music';
    audioEl.pause();
    stopAmbientTone();
  }

  musicBtn.addEventListener('click', () => {
    if (musicPlaying) pauseMusic(); else beginMusic();
  });

  /* ------------------------------------------------------------- */
  /* 12. ENDING — continuous fireworks + replay                     */
  /* ------------------------------------------------------------- */
  const sceneEnding = document.getElementById('scene-ending');
  const replayBtn = document.getElementById('replay-btn');
  let endingCelebrated = false;

  const endingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !endingCelebrated) {
        endingCelebrated = true;
        celebrationBurst();
        setTimeout(celebrationBurst, 700);
        setTimeout(celebrationBurst, 1500);
      }
    });
  }, { threshold: 0.4 });
  endingObserver.observe(sceneEnding);

  replayBtn.addEventListener('click', () => {
    // reset opening scene
    sceneOpening.style.display = 'flex';
    sceneOpening.classList.remove('fading-out');
    giftBox.classList.remove('opened');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    // reset cake
    cake.querySelectorAll('.candle').forEach(c => c.classList.remove('blown'));
    makeWish.classList.remove('show');

    // reset memory box + balloons
    memoryStrip.innerHTML = '';
    memoryOpened = false;
    buildBalloons();

    endingCelebrated = false;
  });

})();
