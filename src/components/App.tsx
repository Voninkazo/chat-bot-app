import userStore from "../stores/userStore";
import { Loading } from "./Loading";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import {useEffect, useState} from "react";
import {ChatBot} from "./ChatBot";
import {useNavigate} from "react-router-dom"; // Import your Zustand store

export default function App() {
  const { isAuthenticated, isLoading, user, initializeAuth, handleOAuthCallback } = userStore();
  const [view, setView] = useState('login'); // 'login' or 'register'
  const { navigate } = useNavigate();

  console.log('User state:', user);

  useEffect(() => {
    // Check if we're returning from Google OAuth
    const checkAuth = async () => {
      const wasOAuthCallback = await handleOAuthCallback();

      // If not OAuth callback, initialize normally
      if (!wasOAuthCallback) {
        await initializeAuth();
      }
    };

    checkAuth().then();
  }, []);

   if (isLoading) {
    return <Loading />;
  }

   if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {view === 'login'
                ? 'Sign in to continue to your account'
                : 'Join us today and get started'}
            </p>
          </div>

          {view === 'login' ? <LoginForm /> : <RegisterForm />}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline transition"
              >
                {view === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

   return <ChatBot />;

}
