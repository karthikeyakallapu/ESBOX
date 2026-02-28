import DeleteFolder from "../folder/DeleteFolder";
import DeleteFile from "../file/DeleteFile";
import NewFolder from "../folder/NewFolder";
import RenameFolder from "../folder/RenameFolder";
import RenameFile from "../file/RenameFile";
import UploadFile from "../file/upload/UploadFile";
import TelegramLink from "../telegram/TelegramLink";
import Image from "../file/stream/Image";
import type { ModalSize } from "./StorageOptionModal";
import PDF from "../file/stream/PDF";
import Video from "../file/stream/Video";

const modalComponents = [
  {
    name: "deleteFolder",
    component: <DeleteFolder />,
    size: "md" as ModalSize,
  },
  {
    name: "deleteFile",
    component: <DeleteFile />,
    size: "md" as ModalSize,
  },
  {
    name: "newFolder",
    component: <NewFolder />,
    size: "md" as ModalSize,
  },
  {
    name: "renameFolder",
    component: <RenameFolder />,
    size: "md" as ModalSize,
  },
  {
    name: "uploadFile",
    component: <UploadFile />,
    size: "md" as ModalSize,
  },
  {
    name: "renameFile",
    component: <RenameFile />,
    size: "md" as ModalSize,
  },
  {
    name: "telegramLink",
    component: <TelegramLink />,
    size: "md" as ModalSize,
  },
  {
    name: "streamImage",
    component: <Image />,
    size: "full" as ModalSize,
  },
  {
    name: "streamPDF",
    component: <PDF />,
    size: "full" as ModalSize,
  },
  { name: "streamVideo", 
    component: <Video />, 
    size: "full" as ModalSize 
  }
];

export default modalComponents;
