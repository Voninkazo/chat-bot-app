import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleIcon } from "./GoogleIcon";
import { Input } from "./Input";
import { Button } from "./Button";
import { redirectToGoogleLogin } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
}

const validateEmail = (email: string): string => {
  if (!email) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return "Enter a valid email address.";
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return "";
};

const validateFullName = (fullName: string): string => {
  if (!fullName.trim()) return "Full name is required.";
  if (fullName.trim().length < 2) return "Full name must be at least 2 characters.";
  if (!/^[a-zA-Z\s'-]+$/.test(fullName)) return "Full name contains invalid characters.";
  return "";
};

const validate = (formData: { email: string; password: string; fullName: string }): FormErrors => {
  return {
    email: validateEmail(formData.email) || undefined,
    password: validatePassword(formData.password) || undefined,
    fullName: validateFullName(formData.fullName) || undefined,
  };
};

export const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validators: Record<string, (v: string) => string> = {
    email: validateEmail,
    password: validatePassword,
    fullName: validateFullName,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");

    // Real-time per-field validation
    const validator = validators[name];
    if (validator) {
      setFormErrors((prev) => ({ ...prev, [name]: validator(value) || undefined }));
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const errors = validate(formData);
    if (errors.email || errors.password || errors.fullName) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
        }),
      });

      const data: { detail?: string } = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail ?? "Registration failed");
        return;
      }

      setSuccessMessage("Registration successful! Redirecting to login...");
      setFormData({ email: "", password: "", fullName: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Register failed:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className={formErrors.email ? "border-red-400" : ""}
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className={formErrors.password ? "border-red-400" : ""}
          />
          {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <Input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={formErrors.fullName ? "border-red-400" : ""}
          />
          {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Register"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={redirectToGoogleLogin}
        className="mt-4 w-full flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        <span>Sign up with Google</span>
      </Button>
    </>
  );
};