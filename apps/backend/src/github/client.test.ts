import { describe, expect, it } from "bun:test";
import { buildGithubHeaders } from "./client";

describe("buildGithubHeaders", () => {
  it("always sends User-Agent, Accept, and API version", () => {
    expect(buildGithubHeaders()).toEqual({
      "User-Agent": "portfolio-backend",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });
  });

  it("adds a bearer Authorization header when a token is provided", () => {
    expect(buildGithubHeaders("gh_token")["Authorization"]).toBe("Bearer gh_token");
  });

  it("omits Authorization without a token", () => {
    expect(buildGithubHeaders()).not.toHaveProperty("Authorization");
  });
});
