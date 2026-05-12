const DEFAULT_TIME_ZONE = "Asia/Jakarta";

function getDateParts(date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return parts.reduce(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    },
    { year: "", month: "", day: "" },
  );
}

export function formatDateInput(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = getDateParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function shiftDateInput(value, offsetDays, timeZone = DEFAULT_TIME_ZONE) {
  const baseDate = value ? new Date(`${value}T00:00:00`) : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const shifted = new Date(baseDate);
  shifted.setDate(shifted.getDate() + offsetDays);

  return formatDateInput(shifted, timeZone);
}

export function getDefaultDateRange(days = 6, timeZone = DEFAULT_TIME_ZONE) {
  const end = formatDateInput(new Date(), timeZone);
  const start = shiftDateInput(end, -days, timeZone) || end;

  return { start, end };
}

export function normalizeDateOnly(value) {
  if (!value) return null;

  const normalized = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

export function getDateRangeBounds(startDate, endDate) {
  const start = normalizeDateOnly(startDate);
  const end = normalizeDateOnly(endDate);

  return {
    start: start || null,
    end: end || null,
  };
}

export function isDateInRange(value, startDate, endDate) {
  const normalized = normalizeDateOnly(value);
  const start = normalizeDateOnly(startDate);
  const end = normalizeDateOnly(endDate);

  if (!normalized) return false;
  if (start && normalized < start) return false;
  if (end && normalized > end) return false;
  return true;
}
