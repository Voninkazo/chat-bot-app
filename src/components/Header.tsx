import React from "react";
import { Link, useNavigate } from "react-router-dom";
import userStore from "../stores/userStore";

export const Header = () => {
  const { isAuthenticated, user, logout } = userStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          ChatBot
        </Link>
        
        <nav>
          <ul className="flex space-x-6 items-center">
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/chat"
                    className="transition-colors duration-300 hover:text-yellow-300"
                  >
                    Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="transition-colors duration-300 hover:text-yellow-300"
                  >
                    Admin
                  </Link>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-sm">Welcome, {user?.full_name || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="transition-colors duration-300 hover:text-yellow-300"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
