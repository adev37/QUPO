// backend/src/controllers/itemController.js
import Item from "../models/Item.js";

export const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { description: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ],
      };
    }

    const items = await Item.find(query).sort({ description: 1 }).limit(100);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Item not found");
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Item not found");
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Item not found");
    }
    res.json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};
