import { Request, Response } from "express";
import { cashFloatService } from "./cashFloat.service";

export const CashFloatController = {
  getDenominations: async (_req: Request, res: Response) => {
    res.json({ success: true, data: await cashFloatService.getAllDenominations() });
  },

  getByMachineSerial: async (req: Request, res: Response) => {
    const machineSerial = req.params.machine_serial as string;
    res.json({
      success: true,
      data: await cashFloatService.getStockByMachineSerial(machineSerial),
    });
  },

  updateQuantity: async (req: Request, res: Response) => {
    const data = await cashFloatService.updateQuantity(
      Number(req.params.machineId),
      Number(req.params.denominationId),
      req.body.quantity,
    );
    res.json({ success: true, data });
  },
};
