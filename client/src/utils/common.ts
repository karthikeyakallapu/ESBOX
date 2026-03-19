const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const handleOverflowText = (text: string, limit = 50) => {
  if (!text) return "";

  return text.length > limit ? text.slice(0, limit) + "..." : text;
};
export { formatFileSize, handleOverflowText };
