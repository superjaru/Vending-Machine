import { calculateChange, DenomStock } from '../../src/shared/utils/changeCalculator'

const makeFloat = (entries: [number, number, number][]): DenomStock[] =>
  entries.map(([id, value_satang, quantity]) => ({ id, value_satang, quantity }))

const standardFloat = makeFloat([
  [1, 100,   20],   // ฿1  × 20
  [2, 500,   10],   // ฿5  × 10
  [3, 1000,  10],   // ฿10 × 10
  [4, 2000,   5],   // ฿20 × 5
  [5, 5000,   5],   // ฿50 × 5
  [6, 10000,  5],   // ฿100 × 5
])

describe('calculateChange', () => {
  it('returns empty array when no change needed', () => {
    expect(calculateChange(0, standardFloat)).toEqual([])
  })

  it('makes exact change with a single denomination', () => {
    expect(calculateChange(1000, standardFloat)).toEqual([
      { denomination_id: 3, quantity: 1 },
    ])
  })

  it('uses greedy — largest denomination first (฿35 = ฿20 + ฿10 + ฿5)', () => {
    expect(calculateChange(3500, standardFloat)).toEqual([
      { denomination_id: 4, quantity: 1 },
      { denomination_id: 3, quantity: 1 },
      { denomination_id: 2, quantity: 1 },
    ])
  })

  it('skips denomination when quantity is 0', () => {
    const float = makeFloat([
      [3, 1000, 0],   // ฿10 — out of stock
      [2, 500,  4],   // ฿5  × 4
      [1, 100,  20],  // ฿1  × 20
    ])
    // ฿10 change: falls back to 2 × ฿5
    expect(calculateChange(1000, float)).toEqual([
      { denomination_id: 2, quantity: 2 },
    ])
  })

  it('throws when exact change cannot be made', () => {
    const float = makeFloat([[6, 10000, 5]])  // only ฿100 notes
    expect(() => calculateChange(500, float)).toThrow('Machine cannot make exact change')
  })

  it('throws on empty float', () => {
    expect(() => calculateChange(1000, [])).toThrow('Machine cannot make exact change')
  })

  it('verifies total equals changeSatang for large amount (฿185)', () => {
    const result = calculateChange(18500, standardFloat)
    const total  = result.reduce((sum, c) => {
      const d = standardFloat.find((d) => d.id === c.denomination_id)!
      return sum + d.value_satang * c.quantity
    }, 0)
    expect(total).toBe(18500)
  })
})
