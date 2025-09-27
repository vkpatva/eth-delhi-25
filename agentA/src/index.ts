import "dotenv/config";
import express from "express";
import { agent } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import zkredId from "@zkred/agent-id";
const app = express();
app.use(express.json());

// In-memory store for demo purposes
const sessions: Record<string, any> = {};

app.post("/initiate", async (req, res) => {
  try {
    const { sessionId, initiatorDid, initiatorChainId } = req.body;

    // Generate a new challenge for the initiator
    const responderChallenge = zkredId.generateChallenge();
    const didInformation = await zkredId.validateAgent(
      initiatorDid,
      initiatorChainId
    );
    // Store the session
    sessions[sessionId] = {
      initiatorDid,
      challenge: responderChallenge,
      timestamp: Date.now(),
      did: didInformation?.did,
    };

    res.json({
      data: {
        challenge: responderChallenge,
        sessionId,
      },
    });
  } catch (error) {
    console.error("Error in /initiate:", error);
    res.status(500).json({ error: "Failed to initiate handshake" });
  }
});

/**
 * Complete the zkRed handshake
 */
app.post("/completeHandshake", async (req, res) => {
  try {
    const { sessionId, signature } = req.body;

    const session = sessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // In a real implementation, we would:
    // 1. Verify the signature using the initiator's public key
    // 2. Verify the challenge matches what we sent
    // 3. Store the initiator's public key for future communications

    // For now, we'll just store the public key and mark as verified
    session.verified = true;
    session.initiatorPublicKey = session;

    // In a real implementation, we would sign a response

    res.json({
      data: {
        sessionId,
        status: "handshake_completed",
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Error in /completeHandshake:", error);
    res.status(500).json({ error: "Failed to complete handshake" });
  }
});

// Original agent endpoint
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

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Agent running on http://localhost:${PORT}`);
});

// Export for testing
if (process.env.NODE_ENV === "test") {
  module.exports = { app, sessions };
}
