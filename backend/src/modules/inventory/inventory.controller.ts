import { Request, Response } from "express";
import { inventoryService } from "./inventory.service";

export const InventoryController = {
  getByMachine: async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: await inventoryService.getByMachine(Number(req.params.machineId)),
    });
  },



};
