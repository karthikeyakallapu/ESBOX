import useFolderNavStore from "../../store/useFolderNav";
import type { NavFolder } from "../../types/folder";
import { useNavigate } from "react-router-dom";

const BreadCrumb = () => {
  const navigate = useNavigate();
  const { currentPath, jumpToFolder, jumpToRoot } = useFolderNavStore();
  const handleNavigate = (folder: NavFolder) => {
    jumpToFolder(folder);
    navigate(`/folders/${folder.id}`);
  };
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm flex items-center gap-1">
      <span
        className={`${currentPath.length === 0 && "text-blue-600"} underline cursor-default underline-offset-2`}
        onClick={() => {
          jumpToRoot();
          navigate("/dashboard");
        }}
      >
        Home
      </span>
      {currentPath.length > 0 && (
        <>
          {currentPath.map((folder, index) => (
            <span key={`breadcrumb-${folder.id}-${index}`}>
              {" / "}
              <span
                className={`underline cursor-default underline-offset-2  px-2 py-1 mx-0.5 rounded-xl ${index === currentPath.length - 1 && "text-blue-600"}`}
                onClick={() => handleNavigate(folder)}
              >
                {folder.name}
              </span>
            </span>
          ))}
        </>
      )}
    </div>
  );
};

export default BreadCrumb;
