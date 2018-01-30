class Parser {
  constructor(regex) {
    /** @type {RegExp} */
    this.regex = regex;
  }

  /** Test string if this parser applies. */
  test(string) {
    return this.regex.test(string);
  }

  /** Parse string into time duration */
  parse(string) { // eslint-disable-line
    throw new Error('Must override function');
  }
}

module.exports = Parser;
