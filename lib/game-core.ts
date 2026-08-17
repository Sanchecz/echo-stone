export const SAVE_VERSION = 1;
export const SAVE_KEY = "echo-stone-save-v1";
export const WORLD_SIZE = 22;
export const MAX_HEALTH = 8;
export const MAX_BLOCK_HEIGHT = 7;

export type BlockType =
  | "grass"
  | "earth"
  | "stone"
  | "wood"
  | "crystal"
  | "ancient";

export type PlaceableBlock = "earth" | "stone" | "wood" | "crystal";
export type Direction = "north" | "south" | "east" | "west";
export type EndingChoice = "restore" | "release";
export type GameStatus = "playing" | "lost" | "ending";

export interface Cell {
  layers: BlockType[];
}

export interface PlayerState {
  x: number;
  z: number;
  direction: Direction;
  health: number;
}

export interface EnemyState {
  id: string;
  x: number;
  z: number;
  health: number;
}

export interface InventoryState {
  earth: number;
  stone: number;
  wood: number;
  crystal: number;
  echo: number;
}

export interface CraftedState {
  pickaxe: boolean;
  resonator: boolean;
  seal: boolean;
}

export interface StoryState {
  chapter: number;
  step: number;
  defeatedShades: number;
  collectedCores: string[];
  dialogueId: string | null;
  choiceOpen: boolean;
  ending: EndingChoice | null;
  completed: boolean;
}

export interface GameState {
  version: typeof SAVE_VERSION;
  seed: number;
  status: GameStatus;
  turn: number;
  day: number;
  player: PlayerState;
  world: Cell[][];
  inventory: InventoryState;
  crafted: CraftedState;
  story: StoryState;
  enemies: EnemyState[];
  selectedBlock: PlaceableBlock;
  notice: string;
}

export interface Landmark {
  id: string;
  name: string;
  x: number;
  z: number;
  kind: "camp" | "keeper" | "altar" | "core" | "heart";
  coreId?: string;
}

export interface StoryChapter {
  number: string;
  title: string;
  summary: string;
}

export interface DialogueBeat {
  speaker: string;
  title: string;
  body: string[];
  action: string;
}

export const LANDMARKS: readonly Landmark[] = [
  { id: "camp", name: "Полевое радио", x: 4, z: 4, kind: "camp" },
  { id: "keeper", name: "Хранитель Ноль", x: 17, z: 4, kind: "keeper" },
  { id: "altar", name: "Шов бури", x: 11, z: 11, kind: "altar" },
  {
    id: "core-grove",
    name: "Ядро Рощи",
    x: 4,
    z: 17,
    kind: "core",
    coreId: "grove",
  },
  {
    id: "core-peak",
    name: "Ядро Высоты",
    x: 18,
    z: 8,
    kind: "core",
    coreId: "peak",
  },
  {
    id: "core-depth",
    name: "Ядро Глубины",
    x: 17,
    z: 17,
    kind: "core",
    coreId: "depth",
  },
  { id: "heart", name: "Сердце мира", x: 11, z: 19, kind: "heart" },
] as const;

export const CHAPTERS: readonly StoryChapter[] = [
  {
    number: "00",
    title: "Пробуждение",
    summary: "Выжить после падения и услышать последний человеческий сигнал.",
  },
  {
    number: "01",
    title: "Голос под камнем",
    summary: "Собрать резонатор и расшифровать зов самой планеты.",
  },
  {
    number: "02",
    title: "Хранитель Ноль",
    summary: "Найти древнего свидетеля у восточных руин.",
  },
  {
    number: "03",
    title: "Шов бури",
    summary: "Остановить теней и запечатать разлом в центре мира.",
  },
  {
    number: "04",
    title: "Три памяти",
    summary: "Вернуть ядра Рощи, Высоты и Глубины.",
  },
  {
    number: "05",
    title: "Сердце Эха",
    summary: "Решить, каким станет мир после долгого молчания.",
  },
] as const;

