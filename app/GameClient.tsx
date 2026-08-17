"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CHAPTERS,
  DIALOGUES,
  MAX_HEALTH,
  RECIPES,
  SAVE_KEY,
  canCraft,
  chooseEnding,
  closeDialogue,
  continueSandbox,
  craftItem,
  createNewGame,
  getTargetPosition,
  interact,
  movePlayer,
  nearbyLandmark,
  objectiveFor,
  placeBlock,
  primaryAction,
  resourceLabel,
  restoreGame,
  reviveAtCamp,
  selectBlock,
  serializeGame,
  type Direction,
  type GameState,
  type PlaceableBlock,
  type RecipeId,
} from "@/lib/game-core";
import { renderWorld } from "@/lib/render-world";

type Screen = "menu" | "game";

const BLOCKS: readonly { id: PlaceableBlock; key: string; tone: string }[] = [
  { id: "earth", key: "1", tone: "#8b6849" },
  { id: "stone", key: "2", tone: "#8e9794" },
  { id: "wood", key: "3", tone: "#b07946" },
  { id: "crystal", key: "4", tone: "#62d8cf" },
];

const RECIPE_ORDER: readonly RecipeId[] = ["pickaxe", "resonator", "seal"];

function formatCost(recipeId: RecipeId) {
  return Object.entries(RECIPES[recipeId].cost)
    .map(([resource, amount]) => `${amount} ${resourceLabel(resource as keyof GameState["inventory"])}`)
    .join(" · ");
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function MissionMark({ index, current }: { index: number; current: number }) {
  const state = index < current ? "done" : index === current ? "current" : "future";
  return <span className={`mission-mark mission-mark--${state}`} aria-hidden="true" />;
}

export function GameClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const reducedMotion = useReducedMotion();
  const [game, setGame] = useState<GameState>(() => createNewGame());
  const [screen, setScreen] = useState<Screen>("menu");
  const [hasSave, setHasSave] = useState(false);
  const [saveReady, setSaveReady] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(SAVE_KEY);
      setHasSave(Boolean(stored && restoreGame(stored)));
      setSaveReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!saveReady || screen !== "game") return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(SAVE_KEY, serializeGame(game));
      setHasSave(true);
      setSavedAt(
        new Intl.DateTimeFormat("ru", { hour: "2-digit", minute: "2-digit" }).format(
          new Date(),
        ),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [game, saveReady, screen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    let frame = 0;
    let stopped = false;

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
      const pixelHeight = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderWorld(context, game, {
        width: rect.width,
        height: rect.height,
        time,
        reducedMotion,
      });
      if (!reducedMotion && !stopped) frame = window.requestAnimationFrame(draw);
    };

    draw(performance.now());
    const observer = new ResizeObserver(() => {
      if (reducedMotion) draw(performance.now());
    });
    observer.observe(canvas);
    return () => {
      stopped = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [game, reducedMotion]);

  const sound = useCallback(
    (frequency = 240, duration = 0.055) => {
      if (!soundOn) return;
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const audio = audioRef.current ?? new AudioContextClass();
      audioRef.current = audio;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, audio.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration + 0.01);
    },
    [soundOn],
  );

  const commit = useCallback(
    (action: (state: GameState) => GameState, frequency = 230) => {
      setGame((current) => action(current));
      sound(frequency);
    },
    [sound],
  );

  const blockedByOverlay =
    screen !== "game" ||
    paused ||
    workbenchOpen ||
    journalOpen ||
    helpOpen ||
    Boolean(game.story.dialogueId) ||
    game.story.choiceOpen ||
    game.status === "lost";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();

      if (key === "escape") {
        event.preventDefault();
        if (helpOpen) setHelpOpen(false);
        else if (journalOpen) setJournalOpen(false);
        else if (workbenchOpen) setWorkbenchOpen(false);
        else if (screen === "game" && !game.story.dialogueId && !game.story.choiceOpen) {
          setPaused((value) => !value);
        }
        return;
      }
      if (screen !== "game" || blockedByOverlay) return;

      const movement: Record<string, readonly [number, number]> = {
        w: [0, -1],
        arrowup: [0, -1],
        s: [0, 1],
        arrowdown: [0, 1],
        a: [-1, 0],
        arrowleft: [-1, 0],
        d: [1, 0],
        arrowright: [1, 0],
      };
      if (movement[key]) {
        event.preventDefault();
        const [dx, dz] = movement[key];
        commit((state) => movePlayer(state, dx, dz), 170);
        return;
      }
      if (key === " " || key === "q") {
        event.preventDefault();
        commit(primaryAction, 115);
      } else if (key === "f") {
        event.preventDefault();
        commit(placeBlock, 320);
      } else if (key === "e") {
        event.preventDefault();
        commit(interact, 510);
      } else if (key === "c") {
        event.preventDefault();
        setWorkbenchOpen(true);
      } else if (key === "m" || key === "j") {
        event.preventDefault();
        setJournalOpen(true);
      } else if (["1", "2", "3", "4"].includes(key)) {
        const block = BLOCKS.find((item) => item.key === key)?.id;
        if (block) commit((state) => selectBlock(state, block), 360);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [blockedByOverlay, commit, game.story.choiceOpen, game.story.dialogueId, helpOpen, journalOpen, screen, workbenchOpen]);

  const startFresh = () => {
    setGame(createNewGame());
    setScreen("game");
    setPaused(false);
    setConfirmNew(false);
    sound(440, 0.09);
  };

  const requestNewGame = () => {
    if (hasSave) setConfirmNew(true);
    else startFresh();
  };

  const continueGame = () => {
    const stored = window.localStorage.getItem(SAVE_KEY);
    const restored = stored ? restoreGame(stored) : null;
    if (!restored) {
      setHasSave(false);
      startFresh();
      return;
    }
    setGame(restored);
    setScreen("game");
    setPaused(false);
    sound(390, 0.08);
  };

  const faceFromPointer = (event: {
    clientX: number;
    clientY: number;
    currentTarget: HTMLCanvasElement;
  }): Direction => {
    const rect = event.currentTarget.getBoundingClientRect();
    const sx = event.clientX - rect.left - rect.width / 2;
    const sy = event.clientY - rect.top - rect.height * 0.46;
    const worldX = sy / 0.5 + sx;
    const worldZ = sy / 0.5 - sx;
    if (Math.abs(worldX) > Math.abs(worldZ)) return worldX >= 0 ? "east" : "west";
    return worldZ >= 0 ? "south" : "north";
  };

  const pointAction = (
    event: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement },
    mode: "mine" | "place",
  ) => {
    if (blockedByOverlay) return;
    const direction = faceFromPointer(event);
    setGame((current) => {
      const faced = { ...current, player: { ...current.player, direction } };
      return mode === "mine" ? primaryAction(faced) : placeBlock(faced);
    });
    sound(mode === "mine" ? 120 : 320);
  };

  const chapter = CHAPTERS[game.story.chapter];
  const landmark = nearbyLandmark(game);
  const target = getTargetPosition(game);
  const dialogue = game.story.dialogueId ? DIALOGUES[game.story.dialogueId] : null;
  const modalVisible =
    helpOpen ||
    (screen === "game" &&
      (Boolean(dialogue) ||
        game.story.choiceOpen ||
        game.status === "lost" ||
        paused ||
        workbenchOpen ||
        journalOpen));
  const backgroundInert = modalVisible || confirmNew;
  const modalFocusKey = confirmNew
    ? "confirm-new"
    : helpOpen
      ? "help"
      : game.story.choiceOpen
        ? "choice"
        : game.story.dialogueId
          ? `dialogue-${game.story.dialogueId}`
          : game.status === "lost"
            ? "lost"
            : workbenchOpen
              ? "workbench"
              : journalOpen
                ? "journal"
                : paused
                  ? "pause"
                  : "none";

  useEffect(() => {
    if (!backgroundInert) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modals = Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]'),
    );
    const activeModal = modals.at(-1);
    if (!activeModal) return;

    const focusableSelector =
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(activeModal.querySelectorAll<HTMLElement>(focusableSelector));
    if (!activeModal.contains(document.activeElement)) focusable[0]?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [backgroundInert, modalFocusKey]);

  return (
    <main className="game-shell">
      <a className="skip-link" href="#game-controls">К управлению</a>
      <header className="topbar" inert={backgroundInert}>
        <button
          className="wordmark"
          type="button"
          onClick={() => screen === "game" && setPaused(true)}
          aria-label="Открыть меню игры"
        >
          <span className="wordmark__sigil" aria-hidden="true">◆</span>
          <span>
            <strong>ЭХО КАМНЯ</strong>
            <small>история одного мира</small>
          </span>
        </button>
        <div className="topbar__status" aria-live="polite">
          <span>День {game.day}</span>
          <span className="status-dot" aria-hidden="true" />
          <span>{savedAt ? `Сохранено ${savedAt}` : "Автосохранение"}</span>
        </div>
        <nav className="topbar__actions" aria-label="Системные действия">
          <button type="button" className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-pressed={soundOn} aria-label={soundOn ? "Выключить звук" : "Включить звук"}>
            {soundOn ? "Звук" : "Тихо"}
          </button>
          <button type="button" className="icon-button" onClick={() => setHelpOpen(true)}>Помощь</button>
          <button type="button" className="icon-button" onClick={() => setPaused(true)} disabled={screen !== "game"}>Пауза</button>
        </nav>
      </header>

      <section className="world-stage" aria-label="Игровой мир Эхо" inert={backgroundInert}>
        <canvas
          ref={canvasRef}
          className="world-canvas"
          onPointerDown={(event) => {
            if (event.button === 0) pointAction(event, "mine");
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            pointAction(event, "place");
          }}
          aria-label={`Изометрический блочный мир. Игрок в точке ${game.player.x}, ${game.player.z}. Цель: ${objectiveFor(game)}`}
        >
          Ваш браузер не поддерживает Canvas. Для игры нужен современный браузер.
        </canvas>

        {screen === "game" && (
          <>
            <section className="quest-card" aria-labelledby="quest-title">
              <div className="eyebrow">Глава {chapter.number}</div>
              <h1 id="quest-title">{chapter.title}</h1>
              <p>{objectiveFor(game)}</p>
              <div className="quest-card__meta">
                <span>Координаты {game.player.x}:{game.player.z}</span>
                {landmark && <span className="nearby">Рядом · {landmark.name}</span>}
              </div>
            </section>

            <section className="vitals" aria-label={`Здоровье ${game.player.health} из ${MAX_HEALTH}`}>
              <span className="eyebrow">Искра</span>
              <div className="health-track" aria-hidden="true">
                {Array.from({ length: MAX_HEALTH }, (_, index) => (
                  <span key={index} className={index < game.player.health ? "health-unit health-unit--full" : "health-unit"} />
                ))}
              </div>
              <small>{game.enemies.filter((enemy) => enemy.health > 0).length > 0 ? `${game.enemies.filter((enemy) => enemy.health > 0).length} тени рядом` : "Резонанс стабилен"}</small>
            </section>

            <div className="compass" aria-hidden="true">
              <span>С</span><i /><b>Ю</b>
            </div>

            <div className="notice" role="status" aria-live="polite">
              <span className="notice__key">{landmark ? "E" : "Цель"}</span>
              <span>{game.notice}</span>
            </div>

            <section className="mobile-controls" aria-label="Сенсорное управление">
              <div className="dpad">
                <button type="button" onPointerDown={() => commit((state) => movePlayer(state, 0, -1), 170)} aria-label="Идти на север">↑</button>
                <button type="button" onPointerDown={() => commit((state) => movePlayer(state, -1, 0), 170)} aria-label="Идти на запад">←</button>
                <button type="button" onPointerDown={() => commit((state) => movePlayer(state, 0, 1), 170)} aria-label="Идти на юг">↓</button>
                <button type="button" onPointerDown={() => commit((state) => movePlayer(state, 1, 0), 170)} aria-label="Идти на восток">→</button>
              </div>
              <div className="touch-actions">
                <button type="button" className="touch-action touch-action--secondary" onPointerDown={() => commit(placeBlock, 320)}>Ставить</button>
                <button type="button" className="touch-action touch-action--primary" onPointerDown={() => commit(primaryAction, 115)}>Добыть</button>
                <button type="button" className="touch-action touch-action--interact" onPointerDown={() => commit(interact, 510)}>Связь</button>
              </div>
            </section>

            <section className="control-dock" id="game-controls" tabIndex={-1} aria-label="Инвентарь и действия">
              <div className="toolbar" role="group" aria-label="Блок для строительства">
                {BLOCKS.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    className={game.selectedBlock === block.id ? "slot slot--selected" : "slot"}
                    onClick={() => commit((state) => selectBlock(state, block.id), 360)}
                    aria-pressed={game.selectedBlock === block.id}
                    aria-label={`${resourceLabel(block.id)}: ${game.inventory[block.id]}`}
                  >
                    <span className="slot__key">{block.key}</span>
                    <span className="slot__block" style={{ "--block-tone": block.tone } as React.CSSProperties} aria-hidden="true" />
                    <span className="slot__count">{game.inventory[block.id]}</span>
                  </button>
                ))}
                <div className="slot slot--echo" aria-label={`Осколки Эха: ${game.inventory.echo}`}>
                  <span className="slot__key">Э</span>
                  <span className="slot__echo" aria-hidden="true">✦</span>
                  <span className="slot__count">{game.inventory.echo}</span>
                </div>
              </div>
              <div className="dock-actions">
                <button type="button" onClick={() => setWorkbenchOpen(true)}><kbd>C</kbd> Верстак</button>
                <button type="button" onClick={() => setJournalOpen(true)}><kbd>M</kbd> Архив</button>
                <span className="desktop-hint"><kbd>Space</kbd> добыть · <kbd>F</kbd> поставить · цель {target.x}:{target.z}</span>
              </div>
            </section>
          </>
        )}

        {screen === "menu" && (
          <section className="title-screen" aria-labelledby="game-title">
            <div className="title-screen__copy">
              <div className="eyebrow">Самостоятельное voxel-приключение</div>
              <h1 id="game-title"><span>ЭХО</span> КАМНЯ</h1>
              <p>Разберите мир по блоку. Верните ему память. Решите, должен ли он снова принадлежать людям.</p>
              <div className="title-screen__actions">
                <button className="primary-button" type="button" onClick={requestNewGame}>Новая история <span aria-hidden="true">→</span></button>
                <button className="secondary-button" type="button" onClick={continueGame} disabled={!saveReady || !hasSave}>
                  {!saveReady ? "Проверяем сохранение…" : hasSave ? "Продолжить" : "Нет сохранения"}
                </button>
              </div>
              <div className="title-screen__facts" aria-label="Особенности игры">
                <span>6 глав</span><span>Живой блочный мир</span><span>2 финала</span><span>Автосохранение</span>
              </div>
            </div>
            <div className="title-screen__aside">
              <span className="vertical-label">EXPEDITION // ECHO-07</span>
              <p>«Верните мне память,<br />и я верну вам небо»</p>
            </div>
          </section>
        )}
      </section>

      {modalVisible && <div className="modal-scrim" aria-hidden="true" />}

      {screen === "game" && dialogue && (
        <section className="modal story-modal" role="dialog" aria-modal="true" aria-labelledby="story-title">
          <span className="modal__signal" aria-hidden="true" />
          <div className="eyebrow">{dialogue.speaker}</div>
          <h2 id="story-title">{dialogue.title}</h2>
          {dialogue.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <button
            type="button"
            className="primary-button"
            autoFocus
            onClick={() => {
              if (game.story.completed) commit(continueSandbox, 520);
              else commit(closeDialogue, 440);
            }}
          >
            {dialogue.action} <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {screen === "game" && game.story.choiceOpen && (
        <section className="modal choice-modal" role="dialog" aria-modal="true" aria-labelledby="choice-title">
          <div className="eyebrow">Глава 05 · Последний выбор</div>
          <h2 id="choice-title">Кому принадлежит память мира?</h2>
          <p>Оба решения завершают историю и сохраняют открытый мир. Отменить выбор после подтверждения нельзя.</p>
          <div className="choice-grid">
            <button type="button" onClick={() => commit((state) => chooseEnding(state, "restore"), 530)}>
              <span className="choice-number">01</span>
              <strong>Соединить</strong>
              <small>Создать союз людей и Эха. Сердце останется мостом.</small>
            </button>
            <button type="button" onClick={() => commit((state) => chooseEnding(state, "release"), 620)}>
              <span className="choice-number">02</span>
              <strong>Освободить</strong>
              <small>Разомкнуть машину. Эхо станет полностью свободным.</small>
            </button>
          </div>
        </section>
      )}

      {screen === "game" && workbenchOpen && (
        <section className="modal panel-modal" role="dialog" aria-modal="true" aria-labelledby="craft-title">
          <button className="modal__close" type="button" onClick={() => setWorkbenchOpen(false)} aria-label="Закрыть верстак">×</button>
          <div className="eyebrow">Полевой верстак</div>
          <h2 id="craft-title">Собрать инструмент</h2>
          <div className="recipe-list">
            {RECIPE_ORDER.map((recipeId) => {
              const crafted = game.crafted[recipeId];
              const available = canCraft(game, recipeId);
              return (
                <article className={crafted ? "recipe recipe--done" : "recipe"} key={recipeId}>
                  <span className="recipe__icon" aria-hidden="true">{recipeId === "pickaxe" ? "⌁" : recipeId === "resonator" ? "◉" : "◇"}</span>
                  <div><strong>{RECIPES[recipeId].label}</strong><small>{formatCost(recipeId)}</small></div>
                  <button type="button" disabled={!available} onClick={() => commit((state) => craftItem(state, recipeId), 470)}>{crafted ? "Готово" : available ? "Собрать" : "Не хватает"}</button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {screen === "game" && journalOpen && (
        <section className="modal panel-modal journal-modal" role="dialog" aria-modal="true" aria-labelledby="journal-title">
          <button className="modal__close" type="button" onClick={() => setJournalOpen(false)} aria-label="Закрыть архив">×</button>
          <div className="eyebrow">Архив экспедиции</div>
          <h2 id="journal-title">Маршрут истории</h2>
          <ol className="chapter-list">
            {CHAPTERS.map((item, index) => (
              <li key={item.number} className={index === game.story.chapter ? "chapter chapter--current" : "chapter"}>
                <MissionMark index={index} current={game.story.chapter} />
                <span className="chapter__number">{item.number}</span>
                <div><strong>{item.title}</strong><small>{item.summary}</small></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {helpOpen && (
        <section className="modal panel-modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <button className="modal__close" type="button" onClick={() => setHelpOpen(false)} aria-label="Закрыть помощь">×</button>
          <div className="eyebrow">Полевое руководство</div>
          <h2 id="help-title">Как играть</h2>
          <div className="help-grid">
            <div><kbd>WASD</kbd><span>Идти и выбирать соседний блок</span></div>
            <div><kbd>Space</kbd><span>Добыть блок или ударить тень</span></div>
            <div><kbd>F</kbd><span>Поставить выбранный блок</span></div>
            <div><kbd>E</kbd><span>Активировать узел рядом</span></div>
            <div><kbd>1—4</kbd><span>Выбрать материал</span></div>
            <div><kbd>C / M</kbd><span>Верстак / архив истории</span></div>
          </div>
          <p className="help-note">Левая кнопка мыши действует на блок в выбранном направлении, правая — ставит блок. На телефоне используйте кнопки в нижних углах. Игра автоматически сохраняется только на этом устройстве.</p>
        </section>
      )}

      {screen === "game" && paused && !dialogue && !helpOpen && (
        <section className="modal pause-modal" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="eyebrow">Путь сохранён</div>
          <h2 id="pause-title">Пауза</h2>
          <p>Эхо будет ждать столько, сколько потребуется.</p>
          <button className="primary-button" type="button" autoFocus onClick={() => setPaused(false)}>Вернуться в мир</button>
          <button className="secondary-button" type="button" onClick={() => { setPaused(false); setScreen("menu"); }}>В главное меню</button>
          <button className="text-button" type="button" onClick={() => setHelpOpen(true)}>Управление</button>
        </section>
      )}

      {screen === "game" && game.status === "lost" && (
        <section className="modal pause-modal" role="dialog" aria-modal="true" aria-labelledby="lost-title">
          <div className="eyebrow">Искра погасла</div>
          <h2 id="lost-title">Буря помнит ваш след</h2>
          <p>История не потеряна. Капсула восстановит вас у полевого радио, а добытые ресурсы останутся.</p>
          <button className="primary-button" type="button" autoFocus onClick={() => commit(reviveAtCamp, 480)}>Вернуться к капсуле</button>
        </section>
      )}

      {confirmNew && (
        <>
          <div className="modal-scrim" aria-hidden="true" />
          <section className="modal pause-modal" role="alertdialog" aria-modal="true" aria-labelledby="new-title">
            <div className="eyebrow">Новое прохождение</div>
            <h2 id="new-title">Заменить сохранённый мир?</h2>
            <p>Текущий прогресс будет заменён после начала новой истории.</p>
            <button className="primary-button" type="button" onClick={startFresh}>Да, начать заново</button>
            <button className="secondary-button" type="button" autoFocus onClick={() => setConfirmNew(false)}>Отмена</button>
          </section>
        </>
      )}
    </main>
  );
}
