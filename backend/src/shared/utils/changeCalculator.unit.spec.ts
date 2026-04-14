import { calculateChange } from "./changeCalculator";

const standardFloat = [
  { id: 1, value: 100,   stock: 20 },
  { id: 2, value: 500,   stock: 10 },
  { id: 3, value: 1000,  stock: 10 },
  { id: 4, value: 2000,  stock: 5  },
  { id: 5, value: 5000,  stock: 5  },
  { id: 6, value: 10000, stock: 5  },
];

describe("calculateChange", () => {
  it("returns empty array when no change needed", () => {
    expect(calculateChange(0, standardFloat)).toEqual([]);
  });

  it("makes exact change with a single denomination", () => {
    expect(calculateChange(1000, standardFloat)).toEqual([
      { denomination_id: 3, quantity: 1 },
    ]);
  });

  it("use largest denomination first (฿35 = ฿20 + ฿10 + ฿5)", () => {
    expect(calculateChange(3500, standardFloat)).toEqual([
      { denomination_id: 4, quantity: 1 },
      { denomination_id: 3, quantity: 1 },
      { denomination_id: 2, quantity: 1 },
    ]);
  });

  it("skips denomination when stock is 0", () => {
    const float = [
      { id: 3, value: 1000, stock: 0  },
      { id: 2, value: 500,  stock: 4  },
      { id: 1, value: 100,  stock: 20 },
    ];
    expect(calculateChange(1000, float)).toEqual([
      { denomination_id: 2, quantity: 2 },
    ]);
  });

  it("throws when exact change cannot be made", () => {
    const float = [{ id: 6, value: 10000, stock: 5 }];
    expect(() => calculateChange(500, float)).toThrow("Machine cannot make exact change");
  });

  it("throws on empty float", () => {
    expect(() => calculateChange(1000, [])).toThrow("Machine cannot make exact change");
  });

  it("verifies total equals changeSatang for large amount (฿185)", () => {
    const result = calculateChange(18500, standardFloat);
    const total = result.reduce((sum, c) => {
      const d = standardFloat.find((d) => d.id === c.denomination_id)!
      return sum + d.value * c.quantity;
    }, 0);
    expect(total).toBe(18500);
  });
});