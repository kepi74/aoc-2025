import { readData } from './utils/read-data.ts'

type Distance = number & { __brand: 'Distance' }

function Distance(value: number): Distance {
  return value as Distance
}

type Position = number & { __brand: 'Position' }

function Position(value: number): Position {
  return value as Position
}

interface Day01Record {
  direction: 'L' | 'R'
  distance: Distance
}

function parseLine(line: string): Day01Record {
  const direction = line[0]
  const value = parseInt(line.slice(1), 10)

  if (direction !== 'R' && direction !== 'L') {
    throw new Error(`Unknown direction: ${direction} (input: >${line}<)`)
  }

  if (isNaN(value)) {
    throw new Error(`Invalid value: ${line.slice(1)} (input: >${line}<)`)
  }

  return { direction, distance: Distance(value) }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('parseLine', () => {
    it('parses a valid line with R direction', () => {
      const result = parseLine('R10')
      expect(result).toEqual({ direction: 'R', distance: 10 })
    })

    it('parses a valid line with L direction', () => {
      const result = parseLine('L5')
      expect(result).toEqual({ direction: 'L', distance: 5 })
    })

    it('throws an error for an invalid direction', () => {
      expect(() => parseLine('X10')).toThrowError(
        'Unknown direction: X (input: >X10<)',
      )
    })

    it('throws an error for an invalid value', () => {
      expect(() => parseLine('RXX')).toThrowError(
        'Invalid value: XX (input: >RXX<)',
      )
    })
  })
}

function sanitizePosition(countOfPositions: number) {
  return function (position: Position): Position {
    if (position < 0) {
      return Position(countOfPositions + position)
    } else if (position > countOfPositions - 1) {
      return Position(position - countOfPositions)
    }

    return position
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('sanitizePosition', () => {
    const positionsCount = 100
    const sanitizer = sanitizePosition(positionsCount)

    const positionsInRange = [...new Array(positionsCount).keys()].map(Position)

    it.each(positionsInRange)(
      `returns the same position for positions in range 0..${positionsCount}. Tested with %s`,
      (position) => {
        const result = sanitizer(Position(position))
        expect(result).toBe(Position(position))
      },
    )

    it.each([
      [Position(-1), Position(99)],
      [Position(-2), Position(98)],
      [Position(-10), Position(90)],
    ])(`sanitizes negative position %s to %s`, (input, expected) => {
      const result = sanitizer(input)
      expect(result).toBe(expected)
    })

    it.each([
      [Position(100), Position(0)],
      [Position(101), Position(1)],
      [Position(110), Position(10)],
    ])(`sanitizes overflow position %s to %s`, (input, expected) => {
      const result = sanitizer(input)
      expect(result).toBe(expected)
    })
  })
}

interface CalculateZeroCrossingsArguments extends Day01Record {
  currentPosition: Position
}

function calculateZeroCrossings(positionsCount: number) {
  return function ({
    direction,
    distance,
    currentPosition,
  }: CalculateZeroCrossingsArguments): number {
    const correction =
      direction === 'R' ? positionsCount - currentPosition : currentPosition
    const adjustedDistance = distance + Distance(correction)

    const crossZero = Math.floor(adjustedDistance / positionsCount)

    return crossZero
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('calculateZeroCrossings', () => {
    const positionsCount = 100
    const calculator = calculateZeroCrossings(positionsCount)

    it('return 3 when the zero is crossed three times with `R` direction', () => {
      const result = calculator({
        direction: 'R',
        distance: Distance(3 * positionsCount + 10),
        currentPosition: Position(50),
      })

      expect(result).toBe(3)
    })

    it('return 4 when the zero is crossed three times with `R` direction', () => {
      const result = calculator({
        direction: 'R',
        distance: Distance(3 * positionsCount + 70),
        currentPosition: Position(50),
      })

      expect(result).toBe(4)
    })

    it('return 3 when the zero is crossed three times with `L` direction', () => {
      const result = calculator({
        direction: 'L',
        distance: Distance(3 * positionsCount + 10),
        currentPosition: Position(50),
      })

      expect(result).toBe(3)
    })

    it('return 4 when the zero is crossed three times with `L` direction', () => {
      const result = calculator({
        direction: 'L',
        distance: Distance(3 * positionsCount + 70),
        currentPosition: Position(50),
      })

      expect(result).toBe(4)
    })
  })
}

/* ================================================================================= */

const data = readData({ day: 1, example: false }).filter(Boolean).map(parseLine)

const START_POSITION = Position(50)
const POSITIONS_COUNT = 100

function part1(data: Array<Day01Record>): void {
  const sanitize = sanitizePosition(POSITIONS_COUNT)

  const result = data.reduce<{ position: Position; data: Array<Position> }>(
    (acc, { direction, distance }) => {
      const realMove = distance % POSITIONS_COUNT
      const potentialPosition = Position(
        direction === 'R' ? acc.position + realMove : acc.position - realMove,
      )
      const newPosition = sanitize(potentialPosition)

      return { position: newPosition, data: [...acc.data, newPosition] }
    },
    {
      position: START_POSITION,
      data: [],
    },
  )

  console.log(
    'The current password is:',
    result.data.filter((pos) => pos === 0).length,
  )
}

function part2(data: Array<Day01Record>): void {
  const sanitize = sanitizePosition(POSITIONS_COUNT)
  const zeroCrossingsCalculator = calculateZeroCrossings(POSITIONS_COUNT)

  const result = data.reduce<{
    position: Position
    data: Array<Position>
    roundTrips: number
  }>(
    (acc, { direction, distance }) => {
      const realMove = distance % POSITIONS_COUNT
      const potentialPosition = Position(
        direction === 'R' ? acc.position + realMove : acc.position - realMove,
      )
      const newPosition = sanitize(potentialPosition)

      const roundTrips = zeroCrossingsCalculator({
        direction,
        distance,
        currentPosition: acc.position,
      })

      const roundTripsAdjusted =
        roundTrips > 0 && newPosition === Position(0)
          ? roundTrips - 1
          : roundTrips

      return {
        position: newPosition,
        data: [...acc.data, newPosition],
        roundTrips: acc.roundTrips + roundTripsAdjusted,
      }
    },
    {
      position: START_POSITION,
      data: [],
      roundTrips: 0,
    },
  )

  console.log(
    'The adjusted password is:',
    result.data.filter((pos) => pos === 0).length + result.roundTrips,
  )
}

/* ================================================================================= */

part1(data)
part2(data)
