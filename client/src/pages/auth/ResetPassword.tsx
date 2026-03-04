import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useForm from "../../hooks/useForm";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";
import { LogoImage } from "../../_components/navigation/Logo";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [passwordReset, setPasswordReset] = useState(false);

  const { data, handleChange, submitForm, loading } = useForm(
    {
      password: "",
      confirm_password: "",
    },
    (formData) => {
      const { password } = formData;
      return apiService.resetPassword({
        token: token || "",
        new_password: password,
      });
    },
  );

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (data.password !== data.confirm_password) {
      Toast({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await submitForm();
      setPasswordReset(true);
      Toast({
        type: "success",
        message: response.message || "Password reset successfully!",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to reset password",
      });
    }
  };

  // If no token is present in URL
  if (!token) {
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
            Invalid reset link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow sm:rounded-lg">
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-red-800">
                    Please request a new password reset link.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link
                to="/forgot-password"
                className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Request new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {passwordReset ? "Password reset!" : "Set new password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {passwordReset
            ? "Your password has been reset successfully"
            : "Enter your new password below"}
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow sm:rounded-lg">
          {!passwordReset ? (
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleResetPassword}
            >
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={data.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm new password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={data.confirm_password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="••••••••"
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
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset password"
                  )}
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
                      Password reset successful! Redirecting to login...
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Go to login
                </Link>
              </div>
            </div>
          )}

          {!passwordReset && (
            <div className="mt-4 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Remember your password?
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-gray-300 rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
