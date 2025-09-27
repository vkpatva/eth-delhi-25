import express from "express";
import { agent } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/agent", async (req, res) => {
  try {
    const result = await agent.invoke({
      messages: [
        new SystemMessage(
          "You are wikipedia agent you can get wikipedia summary for any topic. Use get_wikipedia_summary tool to get summary."
        ),
        new HumanMessage(req.body.message),
      ],
    });

    console.log(result.messages[result.messages.length - 1].content);
    res.send(result.messages[result.messages.length - 1].content);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/health", (req, res) => {
  res.send("OK");
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
