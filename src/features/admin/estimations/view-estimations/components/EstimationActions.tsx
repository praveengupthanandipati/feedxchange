import { DownloadIcon, EyeIcon, SquarePenIcon, Trash2Icon } from "../../../../../shared/components/icon";
import type { Estimation } from "../viewEstimation.data";

export interface EstimationActionHandlers {
  onDownload: (estimation: Estimation) => void;
  onView: (estimation: Estimation) => void;
  onEdit: (estimation: Estimation) => void;
  onDelete: (estimation: Estimation) => void;
}

interface EstimationActionsProps extends EstimationActionHandlers {
  estimation: Estimation;
}

const EstimationActions = ({ estimation, onDownload, onView, onEdit, onDelete }: EstimationActionsProps) => {
  const actions = [
    { key: "download", label: "Download PDF", icon: DownloadIcon, onClick: onDownload },
    { key: "view", label: "View Detail", icon: EyeIcon, onClick: onView },
    { key: "edit", label: "Edit", icon: SquarePenIcon, onClick: onEdit },
    { key: "delete", label: "Delete", icon: Trash2Icon, onClick: onDelete },
  ];

  return (
    <div className="view-estimations__actions">
      {actions.map(({ key, label, icon: Icon, onClick }) => (
        <button
          key={key}
          type="button"
          className={`view-estimations__icon-btn view-estimations__icon-btn--${key}`}
          onClick={() => onClick(estimation)}
          aria-label={`${label} ${estimation.estimateNo}`}
          title={label}
        >
          <Icon aria-hidden />
        </button>
      ))}
    </div>
  );
};

export default EstimationActions;
