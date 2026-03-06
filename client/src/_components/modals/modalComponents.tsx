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
import ShareFile from "../file/ShareFile";
import Video from "../file/stream/Video";
import DeleteSharedLink from "../share/DeleteSharedLink";
import ChangeSharedLinkPassword from "../share/ChangeSharedLinkPassword ";
import UpdateSharedLinkExpiry from "../share/UpdateSharedLinkExpiry";

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
  { name: "streamVideo", component: <Video />, size: "full" as ModalSize },
  {
    name: "shareFile",
    component: <ShareFile />,
    size: "md" as ModalSize,
  },
  {
    name: "changeSharedLinkPassword",
    component: <ChangeSharedLinkPassword />,
    size: "md" as ModalSize,
  },
  {
    name: "deleteSharedLink",
    component: <DeleteSharedLink />,
    size: "md" as ModalSize,
  },
  {
    name: "updateSharedLinkExpiry",
    component: <UpdateSharedLinkExpiry />,
    size: "md" as ModalSize,
  },
];

export default modalComponents;
