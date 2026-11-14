import { useEffect, useMemo, useState } from "react";
import { PlusIcon, RefreshCwIcon, Trash2Icon, UsersIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import MultiSelect from "../../../../../shared/components/dropdown/MultiSelect";
import ConfirmDialog from "../../../../../shared/components/dialog/ConfirmDialog";
import Can from "../../../../../core/auth/Can";
import { getErrorMessage } from "../../../../../core/api/getErrorMessage";
import {
  useDelinkChildBusinessProfileMutation,
  useGetBusinessProfileSummaryQuery,
  useGetChildBusinessProfilesQuery,
  useLinkChildBusinessProfilesMutation,
  type BusinessOwner,
} from "../../../../../core/store/businessProfilesApi";
import { useProfileCities } from "../../../../../shared/hooks/useProfileCities";

interface LinkedBusinessTabProps {
  ownerId: string;
}

/** Sent as the relationship type when linking (the API takes a free text value). */
const CHILD_RELATIONSHIP = "Child";

/**
 * The businesses linked as children of this one (the parent sees its children's contracts and data; a child does not
 * see the parent's). Children are listed from the API, added with LinkChildBusinessProfiles and removed with
 * DelinkChildBusinessProfile.
 */
const LinkedBusinessTab = ({ ownerId }: LinkedBusinessTabProps) => {
  const parentProfileId = Number(ownerId);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [pendingRemove, setPendingRemove] = useState<BusinessOwner | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { label: partyLabel, cityOf } = useProfileCities();

  const {
    data: children = [],
    isLoading,
    isFetching,
    isError: childrenFailed,
    refetch,
  } = useGetChildBusinessProfilesQuery(parentProfileId, { skip: !parentProfileId, refetchOnMountOrArgChange: true });
  const { data: businesses, isError: businessesFailed } = useGetBusinessProfileSummaryQuery();
  const [linkChildren, { isLoading: linking }] = useLinkChildBusinessProfilesMutation();
  const [delinkChild, { isLoading: delinking }] = useDelinkChildBusinessProfileMutation();

  // The success note goes away after a few seconds.
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const childIds = useMemo(() => new Set(children.map((child) => child.profileId)), [children]);

  const availableOptions = useMemo(
    () =>
      (businesses ?? [])
        .filter((row) => row.profileId !== parentProfileId && !childIds.has(row.profileId) && row.status?.toLowerCase() === "active")
        .map((row) => ({ value: String(row.profileId), label: partyLabel(row.legalName, row.profileId) })),
    [businesses, parentProfileId, childIds, partyLabel],
  );

  const handleAddChildren = async () => {
    if (selectedToAdd.length === 0) return;
    setError("");
    setMessage("");
    try {
      const ok = await linkChildren({
        parentProfileId,
        relationShipType: CHILD_RELATIONSHIP,
        createdBy: Number(localStorage.getItem("userId")) || 0,
        createdOn: new Date().toISOString(),
        childProfileIds: selectedToAdd.map(Number),
      }).unwrap();
      if (ok === false) {
        setError("The businesses could not be linked. Please try again.");
        return;
      }
      setMessage(`${selectedToAdd.length} business${selectedToAdd.length === 1 ? "" : "es"} linked as child${selectedToAdd.length === 1 ? "" : "ren"}.`);
      setSelectedToAdd([]);
    } catch (err) {
      setError(getErrorMessage(err, "The businesses could not be linked. Please try again."));
    }
  };

  const confirmRemoveChild = async () => {
    const child = pendingRemove;
    setPendingRemove(null);
    if (!child) return;
    setError("");
    setMessage("");
    try {
      const ok = await delinkChild({ parentProfileId, childProfileId: child.profileId }).unwrap();
      if (ok === false) {
        setError(`${child.legalName} could not be removed. Please try again.`);
        return;
      }
      setMessage(`${child.legalName} is no longer a child of this business.`);
    } catch (err) {
      setError(getErrorMessage(err, `${child.legalName} could not be removed. Please try again.`));
    }
  };

  const columns: TableColumn<BusinessOwner>[] = [
    {
      key: "legalName",
      header: "Company Name",
      sortable: true,
      render: (row) => partyLabel(row.legalName, row.profileId),
      exportValue: (row) => row.legalName,
    },
    { key: "businessLineName", header: "Line of Business", sortable: true },
    {
      key: "businessTypeName",
      header: "Business Type",
      sortable: true,
      // Same as the Business Owners list: the business type, else the unit type.
      render: (row) => row.businessTypeName || row.businessUnitTypeName,
      sortValue: (row) => row.businessTypeName || row.businessUnitTypeName || "",
      exportValue: (row) => row.businessTypeName || row.businessUnitTypeName || "",
    },
    { key: "location", header: "City", sortable: true, render: (row) => cityOf(row.profileId), sortValue: (row) => cityOf(row.profileId) },
    { key: "mobileNumber", header: "Mobile" },
    { key: "status", header: "Status", sortable: true },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (row) => (
        <Can any={["profiles.business.manage"]}>
          <button
            type="button"
            className="business-owner-detail__icon-link business-owner-detail__icon-link--danger"
            onClick={() => setPendingRemove(row)}
            disabled={delinking}
            aria-label={`Remove ${row.legalName} as a child business`}
            title="Remove child business"
          >
            <Trash2Icon aria-hidden />
          </button>
        </Can>
      ),
    },
  ];

  return (
    <div className="business-owner-detail__tab-panel">
      <div className="business-owner-detail__section-header">
        <button
          type="button"
          className="business-owners-btn business-owners-btn--warning"
          onClick={() => {
            setError("");
            void refetch();
          }}
          disabled={isFetching}
        >
          <RefreshCwIcon aria-hidden className={isFetching ? "business-owner-detail__spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh Relationships"}
        </button>
      </div>

      <Can any={["profiles.business.manage"]}>
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
              placeholder={businessesFailed ? "The businesses could not be loaded" : "Choose child businesses..."}
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
            Select multiple businesses to make them children of this business. This business can see its children's
            contracts and data; a child cannot see this business's.
          </p>
        </section>
      </Can>

      {error && (
        <div className="alert alert-danger py-2 mb-0" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success py-2 mb-0" role="status">
          {message}
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
          <Table columns={columns} data={children} rowKey={(row) => String(row.profileId)} emptyMessage="No linked businesses." />
        </section>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove this linked business?"
        message={`${pendingRemove?.legalName ?? "This business"} will no longer be a child of this business.`}
        onConfirm={() => void confirmRemoveChild()}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
};

export default LinkedBusinessTab;
