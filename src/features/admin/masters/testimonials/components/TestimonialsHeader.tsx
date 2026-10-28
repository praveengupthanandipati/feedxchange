import { PlusIcon, SearchIcon } from "../../../../../shared/components/icon";

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
        <PlusIcon aria-hidden /> New
      </button>
    </div>
    <div className="testimonials__search">
      <SearchIcon aria-hidden />
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
