import DeleteFolder from "../folder/DeleteFolder";
import DeleteFile from "../file/DeleteFile";
import NewFolder from "../folder/NewFolder";
import RenameFolder from "../folder/RenameFolder";
import UploadFile from "../file/upload/UploadFile";
import TelegramLink from "../telegram/TelegramLink";

const modalComponents = [
  {
    name: "deleteFolder",
    component: <DeleteFolder />,
  },
  {
    name: "deleteFile",
    component: <DeleteFile />,
  },
  {
    name: "newFolder",
    component: <NewFolder />,
  },
  {
    name: "renameFolder",
    component: <RenameFolder />,
  },
  {
    name: "uploadFile",
    component: <UploadFile />,
  },
  {
    name: "telegramLink",
    component: <TelegramLink />,
  },
];

export default modalComponents;
