import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icons.jsx";

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function ChoiceRow({ label, value, options, onChange }) {
  return (
    <div className="game-setting">
      <span>{label}</span>
      <div className="game-choice" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className={value === option.value ? "is-on" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameStage({ title, cover, best, bestLabel, onBack, children, footer, settings }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="game-stage" style={cover ? { "--game-cover": `url(${cover})` } : undefined}>
      <div className="game-stage-bg" aria-hidden="true" />
      <header className="game-hud">
        <button type="button" className="game-back" onClick={onBack} aria-label="Πίσω">
          <Icon name="arrow" />
          <span>Πίσω</span>
        </button>
        <div className="game-hud-title">
          <strong>{title}</strong>
          {best != null && <small>{bestLabel || `Καλύτερο ${best}`}</small>}
        </div>
        {settings && (
          <button
            type="button"
            className={`game-settings-btn ${open ? "is-on" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Ρυθμίσεις"
            aria-expanded={open}
          >
            <Icon name="gear" />
          </button>
        )}
      </header>
      {open && settings && (
        <div className="game-settings-panel">
          <div className="game-settings-card">
            <div className="game-settings-head">
              <strong>Ρυθμίσεις</strong>
              <button type="button" className="btn tiny ghost" onClick={() => setOpen(false)}>Κλείσιμο</button>
            </div>
            {settings}
            <p className="fine game-settings-note">Οι αλλαγές ισχύουν στον επόμενο γύρο.</p>
          </div>
        </div>
      )}
      <div className="game-arena">{children}</div>
      {footer && <footer className="game-foot">{footer}</footer>}
    </div>
  );
}

function Overlay({ title, text, action, onAction }) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-card">
        <strong>{title}</strong>
        {text && <p>{text}</p>}
        <button type="button" className="btn solid" onClick={onAction}>{action}</button>
      </div>
    </div>
  );
}

const MEMORY_ICONS = ["bag", "moon", "sun", "phone", "drop", "boot", "heart", "file"];
const PEEK_MS = { slow: 950, normal: 650, fast: 380 };
const SNAKE_SPEED = { slow: 175, normal: 118, fast: 78 };
const SNAKE_BOARD = { small: 10, normal: 14, large: 16 };
const REACT_WAIT = {
  short: [700, 1800],
  normal: [1200, 4000],
  long: [1600, 5600],
};
const SIMON_SPEED = {
  slow: { on: 520, gap: 220 },
  normal: { on: 380, gap: 160 },
  fast: { on: 240, gap: 90 },
};

export function MemoryGame({ onScore, onBack, cover, best, prefs, onPrefs }) {
  const pairs = Number(prefs.pairs) || 8;
  const peek = prefs.peek || "normal";
  const icons = useMemo(() => MEMORY_ICONS.slice(0, pairs), [pairs]);
  const [cards, setCards] = useState(() => makeMemory(icons));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const done = matched.length === icons.length;

  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  function flip(id) {
    if (lock || open.includes(id) || matched.includes(cards.find((c) => c.id === id)?.icon) || done) return;
    const next = [...open, id];
    setOpen(next);
    if (next.length < 2) return;
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const [a, b] = next.map((item) => cards.find((card) => card.id === item));
    if (a.icon === b.icon) {
      const nextMatched = [...matched, a.icon];
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.length === icons.length) {
        const score = Math.max(10, 100 - nextMoves * 3 + (pairs - 4) * 4);
        setFinalScore(score);
        onScore(score);
      }
      return;
    }
    setLock(true);
    window.setTimeout(() => {
      setOpen([]);
      setLock(false);
    }, PEEK_MS[peek] || PEEK_MS.normal);
  }

  function restart() {
    setCards(makeMemory(icons));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setFinalScore(null);
  }

  return (
    <GameStage
      title="Μνήμη"
      cover={cover}
      best={best}
      bestLabel={best != null ? `Καλύτερο ${best}` : null}
      onBack={onBack}
      settings={(
        <>
          <ChoiceRow
            label="Ζευγάρια"
            value={pairs}
            options={[
              { value: 4, label: "4" },
              { value: 6, label: "6" },
              { value: 8, label: "8" },
            ]}
            onChange={(value) => onPrefs({ pairs: value })}
          />
          <ChoiceRow
            label="Χρόνος κάρτας"
            value={peek}
            options={[
              { value: "slow", label: "Αργά" },
              { value: "normal", label: "Κανονικά" },
              { value: "fast", label: "Γρήγορα" },
            ]}
            onChange={(value) => onPrefs({ peek: value })}
          />
        </>
      )}
      footer={(
        <>
          <span className="game-stat"><em>Κινήσεις</em><b>{moves}</b></span>
          <span className="game-stat"><em>Ζευγάρια</em><b>{matched.length}/{icons.length}</b></span>
          <button type="button" className="btn tiny ghost" onClick={restart}>Νέο</button>
        </>
      )}
    >
      <div className={`memory-grid pairs-${icons.length}`}>
        {cards.map((card) => {
          const shown = open.includes(card.id) || matched.includes(card.icon);
          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${shown ? "is-open" : ""} ${matched.includes(card.icon) ? "is-matched" : ""}`}
              onClick={() => flip(card.id)}
              aria-label={shown ? card.icon : "κρυφή κάρτα"}
            >
              <span className="memory-face memory-back">?</span>
              <span className="memory-face memory-front">
                <Icon name={card.icon} />
              </span>
            </button>
          );
        })}
      </div>
      {done && (
        <Overlay
          title="Τα βρήκες όλα"
          text={`${moves} κινήσεις · σκορ ${finalScore}`}
          action="Ξανά"
          onAction={restart}
        />
      )}
    </GameStage>
  );
}

