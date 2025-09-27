import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { wikipediaTool } from "./tools/wikiTool";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
});

export const agent = createReactAgent({
  llm: model,
  tools: [wikipediaTool],
});
