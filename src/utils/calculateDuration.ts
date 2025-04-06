export function calculateDuration(entryTime: Date, exitTime: Date) {
  const start = new Date(entryTime);
  const end = new Date(exitTime);

  let diffMs = end.getTime() - start.getTime();

  const isNegative = diffMs < 0;
  if (isNegative) {
    diffMs = Math.abs(diffMs);
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isNegative,
    hours,
    minutes,
    seconds,
    formatted: `${isNegative ? '-' : ''}${hours}h ${minutes}min ${seconds}s`,
  };
}
