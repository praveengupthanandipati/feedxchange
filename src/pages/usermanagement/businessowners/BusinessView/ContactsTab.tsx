import { useState } from "react";
import { FiMail, FiExternalLink } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import type { AddressRow, ContactRow, BusinessOwnerProfile } from "./businessOwnerDetail.data";
import { toRecipientOptions } from "./businessOwnerDetail.data";

interface ContactsTabProps {
  profile: BusinessOwnerProfile;
}

const ContactsTab = ({ profile }: ContactsTabProps) => {
  const [selectedAddressKeys, setSelectedAddressKeys] = useState<string[]>([]);
  const [selectedContactKeys, setSelectedContactKeys] = useState<string[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const recipientOptions = toRecipientOptions(profile);

  const toggleKey = (keys: string[], setKeys: (value: string[]) => void, key: string) => {
    setKeys(keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]);
  };

  const addressColumns: TableColumn<AddressRow>[] = [
    {
      key: "officeName",
      header: "Office Name",
      render: (row) => (
        <span className="business-owner-detail__cell-with-tag">
          {row.officeName}
          {row.tag && <span className="business-owner-detail__tag">{row.tag}</span>}
        </span>
      ),
    },
    { key: "address", header: "Address" },
    { key: "city", header: "City" },
    { key: "state", header: "State" },
    { key: "pincode", header: "Pincode" },
    {
      key: "googleMapUrl",
      header: "Google Location",
      render: (row) => (
        <a href={row.googleMapUrl} target="_blank" rel="noopener noreferrer" className="business-owners__link">
          View on Map <FiExternalLink aria-hidden />
        </a>
      ),
    },
  ];

  const contactColumns: TableColumn<ContactRow>[] = [
    { key: "contactName", header: "Contact Name" },
    { key: "designation", header: "Designation" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "additionalPhone", header: "Additional Phone" },
  ];

  const handleSendAddress = (_payload: ShareModalPayload) => {
    setSelectedAddressKeys([]);
  };

  const handleSendContacts = (_payload: ShareModalPayload) => {
    setSelectedContactKeys([]);
  };

  return (
    <div className="business-owner-detail__tab-panel">
      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Additional Address</h2>
          <button
            type="button"
            className="business-owners-btn business-owners-btn--warning"
            onClick={() => setAddressModalOpen(true)}
          >
            <FiMail aria-hidden /> Send Address
          </button>
        </div>
        <Table
          columns={addressColumns}
          data={profile.addresses}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedAddressKeys}
          onSelectRow={(key) => toggleKey(selectedAddressKeys, setSelectedAddressKeys, key)}
          onSelectAll={(checked) => setSelectedAddressKeys(checked ? profile.addresses.map((row) => row.id) : [])}
          emptyMessage="No additional addresses on file."
        />
      </section>

      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Additional Contacts</h2>
          <button
            type="button"
            className="business-owners-btn business-owners-btn--warning"
            onClick={() => setContactModalOpen(true)}
          >
            <FiMail aria-hidden /> Send Message
          </button>
        </div>
        <Table
          columns={contactColumns}
          data={profile.contacts}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedContactKeys}
          onSelectRow={(key) => toggleKey(selectedContactKeys, setSelectedContactKeys, key)}
          onSelectAll={(checked) => setSelectedContactKeys(checked ? profile.contacts.map((row) => row.id) : [])}
          emptyMessage="No additional contacts on file."
        />
      </section>

      <ShareModal
        open={addressModalOpen}
        title="Send Address Information"
        onClose={() => setAddressModalOpen(false)}
        onSend={handleSendAddress}
        recipientOptions={recipientOptions}
        messagePlaceholder="Enter your message about addresses"
        confirmLabel="Send Address"
      />

      <ShareModal
        open={contactModalOpen}
        title="Send Contact Message"
        onClose={() => setContactModalOpen(false)}
        onSend={handleSendContacts}
        recipientOptions={recipientOptions}
        messagePlaceholder="Enter your message"
        confirmLabel="Send Message"
      />
    </div>
  );
};

export default ContactsTab;
