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
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    getPurchaseOrders
  )
  .post(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    createPurchaseOrder
  );

router
  .route("/:id")
  .get(
    protect,
    requirePermission("canCreatePurchaseOrder"),
    getPurchaseOrderById
  )
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
