import SearchFiles from "../search/SearchFiles";
import type { ModalSize } from "./SpreadModal";
import PDF from "../file/stream/PDF";
import Video from "../file/stream/Video";
import Image from "../file/stream/Image";

const spreadComponents = [
  {
    name: "fileSearch",
    component: <SearchFiles />,
    size: "xl5" as ModalSize,
  },
  {
    name: "streamPDF",
    component: <PDF />,
    size: "full" as ModalSize,
  },
  { name: "streamVideo", component: <Video />, size: "full" as ModalSize },
  {
    name: "streamImage",
    component: <Image />,
    size: "full" as ModalSize,
  },
];

export default spreadComponents;
