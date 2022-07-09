"use strict";
const http = require("http");
const { assert } = require("chai");
const { describe, it } = require("mocha-sugar-free");

describe("http.request.length in node.js", () => {
  it("http.request.length === 3", () => {
    assert.strictEqual(http.request.length, 3);
  });
});
