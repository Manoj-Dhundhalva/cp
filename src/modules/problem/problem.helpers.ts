import * as cheerio from "cheerio";
import { Element, DataNode, Node } from "domhandler";
import type { TParsedProblem, TProblemIdentifier } from "./problem.service.js";

export const getProblemUrl = ({ contestId, problemIndex }: TProblemIdentifier) =>
  `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`;

function extractTextAndImages(el: Element): string {
  const parts: string[] = [];

  const walk = (node: Node) => {
    if (node.type === "text") {
      const text = (node as DataNode).data.trim();
      if (text) parts.push(text);
      return;
    }

    if (node.type === "tag") {
      const tag = node as Element;

      if (tag.name === "img" && tag.attribs.src) {
        parts.push(tag.attribs.src);
      }

      tag.children.forEach(walk);
    }
  };

  walk(el);

  return parts.join(" ");
}

function parseLimit(text: string) {
  const parts = text.trim().split(/\s+/);

  return {
    value: Number(parts[0]),
    unit: parts.slice(1).join(" "),
  };
}

export function parseProblemFromHtml(html: string): TParsedProblem {
  const $ = cheerio.load(html);

  return {
    title: $(".problem-statement .header .title").text().trim(),
    timeLimit: parseLimit($(".problem-statement .header .time-limit").contents().last().text().trim()),
    memoryLimit: parseLimit($(".problem-statement .header .memory-limit").contents().last().text().trim()),
    problemStatement: $(".problem-statement")
      .children("div")
      .not(".header")
      .first()
      .map((_, el) => extractTextAndImages(el))
      .get()
      .join(" "),
    specification: {
      input: $(".problem-statement .input-specification p")
        .map((_, el) => extractTextAndImages(el))
        .get()
        .join(" "),
      output: $(".problem-statement .output-specification p")
        .map((_, el) => extractTextAndImages(el))
        .get()
        .join(" "),
    },
    testCase: {
      input: $(".problem-statement .sample-test .input pre")
        .map((_, el) =>
          $(el)
            .contents()
            .map((_, node) => $(node).text().trim())
            .get()
            .filter(Boolean)
            .join("\n"),
        )
        .get()
        .join("\n"),
      output: $(".problem-statement .sample-test .output pre")
        .map((_, el) =>
          $(el)
            .contents()
            .map((_, node) => $(node).text().trim())
            .get()
            .filter(Boolean)
            .join("\n"),
        )
        .get()
        .join("\n"),
    },
    rating: $("#sidebar .tag-box").last().text().trim(),
    tags: $("#sidebar .tag-box")
      .slice(0, -1)
      .map((_, el) => $(el).text().trim())
      .get(),
    note: $(".problem-statement .note")
      .map((_, el) => extractTextAndImages(el))
      .get()
      .join(" "),
  };
}
