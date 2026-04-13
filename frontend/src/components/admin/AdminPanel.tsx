'use client'

import { useEffect, useState } from 'react'
import { getProducts, getCashStock, updateProductStock, updateCashStock } from '@/lib/mockApi'
import type { Product, MoneyDenomination } from '@/types/vending'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function StockControl({
  value,
  stock,
  onUpdate,
}: {
  value: number
  stock: number
  onUpdate: (newStock: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onUpdate(stock - 1)}
        disabled={stock <= 0}
        className="w-7 h-7 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 font-mono font-bold text-sm hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        -
      </button>
      <span className={cn(
        'w-8 text-center font-mono font-bold text-sm',
        stock === 0 ? 'text-red-400' : stock <= 2 ? 'text-orange-400' : 'text-zinc-200'
      )}>
        {stock}
      </span>
      <button
        onClick={() => onUpdate(stock + 1)}
        className="w-7 h-7 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 font-mono font-bold text-sm hover:bg-zinc-700 transition-colors"
      >
        +
      </button>
    </div>
  )
}

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [cash, setCash] = useState<MoneyDenomination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [prods, cashData] = await Promise.all([getProducts(), getCashStock()])
      setProducts(prods)
      setCash(cashData)
      setIsLoading(false)
    }
    load()
  }, [])

  async function handleProductStockUpdate(id: string, newStock: number) {
    setSaving(id)
    try {
      const updated = await updateProductStock(id, newStock)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } finally {
      setSaving(null)
    }
  }

  async function handleCashStockUpdate(value: number, newStock: number) {
    setSaving(`cash-${value}`)
    try {
      const updated = await updateCashStock(value, newStock)
      setCash((prev) => prev.map((d) => (d.value === value ? updated : d)))
    } finally {
      setSaving(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="font-mono text-zinc-500 animate-pulse">LOADING...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-mono text-xl text-zinc-100 font-bold tracking-wider">
              ADMIN PANEL
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Blue Vending Machine — Stock Management</p>
          </div>
          <Link
            href="/"
            className="font-mono text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded transition-colors"
          >
            ← Back to Machine
          </Link>
        </div>

        {/* Product Stock */}
        <section className="mb-8">
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="h-px flex-1 bg-zinc-800" />
            Product Stock
            <span className="h-px flex-1 bg-zinc-800" />
          </h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="text-center px-4 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr
                    key={product.id}
                    className={cn(
                      'border-b border-zinc-800/50 transition-colors',
                      i % 2 === 0 ? 'bg-zinc-900/20' : 'bg-transparent',
                      saving === product.id ? 'opacity-50' : ''
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{product.emoji}</span>
                        <div>
                          <p className="text-sm font-mono text-zinc-200">{product.nameEn}</p>
                          <p className="text-[10px] text-zinc-600">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-500 text-sm">
                      ฿{product.price}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <StockControl
                          value={product.price}
                          stock={product.stock}
                          onUpdate={(s) => handleProductStockUpdate(product.id, s)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-[10px] font-mono px-2 py-0.5 rounded',
                        product.stock === 0
                          ? 'bg-red-950/50 text-red-400'
                          : product.stock <= 2
                          ? 'bg-orange-950/50 text-orange-400'
                          : 'bg-green-950/50 text-green-400'
                      )}>
                        {product.stock === 0 ? 'EMPTY' : product.stock <= 2 ? 'LOW' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cash Stock */}
        <section>
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="h-px flex-1 bg-zinc-800" />
            Cash Stock
            <span className="h-px flex-1 bg-zinc-800" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Coins */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">🪙 Coins</p>
              </div>
              {cash.filter((d) => d.type === 'coin').map((denom) => (
                <div key={denom.value} className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 last:border-0">
                  <span className="font-mono text-sm text-yellow-400 font-bold">฿{denom.value}</span>
                  <StockControl
                    value={denom.value}
                    stock={denom.stock}
                    onUpdate={(s) => handleCashStockUpdate(denom.value, s)}
                  />
                </div>
              ))}
            </div>

            {/* Banknotes */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">💵 Banknotes</p>
              </div>
              {cash.filter((d) => d.type === 'banknote').map((denom) => (
                <div key={denom.value} className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 last:border-0">
                  <span className="font-mono text-sm text-green-400 font-bold">฿{denom.value.toLocaleString()}</span>
                  <StockControl
                    value={denom.value}
                    stock={denom.stock}
                    onUpdate={(s) => handleCashStockUpdate(denom.value, s)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
