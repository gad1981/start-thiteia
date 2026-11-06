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
  large: false,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...emptyProfile };
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
