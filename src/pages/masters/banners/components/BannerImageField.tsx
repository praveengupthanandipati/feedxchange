import { useRef, useState, type ChangeEvent } from "react";
import { FiImage } from "react-icons/fi";
import { IMAGE_TYPES } from "../banners.data";
import { imageFileError, readAsDataUrl } from "../banners.utils";

interface BannerImageFieldProps {
  image: string;
  fileName: string;
  error?: string;
  onChange: (image: string, fileName: string) => void;
}

/**
 * Preview + "Choose File | No file chosen" picker. The native file input is visually hidden and driven by
 * a styled button, so it looks the same in every browser.
 */
const BannerImageField = ({ image, fileName, error, onChange }: BannerImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");
  const message = fileError || error;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clear the input so picking the same file again still fires a change.
    event.target.value = "";
    if (!file) return;
    const problem = imageFileError(file);
    setFileError(problem);
    if (problem) return;
    try {
      onChange(await readAsDataUrl(file), file.name);
    } catch {
      setFileError("That image could not be read. Try another file.");
    }
  };

  return (
    <div className="banner-panel__field">
      <span className="banner-panel__label" id="banner-image-label">
        Banner Image <span className="banner-panel__required" aria-hidden>*</span>
      </span>
      <div className="banner-panel__preview">
        {image ? <img src={image} alt="Selected banner" /> : <FiImage aria-hidden className="banner-panel__preview-icon" />}
      </div>
      <div className="banner-panel__file">
        <button type="button" onClick={() => inputRef.current?.click()} aria-describedby="banner-image-label">
          Choose File
        </button>
        <span className="banner-panel__file-name">{fileName || (image ? "Current image" : "No file chosen")}</span>
        <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(",")} onChange={handleFile} className="banner-panel__file-input" tabIndex={-1} aria-hidden />
      </div>
      <small className="banner-panel__hint">JPG, PNG, WebP or GIF, up to 2 MB.</small>
      {message && (
        <small className="banner-panel__error" role="alert">
          {message}
        </small>
      )}
    </div>
  );
};

export default BannerImageField;
