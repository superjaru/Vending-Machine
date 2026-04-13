'use client'

import type { Product, MachinePhase, ChangeItem } from '@/types/vending'
import { cn } from '@/lib/utils'

interface DisplayScreenProps {
  phase: MachinePhase
  selectedProduct: Product | null
  insertedAmount: number
  insertedBreakdown: ChangeItem[]
  changeTotal: number
  changeBreakdown: ChangeItem[]
  errorMessage: string
  isLoading: boolean
}

function LedText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono tracking-wider', className)}>
      {children}
    </span>
  )
}

function AmountDisplay({ label, amount, color = 'amber' }: {
  label: string
  amount: number
  color?: 'amber' | 'cyan' | 'green' | 'red'
}) {
  const colorMap = {
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-400',
  }
  return (
    <div className="flex items-baseline justify-between px-2">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className={cn('text-xl font-mono font-bold', colorMap[color])}>
        ฿{amount.toLocaleString()}
      </span>
    </div>
  )
}

export function DisplayScreen({
  phase,
  selectedProduct,
  insertedAmount,
  insertedBreakdown,
  changeTotal,
  changeBreakdown,
  errorMessage,
  isLoading,
}: DisplayScreenProps) {
  return (
    <div className="relative bg-[#060808] rounded-xl border border-zinc-700 overflow-hidden h-full flex flex-col">
      {/* Screen scanlines effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      {/* Screen glow top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="relative flex flex-col h-full p-3 gap-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <LedText className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase">
            Blue Vending
          </LedText>
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono',
            phase === 'dispensing' ? 'bg-amber-950/50 text-amber-400' :
            phase === 'change_returned' ? 'bg-green-950/50 text-green-400' :
            phase === 'error' ? 'bg-red-950/50 text-red-400' :
            'bg-zinc-900 text-zinc-500'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              phase === 'dispensing' ? 'bg-amber-400 animate-pulse' :
              phase === 'change_returned' ? 'bg-green-400' :
              phase === 'error' ? 'bg-red-400 animate-pulse' :
              'bg-zinc-600'
            )} />
            {phase === 'dispensing' ? 'PROCESSING' :
             phase === 'change_returned' ? 'COMPLETE' :
             phase === 'error' ? 'ERROR' :
             'READY'}
          </div>
        </div>

        {/* Main display content */}
        <div className="flex-1 flex flex-col justify-between">

          {/* Phase: Idle */}
          {phase === 'idle' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <LedText className="text-lg text-zinc-500 animate-pulse">
                  SELECT A PRODUCT
                </LedText>
                <p className="text-[10px] text-zinc-700 font-mono mt-1">
                  ← CHOOSE FROM THE LEFT
                </p>
              </div>
            </div>
          )}

          {/* Phase: Selected or Ready to buy */}
          {(phase === 'selected' || phase === 'ready_to_buy') && selectedProduct && (
            <div className="flex-1 flex flex-col gap-2">
              {/* Product info */}
              <div className="bg-zinc-900/60 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedProduct.emoji}</span>
                  <div>
                    <p className="text-sm font-mono text-zinc-200 font-bold leading-tight">
                      {selectedProduct.nameEn}
                    </p>
                    <p className="text-[10px] text-zinc-500">{selectedProduct.name}</p>
                  </div>
                </div>
              </div>

              {/* Amounts */}
              <div className="space-y-1">
                <AmountDisplay label="Price" amount={selectedProduct.price} color="amber" />
                <AmountDisplay label="Inserted" amount={insertedAmount} color="cyan" />
                {phase === 'selected' && (
                  <AmountDisplay
                    label="Need More"
                    amount={selectedProduct.price - insertedAmount}
                    color="red"
                  />
                )}
                {phase === 'ready_to_buy' && (
                  <div className="flex items-center justify-between px-2 mt-1">
                    <span className="text-[10px] font-mono text-green-600 uppercase tracking-wider">Change</span>
                    <span className="text-xl font-mono font-bold text-green-400">
                      ฿{(insertedAmount - selectedProduct.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className={cn(
                'rounded-lg px-3 py-2 text-center',
                phase === 'ready_to_buy'
                  ? 'bg-green-950/40 border border-green-800/50'
                  : 'bg-zinc-900/40'
              )}>
                {phase === 'ready_to_buy' ? (
                  <LedText className="text-xs text-green-400 animate-pulse">
                    ✓ PRESS BUY TO CONFIRM
                  </LedText>
                ) : (
                  <LedText className="text-xs text-zinc-500">
                    INSERT ฿{selectedProduct.price - insertedAmount} MORE
                  </LedText>
                )}
              </div>
            </div>
          )}

          {/* Phase: Dispensing */}
          {phase === 'dispensing' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <span className="text-4xl animate-bounce">{selectedProduct?.emoji}</span>
              </div>
              <div className="text-center">
                <LedText className="text-sm text-amber-400 animate-pulse">
                  DISPENSING...
                </LedText>
                <p className="text-[10px] text-zinc-600 font-mono mt-1">Please wait</p>
              </div>
            </div>
          )}

          {/* Phase: Change returned */}
          {phase === 'change_returned' && (
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-center py-1">
                <LedText className="text-sm text-green-400 font-bold">
                  ✓ ENJOY YOUR DRINK!
                </LedText>
              </div>

              {changeTotal > 0 ? (
                <div className="bg-zinc-900/60 rounded-lg p-2 flex-1">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    Your change: ฿{changeTotal}
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {changeBreakdown.map((item) => (
                      <div key={item.value} className="flex items-center justify-between text-xs font-mono">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px]',
                          item.type === 'coin'
                            ? 'bg-yellow-950/50 text-yellow-400'
                            : 'bg-green-950/50 text-green-400'
                        )}>
                          {item.type === 'coin' ? '🪙' : '💵'} ฿{item.value}
                        </span>
                        <span className="text-zinc-400">× {item.count}</span>
                        <span className="text-zinc-300">฿{item.value * item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <LedText className="text-xs text-zinc-500">No change needed</LedText>
                </div>
              )}

              <p className="text-[10px] font-mono text-cyan-600 text-center animate-pulse">
                TAP COLLECT to take change
              </p>
            </div>
          )}

          {/* Phase: Cancelled */}
          {phase === 'cancelled' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <LedText className="text-sm text-amber-400">RETURNING MONEY</LedText>
              {insertedAmount > 0 && (
                <p className="text-xs font-mono text-zinc-400">฿{insertedAmount} returned</p>
              )}
            </div>
          )}

          {/* Phase: Error */}
          {phase === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">⚠️</span>
              <LedText className="text-xs text-red-400 text-center px-2">
                {errorMessage || 'An error occurred'}
              </LedText>
            </div>
          )}
        </div>

        {/* Inserted money breakdown (small) */}
        {insertedBreakdown.length > 0 && phase !== 'change_returned' && phase !== 'cancelled' && (
          <div className="border-t border-zinc-800 pt-2">
            <p className="text-[9px] font-mono text-zinc-600 mb-1 uppercase tracking-wider">Inserted</p>
            <div className="flex flex-wrap gap-1">
              {insertedBreakdown.map((item) => (
                <span key={item.value} className={cn(
                  'text-[9px] font-mono px-1.5 py-0.5 rounded',
                  item.type === 'coin'
                    ? 'bg-yellow-950/60 text-yellow-500'
                    : 'bg-emerald-950/60 text-emerald-500'
                )}>
                  ฿{item.value}×{item.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
