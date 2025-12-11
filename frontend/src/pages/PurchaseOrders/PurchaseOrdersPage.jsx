// frontend/src/pages/PurchaseOrders/PurchaseOrdersPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routesConfig";
import PurchaseOrderList from "../../components/purchaseOrders/PurchaseOrderList";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const COMPANY_OPTIONS = [
  {
    code: "BRBIO",
    label: "BR Biomedical (P) Ltd.",
    subtitle: "Medical & hospital equipment",
    emoji: "🏥",
  },
  {
    code: "HANUMAN",
    label: "Hanuman HealthCare",
    subtitle: "Healthcare solutions",
    emoji: "⚕️",
  },
  {
    code: "VEGO",
    label: "Vego & Thomson Pvt Ltd",
    subtitle: "Engineering & services",
    emoji: "🏭",
  },
];

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const canPO =
    !!user?.canCreatePurchaseOrder || user?.role === "admin";

  // 🔒 page-level restriction
  if (!user || !canPO) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold mb-1">
          Purchase Orders
        </h1>
        <p className="text-sm text-red-600">
          You do not have permission to view or create purchase orders.
        </p>
      </div>
    );
  }

  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Open modal automatically if we came from Dashboard with state
  useEffect(() => {
    if (location.state?.openCompanyModal) {
      setShowCompanyModal(true);
    }
  }, [location.state]);

  const handleCreateClick = () => {
    setShowCompanyModal(true);
  };

  const handleSelectCompany = (code) => {
    setShowCompanyModal(false);
    navigate(ROUTES.POS_CREATE, {
      state: { selectedCompanyCode: code },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold mb-1">
            Purchase Orders
          </h1>
          <p className="text-sm text-slate-600">
            View, create, edit and print purchase orders.
          </p>
        </div>

        <Button
          onClick={handleCreateClick}
          className="whitespace-nowrap"
        >
          + New PO
        </Button>
      </div>

      <PurchaseOrderList />

      {/* Company select modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-slate-100">
            <h2 className="text-lg font-semibold mb-1 text-center">
              Select Company
            </h2>
            <p className="text-xs text-slate-500 text-center mb-4">
              Choose the company on whose behalf you are creating this
              purchase order.
            </p>

            <div className="grid gap-3">
              {COMPANY_OPTIONS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelectCompany(c.code)}
                  className="
                    flex items-center justify-between w-full
                    rounded-xl border border-slate-200 px-4 py-3
                    text-left text-sm bg-slate-50
                    hover:bg-blue-50 hover:border-blue-400
                    transition-all duration-150 shadow-sm hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-xl">
                      {c.emoji}
                    </div>
                    <div>
                      <div className="font-semibold">{c.label}</div>
                      <div className="text-xs text-slate-500">
                        {c.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600">
                    Use Code: {c.code}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="
                mt-5 w-full py-2.5 px-4 rounded-xl
                bg-red-500 text-white text-sm font-medium
                hover:bg-red-600 transition-colors
              "
              onClick={() => setShowCompanyModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
