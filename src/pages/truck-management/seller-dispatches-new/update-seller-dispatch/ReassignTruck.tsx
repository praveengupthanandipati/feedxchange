import { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiSave } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import DetailSection from "./DetailSection";
import {
  reassignContext,
  reassignContractRows,
  type ReassignContractRow,
} from "./reassignTruck.data";

const ReassignTruck = () => {
  const rows = reassignContractRows;
  const truck = reassignContext;

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => rows.map((row) => row.id));
  const [qtyById, setQtyById] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, String(row.assignableQty)])),
  );
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const toggleRow = (id: string) =>
    setSelectedKeys((prev) => (prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]));

  const toggleAll = (checked: boolean) => setSelectedKeys(checked ? rows.map((row) => row.id) : []);

  const qtyInput = (row: ReassignContractRow) => (
    <input
      type="number"
      min={0}
      max={row.pendingQty}
      inputMode="decimal"
      className="reassign__qty-input"
      value={qtyById[row.id] ?? ""}
      onChange={(event) => setQtyById((prev) => ({ ...prev, [row.id]: event.target.value }))}
      aria-label={`Assignable quantity for ${row.seller}`}
    />
  );

  const handleSave = () => {
    const selected = rows.filter((row) => selectedKeys.includes(row.id));
    const qtyOf = (row: ReassignContractRow) => Number(qtyById[row.id] || 0);
    const total = selected.reduce((sum, row) => sum + qtyOf(row), 0);

    let error = "";
    if (selected.length === 0) error = "Select at least one contract.";
    else if (selected.some((row) => qtyOf(row) < 0)) error = "Assignable Qty cannot be negative.";
    else if (total === 0) error = "Enter an Assignable Qty for at least one selected contract.";
    else if (selected.some((row) => qtyOf(row) > row.pendingQty))
      error = "Assignable Qty cannot be more than the contract's Pending Qty.";
    else if (total > truck.qty) error = `Total Assignable Qty (${total} MT) is more than the truck's ${truck.qty} MT.`;

    // TODO: send the reassignment to the API once the endpoint is available.
    setMessage(error ? { type: "error", text: error } : { type: "success", text: `Assigned ${total} MT across ${selected.filter((row) => qtyOf(row) > 0).length} contract(s).` });
  };

  const columns: TableColumn<ReassignContractRow>[] = [
    { key: "date", header: "Date", sortable: true },
    { key: "seller", header: "Seller", sortable: true },
    { key: "qty", header: "Qty", sortable: true, render: (row) => `${row.qty} MT` },
    {
      key: "pendingQty",
      header: "Pending Qty",
      sortable: true,
      render: (row) => <span className="reassign__pending">{row.pendingQty} MT</span>,
    },
    { key: "scheduleStart", header: "D. Schedule Start", headerTooltip: "Delivery Schedule Start", sortable: true },
    { key: "scheduleEnd", header: "D. Schedule End", headerTooltip: "Delivery Schedule End", sortable: true },
    {
      key: "assignableQty",
      header: "Assignable Qty",
      sortable: true,
      sortValue: (row) => Number(qtyById[row.id] || 0),
      render: qtyInput,
    },
  ];

  return (
    <DetailSection
      title="Reassign Truck to Pending Contracts"
      subtitle={
        <>
          <span>
            {truck.buyer} for {truck.product} as Buyer
          </span>
          <span>
            Truck No: <strong>{truck.truckNo}</strong>
          </span>
          <span>
            Qty <strong>{truck.qty}MT</strong>
          </span>
        </>
      }
    >
      <div className="reassign">
        <div className="reassign__toolbar">
          {message && (
            <p className={`reassign__message reassign__message--${message.type}`} role="status">
              {message.type === "error" ? <FiAlertCircle aria-hidden /> : <FiCheckCircle aria-hidden />}
              {message.text}
            </p>
          )}
          <button type="button" className="do-info__btn do-info__btn--primary reassign__save" onClick={handleSave}>
            <FiSave aria-hidden /> Save
          </button>
        </div>

        <div className="reassign__table-view">
          <Table
            columns={columns}
            data={rows}
            rowKey={(row) => row.id}
            selectable
            selectedRowKeys={selectedKeys}
            onSelectRow={toggleRow}
            onSelectAll={toggleAll}
            emptyMessage="No pending contracts available for reassignment."
          />
        </div>

        <ul className="reassign__cards">
          {rows.map((row) => (
            <li key={row.id} className="reassign__card">
              <label className="reassign__card-top">
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(row.id)}
                  onChange={() => toggleRow(row.id)}
                />
                <strong>{row.seller}</strong>
                <span>{row.date}</span>
              </label>
              <dl>
                <div>
                  <dt>Qty</dt>
                  <dd>{row.qty} MT</dd>
                </div>
                <div>
                  <dt>Pending Qty</dt>
                  <dd className="reassign__pending">{row.pendingQty} MT</dd>
                </div>
                <div>
                  <dt>D. Schedule Start</dt>
                  <dd>{row.scheduleStart}</dd>
                </div>
                <div>
                  <dt>D. Schedule End</dt>
                  <dd>{row.scheduleEnd}</dd>
                </div>
                <div className="reassign__full">
                  <dt>Assignable Qty</dt>
                  <dd>{qtyInput(row)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </DetailSection>
  );
};

export default ReassignTruck;
