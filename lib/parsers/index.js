const Parser = require('./parser'); // eslint-disable-line no-unused-vars
/**
 * @type {Parser[]}
 */
const parsers = [];
add(require('./top'));
add(require('./super'));

module.exports = (string, now) => new Promise((res) => {
  const resolved = parsers.some((parser) => {
    if (parser.test(string)) {
      const value = parser.parse(string, now);
      if (value || value === 0) { // Let 0 go through
        res(value);
        return true;
      }
    }
    return false;
  });
  if (resolved) return;
  throw new Error(`Unknown input: ${string}`);
});

function add(parser) {
  if (parser instanceof Parser) {
    parsers.push(parser);
  }
}
