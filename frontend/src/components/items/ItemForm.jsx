// frontend/src/components/items/ItemForm.jsx
import React, { useEffect, useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const initialState = {
  description: "",
  model: "",
  companyName: "",
  unit: "",
  hsn: "",
  gst: "",
  price: "",
};

const units = ["Nos", "Set", "Pair", "Pack", "Box", "PCS"];

const ItemForm = ({ onSubmit, onCancel, initialItem, submitting }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (initialItem) {
      setForm({
        description: initialItem.description || "",
        model: initialItem.model || "",
        companyName: initialItem.companyName || "",
        unit: initialItem.unit || "",
        hsn: initialItem.hsn || "",
        gst: initialItem.gst != null ? String(initialItem.gst) : "",
        price: initialItem.price != null ? String(initialItem.price) : "",
        _id: initialItem._id,
      });
    } else {
      setForm(initialState);
    }
  }, [initialItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      // optional on UI; backend can still treat as required if needed
      price: form.price ? Number(form.price) : 0,
      gst: form.gst ? Number(form.gst) : 0,
    };

    onSubmit?.(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <Input
        label="Item Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        required // ✅ only this field is mandatory
        className="md:col-span-2"
      />
      <Input
        label="Model / Part No."
        name="model"
        value={form.model}
        onChange={handleChange}
      />
      <Input
        label="Company / Make (optional)"
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
      />
      <Select
        label="Unit"
        name="unit"
        value={form.unit}
        onChange={handleChange}
        options={units.map((u) => ({ label: u, value: u }))}
      />
      <Input
        label="Base Price"
        name="price"
        type="number"
        min="0"
        step="0.01"
        value={form.price}
        onChange={handleChange}
        // ❌ no required here
      />
      <Input
        label="GST %"
        name="gst"
        type="number"
        min="0"
        step="0.1"
        value={form.gst}
        onChange={handleChange}
      />
      <Input
        label="HSN Code"
        name="hsn"
        value={form.hsn}
        onChange={handleChange}
      />

      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Item"}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
