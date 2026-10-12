import { FiPlus, FiSearch } from "react-icons/fi";

interface TestimonialsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
}

const TestimonialsHeader = ({ search, onSearchChange, onNew }: TestimonialsHeaderProps) => (
  <>
    <div className="testimonials__header">
      <h1>Testimonials</h1>
      <button type="button" className="testimonials__btn testimonials__btn--navy" onClick={onNew}>
        <FiPlus aria-hidden /> New
      </button>
    </div>
    <div className="testimonials__search">
      <FiSearch aria-hidden />
      <input
        type="search"
        autoComplete="off"
        placeholder="Search testimonials..."
        aria-label="Search testimonials"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  </>
);

export default TestimonialsHeader;
