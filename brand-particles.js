/* mochibullet ブランド公式パーティクル背景 (vanilla 版)
 *
 * 使い方:
 *   <link rel="stylesheet" href="brand-particles.css">
 *   <script id="brand-particles-script" src="brand-particles.js" defer
 *           data-intensity="normal"></script>  <!-- or "subtle" / "minimal" -->
 *
 * 仕様詳細: ~/.claude/projects/-root/memory/project_mochibullet_particles.md
 */
(function () {
  'use strict';

  const scriptTag =
    document.getElementById('brand-particles-script') ||
    document.currentScript;
  const intensity = (scriptTag && scriptTag.dataset && scriptTag.dataset.intensity) || 'normal';

  const PROFILES = {
    normal:  { count: 38, opacityMul: 1.0,  opMin: 0.10, opAdd: 0.40 },
    subtle:  { count: 20, opacityMul: 0.65, opMin: 0.06, opAdd: 0.25 },
    minimal: { count: 12, opacityMul: 0.42, opMin: 0.04, opAdd: 0.15 },
  };
  const cfg = PROFILES[intensity] || PROFILES.normal;

  const PALETTE = [
    '20, 184, 166', // 翡翠 (teal-500)
    '139, 92, 246', // 翡翠寄り紫 (violet-500)
    '132, 204, 22', // 翡翠寄り黄緑 (lime-500)
  ];

  const MOUSE_RADIUS = 120;

  function init() {
    const canvas = document.createElement('canvas');
    canvas.className = 'brand-particle-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationId;
    let particles = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function makeParticles() {
      resize();
      particles = [];
      for (let i = 0; i < cfg.count; i++) {
        const dx = (Math.random() - 0.5) * 0.3;
        const dy = (Math.random() - 0.5) * 0.3;

        // 極端なサイズバリエ
        const sizeRoll = Math.random();
        const r =
          sizeRoll < 0.15 ? 55 + Math.random() * 45 :
          sizeRoll < 0.55 ? 20 + Math.random() * 25 :
          2 + Math.random() * 12;

        // 30% は強めぼんやり点滅
        const flashy = Math.random() < 0.3;
        const pulseAmp = flashy
          ? 0.30 + Math.random() * 0.25
          : 0.05 + Math.random() * 0.10;
        const pulseSpeed = 0.005 + Math.random() * 0.03;

        // 色: 80% 翡翠 / 10% 紫 / 10% 黄緑
        const colorRoll = Math.random();
        const color = colorRoll < 0.10 ? PALETTE[1]
                     : colorRoll < 0.20 ? PALETTE[2]
                     : PALETTE[0];

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r,
          dx, dy,
          baseDx: dx, baseDy: dy,
          opacity: (Math.random() * cfg.opAdd + cfg.opMin) * cfg.opacityMul,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed, pulseAmp,
          color,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        if (!reduceMotion) {
          const diffX = p.x - mouse.x;
          const diffY = p.y - mouse.y;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            p.dx += (diffX / dist) * force * 0.8;
            p.dy += (diffY / dist) * force * 0.8;
          }
          p.dx += (p.baseDx - p.dx) * 0.05;
          p.dy += (p.baseDy - p.dy) * 0.05;
          p.x += p.dx;
          p.y += p.dy;
          p.pulse += p.pulseSpeed;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const glow = Math.max(0, p.opacity + Math.sin(p.pulse) * p.pulseAmp);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0,   'rgba(' + p.color + ', ' + glow + ')');
        gradient.addColorStop(0.6, 'rgba(' + p.color + ', ' + (glow * 0.4) + ')');
        gradient.addColorStop(1,   'rgba(' + p.color + ', 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    }

    makeParticles();
    draw();

    window.addEventListener('resize', makeParticles);
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('touchmove', function (e) {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
