import userStore, { User } from "../stores/userStore";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleIcon } from "./GoogleIcon";
import { Button } from "./Button";
import { Input } from "./Input";
import { PasswordInput } from "./PasswordInput";
import { redirectToGoogleLogin } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

interface FormErrors {
  email?: string;
  password?: string;
}

const validateEmail = (email: string): string => {
  if (!email) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return "Enter a valid email address.";
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) return "Password is required.";
  return "";
};

const validate = (formData: {
  email: string;
  password: string;
}): FormErrors => {
  return {
    email: validateEmail(formData.email) || undefined,
    password: validatePassword(formData.password) || undefined,
  };
};

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { setUser } = userStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/chat";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");

    // Clear field-level error on change
    if (name === "email")
      setFormErrors((prev) => ({
        ...prev,
        email: validateEmail(value) || undefined,
      }));
    if (name === "password")
      setFormErrors((prev) => ({
        ...prev,
        password: validatePassword(value) || undefined,
      }));
  };

  const handleUserLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validate(formData);
    if (errors.email || errors.password) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: { user?: User; detail?: string } = await response.json();

      if (!response.ok) {
        setError(data.detail ?? "Login failed");
        return;
      }

      if (data.user) setUser(data.user);

      setSuccess("Login successful!");
      setFormData({ email: "", password: "", fullName: "" });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleUserLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="you@example.com"
            className={formErrors.email ? "border-red-400" : ""}
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="••••••••"
            className={formErrors.password ? "border-red-400" : ""}
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div className="text-right mt-1">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Login"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={redirectToGoogleLogin}
        className="mt-4 w-full flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        <span>Sign in with Google</span>
      </Button>
    </>
  );
};
