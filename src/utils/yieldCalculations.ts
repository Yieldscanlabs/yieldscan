export function calculateYieldPeriods(dailyYield: number) {
  return {
    "1h": dailyYield / 24,
    "1d": dailyYield,
    "1w": dailyYield * 7,
    "1m": dailyYield * 30,
    "1y": dailyYield * 365,
  };
}
