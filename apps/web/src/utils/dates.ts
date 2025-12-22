export function formatZonedTime(
  iso: string | null,
  timeZone: string | null,
  options?: Intl.DateTimeFormatOptions
) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
    timeZone: timeZone ?? undefined
  });

  if (!timeZone) {
    return formatter.format(date);
  }

  return `${formatter.format(date)} (${timeZone})`;
}
