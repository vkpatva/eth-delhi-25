import { tool } from "@langchain/core/tools";
import fetch from "node-fetch";
import { z } from "zod";

// Simple Wikipedia fetcher
export const wikipediaTool = tool(
  async ({ query }: { query: string }) => {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&utf8=&format=json`
    );
    const searchData = await searchRes.json();

    if (!searchData.query.search || searchData.query.search.length === 0) {
      return `No Wikipedia results found for: ${query}`;
    }

    const topResult = searchData.query.search[0];
    const pageId = topResult.pageid;

    // Fetch page summary
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        topResult.title
      )}`
    );
    const summaryData = await summaryRes.json();

    return {
      title: summaryData.title,
      extract: summaryData.extract,
      url: summaryData.content_urls?.desktop?.page,
    };
  },
  {
    name: "get_wikipedia_summary",
    description:
      "Fetch a Wikipedia summary for a given search query (useful for researcher agents)",
    schema: z.object({
      query: z.string().describe("The topic or keyword to search on Wikipedia"),
    }),
  }
);
