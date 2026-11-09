import { useEffect, useMemo, useState } from "react";
import {
  aims,
  askReplies,
  askStarters,
  chapters,
  checklistFor,
  closerFor,
  countries,
  helpCatalogue,
  highlightChapter,
  introPoints,
  kit,
  personalLine,
  sources,
  supports,
  timings,
  worries,
} from "./content.js";
import { MemoryGame, ReactionGame, SequenceGame, SnakeGame } from "./casual.jsx";
import { BagGame, OrderGame } from "./games.jsx";
import { chapterIcon, Icon, introIcon, kitIcon, photoAlt, worryIcon } from "./icons.jsx";
import { loadState, saveState } from "./storage.js";

const PHOTO_V = "5";
const photo = (id) => `/photos/${id}.jpg?v=${PHOTO_V}`;

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const go = (next) => {
    window.location.hash = next;
  };
  return [hash, go];
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [hash, go] = useHash();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const patch = (partial) => setState((prev) => ({ ...prev, ...partial }));
  const country = state.country;
  const book = chapters[country];
  const route = parseHash(hash);

  function addXp(amount, key) {
    setState((prev) => {
      if (key && prev.games[key]) return prev;
      return {
        ...prev,
        xp: prev.xp + amount,
        games: key ? { ...prev.games, [key]: true } : prev.games,
      };
    });
  }

  function recordGame(key, correct, total) {
    const amount = Math.round((correct / total) * 40);
    saveBest(key, amount);
  }

  function saveBest(key, score) {
    setState((prev) => {
      const prevBest = prev.games[key] || 0;
      if (score <= prevBest) return prev;
      return {
        ...prev,
        xp: prev.xp + Math.min(20, score - prevBest),
        games: { ...prev.games, [key]: score },
      };
    });
  }

  return (
    <div className={state.large ? "app is-large" : "app"}>
      <a className="skip" href="#continut">Μετάβαση στο περιεχόμενο</a>
      <Header
        country={country}
        large={state.large}
        onCountry={(value) => patch({ country: value })}
        onLarge={(large) => patch({ large })}
        go={go}
      />
      <div id="continut">
      {route.name === "home" && <Home state={state} book={book} go={go} />}
      {route.name === "journey" && <Journey state={state} patch={patch} go={go} />}
      {route.name === "intro" && <Intro go={go} />}
      {route.name === "map" && <Map state={state} book={book} go={go} />}
      {route.name === "chapter" && (
        <Chapter
          state={state}
          book={book}
          id={route.id}
          patch={patch}
          go={go}
          addXp={addXp}
          recordGame={recordGame}
        />
      )}
      {route.name === "quiz" && <Quiz state={state} book={book} id={route.id} patch={patch} go={go} />}
      {route.name === "play" && <Play state={state} go={go} saveBest={saveBest} patch={patch} />}
      {route.name === "list" && <CheckList state={state} patch={patch} />}
      {route.name === "ask" && <Ask country={country} go={go} />}
      {route.name === "guide" && <Guide state={state} book={book} />}
      {route.name === "help" && <Help state={state} go={go} />}
      {route.name === "sources" && <Sources go={go} />}
      {route.name === "privacy" && <Privacy />}
      {route.name === "access" && <Access />}
      {route.name === "program" && <Program />}
      {route.name === "home" && <Foot go={go} />}
      </div>
      <BottomNav hash={hash} go={go} />
    </div>
  );
}

function parseHash(hash) {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts[0] === "chapter" && parts[1]) return { name: "chapter", id: parts[1] };
  if (parts[0] === "quiz" && parts[1]) return { name: "quiz", id: parts[1] };
  if (["journey", "map", "play", "list", "ask", "guide", "help", "sources", "intro", "privacy", "access", "program"].includes(parts[0])) {
    return { name: parts[0] };
  }
  return { name: "home" };
}

const burgerLinks = [
  ["#/help", "Βοήθεια & τηλέφωνα", "life"],
  ["#/map", "Διαδρομή", "path"],
  ["#/list", "Λίστα παραμονής", "list"],
  ["#/play", "Παιχνίδια", "cards"],
  ["#/ask", "Ρώτα", "chat"],
  ["#/guide", "Εγχειρίδιο", "handbook"],
  ["#/sources", "Πηγές", "file"],
  ["#/privacy", "Απόρρητο", "lock"],
  ["#/access", "Προσβασιμότητα", "sun"],
  ["#/program", "Το πρόγραμμα", "book"],
];

