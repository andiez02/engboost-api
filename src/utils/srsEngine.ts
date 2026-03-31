export interface SRSInput {
  repetition: number;
  interval: number;
  ease_factor: number;
}

export interface SRSOutput {
  repetition: number;
  interval: number;
  ease_factor: number;
  next_review_at: Date;
  last_reviewed_at: Date;
}

export function updateSpacedRepetition(card: SRSInput, rating: 0 | 1 | 2 | 3): SRSOutput {
  if (rating !== 0 && rating !== 1 && rating !== 2 && rating !== 3) {
    throw new Error("Invalid rating: must be 0, 1, 2, or 3");
  }

  let { repetition, interval, ease_factor } = card;

  // Compute new interval
  let newInterval: number;
  if (rating === 0) {
    newInterval = 1;
  } else if (rating === 1) {
    if (repetition === 0) {
      newInterval = 1;
    } else {
      newInterval = Math.max(1, Math.round(interval * 1.2));
    }
  } else if (rating === 2) {
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * ease_factor);
    }
  } else {
    // rating === 3
    if (repetition === 0) {
      newInterval = 4;
    } else {
      newInterval = Math.round(interval * ease_factor * 1.3);
    }
  }

  // Compute new repetition
  const newRepetition = rating === 0 ? 0 : repetition + 1;

  // Compute new ease_factor
  const newEaseFactor = Math.max(
    1.3,
    ease_factor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
  );

  // Compute timestamps
  const last_reviewed_at = new Date();
  const next_review_at = new Date(last_reviewed_at.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    repetition: newRepetition,
    interval: newInterval,
    ease_factor: newEaseFactor,
    next_review_at,
    last_reviewed_at,
  };
}

export const LEARNING_STEPS = [
  1 * 60 * 1000,        // 1 minute  (step 0)
  10 * 60 * 1000,       // 10 minutes (step 1)
  24 * 60 * 60 * 1000,  // 1 day     (step 2 — final)
];

export interface LearningCardState {
  is_learning: boolean;
  learning_step: number;
  repetition: number;
  interval: number;
  ease_factor: number;
}

export interface LearningCardOutput extends LearningCardState {
  next_review_at: Date;
  last_reviewed_at: Date;
}

export function processLearningStep(
  card: LearningCardState,
  rating: 0 | 1 | 2 | 3
): LearningCardOutput {
  if (rating !== 0 && rating !== 1 && rating !== 2 && rating !== 3) {
    throw new Error("Invalid rating: must be 0, 1, 2, or 3");
  }

  const now = new Date();
  const { repetition, interval, ease_factor } = card;

  // Clamp learning_step defensively
  const clampedStep = Math.min(card.learning_step, LEARNING_STEPS.length - 1);
  const isFinalStep = clampedStep === LEARNING_STEPS.length - 1;

  if (card.is_learning) {
    // --- Learning phase ---
    if (rating === 0) {
      // AGAIN: reset to step 0
      return {
        is_learning: true,
        learning_step: 0,
        repetition,
        interval,
        ease_factor,
        next_review_at: new Date(now.getTime() + LEARNING_STEPS[0]),
        last_reviewed_at: now,
      };
    } else if (rating === 1) {
      // HARD: stay on current step
      return {
        is_learning: true,
        learning_step: clampedStep,
        repetition,
        interval,
        ease_factor,
        next_review_at: new Date(now.getTime() + LEARNING_STEPS[clampedStep]),
        last_reviewed_at: now,
      };
    } else if (rating === 2) {
      if (!isFinalStep) {
        // GOOD on non-final step: advance step
        const newStep = clampedStep + 1;
        return {
          is_learning: true,
          learning_step: newStep,
          repetition,
          interval,
          ease_factor,
          next_review_at: new Date(now.getTime() + LEARNING_STEPS[newStep]),
          last_reviewed_at: now,
        };
      } else {
        // GOOD on final step: graduate
        return {
          is_learning: false,
          learning_step: 0,
          repetition: 1,
          interval: 1,
          ease_factor: 2.5,
          next_review_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          last_reviewed_at: now,
        };
      }
    } else {
      // EASY: graduate immediately with 4-day interval
      return {
        is_learning: false,
        learning_step: 0,
        repetition: 1,
        interval: 4,
        ease_factor: 2.5,
        next_review_at: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        last_reviewed_at: now,
      };
    }
  } else {
    // --- SM-2 phase ---
    if (rating === 0) {
      // AGAIN: enter relearning, preserve SM-2 fields
      return {
        is_learning: true,
        learning_step: 0,
        repetition,
        interval,
        ease_factor,
        next_review_at: new Date(now.getTime() + LEARNING_STEPS[0]),
        last_reviewed_at: now,
      };
    } else {
      // HARD/GOOD/EASY: delegate to SM-2
      const sm2Result = updateSpacedRepetition({ repetition, interval, ease_factor }, rating);
      return {
        is_learning: false,
        learning_step: 0,
        ...sm2Result,
      };
    }
  }
}
