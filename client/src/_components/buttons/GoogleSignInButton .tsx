// GoogleSignInButton.tsx
import React from "react";

import { baseURL } from "../../service/axiosHelper";
import { API_BASE_URL } from "../../service/endpoints";

interface GoogleSignInButtonProps {
  className?: string;
  onSignIn?: () => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  className = "",
  onSignIn,
}) => {
  const handleGoogleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      window.location.href = `${baseURL}${API_BASE_URL}/oauth/google`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className={`group relative w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl shadow-lg bg-white text-sm font-semibold text-gray-700 hover:text-gray-900 hover:border-blue-200 hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-400/30 overflow-hidden ${className}`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Google Icon with official colors */}
      <svg
        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300"
        viewBox="0 0 24 24"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>

      {/* Text */}
      <span className="relative z-10">Sign in with Google</span>

      {/* Animated arrow */}
      <svg
        className="w-4 h-4 relative z-10 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        />
      </svg>

      {/* Shine effect - using Tailwind animation (you'll need to add this to your tailwind.config.js) */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-0 -inset-full h-full w-1/2 transform -skew-x-12  bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine"></div>
        </div>
      </div>
    </button>
  );
};

export default GoogleSignInButton;
