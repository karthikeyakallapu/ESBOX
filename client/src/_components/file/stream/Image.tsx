import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import apiService from "../../../service/apiService";
import useModalStore from "../../../store/useModal";

interface ModalData {
  file_id: string | number;
  [key: string]: unknown;
}

const Image = () => {
  const { data } = useModalStore();

  const file_id =
    data && typeof data === "object" && "file_id" in data
      ? (data as ModalData).file_id
      : null;

  const {
    data: imageBlob,
    error,
    isLoading,
  } = useSWR<Blob>(
    file_id ? `image_data_${file_id}` : null,
    () => apiService.streamFile(file_id as string | number)
  );

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageBlob) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageBlob);
    setImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageBlob]);

  const handleImageError = useCallback(() => {
    setImageUrl(null);
  }, []);

  if (!file_id) {
    return null;
  }

  return (
    <div className="image-container">
      {isLoading && (
        <div className="loading-state" role="status" aria-label="Loading">
          Loading...
        </div>
      )}

      {error && (
        <div className="error-state" role="alert">
          Error loading image
        </div>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Streamed content"
          className="max-w-full h-auto rounded-lg"
          onError={handleImageError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default Image;
