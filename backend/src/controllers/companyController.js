// backend/src/controllers/companyController.js
import Company from "../models/Company.js";

export const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error("Company not found");
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Company not found");
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Company not found");
    }
    res.json({ message: "Company deleted" });
  } catch (error) {
    next(error);
  }
};
