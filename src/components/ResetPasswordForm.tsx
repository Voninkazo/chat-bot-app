import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./Button";
import { PasswordInput } from "./PasswordInput";

const API_URL = import.meta.env.VITE_API_URL;

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const validatePassword = (password: string): string => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  return "";
};

const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string => {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
};

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFormErrors((prev) => ({
      ...prev,
      password: validatePassword(value) || undefined,
      // Re-validate confirm too if already touched
      confirmPassword: confirmPassword
        ? validateConfirmPassword(value, confirmPassword) || undefined
        : prev.confirmPassword,
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setFormErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, value) || undefined,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors: FormErrors = {
      password: validatePassword(password) || undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) || undefined,
    };

    if (errors.password || errors.confirmPassword) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data: { detail?: string } = await response.json();

      if (!response.ok) {
        setError(data.detail ?? "Reset failed");
        return;
      }

      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-600">
        Invalid reset link. Please request a new one.
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <PasswordInput
            value={password}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
            className={formErrors.password ? "border-red-400" : ""}
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            placeholder="••••••••"
            className={formErrors.confirmPassword ? "border-red-400" : ""}
          />
          {formErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </>
  );
};
