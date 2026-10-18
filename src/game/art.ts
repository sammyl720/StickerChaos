import Phaser from 'phaser';
import { ENTITY_KINDS, type EntityKind } from './model';

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, stroke = '#3d2e67', line = 5): void {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  if (line) { ctx.lineWidth = line; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string, stroke = '#3d2e67', line = 5): void {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  if (line) { ctx.lineWidth = line; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function eyes(ctx: CanvasRenderingContext2D, y = 55, spacing = 25): void {
  ellipse(ctx, 64 - spacing, y, 14, 19, '#fff', '#3d2e67', 3);
  ellipse(ctx, 64 + spacing, y, 14, 19, '#fff', '#3d2e67', 3);
  ellipse(ctx, 67 - spacing, y + 3, 6, 10, '#29204a', '#29204a', 0);
  ellipse(ctx, 67 + spacing, y + 3, 6, 10, '#29204a', '#29204a', 0);
  ellipse(ctx, 69 - spacing, y - 1, 2, 3, '#fff', '#fff', 0);
  ellipse(ctx, 69 + spacing, y - 1, 2, 3, '#fff', '#fff', 0);
  ctx.beginPath(); ctx.arc(64, y + 36, 12, 0.15, Math.PI - 0.15); ctx.strokeStyle = '#3d2e67'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
}
function draw(ctx: CanvasRenderingContext2D, kind: EntityKind): void {
  ctx.clearRect(0, 0, 128, 128);
  ellipse(ctx, 64, 109, 39, 9, 'rgba(42,27,86,.17)', 'transparent', 0);
  const palettes: Record<EntityKind, string> = { bandit:'#8657dc', chicken:'#fff7e1', apple:'#f75d66', snail:'#f2b86f', rock:'#9097ad', boulder:'#7e8a9c', ball:'#fc9cce', turtle:'#61cbb3', robot:'#70bce6', knight:'#a3aed6', key:'#ffcf56', frog:'#78d18b', crate:'#dfae71' };
  const fill = palettes[kind];
  if (kind === 'bandit') {
    ellipse(ctx, 27, 35, 15, 22, '#b08af2'); ellipse(ctx, 101, 35, 15, 22, '#b08af2');
    rounded(ctx, 91, 57, 24, 43, 7, '#ffc45f');
    ellipse(ctx, 64, 66, 49, 47, fill);
    ellipse(ctx, 47, 39, 23, 10, '#ae90ef', 'transparent', 0);
    eyes(ctx, 62, 25);
  } else if (kind === 'chicken') {
    ellipse(ctx, 30, 31, 10, 16, '#f24c6c'); ellipse(ctx, 52, 24, 11, 18, '#f24c6c'); ellipse(ctx, 73, 29, 10, 16, '#f24c6c');
    ellipse(ctx, 64, 68, 48, 43, fill); ellipse(ctx, 31, 80, 17, 21, '#ffedcf', '#d3c5b0', 3);
    eyes(ctx, 58, 23);
    ctx.beginPath(); ctx.moveTo(55,83); ctx.lineTo(74,83); ctx.lineTo(64,95); ctx.closePath(); ctx.fillStyle='#ffb745'; ctx.fill(); ctx.strokeStyle='#b97a2b'; ctx.lineWidth=3; ctx.stroke();
  } else if (kind === 'apple') {
    ctx.beginPath(); ctx.moveTo(63,30); ctx.lineTo(67,13); ctx.strokeStyle='#694e36'; ctx.lineWidth=7; ctx.stroke();
    ellipse(ctx, 85, 25, 19, 9, '#64b773', '#38794a', 3);
    ellipse(ctx, 49, 71, 34, 39, fill); ellipse(ctx, 78, 71, 34, 39, fill);
    ellipse(ctx, 42, 52, 10, 5, '#ffbbc2', 'transparent', 0); eyes(ctx, 66, 21);
  } else if (kind === 'snail') {
    ellipse(ctx, 77, 71, 40, 39, '#cb8cdf');
    ellipse(ctx, 76, 73, 22, 22, '#ecbcfa', '#905ca8', 4); ellipse(ctx, 76, 73, 8, 8, '#cb8cdf', '#905ca8', 3);
    ellipse(ctx, 43, 85, 32, 24, fill);
    ctx.beginPath();ctx.moveTo(31,69);ctx.lineTo(26,40);ctx.moveTo(56,70);ctx.lineTo(59,39);ctx.strokeStyle='#785346';ctx.lineWidth=5;ctx.stroke();
    ellipse(ctx, 26, 36, 10, 11, '#fff'); ellipse(ctx, 59, 36, 10, 11, '#fff'); ellipse(ctx, 28, 38, 4, 6, '#29204a','#29204a',0); ellipse(ctx, 61, 38, 4, 6, '#29204a','#29204a',0);
  } else if (kind === 'rock' || kind === 'boulder') {
    ctx.beginPath();ctx.moveTo(20,78);ctx.lineTo(35,40);ctx.lineTo(73,27);ctx.lineTo(107,53);ctx.lineTo(111,88);ctx.lineTo(79,106);ctx.lineTo(39,101);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#4e5871';ctx.lineWidth=5;ctx.stroke();
    ctx.beginPath();ctx.moveTo(35,42);ctx.lineTo(74,28);ctx.lineTo(60,51);ctx.closePath();ctx.fillStyle='#c7cedb';ctx.fill();eyes(ctx, 69, 23);
  } else if (kind === 'robot') {
    rounded(ctx, 20, 31, 88, 76, 17, fill);rounded(ctx, 27, 40, 74, 48, 12, '#e4f9ff', '#4e6b98', 4);
    ctx.beginPath();ctx.moveTo(64,31);ctx.lineTo(64,17);ctx.strokeStyle='#4e6b98';ctx.lineWidth=5;ctx.stroke();ellipse(ctx, 64, 15, 8, 8, '#ff6b94');eyes(ctx, 62, 22);
  } else if (kind === 'knight') {
    rounded(ctx, 23, 37, 82, 68, 18, fill);ellipse(ctx, 64, 35, 34, 27, '#c5d1eb');
    rounded(ctx, 32, 51, 64, 24, 8, '#566590');eyes(ctx, 58, 20); ellipse(ctx, 64, 18, 8, 15, '#ff777c');
  } else if (kind === 'turtle') {
    ellipse(ctx, 64, 69, 48, 37, '#4da888');ellipse(ctx, 64, 64, 37, 29, fill, '#2c826b',4);
    ctx.beginPath();ctx.moveTo(35,55);ctx.lineTo(93,76);ctx.moveTo(72,39);ctx.lineTo(44,84);ctx.strokeStyle='#2c826b';ctx.lineWidth=3;ctx.stroke();eyes(ctx, 68, 23);
  } else if (kind === 'ball') {
    ellipse(ctx, 64, 65, 47, 47, fill);ellipse(ctx, 47, 45, 16, 9, '#ffd6ec','transparent',0);eyes(ctx,62,23);
  } else if (kind === 'frog') {
    ellipse(ctx, 33, 36, 15, 19, '#55b96f');ellipse(ctx, 95, 36, 15, 19, '#55b96f');ellipse(ctx, 64, 70, 49, 39, fill);eyes(ctx,57,28);
  } else if (kind === 'crate') {
    rounded(ctx, 19, 26, 90, 80, 10, fill, '#9c6a45', 6);
    ctx.beginPath();ctx.moveTo(30,39);ctx.lineTo(97,96);ctx.moveTo(98,39);ctx.lineTo(30,96);ctx.strokeStyle='#f4ce91';ctx.lineWidth=7;ctx.stroke();eyes(ctx,61,22);
  } else if (kind === 'key') {
    ellipse(ctx, 48, 50, 25, 25, fill, '#ae8543',6);ellipse(ctx, 48, 50, 11, 11, '#fff1ba','transparent',0);
    rounded(ctx, 62, 48, 44, 16, 5, fill, '#ae8543',4);rounded(ctx, 91, 58, 11, 18, 2, fill, '#ae8543',3);
  }
}

export function createArt(scene: Phaser.Scene): void {
  for (const kind of ENTITY_KINDS) {
    const key = `character-${kind}`;
    if (scene.textures.exists(key)) continue;
    const texture = scene.textures.createCanvas(key, 128, 128);
    if (!texture) continue;
    draw(texture.getContext(), kind); texture.refresh();
  }
}
