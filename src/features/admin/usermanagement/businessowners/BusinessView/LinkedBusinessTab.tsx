import { useEffect, useMemo, useState } from "react";
import { PlusIcon, RefreshCwIcon, Trash2Icon, UsersIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import MultiSelect from "../../../../../shared/components/dropdown/MultiSelect";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import {
  useDelinkChildBusinessProfileMutation,
  useGetBusinessProfileSummaryQuery,
  useGetChildBusinessProfilesQuery,
  useLinkChildBusinessProfilesMutation,
} from "../../../../../core/store/businessProfilesApi";
import type { ChildBusiness } from "../../../../../core/store/businessProfilesApi";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";

interface LinkedBusinessTabProps {
  ownerId: string;
}

/** The relationship type this screen links with; the server decides which types it accepts. */
const CHILD_RELATIONSHIP = "Child";

const nameOf = (row: { legalName?: string | null; tradingName?: string | null }) => row.legalName || row.tradingName || "—";

const LinkedBusinessTab = ({ ownerId }: LinkedBusinessTabProps) => {
  const parentProfileId = Number(ownerId);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [pendingRemove, setPendingRemove] = useState<ChildBusiness | null>(null);
  const [error, setError] = useState("");

  const { data: allBusinesses = [] } = useGetBusinessProfileSummaryQuery();
  const { data: children = [], isFetching, refetch } = useGetChildBusinessProfilesQuery(parentProfileId, { skip: !Number.isFinite(parentProfileId) });
  const [linkChildren, { isLoading: linking }] = useLinkChildBusinessProfilesMutation();
  const [delinkChild, { isLoading: delinking }] = useDelinkChildBusinessProfileMutation();

  // Everything the server would accept is offered; the server still enforces the rules (own child, one parent, a parent cannot become a child).
  const availableOptions = useMemo(() => {
    const linked = new Set(children.map((child) => child.profileId));
    return allBusinesses
      .filter((row) => row.profileId !== parentProfileId && !linked.has(row.profileId) && row.status !== "Deleted")
      .map((row) => ({ value: String(row.profileId), label: nameOf(row) }));
  }, [allBusinesses, children, parentProfileId]);

  const handleAddChildren = async () => {
    if (selectedToAdd.length === 0) return;
    setError("");
    try {
      await linkChildren({
        parentProfileId,
        relationShipType: CHILD_RELATIONSHIP,
        createdBy: Number(localStorage.getItem("userId")) || 0,
        createdOn: new Date().toISOString(),
        childProfileIds: selectedToAdd.map(Number),
      }).unwrap();
      setSelectedToAdd([]);
    } catch (err) {
      // the server's message says which rule blocked the link
      setError(getErrorMessage(err, "The businesses could not be linked. Please try again."));
    }
  };

  const confirmRemoveChild = async () => {
    const child = pendingRemove;
    setPendingRemove(null);
    if (!child) return;
    setError("");
    try {
      await delinkChild({ parentProfileId, childProfileId: child.profileId }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err, "The business could not be removed. Please try again."));
    }
  };

  const columns: TableColumn<ChildBusiness>[] = [
    { key: "legalName", header: "Company Name", sortable: true, render: (row) => nameOf(row) },
    { key: "businessTypeName", header: "Business Type", sortable: true },
    { key: "businessSubTypeName", header: "Sub Type", sortable: true },
    { key: "mobileNumber", header: "Mobile" },
    { key: "status", header: "Status", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (row) => (
        <button
          type="button"
          className="business-owner-detail__icon-link business-owner-detail__icon-link--danger"
          onClick={() => setPendingRemove(row)}
          disabled={delinking}
          aria-label={`Remove ${nameOf(row)} as a child business`}
          title="Remove child business"
        >
          <Trash2Icon aria-hidden />
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
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon aria-hidden className={isFetching ? "business-owner-detail__spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh Relationships"}
        </button>
      </div>

      <section className="business-owner-detail__linked-card">
        <h3>
          <UsersIcon aria-hidden /> Add Child Businesses
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
            onClick={() => void handleAddChildren()}
            disabled={selectedToAdd.length === 0 || linking}
          >
            <PlusIcon aria-hidden /> {linking ? "Adding..." : "Add Children"}
          </button>
        </div>
        <p className="business-owner-detail__hint">
          Select multiple businesses to make them children of this business. A business cannot be its own child, a child
          can have only one parent, and once a business has children it cannot become a child of another business. A
          parent can see its children's contracts, invoices and payments; a child cannot see its parent's.
        </p>
        {error && (
          <p className="business-owner-detail__hint" role="alert" style={{ color: "var(--fx-red-49-fg)" }}>
            {error}
          </p>
        )}
      </section>

      {children.length === 0 ? (
        <div className="business-owner-detail__notice">
          No child businesses are linked to this profile yet.
        </div>
      )}

      {isLoading ? (
        <div className="business-owner-detail__notice">Loading linked businesses…</div>
      ) : childrenFailed ? (
        <div className="business-owner-detail__notice">The linked businesses could not be loaded. Please use Refresh Relationships to try again.</div>
      ) : children.length === 0 ? (
        <div className="business-owner-detail__notice">No child businesses are linked to this profile yet.</div>
      ) : (
        <section className="business-owner-detail__section">
          <h2 className="business-owner-detail__section-title">Linked Child Businesses</h2>
          <Table columns={columns} data={children} rowKey={(row) => String(row.profileRelationshipId)} emptyMessage="No linked businesses." />
        </section>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove this linked business?"
        message="This will remove the child relationship with this business. It can be linked again later."
        onConfirm={() => void confirmRemoveChild()}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
};

export default LinkedBusinessTab;
