// backend/src/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only admin can list users");
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Update user (permissions, role, etc.) – admin only
router.put("/:id", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only admin can update users");
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    if (!updated) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete user – admin only (optional)
router.delete("/:id", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only admin can delete users");
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
