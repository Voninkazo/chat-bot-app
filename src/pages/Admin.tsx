import userStore from "../stores/userStore";
import {useNavigate} from "react-router-dom";

export const Admin = () => {
  const { user, isLoading, logout: clearUser } = userStore();
  const navigate = useNavigate(); // Optional: for redirecting


  const handleLogout = async () => {
    await clearUser();
    navigate('/');
  };

  // ProtectedRoute guarantees user is set, but TypeScript doesn't know that
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back!
        </h2>

        <div className="space-y-4 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
          </div>

          {user.full_name && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">{user.full_name}</p>
            </div>
          )}

          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Account Status</p>
            <p className="text-lg font-semibold text-green-600">
              {user.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>

          {user.oauth_provider && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Sign-in Method</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {user.oauth_provider}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};