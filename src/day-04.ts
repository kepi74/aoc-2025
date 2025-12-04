import { readData } from './utils/read-data.ts'

type Cell = '.' | 'x' | '@'

function isCell(char: string): char is Cell {
  return char === '.' || char === 'x' || char === '@'
}

type Grid = Cell[][]

type Coordinate = [row: number, col: number]

const adjacentOffsets: Coordinate[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

type Some<T> = { __tag: 'Some'; value: T }
type None = { __tag: 'None' }
type Option<T> = Some<T> | None

function some<T>(value: T): Option<T> {
  return { __tag: 'Some', value }
}

function none<T>(): Option<T> {
  return { __tag: 'None' }
}

function isSome<T>(opt: Option<T>): opt is Some<T> {
  return opt.__tag === 'Some'
}

function getAdjancentCells({
  grid,
  adjacentOffsets,
  coordinate,
}: {
  grid: Grid
  adjacentOffsets: Coordinate[]
  coordinate: Coordinate
}): Option<Cell>[] {
  const [row, col] = coordinate

  return adjacentOffsets.map(([dRow, dCol]) => {
    const newRow = row + dRow
    const newCol = col + dCol

    const maybeCell = grid[newRow]?.[newCol]

    if (maybeCell === undefined) {
      return none()
    }

    return some(maybeCell)
  })
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('getAdjancentCells', () => {
    it.each([
      [
        [
          ['.', '.', '.'],
          ['@', '@', '@'],
          ['.', '.', '.'],
        ] satisfies Grid,
        [1, 1] satisfies Coordinate,
        [
          // top row
          some('.'),
          some('.'),
          some('.'),
          // middle row
          some('@'),
          some('@'),
          // bottom row
          some('.'),
          some('.'),
          some('.'),
        ] satisfies Array<Option<Cell>>,
      ],
      [
        [
          ['.', '.', '.'],
          ['@', '@', '@'],
          ['.', '.', '.'],
        ] satisfies Grid,
        [0, 0] satisfies Coordinate,
        [
          // top row
          none(),
          none(),
          none(),
          // middle row
          none(),
          some('.'),
          // bottom row
          none(),
          some('@'),
          some('@'),
        ] satisfies Array<Option<Cell>>,
      ],
    ])(
      'given a grid and a coordinate, returns the adjacent cells as Options',
      (grid, coordinate, expected) => {
        const result = getAdjancentCells({ grid, coordinate, adjacentOffsets })

        expect(result).toEqual(expected)
      },
    )
  })
}

/* ================================================================================= */
const data: Grid = readData({ day: 4, example: false })
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.split('').filter(isCell))

function part01(grid: Grid): void {
  const accessibleCellsCount = grid.reduce((accRow, row, rowIndex) => {
    const accCellsInRow = row.reduce((accCol, cell, colIndex) => {
      if (cell !== '@') {
        return accCol
      }
      const adjancentRolls = getAdjancentCells({
        grid,
        adjacentOffsets,
        coordinate: [rowIndex, colIndex],
      })
        .filter(isSome)
        .filter(({ value }) => value === '@').length

      if (adjancentRolls < 4) {
        return accCol + 1
      }

      return accCol
    }, 0)

    return accRow + accCellsInRow
  }, 0)

  console.log(`There are ${accessibleCellsCount} accessible rolls.`)
}

part01(data)
