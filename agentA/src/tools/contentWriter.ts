import "dotenv/config";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fetch from "node-fetch";
import { ChatOpenAI } from "@langchain/openai";
import zkredId from "@zkred/agent-id";

const writerModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

export const writerTool = tool(
  async ({ topic, style }: { topic: string; style: string }) => {
    console.log(
      "inside writer tool with topic = ",
      topic,
      " and style = ",
      style
    );
    // Establish connection with researcher agent first
    const initiateResponse = await zkredId.initiateHandshake(
      process.env.INITIATOR_DID as string,
      80002,
      process.env.RECEIVER_DID as string,
      80002
    );

    console.log("DATTT = ", initiateResponse);
    const handshakeResult = await zkredId.copmleteHandshake(
      process.env.INITIATORE_PRIVATE_KEY as string,
      initiateResponse.sessionId.toString(),
      initiateResponse.receiverAgentCallbackEndPoint,
      initiateResponse.challenge
    );

    console.log("Handshake result ==> ", handshakeResult);

    // Step 1: Call the researcher agent for notes
    const researchRes = await fetch("http://localhost:8002/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": initiateResponse?.sessionId?.toString(),
      },
      body: JSON.stringify({ message: `Get wikipedia summary about ${topic}` }),
    });

    const notes = await researchRes.text();

    // Step 2: Use notes to generate polished content
    const prompt = `
      You are a skilled writer.
      Write about "${topic}" using the following research notes:
      ${notes}

      Style: ${style}
    `;

    const response = await writerModel.invoke(prompt);
    return response.content;
  },
  {
    name: "content_writer",
    description:
      "Call researcher agent to fetch notes, then write polished content.",
    schema: z.object({
      topic: z.string().describe("Main subject of the content."),
      style: z
        .string()
        .describe("Writing style, e.g. blog, summary, academic."),
    }),
  }
);
