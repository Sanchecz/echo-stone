import {
  activeLandmarkIds,
  getCell,
  getTargetPosition,
  LANDMARKS,
  type BlockType,
  type GameState,
  type Landmark,
} from "./game-core";

interface RenderOptions {
  width: number;
  height: number;
  time: number;
  reducedMotion: boolean;
}

interface Projection {
  tileWidth: number;
  tileHeight: number;
  blockHeight: number;
  centerX: number;
  centerY: number;
  cameraSum: number;
  cameraDiff: number;
}

type Palette = { top: string; left: string; right: string; line: string };

const BLOCK_PALETTES: Record<BlockType, Palette> = {
  grass: { top: "#748562", left: "#4d5d43", right: "#3f4d3a", line: "#25352d" },
  earth: { top: "#8b6849", left: "#654934", right: "#543d2d", line: "#342a25" },
  stone: { top: "#8e9794", left: "#636d6b", right: "#525c5b", line: "#343e3f" },
  wood: { top: "#b07946", left: "#75482d", right: "#603b28", line: "#3b2a22" },
  crystal: { top: "#7de7db", left: "#3aa8a3", right: "#287f83", line: "#b7fff6" },
  ancient: { top: "#c8b98d", left: "#756e59", right: "#5b584c", line: "#eee4c1" },
};

function diamondPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + tileWidth / 2, y + tileHeight / 2);
  context.lineTo(x, y + tileHeight);
  context.lineTo(x - tileWidth / 2, y + tileHeight / 2);
  context.closePath();
}

function screenPosition(projection: Projection, x: number, z: number, layerCount: number) {
  return {
    x:
      projection.centerX +
      ((x - z - projection.cameraDiff) * projection.tileWidth) / 2,
    y:
      projection.centerY +
      ((x + z - projection.cameraSum) * projection.tileHeight) / 2 -
      layerCount * projection.blockHeight,
  };
}

function drawBlock(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  projection: Projection,
  type: BlockType,
) {
  const { tileWidth, tileHeight, blockHeight } = projection;
  const palette = BLOCK_PALETTES[type];

  context.beginPath();
  context.moveTo(x - tileWidth / 2, y + tileHeight / 2);
  context.lineTo(x, y + tileHeight);
  context.lineTo(x, y + tileHeight + blockHeight);
  context.lineTo(x - tileWidth / 2, y + tileHeight / 2 + blockHeight);
  context.closePath();
  context.fillStyle = palette.left;
  context.fill();

  context.beginPath();
  context.moveTo(x + tileWidth / 2, y + tileHeight / 2);
  context.lineTo(x, y + tileHeight);
  context.lineTo(x, y + tileHeight + blockHeight);
  context.lineTo(x + tileWidth / 2, y + tileHeight / 2 + blockHeight);
  context.closePath();
  context.fillStyle = palette.right;
  context.fill();

  diamondPath(context, x, y, tileWidth, tileHeight);
  context.fillStyle = palette.top;
  context.fill();
  context.strokeStyle = palette.line;
  context.lineWidth = 0.8;
  context.stroke();

  if (type === "grass") {
    context.strokeStyle = "rgba(214, 226, 182, .22)";
    context.beginPath();
    context.moveTo(x - tileWidth * 0.27, y + tileHeight * 0.47);
    context.lineTo(x - tileWidth * 0.05, y + tileHeight * 0.59);
    context.moveTo(x + tileWidth * 0.12, y + tileHeight * 0.3);
    context.lineTo(x + tileWidth * 0.29, y + tileHeight * 0.4);
    context.stroke();
  }
  if (type === "crystal") {
    context.fillStyle = "rgba(255, 255, 255, .46)";
    context.beginPath();
    context.moveTo(x - tileWidth * 0.12, y + tileHeight * 0.34);
    context.lineTo(x + tileWidth * 0.05, y + tileHeight * 0.26);
    context.lineTo(x - tileWidth * 0.02, y + tileHeight * 0.48);
    context.closePath();
    context.fill();
  }
}

function drawBeacon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  time: number,
  reducedMotion: boolean,
) {
  const pulse = reducedMotion ? 0.55 : 0.42 + Math.sin(time / 360) * 0.16;
  const gradient = context.createLinearGradient(x, y - 120, x, y + 10);
  gradient.addColorStop(0, "rgba(98, 216, 207, 0)");
  gradient.addColorStop(0.7, color.replace("1)", `${pulse})`));
  gradient.addColorStop(1, color.replace("1)", "0)"));
  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(x - 6, y);
  context.lineTo(x - 18, y - 130);
  context.lineTo(x + 18, y - 130);
  context.lineTo(x + 6, y);
  context.closePath();
  context.fill();

  context.strokeStyle = `rgba(242, 173, 75, ${pulse + 0.15})`;
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(x, y + 7, 20 + pulse * 8, 8 + pulse * 3, 0, 0, Math.PI * 2);
  context.stroke();
}

