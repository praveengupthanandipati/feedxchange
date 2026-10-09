import type { EstimationDetailRecord } from "../estimationDetail.data";
import { EMPTY_VALUE, formatInr, formatNumber, formatShortDate, type DetailTotals } from "../estimationDetail.utils";

interface DetailStatsProps {
  record: EstimationDetailRecord;
  totals: DetailTotals;
}

/** Estimate No · period · party · gross · difference · total, as cards. */
const DetailStats = ({ record, totals }: DetailStatsProps) => {
  const stats = [
    { key: "estimate", label: "Estimate No", value: record.estimateNo },
    { key: "period", label: "From and To Date", value: `${formatShortDate(record.fromDate)} - ${formatShortDate(record.toDate)}` },
    { key: "party", label: "Party Name", value: record.partyName || EMPTY_VALUE, modifier: "text" },
    { key: "gross", label: "Gross Amount", value: formatNumber(totals.grossAmount) },
    { key: "difference", label: "Difference :", value: formatNumber(totals.difference) },
    { key: "total", label: "Total Amount :", value: formatInr(totals.totalAmount), modifier: "highlight" },
  ];

  return (
    <dl className="estimation-detail__stats">
      {stats.map((stat) => (
        <div key={stat.key} className={`estimation-detail__stat ${stat.modifier ? `estimation-detail__stat--${stat.modifier}` : ""}`}>
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default DetailStats;
