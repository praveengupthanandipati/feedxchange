import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { sellerInvoiceApi, type Invoice } from "../../../core/store/sellerInvoiceApi";
import type { AppDispatch } from "../../../core/store/store";

const PAGE_SIZE = 500;
/** Safety stop: at most this many pages (10,000 invoices). */
const MAX_PAGES = 20;

/**
 * Every seller invoice except cancelled ones (GetInvoices, page by page), for the dashboard's revenue and order figures.
 * Returns null while loading; an empty list if the invoices can't be read (e.g. no permission for them).
 */
export function useAllInvoices(): { invoices: Invoice[] | null; failed: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all: Invoice[] = [];
      try {
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          // An empty status means every invoice except cancelled ones.
          const request = dispatch(sellerInvoiceApi.endpoints.getInvoices.initiate({ status: "", page, pageSize: PAGE_SIZE }));
          try {
            const result = await request.unwrap();
            all.push(...(result.items ?? []));
            if (all.length >= result.total || (result.items ?? []).length < PAGE_SIZE) break;
          } finally {
            request.unsubscribe();
          }
        }
        if (!cancelled) setInvoices(all);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setInvoices([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { invoices, failed };
}
