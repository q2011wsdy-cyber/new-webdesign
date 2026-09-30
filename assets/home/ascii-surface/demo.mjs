// Procedural source media. These are deliberately labelled as examples, not uploaded video.
export function makeDemo() { const canvas = document.createElement('canvas'); canvas.width = canvas.height = 960; return canvas; }
export function drawDemo(canvas, name, time) {
  const ctx = canvas.getContext('2d'), s = canvas.width / 960;
  ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, 960, 960);
  if (name === 'orbit') { drawOrbit(ctx, time); return; }
  if (name === 'still') { drawStill(ctx); return; }
  const open = .5 - .5 * Math.cos(time / 8 * Math.PI * 2), spread = .24 + .76 * open;
  ctx.save(); ctx.translate(480, 442);
  // Curved stalk, shaded leaves, then overlapping petal layers.
  ctx.strokeStyle = '#5a6642'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 33); ctx.bezierCurveTo(-42, 235, 46, 333, -18, 489); ctx.stroke();
  for (const side of [-1, 1]) { ctx.save(); ctx.translate(0, 258 + side * 48); ctx.scale(side, 1); const g = ctx.createLinearGradient(0, 0, 145, -40); g.addColorStop(0, '#4d6135'); g.addColorStop(.45, '#a3af65'); g.addColorStop(1, '#30462f'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(64, -106, 131, -76, 169, -82); ctx.bezierCurveTo(134, -20, 66, 37, 0, 0); ctx.fill(); ctx.restore(); }
  for (let layer = 0; layer < 3; layer++) {
    const count = [9, 8, 7][layer], length = [350, 272, 188][layer] * spread, width = [119, 105, 84][layer] * (.45 + .55 * open);
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + layer * .32 + .07 * Math.sin(time * .6);
      ctx.save(); ctx.rotate(angle); ctx.scale(1, .83 + .17 * Math.sin(angle + .4));
      const grad = ctx.createLinearGradient(0, 12, 0, -length);
      grad.addColorStop(0, '#563018'); grad.addColorStop(.2, '#ac6230'); grad.addColorStop(.48, i % 2 ? '#d9b481' : '#f3d3a6'); grad.addColorStop(.78, '#e5ded0'); grad.addColorStop(1, '#847b6e');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(-9, 15); ctx.bezierCurveTo(-width * .18, -length * .28, -width * 1.28, -length * .67, -width * .65, -length * .88); ctx.bezierCurveTo(-width * .28, -length * 1.12, width * .75, -length * 1.03, width * .87, -length * .79); ctx.bezierCurveTo(width * 1.04, -length * .47, width * .12, -length * .07, 9, 15); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip();
      for (let ridge = -5; ridge <= 5; ridge++) { ctx.strokeStyle = `rgba(${ridge % 2 ? '64,37,20' : '255,249,227'},${ridge % 2 ? .2 : .18})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ridge * 1.8, 6); ctx.bezierCurveTo(ridge * 8, -length * .25, ridge * width * .12, -length * .57, ridge * width * .16, -length * 1.04); ctx.stroke(); }
      ctx.restore(); ctx.restore();
    }
  }
  const heart = ctx.createRadialGradient(-8, -8, 2, 0, 0, 66 * spread); heart.addColorStop(0, '#ffeeaa'); heart.addColorStop(.6, '#b87e2a'); heart.addColorStop(1, '#563719'); ctx.fillStyle = heart; ctx.beginPath(); ctx.arc(0, 0, 63 * spread, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 160; i++) { const theta = i * 2.39996, r = Math.sqrt(i / 160) * 64 * spread; ctx.fillStyle = i % 4 ? '#eed68c' : '#664420'; ctx.beginPath(); ctx.ellipse(Math.cos(theta) * r, Math.sin(theta) * r, 2.1, 3.3, theta, 0, 6.29); ctx.fill(); }
  ctx.restore();
}
function drawOrbit(ctx, time) {
  ctx.save(); ctx.translate(480, 480); ctx.rotate(time * .15);
  for (let layer = 0; layer < 140; layer++) {
    const depth = layer / 140, radius = 85 + depth * 260;
    ctx.strokeStyle = `hsla(${165 + depth * 150},60%,${25 + 60 * Math.sin(depth * Math.PI)},${.3 + depth * .5})`; ctx.lineWidth = 3;
    ctx.beginPath(); for (let i = 0; i <= 220; i++) { const a = i / 220 * Math.PI * 2; const wave = Math.sin(a * 3 + depth * 7 + time * .8) * (18 + 40 * depth); const r = radius + wave; const x = Math.cos(a) * r, y = Math.sin(a) * r * (.63 + .18 * Math.cos(depth * 6 + time * .4)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  } ctx.restore();
}
function drawStill(ctx) {
  const orb = ctx.createRadialGradient(366, 270, 4, 450, 405, 240); orb.addColorStop(0, '#ffe9bc'); orb.addColorStop(.28, '#e7a37c'); orb.addColorStop(.65, '#bc597b'); orb.addColorStop(1, '#302740'); ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(450, 405, 240, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(480, 460); ctx.rotate(-.35); const ring = ctx.createLinearGradient(-340, 0, 340, 0); ring.addColorStop(0, '#596e62'); ring.addColorStop(.4, '#dfdabc'); ring.addColorStop(1, '#405e73'); ctx.strokeStyle = ring; ctx.lineWidth = 32; ctx.beginPath(); ctx.ellipse(0, 0, 350, 125, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
  const base = ctx.createLinearGradient(250, 720, 670, 820); base.addColorStop(0, '#84909f'); base.addColorStop(.4, '#e6c5a5'); base.addColorStop(1, '#51484b'); ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(470, 784, 220, 62, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(250, 737, 440, 48); ctx.fillStyle = '#d2b69a'; ctx.beginPath(); ctx.ellipse(470, 737, 220, 62, 0, 0, Math.PI * 2); ctx.fill();
}