export const DIALOGUES: Readonly<Record<string, DialogueBeat>> = {
  intro: {
    speaker: "Бортовой архив",
    title: "День 4 812 после Исхода",
    body: [
      "Капсула «Искра» разбилась на Эхе — последнем мире с пригодной атмосферой. Остальная экспедиция не отвечает.",
      "Под почвой бьётся огромный механизм. Он повторяет одно сообщение: «Верните мне память, и я верну вам небо».",
    ],
    action: "Встать",
  },
  camp_signal: {
    speaker: "Лея · запись экспедиции",
    title: "Сигнал №1",
    body: [
      "Если ты слышишь это, я ушла к восточным руинам. Буря стирает материю слой за слоем.",
      "Сделай кирку. Кристаллы под северными грядами удерживают старый резонанс.",
    ],
    action: "Принять маршрут",
  },
  pickaxe: {
    speaker: "Бортовой архив",
    title: "Инструмент собран",
    body: [
      "Камень снова поддаётся рукам. В скалах мерцают кристаллы — осколки памяти Эха.",
      "Добудьте два кристалла и соберите резонатор.",
    ],
    action: "Продолжить",
  },
  radio_repaired: {
    speaker: "Неизвестный голос",
    title: "Первая расшифровка",
    body: [
      "Я — не гора и не машина. Я помню тех, кто строил меня, но забыл, зачем должен проснуться.",
      "На востоке ждёт Хранитель Ноль. Покажи ему свет кристалла.",
    ],
    action: "Идти на восток",
  },
  keeper: {
    speaker: "Хранитель Ноль",
    title: "Цена тишины",
    body: [
      "Ваши предки не нашли пустую планету. Они нашли разум — и разделили его память на три ядра, чтобы сделать мир послушным.",
      "Теперь буря пришла забрать долг. Тени уже у центрального Шва. Победи их и собери печать.",
    ],
    action: "Встретить бурю",
  },
  storm_sealed: {
    speaker: "Эхо",
    title: "Мир вспоминает",
    body: [
      "Шов закрыт. Сквозь камень проступают три дороги: к Роще на юго-западе, Высоте на востоке и Глубине на юго-востоке.",
      "Лея дошла до Сердца раньше тебя. Её последняя запись ждёт там.",
    ],
    action: "Найти три ядра",
  },
  cores_restored: {
    speaker: "Лея · последняя запись",
    title: "Не повторяй наш выбор",
    body: [
      "Мы боялись мира, который мог сказать «нет», поэтому превратили его память в топливо.",
      "С тремя ядрами ты можешь восстановить прежний порядок — или вернуть Эху свободу. Я не дожила до ответа. Ответ теперь твой.",
    ],
    action: "К Сердцу",
  },
  ending_restore: {
    speaker: "Эпилог",
    title: "Хранитель нового рассвета",
    body: [
      "Вы соединили ядра и сохранили мост между людьми и Эхом. Машина больше не клетка: каждое решение теперь требует согласия обоих миров.",
      "Через семь лет над долиной вырос первый город. В его центре оставили пустое место — чтобы земля всегда могла быть услышана.",
    ],
    action: "Продолжить в свободном мире",
  },
  ending_release: {
    speaker: "Эпилог",
    title: "Небо без хозяев",
    body: [
      "Вы разомкнули Сердце. Древняя машина рассыпалась тёплым дождём, а Эхо впервые заговорило собственным голосом.",
      "Люди построили дом без права владеть планетой. На рассвете острова поднимаются и меняют путь — мир жив, свободен и больше не одинок.",
    ],
    action: "Продолжить в свободном мире",
  },
};

const BLOCKS: readonly BlockType[] = [
  "grass",
  "earth",
  "stone",
  "wood",
  "crystal",
  "ancient",
];
const DIRECTIONS: readonly Direction[] = ["north", "south", "east", "west"];
const PLACEABLE: readonly PlaceableBlock[] = ["earth", "stone", "wood", "crystal"];
const CORE_IDS = ["grove", "peak", "depth"] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createLayers(height: number): BlockType[] {
  return Array.from({ length: height }, (_, index) => {
    if (index === 0) return "stone";
    if (index === height - 1) return "grass";
    return index < height - 2 ? "stone" : "earth";
  });
}

