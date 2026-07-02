import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-200 select-none">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Button type="button" onClick={() => navigate("/")}>
          Go back home
        </Button>
      </div>
    </div>
  );
};
