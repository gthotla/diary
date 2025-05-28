import moment from 'moment-timezone';

export function getLocalDate(timezone) {
  return moment().tz(timezone).format('YYYY-MM-DD');
}

export function isMidnightInTz(timezone) {
  const now = moment().tz(timezone);
  return now.format('HH:mm') === '00:00';
}

//export default { getLocalDate, isMidnightInTz };
