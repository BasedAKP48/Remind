const utils = require('@basedakp48/plugin-utils');
const Moment = require('moment');
const parseTime = require('./parsers');
const startListener = require('./listener');

const local = process.argv[2] ? ` (${process.argv[2]})` : '';
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
exports.parse = (options, msg, command) => new Promise((res, rej) => {
  if (!reminder) throw new Error('Not initialized');
  if (!options.time || !options.message) throw new Error(`Syntax: .${command} [options] <time> <message>`);
  const now = msg.timeReceived || msg.timestamp;
  Promise.resolve(parseTime(options.time, now))
    .then(t => convert(t, now))
    .then((time) => {
      res(time - now);
      const txt = options.message;
      const data = {};
      // Apply connector-specific data
      if (msg.data.connectorType === 'discord') {
        Object.assign(data, {
          includeText: true,
          discord_embed: {
            description: txt,
            color: 9276575,
            title: 'Reminder',
            timestamp: Moment(now).toISOString(),
            footer: { text: `Created by ${msg.data.nick}` },
          },
        });
      }
      let pndMsg = '';
      // Apply mention info
      if (options.mention) {
        if (!options.none) {
          pndMsg = options.mention;
        }
      } else if (msg.data.connectorType === 'discord') {
        data.mention = !msg.data.isPM;
        data.mentionID = msg.uid;
      } else {
        // Other connector types (like IRC) have UID as the name
        pndMsg = msg.uid;
      }

      // Add the message to the response - discord messages get embedded
      if (msg.data.connectorType !== 'discord') {
        pndMsg += ` ${txt}`;
      }
      if (local) {
        pndMsg += local;
      }
      const msgData = msg.data;
      delete msg.data;
      const reply = utils.getReply(msg, reminder.cid, pndMsg.trim(), data);
      msg.data = msgData; // Add data back
      const pending = {
        time,
        reply,
      };
      return root.push(pending);
    }).catch(rej);
});

function convert(time, now) {
  if (time === false) throw new Error('No time found.');
  if (time instanceof Moment) {
    if (time.isSameOrAfter(now)) {
      return time.valueOf();
    }
  } else if (time >= now) {
    return time;
  } else if (time >= 0 && time < now) {
    return now + time;
  }
  throw new Error('Attempted to send to the past');
}
