import { useMemo, useState } from "react";
import { FiRefreshCw, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import MultiSelect from "../../../../components/dropdown/MultiSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import { businessOwners, type BusinessOwner } from "../BusinessList/businessOwners.data";

interface LinkedBusinessTabProps {
  ownerId: string;
}

const LinkedBusinessTab = ({ ownerId }: LinkedBusinessTabProps) => {
  const [childIds, setChildIds] = useState<string[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const availableOptions = useMemo(
    () =>
      businessOwners
        .filter((row) => row.id !== ownerId && !childIds.includes(row.id))
        .map((row) => ({ value: row.id, label: row.companyName })),
    [ownerId, childIds],
  );

  const children = useMemo(
    () => businessOwners.filter((row) => childIds.includes(row.id)),
    [childIds],
  );

  const handleAddChildren = () => {
    if (selectedToAdd.length === 0) return;
    setChildIds((prev) => [...prev, ...selectedToAdd]);
    setSelectedToAdd([]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 600);
  };

  const confirmRemoveChild = () => {
    setChildIds((prev) => prev.filter((id) => id !== pendingRemoveId));
    setPendingRemoveId(null);
  };

  const columns: TableColumn<BusinessOwner>[] = [
    { key: "companyName", header: "Company Name", sortable: true },
    { key: "businessType", header: "Business Type", sortable: true },
    { key: "location", header: "Location", sortable: true },
    { key: "mobile", header: "Mobile" },
    { key: "state", header: "State", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (row) => (
        <button
          type="button"
          className="business-owner-detail__icon-link business-owner-detail__icon-link--danger"
          onClick={() => setPendingRemoveId(row.id)}
          aria-label={`Remove ${row.companyName} as a child business`}
          title="Remove child business"
        >
          <FiTrash2 aria-hidden />
        </button>
      ),
    },
  ];

  return (
    <div className="business-owner-detail__tab-panel">
      <div className="business-owner-detail__section-header">
        <button
          type="button"
          className="business-owners-btn business-owners-btn--warning"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FiRefreshCw aria-hidden className={refreshing ? "business-owner-detail__spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Relationships"}
        </button>
      </div>

      <section className="business-owner-detail__linked-card">
        <h3>
          <FiUsers aria-hidden /> Add Child Businesses
        </h3>
        <span className="business-owner-detail__label">Select Child Businesses</span>
        <div className="business-owner-detail__linked-controls">
          <MultiSelect
            options={availableOptions}
            value={selectedToAdd}
            onChange={setSelectedToAdd}
            placeholder="Choose child businesses..."
            ariaLabel="Select Child Businesses"
          />
          <button
            type="button"
            className="business-owners-btn business-owners-btn--primary"
            onClick={handleAddChildren}
            disabled={selectedToAdd.length === 0}
          >
            <FiPlus aria-hidden /> Add Children
          </button>
        </div>
        <p className="business-owner-detail__hint">
          Select multiple businesses to make them children of this business. Once you have children, this
          business cannot become a child of another business.
        </p>
      </section>

      {children.length === 0 ? (
        <div className="business-owner-detail__notice">
          No child businesses are linked to this profile yet.
        </div>
      ) : (
        <section className="business-owner-detail__section">
          <h2 className="business-owner-detail__section-title">Linked Child Businesses</h2>
          <Table columns={columns} data={children} rowKey={(row) => row.id} emptyMessage="No linked businesses." />
        </section>
      )}

      <ConfirmDialog
        open={pendingRemoveId !== null}
        title="Remove this linked business?"
        message="This will remove the child relationship with this business. This cannot be undone."
        onConfirm={confirmRemoveChild}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
};

export default LinkedBusinessTab;
