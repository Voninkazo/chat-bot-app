import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import userStore from '../stores/userStore';

export const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = userStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today and get started</p>
        </div>

        <RegisterForm />

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};