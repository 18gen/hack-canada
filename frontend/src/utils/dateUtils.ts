// /app/components/VoteList/helpers.ts

// Helper to determine ordinal suffix for a day number
export function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Formats an ISO date string (e.g., "2025-02-25T18:25:00")
// into "February 25th, 6:25PM, 2025"
export function formatEndsAt(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const daySuffix = getDaySuffix(day);
  const year = date.getFullYear();
  let hours = date.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // convert "0" to "12"
  const minutes = date.getMinutes();
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const time = `${hours}:${paddedMinutes}${period}`;

  return `${month} ${day}${daySuffix}, ${time}`; // , ${year}
}
