// backend/src/helpers/autoNumberHelper.js
import AutoNumber from "../models/AutoNumber.js";

export const getNextNumber = async (type) => {
  const doc = await AutoNumber.findOneAndUpdate(
    { type },
    { $inc: { lastNumber: 1 } },
    { new: true, upsert: true }
  );
  return doc.lastNumber;
};
