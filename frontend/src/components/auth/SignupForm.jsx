// frontend/src/components/auth/SignupForm.jsx
import React, { useState } from "react";
import { useRegisterMutation } from "../../services/authApi";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { Link, useNavigate } from "react-router-dom";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
];

const SignupForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerMutation(form).unwrap();
      // ✅ After successful signup, go to login page
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded shadow-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Create Account</h1>

      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
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
        <Select
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={roles}
        />

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Creating..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-slate-600 text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-600 hover:underline font-medium"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
