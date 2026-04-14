import { machineRepo } from "../machines/machines.repo";
import { inventoryRepo } from "./inventory.repo";
jest.mock("./inventory.repo", () => ({
  inventoryRepo: {
    findByMachine: jest.fn(),
    findOne: jest.fn(),
    upsert: jest.fn(),
    getLowStock: jest.fn(),
  },
}));

jest.mock("../machines/machines.repo", () => ({
  machineRepo: {
    findById: jest.fn(),
  },
}));

import { AppError } from "../../shared/middleware";

import { InventoryService } from "./inventory.service";

const mockMachine = { id: 1, name: "CW-001", location_id: 1, status: "active" };

const mockInventoryRows = [
  {
    product_id: 1,
    name: "Pepsi",
    category: "drink",
    price_thb: "20.00",
    image_url: null,
    stock: 8,
    max_capacity: 10,
    low_stock_threshold: 2,
    updated_at: new Date(),
  },
  {
    product_id: 2,
    name: "Lays",
    category: "snack",
    price_thb: "25.00",
    image_url: null,
    stock: 1,
    max_capacity: 10,
    low_stock_threshold: 2,
    updated_at: new Date(),
  },
];

describe("InventoryService", () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
  });

  describe("getByMachine", () => {
    it("returns inventory rows for a valid machine", async () => {
      (machineRepo.findById as jest.Mock).mockResolvedValue(mockMachine);
      (inventoryRepo.findByMachine as jest.Mock).mockResolvedValue(mockInventoryRows);

      const result = await service.getByMachine(1);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Pepsi");
    });

    it("throws 404 when machine does not exist", async () => {
      (machineRepo.findById as jest.Mock).mockResolvedValue(undefined);
      await expect(service.getByMachine(999)).rejects.toThrow(
        new AppError("Machine not found", 404),
      );
    });
  });
});
