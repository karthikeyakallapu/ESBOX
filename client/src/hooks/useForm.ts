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

  const resetData = () => {
    setData(initialData);
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
    } finally {
      setLoading(false);
    }
  };

  return { data, setData, submitForm, loading, handleChange, resetData };
};
export default useForm;
