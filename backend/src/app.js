// backend/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import salesManagerRoutes from "./routes/salesManagerRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ✅ NEW

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({ message: "Quotation & PO API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/sales-managers", salesManagerRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/users", userRoutes); // ✅ NEW

app.use(notFound);
app.use(errorHandler);

export default app;
