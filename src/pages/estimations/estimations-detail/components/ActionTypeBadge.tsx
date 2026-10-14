import type { ActionType } from "../estimationDetail.data";

const ActionTypeBadge = ({ type }: { type: ActionType }) => (
  <span className={`estimation-detail__badge estimation-detail__badge--${type.toLowerCase()}`}>{type}</span>
);

export default ActionTypeBadge;
