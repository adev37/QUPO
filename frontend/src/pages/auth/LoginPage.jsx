// frontend/src/pages/auth/LoginPage.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../services/authApi";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth(); // our auth helper

  const onSubmit = async (values) => {
    try {
      // data = { _id, name, email, role, canCreateQuotation, canCreatePurchaseOrder, token }
      const data = await loginMutation(values).unwrap();

      // store full user (with permissions) + token in Redux/localStorage
      login(data);
    } catch (err) {
      console.error("Login failed", err);
      alert(
        err?.data?.message || "Login failed. Please check email/password."
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex-col justify-between p-8">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            Quotations &amp; POs
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Business Documents Console
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p>• Maintain item, company &amp; client masters</p>
          <p>• Generate quotations with GST &amp; features block</p>
          <p>• Create purchase orders in a single click</p>
        </div>
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} Q &amp; P System
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg rounded-xl px-6 py-6 w-full max-w-sm space-y-4 border border-slate-200"
        >
          <div className="text-center mb-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500">
              Enter your email &amp; password to continue.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              {...register("email", { required: true })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              {...register("password", { required: true })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
