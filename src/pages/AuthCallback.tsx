import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userStore from "../stores/userStore";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { initializeAuth, isAuthenticated } = userStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeAuth(); // read cookie from backend
      setLoading(false);

      if (isAuthenticated) {
        navigate("/admin"); // or dashboard
      } else {
        navigate("/login"); // fallback if session invalid
      }
    };

    init().then();
  }, [initializeAuth, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-col h-screen">
        <h2>Logging you in...</h2>
        <p>Please wait while we redirect you to your dashboard.</p>
      </div>
    );
  }

  return null; // after navigation, component unmounts
};
