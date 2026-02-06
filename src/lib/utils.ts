export function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  
  // Handle various ISO formats: Z, +00:00, or no timezone
  let dateString = dateStr;
  if (!dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.includes("-", 10)) {
    dateString = dateStr + "Z";
  }
  
  const date = new Date(dateString);
  
  // Check for invalid date
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateStr);
    return "";
  }
  
  const now = Date.now();
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 0) return "just now"; // Future dates
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}
