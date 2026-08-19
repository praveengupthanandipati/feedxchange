import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SUCCESS_MESSAGE_STORAGE_KEY = "successMessage";

export function useSuccessToast() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  const showSuccessMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    const incomingMessage =
      (location.state as { successMessage?: string } | null)?.successMessage ??
      localStorage.getItem(SUCCESS_MESSAGE_STORAGE_KEY);

    if (incomingMessage) {
      localStorage.removeItem(SUCCESS_MESSAGE_STORAGE_KEY);
      showSuccessMessage(incomingMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return { message, showSuccessMessage };
}