const utils = require('@basedakp48/plugin-utils');
const Moment = require('moment');
const parseTime = require('./parsers');
const startListener = require('./listener');

let reminder;
let root;

exports.init = (plugin) => {
  if (reminder) return;
  reminder = plugin;
  root = plugin.root.child(`config/${plugin.cid}/reminders`);
  startListener(plugin);

  plugin.on('destroy', () => {
    reminder = null;
    root = null;
  });
};

/**
 * @param {string} text
 * @returns {Promise}
 */
exports.parse = (text, msg, command) => new Promise((res, rej) => {
  if (!reminder) throw new Error('Not initialized');
  const args = text.trim().split(' ');
  if (args.length < 2) throw new Error(`Syntax: .${command} <time> <message>`);
  const now = msg.timeReceived || msg.timestamp;
  Promise.resolve(parseTime(args.shift(), now))
    .then(t => convert(t, now))
    .then((time) => {
      res(time - now);
      const txt = args.join(' ');
      const data = {
        mention: true,
        mentionID: msg.uid,
        includeText: true,
        discord_embed: {
          description: txt,
          color: 9276575,
          title: 'Reminder',
          timestamp: Moment(now + 1000).toISOString(),
          footer: { text: `Created by ${msg.data.nick}` },
        },
      };
      delete msg.data;
      const pending = {
        time: time + 1000,
        reply: utils.getReply(msg, reminder.cid, '', data),
      };
      root.push(pending);
    }).catch(rej);
});

function convert(time, now) {
  if (time === false) throw new Error('No time found.');
  if (time instanceof Moment) {
    return convert(time.valueOf(), now);
  } else if (time > now + 1261440000000) { // 40 years into the future
    throw new Error('My existence will come into question, so far into the future.');
  } else if (time >= now) {
    return time;
  } else if (time >= 0 && time <= now - 63072000000) { // This allows for many years into the future
    return now + time;
  }
  throw new Error('Attempted to send to the past');
}