function makeMemory(icons) {
  return shuffle(
    icons.flatMap((icon, index) => [
      { id: `${icon}-a-${index}`, icon },
      { id: `${icon}-b-${index}`, icon },
    ]),
  );
}

export function ReactionGame({ onScore, onBack, cover, best, prefs, onPrefs }) {
  const wait = prefs.wait || "normal";
  const [phase, setPhase] = useState("idle");
  const [ms, setMs] = useState(null);
  const [localBest, setLocalBest] = useState(null);
  const timer = useRef(0);
  const start = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function arm() {
    const [min, max] = REACT_WAIT[wait] || REACT_WAIT.normal;
    setPhase("wait");
    setMs(null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPhase("go");
      start.current = performance.now();
    }, min + Math.random() * (max - min));
  }

  function tap() {
    if (phase === "idle" || phase === "result" || phase === "early") {
      arm();
      return;
    }
    if (phase === "wait") {
      window.clearTimeout(timer.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const value = Math.round(performance.now() - start.current);
      setMs(value);
      setLocalBest((prev) => (prev == null || value < prev ? value : prev));
      setPhase("result");
      onScore(Math.max(5, 500 - value));
    }
  }

  const copy = {
    idle: { title: "Έτοιμος;", hint: "Πάτα οπουδήποτε για έναρξη" },
    wait: { title: "Περίμενε…", hint: "Μην πατήσεις ακόμα" },
    go: { title: "ΤΩΡΑ", hint: "Πάτα!" },
    early: { title: "Πολύ νωρίς", hint: "Πάτα για ξανά" },
    result: { title: `${ms} ms`, hint: "Πάτα για άλλο γύρο" },
  }[phase];

  return (
    <GameStage
      title="Αντίδραση"
      cover={cover}
      best={best}
      bestLabel={best != null ? `Καλύτερο σκορ ${best}` : null}
      onBack={onBack}
      settings={(
        <ChoiceRow
          label="Αναμονή"
          value={wait}
          options={[
            { value: "short", label: "Σύντομη" },
            { value: "normal", label: "Κανονική" },
            { value: "long", label: "Μεγάλη" },
          ]}
          onChange={(value) => onPrefs({ wait: value })}
        />
      )}
      footer={(
        <>
          <span className="game-stat"><em>Τελευταίο</em><b>{ms != null ? `${ms} ms` : "—"}</b></span>
          <span className="game-stat"><em>Γρηγορότερο</em><b>{localBest != null ? `${localBest} ms` : "—"}</b></span>
        </>
      )}
    >
      <button type="button" className={`react-pad is-${phase}`} onClick={tap}>
        <span className="react-ring" aria-hidden="true" />
        <strong>{copy.title}</strong>
        <em>{copy.hint}</em>
      </button>
    </GameStage>
  );
}

const PADS = [
  { id: 0, color: "#e7b34a", name: "κίτρινο" },
  { id: 1, color: "#2f9e6a", name: "πράσινο" },
  { id: 2, color: "#c45a4e", name: "κόκκινο" },
  { id: 3, color: "#4a7fb8", name: "μπλε" },
];

