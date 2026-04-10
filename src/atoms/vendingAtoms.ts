import { atom } from 'jotai'
import type { Product, MoneyDenomination, ChangeItem, MachinePhase } from '@/types/vending'

export const productsAtom = atom<Product[]>([])
export const cashStockAtom = atom<MoneyDenomination[]>([])
export const selectedProductAtom = atom<Product | null>(null)
export const insertedAmountAtom = atom<number>(0)
export const insertedBreakdownAtom = atom<ChangeItem[]>([])
export const machinePhaseAtom = atom<MachinePhase>('idle')
export const changeBreakdownAtom = atom<ChangeItem[]>([])
export const changeTotalAtom = atom<number>(0)
export const isLoadingAtom = atom<boolean>(false)
export const errorMessageAtom = atom<string>('')

// Derived: how much more the user needs to insert
export const amountNeededAtom = atom((get) => {
  const selected = get(selectedProductAtom)
  const inserted = get(insertedAmountAtom)
  if (!selected) return 0
  return Math.max(0, selected.price - inserted)
})
