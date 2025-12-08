import React from "react";
import SignupForm from "../../components/auth/SignupForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex bg-slate-950">
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
          <p>Create users with appropriate roles.</p>
          <p>Control access to quotations &amp; POs.</p>
        </div>
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} Q &amp; P System
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="bg-white shadow-lg rounded-xl px-6 py-6 w-full max-w-md border border-slate-200">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
