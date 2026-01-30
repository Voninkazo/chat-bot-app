const API_URL = import.meta.env.VITE_API_URL;

export function redirectToGoogleLogin () {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google/login`;
  }