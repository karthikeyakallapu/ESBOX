import type { UserFolder } from "../../types/folder";

const Folder = ({ folder }: { folder: UserFolder }) => {
  return (
    <div className="hover:bg-slate-200 bg-slate-50 p-4 m-2 flex flex-col items-center justify-center rounded shadow-sm w-48 text-center">
      <img src="./assets/folder.svg" className="h-24 w-24" alt="" />
      <p>{folder.name}</p>
    </div>
  );
};

export default Folder;
