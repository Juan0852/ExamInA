export function formatSecondsToHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours === 0) return "0 hrs";
  return `${hours.toFixed(1)} hrs`;
}

export function formatSecondsToMinutes(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

export function formatSecondsSmart(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  }
  return formatSecondsToHours(seconds);
}

export function formatSignedSecondsSmart(seconds: number): string {
  if (seconds === 0) return "0 min";

  const sign = seconds > 0 ? "+" : "-";
  return `${sign}${formatSecondsSmart(Math.abs(seconds))}`;
}
