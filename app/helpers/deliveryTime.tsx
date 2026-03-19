/** Add N business days to a date, skipping Saturday and Sunday. */
function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

export const deliveryTime = (startDays = 1) => {
  const today = new Date();
  const start = addBusinessDays(today, startDays);
  const end = addBusinessDays(today, startDays + 6);

  return (
    <>
      starting{' '}
      {start.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })}{' '}
      –{' '}
      {end.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })}
    </>
  );
}
