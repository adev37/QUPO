// backend/src/routes/salesManagerRoutes.js
import express from "express";
import {
  createSalesManager,
  getSalesManagers,
  getSalesManagerById,
  updateSalesManager,
  deleteSalesManager,
} from "../controllers/salesManagerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getSalesManagers)
  .post(protect, createSalesManager);

router
  .route("/:id")
  .get(protect, getSalesManagerById)
  .put(protect, updateSalesManager)
  .delete(protect, deleteSalesManager);

export default router;
