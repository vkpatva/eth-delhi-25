import express from "express";
import { agent } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/agent", async (req, res) => {
  try {
    const result = await agent.invoke({
      messages: [
        new SystemMessage(
          "You are weather agent you can get weather for any city. Use get_weather tool to get weather."
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
