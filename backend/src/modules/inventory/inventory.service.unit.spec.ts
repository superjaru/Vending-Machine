import { AppError } from "../../shared/middleware";
import { MachineRepository } from "../machines/machines.repo";
import { InventoryRepository } from "./inventory.repo";
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
    jest.restoreAllMocks();

  });

  describe("getByMachine", () => {
    it("returns inventory rows for a valid machine", async () => {
      MachineRepository.prototype.findById = jest.fn().mockResolvedValue(mockMachine);
      InventoryRepository.prototype.findByMachine = jest.fn().mockResolvedValue(mockInventoryRows);
      const result = await service.getByMachine(1);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Pepsi");
    });

    it("throws 404 when machine does not exist", async () => {
      MachineRepository.prototype.findById = jest.fn().mockResolvedValue(undefined);
      await expect(service.getByMachine(999)).rejects.toThrow(
        new AppError("Machine not found", 404),
      );
    });
  });
});
