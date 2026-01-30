import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Since the backend set an httponly cookie, we don't need to read it in JS
    // We can just redirect the user to dashboard/home after login

    // Optional: add a small delay or loading message
    const timer = setTimeout(() => {
      navigate("/admin"); // or "/" depending on your app
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="felx jsutify-center items-center flex-col">
      <h2>Logging you in...</h2>
      <p>Please wait while we redirect you to your dashboard.</p>
    </div>
  );
};
