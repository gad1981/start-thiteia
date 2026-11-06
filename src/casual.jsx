import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons.jsx";

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const MEMORY_ICONS = ["bag", "moon", "sun", "phone", "drop", "boot", "heart", "file"];

export function MemoryGame({ onScore }) {
  const [cards, setCards] = useState(() => makeMemory());
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const done = matched.length === MEMORY_ICONS.length;

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
      if (nextMatched.length === MEMORY_ICONS.length) {
        const score = Math.max(10, 100 - nextMoves * 3);
        setFinalScore(score);
        onScore(score);
      }
      return;
    }
    setLock(true);
    setTimeout(() => {
      setOpen([]);
      setLock(false);
    }, 650);
  }

  function restart() {
    setCards(makeMemory());
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setFinalScore(null);
  }

  return (
    <div className="game casual">
      <div className="casual-top">
        <p className="lede">Βρες τα ζευγάρια. Κινήσεις: {moves}</p>
        <button type="button" className="btn tiny ghost" onClick={restart}>Νέο</button>
      </div>
      <div className="memory-grid">
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
              {shown ? <Icon name={card.icon} /> : <span>?</span>}
            </button>
          );
        })}
      </div>
      {done && <p className="score-line">Τέλος. {moves} κινήσεις · σκορ {finalScore}.</p>}
    </div>
  );
}

function makeMemory() {
  return shuffle(
    MEMORY_ICONS.flatMap((icon, index) => [
      { id: `${icon}-a-${index}`, icon },
      { id: `${icon}-b-${index}`, icon },
    ]),
  );
}

export function ReactionGame({ onScore }) {
  const [phase, setPhase] = useState("idle");
  const [ms, setMs] = useState(null);
  const [best, setBest] = useState(null);
  const timer = useRef(0);
  const start = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function arm() {
    setPhase("wait");
    setMs(null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPhase("go");
      start.current = performance.now();
    }, 1200 + Math.random() * 2800);
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
      setBest((prev) => (prev == null || value < prev ? value : prev));
      setPhase("result");
      onScore(Math.max(5, 500 - value));
    }
  }

  const label = {
    idle: "Πάτα για να ξεκινήσεις",
    wait: "Περίμενε το πράσινο…",
    go: "ΤΩΡΑ",
    early: "Νωρίς. Πάτα για ξανά.",
    result: `${ms} ms · Πάτα για ξανά`,
  }[phase];

  return (
    <div className="game casual">
      <p className="lede">Όταν γίνει πράσινο, πάτα όσο πιο γρήγορα μπορείς.</p>
      <button type="button" className={`react-pad is-${phase}`} onClick={tap}>
        <strong>{label}</strong>
        {best != null && <span>Καλύτερο: {best} ms</span>}
      </button>
    </div>
  );
}

const PADS = [
  { id: 0, color: "#c48a22" },
  { id: 1, color: "#2f6b4f" },
  { id: 2, color: "#8d3b32" },
  { id: 3, color: "#314f6b" },
];

export function SequenceGame({ onScore }) {
  const [seq, setSeq] = useState([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(null);
  const [phase, setPhase] = useState("ready");
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (phase !== "show") return undefined;
    let i = 0;
    const run = () => {
      if (i >= seq.length) {
        setLit(null);
        setPhase("input");
        return;
      }
      setLit(seq[i]);
      window.setTimeout(() => {
        setLit(null);
        i += 1;
        window.setTimeout(run, 180);
      }, 420);
    };
    const wait = window.setTimeout(run, 350);
    return () => window.clearTimeout(wait);
  }, [phase, seq]);

  function start() {
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    setStep(0);
    setLevel(0);
    setPhase("show");
  }

  function press(id) {
    if (phase !== "input") return;
    setLit(id);
    window.setTimeout(() => setLit(null), 160);
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

  return (
    <div className="game casual">
      <div className="casual-top">
        <p className="lede">Θυμήσου τη σειρά. Επίπεδο {level}</p>
        {(phase === "ready" || phase === "fail") && (
          <button type="button" className="btn tiny solid" onClick={start}>
            {phase === "fail" ? "Ξανά" : "Έναρξη"}
          </button>
        )}
      </div>
      <div className="simon-grid">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            className={`simon-pad ${lit === pad.id ? "is-lit" : ""}`}
            style={{ background: pad.color }}
            onClick={() => press(pad.id)}
            aria-label={`πλήκτρο ${pad.id + 1}`}
          />
        ))}
      </div>
      {phase === "fail" && <p className="score-line">Λάθος στη σειρά. Έφτασες επίπεδο {level}.</p>}
      {phase === "input" && <p className="fine">Η σειρά είναι πάνω σου.</p>}
      {phase === "show" && <p className="fine">Κοίτα…</p>}
    </div>
  );
}

const SIZE = 12;

export function SnakeGame({ onScore }) {
  const [snake, setSnake] = useState([{ x: 5, y: 6 }, { x: 4, y: 6 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 8, y: 6 });
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const dirRef = useRef(dir);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);

  useEffect(() => {
    if (!running || !alive) return undefined;
    const id = window.setInterval(() => {
      const d = dirRef.current;
      const body = snakeRef.current;
      const head = { x: body[0].x + d.x, y: body[0].y + d.y };
      if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE || body.some((part) => part.x === head.x && part.y === head.y)) {
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
        setFood(spawnFood(next));
      } else {
        next.pop();
      }
      setSnake(next);
    }, 140);
    return () => window.clearInterval(id);
  }, [running, alive, onScore]);

  function turn(nx, ny) {
    const d = dirRef.current;
    if (d.x + nx === 0 && d.y + ny === 0) return;
    setDir({ x: nx, y: ny });
  }

  function start() {
    const startSnake = [{ x: 5, y: 6 }, { x: 4, y: 6 }];
    setSnake(startSnake);
    setDir({ x: 1, y: 0 });
    setFood(spawnFood(startSnake));
    setAlive(true);
    setScore(0);
    scoreRef.current = 0;
    setRunning(true);
  }

  return (
    <div className="game casual">
      <div className="casual-top">
        <p className="lede">Σκορ {score}{!alive && running === false && score > 0 ? " · τέλος" : ""}</p>
        <button type="button" className="btn tiny solid" onClick={start}>{running ? "Επανεκκίνηση" : "Παίξε"}</button>
      </div>
      <div
        className="snake-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        onTouchStart={(event) => {
          const touch = event.changedTouches[0];
          event.currentTarget.dataset.x = touch.clientX;
          event.currentTarget.dataset.y = touch.clientY;
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
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const x = index % SIZE;
          const y = Math.floor(index / SIZE);
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
          <button type="button" onClick={() => turn(1, 0)} aria-label="Δεξιά">→</button>
        </div>
        <button type="button" onClick={() => turn(0, 1)} aria-label="Κάτω">↓</button>
      </div>
      {!alive && <p className="score-line">Τέλος γύρου. Σκορ {score}.</p>}
    </div>
  );
}

function spawnFood(snake) {
  let spot;
  do {
    spot = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
  } while (snake.some((part) => part.x === spot.x && part.y === spot.y));
  return spot;
}
