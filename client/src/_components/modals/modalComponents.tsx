import DeleteFolder from "../folder/DeleteFolder";
import DeleteFile from "../file/DeleteFile";
import NewFolder from "../folder/NewFolder";
import RenameFolder from "../folder/RenameFolder";
import RenameFile from "../file/RenameFile";
import UploadFile from "../file/upload/UploadFile";
import TelegramLink from "../telegram/TelegramLink";
import Image from "../file/stream/Image";

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
    name: "renameFile",
    component: <RenameFile />,
  },
  {
    name: "telegramLink",
    component: <TelegramLink />,
  },
  {
    name: "streamImage",
    component: <Image />,
  },
];

export default modalComponents;
