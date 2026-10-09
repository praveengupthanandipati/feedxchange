import { FiSave, FiX } from "react-icons/fi";

interface EstimationFooterProps {
  onSave: () => void;
  onCancel: () => void;
}

const EstimationFooter = ({ onSave, onCancel }: EstimationFooterProps) => (
  <div className="commission-estimations__footer">
    <button type="button" className="commission-estimations__btn commission-estimations__btn--navy commission-estimations__btn--wide" onClick={onSave}>
      <FiSave aria-hidden /> Save
    </button>
    <button type="button" className="commission-estimations__btn commission-estimations__btn--warning commission-estimations__btn--wide" onClick={onCancel}>
      <FiX aria-hidden /> Cancel
    </button>
  </div>
);

export default EstimationFooter;
