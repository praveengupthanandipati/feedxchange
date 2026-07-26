import { useEffect, useMemo, useState } from "react";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import Pagination from "../promoterslist/Pagination";
import { referredProfiles, type ReferredProfileRow } from "./referredProfiles.data";
import "../promoterslist/Promoters.scss";
import "./ReferredProfiles.scss";

const PAGE_SIZE = 10;

const ReferredProfiles = () => {
  const [rows] = useState<ReferredProfileRow[]>(referredProfiles);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns: TableColumn<ReferredProfileRow>[] = useMemo(
    () => [
      { key: "businessName", header: "Business Name", sortable: true },
      { key: "lineOfBusiness", header: "Line Of Business", sortable: true },
      {
        key: "registrationDate",
        header: "Registration Date",
        sortable: true,
        sortValue: (row) => row.registrationDateValue,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (row) => (
          <span
            className={`referred-profiles__status referred-profiles__status--${row.status.toLowerCase()}`}
          >
            {row.status}
          </span>
        ),
        exportValue: (row) => row.status,
      },
    ],
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.businessName} ${row.lineOfBusiness}`.toLowerCase().includes(q),
    );
  }, [rows, keyword]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const currentPageClamped = Math.min(currentPage, Math.max(totalPages, 1));
  const pagedRows = filteredRows.slice(
    (currentPageClamped - 1) * PAGE_SIZE,
    currentPageClamped * PAGE_SIZE,
  );

  return (
    <div className="referred-profiles-page">
      <div className="referred-profiles-card">
        <div className="referred-profiles-card__header">
          <h1>Referred Business Profiles</h1>
        </div>

        <input
          type="text"
          className="referred-profiles-card__search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search referred businesses..."
          aria-label="Search referred businesses"
        />

        <Table
          columns={columns}
          data={pagedRows}
          rowKey={(row) => row.id}
          emptyMessage="No referred businesses found."
          minHeight
        />

        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          totalResults={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ReferredProfiles;
