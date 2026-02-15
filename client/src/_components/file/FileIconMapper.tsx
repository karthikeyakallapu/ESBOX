import PDF from "../../../assets/pdf.svg";
import FILE from "../../../assets/file.svg";
import IMAGE from "../../../assets/image.svg";
import MP3 from "../../../assets/mp3.svg";
import MP4 from "../../../assets/mp4.svg";
import ZIP from "../../../assets/zip.svg";

const mapping: Record<string, string> = {
  "application/pdf": PDF,
  "video/mp4": MP4,
  "audio/mpeg": MP3,
  "image/jpeg": IMAGE,
  "image/png": IMAGE,
  "application/zip": ZIP,
};

const FileIconMapper = (mimeType: string): string => {
  return mapping[mimeType] ?? FILE;
};

export default FileIconMapper;
