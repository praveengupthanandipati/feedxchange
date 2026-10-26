import { FiPlus } from "react-icons/fi";

interface EmptyRowsStateProps {
  onAdd: () => void;
  message?: string;
}

const EmptyRowsState = ({ onAdd, message = "No Data showing" }: EmptyRowsStateProps) => (
  <div className="empty-rows">
    <p className="empty-rows__message">{message}</p>
    <button type="button" className="empty-rows__add" onClick={onAdd}>
      <FiPlus aria-hidden /> Add
    </button>
  </div>
);

export default EmptyRowsState;
