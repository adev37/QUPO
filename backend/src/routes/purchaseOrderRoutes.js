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

// /api/purchase-orders
router
  .route("/")
  // ⬇ NOW ALSO REQUIRES canCreatePurchaseOrder TO VIEW THE LIST
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

// /api/purchase-orders/:id
router
  .route("/:id")
  // ⬇ NOW ALSO REQUIRES canCreatePurchaseOrder TO VIEW SINGLE PO
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
