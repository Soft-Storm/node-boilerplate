const schedule = require('node-schedule');
const { SERVER } = require('./config');

module.exports = async () => {
  if (SERVER.env === 'production') {
    const rule = new schedule.RecurrenceRule();

    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = [12, 24];
    rule.minute = 0;

    schedule.scheduleJob(rule, async () => {});
  }
};
