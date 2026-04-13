'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Product, MachinePhase } from '@/types/vending'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'all',   label: 'All',  icon: '◈' },
  { key: 'drink', label: 'Drink', icon: '🥤' },
  { key: 'snack', label: 'Snack', icon: '🍟' },
  { key: 'food',  label: 'Food',  icon: '🥪' },
] as const

type CategoryKey = 'all' | 'drink' | 'snack' | 'food'

const ITEMS_PER_PAGE = 12 // 3x3 grid

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product
  isSelected: boolean
  isDisabled: boolean
  onSelect: (product: Product) => void
}

function ProductCard({ product, isSelected, isDisabled, onSelect }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 2

  return (
    <button
      onClick={() => !isDisabled && onSelect(product)}
      disabled={isDisabled}
      className={cn(
        'relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2',
        'transition-all duration-200 w-full h-24',
        isSelected
          ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
          : isDisabled
          ? 'border-zinc-800 bg-zinc-900/30 cursor-not-allowed opacity-40'
          : 'border-zinc-700/60 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/50 cursor-pointer'
      )}
    >
      {isSelected && (
        <span className="absolute top-1.5 right-1.5 text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1 rounded">
          ✓
        </span>
      )}
      <span className="text-2xl leading-none">{product.emoji}</span>
      <p className={cn(
        'text-[11px] font-mono font-semibold truncate w-full text-center',
        isSelected ? 'text-cyan-300' : 'text-zinc-200'
      )}>
        {product.nameEn}
      </p>
      <div className="flex items-center justify-between w-full">
        <span className={cn(
          'text-[11px] font-mono font-bold',
          isSelected ? 'text-amber-400' : 'text-amber-500'
        )}>
          ฿{product.price}
        </span>
        <span className={cn(
          'text-[9px] font-mono px-1 py-0.5 rounded',
          isOutOfStock ? 'bg-red-950 text-red-400' :
          isLowStock   ? 'bg-orange-950 text-orange-400' :
                         'bg-zinc-800 text-zinc-500'
        )}>
          {isOutOfStock ? 'OUT' : `x${product.stock}`}
        </span>
      </div>
    </button>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all',
          'border',
          currentPage === 0
            ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer'
        )}
      >
        ← Prev
      </button>

      {/* Page dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={cn(
              'rounded-full transition-all duration-150',
              i === currentPage
                ? 'w-4 h-1.5 bg-cyan-500'
                : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
            )}
          />
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all',
          'border',
          currentPage === totalPages - 1
            ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer'
        )}
      >
        Next →
      </button>
    </div>
  )
}

// ─── Main ProductGrid ─────────────────────────────────────────────────────────

interface ProductGridProps {
  products: Product[]
  selectedProduct: Product | null
  phase: MachinePhase
  onSelect: (product: Product) => void
}

export function ProductGrid({ products, selectedProduct, phase, onSelect }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const isDisabled = phase === 'dispensing'

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory
      const matchesSearch =
        p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        p.name.includes(search)
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  // Reset to page 0 when filter/search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [activeCategory, search])

  // If selected product is on a different page, jump to it
  useEffect(() => {
    if (!selectedProduct) return
    const idx = filtered.findIndex((p) => p.id === selectedProduct.id)
    if (idx === -1) return
    const page = Math.floor(idx / ITEMS_PER_PAGE)
    setCurrentPage(page)
  }, [selectedProduct])

  const availableCount = filtered.filter((p) => p.stock > 0).length
  const startIdx = currentPage * ITEMS_PER_PAGE + 1
  const endIdx = Math.min((currentPage + 1) * ITEMS_PER_PAGE, filtered.length)

  return (
    <div className="flex flex-col h-full gap-2">

      {/* Search */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-mono pointer-events-none">
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-lg pl-7 pr-3 py-1.5
            text-xs font-mono text-zinc-300 placeholder:text-zinc-600
            focus:outline-none focus:border-zinc-500 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-[10px]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1">
        {CATEGORIES.map((cat) => {
          const count = cat.key === 'all'
            ? products.length
            : products.filter((p) => p.category === cat.key).length
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'flex-1 flex flex-col items-center py-1.5 rounded-lg border text-[9px] font-mono transition-all duration-150',
                activeCategory === cat.key
                  ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                  : 'border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
              )}
            >
              <span className="text-sm leading-none mb-0.5">{cat.icon}</span>
              <span className="uppercase tracking-wider">{cat.label}</span>
              <span className={cn(
                'text-[8px]',
                activeCategory === cat.key ? 'text-zinc-400' : 'text-zinc-700'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-zinc-600">
          {filtered.length === 0
            ? 'No results'
            : `${startIdx}–${endIdx} of ${filtered.length} · ${availableCount} available`
          }
        </span>
        {selectedProduct && (
          <span className="text-[9px] font-mono text-cyan-600 truncate max-w-[130px]">
            ✓ {selectedProduct.nameEn}
          </span>
        )}
      </div>

      {/* Product grid */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-3xl opacity-20">🔍</span>
            <p className="text-xs font-mono text-zinc-600">No products found</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {paginated.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                isDisabled={isDisabled || product.stock === 0}
                onSelect={onSelect}
              />
            ))}
            {/* Fill empty cells to keep grid stable */}
            {Array.from({ length: ITEMS_PER_PAGE - paginated.length }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-xl border border-zinc-800/30 border-dashed" />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}