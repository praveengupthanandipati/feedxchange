import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiDownload, FiPlus, FiSearch, FiX } from "react-icons/fi";
import Table from "../../../components/table/Table";
import type { TableColumn } from "../../../components/table/table.types";
import RowActionsMenu from "../../../components/table/RowActionsMenu";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import Pagination from "./Pagination";
import "./Businessowners.scss";
import {
  useGetBusinessProfileSummaryQuery,
  useDeleteBusinessProfileMutation,
  type BusinessOwner,
} from "../../../store/businessProfilesApi";

const PAGE_SIZE = 10;

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export function buildFilterOptions(values: string[]) {
  const unique = Array.from(new Set(values.filter(Boolean))).sort();
  return [{ value: "All", label: "All" }, ...unique.map((value) => ({ value, label: value }))];
}

const StatusBadge = ({ status }: { status: BusinessOwner["status"] }) => (
  <span className={`business-owners__status business-owners__status--${status.toLowerCase()}`}>
    {status}
  </span>
);

interface ColumnHandlers {
  onEdit: (owner: BusinessOwner) => void;
  onDelete: (owner: BusinessOwner) => void;
}

function buildBusinessOwnerColumns({ onEdit, onDelete }: ColumnHandlers): TableColumn<BusinessOwner>[] {
  return [
    {
      key: "legalName",
      header: "Company Name",
      sortable: true,
      render: (row) => (
        <Link to={`/business-owners/${row.profileId}`} className="business-owners__link">
          {row.legalName}
        </Link>
      ),
      exportValue: (row) => row.legalName,
    },
    {
      key: "actions",
      header: "",
      render: (row) => <RowActionsMenu onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "businessTypeName",
      header: "Business Type",
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
    },
    {
      key: "mobileNumber",
      header: "Mobile Number",
      sortable: true,
      render: (row) => (
        <a href={`tel:${row.mobileNumber}`} className="business-owners__link">
          {row.mobileNumber}
        </a>
      ),
      exportValue: (row) => row.mobileNumber,
    },
    {
      key: "stateName",
      header: "State",
      sortable: true,
    },
  ];
}

interface FilterOption {
  value: string;
  label: string;
}

interface BusinessOwnersFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  businessType: string;
  onBusinessTypeChange: (value: string) => void;
  businessTypeOptions: FilterOption[];
  location: string;
  onLocationChange: (value: string) => void;
  locationOptions: FilterOption[];
  onClear: () => void;
}

const BusinessOwnersFilters = ({
  keyword,
  onKeywordChange,
  businessType,
  onBusinessTypeChange,
  businessTypeOptions,
  location,
  onLocationChange,
  locationOptions,
  onClear,
}: BusinessOwnersFiltersProps) => {
  return (
    <div className="business-owners-filters">
      <SearchableSelect
        options={businessTypeOptions}
        value={businessType}
        onChange={onBusinessTypeChange}
        placeholder="Select Business Type"
        ariaLabel="Filter by business type"
      />

      <SearchableSelect
        options={locationOptions}
        value={location}
        onChange={onLocationChange}
        placeholder="Select Location"
        ariaLabel="Filter by location"
      />

      <div className="business-owners-filters__search">
        <FiSearch aria-hidden />
        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by Company Name,Location,Mobile Number...."
        />
      </div>

      <button
        type="button"
        className="business-owners-filters__clear"
        onClick={onClear}
        title="Clear filters"
        aria-label="Clear filters"
      >
        <FiX aria-hidden />
      </button>
    </div>
  );
};

function getExportCellValue(row: BusinessOwner, column: TableColumn<BusinessOwner>): string {
  if (column.exportValue) return column.exportValue(row);
  const raw = (row as unknown as Record<string, unknown>)[column.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Businessowners = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetBusinessProfileSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteBusinessProfile] = useDeleteBusinessProfileMutation();
  const rows = useMemo(() => data ?? [], [data]);
  const [keyword, setKeyword] = useState("");
  const [businessType, setBusinessType] = useState("All");
  const [location, setLocation] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteOwner, setPendingDeleteOwner] = useState<BusinessOwner | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (owner: BusinessOwner) => {
    navigate(`edit/${owner.profileId}`);
  };

  const handleDelete = (owner: BusinessOwner) => {
    setDeleteError(null);
    setPendingDeleteOwner(owner);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteOwner) return;

    const modifiedBy = Number(localStorage.getItem("userId")) || 0;

    try {
      await deleteBusinessProfile({
        profileId: pendingDeleteOwner.profileId,
        modifiedOn: new Date().toISOString(),
        modifiedBy,
      }).unwrap();
      setPendingDeleteOwner(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete business owner.");
    }
  };

  const columns = useMemo(
    () => buildBusinessOwnerColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const businessTypeOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.businessTypeName)),
    [rows],
  );

  const locationOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => row.location)),
    [rows],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, businessType, location]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      if (businessType !== "All" && row.businessTypeName !== businessType) return false;
      if (location !== "All" && row.location !== location) return false;

      if (q) {
        const haystack = [row.stateName, row.legalName, row.mobileNumber]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, keyword, businessType, location]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  const handleClearFilters = () => {
    setKeyword("");
    setBusinessType("All");
    setLocation("All");
  };

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");
    const headerRow = exportColumns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("");
    const bodyRows = filteredRows
      .map((row) => {
        const cells = exportColumns
          .map((column) => `<td>${escapeHtml(getExportCellValue(row, column))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "business-owners.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="business-owners-page">
      <div className="business-owners-card">
        <div className="business-owners-card__header">
          <h1>Business Owners</h1>
          <div className="business-owners-card__actions">
            <button
              type="button"
              className="business-owners-btn business-owners-btn--outline"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--warning"
              onClick={handleExport}
            >
              <FiDownload aria-hidden /> Export
            </button>
            <button
              type="button"
              className="business-owners-btn business-owners-btn--primary"
              onClick={() => navigate("new")}
            >
              <FiPlus aria-hidden /> New
            </button>
          </div>
        </div>

        {filtersVisible && (
          <BusinessOwnersFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            businessType={businessType}
            onBusinessTypeChange={setBusinessType}
            businessTypeOptions={businessTypeOptions}
            location={location}
            onLocationChange={setLocation}
            locationOptions={locationOptions}
            onClear={handleClearFilters}
          />
        )}

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => String(row.profileId)}
          emptyMessage={
            isLoading
              ? "Loading business owners…"
              : error
                ? "Failed to load business owners."
                : "No business owners match the current filters."
          }
        />

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        open={pendingDeleteOwner !== null}
        title="Remove this business owner?"
        message={
          deleteError ||
          `This will permanently delete "${pendingDeleteOwner?.legalName}". This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteOwner(null)}
      />
    </div>
  );
};

export default Businessowners;
