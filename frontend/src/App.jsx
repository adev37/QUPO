// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ROUTES } from "./config/routesConfig";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Masters
import DashboardPage from "./pages/DashboardPage";
import ItemsMasterPage from "./pages/ItemsMasterPage";
import CompaniesPage from "./pages/CompaniesPage";
import ClientsPage from "./pages/ClientsPage";
import SalesManagersPage from "./pages/SalesManagersPage";
import UsersPage from "./pages/UsersPage";

// Quotations
import QuotationsPage from "./pages/Quotations/QuotationsPage";
import QuotationCreatePage from "./pages/Quotations/QuotationCreatePage";
import QuotationEditPage from "./pages/Quotations/QuotationEditPage";
import QuotationPrintPage from "./pages/Quotations/QuotationPrintPage";

// Purchase Orders
import PurchaseOrdersPage from "./pages/PurchaseOrders/PurchaseOrdersPage";
import PurchaseOrderCreatePage from "./pages/PurchaseOrders/PurchaseOrderCreatePage";
import PurchaseOrderEditPage from "./pages/PurchaseOrders/PurchaseOrderEditPage";
import PurchaseOrderPrintPage from "./pages/PurchaseOrders/PurchaseOrderPrintPage";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      {/* Private */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Masters */}
          <Route path={ROUTES.ITEMS} element={<ItemsMasterPage />} />
          <Route path={ROUTES.COMPANIES} element={<CompaniesPage />} />
          <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
          <Route path={ROUTES.SALES_MANAGERS} element={<SalesManagersPage />} />
          <Route path={ROUTES.USERS} element={<UsersPage />} />

          {/* Quotations */}
          <Route path={ROUTES.QUOTATIONS_LIST} element={<QuotationsPage />} />
          <Route path={ROUTES.QUOTATIONS_CREATE} element={<QuotationCreatePage />} />
          <Route path={ROUTES.QUOTATIONS_EDIT} element={<QuotationEditPage />} />
          <Route path={ROUTES.QUOTATIONS_PRINT} element={<QuotationPrintPage />} />

          {/* Purchase Orders */}
          <Route path={ROUTES.POS_LIST} element={<PurchaseOrdersPage />} />
          <Route path={ROUTES.POS_CREATE} element={<PurchaseOrderCreatePage />} />
          <Route path={ROUTES.POS_EDIT} element={<PurchaseOrderEditPage />} />
          <Route path={ROUTES.POS_PRINT} element={<PurchaseOrderPrintPage />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default App;
