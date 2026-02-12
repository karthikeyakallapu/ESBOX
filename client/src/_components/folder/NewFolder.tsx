import { FolderPlus } from "lucide-react";
import useModalStore from "../../store/useModal";
import useForm from "../../hooks/useForm";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";
import useFolderNavStore from "../../store/useFolderNav";
import { mutate } from "swr";
const NewFolder = () => {
  const { closeModal } = useModalStore();
  const { currentPath } = useFolderNavStore();

  const { data, handleChange, submitForm, loading } = useForm(
    {
      folder_name: "",
      parent_id: currentPath[currentPath.length - 1]?.id || null,
    },
    apiService.createFolder,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.folder_name.trim()) return;
    try {
      const response = await submitForm();

      if (data.parent_id) {
        mutate(`sub_folder_${data.parent_id}`);
      } else {
        mutate("files-and-folders");
      }

      Toast({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      Toast({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed",
      });
    }

    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex  items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <FolderPlus size={30} className="text-gray-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Create New Folder
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add a new folder to organize your files
          </p>
        </div>
      </div>

      <div className="pt-2">
        <input
          type="text"
          placeholder="Folder name"
          value={data.folder_name}
          name="folder_name"
          onChange={handleChange}
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 
                               rounded-lg transition-colors"
          onClick={closeModal}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                               hover:bg-blue-700 rounded-lg transition-colors"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default NewFolder;
