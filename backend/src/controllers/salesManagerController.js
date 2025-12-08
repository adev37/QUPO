// backend/src/controllers/salesManagerController.js
import SalesManager from "../models/SalesManager.js";

export const createSalesManager = async (req, res, next) => {
  try {
    const { email } = req.body;

    let existing = null;
    if (email) {
      existing = await SalesManager.findOne({ email });
    }

    if (existing) {
      existing.set(req.body);
      const saved = await existing.save();
      return res.status(200).json(saved);
    }

    const manager = await SalesManager.create(req.body);
    res.status(201).json(manager);
  } catch (error) {
    next(error);
  }
};

export const getSalesManagers = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const managers = await SalesManager.find(query).sort({ name: 1 }).limit(100);
    res.json(managers);
  } catch (error) {
    next(error);
  }
};

export const getSalesManagerById = async (req, res, next) => {
  try {
    const manager = await SalesManager.findById(req.params.id);
    if (!manager) {
      res.status(404);
      throw new Error("Sales manager not found");
    }
    res.json(manager);
  } catch (error) {
    next(error);
  }
};

export const updateSalesManager = async (req, res, next) => {
  try {
    const updated = await SalesManager.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404);
      throw new Error("Sales manager not found");
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSalesManager = async (req, res, next) => {
  try {
    const deleted = await SalesManager.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Sales manager not found");
    }
    res.json({ message: "Sales manager deleted" });
  } catch (error) {
    next(error);
  }
};
