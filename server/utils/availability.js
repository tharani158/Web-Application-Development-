const getUpcomingWeekdays = (count = 5) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => Number(parts.find((part) => part.type === type).value);
  const today = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
  const dates = [];

  for (let offset = 1; dates.length < count; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + offset);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) dates.push(date);
  }

  return dates;
};

module.exports = { getUpcomingWeekdays };
