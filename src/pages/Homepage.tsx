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
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Natural Conversations</h3>
            <p className="text-gray-600">Chat naturally with our AI assistant</p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your conversations are encrypted and private</p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Get instant responses to your queries</p>
          </div>
        </div>
      </div>
    </div>
  );
};
