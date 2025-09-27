import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "./tools/fetchWeather";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
});

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
});