export function SequenceGame({ onScore, onBack, cover, best, prefs, onPrefs }) {
  const speed = prefs.speed || "normal";
  const startLen = Number(prefs.start) || 1;
  const timing = SIMON_SPEED[speed] || SIMON_SPEED.normal;
  const [seq, setSeq] = useState([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(null);
  const [phase, setPhase] = useState("ready");
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (phase !== "show") return undefined;
    let i = 0;
    let cancelled = false;
    const timers = [];
    const run = () => {
      if (cancelled || i >= seq.length) {
        if (!cancelled) {
          setLit(null);
          setPhase("input");
        }
        return;
      }
      setLit(seq[i]);
      timers.push(window.setTimeout(() => {
        setLit(null);
        i += 1;
        timers.push(window.setTimeout(run, timing.gap));
      }, timing.on));
    };
    timers.push(window.setTimeout(run, 280));
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [phase, seq, timing.gap, timing.on]);

  function start() {
    const first = Array.from({ length: startLen }, () => Math.floor(Math.random() * 4));
    setSeq(first);
    setStep(0);
    setLevel(0);
    setPhase("show");
  }

  function press(id) {
    if (phase !== "input") return;
    setLit(id);
    window.setTimeout(() => setLit(null), 140);
    if (id !== seq[step]) {
      setPhase("fail");
      onScore(level * 20);
      return;
    }
    if (step + 1 === seq.length) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setStep(0);
      setSeq((prev) => [...prev, Math.floor(Math.random() * 4)]);
      setPhase("show");
      onScore(nextLevel * 20);
      return;
    }
    setStep((n) => n + 1);
  }

  const status = {
    ready: "Πάτα Έναρξη και κοίτα τη σειρά",
    show: "Κοίτα προσεκτικά…",
    input: "Επανέλαβε τη σειρά",
    fail: `Λάθος · επίπεδο ${level}`,
  }[phase];

  return (
    <GameStage
      title="Σειρά"
      cover={cover}
      best={best}
      bestLabel={best != null ? `Καλύτερο ${best}` : null}
      onBack={onBack}
      settings={(
        <>
          <ChoiceRow
            label="Ταχύτητα σειράς"
            value={speed}
            options={[
              { value: "slow", label: "Αργά" },
              { value: "normal", label: "Κανονικά" },
              { value: "fast", label: "Γρήγορα" },
            ]}
            onChange={(value) => onPrefs({ speed: value })}
          />
          <ChoiceRow
            label="Αρχική σειρά"
            value={startLen}
            options={[
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
            ]}
            onChange={(value) => onPrefs({ start: value })}
          />
        </>
      )}
      footer={(
        <>
          <span className="game-stat"><em>Επίπεδο</em><b>{level}</b></span>
          <span className="game-stat"><em>Μήνυμα</em><b>{status}</b></span>
          {(phase === "ready" || phase === "fail") && (
            <button type="button" className="btn tiny solid" onClick={start}>
              {phase === "fail" ? "Ξανά" : "Έναρξη"}
            </button>
          )}
        </>
      )}
    >
      <div className="simon-wrap">
        <div className="simon-grid">
          {PADS.map((pad) => (
            <button
              key={pad.id}
              type="button"
              className={`simon-pad ${lit === pad.id ? "is-lit" : ""}`}
              style={{ "--pad": pad.color }}
              onClick={() => press(pad.id)}
              aria-label={pad.name}
            />
          ))}
        </div>
        <div className="simon-core" aria-hidden="true">
          <b>{level || "•"}</b>
        </div>
      </div>
      {phase === "fail" && (
        <Overlay
          title="Έσπασε η σειρά"
          text={`Έφτασες επίπεδο ${level}`}
          action="Ξανά"
          onAction={start}
        />
      )}
      {phase === "ready" && (
        <Overlay title="Σειρά χρωμάτων" text="Θυμήσου και επανέλαβε." action="Έναρξη" onAction={start} />
      )}
    </GameStage>
  );
}

