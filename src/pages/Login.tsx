import { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import userStore from '../stores/userStore';

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = userStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 flex justify-center to-purple-50">
      <div className="container flex flex-col items-center justify-center">
         <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to your account</p>
        </div>

        <LoginForm />

        <div className="mt-8">
          <div className="text-gray-600 flex justify-center gap-x-2">
            <p>Don't have an account?</p>
            <button
                className="underline text-indigo-600 font-semibold"
              onClick={() => navigate('/register')}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
};