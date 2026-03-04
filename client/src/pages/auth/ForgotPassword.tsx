import useForm from "../../hooks/useForm";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";
import { Link } from "react-router-dom";
import { LogoImage } from "../../_components/navigation/Logo";
import { useState } from "react";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { data, handleChange, submitForm, loading } = useForm(
    { email: "" },
    apiService.forgotPassword, // Assuming you have this method in apiService
  );

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitForm();
      setEmailSent(true);
      Toast({
        type: "success",
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to send reset link",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <LogoImage
            innerHeight={9}
            innerWidth={9}
            outerHeight={16}
            outerWidth={16}
          />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-4 sm:px-0">
          {!emailSent
            ? "Enter your email address and we'll send you a link to reset your password"
            : "Check your email for the password reset link"}
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow sm:rounded-lg">
          {!emailSent ? (
            <form className="space-y-4 sm:space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={handleChange}
                    required
                    className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send reset link"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-md bg-green-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-green-800">
                      Reset link sent! Check your email.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-gray-300 rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or go back to
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 sm:py-2 px-2 sm:px-4 border border-gray-300 rounded-lg sm:rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-center"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="w-full flex justify-center py-2.5 sm:py-2 px-2 sm:px-4 border border-gray-300 rounded-lg sm:rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;