export function SnakeGame({ onScore, onBack, cover, best, prefs, onPrefs }) {
  const speed = prefs.speed || "normal";
  const board = prefs.board || "normal";
  const size = SNAKE_BOARD[board] || SNAKE_BOARD.normal;
  const tick = SNAKE_SPEED[speed] || SNAKE_SPEED.normal;
  const mid = Math.floor(size / 2);
  const [snake, setSnake] = useState([{ x: mid, y: mid }, { x: mid - 1, y: mid }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: mid + 3, y: mid });
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const dirRef = useRef(dir);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);
  const sizeRef = useRef(size);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  useEffect(() => {
    if (!running || !alive) return undefined;
    const id = window.setInterval(() => {
      const d = dirRef.current;
      const body = snakeRef.current;
      const grid = sizeRef.current;
      const head = { x: body[0].x + d.x, y: body[0].y + d.y };
      if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid || body.some((part) => part.x === head.x && part.y === head.y)) {
        setAlive(false);
        setRunning(false);
        onScore(scoreRef.current);
        return;
      }
      const next = [head, ...body];
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const grown = scoreRef.current + 10;
        scoreRef.current = grown;
        setScore(grown);
        setFood(spawnFood(next, grid));
      } else {
        next.pop();
      }
      setSnake(next);
    }, tick);
    return () => window.clearInterval(id);
  }, [running, alive, onScore, tick]);

  function turn(nx, ny) {
    const d = dirRef.current;
    if (d.x + nx === 0 && d.y + ny === 0) return;
    setDir({ x: nx, y: ny });
  }

  useEffect(() => {
    function onKey(event) {
      const map = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      const next = map[event.key];
      if (!next) return;
      event.preventDefault();
      const d = dirRef.current;
      if (d.x + next[0] === 0 && d.y + next[1] === 0) return;
      setDir({ x: next[0], y: next[1] });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function start() {
    const center = Math.floor(size / 2);
    const startSnake = [{ x: center, y: center }, { x: center - 1, y: center }];
    setSnake(startSnake);
    setDir({ x: 1, y: 0 });
    setFood(spawnFood(startSnake, size));
    setAlive(true);
    setScore(0);
    scoreRef.current = 0;
    setRunning(true);
  }

  useEffect(() => {
    setRunning(false);
    const center = Math.floor(size / 2);
    const startSnake = [{ x: center, y: center }, { x: center - 1, y: center }];
    setSnake(startSnake);
    setFood(spawnFood(startSnake, size));
    setDir({ x: 1, y: 0 });
    setAlive(true);
    setScore(0);
    scoreRef.current = 0;
  }, [size]);

  return (
    <GameStage
      title="Φίδι"
      cover={cover}
      best={best}
      bestLabel={best != null ? `Καλύτερο ${best}` : null}
      onBack={onBack}
      settings={(
        <>
          <ChoiceRow
            label="Ταχύτητα"
            value={speed}
            options={[
              { value: "slow", label: "Αργά" },
              { value: "normal", label: "Κανονικά" },
              { value: "fast", label: "Γρήγορα" },
            ]}
            onChange={(value) => onPrefs({ speed: value })}
          />
          <ChoiceRow
            label="Ταμπλό"
            value={board}
            options={[
              { value: "small", label: "Μικρό" },
              { value: "normal", label: "Κανονικό" },
              { value: "large", label: "Μεγάλο" },
            ]}
            onChange={(value) => onPrefs({ board: value })}
          />
        </>
      )}
      footer={(
        <>
          <span className="game-stat"><em>Σκορ</em><b>{score}</b></span>
          <span className="game-stat"><em>Ταχύτητα</em><b>{speed === "slow" ? "Αργά" : speed === "fast" ? "Γρήγορα" : "Κανον."}</b></span>
          <button type="button" className="btn tiny solid" onClick={start}>
            {running ? "Επανεκκίνηση" : alive ? "Παίξε" : "Ξανά"}
          </button>
        </>
      )}
    >
      <div
        className={`snake-board ${running ? "is-live" : ""}`}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        onTouchStart={(event) => {
          const touch = event.changedTouches[0];
          event.currentTarget.dataset.x = String(touch.clientX);
          event.currentTarget.dataset.y = String(touch.clientY);
        }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          const dx = touch.clientX - Number(event.currentTarget.dataset.x || 0);
          const dy = touch.clientY - Number(event.currentTarget.dataset.y || 0);
          if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
          if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
          else turn(0, dy > 0 ? 1 : -1);
        }}
      >
        {Array.from({ length: size * size }, (_, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          const onSnake = snake.some((part) => part.x === x && part.y === y);
          const head = snake[0]?.x === x && snake[0]?.y === y;
          const onFood = food.x === x && food.y === y;
          return <i key={index} className={`${onSnake ? "is-snake" : ""} ${head ? "is-head" : ""} ${onFood ? "is-food" : ""}`} />;
        })}
      </div>
      <div className="snake-pad" role="group" aria-label="Κατεύθυνση">
        <button type="button" onClick={() => turn(0, -1)} aria-label="Πάνω">↑</button>
        <div>
          <button type="button" onClick={() => turn(-1, 0)} aria-label="Αριστερά">←</button>
          <button type="button" className="snake-go" onClick={start} aria-label={running ? "Επανεκκίνηση" : "Παίξε"}>
            {running ? "↻" : "▶"}
          </button>
          <button type="button" onClick={() => turn(1, 0)} aria-label="Δεξιά">→</button>
        </div>
        <button type="button" onClick={() => turn(0, 1)} aria-label="Κάτω">↓</button>
      </div>
      {!running && !alive && score > 0 && (
        <Overlay title="Τέλος γύρου" text={`Σκορ ${score}`} action="Ξανά" onAction={start} />
      )}
      {!running && alive && score === 0 && (
        <Overlay title="Φίδι στον θάλαμο" text="Σύρε ή πάτα τα βελάκια." action="Παίξε" onAction={start} />
      )}
    </GameStage>
  );
}

function spawnFood(snake, size) {
  let spot;
  do {
    spot = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
  } while (snake.some((part) => part.x === spot.x && part.y === spot.y));
  return spot;
}
