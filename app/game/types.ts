export type GameLevel = 'TK' | 'SD';
export type GameMode = 'connect' | 'typing';
export type GameScreen = 'menu' | 'connect' | 'typing' | 'about' | 'settings';

export interface WordItem {
  id: string;
  word: string;
  clue: string;
  explanation: string;
  category: string;
  level: GameLevel;
  group?: string;
  atlasTarget?: string; // Concept or part name in 3D atlas (e.g. 'heart', 'brain', 'stomach', etc.)
}

export interface GuessEvaluation {
  guess: string;
  statuses: ('right' | 'wrong')[]; // MVP: 2 states: right (green), wrong (ice)
  rightCount: number;
  closenessPercent: number;
  sdmMeterLabel: string;
  message: string;
}

export interface GameSettings {
  sound: boolean;
  vibration: boolean;
  theme: 'light' | 'dark';
  largeText: boolean;
  colorBlindMarkers: boolean;
  readAloud: boolean;
  autoClearOnWrong: boolean;
}

export interface GameStats {
  roundsPlayed: number;
  wordsWon: number;
  totalScore: number;
  history: {
    word: string;
    level: GameLevel;
    mode: GameMode;
    score: number;
    timestamp: number;
  }[];
}
