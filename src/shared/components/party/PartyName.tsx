import { useProfileCities } from "../../hooks/useProfileCities";

interface PartyNameProps {
  /** The seller's / buyer's name as the screen has it. */
  name: string | null | undefined;
  /** The profile id, when the screen has it (more reliable than the name). */
  id?: number | string | null;
  /** Shown when there is no name. */
  fallback?: string;
}

/** A seller or buyer shown as "Name, City" (the city comes from the business's profile). */
const PartyName = ({ name, id, fallback = "" }: PartyNameProps) => {
  const { label } = useProfileCities();
  if (!name?.trim()) return <>{fallback}</>;
  return <>{label(name, id)}</>;
};

export default PartyName;
