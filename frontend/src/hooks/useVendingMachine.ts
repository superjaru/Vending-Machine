'use client'

import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  productsAtom,
  cashStockAtom,
  selectedProductAtom,
  insertedAmountAtom,
  insertedBreakdownAtom,
  machinePhaseAtom,
  changeBreakdownAtom,
  changeTotalAtom,
  isLoadingAtom,
  errorMessageAtom,
} from '@/atoms/vendingAtoms'
import {
  getProducts,
  getCashStock,
  processPurchase,
} from '@/lib/mockApi'
import type { Product, ChangeItem } from '@/types/vending'

export function useVendingMachine() {
  const [products, setProducts] = useAtom(productsAtom)
  const [cashStock, setCashStock] = useAtom(cashStockAtom)
  const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom)
  const [insertedAmount, setInsertedAmount] = useAtom(insertedAmountAtom)
  const [insertedBreakdown, setInsertedBreakdown] = useAtom(insertedBreakdownAtom)
  const [phase, setPhase] = useAtom(machinePhaseAtom)
  const [changeBreakdown, setChangeBreakdown] = useAtom(changeBreakdownAtom)
  const [changeTotal, setChangeTotal] = useAtom(changeTotalAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom)

  // Load initial data
  useEffect(() => {
    async function init() {
      setIsLoading(true)
      const [prods, cash] = await Promise.all([getProducts(), getCashStock()])
      setProducts(prods)
      setCashStock(cash)
      setIsLoading(false)
    }
    init()
  }, [])

  const selectProduct = useCallback(
    (product: Product) => {
      if (product.stock === 0) return
      if (phase === 'dispensing') return

      // If already in change_returned, reset first
      if (phase === 'change_returned' || phase === 'cancelled') {
        resetMachine()
      }

      setSelectedProduct(product)
      setErrorMessage('')

      if (insertedAmount >= product.price) {
        setPhase('ready_to_buy')
      } else {
        setPhase('selected')
      }
    },
    [phase, insertedAmount]
  )

  const insertMoney = useCallback(
    (value: number, type: 'coin' | 'banknote') => {
      if (phase === 'dispensing' || phase === 'change_returned') return

      const newAmount = insertedAmount + value
      setInsertedAmount(newAmount)

      // Update breakdown
      setInsertedBreakdown((prev) => {
        const existing = prev.find((item) => item.value === value)
        if (existing) {
          return prev.map((item) =>
            item.value === value ? { ...item, count: item.count + 1 } : item
          )
        }
        return [...prev, { value, count: 1, type }]
      })

      setErrorMessage('')

      if (selectedProduct && newAmount >= selectedProduct.price) {
        setPhase('ready_to_buy')
      } else if (selectedProduct) {
        setPhase('selected')
      }
    },
    [phase, insertedAmount, selectedProduct]
  )

  const buyProduct = useCallback(async () => {
    if (!selectedProduct || phase !== 'ready_to_buy') return

    setPhase('dispensing')
    setIsLoading(true)

    try {
      const result = await processPurchase({
        productId: selectedProduct.id,
        insertedAmount,
        insertedBreakdown,
      })

      if (result.success) {
        // Update product in list
        if (result.updatedProduct) {
          // setProducts((prev) =>
          //   prev.map((p) => (p.id === result.updatedProduct!.id ? result.updatedProduct! : p))
          // )
          const updatedProducts = await getProducts()
          setProducts([...updatedProducts])
        }

        // Refresh cash stock
        const updatedCash = await getCashStock()
        setCashStock(updatedCash)

        setChangeTotal(result.changeTotal)
        setChangeBreakdown(result.changeBreakdown)
        setPhase('change_returned')
      } else {
        setErrorMessage(result.message)
        setPhase('error')
        // Return to appropriate phase after short delay
        setTimeout(() => {
          if (insertedAmount >= (selectedProduct?.price ?? 0)) {
            setPhase('ready_to_buy')
          } else {
            setPhase('selected')
          }
          setErrorMessage('')
        }, 3000)
      }
    } catch {
      setErrorMessage('An error occurred. Please try again.')
      setPhase('error')
      setTimeout(() => setPhase('selected'), 3000)
    } finally {
      setIsLoading(false)
    }
  }, [selectedProduct, phase, insertedAmount, insertedBreakdown])

  const cancelAndReturn = useCallback(() => {
    if (phase === 'dispensing') return
    setPhase('cancelled')
    setTimeout(() => resetMachine(), 2000)
  }, [phase])

  const resetMachine = useCallback(() => {
    setSelectedProduct(null)
    setInsertedAmount(0)
    setInsertedBreakdown([])
    setChangeBreakdown([])
    setChangeTotal(0)
    setErrorMessage('')
    setPhase('idle')
  }, [])

  const collectChange = useCallback(() => {
    resetMachine()
  }, [])

  return {
    products,
    cashStock,
    selectedProduct,
    insertedAmount,
    insertedBreakdown,
    phase,
    changeBreakdown,
    changeTotal,
    isLoading,
    errorMessage,
    selectProduct,
    insertMoney,
    buyProduct,
    cancelAndReturn,
    collectChange,
    resetMachine,
  }
}
