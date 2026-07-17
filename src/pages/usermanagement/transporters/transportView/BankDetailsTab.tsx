import { useState } from "react";
import { FiMail, FiDownload } from "react-icons/fi";
import Table from "../../../../components/table/Table";
import type { TableColumn } from "../../../../components/table/table.types";
import ShareModal from "../../../../components/dialog/ShareModal";
import type { ShareModalPayload } from "../../../../components/dialog/ShareModal";
import type { BankRow, DocumentRow, TransporterProfile } from "./transporterDetail.data";
import { toRecipientOptions } from "./transporterDetail.data";

interface BankDetailsTabProps {
  profile: TransporterProfile;
}

const BankDetailsTab = ({ profile }: BankDetailsTabProps) => {
  const [selectedBankKeys, setSelectedBankKeys] = useState<string[]>([]);
  const [selectedDocumentKeys, setSelectedDocumentKeys] = useState<string[]>([]);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);

  const recipientOptions = toRecipientOptions(profile);

  const toggleKey = (keys: string[], setKeys: (value: string[]) => void, key: string) => {
    setKeys(keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]);
  };

  const bankColumns: TableColumn<BankRow>[] = [
    { key: "accountType", header: "Bank Account Type" },
    { key: "accountName", header: "Account Name" },
    { key: "accountNumber", header: "Account Number" },
    { key: "bankName", header: "Bank Name" },
    { key: "branchIfsc", header: "Branch & IFSC" },
    {
      key: "isPrimary",
      header: "Primary",
      render: (row) => (row.isPrimary ? <span className="business-owner-detail__tag">Primary</span> : "—"),
    },
  ];

  const documentColumns: TableColumn<DocumentRow>[] = [
    { key: "sno", header: "S.No", width: "4rem" },
    { key: "documentType", header: "Document Type" },
    { key: "documentNumber", header: "Document Number" },
    { key: "issuingAuthority", header: "Issuing Authority" },
    { key: "issueDate", header: "Issue Date" },
    {
      key: "download",
      header: "Download",
      render: (row) => (
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(row.fileName)}`}
          download={row.fileName}
          className="business-owners__link"
          aria-label={`Download ${row.fileName}`}
          title={`Download ${row.fileName}`}
        >
          <FiDownload aria-hidden /> Download
        </a>
      ),
    },
  ];

  const handleSendBank = (_payload: ShareModalPayload) => {
    setSelectedBankKeys([]);
  };

  const handleSendDocuments = (_payload: ShareModalPayload) => {
    setSelectedDocumentKeys([]);
  };

  return (
    <div className="business-owner-detail__tab-panel">
      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">Bank Details</h2>
          <button
            type="button"
            className="transporters-btn transporters-btn--warning"
            onClick={() => setBankModalOpen(true)}
          >
            <FiMail aria-hidden /> Send Bank Details
          </button>
        </div>
        <p className="business-owner-detail__hint">Here you can manage the banks and documents associated with the user.</p>
        <Table
          columns={bankColumns}
          data={profile.bankDetails}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedBankKeys}
          onSelectRow={(key) => toggleKey(selectedBankKeys, setSelectedBankKeys, key)}
          onSelectAll={(checked) => setSelectedBankKeys(checked ? profile.bankDetails.map((row) => row.id) : [])}
          emptyMessage="No bank details on file."
        />
      </section>

      <section className="business-owner-detail__section">
        <div className="business-owner-detail__section-header">
          <h2 className="business-owner-detail__section-title">User Documents</h2>
          <button
            type="button"
            className="transporters-btn transporters-btn--warning"
            onClick={() => setDocumentModalOpen(true)}
          >
            <FiMail aria-hidden /> Send Documents
          </button>
        </div>
        <p className="business-owner-detail__hint">Here you can manage the documents associated with the user.</p>
        <Table
          columns={documentColumns}
          data={profile.documents}
          rowKey={(row) => row.id}
          selectable
          selectedRowKeys={selectedDocumentKeys}
          onSelectRow={(key) => toggleKey(selectedDocumentKeys, setSelectedDocumentKeys, key)}
          onSelectAll={(checked) => setSelectedDocumentKeys(checked ? profile.documents.map((row) => row.id) : [])}
          emptyMessage="No documents on file."
        />
      </section>

      <ShareModal
        open={bankModalOpen}
        title="Send Bank Details"
        onClose={() => setBankModalOpen(false)}
        onSend={handleSendBank}
        recipientOptions={recipientOptions}
        messagePlaceholder="Enter your message about bank details"
        confirmLabel="Send Bank Details"
      />

      <ShareModal
        open={documentModalOpen}
        title="Send Documents"
        onClose={() => setDocumentModalOpen(false)}
        onSend={handleSendDocuments}
        recipientOptions={recipientOptions}
        messagePlaceholder="Enter your message about documents"
        confirmLabel="Send Documents"
      />
    </div>
  );
};

export default BankDetailsTab;
