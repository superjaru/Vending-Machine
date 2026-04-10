import type { MoneyDenomination, ChangeItem } from '@/types/vending'

/**
 * Greedy algorithm to make exact change from available denominations.
 * Works correctly for canonical coin systems (THB: 1, 5, 10, 20, 50, 100, 500, 1000).
 *
 * @returns Array of ChangeItem if exact change is possible, null otherwise.
 */
export function makeChange(
  amount: number,
  available: MoneyDenomination[]
): ChangeItem[] | null {
  if (amount === 0) return []
  if (amount < 0) return null

  const sorted = [...available]
    .filter((d) => d.stock > 0 && d.value <= amount)
    .sort((a, b) => b.value - a.value)

  const result: ChangeItem[] = []
  let remaining = amount

  for (const denom of sorted) {
    if (remaining <= 0) break
    const use = Math.min(denom.stock, Math.floor(remaining / denom.value))
    if (use > 0) {
      result.push({ value: denom.value, count: use, type: denom.type })
      remaining -= use * denom.value
    }
  }

  return remaining === 0 ? result : null
}

/**
 * Check if exact change can be made without returning the breakdown.
 */
export function canMakeChange(
  amount: number,
  available: MoneyDenomination[]
): boolean {
  return makeChange(amount, available) !== null
}
