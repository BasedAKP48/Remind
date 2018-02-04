const MAX_TIME = 2147483647;

let instance;
// The time the timeout will run again
let nextRun = -1;
let timeout;
const queue = [];

module.exports = (plugin) => {
  if (instance) return;
  instance = plugin;
  const root = plugin.root.child(`config/${plugin.cid}/reminders`);

  const listener = root.on('child_added', (data) => {
    const d = data.val();
    const now = Date.now();

    // More than 5 minutes ago
    if (d.time + 300000 < now) return data.ref.remove();

    function send() {
      return sendReply(d.reply)
        // .catch(() => {})
        .then(() => { data.ref.remove(); });
    }
    // Should have sent already!
    if (d.time <= now) return send();
    d.send = send;
    return queueMessage(d);
  });

  plugin.on('destroy', () => {
    root.off('child_added', listener);
    queue.splice(0);
  });
};

function sendReply(message) {
  if (!instance) return Promise.reject();
  // message.timeReceived = Date.now();
  return instance.messageSystem().sendMessage(message);
}

function queueMessage(message) {
  if (!instance) return;
  insertOrdered(message, queue, messageComparator);
  if (!timeout || message.time < nextRun) { // Setup the timeout
    startTimeout();
  }
}

function messageComparator(a, b) {
  return a.time - b.time;
}

function startTimeout(now = Date.now()) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
    nextRun = -1;
  }
  if (!instance || !queue.length) return;
  let delay = queue[0].time - now;
  while (delay < 0) {
    const next = queue.shift();
    if (!next) { // We're at the end
      return;
    }
    next.send();
    if (!queue.length) return;
    delay = queue[0].time - now;
  }
  const diff = delay > MAX_TIME ? MAX_TIME : delay;
  timeout = setTimeout(startTimeout, diff);
  nextRun = diff + Date.now();
}

function insertOrdered(element, array, comparer, start = 0, end = array.length) { // eslint-disable-line max-len
  if (array.length === 0) {
    array.push(element);
    return 0;
  }

  const pivot = (start + end) >> 1; // eslint-disable-line

  const c = comparer(element, array[pivot]);
  if (end - start <= 1) {
    const ret = c < 0 ? Math.max(pivot - 1, 0) : pivot;
    queue.splice(ret, 0, element);
    return ret;
  }

  if (c < 0) {
    return insertOrdered(element, array, comparer, start, pivot);
  } else if (c > 0) {
    return insertOrdered(element, array, comparer, pivot, end);
  }
  array.splice(pivot, 0, element);
  return pivot;
}
