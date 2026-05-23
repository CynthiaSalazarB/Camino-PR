import { AppState, defaultProfile, defaultCompletionStatus } from '@/types/profile';

const STORAGE_KEY = 'latam-navigator';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch { return null; }
}

export function saveState(state: AppState): void {
  state.savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultState(): AppState {
  return {
    userProfile: { ...defaultProfile },
    completionStatus: { ...defaultCompletionStatus },
    generatedPlan: [],
    savedAt: null,
  };
}

export function hasSavedState(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
