// All date strings in this file are 'YYYY-MM-DD', always in LOCAL time
// (never UTC) so day boundaries match the user's actual calendar day.

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7); // 'YYYY-MM'
}

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isWeekend(dateStr) {
  const day = parseLocalDate(dateStr).getDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}

export function defaultIncluded(dateStr) {
  return !isWeekend(dateStr);
}

// daySettingsMap: { [dateStr]: { included: boolean, source: 'manual' } }
export function isDayIncluded(dateStr, daySettingsMap) {
  const override = daySettingsMap[dateStr];
  if (override) return override.included;
  return defaultIncluded(dateStr);
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Returns every date string from the 1st of the month through `endDateStr`
// (inclusive). Never goes past today — future dates are never eligible.
export function datesFromMonthStartTo(monthKey, endDateStr) {
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = parseLocalDate(endDateStr);
  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toDateStr(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function getTodaySpending(transactions, dateStr) {
  return transactions
    .filter((t) => t.type === "expense" && t.date === dateStr)
    .reduce((sum, t) => sum + t.amount, 0);
}

// Returns the last `count` calendar dates strictly BEFORE `beforeDateStr`,
// most recent first (e.g. yesterday, the day before, ...).
export function recentDatesBefore(beforeDateStr, count) {
  const dates = [];
  const cursor = parseLocalDate(beforeDateStr);
  for (let i = 0; i < count; i++) {
    cursor.setDate(cursor.getDate() - 1);
    dates.push(toDateStr(cursor));
  }
  return dates;
}

/**
 * Core "saved so far" calculation.
 *
 * eligibleDays = count of included dates from the 1st of the month through
 *                `asOfDate` (inclusive). Never counts future dates.
 * targetAllowance = eligibleDays * dailyTarget
 * spendingOnEligibleDays = sum of expenses on included dates in that range
 * spendingOnExcludedDays = sum of expenses on excluded dates in that range
 *                          (still counted in totalSpent, never in savedSoFar)
 * savedSoFar = targetAllowance - spendingOnEligibleDays
 */
export function getSavedSoFar(transactions, daySettingsMap, dailyTarget, asOfDate) {
  const monthKey = monthKeyOf(asOfDate);
  const dates = datesFromMonthStartTo(monthKey, asOfDate);

  let eligibleDays = 0;
  let spendingOnEligibleDays = 0;
  let spendingOnExcludedDays = 0;

  const spendingByDate = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (monthKeyOf(t.date) !== monthKey) continue;
    if (t.date > asOfDate) continue; // safety: never count future spending here
    spendingByDate[t.date] = (spendingByDate[t.date] || 0) + t.amount;
  }

  for (const dateStr of dates) {
    const included = isDayIncluded(dateStr, daySettingsMap);
    if (included) eligibleDays += 1;
    const spentThatDay = spendingByDate[dateStr] || 0;
    if (included) spendingOnEligibleDays += spentThatDay;
    else spendingOnExcludedDays += spentThatDay;
  }

  const targetAllowance = eligibleDays * dailyTarget;
  const totalSpent = spendingOnEligibleDays + spendingOnExcludedDays;
  const savedSoFar = targetAllowance - spendingOnEligibleDays;

  return {
    monthKey,
    eligibleDays,
    targetAllowance,
    spendingOnEligibleDays,
    spendingOnExcludedDays,
    totalSpent,
    savedSoFar,
  };
}

export function getDailyState(todaySpent, dailyTarget, warningThreshold) {
  if (todaySpent >= dailyTarget) return "over";
  if (todaySpent >= warningThreshold) return "warning";
  return "normal";
}
