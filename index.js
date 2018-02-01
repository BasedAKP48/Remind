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
  switch (cmd) {
    default: return null;
    case 'remind':
    case 'reminder':
    // case 'r':
      return remind.parse(msg.text.substring(cmd.length + 2), msg, cmd)
        .catch(err => err.message || err)
        .then((response) => {
          if (Number.isInteger(response)) {
            const text = `Reminder set for ${moment.duration(response).format(format, { trim: 'all' }) || '0s'} from now.`;
            const data = { mention: true, mentionID: msg.uid };
            const message = utils.getReply(msg, plugin.cid, text, data);
            plugin.messageSystem().sendMessage(message);
            return;
          }
          if (!response) return;
          plugin.messageSystem().sendText(response, msg);
        });
  }
});
