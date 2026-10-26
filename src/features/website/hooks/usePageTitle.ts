import { useEffect } from "react";
import { company } from "../data/content";

/** Sets the browser tab title for a website page, and restores the previous one on leave. */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${company.name}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