function setTop(world: Cell[][], x: number, z: number, type: BlockType, extra = 0) {
  const cell = world[z]?.[x];
  if (!cell) return;
  for (let index = 0; index < extra; index += 1) cell.layers.push(type);
  cell.layers[cell.layers.length - 1] = type;
}

function flattenAround(world: Cell[][], centerX: number, centerZ: number) {
  for (let z = centerZ - 1; z <= centerZ + 1; z += 1) {
    for (let x = centerX - 1; x <= centerX + 1; x += 1) {
      if (world[z]?.[x]) world[z][x].layers = ["stone", "earth", "grass"];
    }
  }
}

export function generateWorld(seed = 731_942): Cell[][] {
  const random = mulberry32(seed);
  const world = Array.from({ length: WORLD_SIZE }, (_, z) =>
    Array.from({ length: WORLD_SIZE }, (_, x) => {
      const wave = Math.sin(x * 0.58) * 0.48 + Math.cos(z * 0.43) * 0.44;
      const ridge = Math.sin((x + z) * 0.22) * 0.42;
      const height = clamp(Math.round(2.25 + wave + ridge + random() * 0.95), 2, 4);
      return { layers: createLayers(height) };
    }),
  );

  for (const landmark of LANDMARKS) flattenAround(world, landmark.x, landmark.z);

  const trees = [
    [6, 4], [3, 7], [7, 7], [2, 12], [5, 14], [6, 18], [9, 17],
    [14, 3], [19, 5], [16, 10], [19, 13], [14, 18], [7, 20],
  ];
  for (const [x, z] of trees) setTop(world, x, z, "wood", 2);

  const crystals = [
    [8, 3], [9, 5], [7, 10], [13, 7], [14, 9], [9, 14], [15, 15],
    [19, 16], [3, 19], [12, 20],
  ];
  for (const [x, z] of crystals) setTop(world, x, z, "crystal", 1);

  const ruins = [[16, 3], [18, 3], [16, 5], [18, 5], [10, 10], [12, 10]];
  for (const [x, z] of ruins) setTop(world, x, z, "ancient", 1);

  return world;
}

export function createNewGame(seed = 731_942): GameState {
  return {
    version: SAVE_VERSION,
    seed,
    status: "playing",
    turn: 0,
    day: 1,
    player: { x: 4, z: 5, direction: "north", health: MAX_HEALTH },
    world: generateWorld(seed),
    inventory: { earth: 0, stone: 0, wood: 0, crystal: 0, echo: 0 },
    crafted: { pickaxe: false, resonator: false, seal: false },
    story: {
      chapter: 0,
      step: 0,
      defeatedShades: 0,
      collectedCores: [],
      dialogueId: "intro",
      choiceOpen: false,
      ending: null,
      completed: false,
    },
    enemies: [],
    selectedBlock: "earth",
    notice: "Капсула раскрыта. Найдите источник сигнала.",
  };
}

export function cloneGame(state: GameState): GameState {
  return structuredClone(state);
}

export function getCell(state: GameState, x: number, z: number): Cell | null {
  return state.world[z]?.[x] ?? null;
}

export function getTopBlock(cell: Cell): BlockType {
  return cell.layers[cell.layers.length - 1] ?? "stone";
}

export function directionDelta(direction: Direction): readonly [number, number] {
  if (direction === "north") return [0, -1];
  if (direction === "south") return [0, 1];
  if (direction === "east") return [1, 0];
  return [-1, 0];
}

export function getTargetPosition(state: GameState) {
  const [dx, dz] = directionDelta(state.player.direction);
  return { x: state.player.x + dx, z: state.player.z + dz };
}

function distance(ax: number, az: number, bx: number, bz: number) {
  return Math.abs(ax - bx) + Math.abs(az - bz);
}

