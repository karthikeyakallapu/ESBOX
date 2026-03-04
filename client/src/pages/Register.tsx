import useForm from "../hooks/useForm";
import apiService from "../service/apiService";
import type { GenericMessage } from "../types/common";
import Toast from "../utils/Toast";
import { Link } from "react-router-dom";
import { LogoImage } from "../_components/navigation/Logo";
import GoogleSignInButton from "../_components/buttons/GoogleSignInButton ";

const Register = () => {
  const { data, handleChange, submitForm, loading } = useForm(
    {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    apiService.registerUser,
  );

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (data.password !== data.confirm_password) {
        alert("Passwords do not match!");
        return;
      }
      const result: GenericMessage = await submitForm();
      Toast({
        type: "success",
        message: result.message,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      Toast({
        type: "error",
        message,
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow sm:rounded-lg">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleRegister}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={data.username}
                  required
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                  value={data.password}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  value={data.confirm_password}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 mb-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <GoogleSignInButton />
          </div>

          {/* Resend Verification Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Didn't receive verification email?{" "}
              <Link
                to="/resend-verification"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Resend verification
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;