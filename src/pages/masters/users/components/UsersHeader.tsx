import { FiPlus } from "react-icons/fi";

interface UsersHeaderProps {
  business: string;
  onNew: () => void;
}

const UsersHeader = ({ business, onNew }: UsersHeaderProps) => (
  <div className="users__header">
    <div>
      <h1>Master Users</h1>
      <p className="users__business">
        <strong>Business:</strong> {business || "—"}
      </p>
    </div>
    <button type="button" className="users__btn users__btn--navy" onClick={onNew}>
      <FiPlus aria-hidden /> New
    </button>
  </div>
);

export default UsersHeader;
