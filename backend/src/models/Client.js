// backend/src/models/Client.js
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String },
    contact: { type: String },
    email: { type: String, lowercase: true, index: true },
    gstin: { type: String },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;
