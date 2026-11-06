import { useMemo, useState } from "react";
import { orderSteps, packItems, situations } from "./content.js";
import { Icon } from "./icons.jsx";

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function BagGame({ country, onDone }) {
  const items = useMemo(() => shuffle(packItems[country]), [country]);
  const [picks, setPicks] = useState({});
  const [show, setShow] = useState(false);
  const answered = Object.keys(picks).length;
  const correct = items.filter((item) => picks[item.id] === item.pack).length;

  function choose(id, pack) {
    if (show) return;
    setPicks((prev) => ({ ...prev, [id]: pack }));
  }

  function finish() {
    setShow(true);
    onDone(correct, items.length);
  }

  return (
    <div className="game">
      <p className="lede">Πάτα την τσάντα ή το σπίτι. {answered}/{items.length}</p>
      <ol className="pack-list">
        {items.map((item) => {
          const pick = picks[item.id];
          const right = show && pick === item.pack;
          const wrong = show && pick !== undefined && pick !== item.pack;
          return (
            <li key={item.id} className={right ? "is-right" : wrong ? "is-wrong" : ""}>
              <p>{item.label}</p>
              <div className="pack-actions">
                <button type="button" className={pick === true ? "is-on" : ""} onClick={() => choose(item.id, true)}><Icon name="bag" /> Στην τσάντα</button>
                <button type="button" className={pick === false ? "is-on" : ""} onClick={() => choose(item.id, false)}><Icon name="home" /> Στο σπίτι</button>
              </div>
              {show && <p className="why">{item.why}</p>}
            </li>
          );
        })}
      </ol>
      {!show ? (
        <button type="button" className="btn solid" disabled={answered < items.length} onClick={finish}>
          Κλείσε την τσάντα
        </button>
      ) : (
        <p className="score-line">Σωστά {correct} από {items.length}. Κάθε λάθος είναι ένα πράγμα που θα έψαχνες στην ουρά.</p>
      )}
    </div>
  );
}

export function OrderGame({ country, onDone }) {
  const steps = orderSteps[country];
  const [order, setOrder] = useState(() => shuffle(steps));
  const [show, setShow] = useState(false);
  const correct = order.filter((step, index) => step.id === steps[index].id).length;

  function move(index, dir) {
    if (show) return;
    const next = index + dir;
    if (next < 0 || next >= order.length) return;
    const copy = [...order];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setOrder(copy);
  }

  function finish() {
    setShow(true);
    onDone(correct, steps.length);
  }

  return (
    <div className="game">
      <p className="lede">Βάλε τη μέρα στη σειρά της. Πάνω ό,τι γίνεται πρώτο.</p>
      <ol className="order-list">
        {order.map((step, index) => {
          const right = show && step.id === steps[index].id;
          return (
            <li key={step.id} className={show ? (right ? "is-right" : "is-wrong") : ""}>
              <span>{index + 1}</span>
              <p>{step.text}</p>
              <div>
                <button type="button" aria-label="Πιο πάνω" onClick={() => move(index, -1)}><Icon name="up" /></button>
                <button type="button" aria-label="Πιο κάτω" onClick={() => move(index, 1)}><Icon name="down" /></button>
              </div>
            </li>
          );
        })}
      </ol>
      {!show ? (
        <button type="button" className="btn solid" onClick={finish}>Αυτή είναι η σειρά μου</button>
      ) : (
        <p className="score-line">{correct} από {steps.length} στη θέση που πρέπει. Όσα είναι πράσινα κάθονται στη σωστή σειρά.</p>
      )}
    </div>
  );
}

export function SituationGame({ onDone }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const card = situations[index];
  const done = index >= situations.length;

  function choose(option) {
    if (picked) return;
    setPicked(option);
  }

  function next() {
    const total = score + (picked?.good ? 1 : 0);
    if (index + 1 >= situations.length) onDone(total, situations.length);
    setScore(total);
    setPicked(null);
    setIndex((n) => n + 1);
  }

  if (done) {
    return <p className="score-line">Τέλος γύρου. Ήρεμες απαντήσεις: {score} από {situations.length}.</p>;
  }

  return (
    <div className="game">
      <p className="kicker">Σκηνή {index + 1} / {situations.length}</p>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
      <div className="choices">
        {card.options.map((option) => (
          <button
            key={option.t}
            type="button"
            className={picked ? (option.good ? "is-right" : option === picked ? "is-wrong" : "") : ""}
            onClick={() => choose(option)}
          >
            {option.t}
          </button>
        ))}
      </div>
      {picked && <p className="why">{picked.why}</p>}
      {picked && (
        <button type="button" className="btn solid" onClick={next}>
          {index + 1 === situations.length ? "Κλείσε τον γύρο" : "Επόμενη σκηνή"}
        </button>
      )}
    </div>
  );
}
