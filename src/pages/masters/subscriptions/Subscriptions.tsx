import { useMemo, useState } from "react";
import { matchesEmail, subscriptions } from "./subscriptions.data";
import SubscriptionCards from "./components/SubscriptionCards";
import SubscriptionsHeader from "./components/SubscriptionsHeader";
import SubscriptionsPagination from "./components/SubscriptionsPagination";
import SubscriptionsTable from "./components/SubscriptionsTable";
import "./Subscriptions.scss";

const PAGE_SIZE = 10;

const Subscriptions = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Newest sign-ups first.
  const filtered = useMemo(
    () => subscriptions.filter((subscription) => matchesEmail(subscription, search)).sort((a, b) => b.subscribedOn.localeCompare(a.subscribedOn)),
    [search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const emptyMessage = search.trim() ? "No subscriptions match that email." : "No subscriptions yet.";

  return (
    <div className="subscriptions">
      <SubscriptionsHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      <SubscriptionsTable rows={paged} emptyMessage={emptyMessage} />
      <SubscriptionCards rows={paged} emptyMessage={emptyMessage} />
      <SubscriptionsPagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
    </div>
  );
};

export default Subscriptions;
