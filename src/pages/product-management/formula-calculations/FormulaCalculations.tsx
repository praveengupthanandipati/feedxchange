import { Link } from "react-router-dom";
import { FiTool } from "react-icons/fi";
import "./FormulaCalculations.scss";

const FormulaCalculations = () => {
  return (
    <div className="formula-calculations-page">
      <div className="formula-calculations-card">
        <span className="formula-calculations-card__icon">
          <FiTool aria-hidden />
        </span>
        <h1>Page Under Construction</h1>
        <p>Formula Calculations is being built and will be available soon.</p>
        <Link to="/products" className="formula-calculations-card__back">
          Back to Products
        </Link>
      </div>
    </div>
  );
};

export default FormulaCalculations;
