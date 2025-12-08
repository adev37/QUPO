import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // ✅ only this is mandatory
    description: { type: String, required: true, trim: true },

    model: { type: String },
    hsn: { type: String },
    unit: { type: String, default: "PCS" },

    // ⬇ no longer required
    price: { type: Number, default: 0 }, // base price (optional)
    gst: { type: Number, default: 0 },   // GST % (optional)
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
