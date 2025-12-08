import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  className = "",
  ...rest
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-800 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        {...rest}
      />
    </div>
  );
};

export default Input;
