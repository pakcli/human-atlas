import type { GuessEvaluation } from './types';

export function evaluateGuess(guess: string, target: string): GuessEvaluation {
  const cleanGuess = guess.toUpperCase().trim();
  const cleanTarget = target.toUpperCase().trim();

  const len = cleanTarget.length;
  const statuses: ('right' | 'wrong')[] = [];
  let rightCount = 0;

  for (let i = 0; i < len; i++) {
    const charGuess = cleanGuess[i];
    const charTarget = cleanTarget[i];
    if (charGuess === charTarget) {
      statuses.push('right');
      rightCount++;
    } else {
      statuses.push('wrong');
    }
  }

  const closenessPercent = Math.round((rightCount / len) * 100);

  // Meter classification (Section 5.2)
  let sdmMeterLabel = 'SDM revisi';
  if (closenessPercent === 100) {
    sdmMeterLabel = 'SDM mengerikan';
  } else if (closenessPercent >= 25) {
    sdmMeterLabel = 'SDM tinggi';
  }

  // Friendly "Santai" message (Section 5.6 & 16.1)
  let message = 'Coba lagi, yuk!';
  if (closenessPercent === 100) {
    message = 'Mantap, benar!';
  } else if (closenessPercent >= 25) {
    message = `Hampir lagi! ${rightCount} dari ${len} huruf tepat.`;
  } else {
    message = rightCount > 0 ? `Bagus, ${rightCount} huruf sudah pas!` : 'Coba lagi, yuk!';
  }

  return {
    guess: cleanGuess,
    statuses,
    rightCount,
    closenessPercent,
    sdmMeterLabel,
    message,
  };
}

// Score computation for Tebak Ketik (Section 5.3 & 16.1)
export function computeFinalScore(wrongGuesses: number, lettersRevealed: number): number {
  const penaltyWrong = wrongGuesses * 1;
  const penaltyReveal = lettersRevealed * 2;
  const rawScore = 10 - penaltyWrong - penaltyReveal;
  return Math.max(1, rawScore);
}
