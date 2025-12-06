import { readData } from './utils/read-data.ts'

interface IngredientID {
  __tag: 'IngredientID'
  id: number
}

interface IngredientIDRange {
  __tag: 'IngredientIDRange'
  start: number
  end: number
}

interface None {
  __tag: 'None'
}

function parseLine(line: string): IngredientID | IngredientIDRange | None {
  if (line.includes('-')) {
    const [start, end] = line.split('-').map((value) => parseInt(value, 10))
    if (start === undefined || end === undefined) {
      return { __tag: 'None' }
    }
    if (isNaN(start) || isNaN(end)) {
      return { __tag: 'None' }
    }
    return { __tag: 'IngredientIDRange', start, end }
  }
  const id = parseInt(line, 10)
  if (isNaN(id)) {
    return { __tag: 'None' }
  }

  return { __tag: 'IngredientID', id }
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('parseLine', () => {
    it('parses single ingredient IDs', () => {
      expect(parseLine('42')).toEqual({ __tag: 'IngredientID', id: 42 })
    })
    it('parses ingredient ID ranges', () => {
      expect(parseLine('10-20')).toEqual({
        __tag: 'IngredientIDRange',
        start: 10,
        end: 20,
      })
    })
    it('returns None for invalid single IDs', () => {
      expect(parseLine('abc')).toEqual({ __tag: 'None' })
      expect(parseLine('')).toEqual({ __tag: 'None' })
    })
  })
}

function isOverlapping(
  range1: IngredientIDRange,
  range2: IngredientIDRange,
): boolean {
  return (
    (range1.start <= range2.end && range2.start <= range1.end) ||
    (range2.start <= range1.end && range1.start <= range2.end)
  )
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  const overlappingRanges: Array<[IngredientIDRange, IngredientIDRange]> = [
    [
      { __tag: 'IngredientIDRange', start: 5, end: 15 },
      { __tag: 'IngredientIDRange', start: 10, end: 20 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 10, end: 20 },
      { __tag: 'IngredientIDRange', start: 5, end: 15 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 10, end: 20 },
      { __tag: 'IngredientIDRange', start: 20, end: 25 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 20, end: 25 },
      { __tag: 'IngredientIDRange', start: 10, end: 20 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 10, end: 25 },
      { __tag: 'IngredientIDRange', start: 15, end: 20 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 15, end: 20 },
      { __tag: 'IngredientIDRange', start: 10, end: 25 },
    ],
  ]

  const nonOverlappingRanges: Array<[IngredientIDRange, IngredientIDRange]> = [
    [
      { __tag: 'IngredientIDRange', start: 5, end: 10 },
      { __tag: 'IngredientIDRange', start: 11, end: 15 },
    ],
    [
      { __tag: 'IngredientIDRange', start: 11, end: 15 },
      { __tag: 'IngredientIDRange', start: 5, end: 10 },
    ],
  ]

  describe('isOverlapping', () => {
    it.each(overlappingRanges)(
      'should return true for overlapping ranges %o and %o',
      (range1, range2) => {
        expect(isOverlapping(range1, range2)).toBe(true)
      },
    )
    it.each(nonOverlappingRanges)(
      'should return false for non-overlapping ranges %o and %o',
      (range1, range2) => {
        expect(isOverlapping(range1, range2)).toBe(false)
      },
    )
  })
}

function mergeRanges(ranges: IngredientIDRange[]): IngredientIDRange {
  if (ranges.length === 0) {
    throw new Error('No ranges to merge')
  }

  const start = Math.min(...ranges.map((range) => range.start))
  const end = Math.max(...ranges.map((range) => range.end))

  return { __tag: 'IngredientIDRange', start, end }
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('mergeRanges', () => {
    it('merges multiple overlapping ranges into one', () => {
      const ranges: IngredientIDRange[] = [
        { __tag: 'IngredientIDRange', start: 5, end: 15 },
        { __tag: 'IngredientIDRange', start: 15, end: 20 },
        { __tag: 'IngredientIDRange', start: 18, end: 25 },
      ]
      const merged = mergeRanges(ranges)
      expect(merged).toEqual({ __tag: 'IngredientIDRange', start: 5, end: 25 })
    })
  })
}

/* ================================================================================= */
interface IngredientData {
  ingredientIDs: IngredientID[]
  ingredientIDRanges: IngredientIDRange[]
}

const data = readData({ day: 5, example: false })
  .map(parseLine)
  .filter((item) => item.__tag !== 'None')
  .reduce<IngredientData>(
    (acc, item) => {
      if (item.__tag === 'IngredientID') {
        acc.ingredientIDs.push(item)
      }
      if (item.__tag === 'IngredientIDRange') {
        acc.ingredientIDRanges.push(item)
      }

      return acc
    },
    { ingredientIDs: [], ingredientIDRanges: [] },
  )

function countFreshIngredients({
  ingredientIDs,
  ingredientIDRanges,
}: IngredientData) {
  const freshIngredientIDs = ingredientIDs.filter(({ id }) => {
    return ingredientIDRanges.some(({ start, end }) => id >= start && id <= end)
  })
  console.log(`There are ${freshIngredientIDs.length} fresh ingredients.`)
}

countFreshIngredients(data)

function part2(data: IngredientData) {
  const mergedRanges = data.ingredientIDRanges.reduce<IngredientIDRange[]>(
    (acc, curr) => {
      if (!acc.some((range) => isOverlapping(range, curr))) {
        acc.push(curr)

        return acc
      }

      const overlappingRanges = acc.filter((range) =>
        isOverlapping(range, curr),
      )
      const mergedRange = mergeRanges([...overlappingRanges, curr])

      const nonOverlappingRanges = acc.filter(
        (range) => !isOverlapping(range, curr),
      )
      return [...nonOverlappingRanges, mergedRange]
    },
    [],
  )

  const ingredientIDsCount = mergedRanges.reduce((acc, { start, end }) => {
    return acc + (end - start + 1)
  }, 0)

  console.log(`There are ${ingredientIDsCount} fresh ingredients in total.`)
}

part2(data)