export function nearbyLandmark(state: GameState): Landmark | null {
  return (
    LANDMARKS.find(
      (landmark) =>
        distance(state.player.x, state.player.z, landmark.x, landmark.z) <= 1,
    ) ?? null
  );
}

function targetEnemyIndex(state: GameState) {
  const target = getTargetPosition(state);
  return state.enemies.findIndex(
    (enemy) => enemy.health > 0 && enemy.x === target.x && enemy.z === target.z,
  );
}

function advanceResourceObjective(state: GameState) {
  if (
    state.story.chapter === 0 &&
    state.story.step === 1 &&
    state.inventory.wood >= 3 &&
    state.inventory.stone >= 3
  ) {
    state.story.step = 2;
    state.notice = "Материалов достаточно. Откройте верстак и соберите кирку.";
  }
  if (
    state.story.chapter === 1 &&
    state.story.step === 0 &&
    state.inventory.crystal >= 2
  ) {
    state.story.step = 1;
    state.notice = "Кристаллы найдены. Соберите резонатор.";
  }
}

function moveEnemies(state: GameState) {
  if (state.story.chapter !== 3 || state.enemies.length === 0) return;
  const occupied = new Set(state.enemies.filter((enemy) => enemy.health > 0).map((enemy) => `${enemy.x}:${enemy.z}`));

  for (const enemy of state.enemies) {
    if (enemy.health <= 0) continue;
    const range = distance(enemy.x, enemy.z, state.player.x, state.player.z);
    if (range <= 1) {
      if (state.turn % 2 === 0) state.player.health -= 1;
      continue;
    }
    if (state.turn % 2 !== 0) continue;

    const dx = Math.sign(state.player.x - enemy.x);
    const dz = Math.sign(state.player.z - enemy.z);
    const candidates = Math.abs(state.player.x - enemy.x) >= Math.abs(state.player.z - enemy.z)
      ? [[dx, 0], [0, dz]]
      : [[0, dz], [dx, 0]];
    const currentHeight = getCell(state, enemy.x, enemy.z)?.layers.length ?? 0;

    for (const [stepX, stepZ] of candidates) {
      const nextX = enemy.x + stepX;
      const nextZ = enemy.z + stepZ;
      const nextCell = getCell(state, nextX, nextZ);
      const key = `${nextX}:${nextZ}`;
      if (
        nextCell &&
        !occupied.has(key) &&
        !(nextX === state.player.x && nextZ === state.player.z) &&
        Math.abs(nextCell.layers.length - currentHeight) <= 1
      ) {
        occupied.delete(`${enemy.x}:${enemy.z}`);
        enemy.x = nextX;
        enemy.z = nextZ;
        occupied.add(key);
        break;
      }
    }
  }

  if (state.player.health <= 0) {
    state.player.health = 0;
    state.status = "lost";
    state.notice = "Буря поглотила искру. Можно вернуться к последнему сохранению.";
  }
}

function finishTurn(state: GameState) {
  state.turn += 1;
  state.day = Math.floor(state.turn / 80) + 1;
  advanceResourceObjective(state);
  moveEnemies(state);
  return state;
}

export function movePlayer(state: GameState, dx: number, dz: number): GameState {
  if (state.status !== "playing" || state.story.dialogueId || state.story.choiceOpen) return state;
  const next = cloneGame(state);
  if (dx === 0 && dz === 0) return next;
  next.player.direction = Math.abs(dx) > Math.abs(dz)
    ? dx > 0 ? "east" : "west"
    : dz > 0 ? "south" : "north";

  const targetX = next.player.x + Math.sign(dx);
  const targetZ = next.player.z + Math.sign(dz);
  const currentCell = getCell(next, next.player.x, next.player.z);
  const targetCell = getCell(next, targetX, targetZ);
  const blockedByEnemy = next.enemies.some(
    (enemy) => enemy.health > 0 && enemy.x === targetX && enemy.z === targetZ,
  );

  if (!currentCell || !targetCell || blockedByEnemy) {
    next.notice = blockedByEnemy ? "Тень перекрывает путь." : "Дальше только пустота.";
    return next;
  }
  if (Math.abs(targetCell.layers.length - currentCell.layers.length) > 1) {
    next.notice = "Слишком высокий уступ. Уберите или поставьте блок.";
    return next;
  }

  next.player.x = targetX;
  next.player.z = targetZ;
  next.notice = nearbyLandmark(next)
    ? `Рядом: ${nearbyLandmark(next)?.name}. Нажмите E, чтобы взаимодействовать.`
    : "Путь свободен.";
  return finishTurn(next);
}

