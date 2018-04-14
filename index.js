const utils = require('@basedakp48/plugin-utils');
const moment = require('moment');
require('moment-duration-format');
const remind = require('./lib/reminder');

const local = process.argv[2] ? ` (${process.argv[2]})` : '';
const plugin = new utils.Plugin({ dir: __dirname });
remind.init(plugin);

const format = 'y [y], M[mo], w [w], d[d], h[h], m[m], s[s]';

// Register our presence
plugin.presenceSystem();
// Listen to incoming messages
plugin.messageSystem().on('message-in', (msg) => {
  if (!msg.text.startsWith('.') || !msg.data) return null;
  const end = msg.text.indexOf(' ') === -1 ? null : msg.text.indexOf(' ');
  const cmd = msg.text.substring(1, end);
  const options = getOptions(msg.text.substring(cmd.length + 2).trim().split(' '));
  switch (cmd) {
    default: return null;
    case 'remind':
    case 'reminder':
    // case 'r':
      return remind.parse(options, msg, cmd)
        .catch(err => err.message || err)
        .then((response) => {
          if (!Number.isInteger(response)) return response;
          const willDelete = options.delete && msg.data.messageID;
          if (!options.silent || (options.delete && !willDelete)) {
            return confirmReminder(msg, response);
          } else if (willDelete) {
            return plugin.response({
              target: msg.cid,
              command: 'delete-message',
              // I really hope this can't get more complex on other platforms.
              arg: msg.channel,
              data: msg.data.messageID,
            }).then((reply) => {
              // Ignore any response, we don't care
            }).catch((error) => {
              // Chances are the reminder was sent already
              if (options.silent && Number(response) > 1) {
                return confirmReminder(msg, response);
              }
              return null;
            });
          }
          return null;
        })
        .then((response) => {
          if (typeof response !== 'string') return null;
          return plugin.messageSystem().sendText(response + local, msg);
        })
        .catch(onError);
  }
});

function confirmReminder(msg, time) {
  const text = `Reminding in ${moment.duration(time).format(format, { trim: 'all' }) || '0s'}${local}`;
  const data = {
    mention: !msg.data.isPM,
    mentionID: msg.uid,
  };
  const message = utils.getReply(msg, plugin.cid, text, data);
  return plugin.messageSystem().sendMessage(message);
}

function getOptions(args) {
  const options = {
    allowMentions: true,
  };
  const mentions = [];
  let time = 0;
  for (; time < args.length; time++) {
    const arg = args[time];
    if (!arg.startsWith('-')) break;
    switch (arg) {
      case '-delete':
        options.delete = true;
        break;
      case '-none':
        options.allowMentions = false;
        break;
      case '-silent':
        options.silent = true;
        break;
      case '-w':
        mentions.push(args[time += 1]);
        break;
      default: // Eat it
    }
  }
  options.mention = mentions.join(' ');
  options.time = args[time];
  options.message = args.slice(time + 1).join(' ');
  return options;
}

function onError(error) {
  if (!plugin.sendError(error)) {
    console.error(error);
  }
}
