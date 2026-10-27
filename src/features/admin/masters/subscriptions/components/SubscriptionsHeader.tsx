import { SearchIcon } from "../../../../../shared/components/icon";

interface SubscriptionsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const SubscriptionsHeader = ({ search, onSearchChange }: SubscriptionsHeaderProps) => (
  <>
    <h1 className="subscriptions__title">Subscriptions</h1>
    <div className="subscriptions__search">
      <SearchIcon aria-hidden />
      <input
        type="search"
        inputMode="email"
        autoComplete="off"
        placeholder="Search by email..."
        aria-label="Search by email"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  </>
);

export default SubscriptionsHeader;
