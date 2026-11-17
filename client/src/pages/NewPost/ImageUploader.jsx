import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaTrash, FaImage } from "react-icons/fa";

const ImageUploader = ({ images, setImages }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image.`);
        return false;
      }

      if (file.size > 32 * 1024 * 1024) {
        alert(`${file.name} is larger than 32MB.`);
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

    if (!apiKey) {
      alert("ImgBB API key is missing!");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        setImages((prev) => [...prev, result.data.url]);

        return result.data.url;
      });

      const results = await Promise.allSettled(uploadPromises);

      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedCount > 0) {
        alert(
          `${validFiles.length - failedCount} uploaded successfully. ${failedCount} failed.`,
        );
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Something went wrong while uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploading) return;

    uploadImages({
      target: {
        files: e.dataTransfer.files,
        value: "",
      },
    });
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center min-h-52 px-5 py-8 text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
            : "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400"
        } ${uploading ? "opacity-60 cursor-wait" : ""}`}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm text-emerald-500 text-3xl mb-4 transition-transform duration-300 hover:scale-110">
          {uploading ? (
            <span className="w-7 h-7 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></span>
          ) : (
            <FaCloudUploadAlt />
          )}
        </div>

        <h4 className="text-sm font-bold text-gray-700">
          {uploading ? "Uploading your images..." : "Drop your images here"}
        </h4>

        <p className="text-xs text-gray-400 mt-2">
          or click to browse from your device
        </p>

        <span className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-100">
          <FaImage />
          Choose images
        </span>

        <p className="text-[10px] text-gray-400 mt-3">
          JPG, PNG, JPEG • Maximum 32MB per image
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={uploadImages}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Please wait while your images are uploading...
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700">Uploaded images</h4>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              {images.length} image(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 animate-[fadeIn_0.35s_ease]"
              >
                <img
                  src={image}
                  alt={`Uploaded item ${index + 1}`}
                  className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-600 transition-all duration-300"
                  aria-label="Remove image"
                >
                  <FaTrash size={12} />
                </button>

                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-[9px] backdrop-blur-sm">
                  Image {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
