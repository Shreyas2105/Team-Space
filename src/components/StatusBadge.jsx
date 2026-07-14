const STATUS_LABELS = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "In Review",
  done: "Done",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const StatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;

  return <span className={`status-badge status-${status}`}>{label}</span>;
};

export default StatusBadge;
