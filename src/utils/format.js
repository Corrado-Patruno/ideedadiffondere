const shortDate = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const longDate = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const parse = (isoDate) => {
  const date = new Date(isoDate);
  return isoDate && !Number.isNaN(date.getTime()) ? date : null;
};

export const formatShortDate = (isoDate) => {
  const date = parse(isoDate);
  return date ? shortDate.format(date) : '';
};

export const formatLongDate = (isoDate) => {
  const date = parse(isoDate);
  return date ? longDate.format(date) : '';
};

export const initialsOf = (fullName) => {
  const [first, ...rest] = String(fullName).trim().split(/\s+/);
  return ((first?.[0] ?? '') + (rest.at(-1)?.[0] ?? '')).toUpperCase();
};
