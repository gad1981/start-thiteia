const KEY = "start-thiteia-v1";

export const emptyProfile = {
  country: "gr",
  onboarded: false,
  worries: [],
  aim: "",
  timing: "",
  support: "",
  xp: 0,
  quizzes: {},
  notes: {},
  checks: {},
  games: {},
  gamePrefs: {
    snake: { speed: "normal", board: "normal" },
    memory: { pairs: 8, peek: "normal" },
    react: { wait: "normal" },
    simon: { speed: "normal", start: 1 },
  },
  large: false,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...emptyProfile };
    const parsed = JSON.parse(raw);
    return {
      ...emptyProfile,
      ...parsed,
      gamePrefs: {
        ...emptyProfile.gamePrefs,
        ...(parsed.gamePrefs || {}),
        snake: { ...emptyProfile.gamePrefs.snake, ...(parsed.gamePrefs?.snake || {}) },
        memory: { ...emptyProfile.gamePrefs.memory, ...(parsed.gamePrefs?.memory || {}) },
        react: { ...emptyProfile.gamePrefs.react, ...(parsed.gamePrefs?.react || {}) },
        simon: { ...emptyProfile.gamePrefs.simon, ...(parsed.gamePrefs?.simon || {}) },
      },
    };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
