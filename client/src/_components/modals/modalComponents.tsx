import DeleteFolder from "../folder/DeleteFolder";
import DeleteFile from "../file/DeleteFile";
import NewFolder from "../folder/NewFolder";
import RenameFolder from "../folder/RenameFolder";
import RenameFile from "../file/RenameFile";
import UploadFile from "../file/upload/UploadFile";
import TelegramLink from "../telegram/TelegramLink";
import type { ModalSize } from "./StorageOptionModal";
import ShareFile from "../file/ShareFile";
import DeleteSharedLink from "../share/DeleteSharedLink";
import ChangeSharedLinkPassword from "../share/ChangeSharedLinkPassword ";
import UnSupported from "../file/stream/UnSupported";
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
  {
    name: "unSupported",
    component: <UnSupported />,
    size: "md" as ModalSize,
  },
];

export default modalComponents;
