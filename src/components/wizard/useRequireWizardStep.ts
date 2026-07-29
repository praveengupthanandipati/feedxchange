import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirects to `fallbackPath` whenever `unlocked` is false — used to gate a
// wizard step that only makes sense once an earlier step has been completed.
export const useRequireWizardStep = (unlocked: boolean, fallbackPath: string) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!unlocked) {
      navigate(fallbackPath, { replace: true });
    }
  }, [unlocked, navigate, fallbackPath]);

  return unlocked;
};