function resourceForBlock(block: BlockType): keyof InventoryState | null {
  if (block === "grass" || block === "earth") return "earth";
  if (block === "stone") return "stone";
  if (block === "wood") return "wood";
  if (block === "crystal") return "crystal";
  return null;
}

export function primaryAction(state: GameState): GameState {
  if (state.status !== "playing" || state.story.dialogueId || state.story.choiceOpen) return state;
  const next = cloneGame(state);
  const enemyIndex = targetEnemyIndex(next);
  if (enemyIndex >= 0) {
    const enemy = next.enemies[enemyIndex];
    enemy.health -= next.crafted.pickaxe ? 2 : 1;
    if (enemy.health <= 0) {
      next.inventory.echo += 1;
      next.story.defeatedShades += 1;
      next.notice = `Тень рассеяна. Осколки Эха: ${next.story.defeatedShades}/3.`;
      if (next.story.defeatedShades >= 3 && next.story.chapter === 3) {
        next.story.step = 1;
        next.notice = "Тени побеждены. Соберите Печать Шва.";
      }
    } else {
      next.notice = "Удар расколол оболочку тени.";
    }
    return finishTurn(next);
  }

  const target = getTargetPosition(next);
  const cell = getCell(next, target.x, target.z);
  if (!cell || cell.layers.length <= 1) {
    next.notice = "Этот слой удерживает остров. Его нельзя разрушить.";
    return next;
  }
  if (LANDMARKS.some((landmark) => landmark.x === target.x && landmark.z === target.z)) {
    next.notice = "Древний узел не поддаётся инструменту.";
    return next;
  }

  const block = getTopBlock(cell);
  if (block === "ancient") {
    next.notice = "Древний сплав отвечает гулом, но не ломается.";
    return next;
  }
  if (block === "crystal" && !next.crafted.pickaxe) {
    next.notice = "Для кристалла нужна каменная кирка.";
    return next;
  }
  cell.layers.pop();
  const resource = resourceForBlock(block);
  if (resource) next.inventory[resource] += 1;
  next.notice = resource
    ? `Добыто: ${resourceLabel(resource)}.`
    : "Блок разобран.";
  return finishTurn(next);
}

export function placeBlock(state: GameState): GameState {
  if (state.status !== "playing" || state.story.dialogueId || state.story.choiceOpen) return state;
  const next = cloneGame(state);
  const target = getTargetPosition(next);
  const cell = getCell(next, target.x, target.z);
  if (!cell) {
    next.notice = "Здесь нельзя строить.";
    return next;
  }
  if (next.inventory[next.selectedBlock] <= 0) {
    next.notice = `Нет ресурса: ${resourceLabel(next.selectedBlock)}.`;
    return next;
  }
  if (cell.layers.length >= MAX_BLOCK_HEIGHT) {
    next.notice = "Достигнут безопасный предел высоты.";
    return next;
  }
  if (
    LANDMARKS.some((landmark) => landmark.x === target.x && landmark.z === target.z) ||
    next.enemies.some((enemy) => enemy.health > 0 && enemy.x === target.x && enemy.z === target.z) ||
    (next.player.x === target.x && next.player.z === target.z)
  ) {
    next.notice = "Узел или существо мешает поставить блок.";
    return next;
  }
  cell.layers.push(next.selectedBlock);
  next.inventory[next.selectedBlock] -= 1;
  next.notice = `Установлен блок: ${resourceLabel(next.selectedBlock)}.`;
  return finishTurn(next);
}

