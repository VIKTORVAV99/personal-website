import { describe, it, expect } from "bun:test";

import { SITE_DESCRIPTION } from "../../lib/config";
import { _buildLlmsTxt, _sitePages, _optionalLinks } from "../../routes/llms.txt/+server";

const testPosts = [
  {
    title: "Hello World",
    url: "https://viktor.andersson.tech/blog/hello_world",
    description: "My first post",
  },
];

describe("llms.txt", () => {
  it("should start with the H1 title", () => {
    const txt = _buildLlmsTxt(testPosts);
    expect(txt).toStartWith("# Viktor Andersson");
  });

  it("should include the summary as a blockquote", () => {
    const txt = _buildLlmsTxt(testPosts);
    expect(txt).toContain(`> ${SITE_DESCRIPTION}`);
  });

  it("should include the required section headers", () => {
    const txt = _buildLlmsTxt(testPosts);
    expect(txt).toContain("## Pages");
    expect(txt).toContain("## Blog");
    expect(txt).toContain("## Optional");
  });

  it("should render links in `- [title](url): description` format", () => {
    const txt = _buildLlmsTxt(testPosts);
    expect(txt).toContain(
      "- [Hello World](https://viktor.andersson.tech/blog/hello_world): My first post",
    );
    expect(txt).toContain(
      `- [${_sitePages[0].title}](${_sitePages[0].url}): ${_sitePages[0].description}`,
    );
    expect(txt).toContain(
      `- [${_optionalLinks[0].title}](${_optionalLinks[0].url}): ${_optionalLinks[0].description}`,
    );
  });

  it("should match snapshot", () => {
    const txt = _buildLlmsTxt(testPosts);
    expect(txt).toMatchSnapshot();
  });
});
