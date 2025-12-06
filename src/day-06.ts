import { readData } from './utils/read-data.ts'

function multiplyAll(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc * num, 1)
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('multiplyAll', () => {
    it.each([
      [[123, 45, 6], 33210],
      [[51, 387, 215], 4243455],
    ])('multiplies all numbers [%s] to get %s', (numbers, expected) => {
      expect(multiplyAll(numbers)).toBe(expected)
    })
  })
}

function addAll(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('addAll', () => {
    it.each([
      [[328, 64, 98], 490],
      [[64, 23, 314], 401],
    ])('adds all numbers [%s] to get %s', (numbers, expected) => {
      expect(addAll(numbers)).toBe(expected)
    })
  })
}

function rotateRawInputs(rawInputs: string[]): string[] {
  const maxLength = Math.max(...rawInputs.map((line) => line.length))
  const rotated: string[] = []

  for (let col = 0; col < maxLength; col++) {
    const newLine = rawInputs.map((line) => line[col] || ' ').join('')
    rotated.push(newLine)
  }

  return rotated
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('rotateRawInputs', () => {
    const testInputs = ['123 328  51 64 ', ' 45 64  387 23 ', '  6 98  215 314']

    it('rotates raw inputs correctly', () => {
      const rotated = rotateRawInputs(testInputs)

      expect(rotated).toEqual([
        '1  ',
        '24 ',
        '356',
        '   ',
        '369',
        '248',
        '8  ',
        '   ',
        ' 32',
        '581',
        '175',
        '   ',
        '623',
        '431',
        '  4',
      ])
    })
  })
}

function parseRotatedInputs(rotatedInputs: string[]): number[][] {
  const groups = rotatedInputs.reduce<
    [currGroup: string[], result: string[][]]
  >(
    ([currGroup, result], line) => {
      if (line.trim() !== '') {
        currGroup.push(line)
        return [currGroup, result]
      } else {
        result.push(currGroup)
        return [[], result]
      }
    },
    [[], []],
  )

  const result = [...groups[1], groups[0]].map((group) =>
    group.map((entry) => parseInt(entry.trim(), 10)),
  )

  return result
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('parseRotatedInputs', () => {
    const input = [
      '1  ',
      '24 ',
      '356',
      '   ',
      '369',
      '248',
      '8  ',
      '   ',
      ' 32',
      '581',
      '175',
      '   ',
      '623',
      '431',
      '  4',
    ]

    it('parses rotated inputs correctly', () => {
      const parsed = parseRotatedInputs(input)

      expect(parsed).toEqual([
        [1, 24, 356],
        [369, 248, 8],
        [32, 581, 175],
        [623, 431, 4],
      ])
    })
  })
}

/* ================================================================================= */

const data = readData({ day: 6, example: false }).filter((line) => line !== '')

type Inputs = number[][]

const inputs: Inputs | undefined = data
  .map((line) =>
    line
      .split(' ')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== ''),
  )
  .filter((line) =>
    line.every((entry) => {
      const num = parseInt(entry, 10)

      return !isNaN(num) && num >= 0
    }),
  )
  .map((line) => line.map((entry) => parseInt(entry, 10)))

if (!inputs) {
  throw new Error('No inputs provided!')
}

type Operations = Array<'+' | '*'>

const operations: Operations | undefined = data
  .map((line) =>
    line
      .split(' ')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== ''),
  )
  .filter((line) => line.every((entry) => entry === '+' || entry === '*'))[0]

if (!operations) {
  throw new Error('No operations provided!')
}

function calculateGrandTotal({
  inputs,
  operations,
}: {
  inputs: Inputs
  operations: Operations
}): void {
  const result = operations.reduce<number>((acc, operation, index) => {
    const numbers = inputs.map((row) => {
      const num = row[index]
      if (num === undefined) {
        throw new Error('Mismatched input lengths!')
      }

      return num
    })

    if (operation === '+') {
      return acc + addAll(numbers)
    }

    if (operation === '*') {
      return acc + multiplyAll(numbers)
    }

    return acc
  }, 0)

  console.log('Grand total:', result)
}

calculateGrandTotal({ inputs, operations })

function calculatedCaphalopodVersion(
  data: string[],
  operations: Operations,
): void {
  const rawInputs = data.filter(
    (line) =>
      !line
        .split('')
        .every((char) => char === '+' || char === '*' || char === ' '),
  )

  const inputs = parseRotatedInputs(rotateRawInputs(rawInputs))

  const result = operations.reduce<number>((acc, operation, index) => {
    const numbers = inputs[index]
    if (!numbers) {
      throw new Error('Mismatched input lengths!')
    }

    if (operation === '+') {
      return acc + addAll(numbers)
    }

    if (operation === '*') {
      return acc + multiplyAll(numbers)
    }

    return acc
  }, 0)

  console.log('Caphalopod version grand total:', result)
}

calculatedCaphalopodVersion(data, operations)
