import assert from "node:assert/strict";
import test from "node:test";
import {
  LANDMARKS,
  SAVE_VERSION,
  WORLD_SIZE,
  chooseEnding,
  closeDialogue,
  continueSandbox,
  craftItem,
  createNewGame,
  generateWorld,
  interact,
  objectiveFor,
  primaryAction,
  restoreGame,
  serializeGame,
  type GameState,
} from "../lib/game-core.ts";

function withoutDialogue(state: GameState) {
  return state.story.dialogueId ? closeDialogue(state) : state;
}

test("world generation is deterministic and preserves every story landmark", () => {
  const first = generateWorld(42);
  const second = generateWorld(42);
  assert.deepEqual(first, second);
  assert.equal(first.length, WORLD_SIZE);
  assert.ok(first.every((row) => row.length === WORLD_SIZE));
  for (const landmark of LANDMARKS) {
    assert.ok(first[landmark.z]?.[landmark.x]?.layers.length >= 1, landmark.id);
  }
});

test("mining awards the correct resource and never removes the foundation", () => {
  const state = withoutDialogue(createNewGame());
  state.player = { x: 5, z: 4, direction: "east", health: 8 };
  const treeHeight = state.world[4][6].layers.length;
  const mined = primaryAction(state);
  assert.equal(mined.inventory.wood, 1);
  assert.equal(mined.world[4][6].layers.length, treeHeight - 1);

  mined.world[4][6].layers = ["stone"];
  const protectedFoundation = primaryAction(mined);
  assert.equal(protectedFoundation.world[4][6].layers.length, 1);
  assert.match(protectedFoundation.notice, /нельзя разрушить/i);
});

test("crafting consumes resources and advances the narrative without bypasses", () => {
  const state = withoutDialogue(createNewGame());
  state.story.step = 2;
  state.inventory.wood = 3;
  state.inventory.stone = 3;
  const crafted = craftItem(state, "pickaxe");
  assert.equal(crafted.inventory.wood, 0);
  assert.equal(crafted.inventory.stone, 0);
  assert.equal(crafted.crafted.pickaxe, true);
  assert.equal(crafted.story.chapter, 1);
  assert.equal(crafted.story.dialogueId, "pickaxe");

  const repeated = craftItem(crafted, "pickaxe");
  assert.deepEqual(repeated, crafted);
});

test("all six chapters, the final choice and post-game sandbox are reachable", () => {
  let state = withoutDialogue(createNewGame());

  state.player = { x: 4, z: 5, direction: "north", health: 8 };
  state = interact(state);
  assert.equal(state.story.step, 1);
  state = withoutDialogue(state);
  state.inventory.wood = 3;
  state.inventory.stone = 5;
  state.story.step = 2;
  state = craftItem(state, "pickaxe");
  state = withoutDialogue(state);
  assert.equal(state.story.chapter, 1);

  state.inventory.crystal = 4;
  state.story.step = 1;
  state = craftItem(state, "resonator");
  state.player = { x: 4, z: 5, direction: "north", health: 8 };
  state = interact(state);
  state = withoutDialogue(state);
  assert.equal(state.story.chapter, 2);

  state.player = { x: 16, z: 4, direction: "east", health: 8 };
  state = interact(state);
  state = withoutDialogue(state);
  assert.equal(state.story.chapter, 3);
  assert.equal(state.enemies.length, 3);

  state.enemies = [];
  state.story.defeatedShades = 3;
  state.story.step = 1;
  state.inventory.echo = 3;
  state = craftItem(state, "seal");
  state.player = { x: 11, z: 10, direction: "south", health: 8 };
  state = interact(state);
  state = withoutDialogue(state);
  assert.equal(state.story.chapter, 4);

  for (const landmark of LANDMARKS.filter((item) => item.kind === "core")) {
    state.player = { x: landmark.x, z: landmark.z, direction: "north", health: 8 };
    state = interact(state);
    state = withoutDialogue(state);
  }
  assert.equal(state.story.chapter, 5);
  assert.equal(state.story.collectedCores.length, 3);

  state.player = { x: 11, z: 18, direction: "south", health: 8 };
  state = interact(state);
  assert.equal(state.story.choiceOpen, true);
  state = chooseEnding(state, "release");
  assert.equal(state.story.completed, true);
  assert.equal(state.story.ending, "release");
  assert.equal(state.status, "ending");
  state = continueSandbox(state);
  assert.equal(state.status, "playing");
  assert.match(objectiveFor(state), /Свободный режим/);
});

test("save restoration accepts valid state and rejects malformed or hostile data", () => {
  const state = createNewGame(9281);
  const serialized = serializeGame(state);
  assert.deepEqual(restoreGame(serialized), state);
  assert.equal(restoreGame("not json"), null);
  assert.equal(restoreGame(JSON.stringify({ version: SAVE_VERSION })), null);

  const invalidCoordinate = JSON.parse(serialized) as GameState;
  invalidCoordinate.player.x = 99;
  assert.equal(restoreGame(JSON.stringify(invalidCoordinate)), null);

  const unknownBlock = JSON.parse(serialized) as GameState;
  unknownBlock.world[0][0].layers[0] = "<script>" as never;
  assert.equal(restoreGame(JSON.stringify(unknownBlock)), null);

  const oversizedNotice = JSON.parse(serialized) as GameState;
  oversizedNotice.notice = "x".repeat(241);
  assert.equal(restoreGame(JSON.stringify(oversizedNotice)), null);
});
