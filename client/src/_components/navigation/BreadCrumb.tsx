import useFolderNavStore from "../../store/useFolderNav";
import type { NavFolder } from "../../types/folder";
import { useNavigate } from "react-router-dom";
import { Home, ChevronRight, Folder } from "lucide-react";

const BreadCrumb = () => {
  const navigate = useNavigate();
  const { currentPath, jumpToFolder, jumpToRoot } = useFolderNavStore();

  const handleNavigate = (folder: NavFolder) => {
    jumpToFolder(folder);
    navigate(`/folders/${folder.id}`);
  };

  return (
    <nav
      className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1">
        {/* Home */}
        <li>
          <button
            onClick={() => {
              jumpToRoot();
              navigate("/dashboard");
            }}
            className={`group flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
              currentPath.length === 0
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Home
              size={16}
              className={`transition-transform group-hover:scale-110 ${
                currentPath.length === 0 ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                currentPath.length === 0 ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Home
            </span>
          </button>
        </li>

        {/* Path Separator and Folders */}
        {currentPath.map((folder, index) => (
          <li
            key={`breadcrumb-${folder.id}-${index}`}
            className="flex items-center"
          >
            {/* Separator */}
            <ChevronRight
              size={14}
              className="mx-1 text-gray-300"
              aria-hidden="true"
            />

            {/* Folder */}
            <button
              onClick={() => handleNavigate(folder)}
              className={`group flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                index === currentPath.length - 1
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Folder
                size={14}
                className={`transition-transform group-hover:scale-110 ${
                  index === currentPath.length - 1
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  index === currentPath.length - 1
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {folder.name}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadCrumb;
