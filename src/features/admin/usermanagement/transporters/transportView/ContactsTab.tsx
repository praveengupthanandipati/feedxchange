import { ExternalLinkIcon } from "../../../../../shared/components/icon";
import Table from "../../../../../shared/components/table/Table";
import type { TableColumn } from "../../../../../shared/components/table/table.types";
import type { AddressRow, ContactRow, TransporterProfile } from "./transporterDetail.data";

interface ContactsTabProps {
  profile: TransporterProfile;
}

const ContactsTab = ({ profile }: ContactsTabProps) => {
  const addressColumns: TableColumn<AddressRow>[] = [
    { key: "officeName", header: "Office Name" },
    { key: "address", header: "Address" },
    { key: "city", header: "City" },
    { key: "state", header: "State" },
    { key: "pincode", header: "Pincode" },
    {
      key: "googleMapUrl",
      header: "Google Location",
      render: (row) => (
        <a href={row.googleMapUrl} target="_blank" rel="noopener noreferrer" className="business-owners__link">
          View on Map <ExternalLinkIcon aria-hidden />
        </a>
      ),
    },
  ];

  const contactColumns: TableColumn<ContactRow>[] = [
    {
      key: "contactName",
      header: "Contact Name",
      render: (row) => (
        <span className="business-owner-detail__cell-with-tag">
          {row.contactName}
          {row.isPrimary && <span className="business-owner-detail__tag">Primary Contact</span>}
        </span>
      ),
    },
    { key: "designation", header: "Designation" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "additionalPhone", header: "Additional Phone" },
  ];

  return (
    <div className="business-owner-detail__tab-panel">
      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Additional Addresses</h2>
        </div>
        <Table
          columns={addressColumns}
          data={profile.addresses}
          rowKey={(row) => row.id}
          emptyMessage="No additional addresses on file."
        />
      </section>

      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Contacts</h2>
        </div>
        <Table
          columns={contactColumns}
          data={profile.contacts}
          rowKey={(row) => row.id}
          emptyMessage="No contacts on file."
        />
      </section>
    </div>
  );
};

export default ContactsTab;
