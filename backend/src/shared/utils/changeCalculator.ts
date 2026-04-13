export interface DenomStock {
  id: number;
  value: number;
  stock: number;
}

export interface ChangeItem {
  denomination_id: number;
  quantity: number;
}

export function calculateChange(changeCash: number, float: DenomStock[]): ChangeItem[] {
  const sorted = [...float].sort((a, b) => b.value - a.value);
  let remaining = changeCash;
  const result: ChangeItem[] = [];

  for (const d of sorted) {
    if (remaining <= 0) break;
    const use = Math.min(Math.floor(remaining / d.value), d.stock);
    if (use > 0) {
      result.push({ denomination_id: d.id, quantity: use });
      remaining -= use * d.value;
    }
  }

  if (remaining > 0) {
    throw new Error("Machine cannot make exact change");
  }

  return result;
}
