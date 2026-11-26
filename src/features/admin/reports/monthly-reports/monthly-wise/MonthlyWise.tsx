import { useMemo } from "react";
import Table from "../../../../../shared/components/table/Table";
import { getPreviousFinancialYear } from "../monthlyReports.data";
import { buildMonthlyWiseColumns } from "./monthlyWise.columns";
import { monthlyRows, totalCurrentYearQty } from "./monthlyWise.data";
import "./MonthlyWise.scss";

interface MonthlyWiseProps {
  financialYear: string;
}

const MonthlyWise = ({ financialYear }: MonthlyWiseProps) => {
  const previousYear = getPreviousFinancialYear(financialYear);
  const columns = useMemo(
    () => buildMonthlyWiseColumns(financialYear, previousYear),
    [financialYear, previousYear],
  );

  return (
    <div className="monthly-wise">
      <div className="monthly-wise__stat">
        <p className="monthly-wise__stat-label">Total</p>
        <p className="monthly-wise__stat-value">{totalCurrentYearQty}</p>
      </div>

      <Table
        exportName="Monthly Wise Report"
        columnToggle
        columns={columns}
        data={monthlyRows}
        rowKey={(row) => row.id}
        emptyMessage="No monthly data available."
        minHeight
        className="monthly-wise-table"
      />
    </div>
  );
};

export default MonthlyWise;
