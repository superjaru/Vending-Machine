'use client'

import type { MoneyDenomination, MachinePhase } from '@/types/vending'
import { cn } from '@/lib/utils'

interface MoneyButtonProps {
  denomination: MoneyDenomination
  isDisabled: boolean
  onInsert: (value: number, type: 'coin' | 'banknote') => void
}

function CoinButton({ denomination, isDisabled, onInsert }: MoneyButtonProps) {
  const sizeMap: Record<number, string> = {
    1: 'w-9 h-9 text-[10px]',
    5: 'w-10 h-10 text-xs',
    10: 'w-11 h-11 text-xs',
  }
  return (
    <button
      onClick={() => !isDisabled && onInsert(denomination.value, 'coin')}
      disabled={isDisabled}
      className={cn(
        'rounded-full flex flex-col items-center justify-center transition-all duration-150 font-mono font-bold',
        'border-2 shadow-lg active:scale-95 select-none',
        sizeMap[denomination.value] || 'w-10 h-10 text-xs',
        isDisabled
          ? 'border-zinc-700 bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
          : 'border-yellow-600 bg-gradient-to-br from-yellow-500/20 to-yellow-800/30 text-yellow-400 hover:from-yellow-500/30 hover:border-yellow-400 cursor-pointer hover:shadow-[0_0_12px_rgba(234,179,8,0.3)]'
      )}
    >
      <span>{denomination.value}</span>
    </button>
  )
}

function BanknoteButton({ denomination, isDisabled, onInsert }: MoneyButtonProps) {
  const colorMap: Record<number, { border: string; bg: string; text: string; glow: string }> = {
    20:   { border: 'border-green-700',  bg: 'from-green-600/15 to-green-900/20',  text: 'text-green-400',  glow: 'hover:shadow-[0_0_12px_rgba(34,197,94,0.2)]' },
    50:   { border: 'border-blue-700',   bg: 'from-blue-600/15 to-blue-900/20',    text: 'text-blue-400',   glow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]' },
    100:  { border: 'border-red-700',    bg: 'from-red-600/15 to-red-900/20',      text: 'text-red-400',    glow: 'hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]' },
    500:  { border: 'border-purple-700', bg: 'from-purple-600/15 to-purple-900/20',text: 'text-purple-400', glow: 'hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]' },
    1000: { border: 'border-orange-700', bg: 'from-orange-600/15 to-orange-900/20',text: 'text-orange-400', glow: 'hover:shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
  }
  const color = colorMap[denomination.value] || colorMap[20]

  return (
    <button
      onClick={() => !isDisabled && onInsert(denomination.value, 'banknote')}
      disabled={isDisabled}
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-150 font-mono w-full',
        'active:scale-[0.98] select-none',
        isDisabled
          ? 'border-zinc-800 bg-zinc-900/30 text-zinc-700 cursor-not-allowed'
          : cn(
              `border-opacity-60 bg-gradient-to-r`,
              color.border, color.bg, color.text, color.glow,
              'hover:border-opacity-100 cursor-pointer'
            )
      )}
    >
      <span className="text-[10px] opacity-60">฿</span>
      <span className="text-sm font-bold">{denomination.value.toLocaleString()}</span>
      <span className="text-[9px] opacity-50">THB</span>
    </button>
  )
}

interface MoneyPanelProps {
  cashStock: MoneyDenomination[]
  phase: MachinePhase
  onInsert: (value: number, type: 'coin' | 'banknote') => void
  onBuy: () => void
  onCancel: () => void
  onCollect: () => void
  insertedAmount: number
  selectedProductPrice?: number
  isLoading: boolean
}

export function MoneyPanel({
  cashStock,
  phase,
  onInsert,
  onBuy,
  onCancel,
  onCollect,
  insertedAmount,
  selectedProductPrice,
  isLoading,
}: MoneyPanelProps) {
  const isInsertDisabled = phase === 'dispensing' || phase === 'change_returned' || phase === 'cancelled'
  const canBuy = phase === 'ready_to_buy' && !isLoading

  const coins = cashStock.filter((d) => d.type === 'coin')
  const banknotes = cashStock.filter((d) => d.type === 'banknote')

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Coins */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[9px] font-mono text-zinc-600 tracking-widest uppercase">Coins</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <div className="flex items-end justify-center gap-3">
          {coins.map((coin) => (
            <div key={coin.value} className="flex flex-col items-center gap-1">
              <CoinButton
                denomination={coin}
                isDisabled={isInsertDisabled}
                onInsert={onInsert}
              />
              <span className="text-[9px] font-mono text-zinc-600">฿{coin.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Banknotes */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[9px] font-mono text-zinc-600 tracking-widest uppercase">Banknotes</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <div className="space-y-1.5">
          {banknotes.map((note) => (
            <BanknoteButton
              key={note.value}
              denomination={note}
              isDisabled={isInsertDisabled}
              onInsert={onInsert}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-1 border-t border-zinc-800">
        {/* BUY button */}
        {phase === 'change_returned' ? (
          <button
            onClick={onCollect}
            className="w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all duration-200
              bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400
              text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
              active:scale-[0.98] border border-cyan-400/30"
          >
            COLLECT CHANGE
          </button>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canBuy}
            className={cn(
              'w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all duration-200',
              'active:scale-[0.98] border',
              canBuy
                ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              'BUY'
            )}
          </button>
        )}

        {/* CANCEL button */}
        {(insertedAmount > 0 || phase === 'selected' || phase === 'ready_to_buy') &&
          phase !== 'change_returned' &&
          phase !== 'dispensing' && (
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-xl font-mono font-bold text-xs tracking-wider transition-all duration-200
              border border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-950/40 hover:text-red-400
              active:scale-[0.98]"
          >
            ✕ CANCEL / RETURN
          </button>
        )}
      </div>
    </div>
  )
}
