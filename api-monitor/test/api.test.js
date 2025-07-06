const request = require("supertest");
const express = require("express");
const app = require("../app");

// Wrap app to make sure routes are testable
describe("API Uptime Monitor Tests", () => {
  it("should return status of monitored APIs", async () => {
    const res = await request(app).get("/status");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("url");
    expect(res.body[0]).toHaveProperty("status");
  });

  it("should return uptime logs", async () => {
    const res = await request(app).get("/logs");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
