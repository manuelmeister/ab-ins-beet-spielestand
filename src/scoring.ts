export interface Player {
  id: string;
  name: string;
  color: string;
}

export type BeetColor = "magenta" | "blue" | "yellow";

export interface BeetScoreInput {
  colors?: 1 | 2 | 3;
  colorSlots?: BeetColor[];
  wholeSalads: number;
  hasHalfSalads: boolean;
  tomatoes: number;
  peppers: number;
}

export interface RoundScore {
  beets: BeetScoreInput[];
  animalCardsFulfilled: number;
}

export interface Game {
  players: Player[];
  currentRound: 1 | 2 | 3;
  rounds: Record<string, RoundScore[]>;
  finished: boolean;
}

export interface PlayerRoundTotal {
  playerId: string;
  beetPoints: number;
  bonusPoints: number;
  animalPoints: number;
  total: number;
}

export const ROUND_COUNT = 3;
export const BEETS_PER_ROUND = 3;

export const emptyBeet = (): BeetScoreInput => ({
  colors: 3,
  colorSlots: [],
  wholeSalads: 0,
  hasHalfSalads: false,
  tomatoes: 0,
  peppers: 0,
});

export const emptyRoundScore = (): RoundScore => ({
  beets: Array.from({ length: BEETS_PER_ROUND }, emptyBeet),
  animalCardsFulfilled: 0,
});

export const scoreBeet = (beet: BeetScoreInput): number => {
  const colorCount = countBeetColors(beet);
  const colorPoints = colorCount === 1 ? 3 : colorCount === 2 ? 1 : 0;
  const saladPoints = Math.max(0, beet.wholeSalads);
  const cleanSaladPoint = beet.hasHalfSalads ? 0 : 1;
  const pairPoints = Math.min(
    Math.max(0, beet.tomatoes),
    Math.max(0, beet.peppers),
  );

  return colorPoints + saladPoints + cleanSaladPoint + pairPoints;
};

export const countBeetColors = (beet: BeetScoreInput): 1 | 2 | 3 => {
  const validColors = new Set<BeetColor>(["magenta", "blue", "yellow"]);
  const count = new Set(
    (beet.colorSlots ?? []).filter((color): color is BeetColor =>
      validColors.has(color as BeetColor),
    ),
  ).size;

  if (count === 1 || count === 2 || count === 3) {
    return count;
  }

  return beet.colors === 1 || beet.colors === 2 || beet.colors === 3
    ? beet.colors
    : 3;
};

export const scoreRoundBeets = (round: RoundScore): number =>
  round.beets.reduce((sum, beet) => sum + scoreBeet(beet), 0);

export const calculateBonusPoints = (beetTotals: number[]): number[] => {
  if (beetTotals.length === 0) {
    return [];
  }

  const highest = Math.max(...beetTotals);
  const lowest = Math.min(...beetTotals);

  return beetTotals.map((total) => {
    if (total === highest) {
      return 10;
    }

    if (total === lowest) {
      return 0;
    }

    return 5;
  });
};

export const calculateRoundTotals = (
  players: Player[],
  roundScores: RoundScore[],
): PlayerRoundTotal[] => {
  const beetTotals = roundScores.map(scoreRoundBeets);
  const bonusPoints = calculateBonusPoints(beetTotals);

  return players.map((player, index) => {
    const animalPoints =
      Math.max(0, roundScores[index]?.animalCardsFulfilled ?? 0) * 5;
    const beetPoints = beetTotals[index] ?? 0;
    const bonus = bonusPoints[index] ?? 0;

    return {
      playerId: player.id,
      beetPoints,
      bonusPoints: bonus,
      animalPoints,
      total: beetPoints + bonus + animalPoints,
    };
  });
};

export const calculateGameTotals = (game: Game): Record<string, number> =>
  Object.fromEntries(
    game.players.map((player) => {
      const total = game.rounds[player.id]
        .slice(0, game.currentRound)
        .reduce((sum, round, index) => {
          const roundScores = game.players.map(
            (candidate) => game.rounds[candidate.id][index],
          );
          const roundTotal = calculateRoundTotals(
            game.players,
            roundScores,
          ).find((entry) => entry.playerId === player.id);

          return sum + (roundTotal?.total ?? 0);
        }, 0);

      return [player.id, total];
    }),
  );

export function playerColor(id: string){
  const h = [...id].reduce(
    (hue, char) => (hue * 31 + 6 + char.charCodeAt(0)) % 360,
    0,
  );

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(
      255 * (0.3 - 0.3 * Math.max(-1, Math.min(k - 3, 9 - k, 1))),
    );
  };

  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

export const createGame = (names: string[]): Game => {
  const players = names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${index}`,
      name,
      // random stable color
      color: playerColor(name),
    }));

  return {
    finished: false,
    players,
    currentRound: 1,
    rounds: Object.fromEntries(
      players.map((player) => [
        player.id,
        Array.from({ length: ROUND_COUNT }, emptyRoundScore),
      ]),
    ),
  };
};

export const clampInteger = (
  value: number,
  min: number,
  max: number,
): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.trunc(value)));
};
