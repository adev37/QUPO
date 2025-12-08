// backend/src/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      canCreateQuotation,
      canCreatePurchaseOrder,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // 👉 Count how many users exist
    const userCount = await User.countDocuments();

    let safeRole = "user";

    if (userCount === 0) {
      // ✅ FIRST USER: allow admin (for setup)
      safeRole = role === "admin" ? "admin" : role || "admin";
    } else {
      // ✅ Next users from public signup are always normal users
      safeRole = "user";
    }

    const isAdmin = safeRole === "admin";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      // Admins get both permissions by default
      canCreateQuotation: isAdmin ? true : !!canCreateQuotation,
      canCreatePurchaseOrder: isAdmin ? true : !!canCreatePurchaseOrder,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      canCreateQuotation: user.canCreateQuotation,
      canCreatePurchaseOrder: user.canCreatePurchaseOrder,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      canCreateQuotation: user.canCreateQuotation,
      canCreatePurchaseOrder: user.canCreatePurchaseOrder,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
