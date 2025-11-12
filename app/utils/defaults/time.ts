export function isTimePassedOverThresholdInclusive(
    date1: Date,
    date2: Date,
    thresholdSeconds: number,
    unit: 's' | 'm' | 'ms' | 'h' = 's'
): boolean {
    const diffInMs = Math.abs(date1.getTime() - date2.getTime());
    const thresholdInMs = thresholdSeconds * (unit == 'ms' ? 1 : unit == 's' ?  1000 : unit == 'm' ? 1000 * 60 : unit == 'h' ? 1000 * 60 * 60 : 1);
    return diffInMs >= thresholdInMs; // Changed to >=
}