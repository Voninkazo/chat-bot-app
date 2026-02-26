import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h1>
      <ForgotPasswordForm />
    </div>
  </div>
);