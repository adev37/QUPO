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

// /api/quotations
router
  .route("/")
  .get(protect, getQuotations)
  .post(
    protect,
    requirePermission("canCreateQuotation"),
    createQuotation
  );

// /api/quotations/:id
router
  .route("/:id")
  .get(protect, getQuotationById)
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
