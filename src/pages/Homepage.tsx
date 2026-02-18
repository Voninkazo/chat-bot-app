import React from 'react';
import { useNavigate } from 'react-router-dom';
import userStore from '../stores/userStore';

export const Homepage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = userStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            Welcome to ChatBot
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-powered conversations. Sign in to get started with your personal chat assistant.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-indigo-600"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
