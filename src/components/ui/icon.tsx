export type IconName =
  | "sun"
  | "grid"
  | "chart"
  | "more"
  | "check"
  | "note"
  | "arrow"
  | "book"
  | "activity"
  | "user";
const paths: Record<IconName, string> = {
  sun: "M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  chart: "M4 4v16h16M8 15v-4m5 4V7m5 8v-6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  check: "m5 12 4 4L19 6",
  note: "M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  book: "M12 5C8 3 5 3 3 4v15c3-1 6-1 9 1m0-15c4-2 7-2 9-1v15c-3-1-6-1-9 1V5",
  activity: "M3 12h4l3-7 4 14 3-7h4",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
};
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
