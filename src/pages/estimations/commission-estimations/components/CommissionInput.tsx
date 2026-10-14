interface CommissionInputProps {
  value: number;
  contractNo: string;
  onChange: (value: number) => void;
}

const CommissionInput = ({ value, contractNo, onChange }: CommissionInputProps) => (
  <input
    type="number"
    min={0}
    inputMode="decimal"
    className="commission-estimations__commission"
    value={value}
    onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
    aria-label={`Commission per MT for contract ${contractNo}`}
  />
);

export default CommissionInput;
