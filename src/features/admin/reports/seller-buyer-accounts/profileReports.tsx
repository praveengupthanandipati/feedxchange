import { useMemo } from "react";
import type { TableColumn } from "../../../../shared/components/table/table.types";
import { useGetBusinessProfileByIdQuery, type BusinessProfileDetail } from "../../../../core/store/businessProfilesApi";
import ReportPanel from "./ReportPanel";
import { otherRole, type AccountContext, type ReportDef } from "./sellerBuyerAccounts.data";

interface Props {
  report: ReportDef;
  ctx: AccountContext;
}

const dash = (value: string | number | null | undefined) => (value === null || value === undefined || String(value).trim() === "" ? "—" : String(value));

const addressLine = (profile: BusinessProfileDetail | null | undefined) => {
  const list = profile?.addresses ?? [];
  const a = list.find((x) => x.isPrimary) ?? list[0];
  if (!a) return "—";
  return [a.officeName, a.addressLine1, a.addressLine2, a.landmark, a.city, a.district, a.stateName, a.pincode].filter((p) => p && p.trim()).join(", ") || "—";
};

/** The two business owners of the filter: A (with its role) and B (the other side, when picked). */
const useParties = (ctx: AccountContext) => {
  const a = useGetBusinessProfileByIdQuery(String(ctx.aId ?? 0), { skip: !ctx.aId });
  const b = useGetBusinessProfileByIdQuery(String(ctx.bId ?? 0), { skip: !ctx.bId });
  return {
    a: a.data,
    b: b.data,
    loading: a.isFetching || b.isFetching,
    error: a.isError || b.isError,
  };
};

interface FieldRow {
  field: string;
  a: string;
  b: string;
}

/** Business details of the seller and the buyer side by side. */
export const ProfileInfoReport = ({ report, ctx }: Props) => {
  const { a, b, loading, error } = useParties(ctx);
  const rows = useMemo<FieldRow[]>(() => {
    const pick = (pickFn: (p: BusinessProfileDetail) => string | number | null | undefined) => ({ a: a ? dash(pickFn(a)) : "—", b: b ? dash(pickFn(b)) : "—" });
    return [
      { field: "Legal name", ...pick((p) => p.legalName) },
      { field: "Trading name", ...pick((p) => p.tradingName) },
      { field: "Status", ...pick((p) => p.status) },
      { field: "Business group", ...pick((p) => p.groupName) },
      { field: "GST number", ...pick((p) => p.gstNumber) },
      { field: "PAN number", ...pick((p) => p.panNumber) },
      { field: "Year of establishment", ...pick((p) => p.yearOfEstablishment) },
      { field: "Business line", ...pick((p) => p.businessProfileDetails?.businessLineName) },
      { field: "Business type", ...pick((p) => p.businessProfileDetails?.businessTypeName) },
      { field: "Email", ...pick((p) => p.emailId) },
      { field: "Mobile", ...pick((p) => p.mobileNumber) },
      { field: "Alternative contact", ...pick((p) => p.alternativeContactNumber) },
      { field: "Website", ...pick((p) => p.websiteUrl) },
      { field: "Address", a: addressLine(a), b: addressLine(b) },
      { field: "Bank accounts", ...pick((p) => (p.bankAccounts ?? []).map((x) => `${x.bankName} ${x.accountNumber}`).join("; ")) },
    ];
  }, [a, b]);
  const roleA = ctx.aRole;
  const columns: TableColumn<FieldRow>[] = [
    { key: "field", header: "Detail", hideable: false },
    { key: "a", header: `${roleA}: ${ctx.aLabel}`, render: (r) => <span className="sba-wrap">{r.a}</span>, exportValue: (r) => r.a },
    { key: "b", header: ctx.bId ? `${otherRole(roleA)}: ${ctx.bLabel}` : `${otherRole(roleA)}: not selected`, render: (r) => <span className="sba-wrap">{r.b}</span>, exportValue: (r) => r.b },
  ];
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={rows}
      rowKey={(r) => r.field}
      loading={loading}
      error={error ? "The business profile could not be loaded." : null}
      emptyMessage="Pick a business owner to see the profile."
    >
      {!ctx.bId && <p className="sba-note">Pick the {otherRole(roleA).toLowerCase()} as well to see both profiles side by side.</p>}
    </ReportPanel>
  );
};

/** The profile group at a glance: business details, then the contact people. */
export const ProfileOverviewReport = ({ report, ctx }: Props) => (
  <>
    <ProfileInfoReport report={{ ...report, label: "Profile Info", hint: "Business details of the seller and the buyer" }} ctx={ctx} />
    <ContactInfoReport report={{ ...report, label: "Contact Info", hint: "The people to contact at the seller and the buyer" }} ctx={ctx} />
  </>
);

interface ContactRow {
  key: string;
  business: string;
  side: string;
  person: string;
  designation: string;
  mobile: string;
  alternative: string;
  email: string;
  type: string;
}

/** The people to contact at the seller and the buyer. */
export const ContactInfoReport = ({ report, ctx }: Props) => {
  const { a, b, loading, error } = useParties(ctx);
  const rows = useMemo<ContactRow[]>(() => {
    const of = (profile: BusinessProfileDetail | null | undefined, side: string, label: string): ContactRow[] =>
      (profile?.contacts ?? []).map((c) => ({
        key: `${side}-${c.contactId}`,
        business: label,
        side,
        person: dash(c.contactPerson),
        designation: dash(c.designation),
        mobile: dash(c.mobileNumber),
        alternative: dash(c.alternativeContactNumber),
        email: dash(c.emailId),
        type: dash(c.contactType) + (c.isUnloadingContact ? " · unloading" : ""),
      }));
    return [...of(a, ctx.aRole, ctx.aLabel), ...of(b, otherRole(ctx.aRole), ctx.bLabel)];
  }, [a, b, ctx.aRole, ctx.aLabel, ctx.bLabel]);
  const columns: TableColumn<ContactRow>[] = [
    { key: "business", header: "Business", sortable: true, hideable: false },
    { key: "side", header: "Side", sortable: true },
    { key: "person", header: "Contact person", sortable: true },
    { key: "designation", header: "Designation", sortable: true },
    { key: "mobile", header: "Mobile", sortable: true },
    { key: "alternative", header: "Alternative", sortable: true, priority: "low" },
    { key: "email", header: "Email", sortable: true },
    { key: "type", header: "Type", sortable: true, priority: "low" },
  ];
  return (
    <ReportPanel
      report={report}
      ctx={ctx}
      columns={columns}
      rows={rows}
      rowKey={(r) => r.key}
      loading={loading}
      error={error ? "The business contacts could not be loaded." : null}
      emptyMessage="No contact is recorded for these businesses."
      summary={[
        { label: `${ctx.aRole} contacts`, value: String(rows.filter((r) => r.side === ctx.aRole).length) },
        { label: `${otherRole(ctx.aRole)} contacts`, value: String(rows.filter((r) => r.side === otherRole(ctx.aRole)).length) },
      ]}
    />
  );
};
