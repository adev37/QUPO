// frontend/src/components/auth/LoginForm.jsx
import React, { useState } from "react";
import { useLoginMutation } from "../../services/authApi";
import { useAuth } from "../../hooks/useAuth";
import Input from "../common/Input";
import Button from "../common/Button";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginMutation(form).unwrap();
      // data = { _id, name, email, role, token }
      login(data); // stores token + user and navigates to "/"
    } catch (err) {
      setError(err?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded shadow-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Quotation &amp; PO – Login</h1>

      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-slate-600 text-center">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="text-indigo-600 hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
