import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// /api/purchase-orders
router
  .route("/")
  .get(protect, getPurchaseOrders)
  .post(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    createPurchaseOrder
  );

// /api/purchase-orders/:id
router
  .route("/:id")
  .get(protect, getPurchaseOrderById)
  .put(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    updatePurchaseOrder
  )
  .delete(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    deletePurchaseOrder
  );

export default router;
