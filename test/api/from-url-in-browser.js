/*globals location:false */
"use strict";
const { assert } = require("chai");
const { describe, it } = require("mocha-sugar-free");
const { createServer } = require("../util.js");

const { JSDOM } = require("../..");

require("chai").use(require("../chai-helpers.js"));

let inBrowser = false;

describe("API: JSDOM.fromURL()", () => {
  describe("in browser", { skipUnlessBrowser: true }, () => {
    inBrowser = true;
  });

  it("should return a rejected promise for a bad URL", () => {
    return Promise.all([
      assert.isRejected(JSDOM.fromURL("asdf"), TypeError),
      assert.isRejected(JSDOM.fromURL(undefined), TypeError),
      assert.isRejected(JSDOM.fromURL("fail.com"), TypeError)
    ]);
  });

  it("should return a rejected promise for a 404", () => {
    const url = "404.html";

    return assert.isRejected(JSDOM.fromURL(url));
  });

  it("should use the body of 200 responses", async () => {
    const url = "Hello.html";

    const dom = await JSDOM.fromURL(url);
    assert.strictEqual(dom.serialize(), "<html><head></head><body><p>Hello</p></body></html>");
  });

  describe("referrer", () => {
    it("should reject when passing an invalid absolute URL for referrer", () => {
      assert.isRejected(JSDOM.fromURL("http://example.com/", { referrer: "asdf" }), TypeError);
    });

    it("should not send a Referer header when no referrer option is given", async () => {
      const url = "Hello.html";

      const dom = await JSDOM.fromURL(url);
      assert.strictEqual(dom.window.document.referrer, "");
    });

    it("should use the supplied referrer option as a Referer header", async () => {
      const url = "Hello.html";

      const dom = await JSDOM.fromURL(url, { referrer: "http://example.com/" });
      assert.strictEqual(dom.window.document.referrer, "http://example.com/");
    });

    it("should canonicalize referrer URLs before using them as a Referer header", async () => {
      const url = "Hello.html";

      const dom = await JSDOM.fromURL(url, { referrer: "http:example.com" });
      assert.strictEqual(dom.window.document.referrer, "http://example.com/");
    });
  });

  describe("inferring options from the response", () => {
    describe("url", () => {
      it("should use the URL fetched for a 200", async () => {
        const url = inBrowser ?
          location.origin + location.pathname.replace(/(.*\/).*/, "$1") + "Hello.html" :
          await simpleServer(200, { "Content-Type": "text/html" });

        const dom = await JSDOM.fromURL(url);
        assert.strictEqual(dom.window.document.URL, url);
      });

      it("should preserve full request URL", async () => {
        const url = inBrowser ?
          location.origin + location.pathname.replace(/(.*\/).*/, "$1") + "Hello.html" :
          await simpleServer(200, { "Content-Type": "text/html" });
        const path = "t";
        const search = "?a=1";
        const fragment = "#fragment";
        const fullURL = url + path + search + fragment;

        const dom = await JSDOM.fromURL(fullURL);
        assert.strictEqual(dom.window.document.URL, fullURL);
        assert.strictEqual(dom.window.location.href, fullURL);
        assert.strictEqual(dom.window.location.pathname, "/" + path);
        assert.strictEqual(dom.window.location.search, search);
        assert.strictEqual(dom.window.location.hash, fragment);
      });

      it("should disallow passing a URL manually", () => {
        return assert.isRejected(JSDOM.fromURL("http://example.com/", { url: "https://example.org" }), TypeError);
      });
    });

    describe("contentType", () => {
      it("should use the content type fetched for a 200", async () => {
        const url = "doc.xml";

        const dom = await JSDOM.fromURL(url);
        assert.strictEqual(dom.window.document.contentType, "application/xml");
      });

      it("should disallow passing a content type manually", () => {
        return assert.isRejected(JSDOM.fromURL("http://example.com/", { contentType: "application/xml" }), TypeError);
      });
    });
  });
});

async function simpleServer(responseCode, headers, body) {
  const server = await createServer((req, res) => {
    res.writeHead(responseCode, headers);
    res.end(body);
    server.destroy();
  });

  return `http://127.0.0.1:${server.address().port}/`;
}
