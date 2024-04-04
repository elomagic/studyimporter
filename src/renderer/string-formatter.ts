export const formatDicomTimeString = (
  time: string | undefined,
  format: string,
): string => {
  if (time === undefined) {
    return 'unknown';
  }

  const hours = time.substring(0, 2);
  const minutes = time.substring(2, 4);

  let s = format.replace('HH', hours);
  s = s.replace('hh', hours > '12' ? (Number(hours) - 12).toString() : hours);
  s = s.replace('a', hours > '12' ? 'pm' : 'am');
  s = s.replace('mm', minutes);

  return s;
};

export const formatDicomDateString = (
  date: string | undefined,
  locale: string | undefined,
): string => {
  if (date === undefined) {
    return 'unknown';
  }

  if (locale === undefined) {
    return date;
  }

  const d = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(
    6,
    8,
  )}`;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(d));
};
