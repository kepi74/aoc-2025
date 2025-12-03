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
      [
        '987654321111111'.split('').map((d) => BatteryCapacity(Number(d))),
        Joltage(98),
      ],
      [
        '811111111111119'.split('').map((d) => BatteryCapacity(Number(d))),
        Joltage(89),
      ],
      [
        '234234234234278'.split('').map((d) => BatteryCapacity(Number(d))),
        Joltage(78),
      ],
      [
        '818181911112111'.split('').map((d) => BatteryCapacity(Number(d))),
        Joltage(92),
      ],
    ])(
      `calculates the correct Joltage for battery bank %s`,
      (batteryBank, expectedJoltage) => {
        const joltage = getLargestJoltage(batteryBank)
        expect(joltage).toEqual(expectedJoltage)
      },
    )
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
