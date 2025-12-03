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

const router = express.Router();

router
  .route("/")
  .get(protect, getQuotations)
  .post(protect, createQuotation);

router
  .route("/:id")
  .get(protect, getQuotationById)
  .put(protect, updateQuotation)
  .delete(protect, deleteQuotation);

export default router;
