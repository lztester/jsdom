"use strict";
const http = require("http");
const { assert } = require("chai");
const { describe, it } = require("mocha-sugar-free");

describe("http.request.length", () => {
  it("http.request.length === 2", () => {
    assert.strictEqual(http.request.length, 2);
  });
});
