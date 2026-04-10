'use client'

import type { Product, MachinePhase } from '@/types/vending'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  isSelected: boolean
  isDisabled: boolean
  onSelect: (product: Product) => void
}

function ProductCard({ product, isSelected, isDisabled, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => !isDisabled && onSelect(product)}
      disabled={isDisabled}
      className={cn(
        'relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 group',
        'h-28 w-full',
        isSelected
          ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
          : isDisabled
          ? 'border-zinc-700 bg-zinc-900/40 cursor-not-allowed opacity-40'
          : 'border-zinc-600 bg-zinc-900/60 hover:border-zinc-400 hover:bg-zinc-800/60 cursor-pointer'
      )}
    >
      {/* Slot number indicator */}
      {isSelected && (
        <span className="absolute top-1.5 right-2 text-[9px] font-mono text-cyan-400 font-bold tracking-wider">
          SELECTED
        </span>
      )}

      <span className="text-3xl leading-none mt-1">{product.emoji}</span>

      <div className="w-full text-center">
        <p className={cn(
          'text-xs font-semibold truncate leading-tight',
          isSelected ? 'text-cyan-300' : 'text-zinc-200'
        )}>
          {product.nameEn}
        </p>
        <p className="text-[10px] text-zinc-500 truncate">{product.name}</p>
      </div>

      <div className="flex items-center justify-between w-full">
        <span className={cn(
          'text-xs font-mono font-bold',
          isSelected ? 'text-amber-400' : 'text-amber-500'
        )}>
          ฿{product.price}
        </span>
        <span className={cn(
          'text-[10px] font-mono px-1.5 py-0.5 rounded',
          product.stock === 0
            ? 'bg-red-950 text-red-400'
            : product.stock <= 2
            ? 'bg-orange-950 text-orange-400'
            : 'bg-zinc-800 text-zinc-400'
        )}>
          {product.stock === 0 ? 'SOLD OUT' : `×${product.stock}`}
        </span>
      </div>
    </button>
  )
}

interface ProductGridProps {
  products: Product[]
  selectedProduct: Product | null
  phase: MachinePhase
  onSelect: (product: Product) => void
}

export function ProductGrid({ products, selectedProduct, phase, onSelect }: ProductGridProps) {
  const isDisabled = phase === 'dispensing'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-zinc-700" />
        <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Products</span>
        <div className="h-px flex-1 bg-zinc-700" />
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1 auto-rows-fr">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProduct?.id === product.id}
            isDisabled={isDisabled || product.stock === 0}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