export function selectBlock(state: GameState, block: PlaceableBlock): GameState {
  if (!PLACEABLE.includes(block)) return state;
  return { ...state, selectedBlock: block, notice: `Выбран блок: ${resourceLabel(block)}.` };
}

export type RecipeId = "pickaxe" | "resonator" | "seal";

export const RECIPES: Readonly<Record<RecipeId, { label: string; cost: Partial<InventoryState> }>> = {
  pickaxe: { label: "Каменная кирка", cost: { wood: 3, stone: 3 } },
  resonator: { label: "Резонатор", cost: { crystal: 2, stone: 2 } },
  seal: { label: "Печать Шва", cost: { echo: 3, crystal: 2 } },
};

export function canCraft(state: GameState, recipeId: RecipeId) {
  const recipe = RECIPES[recipeId];
  if (state.crafted[recipeId]) return false;
  return Object.entries(recipe.cost).every(
    ([resource, amount]) => state.inventory[resource as keyof InventoryState] >= (amount ?? 0),
  );
}

export function craftItem(state: GameState, recipeId: RecipeId): GameState {
  if (state.status !== "playing" || !canCraft(state, recipeId)) return state;
  const next = cloneGame(state);
  for (const [resource, amount] of Object.entries(RECIPES[recipeId].cost)) {
    next.inventory[resource as keyof InventoryState] -= amount ?? 0;
  }
  next.crafted[recipeId] = true;
  next.notice = `Создано: ${RECIPES[recipeId].label}.`;

  if (recipeId === "pickaxe" && next.story.chapter === 0) {
    next.story.chapter = 1;
    next.story.step = 0;
    next.story.dialogueId = "pickaxe";
  } else if (recipeId === "resonator" && next.story.chapter === 1) {
    next.story.step = 2;
    next.notice = "Резонатор готов. Вернитесь к полевому радио.";
  } else if (recipeId === "seal" && next.story.chapter === 3) {
    next.story.step = 2;
    next.notice = "Печать собрана. Активируйте Шов бури.";
  }
  return next;
}

function spawnShades(): EnemyState[] {
  return [
    { id: "shade-a", x: 9, z: 11, health: 2 },
    { id: "shade-b", x: 12, z: 9, health: 2 },
    { id: "shade-c", x: 13, z: 12, health: 2 },
  ];
}

export function interact(state: GameState): GameState {
  if (state.status !== "playing" || state.story.dialogueId || state.story.choiceOpen) return state;
  const next = cloneGame(state);
  const landmark = nearbyLandmark(next);
  if (!landmark) {
    next.notice = "Рядом нет активного узла.";
    return next;
  }

  if (landmark.id === "camp") {
    next.player.health = MAX_HEALTH;
    if (next.story.chapter === 0 && next.story.step === 0) {
      next.story.step = 1;
      next.story.dialogueId = "camp_signal";
      next.notice = "Сигнал расшифрован. Соберите 3 дерева и 3 камня.";
    } else if (next.story.chapter === 1 && next.story.step === 2 && next.crafted.resonator) {
      next.story.chapter = 2;
      next.story.step = 0;
      next.story.dialogueId = "radio_repaired";
      next.notice = "Новый маршрут: восточные руины.";
    } else {
      next.notice = "Капсула восстановила здоровье и сохранила путь.";
    }
    return next;
  }

  if (landmark.id === "keeper") {
    if (next.story.chapter === 2 && next.crafted.resonator) {
      next.story.chapter = 3;
      next.story.step = 0;
      next.story.dialogueId = "keeper";
      next.enemies = spawnShades();
      next.notice = "Три тени вышли к центральному Шву.";
    } else {
      next.notice = "Хранитель молчит. Его замок ждёт резонатор.";
    }
    return next;
  }

  if (landmark.id === "altar") {
    if (next.story.chapter === 3 && next.story.step === 2 && next.crafted.seal) {
      next.story.chapter = 4;
      next.story.step = 0;
      next.story.dialogueId = "storm_sealed";
      next.enemies = [];
      next.notice = "На карте отмечены три ядра памяти.";
    } else {
      next.notice = "Шов рвётся наружу. Нужна собранная Печать.";
    }
    return next;
  }

  if (landmark.kind === "core" && landmark.coreId) {
    if (next.story.chapter !== 4) {
      next.notice = "Ядро спит. Сначала закройте Шов бури.";
      return next;
    }
    if (!next.story.collectedCores.includes(landmark.coreId)) {
      next.story.collectedCores.push(landmark.coreId);
      next.notice = `Возвращено: ${landmark.name} (${next.story.collectedCores.length}/3).`;
    } else {
      next.notice = `${landmark.name} уже следует за вашим резонансом.`;
    }
    if (next.story.collectedCores.length === CORE_IDS.length) {
      next.story.chapter = 5;
      next.story.step = 0;
      next.story.dialogueId = "cores_restored";
      next.notice = "Все ядра собраны. Сердце ждёт на юге.";
    }
    return next;
  }

  if (landmark.id === "heart") {
    if (next.story.chapter === 5 && next.story.collectedCores.length === CORE_IDS.length) {
      next.story.choiceOpen = true;
      next.notice = "Сердце предлагает два будущих.";
    } else {
      next.notice = "Сердце неполно. Ему не хватает трёх воспоминаний.";
    }
    return next;
  }

  return next;
}

