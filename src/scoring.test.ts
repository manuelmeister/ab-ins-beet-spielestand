import { describe, expect, it } from 'vitest'

import { calculateBonusPoints, calculateGameTotals, emptyBeet, emptyRoundScore, scoreBeet } from './scoring'

describe('scoreBeet', () => {
  it('defaults to no half salads', () => {
    expect(emptyBeet().hasHalfSalads).toBe(false)
  })

  it('scores color points for one, two and three colors', () => {
    expect(scoreBeet({ colors: 1, wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(3)
    expect(scoreBeet({ colors: 2, wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(1)
    expect(scoreBeet({ colors: 3, wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(0)
  })

  it('scores color points from selected magenta, blue and yellow buttons', () => {
    expect(scoreBeet({ colorSlots: ['magenta'], wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(3)
    expect(scoreBeet({ colorSlots: ['magenta', 'blue'], wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(1)
    expect(scoreBeet({ colorSlots: ['magenta', 'blue', 'yellow'], wholeSalads: 0, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(0)
  })

  it('adds whole salad points', () => {
    expect(scoreBeet({ colors: 3, wholeSalads: 2, hasHalfSalads: true, tomatoes: 0, peppers: 0 })).toBe(2)
  })

  it('adds one point when there are no half salads', () => {
    expect(scoreBeet({ colors: 3, wholeSalads: 0, hasHalfSalads: false, tomatoes: 0, peppers: 0 })).toBe(1)
  })

  it('adds one point for each tomato and pepper pair', () => {
    expect(scoreBeet({ colors: 3, wholeSalads: 0, hasHalfSalads: true, tomatoes: 3, peppers: 2 })).toBe(2)
  })
})

describe('calculateBonusPoints', () => {
  it('scores a unique highest and lowest player', () => {
    expect(calculateBonusPoints([7, 12, 4, 8])).toEqual([5, 10, 0, 5])
  })

  it('scores all players tied for highest', () => {
    expect(calculateBonusPoints([10, 10, 5])).toEqual([10, 10, 0])
  })

  it('scores all players tied for lowest', () => {
    expect(calculateBonusPoints([9, 4, 4])).toEqual([10, 0, 0])
  })

  it('scores all equal players as highest by rule priority', () => {
    expect(calculateBonusPoints([6, 6, 6])).toEqual([10, 10, 10])
  })
})

describe('calculateGameTotals', () => {
  it('only includes rounds up to the current round', () => {
    const game = {
      players: [
        { id: 'p1', name: 'Mina', color: '#000' },
        { id: 'p2', name: 'Tom', color: '#000' },
      ],
      currentRound: 1 as const,
      finished: false,
      rounds: {
        p1: [emptyRoundScore(), emptyRoundScore(), emptyRoundScore()],
        p2: [emptyRoundScore(), emptyRoundScore(), emptyRoundScore()],
      },
    }

    game.rounds.p1[1].animalCardsFulfilled = 3

    expect(calculateGameTotals(game).p1).toBe(13)
  })
})
