import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "selectedContractNumber";

interface SelectedContractContextValue {
  selectedContract: string | null;
  setSelectedContract: (contractNumber: string | null) => void;
}

const SelectedContractContext = createContext<SelectedContractContextValue | undefined>(undefined);

function readStoredContract(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const SelectedContractProvider = ({ children }: { children: ReactNode }) => {
  const [selectedContract, setSelectedContractState] = useState<string | null>(readStoredContract);

  const setSelectedContract = useCallback((contractNumber: string | null) => {
    setSelectedContractState((prev) => {
      if (prev === contractNumber) return prev;
      try {
        if (contractNumber) sessionStorage.setItem(STORAGE_KEY, contractNumber);
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // sessionStorage unavailable (private browsing, etc.) — in-memory state still works.
      }
      return contractNumber;
    });
  }, []);

  const value = useMemo(
    () => ({ selectedContract, setSelectedContract }),
    [selectedContract, setSelectedContract],
  );

  return <SelectedContractContext.Provider value={value}>{children}</SelectedContractContext.Provider>;
};

export function useSelectedContract() {
  const ctx = useContext(SelectedContractContext);
  if (!ctx) {
    throw new Error("useSelectedContract must be used within a SelectedContractProvider");
  }
  return ctx;
}
