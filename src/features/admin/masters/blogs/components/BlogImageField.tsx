import { useRef, useState, type ChangeEvent } from "react";
import { IMAGE_TYPES } from "../../banners/banners.data";
import { imageFileError, readAsDataUrl } from "../../banners/banners.utils";

interface BlogImageFieldProps {
  image: string;
  fileName: string;
  error?: string;
  onChange: (image: string, fileName: string) => void;
}

/**
 * "Choose File | No file chosen" picker with a preview once an image is picked. The native file input is
 * visually hidden and driven by a styled button, so it looks the same in every browser.
 */
const BlogImageField = ({ image, fileName, error, onChange }: BlogImageFieldProps) => {
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
    <div className="blog-panel__field">
      <span className="blog-panel__label" id="blog-image-label">
        Blog Image <span className="blog-panel__required" aria-hidden>*</span>
      </span>
      <div className="blog-panel__file">
        <button id="blog-image" type="button" onClick={() => inputRef.current?.click()} aria-describedby="blog-image-label">
          Choose File
        </button>
        <span className="blog-panel__file-name">{fileName || (image ? "Current image" : "No file chosen")}</span>
        <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(",")} onChange={handleFile} className="blog-panel__file-input" tabIndex={-1} aria-hidden />
      </div>
      {image && <img className="blog-panel__preview" src={image} alt="Selected blog" />}
      <small className="blog-panel__hint">JPG, PNG, WebP or GIF, up to 2 MB.</small>
      {message && (
        <small className="blog-panel__error" role="alert">
          {message}
        </small>
      )}
    </div>
  );
};

export default BlogImageField;
