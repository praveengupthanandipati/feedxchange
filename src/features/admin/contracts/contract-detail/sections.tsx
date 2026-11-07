import type {
  ContractFullConditions,
  ContractFullDetails,
  ContractFullParty,
} from "../../../../core/store/contractsApi";
import { date, dateTime, humanize, money, num, percent, qty, text, travelTime } from "./format";
import { Card, Empty, Field, FieldGrid, Pill, StatusPill, TableWrap } from "./ui";

/** One panel per tab of the contract detail page. Each takes the whole details object and reads what it needs. */

type Props = { d: ContractFullDetails };

/* ------------------------------------------------------------------ Overview */

const ConditionsCard = ({ title, c }: { title: string; c: ContractFullConditions }) => (
  <Card title={title}>
    <FieldGrid>
      <Field label="Commission" value={num(c.commission)} />
      <Field label="Delivery Schedule" value={humanize(c.deliverySchedule)} />
      {c.specificDays ? <Field label="Specific Days" value={c.specificDays} /> : null}
      <Field label="From" value={date(c.fromDate)} />
      <Field label="To" value={date(c.toDate)} />
      <Field label="Quality Spec Source" value={text(c.qualitySpecSource)} />
      <Field label="Remarks / Special Conditions" value={text(c.remarksSpecialConditions)} wide />
    </FieldGrid>
  </Card>
);

