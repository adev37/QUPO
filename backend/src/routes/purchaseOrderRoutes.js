// backend/src/routes/purchaseOrderRoutes.js
import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getPurchaseOrders)
  .post(protect, createPurchaseOrder);

router
  .route("/:id")
  .get(protect, getPurchaseOrderById)
  .put(protect, updatePurchaseOrder)
  .delete(protect, deletePurchaseOrder);

export default router;
