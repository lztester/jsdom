"use strict";
const { assert } = require("chai");
const { describe, it } = require("mocha-sugar-free");

const { JSDOM } = require("../..");

require("chai").use(require("../chai-helpers.js"));

describe("API: JSDOM.fromURL()", { skipUnlessBrowser: true }, () => {
  it("should return a rejected promise for a bad URL", () => {
    return Promise.all([
      assert.isRejected(JSDOM.fromURL("asdf"), TypeError),
      assert.isRejected(JSDOM.fromURL(undefined), TypeError),
      assert.isRejected(JSDOM.fromURL("fail.com"), TypeError)
    ]);
  });

  describe("referrer", () => {
    it("should reject when passing an invalid absolute URL for referrer", () => {
      assert.isRejected(JSDOM.fromURL("http://example.com/", { referrer: "asdf" }), TypeError);
    });
  });

  describe("inferring options from the response", () => {
    describe("url", () => {
      it("should disallow passing a URL manually", () => {
        return assert.isRejected(JSDOM.fromURL("http://example.com/", { url: "https://example.org" }), TypeError);
      });
    });

    describe("contentType", () => {
      it("should disallow passing a content type manually", () => {
        return assert.isRejected(JSDOM.fromURL("http://example.com/", { contentType: "application/xml" }), TypeError);
      });
    });
  });
});
