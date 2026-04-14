import { AppError } from "../../shared/middleware";
import { machineRepo } from "./machines.repo";
import { MachineService } from "./machines.service";

jest.mock("./machines.repo", () => ({
  machineRepo: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByMachineSerial: jest.fn(),
  },
}));

const mockMachine = {
  id: 1,
  location_id: 1,
  serial_number: "VM-CW-001",
  name: "Central World — Ground Floor",
  status: "active",
  last_restocked_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  location_name: "Central World",
  city: "Bangkok",
};

describe("MachineService", () => {
  let service: MachineService;

  beforeEach(() => {
    service = new MachineService();
  });


  describe("getAll", () => {
    it("returns all machines with no filters", async () => {
      (machineRepo.findAll as jest.Mock).mockResolvedValue([mockMachine]);

      const result = await service.getAll({});

      expect(machineRepo.findAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
      expect(result[0].serial_number).toBe("VM-CW-001");
    });

    it("passes status filter to repo", async () => {
      (machineRepo.findAll as jest.Mock).mockResolvedValue([mockMachine]);

      await service.getAll({ status: "maintenance" });

      expect(machineRepo.findAll).toHaveBeenCalledWith({ status: "maintenance" });
    });

    it("returns empty array when no machines exist", async () => {
      (machineRepo.findAll as jest.Mock).mockResolvedValue([]);

      const result = await service.getAll({});

      expect(result).toEqual([]);
    });
  });


  describe("getById", () => {
    it("returns the machine when found", async () => {
      (machineRepo.findById as jest.Mock).mockResolvedValue(mockMachine);

      const result = await service.getById(1);

      expect(machineRepo.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result.location_name).toBe("Central World");
    });

    it("throws 404 when machine does not exist", async () => {
      (machineRepo.findById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getById(999)).rejects.toThrow(new AppError("Machine not found", 404));
    });
  });


  describe("getBySerialId", () => {
    it("returns the machine when serial number is found", async () => {
      (machineRepo.findByMachineSerial as jest.Mock).mockResolvedValue(mockMachine);

      const result = await service.getBySerialId("VM-CW-001");

      expect(machineRepo.findByMachineSerial).toHaveBeenCalledWith("VM-CW-001");
      expect(result.serial_number).toBe("VM-CW-001");
    });

    it("throws 404 when serial number does not exist", async () => {
      (machineRepo.findByMachineSerial as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getBySerialId("VM-UNKNOWN")).rejects.toThrow(
        new AppError("Machine not found", 404),
      );
    });
  });
});
