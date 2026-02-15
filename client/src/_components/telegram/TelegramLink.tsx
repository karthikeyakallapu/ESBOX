import useForm from "../../hooks/useForm";
import apiService from "../../service/apiService";
import { useState } from "react";
import Toast from "../../utils/Toast";
import useModalStore from "../../store/useModal";

const TelegramLink = () => {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { closeModal } = useModalStore();

  const { data, handleChange, loading, submitForm, resetData } = useForm(
    { phone: "", code: "" },
    showCodeInput ? apiService.verifyTelegramCode : apiService.sendTelegramCode,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await submitForm();

      if (response.success) {
        if (showCodeInput) {
          Toast({ type: "success", message: response.message });
          closeModal();
        }
        Toast({ type: "success", message: response.message });
        setShowCodeInput((prev) => !prev);
      } else {
        Toast({
          type: "error",
          message: response.error || "An error occurred",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      if (showCodeInput) {
        Toast({
          type: "error",
          message: error instanceof Error ? error.message : "An error occurred",
        });
        closeModal();
      } else {
        Toast({
          type: "error",
          message: error instanceof Error ? error.message : "An error occurred",
        });
        resetData();
      }
    }
  };

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="https://cdn.simpleicons.org/telegram/27A7E7"
            alt="Telegram"
            className="w-16 h-16 mx-auto mb-4"
            draggable={false}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Telegram
          </h1>
          {showCodeInput ? (
            <p className="text-gray-600">
              Enter the code sent to your Telegram.
            </p>
          ) : (
            <p className="text-gray-600">
              Enter your phone number to get the code
            </p>
          )}
        </div>

        {showCodeInput ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <div className="mb-6">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                value={data.code}
                onChange={handleChange}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <div className="mb-6">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={data.phone}
                onChange={handleChange}
                placeholder="+91 999 999 9999"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Telegram Code"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TelegramLink;