export const OverviewTab = ({ d }: Props) => {
  const o = d.overview;
  const sym = o.currencySymbol;
  const t = d.paymentTerms;
  return (
    <div className="cd-stack">
      <Card title="Commercial Terms">
        <FieldGrid>
          <Field label="Product" value={text(o.productName)} />
          <Field label="SKU" value={text(o.productSku)} />
          <Field label="Total Quantity" value={qty(o.totalQuantityMT)} />
          <Field label="Min / Max Quantity" value={`${qty(o.minQuantityMT)} / ${qty(o.maxQuantityMT)}`} />
          <Field label="PO Tolerance" value={percent(o.tolerancePercentage)} />
          <Field label="Contract Rate (per MT)" value={money(o.pricePerMT, sym)} />
          <Field label="GST" value={`${percent(o.gstPercentage)}${o.gstDetails ? ` · ${o.gstDetails}` : ""}`} />
          <Field label="GST per MT" value={money(o.gstAmountPerMT, sym)} />
          <Field label="Net Rate (per MT)" value={money(o.netRatePerMT, sym)} />
          <Field label="Currency" value={text(o.currencyCode)} />
          {o.productDescription ? <Field label="Product Description" value={o.productDescription} wide /> : null}
        </FieldGrid>
      </Card>

      <Card title="Delivery & Validity">
        <FieldGrid>
          <Field label="Delivery Type" value={text(o.deliveryType)} />
          <Field label="Approx. Travel Time" value={travelTime(o.approxTravelDays, o.approxTravelHours)} />
          <Field label="Effective From" value={date(o.effectiveFrom)} />
          <Field label="Effective To" value={date(o.effectiveTo)} />
          <Field label="Contract Date" value={date(o.contractDate)} />
          <Field label="Approval Required" value={o.approvalRequired ? "Yes" : "No"} />
          <Field label="Loading Address (Seller)" value={text(d.seller.contractAddress?.fullAddress)} wide />
          <Field label="Delivery Address (Buyer)" value={text(d.buyer.contractAddress?.fullAddress)} wide />
          {o.remarks ? <Field label="Remarks" value={o.remarks} wide /> : null}
        </FieldGrid>
      </Card>

      <Card title="Payment Terms">
        {t ? (
          <FieldGrid>
            <Field label="Payment Terms" value={text(t.paymentTermName)} />
            <Field label="Payment Before" value={date(t.paymentBeforeDate)} />
            <Field label="Seller Payment Due" value={t.sellerPaymentDueDays != null ? `${t.sellerPaymentDueDays} days` : "—"} />
            <Field label="Buyer Payment Due" value={t.buyerPaymentDueDays != null ? `${t.buyerPaymentDueDays} days` : "—"} />
            <Field label="Immediate Advance" value={`${percent(t.immediateAdvancePercentage)} · ${date(t.immediateAdvanceDate)}`} />
            <Field label="Balance Advance" value={`${percent(t.balanceAdvancePercentage)} · ${date(t.balanceAdvanceDate)}`} />
            {t.remarks ? <Field label="Remarks" value={t.remarks} wide /> : null}
          </FieldGrid>
        ) : (
          <Empty>No payment terms recorded for this contract.</Empty>
        )}
      </Card>

      <div className="cd-two">
        <ConditionsCard title="Seller Conditions" c={d.sellerConditions} />
        <ConditionsCard title="Buyer Conditions" c={d.buyerConditions} />
      </div>

      <Card title="Record">
        <FieldGrid>
          <Field label="Created By" value={text(o.createdByName ?? (o.createdBy ? `User #${o.createdBy}` : null))} />
          <Field label="Created On" value={dateTime(o.createdOn)} />
          <Field label="Last Modified By" value={text(o.modifiedByName ?? (o.modifiedBy ? `User #${o.modifiedBy}` : null))} />
          <Field label="Last Modified On" value={dateTime(o.modifiedOn)} />
        </FieldGrid>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ Parties */

const PartyCard = ({ role, p, addressLabel }: { role: string; p: ContractFullParty; addressLabel: string }) => (
  <Card
    title={
      <>
        {role}: {text(p.legalName)}
      </>
    }
    action={p.status ? <StatusPill status={p.status} /> : undefined}
  >
    <FieldGrid>
      <Field label="Trading Name" value={text(p.tradingName)} />
      <Field label="Profile Type" value={text(p.profileType)} />
      <Field label="GST Number" value={text(p.gstNumber)} />
      <Field label="PAN" value={text(p.panNumber)} />
      <Field label="Mobile" value={text(p.mobileNumber)} />
      <Field label="Alternate Contact" value={text(p.alternativeContactNumber)} />
      <Field label="Email" value={text(p.emailId)} wide />
      <Field label={addressLabel} value={text(p.contractAddress?.fullAddress)} wide />
      {p.contractAddress?.googleLocationUrl ? (
        <Field
          label="Map"
          value={
            <a href={p.contractAddress.googleLocationUrl} target="_blank" rel="noopener noreferrer">
              Open location
            </a>
          }
        />
      ) : null}
    </FieldGrid>

    <h3 className="cd-subtitle">Contacts</h3>
    {p.contacts.length === 0 ? (
      <Empty>No contacts on file.</Empty>
    ) : (
      <TableWrap>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Mobile</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {p.contacts.map((c, i) => (
            <tr key={i}>
              <td>
                {text(c.contactPerson)}
                {c.isUnloadingContact && <Pill tone="info">Unloading</Pill>}
              </td>
              <td>{[c.contactType, c.designation].filter(Boolean).join(" · ") || "—"}</td>
              <td>{text(c.mobileNumber)}</td>
              <td>{text(c.emailId)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    )}

    <h3 className="cd-subtitle">Bank Accounts</h3>
    {p.bankAccounts.length === 0 ? (
      <Empty>No bank accounts on file.</Empty>
    ) : (
      <TableWrap>
        <thead>
          <tr>
            <th>Bank</th>
            <th>Account</th>
            <th>IFSC</th>
            <th>Holder</th>
          </tr>
        </thead>
        <tbody>
          {p.bankAccounts.map((b) => (
            <tr key={b.bankAccountId}>
              <td>
                {text(b.bankName)}
                {b.isPrimary && <Pill tone="success">Primary</Pill>}
                {b.branchName && <div className="cd-muted">{b.branchName}</div>}
              </td>
              <td>
                {text(b.accountNumberMasked)}
                {b.accountType && <div className="cd-muted">{b.accountType}</div>}
              </td>
              <td>{text(b.ifscCode)}</td>
              <td>{text(b.accountHolderName)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    )}
  </Card>
);

export const PartiesTab = ({ d }: Props) => (
  <div className="cd-two">
    <PartyCard role="Seller" p={d.seller} addressLabel="Loading Address (this contract)" />
    <PartyCard role="Buyer" p={d.buyer} addressLabel="Delivery Address (this contract)" />
  </div>
);

/* ------------------------------------------------------------------ Quality */

const SpecTable = ({ c }: { c: ContractFullConditions }) =>
  c.qualitySpecifications.length === 0 ? (
    <Empty>No quality specifications recorded{c.qualitySpecSource ? ` (source: ${c.qualitySpecSource})` : ""}.</Empty>
  ) : (
    <TableWrap>
      <thead>
        <tr>
          <th>Parameter</th>
          <th className="cd-num">Min</th>
          <th className="cd-num">Max</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {c.qualitySpecifications.map((s, i) => (
          <tr key={i}>
            <td>{text(s.parameter)}</td>
            <td className="cd-num">{num(s.minValue)}</td>
            <td className="cd-num">{num(s.maxValue)}</td>
            <td>{text(s.unit)}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );

export const QualityTab = ({ d }: Props) => (
  <div className="cd-two">
    <Card title={`Seller Quality Specifications · ${text(d.seller.legalName)}`}>
      <SpecTable c={d.sellerConditions} />
    </Card>
    <Card title={`Buyer Quality Specifications · ${text(d.buyer.legalName)}`}>
      <SpecTable c={d.buyerConditions} />
    </Card>
  </div>
);

/* ------------------------------------------------------------------ Trucks */

export const TrucksTab = ({ d }: Props) => {
  const s = d.summary;
  return (
    <div className="cd-stack">
      <Card
        title="Trucks Assigned"
        action={
          <span className="cd-muted">
            {s.truckCount} total · {s.trucksAssigned} assigned · {s.trucksLoaded} loaded · {s.trucksCancelled} cancelled
          </span>
        }
      >
        {d.trucks.length === 0 ? (
          <Empty>No trucks have been assigned to this contract yet.</Empty>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Truck</th>
                <th>Driver</th>
                <th>Transporter</th>
                <th>LR No.</th>
                <th>Assigned On</th>
                <th className="cd-num">Qty</th>
                <th className="cd-num">Freight</th>
                <th>Route</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.trucks.map((t) => (
                <tr key={t.contractDispatchId}>
                  <td>
                    <strong>{text(t.truckNumber)}</strong>
                    <div className="cd-muted">{[t.truckType, t.truckCapacity ? `${t.truckCapacity} cap.` : null].filter(Boolean).join(" · ")}</div>
                  </td>
                  <td>
                    {text(t.driverName)}
                    <div className="cd-muted">{text(t.driverMobile)}</div>
                  </td>
                  <td>
                    {text(t.transporterName)}
                    <div className="cd-muted">{text(t.assignmentType)}{t.isReassigned ? " · Re-assigned" : ""}</div>
                  </td>
                  <td>{text(t.lrNumber)}</td>
                  <td>{dateTime(t.assignedOn)}</td>
                  <td className="cd-num">{qty(t.quantityMT)}</td>
                  <td className="cd-num">
                    {money(t.freightAmount, d.overview.currencySymbol)}
                    <div className="cd-muted">{money(t.freightPerMT, d.overview.currencySymbol)}/MT</div>
                  </td>
                  <td className="cd-route">
                    <div>{text(t.fromAddress)}</div>
                    <div className="cd-muted">→ {text(t.toAddress)}</div>
                  </td>
                  <td>
                    <StatusPill status={t.status} />
                    {t.busyUntil && <div className="cd-muted">Free after {dateTime(t.busyUntil)}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {d.trucks.some((t) => t.receipts.length > 0) && (
        <Card title="Goods Receipts">
          <TableWrap>
            <thead>
              <tr>
                <th>Truck</th>
                <th>Received On</th>
                <th className="cd-num">Received</th>
                <th className="cd-num">Rejected</th>
                <th className="cd-num">Accepted</th>
                <th>Warehouse</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {d.trucks.flatMap((t) =>
                t.receipts.map((r, i) => (
                  <tr key={`${t.contractDispatchId}-${i}`}>
                    <td>{text(t.truckNumber)}</td>
                    <td>{date(r.receivedDate)}</td>
                    <td className="cd-num">{qty(r.receivedQuantity)}</td>
                    <td className="cd-num">{qty(r.rejectedQuantity)}</td>
                    <td className="cd-num">{qty(r.acceptedQuantity)}</td>
                    <td>{text(r.warehouse)}</td>
                    <td>{text(r.remarks)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </TableWrap>
        </Card>
      )}

      <Card title="Dispatch Schedules">
        {d.schedules.length === 0 ? (
          <Empty>No dispatch schedules were requested for this contract.</Empty>
        ) : (
          <div className="cd-stack">
            {d.schedules.map((sc) => (
              <div className="cd-subcard" key={sc.dispatchScheduleId}>
                <div className="cd-subcard__head">
                  <strong>{dateTime(sc.scheduleDateTime)}</strong>
                  <StatusPill status={sc.status} />
                  {sc.autoApprove && <Pill tone="info">Auto-approve</Pill>}
                </div>
                <FieldGrid>
                  <Field label="Quantity" value={qty(sc.quantityMT)} />
                  <Field label="Remaining" value={qty(sc.remainingQuantityMT)} />
                  <Field label="Freight" value={sc.freightPerMT != null ? `${money(sc.freightPerMT, d.overview.currencySymbol)}/MT` : "—"} />
                  <Field label="From" value={text(sc.fromAddress)} wide />
                  <Field label="To" value={text(sc.toAddress)} wide />
                  {sc.remarks ? <Field label="Remarks" value={sc.remarks} wide /> : null}
                </FieldGrid>
                {sc.transporters.length > 0 && (
                  <TableWrap>
                    <thead>
                      <tr>
                        <th>Transporter</th>
                        <th>Response</th>
                        <th className="cd-num">Offered</th>
                        <th className="cd-num">Accepted</th>
                        <th className="cd-num">Cancelled</th>
                        <th className="cd-num">Freight</th>
                        <th>Responded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.transporters.map((tr, i) => (
                        <tr key={i}>
                          <td>{text(tr.transporterName)}</td>
                          <td>
                            <StatusPill status={tr.responseStatus} />
                            {tr.negotiated && <Pill tone="warning">Negotiated</Pill>}
                          </td>
                          <td className="cd-num">{qty(tr.offeredQuantityMT)}</td>
                          <td className="cd-num">{qty(tr.acceptedQuantityMT)}</td>
                          <td className="cd-num">{qty(tr.cancelledQuantityMT)}</td>
                          <td className="cd-num">
                            {money(tr.acceptedFreightPerMT ?? tr.offeredFreightPerMT, d.overview.currencySymbol)}
                          </td>
                          <td>{dateTime(tr.responseDateTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </TableWrap>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ Invoices */

export const InvoicesTab = ({ d }: Props) => {
  const sym = d.overview.currencySymbol;
  const s = d.summary;
  return (
    <div className="cd-stack">
      <Card title="Invoices">
        {d.invoices.length === 0 ? (
          <Empty>No invoices have been raised against this contract yet.</Empty>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Truck</th>
                <th className="cd-num">Qty</th>
                <th className="cd-num">Amount</th>
                <th className="cd-num">GST</th>
                <th className="cd-num">Total</th>
                <th className="cd-num">Deductions</th>
                <th className="cd-num">Paid</th>
                <th className="cd-num">Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.invoices.map((i) => (
                <tr key={i.invoiceId}>
                  <td>
                    <strong>{text(i.invoiceNumber)}</strong>
                    <div className="cd-muted">{text(i.financialYear)}</div>
                  </td>
                  <td>{date(i.invoiceDate)}</td>
                  <td>
                    {text(i.truckNumber)}
                    {i.numberOfBags ? <div className="cd-muted">{i.numberOfBags} bags</div> : null}
                  </td>
                  <td className="cd-num">{qty(i.quantityMT)}</td>
                  <td className="cd-num">{money(i.invoiceAmount, sym)}</td>
                  <td className="cd-num">
                    {money(i.gstAmount, sym)}
                    <div className="cd-muted">{percent(i.gstPercent)}</div>
                  </td>
                  <td className="cd-num">
                    <strong>{money(i.totalAmount, sym)}</strong>
                  </td>
                  <td className="cd-num">{money(i.deductionsTotal, sym)}</td>
                  <td className="cd-num">{money(i.paidAmount + i.allocatedFromReceipts, sym)}</td>
                  <td className="cd-num">
                    <strong>{money(i.balanceAmount, sym)}</strong>
                  </td>
                  <td>
                    <StatusPill status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Totals ({s.invoiceCount} invoice{s.invoiceCount === 1 ? "" : "s"}, cancelled excluded)</td>
                <td className="cd-num">{money(s.invoicedAmount, sym)}</td>
                <td className="cd-num">{money(s.invoicedGst, sym)}</td>
                <td className="cd-num">{money(s.invoiceTotal, sym)}</td>
                <td className="cd-num">{money(s.deductionsTotal, sym)}</td>
                <td className="cd-num">{money(s.paidAgainstInvoices, sym)}</td>
                <td className="cd-num">{money(s.outstandingAmount, sym)}</td>
                <td />
              </tr>
            </tfoot>
          </TableWrap>
        )}
      </Card>

      {d.invoices.some((i) => i.deductions.length > 0) && (
        <Card title="Deductions">
          <TableWrap>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Type</th>
                <th className="cd-num">Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {d.invoices.flatMap((i) =>
                i.deductions.map((x, n) => (
                  <tr key={`${i.invoiceId}-${n}`}>
                    <td>{text(i.invoiceNumber)}</td>
                    <td>{date(x.deductionDate)}</td>
                    <td>{x.isTdsTcs ? "TDS / TCS" : "Other"}</td>
                    <td className="cd-num">{money(x.amount, sym)}</td>
                    <td>{text(x.remarks)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </TableWrap>
        </Card>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Payments */

export const PaymentsTab = ({ d }: Props) => {
  const sym = d.overview.currencySymbol;
  const hasInvoicePayments = d.invoices.some((i) => i.payments.length > 0);
  return (
    <div className="cd-stack">
      <Card title="Payment Receipts">
        {d.receipts.length === 0 ? (
          <Empty>No payment receipts are linked to this contract.</Empty>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference</th>
                <th className="cd-num">Amount</th>
                <th className="cd-num">Applied here</th>
                <th>Applied to</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.receipts.map((r) => (
                <tr key={r.receiptId}>
                  <td>
                    <strong>{text(r.receiptNumber)}</strong>
                    <div className="cd-muted">{text(r.kind)}{r.towards ? ` · ${r.towards}` : ""}</div>
                  </td>
                  <td>{date(r.receiptDate)}</td>
                  <td>
                    {text(r.paymentMode)}
                    {r.bankName && <div className="cd-muted">{r.bankName}</div>}
                  </td>
                  <td>{text(r.reference)}</td>
                  <td className="cd-num">{money(r.amount, sym)}</td>
                  <td className="cd-num">{money(r.allocatedToThisContract, sym)}</td>
                  <td>
                    {r.allocations.length === 0
                      ? "—"
                      : r.allocations.map((a, i) => (
                          <div key={i} className="cd-muted">
                            {text(a.invoiceNumber)} · {money(a.amount, sym)} ({text(a.allocationType)}
                            {a.status !== "Active" ? `, ${a.status}` : ""})
                          </div>
                        ))}
                  </td>
                  <td>
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {hasInvoicePayments && (
        <Card title="Payments Against Invoices">
          <TableWrap>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Paid On</th>
                <th>Mode</th>
                <th>Reference</th>
                <th className="cd-num">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.invoices.flatMap((i) =>
                i.payments.map((p, n) => (
                  <tr key={`${i.invoiceId}-${n}`}>
                    <td>{text(i.invoiceNumber)}</td>
                    <td>{date(p.paidDate)}</td>
                    <td>{text(p.paymentMode)}</td>
                    <td>{text(p.paymentReference)}</td>
                    <td className="cd-num">{money(p.amountPaid, sym)}</td>
                    <td>
                      <StatusPill status={p.paymentStatus} />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </TableWrap>
        </Card>
      )}

      {d.refunds.length > 0 && (
        <Card title="Refunds">
          <TableWrap>
            <thead>
              <tr>
                <th>Refund</th>
                <th>Receipt</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference</th>
                <th className="cd-num">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.refunds.map((r) => (
                <tr key={r.refundId}>
                  <td>#{r.refundId}</td>
                  <td>{text(r.receiptNumber)}</td>
                  <td>{date(r.refundDate)}</td>
                  <td>{text(r.paymentMode)}</td>
                  <td>{text(r.reference)}</td>
                  <td className="cd-num">{money(r.amount, sym)}</td>
                  <td>
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Activity */

export const ActivityTab = ({ d }: Props) => (
  <div className="cd-stack">
    <Card title="Status History">
      {d.statusHistory.length === 0 ? (
        <Empty>No status changes have been recorded.</Empty>
      ) : (
        <ol className="cd-timeline">
          {d.statusHistory.map((h, i) => (
            <li key={i} className="cd-timeline__item">
              <span className="cd-timeline__dot" aria-hidden />
              <div>
                <div className="cd-timeline__title">
                  {h.oldStatus ? (
                    <>
                      <StatusPill status={h.oldStatus} /> <span aria-hidden>→</span> <StatusPill status={h.newStatus} />
                    </>
                  ) : (
                    <StatusPill status={h.newStatus} />
                  )}
                </div>
                <div className="cd-muted">
                  {dateTime(h.changedOn)}
                  {h.changedByName ? ` · ${h.changedByName}` : ""}
                </div>
                {h.remarks && <div className="cd-timeline__note">{h.remarks}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>

    <div className="cd-two">
      <Card title="Documents">
        {d.documents.length === 0 ? (
          <Empty>No documents are attached to this contract.</Empty>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Version</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {d.documents.map((x, i) => (
                <tr key={i}>
                  <td>{text(x.documentName)}</td>
                  <td>{text(x.documentType)}</td>
                  <td>{text(x.version)}</td>
                  <td>{date(x.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Card title="Notifications Sent">
        {d.notifications.length === 0 ? (
          <Empty>No notifications are recorded for this contract.</Empty>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {d.notifications.map((n, i) => (
                <tr key={i}>
                  <td>{text(n.channel)}</td>
                  <td>
                    <StatusPill status={n.status} />
                  </td>
                  <td>{dateTime(n.sentOn)}</td>
                  <td>{text(n.remarks)}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  </div>
);
