import "dotenv/config";
import express from "express";
import { agent } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const app = express();
app.use(express.json());

app.post("/agent", async (req, res) => {
  try {
    const result = await agent.invoke({
      messages: [
        new SystemMessage(
          "You are a writing agent. You can call a researcher agent for data, then create polished content."
        ),
        new HumanMessage(req.body.message),
      ],
    });

    res.send(result.messages[result.messages.length - 1].content);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error in writer agent");
  }
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(8001, () => {
  console.log("Writer agent running on http://localhost:8001");
});
