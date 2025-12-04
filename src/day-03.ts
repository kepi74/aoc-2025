import { readData } from './utils/read-data.ts'

type BatteryCapacity = number & { __brand: 'BatteryCapacity' }

function BatteryCapacity(value: number): BatteryCapacity {
  return value as BatteryCapacity
}

type BatteryBank = Array<BatteryCapacity>

type Joltage = number & { __brand: 'Joltage' }

function Joltage(value: number): Joltage {
  return value as Joltage
}

type Some<T> = { __tag: 'Some'; value: T }
type None = { __tag: 'None' }
type Option<T> = Some<T> | None

function Some<T>(value: T): Option<T> {
  return { __tag: 'Some', value }
}

function None<T>(): Option<T> {
  return { __tag: 'None' }
}

function isSome<T>(option: Option<T>): option is Some<T> {
  return option.__tag === 'Some'
}

function lineToBatteryBank(line: string): BatteryBank {
  return line.split('').map((d) => BatteryCapacity(Number(d)))
}

function getLargestJoltage(batteryBank: BatteryBank): Joltage {
  const maxJoltage = [9, 8, 7, 6, 5, 4, 3, 2, 1].reduce<Option<Joltage>>(
    (acc, curr) => {
      if (isSome(acc)) {
        return acc
      }

      const startBattery = batteryBank.find(
        (battery) => battery === BatteryCapacity(curr),
      )

      if (startBattery === undefined) {
        return acc
      }

      const startBatteryIndex = batteryBank.indexOf(startBattery)
      const remainingBatteries = batteryBank.slice(startBatteryIndex + 1)

      if (remainingBatteries.length === 0) {
        return acc
      }

      const maxRemainingBattery = Math.max(...remainingBatteries)

      return Some(Joltage(startBattery * 10 + maxRemainingBattery))
    },
    None<Joltage>(),
  )

  if (isSome(maxJoltage)) {
    return maxJoltage.value
  }

  throw new Error('No valid joltage could be calculated')
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('getLargestJoltage', () => {
    it('return Joltage in an allowed range 11-99 jolts', () => {
      const randomBatteryBank: BatteryBank = Array.from({ length: 10 }, () =>
        BatteryCapacity(Math.floor(Math.random() * 9) + 1),
      )
      const joltage = getLargestJoltage(randomBatteryBank)

      expect(joltage).toBeGreaterThanOrEqual(Joltage(11))
      expect(joltage).toBeLessThanOrEqual(Joltage(99))
    })

    it.each([
      [lineToBatteryBank('987654321111111'), Joltage(98)],
      [lineToBatteryBank('811111111111119'), Joltage(89)],
      [lineToBatteryBank('234234234234278'), Joltage(78)],
      [lineToBatteryBank('818181911112111'), Joltage(92)],
    ])(
      `calculates the correct Joltage for battery bank %s`,
      (batteryBank, expectedJoltage) => {
        const joltage = getLargestJoltage(batteryBank)
        expect(joltage).toEqual(expectedJoltage)
      },
    )
  })
}

function findFirstLowerCapacityBattery(
  batteryBank: BatteryBank,
): Option<number> {
  return batteryBank.reduce<Option<number>>((acc, currentBattery, index) => {
    if (isSome(acc)) {
      return acc
    }

    const nextBattery = batteryBank[index + 1]
    if (nextBattery === undefined) {
      return acc
    }

    if (currentBattery < nextBattery) {
      return Some(index)
    }

    return acc
  }, None())
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('findFirstLowerCapacityBattery', () => {
    it('returns the index of the first removable battery', () => {
      const batteryBank: BatteryBank = [
        BatteryCapacity(5),
        BatteryCapacity(4),
        BatteryCapacity(6),
        BatteryCapacity(3),
      ]
      const result = findFirstLowerCapacityBattery(batteryBank)
      expect(result).toEqual(Some(1))
    })

    it('returns None if no removable battery is found', () => {
      const batteryBank: BatteryBank = [
        BatteryCapacity(5),
        BatteryCapacity(4),
        BatteryCapacity(3),
      ]
      const result = findFirstLowerCapacityBattery(batteryBank)
      expect(result).toEqual(None())
    })
  })
}

function removeBatteries({
  batteryBank,
  targetLength,
}: {
  batteryBank: BatteryBank
  targetLength: number
}) {
  const candidateIndex = findFirstLowerCapacityBattery(batteryBank)

  if (isSome(candidateIndex)) {
    const firstPart = batteryBank.slice(0, candidateIndex.value)
    const secondPart = batteryBank.slice(candidateIndex.value + 1)
    const newBatteryBank = [...firstPart, ...secondPart]

    if (newBatteryBank.length > targetLength) {
      return removeBatteries({
        batteryBank: newBatteryBank,
        targetLength,
      })
    } else {
      return newBatteryBank
    }
  }

  batteryBank.pop()

  if (batteryBank.length > targetLength) {
    return removeBatteries({ batteryBank, targetLength })
  }

  return batteryBank
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('removeBatteries', () => {
    const targetLength = 12

    it.each([
      [lineToBatteryBank('987654321111111'), lineToBatteryBank('987654321111')],
      [lineToBatteryBank('811111111111119'), lineToBatteryBank('811111111119')],
      [lineToBatteryBank('234234234234278'), lineToBatteryBank('434234234278')],
      [lineToBatteryBank('818181911112111'), lineToBatteryBank('888911112111')],
    ])('removes batteries correctly', (batteryBank, expectedBank) => {
      const adjustedBank = removeBatteries({ batteryBank, targetLength })
      expect(adjustedBank).toEqual(expectedBank)
    })
  })
}

/* ================================================================================= */
const data = readData({ day: 3, example: false })
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.split('').map(Number).map(BatteryCapacity))

const part1Result = data
  .map(getLargestJoltage)
  .reduce((acc, curr) => acc + curr, 0)

console.log(`Total output joltage is: ${part1Result} jolts`)

const part2Result = data
  .map((batteryBank) => removeBatteries({ batteryBank, targetLength: 12 }))
  .reduce((acc, curr) => acc + Number(curr.join('')), 0)

console.log(
  `Total output joltage after removing batteries is: ${part2Result} jolts`,
)
