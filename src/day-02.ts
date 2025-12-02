import { readData } from './utils/read-data.ts'

type ProductId = number & { __brand: 'ProductId' }

function ProductId(value: number): ProductId {
  return value as ProductId
}

type ProductIdRange = [start: ProductId, end: ProductId]

function unwrapProductIds(range: ProductIdRange): ProductId[] {
  const [start, end] = range
  const products = [
    Array.from({ length: end - start + 1 }, (_, i) => ProductId(start + i)),
  ]

  return products.flat()
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('unwrapProductIds', () => {
    it('unwraps a valid product ID range', () => {
      const range: ProductIdRange = [ProductId(85), ProductId(103)]
      const result = unwrapProductIds(range)

      expect(result).toEqual([
        85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
        102, 103,
      ])
    })
  })
}

function isInvalidProductId(productId: ProductId): boolean {
  const productIdStr = productId.toString()
  const isDivisibleByTwo = productIdStr.length % 2 === 0
  if (!isDivisibleByTwo) {
    return false
  }
  const halfLength = productIdStr.length / 2
  const firstHalf = productIdStr.slice(0, halfLength)
  const secondHalf = productIdStr.slice(halfLength)

  return firstHalf === secondHalf
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('isInvalidProductId', () => {
    const validProductIds = [100, 1331, 150, 1234567, 655556].map(ProductId)
    const invalidProductIds = [11, 22, 99, 1010, 1188511885, 464464].map(
      ProductId,
    )

    it.each(validProductIds)(
      'returns false for valid product ID %s',
      (productId) => {
        const result = isInvalidProductId(productId)
        expect(result).toBe(false)
      },
    )

    it.each(invalidProductIds)(
      'returns true for invalid product ID %s',
      (productId) => {
        const result = isInvalidProductId(productId)
        expect(result).toBe(true)
      },
    )
  })
}

/* ---------------------------------------------------------------------------------- */
const data = readData({
  day: 2,
  example: false,
})
  .filter(Boolean)
  .join('')
  .split(',')
  .map((range) => {
    const rangeParts = range
      .split('-')
      .map((value) => ProductId(parseInt(value.trim(), 10)))
    if (rangeParts.length !== 2) {
      throw new Error(`Invalid range: ${range}`)
    }
    return rangeParts as ProductIdRange
  })
function part1(data: ProductIdRange[]): void {
  const invalidProductIds: ProductId[] = data
    .map(unwrapProductIds)
    .flat()
    .filter(isInvalidProductId)

  const sum = invalidProductIds.reduce((acc, curr) => acc + curr, 0)

  console.log(`Sum of invalid product IDs: ${sum}`)
}

part1(data)
