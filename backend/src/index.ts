import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import machineRoutes from "./modules/machines/machines.routes";
import productRoutes from "./modules/products/products.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import cashFloatRoutes from "./modules/cashFloat/cashFloat.routes";
import transactionRoutes from "./modules/transactions/transactions.routes";
import { errorHandler } from "./shared/middleware";

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/machines", machineRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/cash-float", cashFloatRoutes);
app.use("/api/v1/transactions", transactionRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: `${req.method} ${req.path} not found` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vending API running on http://localhost:${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
