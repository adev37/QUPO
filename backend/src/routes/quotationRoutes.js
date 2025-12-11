// backend/src/routes/quotationRoutes.js
import express from "express";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, requirePermission("canCreateQuotation"), getQuotations)
  .post(
    protect,
    requirePermission("canCreateQuotation"),
    createQuotation
  );

router
  .route("/:id")
  .get(
    protect,
    requirePermission("canCreateQuotation"),
    getQuotationById
  )
  .put(
    protect,
    requirePermission("canCreateQuotation"),
    updateQuotation
  )
  .delete(
    protect,
    requirePermission("canCreateQuotation"),
    deleteQuotation
  );

export default router;
