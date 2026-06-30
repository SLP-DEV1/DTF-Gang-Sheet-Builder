const AUTOSAVE_KEY = 'dtf-gang-sheet-autosave-v1';

export function saveAutosave(project) {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), project }));
}

export function loadAutosave() {
  const value = localStorage.getItem(AUTOSAVE_KEY);
  if (!value) return null;
  return JSON.parse(value);
}

export function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}
