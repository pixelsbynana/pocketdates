import { format } from "date-fns";

/** e.g. "15 September 2026 at 7:30 am" */
export function formatMemoryDate(date: Date): string {
  return `${format(date, "d MMMM yyyy 'at' h:mm")} ${format(date, "a").toLowerCase()}`;
}
