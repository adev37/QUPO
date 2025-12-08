import React from "react";

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
  placeholder = "Select...",
  ...rest
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-800 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