function drawLandmark(
  context: CanvasRenderingContext2D,
  state: GameState,
  projection: Projection,
  landmark: Landmark,
  active: boolean,
  time: number,
  reducedMotion: boolean,
) {
  const cell = getCell(state, landmark.x, landmark.z);
  if (!cell) return;
  const position = screenPosition(projection, landmark.x, landmark.z, cell.layers.length);
  const x = position.x;
  const y = position.y + projection.tileHeight * 0.47;

  if (active) drawBeacon(context, x, y, "rgba(98, 216, 207, 1)", time, reducedMotion);

  context.save();
  context.lineJoin = "round";
  if (landmark.kind === "camp") {
    context.fillStyle = "#26363b";
    context.fillRect(x - 10, y - 22, 20, 19);
    context.strokeStyle = "#d3c89d";
    context.lineWidth = 2;
    context.strokeRect(x - 10, y - 22, 20, 19);
    context.beginPath();
    context.moveTo(x + 6, y - 22);
    context.lineTo(x + 13, y - 43);
    context.stroke();
    context.fillStyle = "#f2ad4b";
    context.beginPath();
    context.arc(x + 13, y - 44, 3.5, 0, Math.PI * 2);
    context.fill();
  } else if (landmark.kind === "keeper") {
    context.fillStyle = "#2d4144";
    context.fillRect(x - 15, y - 46, 30, 42);
    context.strokeStyle = "#7de7db";
    context.lineWidth = 2;
    context.strokeRect(x - 15, y - 46, 30, 42);
    context.fillStyle = "#7de7db";
    context.fillRect(x - 7, y - 34, 14, 5);
    context.fillStyle = "rgba(125, 231, 219, .22)";
    context.fillRect(x - 10, y - 24, 20, 14);
  } else if (landmark.kind === "altar") {
    context.strokeStyle = "#bba96f";
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(x, y - 2, 23, 9, 0, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = "#a75b86";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y - 5);
    context.lineTo(x - 7, y - 31);
    context.lineTo(x + 7, y - 18);
    context.lineTo(x + 2, y - 47);
    context.stroke();
  } else if (landmark.kind === "core") {
    const collected = state.story.collectedCores.includes(landmark.coreId ?? "");
    context.globalAlpha = collected ? 0.35 : 1;
    context.fillStyle = landmark.coreId === "grove" ? "#a8d17a" : landmark.coreId === "peak" ? "#d6e5ef" : "#8f78d8";
    context.beginPath();
    context.moveTo(x, y - 45);
    context.lineTo(x + 13, y - 22);
    context.lineTo(x + 7, y - 4);
    context.lineTo(x - 7, y - 4);
    context.lineTo(x - 13, y - 22);
    context.closePath();
    context.fill();
    context.strokeStyle = "#e6fff8";
    context.lineWidth = 1.5;
    context.stroke();
  } else {
    const glow = context.createRadialGradient(x, y - 25, 2, x, y - 25, 34);
    glow.addColorStop(0, "rgba(255, 232, 165, .95)");
    glow.addColorStop(0.35, "rgba(242, 173, 75, .62)");
    glow.addColorStop(1, "rgba(242, 173, 75, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y - 25, 34, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f7d889";
    context.beginPath();
    context.arc(x, y - 25, 10, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawEnemy(
  context: CanvasRenderingContext2D,
  state: GameState,
  projection: Projection,
  enemy: GameState["enemies"][number],
  time: number,
  reducedMotion: boolean,
) {
  if (enemy.health <= 0) return;
  const cell = getCell(state, enemy.x, enemy.z);
  if (!cell) return;
  const position = screenPosition(projection, enemy.x, enemy.z, cell.layers.length);
  const float = reducedMotion ? 0 : Math.sin(time / 260 + enemy.x) * 3;
  const x = position.x;
  const y = position.y + projection.tileHeight * 0.55 + float;
  context.save();
  context.fillStyle = "rgba(16, 12, 24, .35)";
  context.beginPath();
  context.ellipse(x, y + 2, 16, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#3c2848";
  context.beginPath();
  context.moveTo(x - 11, y - 4);
  context.lineTo(x - 8, y - 35);
  context.lineTo(x, y - 46);
  context.lineTo(x + 9, y - 34);
  context.lineTo(x + 12, y - 4);
  context.closePath();
  context.fill();
  context.strokeStyle = "#be76bd";
  context.lineWidth = 1.5;
  context.stroke();
  context.fillStyle = "#f1acd9";
  context.fillRect(x - 6, y - 29, 4, 3);
  context.fillRect(x + 2, y - 29, 4, 3);
  context.fillStyle = "rgba(8, 13, 18, .75)";
  context.fillRect(x - 12, y - 55, 24, 4);
  context.fillStyle = "#cf79b7";
  context.fillRect(x - 11, y - 54, 11 * enemy.health, 2);
  context.restore();
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  state: GameState,
  projection: Projection,
) {
  const cell = getCell(state, state.player.x, state.player.z);
  if (!cell) return;
  const position = screenPosition(projection, state.player.x, state.player.z, cell.layers.length);
  const x = position.x;
  const y = position.y + projection.tileHeight * 0.54;
  context.save();
  context.fillStyle = "rgba(8, 13, 18, .34)";
  context.beginPath();
  context.ellipse(x, y + 3, 16, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#b85f37";
  context.fillRect(x - 9, y - 34, 18, 29);
  context.fillStyle = "#e2c598";
  context.fillRect(x - 8, y - 48, 16, 14);
  context.fillStyle = "#1d2a2e";
  context.fillRect(x - 7, y - 46, 14, 4);
  context.fillStyle = "#5f3028";
  context.fillRect(x - 8, y - 7, 6, 10);
  context.fillRect(x + 2, y - 7, 6, 10);
  context.fillStyle = "#62d8cf";
  context.fillRect(x + 9, y - 29, 5, 9);
  context.strokeStyle = "rgba(242, 173, 75, .92)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y - 28, 20, Math.PI * 0.18, Math.PI * 0.8);
  context.stroke();
  context.restore();
}

function drawTarget(context: CanvasRenderingContext2D, state: GameState, projection: Projection) {
  const target = getTargetPosition(state);
  const cell = getCell(state, target.x, target.z);
  if (!cell) return;
  const position = screenPosition(projection, target.x, target.z, cell.layers.length);
  diamondPath(context, position.x, position.y - 1, projection.tileWidth, projection.tileHeight);
  context.strokeStyle = "rgba(242, 173, 75, .92)";
  context.lineWidth = 2;
  context.stroke();
}

function drawAtmosphere(
  context: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
) {
  const phase = (state.turn % 80) / 80;
  const night = Math.max(0, Math.sin((phase - 0.5) * Math.PI * 2) * 0.5 + 0.28);
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, night > 0.52 ? "#07131d" : "#17303c");
  sky.addColorStop(0.64, "#1c3b3c");
  sky.addColorStop(1, "#102725");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(124, 192, 181, .06)";
  for (let index = 0; index < 8; index += 1) {
    const x = (index * 137 + state.seed) % Math.max(width, 1);
    const y = 28 + ((index * 53) % Math.max(height * 0.48, 1));
    context.fillRect(x, y, 2, 2);
  }
  const horizon = context.createLinearGradient(0, height * 0.25, 0, height);
  horizon.addColorStop(0, "rgba(98, 216, 207, 0)");
  horizon.addColorStop(1, "rgba(98, 216, 207, .07)");
  context.fillStyle = horizon;
  context.fillRect(0, 0, width, height);
}

export function renderWorld(
  context: CanvasRenderingContext2D,
  state: GameState,
  options: RenderOptions,
) {
  const { width, height, time, reducedMotion } = options;
  drawAtmosphere(context, state, width, height);
  const tileWidth = width < 620 ? 48 : width < 980 ? 58 : 66;
  const projection: Projection = {
    tileWidth,
    tileHeight: tileWidth * 0.5,
    blockHeight: tileWidth * 0.29,
    centerX: width * 0.5,
    centerY: height * 0.46,
    cameraSum: state.player.x + state.player.z,
    cameraDiff: state.player.x - state.player.z,
  };

  const cells = state.world.flatMap((row, z) => row.map((_, x) => ({ x, z })));
  cells.sort((a, b) => a.x + a.z - (b.x + b.z));
  for (const { x, z } of cells) {
    const cell = state.world[z][x];
    for (let layer = 0; layer < cell.layers.length; layer += 1) {
      const position = screenPosition(projection, x, z, layer + 1);
      if (
        position.x < -projection.tileWidth ||
        position.x > width + projection.tileWidth ||
        position.y < -160 ||
        position.y > height + 80
      ) continue;
      drawBlock(context, position.x, position.y, projection, cell.layers[layer]);
    }
  }

  drawTarget(context, state, projection);
  const active = new Set(activeLandmarkIds(state));
  for (const landmark of LANDMARKS) {
    drawLandmark(context, state, projection, landmark, active.has(landmark.id), time, reducedMotion);
  }
  for (const enemy of state.enemies) drawEnemy(context, state, projection, enemy, time, reducedMotion);
  drawPlayer(context, state, projection);

  const vignette = context.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.25,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, "rgba(3, 11, 14, 0)");
  vignette.addColorStop(1, "rgba(3, 11, 14, .48)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}
