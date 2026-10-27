import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "../../../../../shared/components/icon";

/** Password field with a show / hide button. Replaces Edge's built-in reveal icon so every browser looks the same. */
const PasswordInput = (props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="user-panel__password">
      <input {...props} type={visible ? "text" : "password"} />
      <button type="button" onClick={() => setVisible((prev) => !prev)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
        {visible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
      </button>
    </div>
  );
};

export default PasswordInput;
