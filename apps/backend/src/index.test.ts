import { describe, expect, it } from "bun:test";
import app from "./index";

// Route behavior lives in the github/ unit tests; the /github/activity
// handler itself calls the real GitHub API, so don't app.request() it here.
describe("app", () => {
  it("mounts the github routes", () => {
    expect(app.routes.some((route) => route.path === "/github/activity")).toBe(true);
  });
});
