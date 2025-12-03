// frontend/src/components/common/AutocompleteInput.jsx
import React, { useState } from "react";

const AutocompleteInput = ({
  label,
  value,
  onChange,
  suggestions = [],
  getOptionLabel = (opt) => opt.label ?? opt.name ?? "",
  onSelectOption,
  placeholder = "",
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (opt) => {
    setOpen(false);
    onSelectOption?.(opt);
  };

  return (
    <div className="mb-3 relative">
      {label && (
        <label className="block text-xs font-medium text-slate-800 mb-1">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => {
          onChange(e);
          setOpen(true);
        }}
        placeholder={placeholder}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => setOpen(true)}
        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {open && suggestions?.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-white border border-slate-200 rounded shadow-sm text-xs text-slate-800">
          {suggestions.map((opt) => (
            <button
              key={opt._id || getOptionLabel(opt)}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              className="w-full text-left px-2 py-1 hover:bg-slate-100"
            >
              {getOptionLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
