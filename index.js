const utils = require('@basedakp48/plugin-utils');
const moment = require('moment');
require('moment-duration-format');
const remind = require('./lib/reminder');

const plugin = new utils.Plugin({ dir: __dirname });
remind.init(plugin);

const format = 'y [y], M[mo], w [w], d[d], h[h], m[m], s[s]';

// Register our presence
plugin.presenceSystem();
// Listen to incoming messages
plugin.messageSystem().on('message-in', (msg, ref) => {
  if (!msg.text.startsWith('.')) return null;
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
          if (Number.isInteger(response)) {
            if (!options.silent) {
              const text = `Reminding in ${moment.duration(response).format(format, { trim: 'all' }) || '0s'}`;
              const data = { mention: true, mentionID: msg.uid };
              const message = utils.getReply(msg, plugin.cid, text, data);
              plugin.messageSystem().sendMessage(message);
            }
            if (options.delete && msg.data && msg.data.messageID) {
              plugin.response({
                target: msg.cid,
                command: 'delete-message',
                // I really hope this can't get more complex on other platforms.
                arg: msg.channel,
                data: msg.data.messageID,
              }).then((reply) => {
                // Ignore any response, we don't care
              }).catch((error) => {
                // Ignore any errors, we don't care
              });
            }
            return;
          }
          if (!response) return;
          plugin.messageSystem().sendText(response, msg);
        });
  }
});

function getOptions(args) {
  const options = {};
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
        options.none = true;
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
