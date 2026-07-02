import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "./Input";
import { Button } from "./Button";

const API_URL = import.meta.env.VITE_API_URL;

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data: { message?: string; detail?: string } = await response.json();

    if (!response.ok) {
      toast.error(data.detail ?? "Something went wrong");
      return;
    }

    toast.success(data.message ?? "Check your email for reset instructions.");
    setEmail("");

  } catch (error) {
    console.error("Forgot password request failed:", error);
    toast.error("Something went wrong. Please try again.");
  }

  setLoading(false);
};

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </>
  );
};