import { AppError } from "../../shared/middleware";
import { machineRepo } from "./machines.repo";
import type { CreateMachineDto, UpdateMachineDto, MachineFilters } from "./machines.types";

export class MachineService {
  getAll(filters: MachineFilters) {
    return machineRepo.findAll(filters);
  }

  async getById(id: number) {
    const row = await machineRepo.findById(id);
    if (!row) throw new AppError("Machine not found", 404);
    return row;
  }

  async getBySerialId(serialId: string) {
    const row = await machineRepo.findByMachineSerial(serialId);
    if (!row) throw new AppError("Machine not found", 404);
    return row;
  }

  create(dto: CreateMachineDto) {
    return machineRepo.create(dto);
  }

  async update(id: number, dto: UpdateMachineDto) {
    const row = await machineRepo.update(id, dto);
    if (!row) throw new AppError("Machine not found", 404);
    return row;
  }
}

export const machineService = new MachineService();