export function closeDialogue(state: GameState): GameState {
  if (!state.story.dialogueId) return state;
  const next = cloneGame(state);
  next.story.dialogueId = null;
  return next;
}

export function chooseEnding(state: GameState, choice: EndingChoice): GameState {
  if (!state.story.choiceOpen || state.story.chapter !== 5) return state;
  const next = cloneGame(state);
  next.story.choiceOpen = false;
  next.story.ending = choice;
  next.story.completed = true;
  next.story.dialogueId = choice === "restore" ? "ending_restore" : "ending_release";
  next.status = "ending";
  next.notice = "История завершена. Мир остаётся открытым для строительства.";
  return next;
}

export function continueSandbox(state: GameState): GameState {
  if (!state.story.completed) return state;
  const next = cloneGame(state);
  next.status = "playing";
  next.story.dialogueId = null;
  next.player.health = MAX_HEALTH;
  next.notice = "Свободный режим: исследуйте, добывайте и стройте без ограничений.";
  return next;
}

export function reviveAtCamp(state: GameState): GameState {
  const next = cloneGame(state);
  next.status = "playing";
  next.player = { x: 4, z: 5, direction: "north", health: MAX_HEALTH };
  next.enemies = next.story.chapter === 3 ? spawnShades() : [];
  next.notice = "Искра восстановлена у капсулы.";
  return next;
}

export function objectiveFor(state: GameState): string {
  if (state.story.completed) return "Свободный режим: постройте собственный дом на Эхе.";
  const { chapter, step } = state.story;
  if (chapter === 0 && step === 0) return "Подойдите к полевому радио у капсулы и нажмите E.";
  if (chapter === 0 && step === 1) return `Добудьте дерево ${Math.min(state.inventory.wood, 3)}/3 и камень ${Math.min(state.inventory.stone, 3)}/3.`;
  if (chapter === 0) return "Соберите каменную кирку в верстаке.";
  if (chapter === 1 && step === 0) return `Добудьте кристаллы ${Math.min(state.inventory.crystal, 2)}/2.`;
  if (chapter === 1 && step === 1) return "Соберите резонатор в верстаке.";
  if (chapter === 1) return "Вернитесь к радио и активируйте резонатор.";
  if (chapter === 2) return "Найдите Хранителя Ноль у восточных руин.";
  if (chapter === 3 && step === 0) return `Победите тени у Шва ${state.story.defeatedShades}/3.`;
  if (chapter === 3 && step === 1) return "Соберите Печать Шва в верстаке.";
  if (chapter === 3) return "Активируйте Печать у центрального Шва.";
  if (chapter === 4) return `Верните три ядра памяти ${state.story.collectedCores.length}/3.`;
  if (chapter === 5) return "Идите к Сердцу на юге и выберите будущее Эха.";
  return "Исследуйте мир.";
}

