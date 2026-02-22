export type Grade = 1 | 2 | 3 | 4 | 5;

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

export function sm2(state: SM2State, grade: Grade): SM2State {
  let { easeFactor, interval, repetitions } = state;

  if (grade >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview: nextReview.toISOString().split("T")[0],
  };
}
