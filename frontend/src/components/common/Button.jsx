// frontend/src/components/common/Button.jsx
import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded border";

  const variants = {
    primary:
      "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700",
    secondary:
      "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
    danger:
      "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700",
    ghost:
      "bg-transparent text-slate-700 border-transparent hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