export function activeLandmarkIds(state: GameState): string[] {
  const { chapter, step } = state.story;
  if (chapter === 0 && step === 0) return ["camp"];
  if (chapter === 1 && step === 2) return ["camp"];
  if (chapter === 2) return ["keeper"];
  if (chapter === 3) return ["altar"];
  if (chapter === 4) {
    return LANDMARKS.filter(
      (landmark) => landmark.kind === "core" && !state.story.collectedCores.includes(landmark.coreId ?? ""),
    ).map((landmark) => landmark.id);
  }
  if (chapter === 5) return ["heart"];
  return [];
}

export function resourceLabel(resource: keyof InventoryState | PlaceableBlock): string {
  const labels: Record<keyof InventoryState, string> = {
    earth: "земля",
    stone: "камень",
    wood: "дерево",
    crystal: "кристалл",
    echo: "осколок Эха",
  };
  return labels[resource];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInt(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function isWorld(value: unknown): value is Cell[][] {
  return (
    Array.isArray(value) &&
    value.length === WORLD_SIZE &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === WORLD_SIZE &&
        row.every(
          (cell) =>
            isRecord(cell) &&
            Array.isArray(cell.layers) &&
            cell.layers.length >= 1 &&
            cell.layers.length <= MAX_BLOCK_HEIGHT &&
            cell.layers.every((block) => BLOCKS.includes(block as BlockType)),
        ),
    )
  );
}

export function restoreGame(serialized: string): GameState | null {
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.version !== SAVE_VERSION || !isWorld(value.world)) return null;
  if (!isRecord(value.player) || !isRecord(value.inventory) || !isRecord(value.crafted) || !isRecord(value.story)) return null;
  if (!isInt(value.seed, 0, 2_147_483_647) || !isInt(value.turn, 0, 10_000_000) || !isInt(value.day, 1, 1_000_000)) return null;
  if (!isInt(value.player.x, 0, WORLD_SIZE - 1) || !isInt(value.player.z, 0, WORLD_SIZE - 1)) return null;
  if (!isInt(value.player.health, 0, MAX_HEALTH) || !DIRECTIONS.includes(value.player.direction as Direction)) return null;
  if (!["playing", "lost", "ending"].includes(String(value.status)) || !PLACEABLE.includes(value.selectedBlock as PlaceableBlock)) return null;

  for (const key of ["earth", "stone", "wood", "crystal", "echo"] as const) {
    if (!isInt(value.inventory[key], 0, 999)) return null;
  }
  for (const key of ["pickaxe", "resonator", "seal"] as const) {
    if (typeof value.crafted[key] !== "boolean") return null;
  }
  if (!isInt(value.story.chapter, 0, CHAPTERS.length - 1) || !isInt(value.story.step, 0, 3)) return null;
  if (!isInt(value.story.defeatedShades, 0, 3) || !Array.isArray(value.story.collectedCores)) return null;
  if (!value.story.collectedCores.every((core) => CORE_IDS.includes(core as (typeof CORE_IDS)[number]))) return null;
  if (new Set(value.story.collectedCores).size !== value.story.collectedCores.length) return null;
  if (value.story.dialogueId !== null && (typeof value.story.dialogueId !== "string" || !(value.story.dialogueId in DIALOGUES))) return null;
  if (typeof value.story.choiceOpen !== "boolean" || typeof value.story.completed !== "boolean") return null;
  if (value.story.ending !== null && value.story.ending !== "restore" && value.story.ending !== "release") return null;
  if (!Array.isArray(value.enemies) || value.enemies.length > 12) return null;
  if (!value.enemies.every((enemy) => isRecord(enemy) && typeof enemy.id === "string" && isInt(enemy.x, 0, WORLD_SIZE - 1) && isInt(enemy.z, 0, WORLD_SIZE - 1) && isInt(enemy.health, -10, 10))) return null;
  if (typeof value.notice !== "string" || value.notice.length > 240) return null;

  return value as unknown as GameState;
}

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}
