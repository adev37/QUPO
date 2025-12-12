// frontend/src/pages/quotations/QuotationsPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QuotationList from "../../components/quotations/QuotationList";
import Button from "../../components/common/Button";
import { ROUTES } from "../../config/routesConfig";
import { COMPANY_CONFIGS } from "../../config/companyConfig";
import { useAuth } from "../../hooks/useAuth";

const QuotationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const canQuotation = !!user?.canCreateQuotation || user?.role === "admin";

  // 🔒 page-level restriction
  if (!user || !canQuotation) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold mb-1">Quotations</h1>
        <p className="text-sm text-red-600">
          You do not have permission to view or create quotations. Please
          contact your admin.
        </p>
      </div>
    );
  }

  const [showCompanySelector, setShowCompanySelector] = useState(false);

  // if we came from Dashboard with a request to open the selector
  useEffect(() => {
    if (location.state?.openCompanySelector) {
      setShowCompanySelector(true);
    }
  }, [location.state]);

  // companies list (decorated)
  const companies = useMemo(() => {
    const baseArray = Object.values(COMPANY_CONFIGS || {});

    const emojiMap = {
      BRBIO: "🏥",
      HANUMAN: "⚕️",
      VEGO: "🏭",
    };

    const subtitleMap = {
      BRBIO: "Medical & hospital equipment",
      HANUMAN: "Healthcare solutions",
      VEGO: "Engineering & services",
    };

    return baseArray.map((c) => ({
      ...c,
      emoji: emojiMap[c.code] || "🏢",
      subtitle: subtitleMap[c.code] || "Business documents",
    }));
  }, []);

  const handleSelectCompany = (company) => {
    setShowCompanySelector(false);

    navigate(ROUTES.QUOTATIONS_CREATE + `?company=${company.code}`, {
      state: { selectedCompanyCode: company.code },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header (responsive like your other pages) */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-semibold mb-1">Quotations</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            List, create, edit and print quotations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCompanySelector(true)}
          className="whitespace-nowrap"
        >
          + New Quotation
        </Button>
      </div>

      {/* Company selector modal (mobile-friendly) */}
      {showCompanySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-center">
                Select Company
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 text-center mt-1">
                Choose the company on whose behalf you are creating this
                quotation.
              </p>
            </div>

            <div className="p-4 sm:p-6 max-h-[70vh] overflow-auto">
              <div className="grid gap-3">
                {companies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCompany(c)}
                    className="
                      flex items-center justify-between w-full
                      rounded-xl border border-slate-200 px-4 py-3
                      text-left text-sm bg-slate-50
                      hover:bg-blue-50 hover:border-blue-400
                      transition-all duration-150 shadow-sm hover:shadow-md
                    "
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200 text-xl">
                        {c.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {c.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="hidden sm:inline text-[11px] font-semibold text-blue-600">
                      Code: {c.code}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCompanySelector(false)}
                className="
                  mt-5 w-full py-2.5 px-4 rounded-xl
                  bg-red-500 text-white text-sm font-medium
                  hover:bg-red-600 transition-colors
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <QuotationList />
    </div>
  );
};

export default QuotationsPage;
