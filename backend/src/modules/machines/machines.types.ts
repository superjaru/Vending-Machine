import type { MachineStatus } from "../../shared/types";

export interface CreateMachineDto {
  location_id: number;
  serial_number: string;
  name?: string;
}

export interface UpdateMachineDto {
  location_id?: number;
  name?: string;
  status?: MachineStatus;
  last_restocked_at?: string;
}

export interface MachineFilters {
  location_id?: number;
  status?: MachineStatus;
}
