import { useState } from "react";

const useForm = <TData, TResult = unknown>(
  initialData: TData,
  action: (data: TData) => TResult | Promise<TResult>,
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      const result = await action(data);
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  return { data, setData, submitForm, loading, handleChange };
};
export default useForm;
