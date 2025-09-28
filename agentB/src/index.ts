import express from "express";
import { agent } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import zkredId from "@zkred/agent-id";

dotenv.config();

const app = express();
const port = process.env.PORT || 8003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions: Record<string, any> = {};

app.post("/agent", async (req, res) => {
  try {
    console.log("agent b called");
    const sessionId = req.headers["x-session-id"];
    if (!sessionId) {
      return res.status(401).json({ error: "Session ID is required" });
    }

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
app.post("/callback", async (req, res) => {
  try {
    const { sessionId, signature } = req.body;

    const session = sessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    console.log("callback called", {
      sessionId,
      session: JSON.stringify(session),
    });
    // In a real implementation, we would:
    // 1. Verify the signature using the initiator's public key
    // 2. Verify the challenge matches what we sent
    // 3. Store the initiator's public key for future communications
    const isValid = await zkredId.verifySignature(
      sessionId,
      session.challenge,
      signature,
      session.did
    );
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // For now, we'll just store the public key and mark as verified
    session.verified = isValid;
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
