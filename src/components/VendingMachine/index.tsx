'use client'

import { useVendingMachine } from '@/hooks/useVendingMachine'
import { ProductGrid } from './ProductGrid'
import { DisplayScreen } from './DisplayScreen'
import { MoneyPanel } from './MoneyPanel'
import Link from 'next/link'

export function VendingMachine() {
  const {
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
  } = useVendingMachine()

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-zinc-500 text-sm tracking-wider animate-pulse">
            INITIALIZING...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.03) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 50%, rgba(34,197,94,0.02) 0%, transparent 60%)
        `,
      }}
    >
      {/* Machine body */}
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1c1c1e 0%, #111113 50%, #1a1a1c 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/70" />
              <div className="w-2 h-2 rounded-full bg-amber-500/70" />
              <div className="w-2 h-2 rounded-full bg-green-500/70" />
            </div>
            <span className="font-mono text-xs text-zinc-500 tracking-[0.15em] uppercase">
              Blue Vending Machine v1.0
            </span>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors border border-zinc-800 hover:border-zinc-600 px-2 py-1 rounded"
          >
            Admin →
          </Link>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-[1fr_280px] gap-0 min-h-[580px]">
          {/* Left: Products */}
          <div className="p-5 border-r border-zinc-800/60">
            <ProductGrid
              products={products}
              selectedProduct={selectedProduct}
              phase={phase}
              onSelect={selectProduct}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col p-4 gap-4">
            {/* Display screen */}
            <div className="flex-1 min-h-0" style={{ minHeight: '280px' }}>
              <DisplayScreen
                phase={phase}
                selectedProduct={selectedProduct}
                insertedAmount={insertedAmount}
                insertedBreakdown={insertedBreakdown}
                changeTotal={changeTotal}
                changeBreakdown={changeBreakdown}
                errorMessage={errorMessage}
                isLoading={isLoading}
              />
            </div>

            {/* Money panel */}
            <div className="flex-shrink-0">
              <MoneyPanel
                cashStock={cashStock}
                phase={phase}
                onInsert={insertMoney}
                onBuy={buyProduct}
                onCancel={cancelAndReturn}
                onCollect={collectChange}
                insertedAmount={insertedAmount}
                selectedProductPrice={selectedProduct?.price}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="px-6 py-2 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-[9px] font-mono text-zinc-700">
            Accepts: ฿1 ฿5 ฿10 coins • ฿20 ฿50 ฿100 ฿500 ฿1000 notes
          </span>
          <span className="text-[9px] font-mono text-zinc-700">
            {products.filter((p) => p.stock > 0).length} items available
          </span>
        </div>
      </div>
    </div>
  )
}
