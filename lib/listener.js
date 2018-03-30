const MAX_TIME = 2147483647;

let instance;
// The time the timeout will run again
let nextRun = -1;
let timeout;
/** @type {PendingMessage[]} */
const queue = [];
/** @type {Map<String, PendingMessage>} */
const messages = new Map();

class PendingMessage {
  constructor(data) {
    this.data = data.val();
    this.ref = data.ref;
  }

  get time() {
    return this.data.time;
  }

  get reply() {
    return this.data.reply;
  }

  get key() {
    return this.ref.key;
  }

  send() {
    return sendReply(this.reply)
      .then(() => this.ref.remove());
  }

  update(data) {
    const prevTime = this.time;
    this.data = data.val();
    this.ref = data.ref; // Incase the ref changes?
    return prevTime !== this.time;
  }
}

module.exports = (plugin) => {
  if (instance) return;
  instance = plugin;
  const root = plugin.root.child(`config/${plugin.cid}/reminders`);

  const listeners = {};

  listeners.child_added = root.on('child_added', (data) => {
    const message = new PendingMessage(data);
    const now = Date.now();

    // More than 5 minutes ago
    if (message.time + 300000 < now) return data.ref.remove();
    // Should have sent already!
    if (message.time <= now) return message.send();
    return queueMessage(message);
  });

  listeners.child_changed = root.on('child_changed', (data) => {
    const key = data.ref.key;
    if (!messages.has(key)) throw new Error('Invalid State');
    const message = messages.get(key);
    if (message.update(data)) {
      setupTimeout(message.time);
    }
  });

  listeners.child_removed = root.on('child_removed', (data) => {
    const key = data.ref.key;
    if (!messages.has(key)) return; // Nothing to do
    const message = messages.get(key);
    const index = queue.indexOf(message);
    messages.delete(key);
    if (index !== -1) {
      queue.splice(index, 1);
      // Clear the timeout if we don't need to run.
      if (!queue.length) {
        startTimeout();
      }
    }
  });

  plugin.on('destroy', () => {
    Object.keys(listeners).forEach((event) => {
      const listener = listeners[event];
      root.off(event, listener);
    });
    queue.splice(0);
    instance = null;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  });
};

function sendReply(message) {
  if (!instance) return Promise.reject();
  // message.timeReceived = Date.now();
  return instance.messageSystem().sendMessage(message);
}

/**
 * @param {PendingMessage} message
 */
function queueMessage(message) {
  if (!instance) return;
  messages.set(message.key, message);
  insertOrdered(message, queue, messageComparator);
  setupTimeout(message.time);
}

function setupTimeout(time) {
  if (!timeout || time < nextRun) {
    startTimeout();
  }
}

function messageComparator(a, b) {
  return a.time - b.time;
}

function startTimeout() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
    nextRun = -1;
  }
  if (!instance) return;
  let delay;
  do {
    if (!queue.length) return;
    delay = queue[0].time - Date.now();
    if (delay <= 0) {
      queue.shift().send();
    }
  } while (delay <= 0);
  const diff = delay > MAX_TIME ? MAX_TIME : delay;
  // If something goes wrong, better safe than sorry
  if (Number.isNaN(diff)) return;
  timeout = setTimeout(startTimeout, diff);
  nextRun = diff + Date.now();
}

module.exports.insertOrdered = insertOrdered;
function insertOrdered(element, array, comparer, start = 0, end = array.length) { // eslint-disable-line max-len
  if (array.length === 0) {
    array.push(element);
    return 0;
  }

  const pivot = (start + end) >> 1; // eslint-disable-line

  const c = comparer(element, array[pivot]);
  if (end - start <= 1) {
    // eslint-disable-next-line no-nested-ternary
    const ret = c < 0 ? Math.max(pivot - 1, 0) : (c > 0 ? pivot + 1 : pivot);
    array.splice(ret, 0, element);
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
