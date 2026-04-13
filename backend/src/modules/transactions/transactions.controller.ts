import { Request, Response } from "express";
import { transactionService } from "./transactions.service";
import type { TransactionFilters } from "./transactions.types";
import type { TransactionStatus } from "../../shared/types";
import { machineService } from "../machines/machines.service";

export const TransactionController = {
  getAll: async (req: Request, res: Response) => {
    const filters: TransactionFilters = {
      machine_id: req.query.machine_id ? Number(req.query.machine_id) : undefined,
      status: req.query.status as TransactionStatus | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    };
    res.json({ success: true, data: await transactionService.getAll(filters) });
  },

  getById: async (req: Request, res: Response) => {
    res.json({ success: true, data: await transactionService.getById(Number(req.params.id)) });
  },

  purchase: async (req: Request, res: Response) => {
    const machineId = await machineService.getBySerialId(req.body.machine_serial);
    req.body.machine_id = machineId.id;
    res.status(201).json({ success: true, data: await transactionService.purchase(req.body) });
  },
};
