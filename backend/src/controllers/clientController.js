// backend/src/controllers/clientController.js
import Client from "../models/Client.js";

export const createClient = async (req, res, next) => {
  try {
    const { email } = req.body;

    let existing = null;
    if (email) {
      existing = await Client.findOne({ email });
    }

    if (existing) {
      existing.set(req.body);
      const saved = await existing.save();
      return res.status(200).json(saved);
    }

    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const { email, search } = req.query;

    if (email) {
      const client = await Client.findOne({ email });
      if (!client) return res.status(404).json({ message: "Client not found" });
      return res.json(client);
    }

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const clients = await Client.find(query).sort({ name: 1 }).limit(100);
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Client not found");
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Client not found");
    }
    res.json({ message: "Client deleted" });
  } catch (error) {
    next(error);
  }
};
