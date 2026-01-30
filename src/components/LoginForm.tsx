import userStore from "../stores/userStore";
import {useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {GoogleIcon} from "./GoogleIcon";
import {Button} from "./Button";
import {Input} from "./Input";
import {redirectToGoogleLogin} from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { setUser } = userStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/chat";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

   const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important! Allows cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Cookie is automatically set! Just update the store with user data
      console.log('data::', data);
      setUser(data.user);
      setSuccess('Login successful!');
      setFormData({ email: '', password: '', fullName: '' });
      
      // Redirect to the intended page or default to /chat
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

       <form onSubmit={handleUserLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : "Login"}
          </Button>
        </form>

        <Button
            type="button"
            variant="outline"
            onClick={redirectToGoogleLogin}
            className="mt-4 w-full flex items-center justify-center gap-3"
          >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </Button>
        </>
  )
}