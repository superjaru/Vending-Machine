import { Router } from "express";
import { body, param } from "express-validator";
import { asyncHandler, validate } from "../../shared/middleware";
import { LocationController } from "./locations.controller";

const router = Router();

router.get("/", asyncHandler(LocationController.getAll));

router.get("/:id", param("id").isInt(), validate, asyncHandler(LocationController.getById));

router.post(
  "/",
  body("name").notEmpty().trim(),
  body("address").optional().trim(),
  body("city").optional().trim(),
  validate,
  asyncHandler(LocationController.create),
);

router.patch(
  "/:id",
  param("id").isInt(),
  body("name").optional().notEmpty().trim(),
  body("address").optional().trim(),
  body("city").optional().trim(),
  body("is_active").optional().isBoolean(),
  validate,
  asyncHandler(LocationController.update),
);

router.delete("/:id", param("id").isInt(), validate, asyncHandler(LocationController.deactivate));

export default router;
