import toast from "react-hot-toast";

interface ToastProps {
  type: "success" | "error" | "loading";
  message: string;
  duration?: number;
}

const Toast = ({ type, message, duration }: ToastProps) => {
  switch (type) {
    case "success":
      toast.success(message, { duration: duration || 3000 });
      break;
    case "error":
      toast.error(message, { duration: duration || 3000 });
      break;
    case "loading":
      toast.loading(message, { duration: duration || 3000 });
      break;
    default:
      toast(message, { duration: duration || 3000 });
  }
};

export default Toast;