function Header({ country, large, onCountry, onLarge, go }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function jump(href) {
    setMenuOpen(false);
    go(href);
  }

  return (
    <header className="top">
      <button type="button" className="brand" onClick={() => jump("#/")}>
        <Sakos />
        <span>START <em>Θητεία</em></span>
      </button>
      <div className="switch" role="group" aria-label="Χώρα">
        {Object.entries(countries).map(([id, item]) => (
          <button key={id} type="button" className={country === id ? "is-on" : ""} onClick={() => onCountry(id)}>
            {item.short}
          </button>
        ))}
      </div>
      <button type="button" className={large ? "aa is-on" : "aa"} aria-pressed={large} onClick={() => onLarge(!large)}>
        Αα
      </button>
      <button
        type="button"
        className={`burger ${menuOpen ? "is-on" : ""}`}
        aria-label={menuOpen ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
        aria-expanded={menuOpen}
        aria-controls="app-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon name={menuOpen ? "close" : "menu"} />
      </button>
      {menuOpen && (
        <>
          <button type="button" className="menu-scrim" aria-label="Κλείσιμο μενού" onClick={() => setMenuOpen(false)} />
          <nav id="app-menu" className="burger-panel" aria-label="Μενού">
            <p className="kicker">Μενού</p>
            <ul>
              {burgerLinks.map(([href, label, icon]) => (
                <li key={href}>
                  <button type="button" onClick={() => jump(href)}>
                    <Icon name={icon} />
                    <span>{label}</span>
                    <Icon name="arrow" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}

function Sakos() {
  return (
    <svg className="sakos" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#243028" />
      <path d="M7 10h18v14a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" fill="#f4efe4" />
      <path d="M12 11c.5 4 .5 8 0 13M20 11c-.5 4-.5 8 0 13" fill="none" stroke="#243028" strokeWidth="1.6" />
      <rect x="13" y="18" width="6" height="5" rx="1" fill="#243028" />
    </svg>
  );
}

function Home({ state, book, go }) {
  const place = countries[state.country];
  return (
    <main className="home-screen">
      <section className="hero">
        <img className="hero-photo" src={photo("hero")} alt={photoAlt.hero} />
        <div className="hero-copy">
          <p className="eyebrow">Για την πρώτη μέρα μέσα · {place.force}</p>
          <h1>Μπήκες. Ας δούμε τι γίνεται τώρα.</h1>
          <p className="lede">Λίγο για τα χαρτιά. Κυρίως για τον ρυθμό μέσα. Και παιχνίδια θαλάμου. Χωρίς λογαριασμό.</p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn solid" onClick={() => go(state.onboarded ? "#/map" : "#/journey")}>
            {state.onboarded ? "Συνέχισε τη διαδρομή" : "Άνοιξε τον οδηγό"}
            <Icon name="arrow" />
          </button>
          <button type="button" className="btn ghost" onClick={() => go("#/play")}>
            <Icon name="cards" />
            Περιοχή παιχνιδιών
          </button>
        </div>
      </section>
      <ol className="preview">
        {book.map((chapter, index) => {
          const open = index === 0 || state.quizzes[`${state.country}:${book[index - 1].id}`] !== undefined;
          return (
            <li key={chapter.id}>
              <button type="button" onClick={() => go(open ? `#/chapter/${chapter.id}` : "#/map")}>
                <span className="shot">
                  <img src={photo(chapter.id)} alt="" />
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </span>
                <span>
                  <strong>{chapter.title}</strong>
                  <em>{chapter.kicker}</em>
                </span>
                <Icon name={open ? chapterIcon[chapter.id] : "lock"} />
              </button>
            </li>
          );
        })}
      </ol>
      <section className="band">
        <h2>Περίπου 20% χαρτιά. 80% τι κάνουμε τώρα.</h2>
        <p>Ένα σύντομο κεφάλαιο για ό,τι ήδη πρέπει να έχεις. Τα υπόλοιπα για θάλαμο, σώμα, τηλέφωνο, άδειες. Και φίδι, μνήμη, αντίδραση όταν βαριέσαι.</p>
        <div className="row">
          <button type="button" className="btn solid" onClick={() => go(state.onboarded ? "#/map" : "#/journey")}>Άνοιξε τη διαδρομή</button>
          <button type="button" className="btn ghost" onClick={() => go("#/play")}>Παιχνίδια</button>
        </div>
      </section>
    </main>
  );
}

function Intro({ go }) {
  return (
    <main className="sheet">
      <p className="kicker">Οδηγός</p>
      <h1>Μερικά πράγματα που βοηθάνε την πρώτη μέρα μέσα.</h1>
      <p className="lede">Ουρά, χαρτιά, θάλαμος και ένα τηλέφωνο που δεν χτυπά όποτε θέλεις. Δεν χρειάζεται να τα ξέρεις όλα. Χρειάζεται να ξέρεις τι γίνεται τώρα.</p>
      {introPoints.map((point, index) => (
        <section key={point.title} className="point">
          <p className="kicker"><Icon name={introIcon[index]} /> {point.kicker}</p>
          <h2>{point.title}</h2>
          <p>{point.text}</p>
        </section>
      ))}
      <button type="button" className="btn solid" onClick={() => go("#/chapter/papers")}>Ξεκίνα με το πρώτο κεφάλαιο</button>
    </main>
  );
}

function Journey({ state, patch, go }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    worries: state.worries,
    aim: state.aim,
    timing: state.timing,
    support: state.support,
  });

  const steps = [
    { title: "Τι σε απασχολεί τώρα μέσα;", hint: "Ως τρία.", valid: draft.worries.length > 0 },
    { title: "Τι θέλεις να σου μείνει από τις πρώτες μέρες;", hint: "Ένα.", valid: Boolean(draft.aim) },
    { title: "Πού βρίσκεσαι τώρα;", hint: "Ένα.", valid: Boolean(draft.timing) },
    { title: "Από πού θες να ξεκινήσει ο οδηγός;", hint: "Ένα.", valid: Boolean(draft.support) },
  ];

  function toggleWorry(id) {
    setDraft((prev) => {
      const has = prev.worries.includes(id);
      const worries = has ? prev.worries.filter((item) => item !== id) : prev.worries.length >= 3 ? prev.worries : [...prev.worries, id];
      return { ...prev, worries };
    });
  }

  function finish() {
    patch({ ...draft, onboarded: true });
    go("#/map");
  }

  return (
    <main className="sheet">
      <p className="kicker">Βήμα {step + 1} από 4 · {countries[state.country].name}</p>
      <div className="steps" aria-hidden="true">{[0, 1, 2, 3].map((item) => <i key={item} className={item <= step ? "is-on" : ""} />)}</div>
      <h1>{steps[step].title}</h1>
      <p className="lede">{steps[step].hint}</p>
      {step === 0 && (
        <div className="chips">
          {worries.map((item) => (
            <button key={item.id} type="button" className={draft.worries.includes(item.id) ? "is-on" : ""} onClick={() => toggleWorry(item.id)}>
              <Icon name={worryIcon[item.id]} />
              {item.label}
            </button>
          ))}
        </div>
      )}
      {step === 1 && <Choice list={aims} value={draft.aim} onPick={(aim) => setDraft({ ...draft, aim })} />}
      {step === 2 && <Choice list={timings} value={draft.timing} onPick={(timing) => setDraft({ ...draft, timing })} />}
      {step === 3 && <Choice list={supports} value={draft.support} onPick={(support) => setDraft({ ...draft, support })} />}
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => (step === 0 ? go("#/") : setStep(step - 1))}>Πίσω</button>
        {step < 3 ? (
          <button type="button" className="btn solid" disabled={!steps[step].valid} onClick={() => setStep(step + 1)}>Επόμενο</button>
        ) : (
          <button type="button" className="btn solid" disabled={!steps[step].valid} onClick={finish}>Δες τον χάρτη σου</button>
        )}
      </div>
    </main>
  );
}

function Choice({ list, value, onPick }) {
  return (
    <div className="chips column">
      {list.map((item) => (
        <button key={item.id} type="button" className={value === item.id ? "is-on" : ""} onClick={() => onPick(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function progressOf(state, book) {
  const done = book.filter((chapter) => state.quizzes[`${state.country}:${chapter.id}`] !== undefined).length;
  return { done, total: book.length, pct: Math.round((done / book.length) * 100) };
}

function Map({ state, book, go }) {
  const focus = highlightChapter(state);
  const passed = new Set(Object.keys(state.quizzes));
  const keyFor = (id) => `${state.country}:${id}`;
  const progress = progressOf(state, book);
  const firstOpen = book.findIndex((chapter, index) => {
    const open = index === 0 || passed.has(keyFor(book[index - 1].id));
    return open && !passed.has(keyFor(chapter.id));
  });
  return (
    <main>
      <section className="sheet">
        <p className="kicker">{countries[state.country].force}</p>
        <h1>Η διαδρομή μου</h1>
        <p className="lede">Λίγο προετοιμασία. Κυρίως τι κάνουμε τώρα. Τα κεφάλαια ξεκλειδώνουν ένα ένα.</p>
        <p>{personalLine(state)}</p>
        <div className="meter" aria-label={`${progress.pct}%`}>
          <div><b>{progress.pct}%</b><span>{progress.done} από {progress.total} κεφάλαια ολοκληρώθηκαν</span></div>
          <span className="track"><i style={{ width: `${progress.pct}%` }} /></span>
        </div>
      </section>
      {["prep", "now"].map((phase) => {
        const slice = book
          .map((chapter, index) => ({ chapter, index }))
          .filter(({ chapter }) => (chapter.phase || "now") === phase);
        if (!slice.length) return null;
        return (
          <section key={phase} className="phase">
            <p className="kicker">{phase === "prep" ? "Προετοιμασία · ~20%" : "Τώρα μέσα · ~80%"}</p>
            <ol className="chapters">
              {slice.map(({ chapter, index }) => {
                const open = index === 0 || passed.has(keyFor(book[index - 1].id));
                const done = passed.has(keyFor(chapter.id));
                const label = done ? "Ολοκληρώθηκε" : index === firstOpen ? "Ξεκίνα εδώ" : open ? "Άνοιξε" : "Κλειδωμένο";
                return (
                  <li key={chapter.id} className={chapter.id === focus ? "is-focus" : ""}>
                    <button type="button" disabled={!open} onClick={() => go(`#/chapter/${chapter.id}`)}>
                      <span className="shot">
                        <img src={photo(chapter.id)} alt="" />
                        <b>{index + 1}</b>
                      </span>
                      <span>
                        <small>{label}{chapter.id === focus ? " · για σένα" : ""}</small>
                        <strong>{chapter.title}</strong>
                        <em>{chapter.kicker}</em>
                      </span>
                      <Icon name={done ? "check" : open ? chapterIcon[chapter.id] : "lock"} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => go("#/list")}><Icon name="list" /> Λίστα παραμονής</button>
        <button type="button" className="btn solid" onClick={() => go("#/play")}><Icon name="cards" /> Περιοχή παιχνιδιών</button>
      </div>
    </main>
  );
}

function Chapter({ state, book, id, patch, go, addXp, recordGame }) {
  const index = book.findIndex((chapter) => chapter.id === id);
  const chapter = book[index];
  const passed = new Set(Object.keys(state.quizzes));
  const noteKey = `${state.country}:${id}`;
  const open = index === 0 || (index > 0 && passed.has(`${state.country}:${book[index - 1].id}`));
  const [note, setNote] = useState(state.notes[noteKey] || "");
  const [saved, setSaved] = useState(false);
  const closer = closerFor(id);

  function saveNote() {
    patch({ notes: { ...state.notes, [noteKey]: note.slice(0, 500) } });
    setSaved(true);
  }

  if (!chapter || !open) {
    return (
      <main className="sheet">
        <h1>Αυτό το κεφάλαιο είναι ακόμη κλειδωμένο.</h1>
        <button type="button" className="btn solid" onClick={() => go("#/map")}>Πίσω στον χάρτη</button>
      </main>
    );
  }

  return (
    <main className="sheet reading">
      <Rail book={book} index={index} country={state.country} passed={passed} go={go} />
      <figure className="chapter-photo">
        <img src={photo(chapter.id)} alt={photoAlt[chapter.id]} />
      </figure>
      <p className="kicker"><Icon name={chapterIcon[chapter.id]} /> Κεφάλαιο {index + 1}</p>
      <h1>{chapter.title}</h1>
      <p className="lede">{chapter.kicker}</p>
      {chapter.blocks.map((block, i) => {
        if (block.type === "p") return <p key={i}>{block.text}</p>;
        if (block.type === "ul") return <ul key={i}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
        return (
          <aside key={i} className="callout">
            <strong>{block.title}</strong>
            <p>{block.text}</p>
          </aside>
        );
      })}
      {chapter.game === "bag" && (
        <BagGame country={state.country} onDone={(correct, total) => recordGame(`bag-${state.country}`, correct, total)} />
      )}
      {chapter.game === "order" && (
        <OrderGame country={state.country} onDone={(correct, total) => recordGame(`order-${state.country}`, correct, total)} />
      )}
      {closer && (
        <blockquote>
          <p>«{closer.quote}»</p>
          <footer>— {closer.who}</footer>
        </blockquote>
      )}
      {closer && (
        <aside className="callout">
          <strong>Μεταξύ μας...</strong>
          <p>{closer.between}</p>
        </aside>
      )}
      <label className="note">
        Τι μένει μαζί σου;
        <span className="fine">Προσωπική σημείωση — αποθηκεύεται μόνο σε αυτό το τηλέφωνο.</span>
        <textarea
          maxLength={500}
          value={note}
          onChange={(event) => {
            setSaved(false);
            setNote(event.target.value.slice(0, 500));
          }}
          placeholder="Μία γραμμή φτάνει."
        />
        <span className="fine">{note.length}/500 {saved ? "· Αποθηκεύτηκε" : ""}</span>
      </label>
      <div className="row">
        <button type="button" className="btn ghost" onClick={saveNote}>Αποθήκευση σημείωσης</button>
        <button
          type="button"
          className="btn solid"
          onClick={() => {
            saveNote();
            addXp(8, `read-${state.country}-${id}`);
            go(`#/quiz/${id}`);
          }}
        >
          Ξεκίνα το κουίζ
          <Icon name="arrow" />
        </button>
      </div>
    </main>
  );
}

function Rail({ book, index, country, passed, go }) {
  return (
    <ol className="rail" aria-label="Κεφάλαια">
      {book.map((chapter, itemIndex) => {
        const open = itemIndex === 0 || passed.has(`${country}:${book[itemIndex - 1].id}`);
        return (
          <li key={chapter.id}>
            <button
              type="button"
              disabled={!open}
              className={itemIndex === index ? "is-on" : ""}
              onClick={() => go(`#/chapter/${chapter.id}`)}
            >
              {itemIndex + 1}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Quiz({ state, book, id, patch, go }) {
  const chapter = book.find((item) => item.id === id);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  if (!chapter) return null;
  const index = book.findIndex((item) => item.id === id);
  const next = book[index + 1];
  const score = chapter.quiz.filter((question, questionIndex) => question.options[answers[questionIndex]]?.good).length;
  const quizKey = `${state.country}:${id}`;
  const answered = Object.keys(answers).length;

  function finish() {
    setDone(true);
    patch({
      quizzes: { ...state.quizzes, [quizKey]: score },
      xp: state.xp + (state.quizzes[quizKey] === undefined ? 25 : 0),
    });
  }

  return (
    <main className="sheet">
      <p className="kicker">Κουίζ · {answered}/{chapter.quiz.length}</p>
      <h1>{chapter.title}</h1>
      <p className="lede">Απάντησε με τον ρυθμό σου. Κάθε απάντηση σε βοηθά να σκεφτείς. Το επόμενο κεφάλαιο ανοίγει μόλις τις στείλεις.</p>
      {chapter.quiz.map((question, questionIndex) => (
        <fieldset key={question.q} disabled={done}>
          <legend>Ερώτηση {questionIndex + 1}. {question.q}</legend>
          {question.options.map((option, optionIndex) => {
            const selected = answers[questionIndex] === optionIndex;
            const mark = done && option.good ? "is-right" : selected ? "is-on" : "";
            const letter = "ΑΒΓΔ"[optionIndex];
            return (
              <button key={option.t} type="button" className={mark} onClick={() => setAnswers({ ...answers, [questionIndex]: optionIndex })}>
                <b>{letter}</b> {option.t}
                {done && selected && <small>{option.good ? "Αυτό ταιριάζει με τα χαρτιά. " : "Ας το δούμε και από άλλη οπτική. "}{option.why}</small>}
              </button>
            );
          })}
        </fieldset>
      ))}
      {!done ? (
        <button type="button" className="btn solid" disabled={answered < chapter.quiz.length} onClick={finish}>
          Υποβολή απαντήσεων
        </button>
      ) : (
        <section className="done-card">
          <h2>Το κεφάλαιο ολοκληρώθηκε!</h2>
          <p>Μπράβο. Είσαι έτοιμος για το επόμενο βήμα. {score} από {chapter.quiz.length} ταίριαξαν με τα χαρτιά.</p>
          <div className="row">
            {next ? (
              <button type="button" className="btn solid" onClick={() => go(`#/chapter/${next.id}`)}>Επόμενο κεφάλαιο</button>
            ) : (
              <button type="button" className="btn solid" onClick={() => go("#/guide")}>Πάρε το εγχειρίδιο</button>
            )}
            <button type="button" className="btn ghost" onClick={() => go(`#/chapter/${id}`)}>Ξαναδιάβασε το κεφάλαιο</button>
            <button type="button" className="btn ghost" onClick={() => go("#/map")}>Μείνε στη διαδρομή</button>
          </div>
        </section>
      )}
    </main>
  );
}

function Play({ state, go, saveBest, patch }) {
  const [which, setWhich] = useState(null);
  const games = [
    { id: "snake", cover: "game-snake", title: "Φίδι", text: "Κλασικό. Σύρε ή πάτα τα βελάκια.", best: state.games.snake, unit: "πόντοι" },
    { id: "memory", cover: "game-memory", title: "Μνήμη", text: "Βρες τα ζευγάρια χωρίς άγχος.", best: state.games.memory, unit: "πόντοι" },
    { id: "react", cover: "game-react", title: "Αντίδραση", text: "Πράσινο = πάτα. Πόσο γρήγορα είσαι;", best: state.games.react, unit: "πόντοι" },
    { id: "simon", cover: "game-simon", title: "Σειρά", text: "Θυμήσου τα χρώματα και επανέλαβε.", best: state.games.simon, unit: "πόντοι" },
  ];
  const active = games.find((game) => game.id === which);
  const back = () => setWhich(null);
  const coverUrl = active ? photo(active.cover) : null;
  const setPrefs = (id, partial) => {
    patch({
      gamePrefs: {
        ...state.gamePrefs,
        [id]: { ...state.gamePrefs[id], ...partial },
      },
    });
  };

  useEffect(() => {
    document.body.classList.toggle("game-open", Boolean(which));
    return () => document.body.classList.remove("game-open");
  }, [which]);

  return (
    <>
      <main className="sheet play-hub">
        <p className="kicker">Περιοχή παιχνιδιών</p>
        <h1>Για όταν βαριέσαι στον θάλαμο.</h1>
        <p className="lede">Καθαρά παιχνίδια. Χωρίς κουίζ και χωρίς μάθημα. Το καλύτερο σκορ μένει σε αυτό το τηλέφωνο.</p>
        <div className="play-grid">
          {games.map((game) => (
            <button key={game.id} type="button" className="play-cover" onClick={() => setWhich(game.id)}>
              <span className="play-art">
                <img src={photo(game.cover)} alt="" />
              </span>
              <span className="play-meta">
                <small>{game.best != null ? `Καλύτερο ${game.best} ${game.unit}` : "Παίξε τώρα"}</small>
                <strong>{game.title}</strong>
                <em>{game.text}</em>
              </span>
            </button>
          ))}
        </div>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => go("#/map")}>Στη διαδρομή</button>
        </div>
      </main>
      {which === "snake" && (
        <SnakeGame
          cover={coverUrl}
          best={state.games.snake}
          prefs={state.gamePrefs.snake}
          onPrefs={(partial) => setPrefs("snake", partial)}
          onBack={back}
          onScore={(score) => saveBest("snake", score)}
        />
      )}
      {which === "memory" && (
        <MemoryGame
          cover={coverUrl}
          best={state.games.memory}
          prefs={state.gamePrefs.memory}
          onPrefs={(partial) => setPrefs("memory", partial)}
          onBack={back}
          onScore={(score) => saveBest("memory", score)}
        />
      )}
      {which === "react" && (
        <ReactionGame
          cover={coverUrl}
          best={state.games.react}
          prefs={state.gamePrefs.react}
          onPrefs={(partial) => setPrefs("react", partial)}
          onBack={back}
          onScore={(score) => saveBest("react", score)}
        />
      )}
      {which === "simon" && (
        <SequenceGame
          cover={coverUrl}
          best={state.games.simon}
          prefs={state.gamePrefs.simon}
          onPrefs={(partial) => setPrefs("simon", partial)}
          onBack={back}
          onScore={(score) => saveBest("simon", score)}
        />
      )}
    </>
  );
}

function CheckList({ state, patch }) {
  const items = useMemo(() => checklistFor(state.country), [state.country]);
  const done = items.filter((item) => state.checks[`${state.country}-${item.id}`]).length;
  function toggle(id) {
    const key = `${state.country}-${id}`;
    patch({ checks: { ...state.checks, [key]: !state.checks[key] } });
  }
  return (
    <main className="sheet">
      <p className="kicker">{countries[state.country].name}</p>
      <h1>Λίστα παραμονής</h1>
      <p className="lede">{done} από {items.length}. Τσεκάρεις ό,τι είναι ήδη στην τσάντα ή ήδη ειπωμένο.</p>
      <ul className="checks">
        {items.map((item) => {
          const key = `${state.country}-${item.id}`;
          return (
            <li key={item.id}>
              <label>
                <input type="checkbox" checked={Boolean(state.checks[key])} onChange={() => toggle(item.id)} />
                <span>{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function askQuestion(text) {
  const q = text.toLowerCase();
  return askReplies.find((item) => item.keys.some((key) => q.includes(key)))
    || { text: "Δεν έχω έτοιμη γραμμή γι’ αυτό. Δοκίμασε σημείωμα, τσάντα, άδεια, τηλέφωνο, γιατρός, μήνες ή IBAN.", chapter: null };
}

function Ask({ go }) {
  const [text, setText] = useState("");
  const [reply, setReply] = useState(null);
  function submit(event) {
    event.preventDefault();
    setReply(askQuestion(text));
  }
  return (
    <main className="sheet">
      <p className="kicker">Ρώτα τον οδηγό</p>
      <h1>Σύντομη απάντηση, από τα κεφάλαια.</h1>
      <p className="lede">Δεν είναι σύμβουλος και δεν στέλνει την ερώτηση πουθενά. Αν ζαλίζεσαι ή φοβάσαι, ο γιατρός της μονάδας και το 112 είναι ο δρόμος, όχι αυτό το κουτί.</p>
      <div className="chips">
        {askStarters.map((starter) => (
          <button key={starter} type="button" onClick={() => { setText(starter); setReply(askQuestion(starter)); }}>
            {starter}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="π.χ. τι IBAN χρειάζομαι;" />
        <button type="submit" className="btn solid">Απάντηση</button>
      </form>
      {reply && (
        <aside className="callout">
          <p>{reply.text}</p>
          {reply.chapter && <button type="button" className="btn ghost" onClick={() => go(`#/chapter/${reply.chapter}`)}>Δες ολόκληρο το κεφάλαιο</button>}
        </aside>
      )}
    </main>
  );
}

function Guide({ state, book }) {
  const items = checklistFor(state.country);
  return (
    <main className="sheet guide">
      <p className="kicker">Εκτυπώσιμος οδηγός · {countries[state.country].name}</p>
      <h1>START Θητεία — τα πρακτικά</h1>
      <p>{personalLine(state)}</p>
      <h2>Κράτα αυτά</h2>
      <ul>{items.map((item) => <li key={item.id}>{item.label}</li>)}</ul>
      <h2>Κιτ για τις πρώτες μέρες</h2>
      <ul className="kit">
        {kit.map((item, index) => (
          <li key={item.title}><Icon name={kitIcon[index]} /><span><strong>{item.title}.</strong> {item.text}</span></li>
        ))}
      </ul>
      <h2>Σε μία σελίδα</h2>
      {book.map((chapter) => (
        <section key={chapter.id}>
          <h3>{chapter.title}</h3>
          {state.notes[`${state.country}:${chapter.id}`] && <p><em>Σημείωσή σου: {state.notes[`${state.country}:${chapter.id}`]}</em></p>}
          {chapter.blocks.filter((block) => block.type === "p").slice(0, 1).map((block) => <p key={block.text}>{block.text}</p>)}
        </section>
      ))}
      <p className="fine">Έλεγχος στοιχείων: Νοέμβριος 2026. Επιβεβαίωσε ημερομηνία, μήνες και ποσά στο σημείωμά σου.</p>
      <button type="button" className="btn solid print-hide" onClick={() => window.print()}><Icon name="print" /> Εκτύπωση ή PDF</button>
    </main>
  );
}

function Help({ state, go }) {
  const catalogue = helpCatalogue[state.country] || helpCatalogue.gr;
  const place = countries[state.country];
  return (
    <main className="sheet help-page">
      <p className="kicker">Κατάλογος βοήθειας · {place.name}</p>
      <h1>{catalogue.title}</h1>
      <p className="lede">{catalogue.lede}</p>
      <p className="fine">Οι αριθμοί αλλάζουν. Αν κάτι δεν απαντά, δοκίμασε το site ή ρώτα στη μονάδα. Άλλαξε χώρα από πάνω για τον άλλο κατάλογο.</p>
      {catalogue.groups.map((group) => (
        <section key={group.id} className="help-group">
          <h2>{group.title}</h2>
          <ul className="help-list">
            {group.items.map((item) => (
              <li key={`${group.id}-${item.name}`}>
                <div>
                  <strong>{item.name}</strong>
                  {item.note && <p>{item.note}</p>}
                  {item.hours && <span className="help-hours">{item.hours}</span>}
                </div>
                <div className="help-actions">
                  {item.phone && (
                    <a className="btn solid tiny" href={`tel:${item.phone}`}>
                      {item.display || item.phone}
                    </a>
                  )}
                  {item.href && (
                    <a className="btn ghost tiny" href={item.href} target="_blank" rel="noreferrer">
                      Site
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => go("#/ask")}>Ρώτα κάτι</button>
        <button type="button" className="btn ghost" onClick={() => go("#/sources")}>Πηγές</button>
      </div>
    </main>
  );
}

function Sources() {
  return (
    <main className="sheet">
      <p className="kicker">Πηγές</p>
      <h1>Από πού βγήκαν οι αριθμοί.</h1>
      <p className="lede">Τα διάβασα από τις επίσημες σελίδες και από την πρόσκληση της Δ΄ ΕΣΣΟ 2026. Όπου ένα ποσό έχει ανακοινωθεί στον Τύπο για τη μεταρρύθμιση, το λέω. Η μονάδα και το σημείωμά σου κερδίζουν πάντα.</p>
      <ul className="sources">
        {sources.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
            <span>{item.note}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function navKey(hash) {
  if (hash.startsWith("#/play")) return "play";
  if (hash.startsWith("#/ask")) return "ask";
  if (hash.startsWith("#/guide")) return "book";
  if (hash.startsWith("#/map") || hash.startsWith("#/list") || hash.startsWith("#/journey") || hash.startsWith("#/chapter") || hash.startsWith("#/quiz") || hash.startsWith("#/intro")) return "path";
  return "";
}

function BottomNav({ go, hash }) {
  const current = navKey(hash);
  const items = [
    ["#/map", "Διαδρομή", "path", "path"],
    ["#/play", "Παιχνίδια", "play", "cards"],
    ["#/ask", "Ρώτα", "ask", "chat"],
    ["#/guide", "Εγχειρίδιο", "book", "handbook"],
  ];
  return (
    <nav className="bottom" aria-label="Κύρια πλοήγηση">
      {items.map(([href, label, key, icon]) => (
        <button key={href} type="button" className={current === key ? "is-on" : ""} onClick={() => go(href)}>
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Foot({ go }) {
  return (
    <footer className="foot">
      <strong>START Θητεία</strong>
      <p>Οδηγός για τις πρώτες μέρες μέσα — Ελλάδα και Κύπρος. Λίγο προετοιμασία, κυρίως τι γίνεται τώρα.</p>
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => go("#/help")}>Βοήθεια</button>
        <button type="button" className="btn ghost" onClick={() => go("#/privacy")}>Απόρρητο</button>
        <button type="button" className="btn ghost" onClick={() => go("#/access")}>Προσβασιμότητα</button>
        <button type="button" className="btn ghost" onClick={() => go("#/program")}>Το πρόγραμμα</button>
        <button type="button" className="btn ghost" onClick={() => go("#/sources")}>Πηγές</button>
      </div>
      <p className="fine">Δεν είναι σελίδα του ΓΕΣ ή του ΓΕΕΦ. Το σημείωμα κατάταξης κερδίζει πάντα.</p>
    </footer>
  );
}

function Privacy() {
  return (
    <main className="sheet">
      <p className="kicker">Απόρρητο</p>
      <h1>Τίποτα από τη διαδρομή σου δεν φεύγει από το τηλέφωνο.</h1>
      <p>Χώρα, κεφάλαια, απαντήσεις κουίζ, σημειώσεις και η λίστα παραμονής γράφονται μόνο στο localStorage αυτού του browser. Δεν υπάρχει λογαριασμός και δεν στέλνεται ερώτηση σε διακομιστή.</p>
      <p>Αν σβήσεις τα δεδομένα του browser, η διαδρομή ξεκινά από την αρχή.</p>
    </main>
  );
}

function Access() {
  return (
    <main className="sheet">
      <p className="kicker">Προσβασιμότητα</p>
      <h1>Να διαβάζεται και όρθιος, με μία χείρα.</h1>
      <ul>
        <li>Μετάβαση στο περιεχόμενο, στην κορυφή κάθε σελίδας.</li>
        <li>Μεγαλύτερο κείμενο από το κουμπί Αα.</li>
        <li>Τα κουμπιά δεν βασίζονται μόνο στο χρώμα: το κλειδωμένο κεφάλαιο γράφει «Κλειδωμένο».</li>
      </ul>
    </main>
  );
}

function Program() {
  return (
    <main className="sheet">
      <p className="kicker">Το πρόγραμμα</p>
      <h1>Οδηγός για την ημέρα που παρουσιάζεσαι.</h1>
      <p>Ακολουθεί το καλούπι των οδηγών START: σύντομα κεφάλαια, κουίζ που ανοίγει το επόμενο, ερώτηση στον οδηγό, και εγχειρίδιο που τυπώνεται. Η ύλη είναι η κατάταξη σε Ελλάδα και Κύπρο, όχι η εκπαίδευση μάχης.</p>
      <h2>Τι χωρά στο κιτ των πρώτων ημερών</h2>
      <ul className="kit">
        {kit.map((item) => <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>)}
      </ul>
    </main>
  );
}
